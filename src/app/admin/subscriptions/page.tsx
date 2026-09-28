import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SubscriptionsManager from "@/components/admin/SubscriptionsManager";

export default async function AdminSubscriptionsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
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

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-[#ea580c]/40 hover:text-white"
            >
              ← Dashboard
            </Link>

            <Link
              href="/admin/candidates"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
            >
              Candidats
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ea580c]">
            Administration
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            Gestion des abonnements
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Consultez les demandes d'abonnement et activez manuellement les
            forfaits après vérification du paiement.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Total
            </p>
            <p className="mt-2 text-3xl font-black">
              {subscriptions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-500">
              En attente
            </p>
            <p className="mt-2 text-3xl font-black">
              {subscriptions.filter((s) => s.status === "PENDING").length}
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-green-500">
              Actifs
            </p>
            <p className="mt-2 text-3xl font-black">
              {subscriptions.filter((s) => s.status === "ACTIVE").length}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-red-500">
              Expirés
            </p>
            <p className="mt-2 text-3xl font-black">
              {subscriptions.filter((s) => s.status === "EXPIRED").length}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <SubscriptionsManager
            initialSubscriptions={subscriptions.map((subscription) => ({
              id: subscription.id,
              plan: subscription.plan,
              status: subscription.status,
              price: subscription.price,
              applicationsLimit: subscription.applicationsLimit,
              applicationsUsed: subscription.applicationsUsed,
              startDate: subscription.startDate?.toISOString() ?? null,
              endDate: subscription.endDate?.toISOString() ?? null,
              createdAt: subscription.createdAt.toISOString(),
              user: subscription.user,
            }))}
          />
        </div>
      </section>
    </main>
  );
}