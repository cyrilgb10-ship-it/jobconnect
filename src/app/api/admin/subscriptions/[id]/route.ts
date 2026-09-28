import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const action = body.action;

    if (!["ACTIVATE", "CANCEL", "EXPIRE"].includes(action)) {
      return NextResponse.json(
        { error: "Action invalide" },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Abonnement introuvable" },
        { status: 404 }
      );
    }

    if (action === "ACTIVATE") {
      const startDate = new Date();
      const endDate = new Date(startDate);

      endDate.setDate(endDate.getDate() + 30);

      // Désactive les anciens abonnements actifs du candidat
      await prisma.subscription.updateMany({
        where: {
          userId: subscription.userId,
          status: "ACTIVE",
          id: {
            not: subscription.id,
          },
        },
        data: {
          status: "EXPIRED",
        },
      });

      const updated = await prisma.subscription.update({
        where: { id },
        data: {
          status: "ACTIVE",
          startDate,
          endDate,
          applicationsUsed: 0,
          applicationsLimit:
            subscription.plan === "BASIC" ? 3 : null,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json(updated);
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        status: action === "CANCEL" ? "CANCELLED" : "EXPIRED",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/admin/subscriptions/[id]:", error);

    return NextResponse.json(
      { error: "Erreur lors de la modification de l'abonnement" },
      { status: 500 }
    );
  }
}