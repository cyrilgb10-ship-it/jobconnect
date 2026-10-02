"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Plan = "BASIC" | "PREMIUM";

type Props = {
  plan: Plan;
};

export default function SasPayButton({ plan }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/payment/saspay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Impossible de démarrer le paiement.",
        );
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.paymentId) {
        router.push(
          `/payment/saspay/checkout?paymentId=${encodeURIComponent(
            data.paymentId,
          )}`,
        );
        return;
      }

      throw new Error("Réponse de paiement invalide.");
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

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="w-full rounded-xl bg-[#ea580c] px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#f97316] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Préparation du paiement..."
          : `Payer ${plan === "BASIC" ? "999" : "2 997"} FCFA`}
      </button>

      {error ? (
        <p className="mt-3 text-center text-sm text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}