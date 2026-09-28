import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminCandidatesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const candidates = await prisma.user.findMany({
    where: {
      role: "CANDIDATE",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      profile: true,
      subscriptions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-black/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/admin" className="text-xl font-black tracking-tight">
            Job<span className="text-[#ea580c]">Connect</span>
            <span className="ml-2 text-sm font-semibold text-zinc-500">
              ADMIN
            </span>
          </Link>

          <Link
            href="/admin"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ea580c]">
          Administration
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Candidats
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Consultez les candidats inscrits sur JobConnect.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-zinc-400">
            Total des candidats :{" "}
            <span className="font-bold text-white">
              {candidates.length}
            </span>
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {candidates.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl">👥</div>

              <h2 className="mt-4 text-lg font-black">
                Aucun candidat
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Les candidats inscrits apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {candidates.map((candidate) => {
                const subscription = candidate.subscriptions[0];

                return (
                  <div
                    key={candidate.id}
                    className="p-6 transition hover:bg-white/[0.02]"
                  >
                    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-center">
                      {/* Candidat */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
                          Candidat
                        </p>

                        <h2 className="mt-2 text-lg font-black">
                          {candidate.firstName} {candidate.lastName}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-400">
                          {candidate.email}
                        </p>

                        {candidate.phone && (
                          <p className="mt-1 text-sm text-zinc-500">
                            📞 {candidate.phone}
                          </p>
                        )}

                        {candidate.city && (
                          <p className="mt-1 text-sm text-zinc-500">
                            📍 {candidate.city}
                          </p>
                        )}
                      </div>

                      {/* Profil */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
                          Profil
                        </p>

                        <p className="mt-2 text-sm text-zinc-300">
                          {candidate.profile ? "Profil créé" : "Profil incomplet"}
                        </p>

                        {candidate.profile?.experience && (
                          <p className="mt-1 text-xs text-zinc-500">
                            Expérience renseignée
                          </p>
                        )}

                        {candidate.profile?.cvUrl && (
                          <p className="mt-1 text-xs font-semibold text-green-500">
                            ✓ CV disponible
                          </p>
                        )}
                      </div>

                      {/* Abonnement */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
                          Abonnement
                        </p>

                        {subscription ? (
                          <>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="font-bold">
                                {subscription.plan === "BASIC"
                                  ? "BASIC"
                                  : "PREMIUM"}
                              </span>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                  subscription.status === "ACTIVE"
                                    ? "bg-green-500/10 text-green-500"
                                    : subscription.status === "PENDING"
                                      ? "bg-yellow-500/10 text-yellow-500"
                                      : "bg-white/5 text-zinc-500"
                                }`}
                              >
                                {getSubscriptionStatusLabel(
                                  subscription.status
                                )}
                              </span>
                            </div>

                            {subscription.status === "ACTIVE" &&
                              subscription.endDate && (
                                <p className="mt-2 text-xs text-zinc-500">
                                  Expire le{" "}
                                  {new Date(
                                    subscription.endDate
                                  ).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </p>
                              )}

                            {subscription.plan === "BASIC" && (
                              <p className="mt-1 text-xs text-zinc-500">
                                Candidatures :{" "}
                                {subscription.applicationsUsed}/3
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="mt-2 text-sm text-zinc-500">
                            Aucun abonnement
                          </p>
                        )}
                      </div>

                      {/* Activité */}
                      <div className="lg:text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
                          Activité
                        </p>

                        <p className="mt-2 text-sm font-bold text-white">
                          {candidate._count.applications}{" "}
                          {candidate._count.applications > 1
                            ? "candidatures"
                            : "candidature"}
                        </p>

                        <p className="mt-2 text-xs text-zinc-600">
                          Inscrit le{" "}
                          {new Date(
                            candidate.createdAt
                          ).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function getSubscriptionStatusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Actif";

    case "PENDING":
      return "En attente";

    case "EXPIRED":
      return "Expiré";

    case "CANCELLED":
      return "Annulé";

    default:
      return status;
  }
}