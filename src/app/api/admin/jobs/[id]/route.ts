import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Accès refusé.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        category: true,
        _count: {
          select: {
            applications: true,
            favorites: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "Offre introuvable.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("ADMIN_GET_JOB_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de récupérer cette offre.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Accès refusé.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob) {
      return NextResponse.json(
        {
          success: false,
          error: "Offre introuvable.",
        },
        { status: 404 }
      );
    }

    const {
      title,
      description,
      companyName,
      companyLogo,
      location,
      contractType,
      salary,
      experience,
      education,
      skills,
      applicationInfo,
      categoryId,
      status,
      expiresAt,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "Le titre ne peut pas être vide.",
          },
          { status: 400 }
        );
      }

      updateData.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "La description ne peut pas être vide.",
          },
          { status: 400 }
        );
      }

      updateData.description = description.trim();
    }

    if (companyName !== undefined) {
      if (!companyName.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "Le nom de l'entreprise ne peut pas être vide.",
          },
          { status: 400 }
        );
      }

      updateData.companyName = companyName.trim();
    }

    if (companyLogo !== undefined) {
      updateData.companyLogo = companyLogo?.trim() || null;
    }

    if (location !== undefined) {
      updateData.location = location?.trim() || null;
    }

    if (contractType !== undefined) {
      updateData.contractType = contractType?.trim() || null;
    }

    if (salary !== undefined) {
      updateData.salary = salary?.trim() || null;
    }

    if (experience !== undefined) {
      updateData.experience = experience?.trim() || null;
    }

    if (education !== undefined) {
      updateData.education = education?.trim() || null;
    }

    if (skills !== undefined) {
      updateData.skills = skills?.trim() || null;
    }

    if (applicationInfo !== undefined) {
      updateData.applicationInfo = applicationInfo?.trim() || null;
    }

    if (categoryId !== undefined) {
      updateData.categoryId = categoryId || null;
    }

    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt
        ? new Date(expiresAt)
        : null;
    }

    if (status !== undefined) {
      if (!["DRAFT", "PUBLISHED", "CLOSED"].includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: "Statut invalide.",
          },
          { status: 400 }
        );
      }

      updateData.status = status;

      if (status === "PUBLISHED" && !existingJob.publishedAt) {
        updateData.publishedAt = new Date();
      }

      if (status === "DRAFT") {
        updateData.publishedAt = null;
      }
    }

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Offre mise à jour avec succès.",
      job,
    });
  } catch (error) {
    console.error("ADMIN_UPDATE_JOB_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de modifier l'offre.",
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
        {
          success: false,
          error: "Accès refusé.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "Offre introuvable.",
        },
        { status: 404 }
      );
    }

    await prisma.job.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Offre supprimée avec succès.",
    });
  } catch (error) {
    console.error("ADMIN_DELETE_JOB_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          "Impossible de supprimer l'offre. Vérifiez qu'elle ne contient pas de données liées.",
      },
      { status: 500 }
    );
  }
}