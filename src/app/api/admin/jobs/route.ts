import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const jobs = await prisma.job.findMany({
      include: {
        category: true,
        _count: {
          select: {
            applications: true,
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      jobs,
      total: jobs.length,
    });
  } catch (error) {
    console.error("ADMIN_GET_JOBS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de récupérer les offres.",
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
        {
          success: false,
          error: "Accès refusé.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

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

    if (!title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Le titre de l'offre est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "La description est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (!companyName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Le nom de l'entreprise est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "La catégorie est obligatoire.",
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "La catégorie sélectionnée est invalide.",
        },
        { status: 400 }
      );
    }

    const finalStatus =
      status === "PUBLISHED" || status === "CLOSED"
        ? status
        : "DRAFT";

    const parsedExpiresAt = expiresAt
      ? new Date(expiresAt)
      : null;

    if (
      parsedExpiresAt &&
      Number.isNaN(parsedExpiresAt.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "La date d'expiration est invalide.",
        },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        companyName: companyName.trim(),
        companyLogo: companyLogo?.trim() || null,
        location: location?.trim() || null,
        contractType: contractType?.trim() || null,
        salary: salary?.trim() || null,
        experience: experience?.trim() || null,
        education: education?.trim() || null,
        skills: skills?.trim() || null,
        applicationInfo: applicationInfo?.trim() || null,
        categoryId,
        status: finalStatus,
        publishedAt:
          finalStatus === "PUBLISHED"
            ? new Date()
            : null,
        expiresAt: parsedExpiresAt,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Offre créée avec succès.",
        job,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADMIN_CREATE_JOB_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de créer l'offre.",
      },
      { status: 500 }
    );
  }
}
