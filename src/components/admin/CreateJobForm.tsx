"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type Props = {
  categories: Category[];
};

export default function CreateJobForm({ categories }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    companyName: "",
    companyLogo: "",
    location: "",
    contractType: "",
    salary: "",
    experience: "",
    education: "",
    skills: "",
    description: "",
    applicationInfo: "",
    categoryId: "",
    expiresAt: "",
    status: "DRAFT",
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!form.categoryId) {
      setError("Veuillez sélectionner une catégorie.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Impossible de créer l'offre."
        );
        return;
      }

      router.push("/admin/jobs");
      router.refresh();
    } catch {
      setError(
        "Une erreur est survenue. Vérifiez votre connexion."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-[#111111] p-6">
        <h2 className="text-lg font-bold">
          Informations principales
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Les informations visibles directement par les candidats.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field
            label="Titre du poste"
            required
            value={form.title}
            onChange={(value) =>
              updateField("title", value)
            }
            placeholder="Ex. Développeur Full Stack"
          />

          <Field
            label="Entreprise"
            required
            value={form.companyName}
            onChange={(value) =>
              updateField("companyName", value)
            }
            placeholder="Nom de l'entreprise"
          />

          <Field
            label="Logo de l'entreprise"
            value={form.companyLogo}
            onChange={(value) =>
              updateField("companyLogo", value)
            }
            placeholder="URL du logo (optionnel)"
          />

          <Field
            label="Lieu"
            value={form.location}
            onChange={(value) =>
              updateField("location", value)
            }
            placeholder="Ex. Lomé, Togo"
          />

          <SelectField
            label="Catégorie"
            required
            value={form.categoryId}
            onChange={(value) =>
              updateField("categoryId", value)
            }
            options={[
              {
                value: "",
                label: "Sélectionnez une catégorie",
              },
              ...categories.map((category) => ({
                value: category.id,
                label: category.name,
              })),
            ]}
          />

          <Field
            label="Type de contrat"
            value={form.contractType}
            onChange={(value) =>
              updateField("contractType", value)
            }
            placeholder="Ex. CDI, CDD, Stage, Freelance"
          />

          <Field
            label="Salaire"
            value={form.salary}
            onChange={(value) =>
              updateField("salary", value)
            }
            placeholder="Ex. 150 000 - 250 000 FCFA"
          />

          <Field
            label="Expérience"
            value={form.experience}
            onChange={(value) =>
              updateField("experience", value)
            }
            placeholder="Ex. 2 ans d'expérience"
          />

          <Field
            label="Niveau d'étude"
            value={form.education}
            onChange={(value) =>
              updateField("education", value)
            }
            placeholder="Ex. Bac+3 minimum"
          />

          <Field
            label="Compétences"
            value={form.skills}
            onChange={(value) =>
              updateField("skills", value)
            }
            placeholder="Ex. React, Node.js, PostgreSQL"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111111] p-6">
        <h2 className="text-lg font-bold">
          Description du poste
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Décrivez précisément le poste et les responsabilités.
        </p>

        <textarea
          required
          value={form.description}
          onChange={(event) =>
            updateField(
              "description",
              event.target.value
            )
          }
          rows={10}
          placeholder="Décrivez le poste, les missions, les responsabilités..."
          className="mt-6 w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ea580c]/60"
        />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111111] p-6">
        <h2 className="text-lg font-bold">
          Candidature
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Indiquez aux candidats comment ils doivent postuler.
        </p>

        <textarea
          value={form.applicationInfo}
          onChange={(event) =>
            updateField(
              "applicationInfo",
              event.target.value
            )
          }
          rows={5}
          placeholder="Ex. Les candidats doivent postuler via WhatsApp..."
          className="mt-6 w-full resize-y rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ea580c]/60"
        />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111111] p-6">
        <h2 className="text-lg font-bold">
          Publication
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <SelectField
            label="Statut"
            required
            value={form.status}
            onChange={(value) =>
              updateField("status", value)
            }
            options={[
              {
                value: "DRAFT",
                label: "Brouillon",
              },
              {
                value: "PUBLISHED",
                label: "Publier immédiatement",
              },
              {
                value: "CLOSED",
                label: "Fermée",
              },
            ]}
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Date d'expiration
            </label>

            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) =>
                updateField(
                  "expiresAt",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ea580c]/60"
            />

            <p className="mt-2 text-xs text-zinc-600">
              Laisser vide pour aucune date d'expiration.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/jobs")}
          className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={loading || categories.length === 0}
          className="rounded-xl bg-[#ea580c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#f97316] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer l'offre"}
        </button>
      </div>

      {categories.length === 0 && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
          Aucune catégorie n'existe encore. Créez d'abord une
          catégorie dans l'administration.
        </div>
      )}
    </form>
  );
}

function Field({
  label,
  required = false,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-zinc-300">
        {label}

        {required && (
          <span className="ml-1 text-[#ea580c]">
            *
          </span>
        )}
      </label>

      <input
        required={required}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ea580c]/60"
      />
    </div>
  );
}

function SelectField({
  label,
  required = false,
  value,
  onChange,
  options,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-zinc-300">
        {label}

        {required && (
          <span className="ml-1 text-[#ea580c]">
            *
          </span>
        )}
      </label>

      <select
        required={required}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ea580c]/60"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
