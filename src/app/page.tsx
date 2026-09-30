import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080808]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ea580c] font-black">
              J
            </div>

            <span className="text-xl font-black">
              Job<span className="text-[#f97316]">Connect</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
            <Link href="#fonctionnement" className="hover:text-white">
              Comment ça marche
            </Link>

            <Link href="#avantages" className="hover:text-white">
              Fonctionnalités
            </Link>

            <Link href="#abonnements" className="hover:text-white">
              Abonnements
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden px-3 py-2 text-sm font-semibold text-zinc-400 hover:text-white sm:block"
            >
              Connexion
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-[#ea580c] px-4 py-2.5 text-sm font-bold hover:bg-[#f97316]"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[650px] w-[750px] -translate-x-1/2 rounded-full bg-[#ea580c]/10 blur-[150px]" />

        <div className="relative mx-auto max-w-5xl px-5 pb-28 pt-28 text-center sm:pt-36">
          <div className="mx-auto inline-flex rounded-full border border-[#ea580c]/30 bg-[#ea580c]/10 px-4 py-2 text-xs font-bold tracking-wide text-[#f97316]">
            PLATEFORME DE RECHERCHE D'EMPLOI
          </div>

          <h1 className="mt-7 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Trouvez votre prochaine
            <br />
            <span className="text-[#f97316]">
              opportunité professionnelle.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            JobConnect est une plateforme qui met en relation les candidats
            avec les opportunités professionnelles publiées sur la plateforme.
            Créez votre profil, consultez les offres et postulez simplement.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-xl bg-[#ea580c] px-7 py-4 text-sm font-black hover:bg-[#f97316]"
            >
              Créer mon compte
            </Link>

            <Link
              href="/jobs"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-bold text-zinc-300 hover:border-white/20 hover:text-white"
            >
              Découvrir les offres
            </Link>
          </div>
        </div>
      </section>

      {/* PRÉSENTATION */}
      <section className="border-y border-white/10 bg-[#0d0d0d]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
                JobConnect
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Une plateforme pensée pour les candidats.
              </h2>

              <p className="mt-5 leading-7 text-zinc-500">
                JobConnect vous permet de centraliser votre profil
                professionnel et d'accéder aux offres d'emploi publiées par
                les administrateurs de la plateforme.
              </p>

              <p className="mt-4 leading-7 text-zinc-500">
                Vous pouvez consulter les offres gratuitement. Pour envoyer
                une candidature, vous devez disposer d'un abonnement actif.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111111] p-7">
              <div className="space-y-5">
                <Info
                  title="Compte candidat"
                  text="Chaque nouveau compte est automatiquement créé comme candidat."
                />

                <Info
                  title="Profil professionnel"
                  text="Ajoutez vos informations, compétences, expérience, formation et CV."
                />

                <Info
                  title="Offres d'emploi"
                  text="Consultez les opportunités publiées par JobConnect."
                />

                <Info
                  title="Candidature"
                  text="Les candidatures sont envoyées directement via WhatsApp."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FONCTIONNEMENT */}
      <section id="fonctionnement">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
              Comment ça marche ?
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              De l'inscription à la candidature.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-4">
            <Step
              number="01"
              title="Inscrivez-vous"
              text="Créez gratuitement votre compte candidat."
            />

            <Step
              number="02"
              title="Complétez votre profil"
              text="Ajoutez votre parcours, vos compétences, votre expérience et votre CV."
            />

            <Step
              number="03"
              title="Activez un abonnement"
              text="Choisissez BASIC ou PREMIUM et effectuez votre paiement sécurisé avec SoleasPay."
            />

            <Step
              number="04"
              title="Postulez"
              text="Une fois votre abonnement activé, choisissez une offre et envoyez votre candidature via WhatsApp."
            />
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section
        id="avantages"
        className="border-y border-white/10 bg-[#0d0d0d]"
      >
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
              Fonctionnalités
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Tout ce qu'il vous faut pour postuler.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon="👤"
              title="Profil candidat"
              text="Présentez votre identité, votre ville, votre parcours et vos informations professionnelles."
            />

            <Feature
              icon="📄"
              title="CV"
              text="Ajoutez le lien de votre CV afin de compléter votre profil."
            />

            <Feature
              icon="💼"
              title="Offres d'emploi"
              text="Consultez les offres publiées dans différentes catégories professionnelles."
            />

            <Feature
              icon="📱"
              title="Candidature WhatsApp"
              text="Votre candidature est préparée et envoyée directement via WhatsApp."
            />

            <Feature
              icon="⭐"
              title="Favoris"
              text="Enregistrez les offres qui vous intéressent pour les retrouver facilement."
            />

            <Feature
              icon="📋"
              title="Mes candidatures"
              text="Retrouvez l'historique des offres auxquelles vous avez déjà postulé."
            />
          </div>
        </div>
      </section>

      {/* ABONNEMENTS */}
      <section id="abonnements">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
              Abonnements
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Deux formules, un objectif.
            </h2>

            <p className="mt-4 text-sm leading-7 text-zinc-500">
              La consultation des offres reste accessible. L'abonnement est
              nécessaire pour envoyer des candidatures.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            {/* BASIC */}
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-8">
              <p className="text-sm font-black text-zinc-400">
                BASIC
              </p>

              <div className="mt-4">
                <span className="text-5xl font-black">999</span>

                <span className="ml-2 text-sm text-zinc-500">
                  FCFA / mois
                </span>
              </div>

              <p className="mt-5 text-sm leading-6 text-zinc-500">
                Pour commencer votre recherche d'emploi et envoyer vos
                premières candidatures.
              </p>

              <div className="my-7 h-px bg-white/10" />

              <ul className="space-y-3 text-sm text-zinc-300">
                <li>✓ Accès aux offres</li>
                <li>✓ Profil candidat</li>
                <li>✓ CV et compétences</li>
                <li>✓ 3 candidatures par mois</li>
                <li>✓ Candidature via WhatsApp</li>
              </ul>

              <Link
                href="/subscriptions"
                className="mt-8 block rounded-xl border border-white/10 px-5 py-3.5 text-center text-sm font-bold hover:border-[#ea580c]/50"
              >
                Choisir BASIC
              </Link>
            </div>

            {/* PREMIUM */}
            <div className="rounded-3xl border border-[#ea580c]/40 bg-[#160e0a] p-8">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-[#f97316]">
                  PREMIUM
                </p>

                <span className="rounded-full bg-[#ea580c] px-3 py-1 text-[10px] font-black">
                  ILLIMITÉ
                </span>
              </div>

              <div className="mt-4">
                <span className="text-5xl font-black">2 997</span>

                <span className="ml-2 text-sm text-zinc-500">
                  FCFA / mois
                </span>
              </div>

              <p className="mt-5 text-sm leading-6 text-zinc-400">
                Pour les candidats qui souhaitent envoyer autant de
                candidatures que nécessaire.
              </p>

              <div className="my-7 h-px bg-white/10" />

              <ul className="space-y-3 text-sm text-zinc-300">
                <li>✓ Accès aux offres</li>
                <li>✓ Profil candidat</li>
                <li>✓ CV et compétences</li>
                <li>✓ Candidatures illimitées</li>
                <li>✓ Candidature via WhatsApp</li>
              </ul>

              <Link
                href="/subscriptions"
                className="mt-8 block rounded-xl bg-[#ea580c] px-5 py-3.5 text-center text-sm font-black hover:bg-[#f97316]"
              >
                Choisir PREMIUM
              </Link>
            </div>
          </div>

          {/* PAIEMENT */}
          <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 text-center">
            <p className="text-sm font-bold text-white">
              Comment fonctionne l'activation ?
            </p>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Après avoir choisi votre formule, vous êtes redirigé vers
              SoleasPay pour effectuer votre paiement sécurisé. Une fois le
              paiement confirmé, votre abonnement est automatiquement activé
              et vous pouvez commencer à postuler.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-white/10 bg-[#0d0d0d]">
        <div className="mx-auto max-w-4xl px-5 py-24 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
            Commencez maintenant
          </p>

          <h2 className="mt-4 text-3xl font-black sm:text-5xl">
            Votre prochaine opportunité
            <br />
            peut commencer ici.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-500">
            Créez votre compte gratuitement, complétez votre profil et
            préparez-vous à saisir les prochaines opportunités.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex rounded-xl bg-[#ea580c] px-7 py-4 text-sm font-black hover:bg-[#f97316]"
          >
            Créer un compte
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ea580c] text-sm font-black">
              J
            </div>

            <span className="font-bold">
              Job<span className="text-[#f97316]">Connect</span>
            </span>
          </div>

          <div className="flex gap-5 text-xs text-zinc-600">
            <Link href="/jobs" className="hover:text-zinc-300">
              Offres
            </Link>

            <Link href="/subscriptions" className="hover:text-zinc-300">
              Abonnements
            </Link>

            <Link href="/login" className="hover:text-zinc-300">
              Connexion
            </Link>
          </div>

          <p className="text-xs text-zinc-600">
            © 2026 JobConnect. Tous droits réservés.
          </p>
        </div>
      </footer>
    </main>
  );
}

function Info({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-zinc-500">{text}</p>
    </div>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
      <span className="text-sm font-black text-[#f97316]">
        {number}
      </span>

      <h3 className="mt-5 text-lg font-black">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-zinc-500">
        {text}
      </p>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ea580c]/10 text-xl">
        {icon}
      </div>

      <h3 className="mt-5 font-black">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {text}
      </p>
    </div>
  );
}