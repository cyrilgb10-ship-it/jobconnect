import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const city = String(body.city ?? "").trim();
    const photo = String(body.photo ?? "").trim();

    const bio = String(body.bio ?? "").trim();
    const cvUrl = String(body.cvUrl ?? "").trim();
    const skills = String(body.skills ?? "").trim();
    const experience = String(body.experience ?? "").trim();
    const education = String(body.education ?? "").trim();
    const availability = String(body.availability ?? "").trim();

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Le prénom et le nom sont obligatoires." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        firstName,
        lastName,
        phone: phone || null,
        city: city || null,
        photo: photo || null,
      },
    });

    await prisma.candidateProfile.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        bio: bio || null,
        cvUrl: cvUrl || null,
        skills: skills || null,
        experience: experience || null,
        education: education || null,
        availability: availability || null,
      },
      update: {
        bio: bio || null,
        cvUrl: cvUrl || null,
        skills: skills || null,
        experience: experience || null,
        education: education || null,
        availability: availability || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès.",
    });
  } catch (error) {
    console.error("PATCH /api/profile:", error);

    return NextResponse.json(
      { error: "Impossible de mettre à jour le profil." },
      { status: 500 }
    );
  }
}