import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ApplyButton from "@/components/jobs/ApplyButton";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "CANDIDATE") {
    redirect("/jobs");
  }

  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: {
      id,
    },
  });

  if (!job || job.status !== "PUBLISHED") {
    redirect("/jobs");
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-black/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-black">
            Job<span className="text-[#ea580c]">Connect</span>
          </Link>

          <Link
            href={`/jobs/${job.id}`}
            className="text-sm font-semibold text-zinc-400 hover:text-white"
          >
            ← Retour à l'offre
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ea580c]">
            Candidature
          </p>

          <h1 className="mt-3 text-3xl font-black">
            {job.title}
          </h1>

          <p className="mt-2 text-zinc-400">
            {job.companyName}
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="text-sm text-zinc-400">
              Votre candidature sera envoyée directement à JobConnect via
              WhatsApp avec vos informations et les détails de cette offre.
            </p>
          </div>

          <div className="mt-8">
            <ApplyButton jobId={job.id} />
          </div>
        </div>
      </section>
    </main>
  );
}