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
        { success: false, error: "Accès refusé." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const name = body.name?.trim();
    const description =
      body.description?.trim() || null;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Le nom de la catégorie est obligatoire.",
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Catégorie introuvable.",
        },
        { status: 404 }
      );
    }

    const duplicate = await prisma.category.findFirst({
      where: {
        name,
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: "Une autre catégorie porte déjà ce nom.",
        },
        { status: 409 }
      );
    }

    const updatedCategory =
      await prisma.category.update({
        where: { id },
        data: {
          name,
          description,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Catégorie modifiée avec succès.",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("ADMIN_UPDATE_CATEGORY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de modifier la catégorie.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Accès refusé." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            jobs: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Catégorie introuvable.",
        },
        { status: 404 }
      );
    }

    if (category._count.jobs > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cette catégorie est utilisée par une ou plusieurs offres et ne peut pas être supprimée.",
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Catégorie supprimée avec succès.",
    });
  } catch (error) {
    console.error("ADMIN_DELETE_CATEGORY_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de supprimer la catégorie.",
      },
      { status: 500 }
    );
  }
}