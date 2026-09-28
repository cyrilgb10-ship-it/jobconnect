import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const [
    totalJobs,
    publishedJobs,
    totalCandidates,
    totalUsers,
    totalApplications,
    pendingApplications,
    totalSubscriptions,
    pendingSubscriptions,
    activeSubscriptions,
    totalCategories,
  ] = await Promise.all([
    prisma.job.count(),

    prisma.job.count({
      where: {
        status: "PUBLISHED",
      },
    }),

    prisma.user.count({
      where: {
        role: "CANDIDATE",
      },
    }),

    prisma.user.count(),

    prisma.application.count(),

    prisma.application.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.subscription.count(),

    prisma.subscription.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.subscription.count({
      where: {
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
    }),

    prisma.category.count(),
  ]);

  const recentApplications = await prisma.application.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      job: {
        select: {
          title: true,
          companyName: true,
        },
      },
    },
  });

  const recentSubscriptions = await prisma.subscription.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-black/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/admin" className="text-xl font-black tracking-tight">
            Job<span className="text-[#ea580c]">Connect</span>
            <span className="ml-2 text-sm font-semibold text-zinc-500">
              ADMIN
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
            >
              Voir le site
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              Mon espace
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ea580c]">
            Administration
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            Tableau de bord
          </h1>

          <p className="mt-2 text-zinc-500">
            Gérez les offres, les candidats, les candidatures et les
            abonnements JobConnect.
          </p>
        </div>

        {/* STATS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Offres d'emploi"
            value={totalJobs}
            detail={`${publishedJobs} publiée${publishedJobs > 1 ? "s" : ""}`}
            href="/admin/jobs"
          />

          <StatCard
            label="Candidats"
            value={totalCandidates}
            detail={`${totalUsers} utilisateur${totalUsers > 1 ? "s" : ""} au total`}
            href="/admin/candidates"
          />

          <StatCard
            label="Candidatures"
            value={totalApplications}
            detail={`${pendingApplications} en attente`}
            href="/admin/applications"
          />

          <StatCard
            label="Abonnements actifs"
            value={activeSubscriptions}
            detail={`${pendingSubscriptions} demande${pendingSubscriptions > 1 ? "s" : ""} en attente`}
            href="/admin/subscriptions"
          />
        </div>

        {/* ALERTS */}
        {(pendingSubscriptions > 0 || pendingApplications > 0) && (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {pendingSubscriptions > 0 && (
              <Link
                href="/admin/subscriptions"
                className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 transition hover:border-orange-500/40"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#ea580c]">
                      Abonnements à traiter
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      {pendingSubscriptions}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Demande
                      {pendingSubscriptions > 1 ? "s" : ""} d'abonnement en
                      attente de validation.
                    </p>
                  </div>

                  <span className="text-2xl">→</span>
                </div>
              </Link>
            )}

            {pendingApplications > 0 && (
              <Link
                href="/admin/applications"
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">
                      Nouvelles candidatures
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      {pendingApplications}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Candidature
                      {pendingApplications > 1 ? "s" : ""} en attente de
                      traitement.
                    </p>
                  </div>

                  <span className="text-2xl">→</span>
                </div>
              </Link>
            )}
          </div>
        )}

        {/* NAVIGATION */}
        <div className="mt-10">
          <h2 className="text-xl font-black">Gestion JobConnect</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AdminMenuCard
              href="/admin/jobs"
              title="Offres d'emploi"
              description="Créer, modifier, publier, fermer et supprimer les offres."
              count={`${totalJobs} offre${totalJobs > 1 ? "s" : ""}`}
              icon="💼"
            />

            <AdminMenuCard
              href="/admin/applications"
              title="Candidatures"
              description="Consulter et gérer les candidatures reçues."
              count={`${totalApplications} candidature${totalApplications > 1 ? "s" : ""}`}
              icon="📩"
            />

            <AdminMenuCard
              href="/admin/candidates"
              title="Candidats"
              description="Consulter les candidats inscrits sur la plateforme."
              count={`${totalCandidates} candidat${totalCandidates > 1 ? "s" : ""}`}
              icon="👥"
            />

            <AdminMenuCard
              href="/admin/subscriptions"
              title="Abonnements"
              description="Vérifier les paiements et activer les abonnements."
              count={`${activeSubscriptions} actif${activeSubscriptions > 1 ? "s" : ""}`}
              icon="💳"
              highlight={pendingSubscriptions > 0}
            />

            
            <AdminMenuCard
              href="/admin/users"
              title="Utilisateurs"
              description="Consulter les comptes et leurs rôles."
              count={`${totalUsers} utilisateur${totalUsers > 1 ? "s" : ""}`}
              icon="👤"
            />
          </div>
        </div>

        {/* RECENT APPLICATIONS */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">
                Dernières candidatures
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Les candidatures les plus récentes.
              </p>
            </div>

            <Link
              href="/admin/applications"
              className="text-sm font-bold text-[#ea580c] hover:text-[#f97316]"
            >
              Tout voir →
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            {recentApplications.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500">
                Aucune candidature pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex flex-col gap-4 bg-white/[0.02] p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-bold">
                        {application.user.firstName}{" "}
                        {application.user.lastName}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {application.job.title} ·{" "}
                        {application.job.companyName}
                      </p>
                    </div>

                    <StatusBadge status={application.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RECENT SUBSCRIPTIONS */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">
                Dernières demandes d'abonnement
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Les demandes les plus récentes.
              </p>
            </div>

            <Link
              href="/admin/subscriptions"
              className="text-sm font-bold text-[#ea580c] hover:text-[#f97316]"
            >
              Tout voir →
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            {recentSubscriptions.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500">
                Aucune demande d'abonnement pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {recentSubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex flex-col gap-4 bg-white/[0.02] p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-bold">
                        {subscription.user.firstName}{" "}
                        {subscription.user.lastName}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {subscription.plan === "BASIC"
                          ? "BASIC"
                          : "PREMIUM"}{" "}
                        · {subscription.price.toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>

                    <StatusBadge status={subscription.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: number;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-0.5 hover:border-white/20"
    >
      <p className="text-sm font-semibold text-zinc-500">{label}</p>

      <p className="mt-3 text-3xl font-black">{value}</p>

      <p className="mt-2 text-xs text-zinc-600">{detail}</p>
    </Link>
  );
}

function AdminMenuCard({
  href,
  title,
  description,
  count,
  icon,
  highlight = false,
}: {
  href: string;
  title: string;
  description: string;
  count: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-6 transition hover:-translate-y-0.5 ${
        highlight
          ? "border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50"
          : "border-white/10 bg-white/[0.03] hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-2xl">{icon}</span>

        <span className="text-zinc-600 transition group-hover:text-[#ea580c]">
          →
        </span>
      </div>

      <h3 className="mt-5 text-lg font-black">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {description}
      </p>

      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-zinc-600">
        {count}
      </p>
    </Link>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const labels: Record<string, string> = {
    PENDING: "En attente",
    REVIEWING: "En cours",
    ACCEPTED: "Acceptée",
    REJECTED: "Refusée",
    ACTIVE: "Actif",
    EXPIRED: "Expiré",
    CANCELLED: "Annulé",
  };

  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-300">
      {labels[status] ?? status}
    </span>
  );
}
