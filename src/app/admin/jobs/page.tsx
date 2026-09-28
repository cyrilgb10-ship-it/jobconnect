import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function statusLabel(status: string) {
  if (status === "PUBLISHED") return "Publiée";
  if (status === "CLOSED") return "Fermée";
  return "Brouillon";
}

function statusClass(status: string) {
  if (status === "PUBLISHED") {
    return "bg-green-500/10 text-green-400 border-green-500/20";
  }

  if (status === "CLOSED") {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }

  return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
}

export default async function AdminJobsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
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

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-black/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/admin"
              className="text-xl font-black tracking-tight"
            >
              Job<span className="text-[#ea580c]">Connect</span>
            </Link>

            <p className="mt-1 text-sm text-zinc-500">
              Gestion des offres
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
            >
              ← Administration
            </Link>

            <Link
              href="/admin/jobs/new"
              className="rounded-xl bg-[#ea580c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#f97316]"
            >
              + Nouvelle offre
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#ea580c]">
            Offres d'emploi
          </p>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Toutes les offres
              </h1>

              <p className="mt-3 text-zinc-400">
                Gérez les offres disponibles sur JobConnect.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111111] px-4 py-3">
              <span className="text-sm text-zinc-500">
                Total
              </span>

              <span className="ml-2 text-lg font-black">
                {jobs.length}
              </span>
            </div>
          </div>
        </div>

        {jobs.length === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-[#111111] px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ea580c]/10 text-2xl">
              💼
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Aucune offre pour le moment
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Créez votre première offre pour qu'elle puisse
              ensuite être publiée sur JobConnect.
            </p>

            <Link
              href="/admin/jobs/new"
              className="mt-6 inline-flex rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#f97316]"
            >
              Créer une offre
            </Link>
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
            <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 md:grid">
              <span>Offre</span>
              <span>Catégorie</span>
              <span>Statut</span>
              <span>Candidatures</span>
              <span>Action</span>
            </div>

            <div className="divide-y divide-white/10">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="grid gap-5 px-6 py-6 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center md:gap-4"
                >
                  <div>
                    <h2 className="font-bold text-white">
                      {job.title}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      {job.companyName}
                      {job.location
                        ? ` • ${job.location}`
                        : ""}
                    </p>

                    <p className="mt-2 text-xs text-zinc-600">
                      Créée le{" "}
                      {new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "medium",
                      }).format(job.createdAt)}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-zinc-400">
                      {job.category?.name || "Sans catégorie"}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                        job.status
                      )}`}
                    >
                      {statusLabel(job.status)}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-semibold">
                      {job._count.applications}
                    </span>

                    <span className="ml-1 text-sm text-zinc-500">
                      candidature
                      {job._count.applications > 1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  <div>
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="inline-flex rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-[#ea580c]/40 hover:text-white"
                    >
                      Gérer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}