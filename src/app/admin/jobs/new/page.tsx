import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateJobForm from "@/components/admin/CreateJobForm";

export default async function NewJobPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-black/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/admin"
              className="text-xl font-black tracking-tight"
            >
              Job<span className="text-[#ea580c]">Connect</span>
            </Link>

            <p className="mt-1 text-sm text-zinc-500">
              Nouvelle offre
            </p>
          </div>

          <Link
            href="/admin/jobs"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            ← Retour aux offres
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#ea580c]">
            Administration
          </p>

          <h1 className="text-3xl font-black tracking-tight md:text-4xl">
            Créer une offre
          </h1>

          <p className="mt-3 text-zinc-400">
            Remplissez les informations de l'offre. Vous pourrez
            ensuite la publier ou la conserver comme brouillon.
          </p>
        </div>

        <CreateJobForm categories={categories} />
      </div>
    </main>
  );
}
