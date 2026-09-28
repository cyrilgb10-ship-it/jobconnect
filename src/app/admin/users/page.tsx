import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          applications: true,
          subscriptions: true,
          favorites: true,
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
          Utilisateurs
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Consultez tous les comptes inscrits sur JobConnect.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total utilisateurs"
            value={users.length}
          />

          <StatCard
            label="Candidats"
            value={users.filter((u) => u.role === "CANDIDATE").length}
          />

          <StatCard
            label="Administrateurs"
            value={users.filter((u) => u.role === "ADMIN").length}
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {users.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl">👤</div>

              <h2 className="mt-4 text-lg font-black">
                Aucun utilisateur
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Les utilisateurs inscrits apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {users.map((currentUser) => (
                <div
                  key={currentUser.id}
                  className="p-6 transition hover:bg-white/[0.02]"
                >
                  <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-center">
                    {/* Informations utilisateur */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
                        Utilisateur
                      </p>

                      <h2 className="mt-2 text-lg font-black">
                        {currentUser.firstName} {currentUser.lastName}
                      </h2>

                      <p className="mt-1 text-sm text-zinc-400">
                        {currentUser.email}
                      </p>

                      {currentUser.phone && (
                        <p className="mt-1 text-sm text-zinc-500">
                          📞 {currentUser.phone}
                        </p>
                      )}

                      {currentUser.city && (
                        <p className="mt-1 text-sm text-zinc-500">
                          📍 {currentUser.city}
                        </p>
                      )}
                    </div>

                    {/* Rôle */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
                        Rôle
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                          currentUser.role === "ADMIN"
                            ? "bg-[#ea580c]/10 text-[#f97316]"
                            : "bg-white/5 text-zinc-300"
                        }`}
                      >
                        {currentUser.role === "ADMIN"
                          ? "Administrateur"
                          : "Candidat"}
                      </span>
                    </div>

                    {/* Activité */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
                        Activité
                      </p>

                      <p className="mt-2 text-sm text-zinc-300">
                        {currentUser._count.applications}{" "}
                        {currentUser._count.applications > 1
                          ? "candidatures"
                          : "candidature"}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {currentUser._count.subscriptions}{" "}
                        {currentUser._count.subscriptions > 1
                          ? "abonnements"
                          : "abonnement"}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {currentUser._count.favorites}{" "}
                        {currentUser._count.favorites > 1
                          ? "favoris"
                          : "favori"}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="lg:text-right">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
                        Inscription
                      </p>

                      <p className="mt-2 text-sm font-semibold text-zinc-300">
                        {new Date(
                          currentUser.createdAt
                        ).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        {new Date(
                          currentUser.createdAt
                        ).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-zinc-500">{label}</p>

      <p className="mt-2 text-3xl font-black text-white">
        {value}
      </p>
    </div>
  );
}