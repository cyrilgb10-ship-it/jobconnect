import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté." },
        { status: 401 }
      );
    }

    if (user.role !== "CANDIDATE") {
      return NextResponse.json(
        { error: "Seuls les candidats peuvent souscrire à un abonnement." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const plan = body.plan;

    if (plan !== "BASIC" && plan !== "PREMIUM") {
      return NextResponse.json(
        { error: "Forfait invalide." },
        { status: 400 }
      );
    }

    const price = plan === "BASIC" ? 1500 : 3000;
    const applicationsLimit = plan === "BASIC" ? 3 : null;

    // Vérifier s'il existe déjà une demande en attente
    // pour ce même forfait.
    const existingPending = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        plan,
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingPending) {
      return NextResponse.json({
        subscription: existingPending,
        existing: true,
      });
    }

    // Créer la demande d'abonnement.
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        plan,
        status: "PENDING",
        price,
        applicationsLimit,
        applicationsUsed: 0,
      },
    });

    return NextResponse.json(
      {
        subscription,
        existing: false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur POST /api/subscriptions:", error);

    return NextResponse.json(
      {
        error: "Impossible de créer la demande d'abonnement.",
      },
      { status: 500 }
    );
  }
}