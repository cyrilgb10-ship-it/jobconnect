"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registered = searchParams.get("registered") === "1";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Impossible de vous connecter.");
        return;
      }

      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
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
          <h1 className="text-2xl font-black">Se connecter</h1>

          <p className="mt-2 text-sm text-zinc-500">
            Accédez à votre espace JobConnect.
          </p>

          {registered && (
            <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              Votre compte a été créé. Vous pouvez maintenant vous connecter.
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse email"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#181818] px-4 text-sm outline-none transition focus:border-[#ea580c]"
            />

            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#181818] px-4 text-sm outline-none transition focus:border-[#ea580c]"
            />

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#ea580c] text-sm font-black transition hover:bg-[#f97316] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Vous n'avez pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#f97316] hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#ea580c]" />
        <p className="mt-4 text-sm text-zinc-500">
          Chargement...
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}