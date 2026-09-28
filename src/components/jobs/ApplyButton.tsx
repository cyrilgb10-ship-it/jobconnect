"use client";

import { useState } from "react";

export default function ApplyButton({
  jobId,
}: {
  jobId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleApply() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Impossible d'envoyer la candidature."
        );
      }

      if (!data.whatsappUrl) {
        throw new Error(
          "Le lien WhatsApp n'a pas pu être généré."
        );
      }

      window.location.href = data.whatsappUrl;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleApply}
        disabled={loading}
        className="w-full rounded-xl bg-[#ea580c] px-5 py-4 text-center text-sm font-black text-white transition hover:bg-[#f97316] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Préparation de votre candidature..."
          : "Postuler via WhatsApp"}
      </button>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}