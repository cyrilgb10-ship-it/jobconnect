"use client";

import { useState } from "react";

const WHATSAPP_NUMBER = "22890801228";

type Plan = "BASIC" | "PREMIUM";

export default function SubscribeWhatsAppButton({
  plan,
  firstName,
  lastName,
  email,
}: {
  plan: Plan;
  firstName: string;
  lastName: string;
  email: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    try {
      setLoading(true);

      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Impossible de créer la demande d'abonnement."
        );
      }

      const planName =
        plan === "BASIC"
          ? "BASIC - 1 500 FCFA/mois"
          : "PREMIUM - 3 000 FCFA/mois";

      const message = `Bonjour JobConnect,

Je souhaite souscrire au forfait ${planName}.

Mes informations :

Nom : ${lastName}
Prénom : ${firstName}
Email : ${email}

Ma demande d'abonnement a été enregistrée sur JobConnect.

Merci de m'indiquer la procédure pour effectuer le paiement et activer mon abonnement.`;

      const whatsappUrl =
        `https://wa.me/${WHATSAPP_NUMBER}?text=` +
        encodeURIComponent(message);

      window.open(whatsappUrl, "_blank");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSubscribe}
      disabled={loading}
      className="mt-8 block w-full rounded-xl bg-[#ea580c] px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#f97316] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Préparation..." : "S'abonner via WhatsApp"}
    </button>
  );
}