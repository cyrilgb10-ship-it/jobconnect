import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé." },
        { status: 403 }
      );
    }

    const applications = await prisma.application.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            city: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET /api/admin/applications:", error);

    return NextResponse.json(
      { error: "Erreur lors du chargement des candidatures." },
      { status: 500 }
    );
  }
}