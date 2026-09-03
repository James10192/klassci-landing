/**
 * Le contraste, pour décider si la couleur d'une école est utilisable.
 *
 * Le portail d'inscription prend les couleurs de l'établissement choisi. Une
 * école a le droit d'avoir réglé un jaune paille pour ses en-têtes de PDF :
 * sur du papier, posé en aplat derrière du texte foncé, il est très bien. Le
 * même jaune en fond de bouton sous du texte blanc rend le bouton illisible.
 *
 * On ne corrige donc pas la couleur de l'école, et on ne la refuse pas non
 * plus : on la garde là où KLASSCI a déjà calculé un texte lisible dessus (le
 * bandeau), et on renonce à s'en servir pour les commandes quand elle ne tient
 * pas le rapport exigé. Un formulaire d'inscription doit rester utilisable,
 * même par quelqu'un qui remplit son dossier sur un téléphone au soleil.
 *
 * Le calcul est celui de la WCAG 2.1 : luminance relative, puis rapport
 * (L1 + 0,05) / (L2 + 0,05).
 */

/** Le bleu KLASSCI, servi quand la couleur de l'école ne tient pas. */
const COULEUR_REPLI = "#0453cb";

/**
 * Le seuil exigé pour du texte de taille normale. Les commandes du portail
 * portent des libellés ordinaires — « Envoyer ma demande » n'est pas un titre.
 */
const RAPPORT_MINIMAL = 4.5;

function canaux(couleur: string): [number, number, number] | null {
  const brut = couleur.trim().replace(/^#/, "");

  const hexa =
    brut.length === 3
      ? brut
          .split("")
          .map((caractere) => caractere + caractere)
          .join("")
      : brut;

  if (!/^[0-9a-fA-F]{6}$/.test(hexa)) {
    return null;
  }

  return [0, 2, 4].map((rang) => parseInt(hexa.slice(rang, rang + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
}

export function luminance(couleur: string): number | null {
  const composantes = canaux(couleur);

  if (composantes === null) {
    return null;
  }

  const [r, v, b] = composantes.map((canal) =>
    canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * r + 0.7152 * v + 0.0722 * b;
}

export function rapportContraste(premiere: string, seconde: string): number | null {
  const a = luminance(premiere);
  const b = luminance(seconde);

  if (a === null || b === null) {
    return null;
  }

  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * La couleur à donner aux commandes du portail : celle de l'école si du texte
 * blanc tient dessus, le bleu KLASSCI sinon.
 */
export function accentUtilisable(couleur: string): string {
  const rapport = rapportContraste(couleur, "#ffffff");

  return rapport !== null && rapport >= RAPPORT_MINIMAL ? couleur : COULEUR_REPLI;
}

function composer(couleur: string, transformer: (canal: number) => number): string | null {
  const composantes = canaux(couleur);

  if (composantes === null) {
    return null;
  }

  return (
    "#" +
    composantes
      .map((canal) =>
        Math.round(Math.min(255, Math.max(0, transformer(canal * 255))))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

/**
 * La teinte de survol : la même couleur, assombrie.
 *
 * Calculée ici plutôt qu'avec `color-mix` en CSS : la liste des navigateurs
 * visés par ce site descend jusqu'à Safari 15, qui ne connaît pas encore
 * `color-mix`, et le survol y resterait sans effet.
 */
export function assombrir(couleur: string, facteur = 0.82): string {
  return composer(couleur, (canal) => canal * facteur) ?? couleur;
}

/** La même couleur en fond très léger : survols discrets, anneaux de focus. */
export function translucide(couleur: string, alpha = 0.1): string {
  const composantes = canaux(couleur);

  if (composantes === null) {
    return `rgba(4, 83, 203, ${alpha})`;
  }

  const [r, v, b] = composantes.map((canal) => Math.round(canal * 255));

  return `rgba(${r}, ${v}, ${b}, ${alpha})`;
}

/**
 * Une couleur est-elle trop claire pour tenir lieu de fond sur cette page ?
 *
 * Le fond du site est presque blanc. Un bandeau blanc posé dessus n'est pas un
 * bandeau discret : c'est un rectangle qu'on ne voit pas.
 *
 * Le seuil est un rapport de contraste avec le fond de page, pas une
 * luminance : c'est la grandeur qui décrit ce que l'œil distingue réellement,
 * et elle traite correctement un beige ou un gris très clair, qu'un seuil de
 * luminance laisserait passer.
 */
export function tropClairePourUnFond(couleur: string, fondDePage = "#f7f6f3"): boolean {
  const rapport = rapportContraste(couleur, fondDePage);

  return rapport === null || rapport < 1.35;
}

/**
 * Du texte lisible sur un fond donné : blanc, ou l'encre du site.
 *
 * KLASSCI calcule déjà cette couleur pour ses PDF et la sert dans
 * `bandeau_texte`. On ne s'en sert ici que lorsqu'on a dû changer le fond —
 * auquel cas la valeur reçue a été calculée contre un autre fond et ne veut
 * plus rien dire.
 */
export function texteLisibleSur(fond: string): string {
  const surBlanc = rapportContraste(fond, "#ffffff") ?? 0;
  const surEncre = rapportContraste(fond, "#111827") ?? 0;

  return surBlanc >= surEncre ? "#ffffff" : "#111827";
}

/**
 * Les variables de thème à poser autour du formulaire d'une école.
 *
 * Tout le portail est écrit avec les jetons `accent` — boutons, liens, bordures
 * au focus, anneaux : redéfinir ces trois variables sur un conteneur suffit à
 * le repeindre entièrement, sans toucher à un seul composant.
 */
export function variablesEtablissement(couleurPrincipale: string): Record<string, string> {
  const accent = accentUtilisable(couleurPrincipale);

  return {
    "--accent": accent,
    "--accent-hover": assombrir(accent),
    "--accent-light": translucide(accent),
  };
}

/**
 * Les couleurs du bandeau d'identité : son fond, et l'encre qui va dessus.
 *
 * Cette décision vivait dans le composant du bandeau, où aucun script ne
 * pouvait l'atteindre. Elle s'est trompée en production sans que rien ne le
 * signale, et je ne l'ai vue qu'en regardant les six écoles une à une — ce
 * qu'on ne refera pas à chaque livraison. Elle est ici parce qu'elle décide
 * quelque chose, et que ce qui décide doit pouvoir être mis à l'épreuve.
 *
 * Deux règles, chacune née d'un défaut constaté :
 *
 * 1. **Un bandeau qu'on ne voit pas ne vaut rien.** Trois écoles sur six ont
 *    laissé `bandeau_fond` en blanc — la valeur par défaut des PDF, juste sur
 *    du papier, où la feuille a un bord. À l'écran, ce blanc posé sur un fond
 *    presque blanc ne montre rien : l'étudiant voyait une carte vide là où on
 *    voulait lui dire « vous êtes chez votre école ».
 *
 * 2. **Une page porte une couleur d'identité, pas deux.** Le repli prend
 *    `accentUtilisable`, non la couleur brute de l'école. La nuance se voit :
 *    l'orange de l'ESBTP Yakro est écarté des commandes, parce que du texte
 *    blanc dessus est illisible. Posé brut sur le bandeau, il donnait une page
 *    à bandeau orange, boutons bleus et pied bleu — la couleur de l'école
 *    apparaissant une seule fois, contredite partout ailleurs.
 *
 * L'encre n'est recalculée que lorsqu'on a changé le fond : sinon on garde
 * celle que KLASSCI a calculée pour le PDF, faute de quoi le document imprimé
 * et la page web divergeraient.
 */
export function couleursBandeau(identite: {
  bandeauFond: string;
  bandeauTexte: string;
  couleurPrincipale: string;
}): { fond: string; encre: string } {
  const substitue = tropClairePourUnFond(identite.bandeauFond);

  if (!substitue) {
    return { fond: identite.bandeauFond, encre: identite.bandeauTexte };
  }

  const fond = accentUtilisable(identite.couleurPrincipale);

  return { fond, encre: texteLisibleSur(fond) };
}
