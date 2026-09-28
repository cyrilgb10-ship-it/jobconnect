import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MyApplicationsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CANDIDATE") {
    redirect("/login");
  }

  const applications = await prisma.application.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          companyName: true,
          companyLogo: true,
          location: true,
          contractType: true,
          salary: true,
          status: true,
          expiresAt: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/dashboard"
            className="text-xl font-black tracking-tight"
          >
            Job<span className="text-[#ea580c]">Connect</span>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ea580c]">
            Espace candidat
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight">
            Mes candidatures
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Retrouvez ici toutes les offres auxquelles vous avez postulé.
          </p>
        </div>

        {/* Total */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-zinc-400">
            Total des candidatures
          </p>

          <p className="mt-2 text-3xl font-black text-white">
            {applications.length}
          </p>
        </div>

        {/* Applications */}
        <div className="mt-6">
          {applications.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <div className="text-5xl">📩</div>

              <h2 className="mt-5 text-xl font-black">
                Aucune candidature
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Vous n'avez encore postulé à aucune offre. Consultez les
                offres disponibles et trouvez votre prochaine opportunité.
              </p>

              <Link
                href="/jobs"
                className="mt-6 inline-flex rounded-xl bg-[#ea580c] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#f97316]"
              >
                Voir les offres
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const jobIsAvailable =
                  application.job.status === "PUBLISHED" &&
                  (!application.job.expiresAt ||
                    application.job.expiresAt > new Date());

                return (
                  <article
                    key={application.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      {/* Job information */}
                      <div className="flex gap-4">
                        {application.job.companyLogo ? (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                            <img
                              src={application.job.companyLogo}
                              alt={application.job.companyName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#ea580c]/10 text-xl font-black text-[#ea580c]">
                            {application.job.companyName
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div>
                          <h2 className="text-lg font-black">
                            {application.job.title}
                          </h2>

                          <p className="mt-1 text-sm font-semibold text-zinc-300">
                            {application.job.companyName}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {application.job.location && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                                📍 {application.job.location}
                              </span>
                            )}

                            {application.job.contractType && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                                💼 {application.job.contractType}
                              </span>
                            )}

                            {application.job.salary && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                                💰 {application.job.salary}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status and date */}
                      <div className="lg:min-w-[220px] lg:text-right">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                            application.status
                          )}`}
                        >
                          {getStatusLabel(application.status)}
                        </span>

                        <p className="mt-3 text-xs text-zinc-500">
                          Candidature envoyée le{" "}
                          {new Date(
                            application.createdAt
                          ).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>

                        {application.whatsappSent && (
                          <p className="mt-2 text-xs font-semibold text-green-500">
                            ✓ Envoyée via WhatsApp
                          </p>
                        )}

                        {jobIsAvailable && (
                          <Link
                            href={`/jobs/${application.job.id}`}
                            className="mt-4 inline-flex rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:border-[#ea580c]/50 hover:text-white"
                          >
                            Voir l'offre
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "En attente";

    case "REVIEWING":
      return "En cours d'examen";

    case "ACCEPTED":
      return "Acceptée";

    case "REJECTED":
      return "Refusée";

    default:
      return status;
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "PENDING":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-500";

    case "REVIEWING":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";

    case "ACCEPTED":
      return "border-green-500/20 bg-green-500/10 text-green-500";

    case "REJECTED":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    default:
      return "border-white/10 bg-white/5 text-zinc-400";
  }
}