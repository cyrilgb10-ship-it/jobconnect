import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.job.findFirst({
      where: {
        id,
        status: "PUBLISHED",

        OR: [
          {
            expiresAt: null,
          },
          {
            expiresAt: {
              gt: new Date(),
            },
          },
        ],
      },

      include: {
        category: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "Offre introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("GET_JOB_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de récupérer cette offre.",
      },
      {
        status: 500,
      }
    );
  }
}