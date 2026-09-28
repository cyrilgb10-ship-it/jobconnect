import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Accès refusé." },
        { status: 403 }
      );
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            jobs: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("ADMIN_GET_CATEGORIES_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de récupérer les catégories.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Accès refusé." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = body.name?.trim();
    const description = body.description?.trim() || null;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Le nom de la catégorie est obligatoire.",
        },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Cette catégorie existe déjà.",
        },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Catégorie créée avec succès.",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADMIN_CREATE_CATEGORY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de créer la catégorie.",
      },
      { status: 500 }
    );
  }
}