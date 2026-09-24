import Link from "next/link";

import { composantsInstitutionnels } from "@/components/institutionnel/mdx";
import { NavInstitutionnelle } from "@/components/institutionnel/nav-institutionnelle";
import { Footer } from "@/components/sections/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { dateLisible } from "@/lib/institutionnel";
import {
  cheminPays,
  LANGUE_PAYS,
  PAYS,
  pagePays,
  type DonneesPagePays,
  type SlugPays,
} from "@/lib/pays";
import { buildPaysGraph } from "@/lib/schema/pages";

/**
 * La coquille d'une page pays.
 *
 * Même colonne de lecture que les pages institutionnelles : ces pages se lisent
 * comme un texte suivi. Elles s'en distinguent par la fin — une page pays est
 * lue par quelqu'un qui compare des logiciels, et elle doit lui dire où aller
 * ensuite : l'édition qui le concerne, puis un contact.
 *
 * Aucune n'est cliente : rien ici n'a besoin d'état.
 */
export async function PagePays({
  slug,
  donnees,
}: {
  slug: SlugPays;
  donnees: DonneesPagePays;
}) {
  const locale = LANGUE_PAYS;
  const MDX = donnees.body;
  const chemin = cheminPays(slug);

  const graphe = await buildPaysGraph(locale, {
    chemin,
    titre: donnees.title,
    description: donnees.description ?? donnees.resume ?? "",
    nomPays: donnees.nomPays,
    dateMaj: donnees.dateMaj,
  });

  const autresPays = PAYS.filter((autre) => autre !== slug).flatMap((autre) => {
    const page = pagePays(autre);
    return page ? [{ slug: autre, nom: page.nomPays }] : [];
  });

  const suites = [
    { href: `/${locale}/universite`, titre: "Université et grandes écoles", texte: "LMD, UE et ECUE, crédits, jurys, relevés." },
    { href: `/${locale}/college`, titre: "Collège et lycée", texte: "Bulletins, moyennes, frais, présences." },
    { href: `/${locale}/blog`, titre: "Guides et ressources", texte: "Les textes, expliqués et sourcés." },
  ];

  return (
    <>
      <JsonLd graph={graphe} />
      <NavInstitutionnelle locale={locale} />
      <div className="pt-[57px]">
        <main className="container py-section">
          <nav
            aria-label="Fil d'Ariane"
            className="font-mono text-[0.72rem] uppercase tracking-[0.06em] text-text-muted"
          >
            <Link href={`/${locale}`} className="hover:text-accent">
              Accueil
            </Link>
            <span aria-hidden className="px-2">
              /
            </span>
            <span className="text-text-secondary">{donnees.nomPays}</span>
          </nav>

          <article className="mx-auto mt-8 max-w-[46rem]">
            <header>
              <h1 className="font-serif text-[2.4rem] font-light leading-[1.15] text-accent sm:text-[2.9rem]">
                {donnees.title}
              </h1>

              {donnees.resume && (
                <p className="mt-6 border-l-2 border-accent pl-5 text-[1.05rem] leading-relaxed text-text-secondary">
                  {donnees.resume}
                </p>
              )}

              <div className="mt-7 border-y border-border py-3 font-mono text-[0.72rem] uppercase tracking-[0.06em] text-text-muted">
                <span>Mis à jour le </span>
                <time dateTime={donnees.dateMaj}>{dateLisible(donnees.dateMaj, locale)}</time>
              </div>
            </header>

            <div className="mt-2">
              <MDX components={composantsInstitutionnels} />
            </div>
          </article>

          <aside className="mx-auto mt-16 max-w-[46rem]" aria-labelledby="suite">
            <h2
              id="suite"
              className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-text-muted"
            >
              Aller plus loin
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {suites.map((suite) => (
                <li key={suite.href}>
                  <Link
                    href={suite.href}
                    className="block h-full rounded-lg border border-border bg-bg-card p-5 transition-colors duration-200 hover:border-accent"
                  >
                    <span className="block font-serif text-[1.05rem] font-light leading-snug text-text">
                      {suite.titre}
                    </span>
                    <span className="mt-2 block text-[0.85rem] leading-snug text-text-muted">
                      {suite.texte}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-[0.95rem] leading-relaxed text-text-secondary">
              Une question sur votre établissement ? Écrivez-nous à{" "}
              <a href="mailto:contact@klassci.com" className="text-accent underline underline-offset-4">
                contact@klassci.com
              </a>
              .
              {autresPays.length > 0 && (
                <>
                  {" "}Voir aussi{" "}
                  {autresPays.map((autre, index) => (
                    <span key={autre.slug}>
                      {index > 0 && ", "}
                      <Link href={`/${locale}${cheminPays(autre.slug)}`} className="text-accent underline underline-offset-4">
                        KLASSCI pour : {autre.nom}
                      </Link>
                    </span>
                  ))}
                  .
                </>
              )}
            </p>
          </aside>
        </main>
      </div>
      <Footer />
    </>
  );
}
