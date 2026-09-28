import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const WHATSAPP_NUMBER = "22890801228";

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
        { error: "Seuls les candidats peuvent postuler." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const jobId = body.jobId;

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { error: "Offre d'emploi invalide." },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job || job.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Cette offre n'est plus disponible." },
        { status: 404 }
      );
    }

    if (job.expiresAt && job.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: "Cette offre a expiré." },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
        OR: [
          {
            endDate: null,
          },
          {
            endDate: {
              gt: new Date(),
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!subscription) {
      return NextResponse.json(
        {
          error:
            "Vous devez avoir un abonnement actif pour postuler.",
        },
        { status: 403 }
      );
    }

    if (
      subscription.plan === "BASIC" &&
      subscription.applicationsUsed >= 3
    ) {
      return NextResponse.json(
        {
          error:
            "Vous avez atteint la limite de 3 candidatures de votre forfait BASIC.",
        },
        { status: 403 }
      );
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId: job.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          error: "Vous avez déjà postulé à cette offre.",
        },
        { status: 409 }
      );
    }

    const application = await prisma.$transaction(async (tx) => {
      const createdApplication = await tx.application.create({
        data: {
          userId: user.id,
          jobId: job.id,
          status: "PENDING",
          whatsappSent: false,
        },
      });

      if (subscription.plan === "BASIC") {
        await tx.subscription.update({
          where: {
            id: subscription.id,
          },
          data: {
            applicationsUsed: {
              increment: 1,
            },
          },
        });
      }

      return createdApplication;
    });

    const message = `Bonjour JobConnect,

Je souhaite postuler à l'offre suivante :

Poste : ${job.title}
Entreprise : ${job.companyName}
${job.location ? `Localisation : ${job.location}` : ""}

Mes informations :

Nom : ${user.lastName}
Prénom : ${user.firstName}
Email : ${user.email}
Téléphone : ${user.phone || "Non renseigné"}

Ma candidature a été enregistrée sur JobConnect.

Merci de prendre en compte ma candidature.`;

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=` +
      encodeURIComponent(message);

    await prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        whatsappSent: true,
      },
    });

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      whatsappUrl,
    });
  } catch (error) {
    console.error("POST /api/applications:", error);

    return NextResponse.json(
      {
        error: "Impossible d'envoyer la candidature.",
      },
      { status: 500 }
    );
  }
}