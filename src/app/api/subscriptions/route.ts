import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Vous devez être connecté.",
        },
        { status: 401 },
      );
    }

    if (user.role !== "CANDIDATE") {
      return NextResponse.json(
        {
          error: "Seuls les candidats peuvent souscrire à un abonnement.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        error:
          "Utilisez le paiement SoleasPay pour souscrire à un abonnement.",
        paymentEndpoint: "/api/payment/soleaspay",
        plans: {
          BASIC: {
            price: 999,
            applicationsLimit: 3,
          },
          PREMIUM: {
            price: 2997,
            applicationsLimit: null,
          },
        },
      },
      { status: 410 },
    );
  } catch (error) {
    console.error("Erreur POST /api/subscriptions:", error);

    return NextResponse.json(
      {
        error: "Une erreur est survenue.",
      },
      { status: 500 },
    );
  }
}