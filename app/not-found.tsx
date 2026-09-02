import "./globals.css";

import Link from "next/link";

/**
 * Le 404 de dernier recours.
 *
 * Il ne sert qu'aux adresses qui echappent au middleware de langue — celles
 * qui ressemblent a un fichier, par exemple. La mise en page racine est un
 * simple passe-plat : cette page doit donc porter elle-meme son `html` et son
 * `body`, sinon le document sort sans balise racine.
 */
export default function Introuvable() {
  return (
    <html lang="fr">
      <body>
        <main className="container py-section min-h-[70vh] flex flex-col justify-center items-center text-center">
          <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] text-text-muted">
            404
          </p>
          <h1 className="font-serif font-light text-section-h2 text-accent mt-3 mb-4">
            Cette page n&apos;existe pas
          </h1>
          <p className="text-text-secondary max-w-[46ch] mb-8">
            L&apos;adresse demandee n&apos;existe plus, ou n&apos;a jamais existe.
          </p>
          <Link
            href="/fr"
            className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded text-[0.875rem] font-medium border border-accent transition-colors duration-200 hover:bg-accent-hover"
          >
            Retour a l&apos;accueil
            <span aria-hidden className="opacity-80">
              →
            </span>
          </Link>
        </main>
      </body>
    </html>
  );
}
