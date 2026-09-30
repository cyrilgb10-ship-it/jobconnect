import { prisma } from "@/lib/prisma";
import Link from "next/link";

type SoleasPayData = {
  transaction_reference?: string;
  reference?: string;
  invoice_reference?: string;
  provider_reference?: string;
  status?: string;
  success?: boolean;
  operation?: string;
  channel?: string;
  amount?: number;
  currency?: string;
};

function decodePaymentData(value: string | undefined): SoleasPayData | null {
  if (!value) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(value);
    return JSON.parse(decoded) as SoleasPayData;
  } catch {
    return null;
  }
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    soleaspay_data?: string;
  }>;
}) {
  const params = await searchParams;

  const paymentData = decodePaymentData(params.soleaspay_data);

  if (!paymentData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-zinc-900 p-8 text-center text-white">
          <h1 className="text-2xl font-bold">Paiement introuvable</h1>

          <p className="mt-3 text-zinc-400">
            Les informations retournées par SoleasPay sont invalides.
          </p>

          <Link
            href="/subscriptions"
            className="mt-6 inline-block rounded-xl bg-orange-600 px-5 py-3 font-semibold"
          >
            Retour aux abonnements
          </Link>
        </div>
      </main>
    );
  }

  const orderId =
    paymentData.invoice_reference ||
    paymentData.reference;

  const transactionReference =
    paymentData.transaction_reference ||
    paymentData.reference;

  if (!orderId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-zinc-900 p-8 text-center text-white">
          <h1 className="text-2xl font-bold">Référence manquante</h1>

          <p className="mt-3 text-zinc-400">
            Impossible d'identifier cette transaction.
          </p>

          <Link
            href="/subscriptions"
            className="mt-6 inline-block rounded-xl bg-orange-600 px-5 py-3 font-semibold"
          >
            Retour aux abonnements
          </Link>
        </div>
      </main>
    );
  }

  const payment = await prisma.payment.findUnique({
    where: {
      orderId,
    },
    include: {
      subscription: true,
    },
  });

  if (!payment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-zinc-900 p-8 text-center text-white">
          <h1 className="text-2xl font-bold">Paiement non reconnu</h1>

          <p className="mt-3 text-zinc-400">
            Cette commande n'existe pas dans JobConnect.
          </p>

          <Link
            href="/subscriptions"
            className="mt-6 inline-block rounded-xl bg-orange-600 px-5 py-3 font-semibold"
          >
            Retour aux abonnements
          </Link>
        </div>
      </main>
    );
  }

  const returnedAmount = Number(paymentData.amount);
  const returnedCurrency = paymentData.currency;

  const validAmount =
    Number.isFinite(returnedAmount) &&
    returnedAmount === payment.amount;

  const validCurrency =
    returnedCurrency === payment.currency;

  const successfulStatus =
    paymentData.status === "SUCCESS" ||
    paymentData.status === "COMPLETED";

  const successful =
    paymentData.success === true ||
    successfulStatus;

  if (!successful || !validAmount || !validCurrency) {
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "FAILED",
        transactionReference,
        invoiceReference: paymentData.invoice_reference,
        providerReference: paymentData.provider_reference,
      },
    });

    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-zinc-900 p-8 text-center text-white">
          <div className="text-5xl">✕</div>

          <h1 className="mt-5 text-2xl font-bold">
            Paiement non confirmé
          </h1>

          <p className="mt-3 text-zinc-400">
            Le paiement n'a pas pu être validé par JobConnect.
          </p>

          <Link
            href="/subscriptions"
            className="mt-6 inline-block rounded-xl bg-orange-600 px-5 py-3 font-semibold"
          >
            Retour aux abonnements
          </Link>
        </div>
      </main>
    );
  }

  /*
   * Si le paiement est déjà traité, on ne recrée pas
   * une nouvelle activation.
   */
  if (payment.status !== "SUCCESS" && payment.status !== "COMPLETED") {
    const startDate = new Date();

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    await prisma.$transaction([
      prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status:
            paymentData.status === "COMPLETED"
              ? "COMPLETED"
              : "SUCCESS",
          transactionReference,
          invoiceReference: paymentData.invoice_reference,
          providerReference: paymentData.provider_reference,
        },
      }),

      prisma.subscription.updateMany({
        where: {
          userId: payment.userId,
          status: "ACTIVE",
          id: {
            not: payment.subscriptionId,
          },
        },
        data: {
          status: "EXPIRED",
        },
      }),

      prisma.subscription.update({
        where: {
          id: payment.subscriptionId,
        },
        data: {
          status: "ACTIVE",
          startDate,
          endDate,
        },
      }),
    ]);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-lg rounded-2xl border border-green-500/20 bg-zinc-900 p-8 text-center text-white">
        <div className="text-5xl">✓</div>

        <h1 className="mt-5 text-3xl font-bold">
          Paiement réussi !
        </h1>

        <p className="mt-3 text-zinc-400">
          Votre abonnement JobConnect est maintenant actif.
        </p>

        <div className="mt-6 rounded-xl bg-zinc-800 p-4 text-left">
          <p className="text-sm text-zinc-400">Abonnement</p>
          <p className="mt-1 font-bold">
            {payment.subscription.plan}
          </p>

          <p className="mt-4 text-sm text-zinc-400">Montant</p>
          <p className="mt-1 font-bold">
            {payment.amount.toLocaleString("fr-FR")} FCFA
          </p>

          <p className="mt-4 text-sm text-zinc-400">
            Référence transaction
          </p>
          <p className="mt-1 break-all font-mono text-sm">
            {transactionReference}
          </p>
        </div>

        <Link
          href="/dashboard"
          className="mt-6 inline-block w-full rounded-xl bg-orange-600 px-5 py-3 font-semibold transition hover:bg-orange-500"
        >
          Accéder à mon espace
        </Link>
      </div>
    </main>
  );
}