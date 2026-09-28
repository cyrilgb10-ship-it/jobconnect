import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const subscription = user.subscriptions[0] ?? null;

  const hasSubscription =
    subscription &&
    subscription.status === "ACTIVE" &&
    (!subscription.endDate || subscription.endDate > new Date());

  const remainingApplications =
    subscription?.applicationsLimit === null
      ? null
      : Math.max(
          (subscription?.applicationsLimit ?? 0) -
            (subscription?.applicationsUsed ?? 0),
          0
        );

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070707]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ea580c] text-lg font-black shadow-lg shadow-orange-950/30">
              J
            </div>

            <span className="text-xl font-black tracking-tight">
              Job<span className="text-[#f97316]">Connect</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
            <Link href="/dashboard" className="text-white">
              Tableau de bord
            </Link>

            <Link
              href="/jobs"
              className="transition hover:text-white"
            >
              Offres
            </Link>

            <Link
              href="/applications"
              className="transition hover:text-white"
            >
              Candidatures
            </Link>

            <Link
              href="/profile"
              className="transition hover:text-white"
            >
              Profil
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {user.firstName} {user.lastName}
              </p>

              <p className="text-xs text-zinc-600">
                Candidat
              </p>
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* CONTENU */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-[-250px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#ea580c]/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
          {/* HERO DASHBOARD */}
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#17110d] via-[#111111] to-[#0d0d0d] p-7 sm:p-10">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ea580c]/20 bg-[#ea580c]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                  Espace candidat
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Bonjour{" "}
                  <span className="text-[#f97316]">
                    {user.firstName}
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                  Retrouvez ici vos informations, votre abonnement et
                  vos candidatures. Explorez les opportunités publiées
                  sur JobConnect.
                </p>
              </div>

              <Link
                href="/jobs"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#ea580c] px-6 py-3.5 text-sm font-black transition hover:bg-[#f97316]"
              >
                Rechercher une offre
              </Link>
            </div>
          </section>

          {/* INFORMATIONS */}
          <section className="mt-6 grid gap-5 md:grid-cols-3">
            {/* PROFIL */}
            <Link
              href="/profile"
              className="group rounded-2xl border border-white/10 bg-[#101010] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#ea580c]/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ea580c]/10 text-lg text-[#f97316]">
                  👤
                </div>

                <span className="text-zinc-700 transition group-hover:text-[#f97316]">
                  →
                </span>
              </div>

              <h2 className="mt-6 font-bold">
                Mon profil
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Gérez vos informations personnelles, vos compétences
                et votre profil candidat.
              </p>

              <p className="mt-5 text-sm font-bold text-[#f97316]">
                Modifier mon profil
              </p>
            </Link>

            {/* ABONNEMENT */}
            <Link
              href="/subscriptions"
              className="group rounded-2xl border border-white/10 bg-[#101010] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#ea580c]/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ea580c]/10 text-lg text-[#f97316]">
                  ⚡
                </div>

                <span className="text-zinc-700 transition group-hover:text-[#f97316]">
                  →
                </span>
              </div>

              <h2 className="mt-6 font-bold">
                Abonnement
              </h2>

              {hasSubscription ? (
                <>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />

                    <p className="text-sm font-semibold text-green-400">
                      {subscription.plan}
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-zinc-500">
                    {subscription.plan === "PREMIUM"
                      ? "Candidatures illimitées."
                      : `${remainingApplications} candidature(s) restante(s).`}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm font-semibold text-orange-400">
                    Aucun abonnement actif
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    Un abonnement est nécessaire pour postuler.
                  </p>
                </>
              )}

              <p className="mt-5 text-sm font-bold text-[#f97316]">
                Gérer mon abonnement
              </p>
            </Link>

            {/* CANDIDATURES */}
            <Link
              href="/applications"
              className="group rounded-2xl border border-white/10 bg-[#101010] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#ea580c]/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ea580c]/10 text-lg text-[#f97316]">
                  📄
                </div>

                <span className="text-zinc-700 transition group-hover:text-[#f97316]">
                  →
                </span>
              </div>

              <h2 className="mt-6 font-bold">
                Mes candidatures
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Consultez les offres auxquelles vous avez déjà
                candidaté et leur statut.
              </p>

              <p className="mt-5 text-sm font-bold text-[#f97316]">
                Voir mes candidatures
              </p>
            </Link>
          </section>

          {/* ABONNEMENT */}
          <section className="mt-8 overflow-hidden rounded-3xl border border-[#ea580c]/20 bg-[#120d09]">
            <div className="relative p-7 sm:p-9">
              <div className="pointer-events-none absolute right-[-100px] top-[-150px] h-[350px] w-[350px] rounded-full bg-[#ea580c]/10 blur-[100px]" />

              <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f97316]">
                    Votre accès
                  </p>

                  <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                    {hasSubscription
                      ? subscription?.plan === "PREMIUM"
                        ? "Votre abonnement est actif."
                        : `${remainingApplications} candidature(s) disponible(s).`
                      : "Vous souhaitez postuler à une offre ?"}
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                    {hasSubscription
                      ? "Vous pouvez maintenant consulter les offres et utiliser votre accès pour envoyer vos candidatures."
                      : "Consultez librement les offres. Pour envoyer une candidature, choisissez un abonnement et contactez-nous via WhatsApp."}
                  </p>
                </div>

                <Link
                  href={
                    hasSubscription
                      ? "/jobs"
                      : "/subscriptions"
                  }
                  className="relative shrink-0 rounded-xl bg-[#ea580c] px-6 py-3.5 text-center text-sm font-black transition hover:bg-[#f97316]"
                >
                  {hasSubscription
                    ? "Voir les offres"
                    : "Voir les abonnements"}
                </Link>
              </div>
            </div>
          </section>

          {/* OFFRES */}
          <section className="mt-12">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f97316]">
                  Opportunités
                </p>

                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  Trouver un emploi
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Découvrez les offres actuellement publiées.
                </p>
              </div>

              <Link
                href="/jobs"
                className="text-sm font-bold text-[#f97316] transition hover:text-orange-300"
              >
                Toutes les offres →
              </Link>
            </div>

            <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-[#101010] px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-[#181818] text-2xl">
                💼
              </div>

              <h3 className="mt-6 text-lg font-bold">
                Aucune offre à afficher ici pour le moment
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-600">
                Les offres publiées par l'administration seront
                disponibles dans l'espace des opportunités.
              </p>

              <Link
                href="/jobs"
                className="mt-6 inline-flex rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-zinc-300 transition hover:border-[#ea580c]/40 hover:text-white"
              >
                Consulter les offres
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-10 border-t border-white/10 bg-[#070707]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ea580c] text-xs font-black">
              J
            </div>

            <span className="font-bold">
              Job<span className="text-[#f97316]">Connect</span>
            </span>
          </div>

          <p className="text-xs text-zinc-600">
            © 2026 JobConnect. Tous droits réservés.
          </p>
        </div>
      </footer>
    </main>
  );
}