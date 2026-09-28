"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);

    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-[#ea580c]/40 hover:text-white disabled:opacity-50"
    >
      {loading ? "..." : "Déconnexion"}
    </button>
  );
}