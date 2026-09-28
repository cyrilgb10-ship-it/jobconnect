import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
    },
  });

  if (!job || job.status !== "PUBLISHED") {
    notFound();
  }

  const user = await getCurrentUser();

  let hasActiveSubscription = false;

  if (user?.role === "CANDIDATE") {
    const activeSubscription = await prisma.subscription.findFirst({
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

    hasActiveSubscription = !!activeSubscription;
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-black/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-black tracking-tight">
            Job<span className="text-[#ea580c]">Connect</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
              >
                Mon espace
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/jobs"
          className="text-sm font-semibold text-zinc-500 transition hover:text-white"
        >
          ← Retour aux offres
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ea580c]">
                  {job.category?.name ?? "Emploi"}
                </p>

                <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                  {job.title}
                </h1>

                <p className="mt-3 text-lg text-zinc-400">
                  {job.companyName}
                </p>
              </div>

              {job.companyLogo && (
                <img
                  src={job.companyLogo}
                  alt={job.companyName}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
              )}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {job.location && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs font-semibold uppercase text-zinc-500">
                    Localisation
                  </p>
                  <p className="mt-1 font-semibold">{job.location}</p>
                </div>
              )}

              {job.contractType && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs font-semibold uppercase text-zinc-500">
                    Type de contrat
                  </p>
                  <p className="mt-1 font-semibold">{job.contractType}</p>
                </div>
              )}

              {job.salary && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs font-semibold uppercase text-zinc-500">
                    Rémunération
                  </p>
                  <p className="mt-1 font-semibold">{job.salary}</p>
                </div>
              )}

              {job.experience && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs font-semibold uppercase text-zinc-500">
                    Expérience
                  </p>
                  <p className="mt-1 font-semibold">{job.experience}</p>
                </div>
              )}
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-black">Description du poste</h2>

              <div className="mt-4 whitespace-pre-line leading-8 text-zinc-300">
                {job.description}
              </div>
            </div>

            {job.skills && (
              <div className="mt-10">
                <h2 className="text-xl font-black">Compétences recherchées</h2>

                <p className="mt-4 whitespace-pre-line leading-7 text-zinc-300">
                  {job.skills}
                </p>
              </div>
            )}

            {job.education && (
              <div className="mt-10">
                <h2 className="text-xl font-black">Formation</h2>

                <p className="mt-4 whitespace-pre-line leading-7 text-zinc-300">
                  {job.education}
                </p>
              </div>
            )}

            {job.applicationInfo && (
              <div className="mt-10">
                <h2 className="text-xl font-black">
                  Informations pour postuler
                </h2>

                <p className="mt-4 whitespace-pre-line leading-7 text-zinc-300">
                  {job.applicationInfo}
                </p>
              </div>
            )}
          </article>

          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-6 lg:sticky lg:top-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ea580c]">
              Cette offre vous intéresse ?
            </p>

            <h2 className="mt-3 text-2xl font-black">
              Postulez maintenant
            </h2>

            {!user ? (
              <>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Connectez-vous pour vérifier votre abonnement et envoyer
                  votre candidature.
                </p>

                <Link
                  href="/login"
                  className="mt-6 block rounded-xl bg-[#ea580c] px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#f97316]"
                >
                  Se connecter
                </Link>
              </>
            ) : user.role !== "CANDIDATE" ? (
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Cet espace est réservé aux candidats.
              </p>
            ) : hasActiveSubscription ? (
              <>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Votre abonnement est actif. Vous pouvez envoyer votre
                  candidature pour cette offre.
                </p>

                <Link
                  href={`/jobs/${job.id}/apply`}
                  className="mt-6 block rounded-xl bg-[#ea580c] px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#f97316]"
                >
                  Postuler maintenant
                </Link>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Un abonnement actif est nécessaire pour envoyer une
                  candidature.
                </p>

                <Link
                  href="/subscriptions"
                  className="mt-6 block rounded-xl bg-[#ea580c] px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#f97316]"
                >
                  Voir les abonnements
                </Link>
              </>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}