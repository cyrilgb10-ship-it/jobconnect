import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const SASPAY_API_URL =
  process.env.SASPAY_API_URL || "https://api.saspay.me/api/v1";

const SASPAY_SECRET_KEY = process.env.SASPAY_SECRET_KEY;

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://jobconnect-azure.vercel.app";

const PLANS = {
  BASIC: {
    price: 999,
    applicationsLimit: 3,
  },
  PREMIUM: {
    price: 2997,
    applicationsLimit: null,
  },
} as const;

type Plan = keyof typeof PLANS;

const ALLOWED_NETWORKS = ["moov_tg", "togocel"] as const;

type Network = (typeof ALLOWED_NETWORKS)[number];

function isValidPlan(value: unknown): value is Plan {
  return value === "BASIC" || value === "PREMIUM";
}

function isValidNetwork(value: unknown): value is Network {
  return value === "moov_tg" || value === "togocel";
}

function normalizeTogoPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 8) {
    return `+228${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("228")) {
    return `+${digits}`;
  }

  throw new Error(
    "Numéro togolais invalide. Utilisez un numéro à 8 chiffres.",
  );
}

async function getAuthenticatedCandidate() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Vous devez être connecté.");
  }

  if (user.role !== "CANDIDATE") {
    throw new Error(
      "Seuls les candidats peuvent souscrire à un abonnement.",
    );
  }

  return user;
}

/**
 * GET
 *
 * Récupère les informations d'un paiement.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedCandidate();

    const paymentId =
      request.nextUrl.searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Identifiant du paiement manquant.",
        },
        { status: 400 },
      );
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: user.id,
      },
      include: {
        subscription: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Paiement introuvable.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        providerReference: payment.providerReference,
        plan: payment.subscription.plan,
        subscriptionStatus: payment.subscription.status,
      },
    });
  } catch (error) {
    console.error(
      "Erreur GET /api/payment/saspay:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue.",
      },
      { status: 500 },
    );
  }
}

/**
 * POST
 *
 * Étape 1 :
 * { plan }
 *
 * Crée un nouveau paiement local.
 *
 * Étape 2 :
 * { paymentId, network, phone }
 *
 * Lance le paiement SasPay.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedCandidate();

    if (!SASPAY_SECRET_KEY) {
      console.error(
        "SASPAY_SECRET_KEY n'est pas configurée.",
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "La configuration du paiement SasPay est incomplète.",
        },
        { status: 500 },
      );
    }

    const body = await request.json();

    /**
     * =========================================================
     * ÉTAPE 1 — CRÉATION DU PAIEMENT LOCAL
     * =========================================================
     */
    if (!body.paymentId) {
      const plan = body.plan;

      if (!isValidPlan(plan)) {
        return NextResponse.json(
          {
            success: false,
            message: "Formule d'abonnement invalide.",
          },
          { status: 400 },
        );
      }

      const selectedPlan = PLANS[plan];

      /**
       * IMPORTANT :
       *
       * On ne réutilise plus automatiquement un ancien paiement
       * PENDING qui possède déjà une providerReference.
       *
       * Cela permet à un utilisateur de relancer un paiement
       * dont la demande Mobile Money précédente n'a pas abouti.
       */

      const result = await prisma.$transaction(
        async (tx) => {
          const subscription =
            await tx.subscription.create({
              data: {
                userId: user.id,
                plan,
                status: "PENDING",
                price: selectedPlan.price,
                applicationsLimit:
                  selectedPlan.applicationsLimit,
                applicationsUsed: 0,
              },
            });

          const payment = await tx.payment.create({
            data: {
              userId: user.id,
              subscriptionId: subscription.id,
              orderId: `JC-${crypto.randomUUID()}`,
              amount: selectedPlan.price,
              currency: "XOF",
              status: "PENDING",
            },
          });

          return {
            subscription,
            payment,
          };
        },
      );

      return NextResponse.json({
        success: true,
        paymentId: result.payment.id,
        subscriptionId: result.subscription.id,
        checkoutUrl:
          `${APP_URL}/payment/saspay/checkout?paymentId=${encodeURIComponent(
            result.payment.id,
          )}`,
      });
    }

    /**
     * =========================================================
     * ÉTAPE 2 — LANCEMENT DU PAIEMENT MOBILE MONEY
     * =========================================================
     */

    const paymentId = String(body.paymentId);
    const network = body.network;
    const phone = body.phone;

    if (!isValidNetwork(network)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Opérateur invalide. Choisissez Moov Money ou Togocel Money.",
        },
        { status: 400 },
      );
    }

    if (
      typeof phone !== "string" ||
      !phone.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Veuillez saisir votre numéro de téléphone.",
        },
        { status: 400 },
      );
    }

    const normalizedPhone =
      normalizeTogoPhone(phone);

    const payment =
      await prisma.payment.findFirst({
        where: {
          id: paymentId,
          userId: user.id,
        },
        include: {
          subscription: true,
        },
      });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Paiement introuvable.",
        },
        { status: 404 },
      );
    }

    /**
     * Si le paiement est déjà terminé,
     * on ne crée surtout pas une nouvelle transaction.
     */
    if (
      payment.status === "SUCCESS" ||
      payment.status === "COMPLETED"
    ) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        status: payment.status,
        paymentId: payment.id,
        providerReference:
          payment.providerReference,
      });
    }

    /**
     * IMPORTANT :
     *
     * Nous NE BLOQUONS PLUS ici avec :
     *
     * if (payment.providerReference) {
     *   return ...
     * }
     *
     * Un paiement PENDING peut maintenant être relancé.
     */

    console.log(
      "========== SASPAY PAYMENT ==========",
    );

    console.log("Payment ID:", payment.id);
    console.log("Order ID:", payment.orderId);
    console.log("Plan:", payment.subscription.plan);
    console.log("Amount:", payment.amount);
    console.log("Network:", network);
    console.log("Phone:", normalizedPhone);
    console.log(
      "Previous providerReference:",
      payment.providerReference,
    );

    /**
     * =========================================================
     * APPEL SASPAY
     * =========================================================
     */

    const sasPayUrl =
      `${SASPAY_API_URL.replace(/\/$/, "")}/payments/softpay/`;

    console.log("SasPay URL:", sasPayUrl);

    const sasPayResponse = await fetch(
      sasPayUrl,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SASPAY_SECRET_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": payment.orderId,
        },
        body: JSON.stringify({
          amount: String(payment.amount),
          currency: "XOF",
          country: "TG",
          network,
          description:
            `Abonnement JobConnect ${payment.subscription.plan}`,
          customer: {
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            phone: normalizedPhone,
          },
        }),
      },
    );

    const responseText =
      await sasPayResponse.text();

    console.log(
      "========== SASPAY RESPONSE ==========",
    );

    console.log(
      "HTTP STATUS:",
      sasPayResponse.status,
    );

    console.log(
      "HTTP OK:",
      sasPayResponse.ok,
    );

    console.log(
      "RESPONSE BODY:",
      responseText,
    );

    console.log(
      "=====================================",
    );

    let data: any = {};

    try {
      data = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      data = {
        message: responseText,
      };
    }

    /**
     * =========================================================
     * ERREUR SASPAY
     * =========================================================
     */

    if (!sasPayResponse.ok) {
      console.error(
        "Erreur SasPay:",
        sasPayResponse.status,
        data,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            data?.message ||
            data?.detail ||
            data?.error ||
            "SasPay a refusé le paiement.",
          providerResponse: data,
        },
        { status: 502 },
      );
    }

    /**
     * =========================================================
     * RÉCUPÉRATION DE LA RÉFÉRENCE
     * =========================================================
     */

    const providerReference =
      data?.id ??
      data?.reference ??
      data?.transaction_id ??
      data?.payment_id ??
      data?.data?.id ??
      data?.data?.reference ??
      data?.data?.transaction_id ??
      data?.data?.payment_id ??
      null;

    const transactionReference =
      data?.transaction_reference ??
      data?.data?.transaction_reference ??
      null;

    /**
     * =========================================================
     * SAUVEGARDE
     * =========================================================
     */

    if (providerReference) {
      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          providerReference:
            String(providerReference),

          transactionReference:
            transactionReference
              ? String(transactionReference)
              : undefined,

          status: "PENDING",
        },
      });
    }

    /**
     * =========================================================
     * RÉPONSE AU FRONTEND
     * =========================================================
     */

    return NextResponse.json({
      success: true,

      paymentId: payment.id,

      providerReference:
        providerReference
          ? String(providerReference)
          : null,

      transactionReference:
        transactionReference
          ? String(transactionReference)
          : null,

      status:
        data?.status ||
        data?.data?.status ||
        "PENDING",

      checkoutUrl:
        data?.checkout_url ||
        data?.checkoutUrl ||
        data?.data?.checkout_url ||
        data?.data?.checkoutUrl ||
        "",

      message:
        data?.message ||
        data?.data?.message ||
        "Paiement lancé. Vérifiez votre téléphone et confirmez le paiement.",

      providerResponse: data,
    });
  } catch (error) {
    console.error(
      "Erreur POST /api/payment/saspay:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue pendant le paiement.",
      },
      { status: 500 },
    );
  }
}
