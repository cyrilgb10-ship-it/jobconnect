import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminApplicationsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const applications = await prisma.application.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          city: true,
        },
      },
      job: {
        select: {
          title: true,
          companyName: true,
          location: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-black/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/admin" className="text-xl font-black tracking-tight">
            Job<span className="text-[#ea580c]">Connect</span>
            <span className="ml-2 text-sm font-semibold text-zinc-500">
              ADMIN
            </span>
          </Link>

          <Link
            href="/admin"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ea580c]">
          Administration
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Candidatures
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Consultez les candidatures envoyées par les candidats.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-zinc-400">
            Total des candidatures :{" "}
            <span className="font-bold text-white">
              {applications.length}
            </span>
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          {applications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl">📩</div>

              <h2 className="mt-4 text-lg font-black">
                Aucune candidature
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Les candidatures apparaîtront ici dès qu'un candidat
                postulera.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="p-6 transition hover:bg-white/[0.02]"
                >
                  <div className="grid gap-6 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
                    {/* CANDIDAT */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
                        Candidat
                      </p>

                      <h2 className="mt-2 text-lg font-black">
                        {application.user.firstName}{" "}
                        {application.user.lastName}
                      </h2>

                      <p className="mt-1 text-sm text-zinc-400">
                        {application.user.email}
                      </p>

                      {application.user.phone && (
                        <p className="mt-1 text-sm text-zinc-500">
                          {application.user.phone}
                        </p>
                      )}

                      {application.user.city && (
                        <p className="mt-1 text-sm text-zinc-500">
                          {application.user.city}
                        </p>
                      )}
                    </div>

                    {/* OFFRE */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
                        Offre
                      </p>

                      <h3 className="mt-2 font-bold">
                        {application.job.title}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-400">
                        {application.job.companyName}
                      </p>

                      {application.job.location && (
                        <p className="mt-1 text-sm text-zinc-500">
                          {application.job.location}
                        </p>
                      )}
                    </div>

                    {/* STATUT + DATE */}
                    <div className="lg:text-right">
                      <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-300">
                        {getStatusLabel(application.status)}
                      </span>

                      <p className="mt-3 text-xs text-zinc-600">
                        {new Date(
                          application.createdAt
                        ).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>

                      {application.whatsappSent && (
                        <p className="mt-2 text-xs font-semibold text-green-500">
                          ✓ WhatsApp envoyé
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
      return "En cours";

    case "ACCEPTED":
      return "Acceptée";

    case "REJECTED":
      return "Refusée";

    default:
      return status;
  }
}