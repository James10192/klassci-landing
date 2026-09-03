import { defineConfig, defineDocs, frontmatterSchema } from "fumadocs-mdx/config";
import { remarkHeading, remarkStructure } from "fumadocs-core/mdx-plugins";
import { z } from "zod";

/** Une date de frontmatter, ecrite avec ou sans guillemets, ramenee a `AAAA-MM-JJ`. */
const dateIso = z
  .union([z.string(), z.date()])
  .transform((valeur) =>
    valeur instanceof Date ? valeur.toISOString().slice(0, 10) : valeur,
  );

export const docs = defineDocs({
  dir: "content/docs",
});

/**
 * Le blog.
 *
 * Il vit sur le domaine, pas sur un sous-domaine. Les concurrents qui ont
 * range leur contenu sous `blog.` ou `docs.` se privent du transfert
 * d'autorite vers leurs pages produit : chaque lien gagne par un article
 * profite alors a un autre hote que celui qui vend.
 *
 * Le frontmatter est un contrat, verifie a la construction. Un article sans
 * date, sans theme ou sans source ne compile pas — c'est volontaire : la
 * regle editoriale veut que chaque piece porte une donnee propre, un texte
 * reglementaire cite, ou un modele telechargeable, et les sources sont ce qui
 * rend cette regle verifiable.
 */
export const blog = defineDocs({
  dir: "content/blog",
  docs: {
    schema: frontmatterSchema.extend({
      // YAML transforme `2026-09-02` sans guillemets en objet Date. On accepte
      // les deux ecritures et on normalise, plutot que d'imposer aux auteurs de
      // se souvenir d'une regle de citation.
      /** Date de publication. Alimente `datePublished` du balisage. */
      date: dateIso,
      /** Derniere revision, si l'article a ete repris. */
      dateRevision: dateIso.optional(),
      auteur: z.string().default("Equipe KLASSCI"),
      /** La rubrique : lmd, finance, reglementation, operations, achat. */
      theme: z.enum(["lmd", "finance", "reglementation", "operations", "achat"]),
      /** Le mot-cle principal vise. Sert au suivi, pas au balisage. */
      motCle: z.string().optional(),
      /** Le chapeau affiche en tete d'article et dans la liste. */
      resume: z.string().optional(),
      /** Les sources citees, sous la forme « Libelle - URL ». */
      sources: z.array(z.string()).default([]),
    }),
  },
});

/**
 * Les pages institutionnelles.
 *
 * A propos, securite, mentions legales, confidentialite : quatre pages qui ne
 * sont ni de la documentation produit ni des articles. Elles ont leur propre
 * collection plutot qu'un dossier de plus sous `content/docs`, parce qu'elles
 * ne partagent rien avec la documentation — ni la barre laterale, ni le plan,
 * ni le fil de lecture — et qu'elles se rendent dans la colonne de lecture du
 * blog.
 *
 * Contrairement au blog, elles sont TRADUITES : une politique de
 * confidentialite qui n'existe qu'en francais laisse l'anglophone sans reponse
 * sur le traitement de ses propres donnees. Le suffixe `.en.mdx` suffit, comme
 * pour la documentation.
 *
 * `dateMaj` est obligatoire, et c'est le seul champ ajoute au contrat commun.
 * Une politique de confidentialite sans date de derniere mise a jour ne vaut
 * rien : le lecteur ne peut pas savoir si ce qu'il lit decrit encore le
 * traitement en cours, et l'autorite de controle non plus.
 */
export const institutionnel = defineDocs({
  dir: "content/institutionnel",
  docs: {
    schema: frontmatterSchema.extend({
      /** Date de derniere mise a jour, affichee en tete de page. */
      dateMaj: dateIso,
      /** Le chapeau affiche sous le titre. */
      resume: z.string().optional(),
    }),
  },
});

export default defineConfig({
  mdxOptions: {
    // Order matters: remarkHeading runs first to assign data.hProperties.id
    // on every heading node (so the rendered HTML gets <h2 id="...">), then
    // remarkStructure walks the same AST and references those ids when it
    // builds the page-level structured data consumed by /api/search.
    //
    // Passing a plain array here REPLACES Fumadocs' default plugin list,
    // which silently drops remarkHeading. Without it the search dialog
    // navigates to /docs/foo#some-id but no heading has that id in the DOM
    // — so the browser (and our HashScroll watcher) cannot scroll to it.
    remarkPlugins: [remarkHeading, remarkStructure],
  },
});
