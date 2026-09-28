"use client";

import { useState } from "react";

type Subscription = {
  id: string;
  plan: "BASIC" | "PREMIUM";
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  price: number;
  applicationsLimit: number | null;
  applicationsUsed: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
};

export default function SubscriptionsManager({
  initialSubscriptions,
}: {
  initialSubscriptions: Subscription[];
}) {
  const [subscriptions, setSubscriptions] =
    useState(initialSubscriptions);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAction(
    id: string,
    action: "ACTIVATE" | "CANCEL" | "EXPIRE"
  ) {
    const labels = {
      ACTIVATE: "activer",
      CANCEL: "annuler",
      EXPIRE: "faire expirer",
    };

    const confirmed = window.confirm(
      `Voulez-vous vraiment ${labels[action]} cet abonnement ?`
    );

    if (!confirmed) return;

    try {
      setLoadingId(id);

      const response = await fetch(`/api/admin/subscriptions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Une erreur est survenue."
        );
      }

      setSubscriptions((current) =>
        current.map((subscription) =>
          subscription.id === id
            ? {
                ...subscription,
                status: data.status,
                startDate: data.startDate
                  ? new Date(data.startDate).toISOString()
                  : null,
                endDate: data.endDate
                  ? new Date(data.endDate).toISOString()
                  : null,
                applicationsUsed: data.applicationsUsed ?? 0,
                applicationsLimit: data.applicationsLimit ?? null,
              }
            : subscription
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoadingId(null);
    }
  }

  function formatDate(date: string | null) {
    if (!date) return "—";

    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
    }).format(new Date(date));
  }

  function statusStyle(status: Subscription["status"]) {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      case "EXPIRED":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "CANCELLED":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  }

  function statusLabel(status: Subscription["status"]) {
    switch (status) {
      case "ACTIVE":
        return "Actif";
      case "PENDING":
        return "En attente";
      case "EXPIRED":
        return "Expiré";
      case "CANCELLED":
        return "Annulé";
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
      {subscriptions.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl">
            €
          </div>

          <h2 className="mt-5 text-lg font-bold">
            Aucun abonnement
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Les demandes d'abonnement apparaîtront ici.
          </p>
        </div>
      ) : (
        <>
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="font-bold">
              Liste des abonnements
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {subscriptions.length} abonnement
              {subscriptions.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="divide-y divide-white/10">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="p-6 transition hover:bg-white/[0.02]"
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-bold">
                        {subscription.user.firstName}{" "}
                        {subscription.user.lastName}
                      </h3>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${statusStyle(
                          subscription.status
                        )}`}
                      >
                        {statusLabel(subscription.status)}
                      </span>

                      <span className="rounded-full border border-[#ea580c]/20 bg-[#ea580c]/10 px-3 py-1 text-xs font-bold text-[#fb923c]">
                        {subscription.plan}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-zinc-500 md:grid-cols-2">
                      <p>
                        <span className="text-zinc-600">Email :</span>{" "}
                        {subscription.user.email}
                      </p>

                      <p>
                        <span className="text-zinc-600">Téléphone :</span>{" "}
                        {subscription.user.phone || "Non renseigné"}
                      </p>

                      <p>
                        <span className="text-zinc-600">Prix :</span>{" "}
                        {subscription.price.toLocaleString("fr-FR")} FCFA
                      </p>

                      <p>
                        <span className="text-zinc-600">
                          Candidatures :
                        </span>{" "}
                        {subscription.plan === "PREMIUM"
                          ? `${subscription.applicationsUsed} / illimitées`
                          : `${subscription.applicationsUsed} / ${
                              subscription.applicationsLimit ?? 3
                            }`}
                      </p>

                      <p>
                        <span className="text-zinc-600">
                          Début :
                        </span>{" "}
                        {formatDate(subscription.startDate)}
                      </p>

                      <p>
                        <span className="text-zinc-600">
                          Fin :
                        </span>{" "}
                        {formatDate(subscription.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {subscription.status !== "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleAction(
                            subscription.id,
                            "ACTIVATE"
                          )
                        }
                        disabled={loadingId === subscription.id}
                        className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loadingId === subscription.id
                          ? "..."
                          : "Activer"}
                      </button>
                    )}

                    {subscription.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleAction(
                            subscription.id,
                            "EXPIRE"
                          )
                        }
                        disabled={loadingId === subscription.id}
                        className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-2.5 text-sm font-bold text-yellow-400 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Expirer
                      </button>
                    )}

                    {subscription.status !== "CANCELLED" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleAction(
                            subscription.id,
                            "CANCEL"
                          )
                        }
                        disabled={loadingId === subscription.id}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}