"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Payment = {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  subscription: {
    plan: "BASIC" | "PREMIUM";
    applicationsLimit: number | null;
  };
};

type Network = "moov_tg" | "togocel";

function SasPayCheckout() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");

  const [payment, setPayment] = useState<Payment | null>(null);
  const [network, setNetwork] = useState<Network>("moov_tg");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      setError("Identifiant du paiement manquant.");
      setLoading(false);
      return;
    }

    const currentPaymentId = paymentId;

    async function loadPayment() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/payment/saspay?paymentId=${encodeURIComponent(
            currentPaymentId,
          )}`,
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Impossible de récupérer les informations du paiement.",
          );
        }

        setPayment(data.payment);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadPayment();
  }, [paymentId]);

  async function handlePayment() {
    if (!paymentId) {
      setError("Identifiant du paiement manquant.");
      return;
    }

    if (!phone.trim()) {
      setError("Veuillez entrer votre numéro de téléphone.");
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setSuccess(false);

      const response = await fetch("/api/payment/saspay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          network,
          phone: phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Impossible de démarrer le paiement.",
        );
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue pendant le paiement.",
      );
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-gray-300">
            Chargement du paiement...
          </p>
        </div>
      </main>
    );
  }

  if (error && !payment) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-zinc-950 p-8 text-center">
          <h1 className="mb-3 text-2xl font-bold">
            Paiement
          </h1>

          <p className="text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  if (!payment) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-gray-300">
            Paiement introuvable.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Paiement de l&apos;abonnement
          </h1>

          <p className="mt-2 text-gray-400">
            Finalisez votre abonnement JobConnect avec SasPay.
          </p>
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-zinc-950 p-6 shadow-2xl">
          <div className="mb-6 rounded-xl bg-orange-500/10 p-5">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">
                Formule
              </span>

              <span className="font-bold text-orange-400">
                {payment.subscription.plan}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-gray-400">
                Montant
              </span>

              <span className="text-2xl font-bold">
                {payment.amount.toLocaleString("fr-FR")}{" "}
                {payment.currency}
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="network"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Opérateur
              </label>

              <select
                id="network"
                value={network}
                onChange={(event) =>
                  setNetwork(event.target.value as Network)
                }
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-orange-500"
                disabled={processing}
              >
                <option value="moov_tg">
                  Moov Money Togo
                </option>

                <option value="togocel">
                  Togocel Money
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Numéro Mobile Money
              </label>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="Ex : 90 00 00 00"
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-orange-500"
                disabled={processing}
              />

              <p className="mt-2 text-xs text-gray-500">
                Entrez le numéro Mobile Money utilisé pour effectuer
                le paiement.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-4 text-sm text-green-400">
                <p className="font-semibold">
                  Paiement lancé avec succès.
                </p>

                <p className="mt-1 text-green-300/80">
                  Vérifiez votre téléphone et confirmez le paiement
                  Mobile Money si une demande apparaît.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handlePayment}
              disabled={processing}
              className="w-full rounded-xl bg-orange-600 px-5 py-3.5 font-bold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing
                ? "Paiement en cours..."
                : `Payer ${payment.amount.toLocaleString(
                    "fr-FR",
                  )} ${payment.currency}`}
            </button>
          </div>

          <div className="mt-6 border-t border-zinc-800 pt-5 text-center text-xs text-gray-500">
            Paiement sécurisé par SasPay.
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SasPayCheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black px-6 py-16 text-white">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-gray-300">
              Chargement du paiement...
            </p>
          </div>
        </main>
      }
    >
      <SasPayCheckout />
    </Suspense>
  );
}
