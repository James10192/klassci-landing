import Image from "next/image";

/**
 * La pastille d'un etablissement : son logo, ou ses initiales.
 *
 * Dans son propre fichier parce qu'elle sert des deux cotes de la frontiere —
 * le bandeau d'identite est rendu sur le serveur, la liste cherchable l'est
 * dans le navigateur. Rien ici n'a besoin d'etat : le composant traverse la
 * frontiere sans se declarer client, et ne coute donc du JavaScript que sur la
 * page qui en a deja.
 */

function initiales(nom: string): string {
  const mots = nom
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (mots.length === 0) return "?";
  if (mots.length === 1) return mots[0].slice(0, 2).toUpperCase();

  return (mots[0][0] + mots[mots.length - 1][0]).toUpperCase();
}

/**
 * Le logo de l'école, ou ses initiales.
 *
 * Le logo est posé sur une tuile blanche, y compris dans le bandeau coloré :
 * les logos d'école sont presque toujours dessinés pour du papier blanc, et
 * beaucoup deviennent illisibles posés à même une couleur soutenue.
 *
 * **La tuile est rectangulaire, et c'est le point.** Elle était carrée, de
 * quarante pixels moins six de marge intérieure : vingt-huit pixels de côté.
 * Or un logo d'établissement n'est presque jamais un carré — ceux que servent
 * les instances font 185 × 141, 412 × 142, 600 × 360. `object-contain` dans un
 * carré de vingt-huit pixels réduisait le logo de l'USAT à une bande de vingt-
 * huit sur dix : présente dans le HTML, chargée, visible au sens du navigateur,
 * et illisible pour un être humain. La donnée était juste de bout en bout ;
 * c'est l'affichage qui la perdait.
 *
 * Le rapport 4:3 retenu laisse respirer un mot-symbole sans déformer un
 * écusson, qui reste centré. Et le liseré n'est pas décoratif : le logo de
 * l'une des instances est blanc à 85 %, donc invisible sur une tuile blanche
 * posée sur un fond clair. Le liseré dessine la tuile même quand son contenu
 * ne se voit pas.
 */
export function Marque({
  logo,
  nom,
  taille,
}: {
  logo: string | null;
  nom: string;
  taille: "liste" | "bandeau";
}) {
  const boite = taille === "bandeau" ? "h-16 w-[5.5rem]" : "h-12 w-16";
  const texte = taille === "bandeau" ? "text-base" : "text-xs";
  const marge = taille === "bandeau" ? "p-2" : "p-1.5";

  const tuile =
    `inline-flex ${boite} shrink-0 items-center justify-center rounded-xl bg-white` +
    " ring-1 ring-black/[0.06] shadow-[0_1px_3px_rgba(16,24,40,0.12)]";

  if (logo === null) {
    return (
      <span
        aria-hidden
        className={`${tuile} font-mono ${texte} font-semibold text-text-secondary`}
      >
        {initiales(nom)}
      </span>
    );
  }

  return (
    <span className={`${tuile} ${marge}`}>
      <Image
        src={logo}
        // Le nom de l'école, pas une chaîne vide : c'est une image porteuse de
        // sens, la seule marque visuelle qui distingue une ligne de la
        // suivante. Un lecteur d'écran doit l'annoncer.
        alt={nom}
        width={176}
        height={128}
        sizes="176px"
        className="h-full w-full object-contain"
      />
    </span>
  );
}
