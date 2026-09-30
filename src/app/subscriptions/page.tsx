import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import SoleasPayButton from "@/components/subscriptions/SoleasPayButton";

export default async function SubscriptionsPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-black/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-black tracking-tight"
          >
            Job<span className="text-[#ea580c]">Connect</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-[#ea580c]/40 hover:text-white"
              >
                Tableau de bord
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-[#ea580c]/40 hover:text-white"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ea580c]">
            Abonnement candidat
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Choisissez votre abonnement
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400">
            Activez votre abonnement pour envoyer vos candidatures
            aux offres disponibles sur JobConnect.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {/* BASIC */}
          <div className="rounded-3xl border border-white/10 bg-[#111111] p-7">
            <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              BASIC
            </p>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-4xl font-black">999</span>

              <span className="pb-1 text-sm text-zinc-500">
                FCFA / mois
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Une formule adaptée aux candidats qui souhaitent
              envoyer quelques candidatures chaque mois.
            </p>

            <div className="my-7 h-px bg-white/10" />

            <ul className="space-y-4 text-sm text-zinc-300">
              <li className="flex gap-3">
                <span className="text-[#ea580c]">✓</span>
                <span>3 candidatures par mois</span>
              </li>

              <li className="flex gap-3">
                <span className="text-[#ea580c]">✓</span>
                <span>Accès aux offres publiées</span>
              </li>

              <li className="flex gap-3">
                <span className="text-[#ea580c]">✓</span>
                <span>Candidatures envoyées via WhatsApp</span>
              </li>
            </ul>

            {user ? (
              <SoleasPayButton plan="BASIC" />
            ) : (
              <Link
                href="/login"
                className="mt-8 block rounded-xl bg-[#ea580c] px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#f97316]"
              >
                Se connecter pour s'abonner
              </Link>
            )}
          </div>

          {/* PREMIUM */}
          <div className="relative rounded-3xl border border-[#ea580c]/50 bg-[#111111] p-7 shadow-[0_0_50px_rgba(234,88,12,0.08)]">
            <div className="absolute -top-3 right-6 rounded-full bg-[#ea580c] px-3 py-1 text-xs font-bold text-white">
              PREMIUM
            </div>

            <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              PREMIUM
            </p>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-4xl font-black">2 997</span>

              <span className="pb-1 text-sm text-zinc-500">
                FCFA / mois
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Une formule sans limite de candidatures pour les
              candidats qui souhaitent multiplier leurs opportunités.
            </p>

            <div className="my-7 h-px bg-white/10" />

            <ul className="space-y-4 text-sm text-zinc-300">
              <li className="flex gap-3">
                <span className="text-[#ea580c]">✓</span>
                <span>Candidatures illimitées</span>
              </li>

              <li className="flex gap-3">
                <span className="text-[#ea580c]">✓</span>
                <span>Accès aux offres publiées</span>
              </li>

              <li className="flex gap-3">
                <span className="text-[#ea580c]">✓</span>
                <span>Candidatures envoyées via WhatsApp</span>
              </li>
            </ul>

            {user ? (
              <SoleasPayButton plan="PREMIUM" />
            ) : (
              <Link
                href="/login"
                className="mt-8 block rounded-xl bg-[#ea580c] px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#f97316]"
              >
                Se connecter pour s'abonner
              </Link>
            )}
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-[#111111] px-6 py-5 text-center">
          <p className="text-sm leading-6 text-zinc-400">
            Le paiement est effectué de manière sécurisée avec
            SoleasPay. Après confirmation du paiement, votre
            abonnement est automatiquement activé.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/jobs"
            className="text-sm font-semibold text-zinc-500 transition hover:text-white"
          >
            ← Voir les offres d'emploi
          </Link>
        </div>
      </section>
    </main>
  );
}