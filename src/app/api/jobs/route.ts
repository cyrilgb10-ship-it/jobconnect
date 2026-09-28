import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const categoryId = searchParams.get("categoryId")?.trim() || "";

    const jobs = await prisma.job.findMany({
      where: {
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

        ...(search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  companyName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  skills: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),

        ...(location
          ? {
              location: {
                contains: location,
                mode: "insensitive",
              },
            }
          : {}),

        ...(categoryId
          ? {
              categoryId,
            }
          : {}),
      },

      include: {
        category: true,
      },

      orderBy: {
        publishedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      jobs,
      total: jobs.length,
    });
  } catch (error) {
    console.error("GET_JOBS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de récupérer les offres.",
      },
      {
        status: 500,
      }
    );
  }
}