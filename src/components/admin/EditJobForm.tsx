"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type Job = {
  id: string;
  title: string;
  description: string;
  companyName: string;
  companyLogo: string | null;
  location: string | null;
  contractType: string | null;
  salary: string | null;
  experience: string | null;
  education: string | null;
  skills: string | null;
  applicationInfo: string | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  categoryId: string | null;
  expiresAt: string | null;
};

export default function EditJobForm({
  job,
  categories,
}: {
  job: Job;
  categories: Category[];
}) {
  const router = useRouter();

  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);
  const [companyName, setCompanyName] = useState(job.companyName);
  const [companyLogo, setCompanyLogo] = useState(job.companyLogo ?? "");
  const [location, setLocation] = useState(job.location ?? "");
  const [contractType, setContractType] = useState(
    job.contractType ?? ""
  );
  const [salary, setSalary] = useState(job.salary ?? "");
  const [experience, setExperience] = useState(job.experience ?? "");
  const [education, setEducation] = useState(job.education ?? "");
  const [skills, setSkills] = useState(job.skills ?? "");
  const [applicationInfo, setApplicationInfo] = useState(
    job.applicationInfo ?? ""
  );
  const [categoryId, setCategoryId] = useState(job.categoryId ?? "");
  const [status, setStatus] = useState(job.status);
  const [expiresAt, setExpiresAt] = useState(
    job.expiresAt
      ? new Date(job.expiresAt).toISOString().slice(0, 16)
      : ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!categoryId) {
      setError("Veuillez sélectionner une catégorie.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          companyName,
          companyLogo: companyLogo || null,
          location: location || null,
          contractType: contractType || null,
          salary: salary || null,
          experience: experience || null,
          education: education || null,
          skills: skills || null,
          applicationInfo: applicationInfo || null,
          categoryId,
          status,
          expiresAt: expiresAt || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Impossible de modifier l'offre."
        );
      }

      router.push("/admin/jobs");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-[#111111] p-6 md:p-8"
    >
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-zinc-300">
            Titre du poste *
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-[#ea580c]"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-zinc-300">
            Entreprise *
          </label>

          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-[#ea580c]"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-zinc-300">
            Catégorie *
          </label>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ea580c]"
          >
            <option value="">Sélectionner une catégorie</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-zinc-300">
            Localisation
          </label>

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex : Lomé, Togo"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ea580c]"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-zinc-300">
            Type de contrat
          </label>

          <input
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
            placeholder="Ex : CDI, CDD, Stage..."
            className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ea580c]"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-zinc-300">
            Salaire
          </label>

          <input
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="Ex : 150 000 FCFA / mois"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ea580c]"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-zinc-300">
            Expérience
          </label>

          <input
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Ex : 2 ans"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ea580c]"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-zinc-300">
            Niveau d'étude
          </label>

          <input
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="Ex : Bac+3"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ea580c]"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-zinc-300">
            Logo de l'entreprise
          </label>

          <input
            value={companyLogo}
            onChange={(e) => setCompanyLogo(e.target.value)}
            placeholder="URL du logo"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ea580c]"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-zinc-300">
            Statut *
          </label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value as "DRAFT" | "PUBLISHED" | "CLOSED"
              )
            }
            className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ea580c]"
          >
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
            <option value="CLOSED">Fermé</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-zinc-300">
            Date d'expiration
          </label>

          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ea580c]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-zinc-300">
            Description du poste *
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={8}
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#ea580c]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-zinc-300">
            Compétences recherchées
          </label>

          <textarea
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            rows={5}
            placeholder="Ex : Excel, communication, gestion..."
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#ea580c]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-zinc-300">
            Informations pour postuler
          </label>

          <textarea
            value={applicationInfo}
            onChange={(e) => setApplicationInfo(e.target.value)}
            rows={5}
            placeholder="Informations complémentaires..."
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#ea580c]"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/jobs")}
          className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#ea580c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#f97316] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}