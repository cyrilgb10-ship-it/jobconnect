import { prisma } from "@/lib/prisma";

export default async function SoleasPayCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    paymentId?: string;
  }>;
}) {
  const params = await searchParams;

  if (!params.paymentId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Paiement introuvable
          </h1>

          <p className="mt-3 text-zinc-400">
            La référence du paiement est manquante.
          </p>
        </div>
      </main>
    );
  }

  const payment = await prisma.payment.findUnique({
    where: {
      id: params.paymentId,
    },
    include: {
      subscription: true,
    },
  });

  if (!payment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Paiement introuvable
          </h1>

          <p className="mt-3 text-zinc-400">
            Cette demande de paiement n'existe pas.
          </p>
        </div>
      </main>
    );
  }

  if (payment.status !== "PENDING") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Paiement déjà traité
          </h1>

          <p className="mt-3 text-zinc-400">
            Cette demande de paiement ne peut plus être utilisée.
          </p>
        </div>
      </main>
    );
  }

  const apiKey = process.env.SOLEASPAY_API_KEY;

  if (!apiKey) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Paiement indisponible
          </h1>

          <p className="mt-3 text-zinc-400">
            La configuration du paiement est indisponible.
          </p>
        </div>
      </main>
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const description =
    payment.subscription.plan === "BASIC"
      ? "Abonnement BASIC JobConnect"
      : "Abonnement PREMIUM JobConnect";

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-2xl font-black">
          J
        </div>

        <h1 className="mt-6 text-2xl font-black">
          Redirection vers SoleasPay
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Préparation sécurisée de votre paiement...
        </p>

        <div className="mt-6 rounded-2xl bg-zinc-800 p-4">
          <p className="text-sm text-zinc-500">
            Abonnement
          </p>

          <p className="mt-1 font-bold">
            {payment.subscription.plan}
          </p>

          <p className="mt-4 text-sm text-zinc-500">
            Montant
          </p>

          <p className="mt-1 font-bold">
            {payment.amount.toLocaleString("fr-FR")} FCFA
          </p>
        </div>

        <form
          id="soleaspay-form"
          method="POST"
          action="https://pay.soleaspay.com"
        >
          <input
            type="hidden"
            name="apiKey"
            value={apiKey}
          />

          <input
            type="hidden"
            name="amount"
            value={payment.amount}
          />

          <input
            type="hidden"
            name="currency"
            value={payment.currency}
          />

          <input
            type="hidden"
            name="orderId"
            value={payment.orderId}
          />

          <input
            type="hidden"
            name="description"
            value={description}
          />

          <input
            type="hidden"
            name="shopName"
            value="JobConnect"
          />

          <input
            type="hidden"
            name="successUrl"
            value={`${baseUrl}/payment/success`}
          />

          <input
            type="hidden"
            name="failureUrl"
            value={`${baseUrl}/payment/failed`}
          />

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-orange-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-500"
          >
            Continuer vers SoleasPay
          </button>
        </form>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(function () {
                document.getElementById("soleaspay-form")?.submit();
              }, 800);
            `,
          }}
        />
      </div>
    </main>
  );
}