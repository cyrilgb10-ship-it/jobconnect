import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CANDIDATE") {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-black/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-black tracking-tight"
          >
            Job<span className="text-[#ea580c]">Connect</span>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            ← Espace candidat
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ea580c]">
          Espace candidat
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Mon profil
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Complétez votre profil pour présenter votre candidature
          professionnellement.
        </p>

        <div className="mt-8">
          <ProfileForm
            user={{
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              city: user.city,
              photo: user.photo,
            }}
            profile={user.profile}
          />
        </div>
      </section>
    </main>
  );
}