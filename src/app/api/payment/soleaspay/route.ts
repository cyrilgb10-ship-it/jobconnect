import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PLANS = {
  BASIC: {
    price: 999,
    applicationsLimit: 3,
    label: "Abonnement BASIC JobConnect",
  },
  PREMIUM: {
    price: 2997,
    applicationsLimit: null,
    label: "Abonnement PREMIUM JobConnect",
  },
} as const;

type Plan = keyof typeof PLANS;

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Vous devez être connecté.",
        },
        { status: 401 },
      );
    }

    if (user.role !== "CANDIDATE") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Seuls les candidats peuvent souscrire à un abonnement.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const plan = body?.plan as Plan;

    if (!plan || !PLANS[plan]) {
      return NextResponse.json(
        {
          success: false,
          message: "Abonnement invalide.",
        },
        { status: 400 },
      );
    }

    const selectedPlan = PLANS[plan];

    const apiKey = process.env.SOLEASPAY_API_KEY;

    if (!apiKey) {
      console.error("SOLEASPAY_API_KEY est manquante.");

      return NextResponse.json(
        {
          success: false,
          message: "La configuration du paiement est indisponible.",
        },
        { status: 500 },
      );
    }

    const existingPending = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "PENDING",
        plan,
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

    let payment = existingPending?.payments[0] ?? null;

    if (!existingPending || !payment) {
      const subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          plan,
          status: "PENDING",
          price: selectedPlan.price,
          applicationsLimit: selectedPlan.applicationsLimit,
          applicationsUsed: 0,
        },
      });

      const orderId = `JC-${subscription.id}-${Date.now()}`;

      payment = await prisma.payment.create({
        data: {
          userId: user.id,
          subscriptionId: subscription.id,
          orderId,
          amount: selectedPlan.price,
          currency: "XOF",
          status: "PENDING",
        },
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    const checkoutUrl =
      `${baseUrl}/payment/soleaspay/checkout` +
      `?paymentId=${encodeURIComponent(payment.id)}`;

    return NextResponse.json({
      success: true,
      checkoutUrl,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Erreur création paiement SoleasPay:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Impossible de créer le paiement.",
      },
      { status: 500 },
    );
  }
}