import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function JobsPage() {
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
    },
    include: {
      category: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070707]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ea580c] font-black">
              J
            </div>

            <span className="text-xl font-black">
              Job<span className="text-[#f97316]">Connect</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
            <Link href="/" className="transition hover:text-white">
              Accueil
            </Link>

            <Link href="/jobs" className="text-white">
              Offres
            </Link>

            <Link
              href="/subscriptions"
              className="transition hover:text-white"
            >
              Abonnement
            </Link>
          </nav>

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-zinc-300 transition hover:border-[#ea580c]/40 hover:text-white"
          >
            Mon espace
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute left-1/2 top-[-250px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#ea580c]/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f97316]">
            JobConnect
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Offres d'emploi
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
            Consultez les opportunités actuellement publiées sur
            JobConnect.
          </p>
        </div>
      </section>

      {/* CONTENU */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        {jobs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-[#101010] px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ea580c]/10 text-2xl">
              💼
            </div>

            <h2 className="mt-6 text-xl font-black">
              Aucune offre disponible
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600">
              De nouvelles offres seront affichées ici dès leur
              publication par l'administration.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="group rounded-3xl border border-white/10 bg-[#101010] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#ea580c]/40"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#181818] text-xl font-black text-[#f97316]">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        job.companyName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold uppercase tracking-wider text-zinc-600">
                        {job.companyName}
                      </p>

                      <h2 className="mt-1 text-xl font-black transition group-hover:text-[#f97316]">
                        {job.title}
                      </h2>
                    </div>
                  </div>

                  <span className="shrink-0 text-xl text-zinc-700 transition group-hover:text-[#f97316]">
                    →
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {job.category && (
                    <span className="rounded-lg bg-[#ea580c]/10 px-3 py-1.5 text-xs font-semibold text-orange-300">
                      {job.category.name}
                    </span>
                  )}

                  {job.location && (
                    <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-zinc-400">
                      📍 {job.location}
                    </span>
                  )}

                  {job.contractType && (
                    <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-zinc-400">
                      {job.contractType}
                    </span>
                  )}
                </div>

                <p className="mt-5 line-clamp-3 text-sm leading-6 text-zinc-500">
                  {job.description}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">
                  <span className="text-xs text-zinc-600">
                    Voir les détails
                  </span>

                  <span className="text-sm font-bold text-[#f97316]">
                    Consulter →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}