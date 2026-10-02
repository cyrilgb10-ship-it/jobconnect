import Link from "next/link";

export default async function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-xl text-center">
        <div className="rounded-2xl border border-green-500/20 bg-zinc-950 p-8 shadow-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-3xl text-green-400">
            ✓
          </div>

          <h1 className="text-3xl font-bold">
            Paiement réussi
          </h1>

          <p className="mt-4 text-gray-400">
            Votre paiement SasPay a été effectué avec succès.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Votre abonnement sera activé automatiquement après
            confirmation du paiement.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-500"
            >
              Aller à mon espace
            </Link>

            <Link
              href="/jobs"
              className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-white transition hover:bg-zinc-900"
            >
              Voir les offres
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
