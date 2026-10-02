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
  return (
    value === "moov_tg" ||
    value === "togocel"
  );
}

function normalizeTogoPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  // Format local : 90 80 12 28
  if (digits.length === 8) {
    return `+228${digits}`;
  }

  // Format international : 228 90 80 12 28
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
 * Permet à la page de paiement de récupérer
 * les informations du paiement.
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
    console.error("Erreur GET /api/payment/saspay:", error);

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
 * Deux possibilités :
 *
 * 1. { plan }
 *    → crée le paiement local et ouvre la page de paiement.
 *
 * 2. { paymentId, network, phone }
 *    → lance réellement le paiement SasPay.
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
     * ÉTAPE 1
     *
     * Création du paiement local.
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
       * On cherche un abonnement PENDING
       * existant pour éviter de créer plusieurs
       * paiements identiques.
       */
      const existingSubscription =
        await prisma.subscription.findFirst({
          where: {
            userId: user.id,
            plan,
            status: "PENDING",
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            payments: {
              where: {
                status: "PENDING",
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        });

      let subscriptionId: string;
      let paymentId: string;

      if (
        existingSubscription &&
        existingSubscription.payments.length > 0
      ) {
        subscriptionId = existingSubscription.id;
        paymentId = existingSubscription.payments[0].id;
      } else {
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

        subscriptionId = result.subscription.id;
        paymentId = result.payment.id;
      }

      return NextResponse.json({
        success: true,
        paymentId,
        subscriptionId,
        checkoutUrl: `${APP_URL}/payment/saspay/checkout?paymentId=${encodeURIComponent(
          paymentId,
        )}`,
      });
    }

    /**
     * ÉTAPE 2
     *
     * L'utilisateur a choisi son opérateur
     * et renseigné son numéro.
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
          message: "Veuillez saisir votre numéro de téléphone.",
        },
        { status: 400 },
      );
    }

    const normalizedPhone = normalizeTogoPhone(phone);

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

    if (payment.status !== "PENDING") {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        status: payment.status,
        paymentId: payment.id,
      });
    }

    /**
     * Si une transaction SasPay existe déjà,
     * on ne la recrée pas.
     */
    if (payment.providerReference) {
      return NextResponse.json({
        success: true,
        alreadyStarted: true,
        paymentId: payment.id,
        providerReference: payment.providerReference,
        status: payment.status,
      });
    }

    const sasPayResponse = await fetch(
      `${SASPAY_API_URL.replace(/\/$/, "")}/payments/softpay/`,
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
          description: `Abonnement JobConnect ${payment.subscription.plan}`,
          customer: {
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            phone: normalizedPhone,
          },
        }),
      },
    );

    const responseText = await sasPayResponse.text();

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
        },
        { status: 502 },
      );
    }

    const providerReference =
      data?.id ||
      data?.reference ||
      data?.transaction_id ||
      null;

    if (!providerReference) {
      console.error(
        "Réponse SasPay sans identifiant:",
        data,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "SasPay n'a pas retourné de référence de paiement.",
        },
        { status: 502 },
      );
    }

    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        providerReference: String(providerReference),
        transactionReference:
          data?.reference
            ? String(data.reference)
            : undefined,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      providerReference: String(providerReference),
      status: data?.status || "PENDING",
      checkoutUrl:
        data?.checkout_url ||
        data?.checkoutUrl ||
        "",
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