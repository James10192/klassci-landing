"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { filtrer } from "@/lib/portail/recherche";

import { Marque } from "./marque-etablissement";

/**
 * La liste des écoles, cherchable au-delà d'un certain nombre.
 *
 * Le champ n'apparaît qu'à partir de huit établissements. En dessous, la liste
 * tient sous les yeux et un champ de recherche serait un obstacle de plus
 * entre un bachelier et son inscription — il faut le lire, comprendre qu'il est
 * facultatif, et l'ignorer. Le seuil de huit n'est pas choisi au hasard : c'est
 * celui qu'applique déjà le sélecteur premium de KLASSCI, et deux produits de
 * la même maison n'ont pas à décider différemment de la même question.
 *
 * La recherche est **insensible aux accents**, ce qui n'est pas un détail sur
 * un site francophone : quelqu'un qui tape « ecole » sur un clavier de
 * téléphone doit trouver « ÉCOLE SPÉCIALE DU BÂTIMENT ». Elle porte sur le nom
 * et sur la ville — un étudiant de Yamoussoukro cherchera sa ville avant le nom
 * exact de son école.
 *
 * **Elle ne porte QUE sur ce qui est affiché**, et c'est une règle, pas une
 * limitation. Le code technique de l'établissement était indexé au départ, pour
 * que « yakro » trouve `esbtp-yakro`. Mais ce code n'apparaît nulle part à
 * l'écran : chercher « universite » ramenait une école nommée « AZERTY » —
 * elle correspondait par son code, `universite-san-pedro`, que le visiteur ne
 * voit pas. Un résultat qu'on ne peut pas expliquer en le regardant apprend à
 * se méfier de tous les autres. Une recherche vaut par ce qu'elle écarte autant
 * que par ce qu'elle trouve.
 *
 * Reste qu'un étudiant tape « esbtp », pas « Ecole Spéciale du Bâtiment et des
 * Travaux Publics » — le nom que l'école a réglé. On indexe donc l'**acronyme
 * calculé à partir du nom affiché** : les initiales de ses mots pleins. Il
 * n'est pas lu dans un champ séparé, et c'est délibéré — le sigle servi par
 * les instances vaut « ESBTP » sur quatre écoles dont deux ne sont pas
 * l'ESBTP, reste d'un clonage. Dériver l'acronyme de ce qui est écrit à
 * l'écran le rend à la fois juste et explicable : « ESBTP », ce sont les
 * initiales du nom qu'on a sous les yeux, et « ISLG » celles d'Institut
 * Supérieur Louis Le Grand.
 *
 * Tous les mots doivent correspondre, pas un seul : « esbtp abidjan » ne doit
 * pas ramener l'ESBTP de Yamoussoukro. Ils peuvent être dans n'importe quel
 * ordre, parce que personne ne connaît l'ordre des mots d'un nom officiel.
 */

export type EntreeEtablissement = {
  code: string;
  nom: string;
  ville: string;
  logo: string | null;
};

export type LibellesRecherche = {
  placeholder: string;
  etiquette: string;
  effacer: string;
  resultats: string;
  videTitre: string;
  videTexte: string;
};

/** À partir de combien d'écoles le champ de recherche apparaît. */
const SEUIL_RECHERCHE = 8;

export function ListeEtablissements({
  locale,
  entrees,
  libelles,
}: {
  locale: string;
  entrees: EntreeEtablissement[];
  libelles: LibellesRecherche;
}) {
  const [requete, setRequete] = useState("");
  const champ = useRef<HTMLInputElement>(null);

  const cherchable = entrees.length >= SEUIL_RECHERCHE;

  // La règle vit dans `lib/portail/recherche`, et `verifier-recherche.mjs`
  // l'éprouve à chaque construction. Elle décide de ce que le visiteur voit :
  // elle n'avait pas à rester enfermée dans un composant qu'on ne peut
  // vérifier qu'en pilotant un navigateur.
  const visibles = useMemo(() => filtrer(entrees, requete), [entrees, requete]);

  return (
    <>
      {cherchable && (
        <div className="relative mt-5">
          <label htmlFor="recherche-etablissement" className="sr-only">
            {libelles.etiquette}
          </label>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="recherche-etablissement"
            ref={champ}
            type="search"
            inputMode="search"
            autoComplete="off"
            value={requete}
            onChange={(evenement) => setRequete(evenement.target.value)}
            onKeyDown={(evenement) => {
              if (evenement.key === "Escape") setRequete("");
            }}
            placeholder={libelles.placeholder}
            // La croix native de `type="search"` est masquée : Chrome la
            // dessine, Firefox non, et elle doublait la nôtre — deux croix
            // côte à côte, dont une seule aux couleurs du site. On garde le
            // type pour le clavier qu'il fait apparaître sur téléphone.
            className="w-full appearance-none rounded-xl border border-border bg-bg py-2.5 pl-10 pr-10 text-[15px] outline-none transition-colors duration-200 placeholder:text-text-muted focus:border-accent [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
          />
          {requete !== "" && (
            <button
              type="button"
              onClick={() => {
                setRequete("");
                champ.current?.focus();
              }}
              aria-label={libelles.effacer}
              className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-text-muted transition-colors duration-200 hover:bg-bg-alt hover:text-text"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Le compte n'est annoncé qu'aux lecteurs d'écran : à l'écran, la liste
          qui rétrécit le dit déjà. `polite` pour ne pas couper la frappe. */}
      {cherchable && (
        <p aria-live="polite" className="sr-only">
          {libelles.resultats.replace("{n}", String(visibles.length))}
        </p>
      )}

      {visibles.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <p className="text-balance font-medium">{libelles.videTitre}</p>
          <p className="mx-auto mt-1.5 max-w-xs text-pretty text-sm leading-relaxed text-text-secondary">
            {libelles.videTexte}
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-2">
          {visibles.map((etablissement) => (
            <li key={etablissement.code}>
              <Link
                href={`/${locale}/inscription/universite/${etablissement.code}`}
                className="flex min-h-[56px] items-center gap-3.5 rounded-xl border border-border px-4 py-3 transition-[border-color,background-color,scale] duration-200 hover:border-accent hover:bg-accent-light active:scale-[0.96]"
              >
                <Marque logo={etablissement.logo} nom={etablissement.nom} taille="liste" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{etablissement.nom}</span>
                  {etablissement.ville !== "" && (
                    <span className="mt-0.5 block truncate text-[13px] text-text-muted">
                      {etablissement.ville}
                    </span>
                  )}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 shrink-0 text-text-muted"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
