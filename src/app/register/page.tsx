"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Impossible de créer le compte.");
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Une erreur réseau est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] px-5 py-10 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ea580c] font-black">
            J
          </div>

          <span className="text-2xl font-black">
            Job<span className="text-[#f97316]">Connect</span>
          </span>
        </Link>

        <div className="mt-10 rounded-3xl border border-white/10 bg-[#111111] p-7 shadow-2xl">
          <h1 className="text-2xl font-black">Créer votre compte</h1>

          <p className="mt-2 text-sm text-zinc-500">
            Créez gratuitement votre compte candidat.
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="Prénom"
                className="h-12 rounded-xl border border-white/10 bg-[#181818] px-4 text-sm outline-none transition focus:border-[#ea580c]"
              />

              <input
                required
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Nom"
                className="h-12 rounded-xl border border-white/10 bg-[#181818] px-4 text-sm outline-none transition focus:border-[#ea580c]"
              />
            </div>

            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="Adresse email"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#181818] px-4 text-sm outline-none transition focus:border-[#ea580c]"
            />

            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="Téléphone"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#181818] px-4 text-sm outline-none transition focus:border-[#ea580c]"
            />

            <input
              required
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="Mot de passe"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#181818] px-4 text-sm outline-none transition focus:border-[#ea580c]"
            />

            <input
              required
              type="password"
              minLength={6}
              value={form.confirmPassword}
              onChange={(e) =>
                updateField("confirmPassword", e.target.value)
              }
              placeholder="Confirmer le mot de passe"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#181818] px-4 text-sm outline-none transition focus:border-[#ea580c]"
            />

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#ea580c] text-sm font-black transition hover:bg-[#f97316] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#f97316] hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}