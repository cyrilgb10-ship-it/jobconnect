import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-zinc-900 p-8 text-center text-white">
        <div className="text-5xl">✕</div>

        <h1 className="mt-5 text-3xl font-bold">
          Paiement annulé
        </h1>

        <p className="mt-3 text-zinc-400">
          Le paiement n'a pas été finalisé. Aucun abonnement n'a été activé.
        </p>

        <Link
          href="/subscriptions"
          className="mt-6 inline-block w-full rounded-xl bg-orange-600 px-5 py-3 font-semibold transition hover:bg-orange-500"
        >
          Réessayer
        </Link>

        <Link
          href="/dashboard"
          className="mt-3 inline-block text-sm text-zinc-400 hover:text-white"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
}