"use client";

import { useState } from "react";

type Plan = "BASIC" | "PREMIUM";

export default function SoleasPayButton({
  plan,
}: {
  plan: Plan;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    try {
      setLoading(true);

      const response = await fetch("/api/payment/soleaspay", {
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
          data.message || "Impossible de préparer le paiement.",
        );
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue.",
      );

      setLoading(false);
    }
  }

  const price = plan === "BASIC" ? "999" : "2 997";

  return (
    <button
      type="button"
      onClick={handleSubscribe}
      disabled={loading}
      className="mt-8 block w-full rounded-xl bg-[#ea580c] px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#f97316] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading
        ? "Préparation du paiement..."
        : `Payer ${price} FCFA`}
    </button>
  );
}