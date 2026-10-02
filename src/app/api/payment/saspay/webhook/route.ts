import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const WEBHOOK_SECRET = process.env.SASPAY_WEBHOOK_SECRET;

function verifySignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
) {
  if (!WEBHOOK_SECRET || !signature || !timestamp) {
    return false;
  }

  const timestampNumber = Number(timestamp);

  if (!Number.isFinite(timestampNumber)) {
    return false;
  }

  // SasPay utilise un timestamp Unix.
  // On accepte une différence maximale de 5 minutes.
  const now = Math.floor(Date.now() / 1000);

  if (Math.abs(now - timestampNumber) > 300) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;

  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(signedPayload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!WEBHOOK_SECRET) {
      console.error(
        "SASPAY_WEBHOOK_SECRET n'est pas configurée.",
      );

      return NextResponse.json(
        {
          success: false,
          message: "Webhook SasPay mal configuré.",
        },
        { status: 500 },
      );
    }

    /**
     * IMPORTANT :
     * On récupère le corps brut avant JSON.parse()
     * car la signature SasPay est calculée dessus.
     */
    const rawBody = await request.text();

    const signature = request.headers.get(
      "X-Webhook-Signature",
    );

    const timestamp = request.headers.get(
      "X-Webhook-Timestamp",
    );

    const eventHeader = request.headers.get(
      "X-Webhook-Event",
    );

    const isValid = verifySignature(
      rawBody,
      signature,
      timestamp,
    );

    if (!isValid) {
      console.error(
        "Signature webhook SasPay invalide.",
      );

      return NextResponse.json(
        {
          success: false,
          message: "Signature invalide.",
        },
        { status: 401 },
      );
    }

    let payload: any;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Payload JSON invalide.",
        },
        { status: 400 },
      );
    }

    const event =
      payload?.event ||
      eventHeader ||
      "";

    const data = payload?.data;

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Données de transaction manquantes.",
        },
        { status: 400 },
      );
    }

    const providerId =
      data?.id ||
      data?.transaction_id ||
      null;

    const reference =
      data?.reference ||
      null;

    const status =
      String(data?.status || "").toUpperCase();

    console.log(
      "Webhook SasPay reçu:",
      {
        event,
        providerId,
        reference,
        status,
      },
    );

    /**
     * On recherche d'abord avec providerReference.
     */
    let payment = providerId
      ? await prisma.payment.findFirst({
          where: {
            providerReference: String(providerId),
          },
          include: {
            subscription: true,
            user: true,
          },
        })
      : null;

    /**
     * Si on ne trouve rien, on essaie avec
     * transactionReference.
     */
    if (!payment && reference) {
      payment = await prisma.payment.findFirst({
        where: {
          transactionReference: String(reference),
        },
        include: {
          subscription: true,
          user: true,
        },
      });
    }

    if (!payment) {
      console.error(
        "Paiement JobConnect introuvable pour le webhook SasPay:",
        {
          providerId,
          reference,
        },
      );

      // On retourne 200 pour éviter des répétitions
      // inutiles si SasPay envoie un événement inconnu.
      return NextResponse.json({
        success: true,
        message: "Transaction non associée à JobConnect.",
      });
    }

    /**
     * On enregistre les références retournées
     * par SasPay si elles sont disponibles.
     */
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        providerReference:
          providerId
            ? String(providerId)
            : payment.providerReference,

        transactionReference:
          reference
            ? String(reference)
            : payment.transactionReference,
      },
    });

    /**
     * TRANSACTION SUCCESS
     *
     * On active l'abonnement.
     */
    if (
      event === "transaction.success" ||
      status === "SUCCESS" ||
      status === "COMPLETED"
    ) {
      await prisma.$transaction(async (tx) => {
        const currentPayment =
          await tx.payment.findUnique({
            where: {
              id: payment.id,
            },
            include: {
              subscription: true,
            },
          });

        if (!currentPayment) {
          return;
        }

        /**
         * Si déjà traité, on ne recrée pas
         * l'abonnement.
         */
        if (
          currentPayment.status === "SUCCESS" ||
          currentPayment.status === "COMPLETED"
        ) {
          return;
        }

        const startDate = new Date();

        const endDate = new Date(startDate);

        // Abonnement valable 30 jours.
        endDate.setDate(endDate.getDate() + 30);

        await tx.payment.update({
          where: {
            id: currentPayment.id,
          },
          data: {
            status: "SUCCESS",
          },
        });

        await tx.subscription.update({
          where: {
            id: currentPayment.subscriptionId,
          },
          data: {
            status: "ACTIVE",
            startDate,
            endDate,
          },
        });
      });

      console.log(
        `Abonnement JobConnect activé pour le paiement ${payment.id}`,
      );

      return NextResponse.json({
        success: true,
        message: "Paiement confirmé et abonnement activé.",
      });
    }

    /**
     * TRANSACTION FAILED
     */
    if (
      event === "transaction.failed" ||
      status === "FAILED"
    ) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: "FAILED",
          },
        });

        await tx.subscription.update({
          where: {
            id: payment.subscriptionId,
          },
          data: {
            status: "CANCELLED",
          },
        });
      });

      console.log(
        `Paiement JobConnect échoué: ${payment.id}`,
      );

      return NextResponse.json({
        success: true,
        message: "Paiement marqué comme échoué.",
      });
    }

    /**
     * TRANSACTION CANCELLED
     */
    if (
      event === "transaction.cancelled" ||
      status === "CANCELLED"
    ) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: "CANCELLED",
          },
        });

        await tx.subscription.update({
          where: {
            id: payment.subscriptionId,
          },
          data: {
            status: "CANCELLED",
          },
        });
      });

      console.log(
        `Paiement JobConnect annulé: ${payment.id}`,
      );

      return NextResponse.json({
        success: true,
        message: "Paiement marqué comme annulé.",
      });
    }

    /**
     * transaction.created ou autre événement
     * que nous n'avons pas besoin de traiter.
     */
    return NextResponse.json({
      success: true,
      message: "Événement SasPay reçu.",
    });
  } catch (error) {
    console.error(
      "Erreur webhook SasPay JobConnect:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Erreur interne du webhook.",
      },
      { status: 500 },
    );
  }
}