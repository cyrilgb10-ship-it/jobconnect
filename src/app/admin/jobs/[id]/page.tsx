import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditJobForm from "@/components/admin/EditJobForm";

export default async function AdminEditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!job) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-black/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/admin"
            className="text-xl font-black tracking-tight"
          >
            Job<span className="text-[#ea580c]">Connect</span>
            <span className="ml-2 text-sm font-semibold text-zinc-500">
              ADMIN
            </span>
          </Link>

          <Link
            href="/admin/jobs"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            ← Retour aux offres
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ea580c]">
          Administration
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Gérer l'offre
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Modifiez les informations de cette offre d'emploi.
        </p>

        <div className="mt-8">
          <EditJobForm
            job={{
              id: job.id,
              title: job.title,
              description: job.description,
              companyName: job.companyName,
              companyLogo: job.companyLogo,
              location: job.location,
              contractType: job.contractType,
              salary: job.salary,
              experience: job.experience,
              education: job.education,
              skills: job.skills,
              applicationInfo: job.applicationInfo,
              status: job.status,
              categoryId: job.categoryId,
              expiresAt: job.expiresAt?.toISOString() ?? null,
            }}
            categories={categories}
          />
        </div>
      </section>
    </main>
  );
}