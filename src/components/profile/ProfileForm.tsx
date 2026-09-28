"use client";

import { FormEvent, useState } from "react";

type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  city: string | null;
  photo: string | null;
};

type ProfileData = {
  bio: string | null;
  cvUrl: string | null;
  skills: string | null;
  experience: string | null;
  education: string | null;
  availability: string | null;
} | null;

export default function ProfileForm({
  user,
  profile,
}: {
  user: UserData;
  profile: ProfileData;
}) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [city, setCity] = useState(user.city ?? "");
  const [photo, setPhoto] = useState(user.photo ?? "");

  const [bio, setBio] = useState(profile?.bio ?? "");
  const [cvUrl, setCvUrl] = useState(profile?.cvUrl ?? "");
  const [skills, setSkills] = useState(profile?.skills ?? "");
  const [experience, setExperience] = useState(
    profile?.experience ?? ""
  );
  const [education, setEducation] = useState(
    profile?.education ?? ""
  );
  const [availability, setAvailability] = useState(
    profile?.availability ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          city,
          photo,
          bio,
          cvUrl,
          skills,
          experience,
          education,
          availability,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Impossible de mettre à jour le profil."
        );
      }

      setMessage("Votre profil a été mis à jour avec succès.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations personnelles */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ea580c]">
            Informations personnelles
          </p>

          <h2 className="mt-2 text-xl font-black">
            Vos informations
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Ces informations seront utilisées lors de vos candidatures.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Prénom"
            value={firstName}
            onChange={setFirstName}
            required
          />

          <Field
            label="Nom"
            value={lastName}
            onChange={setLastName}
            required
          />

          <Field
            label="Email"
            value={email}
            disabled
          />

          <Field
            label="Téléphone"
            value={phone}
            onChange={setPhone}
            placeholder="+228 ..."
          />

          <Field
            label="Ville"
            value={city}
            onChange={setCity}
            placeholder="Lomé"
          />

          <Field
            label="Photo de profil"
            value={photo}
            onChange={setPhoto}
            placeholder="URL de votre photo"
          />
        </div>
      </section>

      {/* Profil professionnel */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ea580c]">
            Profil professionnel
          </p>

          <h2 className="mt-2 text-xl font-black">
            Présentez votre profil
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Ces informations permettent aux recruteurs de mieux
            connaître votre profil.
          </p>
        </div>

        <div className="space-y-5">
          <TextArea
            label="Présentation"
            value={bio}
            onChange={setBio}
            placeholder="Présentez-vous en quelques lignes..."
          />

          <TextArea
            label="Compétences"
            value={skills}
            onChange={setSkills}
            placeholder="Exemple : Marketing digital, Excel, Vente, Photoshop..."
          />

          <TextArea
            label="Expérience professionnelle"
            value={experience}
            onChange={setExperience}
            placeholder="Décrivez vos expériences professionnelles..."
          />

          <TextArea
            label="Formation"
            value={education}
            onChange={setEducation}
            placeholder="Indiquez vos diplômes et formations..."
          />

          <TextArea
            label="Disponibilité"
            value={availability}
            onChange={setAvailability}
            placeholder="Exemple : Disponible immédiatement"
          />

          <Field
            label="Lien vers votre CV"
            value={cvUrl}
            onChange={setCvUrl}
            placeholder="https://..."
          />
        </div>
      </section>

      {/* Messages */}
      {message && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm font-semibold text-green-500">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
          {error}
        </div>
      )}

      {/* Bouton */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#ea580c] px-6 py-4 text-sm font-black text-white transition hover:bg-[#f97316] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Enregistrer mon profil"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-zinc-300">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ea580c]/60 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-zinc-300">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ea580c]/60"
      />
    </div>
  );
}