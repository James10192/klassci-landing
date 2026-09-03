import "server-only";

/**
 * Les établissements que klassci.com montre, avec leur identité.
 *
 * Le site connaît déjà ses écoles : le portail d'inscription les lit depuis les
 * variables d'environnement (`lib/portail/tenants.ts`). Ce module réutilise ce
 * même registre et va demander à chaque instance ce qu'elle veut montrer d'elle
 * — son nom, son logo, ses couleurs — par son point d'entrée public
 * `/api/public/etablissement`.
 *
 * Pourquoi interroger chaque école plutôt que de tenir une liste ici : parce
 * qu'un logo change, et qu'il doit changer AU MÊME ENDROIT que celui des
 * bulletins. Une école qui remplace son logo dans ses réglages KLASSCI le voit
 * changer sur klassci.com dans l'heure, sans que personne ne touche à ce dépôt.
 *
 * Trois disciplines gouvernent ce fichier :
 *
 * 1. **Une école injoignable n'est pas une panne.** Instance en maintenance,
 *    version pas encore déployée, réseau lent : elle est simplement absente de
 *    la liste. La page d'accueil ne doit jamais échouer parce qu'une école sur
 *    six n'a pas répondu.
 * 2. **Rien n'est codé en dur**, ni la liste des écoles, ni celles qu'on écarte.
 *    L'instance de démonstration ne doit pas figurer parmi « nos
 *    établissements » ; elle est écartée par `VITRINE_EXCLUS`, pas par une
 *    ligne de code.
 * 3. **Ce qui revient de l'école est une donnée, pas une instruction.** Les
 *    couleurs sont revalidées ici, en plus de l'être côté KLASSCI : elles
 *    atterrissent dans un attribut `style`, et ce module est la dernière
 *    frontière avant le navigateur du visiteur.
 */

/** Le bleu KLASSCI, servi quand une école ne dit rien d'utilisable. */
const COULEUR_REPLI = "#0453cb";

/**
 * Au-delà, l'instance est considérée injoignable. Court volontairement : cette
 * lecture bloque la génération d'une page, et l'absence d'une école coûte
 * infiniment moins cher qu'une page d'accueil qui met dix secondes à arriver.
 */
const DELAI_MAX_MS = 5_000;

/** Une heure, la même que celle annoncée par KLASSCI sur ces réponses. */
export const DUREE_REVALIDATION_S = 3600;

export type IdentiteVisuelle = {
  couleurPrincipale: string;
  bandeauFond: string;
  bandeauTexte: string;
  entete: string;
};

export type EtablissementVitrine = {
  /** Le code de l'école, tel qu'il sert de segment d'URL. */
  code: string;
  /** Le nom affiché. Celui que l'école a réglé, à défaut celui du registre. */
  nom: string;
  sigle: string;
  ville: string;
  /** L'URL du logo sur l'instance, ou null si l'école n'en a pas configuré. */
  logo: string | null;
  identite: IdentiteVisuelle;
};

/** La forme brute rendue par KLASSCI. Tout y est optionnel : c'est du réseau. */
type ReponseIdentite = {
  nom?: unknown;
  sigle?: unknown;
  ville?: unknown;
  logo?: { present?: unknown; url?: unknown };
  identite_visuelle?: {
    couleur_principale?: unknown;
    bandeau_fond?: unknown;
    bandeau_texte?: unknown;
    entete?: unknown;
  };
};

const CODE_VALIDE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const COULEUR_VALIDE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function suffixeEnv(code: string): string {
  return code.replace(/-/g, "_").toUpperCase();
}

function libelleParDefaut(code: string): string {
  return code
    .split("-")
    .map((mot) => mot.charAt(0).toUpperCase() + mot.slice(1))
    .join(" ");
}

/**
 * Les écoles à interroger : celles du registre du portail, moins les exclues.
 *
 * Le secret partagé n'est PAS requis ici, contrairement au portail : ce point
 * d'entrée n'est pas signé. Une école dont le canal d'inscription est fermé
 * apparaît donc quand même parmi les logos — c'est bien ce qu'on veut, elle
 * reste cliente de KLASSCI même hors saison d'inscription.
 */
function codesAInterroger(appliquerExclusions = true): Array<{ code: string; base: string; libelle: string }> {
  const exclus = new Set(
    appliquerExclusions
      ? (process.env.VITRINE_EXCLUS ?? "")
          .split(",")
          .map((code) => code.trim().toLowerCase())
          .filter((code) => code !== "")
      : [],
  );

  return (process.env.REINSCRIPTION_TENANTS ?? "")
    .split(",")
    .map((code) => code.trim().toLowerCase())
    .filter((code) => code !== "" && CODE_VALIDE.test(code) && !exclus.has(code))
    .map((code) => {
      const base = process.env[`REINSCRIPTION_BASE_${suffixeEnv(code)}`];

      if (typeof base !== "string" || !base.startsWith("https://")) {
        return null;
      }

      return {
        code,
        base: base.replace(/\/+$/, ""),
        libelle: process.env[`REINSCRIPTION_LABEL_${suffixeEnv(code)}`] ?? libelleParDefaut(code),
      };
    })
    .filter((entree): entree is { code: string; base: string; libelle: string } => entree !== null);
}

function texte(valeur: unknown, repli = ""): string {
  return typeof valeur === "string" && valeur.trim() !== "" ? valeur.trim() : repli;
}

/**
 * Le nom que l'école s'est donné, ou celui du registre si elle n'en a pas.
 *
 * KLASSCI pose « KLASSCI » comme valeur initiale de `school_name` — un choix
 * délibéré côté produit, pour qu'une instance clonée n'hérite pas du nom de
 * l'école dont elle a été copiée. Le revers est qu'une école qui n'a jamais
 * ouvert ses réglages se présente publiquement sous le nom de l'éditeur.
 *
 * C'est ce qui s'est produit : la liste des établissements affichait
 * « KLASSCI · Yamoussoukro » entre deux écoles réelles, et personne ne
 * reconnaissait cette ligne — c'était Ephrata. Un futur bachelier, lui, ne
 * peut pas le deviner du tout.
 *
 * On retombe donc sur le libellé du registre, celui que l'exploitant a posé
 * dans `REINSCRIPTION_LABEL_<CODE>`. Ce n'est pas une correction du fond : le
 * remède reste que l'école renseigne son nom dans ses réglages, et il vaut
 * aussi pour ses bulletins. Mais la vitrine n'a aucune raison de présenter le
 * nom de l'éditeur comme celui d'un client.
 */
function nomEcole(brut: unknown, libelleRegistre: string): string {
  const propose = texte(brut);

  if (propose === "" || comparableNom(propose) === "klassci") {
    return libelleRegistre;
  }

  return propose;
}

function comparableNom(valeur: string): string {
  return valeur
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Une couleur hexadécimale, ou la teinte KLASSCI.
 *
 * KLASSCI assainit déjà ces valeurs. On les revalide quand même : elles vont
 * dans un attribut `style`, elles arrivent par le réseau, et une instance
 * ancienne ou détournée n'a pas à pouvoir écrire du CSS dans nos pages.
 */
function couleur(valeur: unknown): string {
  const brute = typeof valeur === "string" ? valeur.trim() : "";

  return COULEUR_VALIDE.test(brute) ? brute.toLowerCase() : COULEUR_REPLI;
}

/**
 * L'URL du logo, acceptée seulement si elle pointe vers l'instance elle-même.
 *
 * Une instance compromise ou mal configurée pourrait renvoyer l'adresse d'un
 * tiers ; le site l'afficherait alors comme le logo d'un de « nos
 * établissements », et le chargerait depuis un domaine que personne n'a
 * autorisé. On n'accepte donc que ce qui vient de chez elle.
 */
function urlLogo(valeur: unknown, base: string): string | null {
  if (typeof valeur !== "string" || valeur === "") {
    return null;
  }

  try {
    const url = new URL(valeur);

    return url.origin === new URL(base).origin ? url.toString() : null;
  } catch {
    return null;
  }
}

async function interroger(
  ecole: { code: string; base: string; libelle: string },
): Promise<EtablissementVitrine | null> {
  try {
    const reponse = await fetch(`${ecole.base}/api/public/etablissement`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(DELAI_MAX_MS),
      next: { revalidate: DUREE_REVALIDATION_S },
    });

    if (!reponse.ok) {
      // Bruyant à dessein : une instance qui répond 404 ici n'a pas encore reçu
      // la version qui sert ce point d'entrée. C'est une information de
      // déploiement, pas un incident — mais il faut pouvoir la lire.
      console.warn(`[vitrine] ${ecole.code} repond ${reponse.status} sur son identite publique`);

      return null;
    }

    const brut = (await reponse.json()) as ReponseIdentite;

    return {
      code: ecole.code,
      // Le nom réglé par l'école prime sur le libellé du registre : c'est elle
      // qui sait comment elle s'appelle, et elle le corrige sans nous. Sauf
      // quand ce nom est celui de l'éditeur, faute d'avoir jamais été réglé.
      nom: nomEcole(brut.nom, ecole.libelle),
      sigle: texte(brut.sigle),
      ville: texte(brut.ville),
      logo: (brut.logo?.present ?? false) === true ? urlLogo(brut.logo?.url, ecole.base) : null,
      identite: {
        couleurPrincipale: couleur(brut.identite_visuelle?.couleur_principale),
        bandeauFond: couleur(brut.identite_visuelle?.bandeau_fond),
        bandeauTexte: couleur(brut.identite_visuelle?.bandeau_texte),
        entete: texte(brut.identite_visuelle?.entete).slice(0, 120),
      },
    };
  } catch (erreur) {
    console.warn(`[vitrine] ${ecole.code} injoignable pour son identite publique`, erreur);

    return null;
  }
}

/**
 * Les établissements servis, avec leur identité, triés par nom.
 *
 * Les appels partent en parallèle : six écoles interrogées l'une après l'autre
 * additionneraient leurs latences, et une seule instance lente retarderait la
 * page entière.
 */
export async function etablissementsVitrine(): Promise<EtablissementVitrine[]> {
  const resultats = await Promise.all(codesAInterroger().map(interroger));

  return resultats
    .filter((etablissement): etablissement is EtablissementVitrine => etablissement !== null)
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}

/**
 * Les identités d'une liste précise d'écoles, indexées par code.
 *
 * L'exclusion de vitrine ne s'applique PAS ici, et c'est délibéré : elle
 * répond à la question « qui montre-t-on comme référence sur la page
 * d'accueil », pas à « cette école a-t-elle le droit d'avoir son logo sur sa
 * propre page d'inscription ». L'instance de démonstration reste hors du mur
 * de logos tout en gardant son identité là où quelqu'un est venu la chercher.
 *
 * L'appelant a déjà décidé quelles écoles il sert — pour le portail, ce sont
 * celles dont le canal est réellement ouvert, secret partagé compris.
 */
export async function identitesParCode(
  codes: string[],
): Promise<Record<string, EtablissementVitrine>> {
  const voulus = new Set(codes.map((code) => code.trim().toLowerCase()));

  const resultats = await Promise.all(
    codesAInterroger(false)
      .filter((ecole) => voulus.has(ecole.code))
      .map(interroger),
  );

  return Object.fromEntries(
    resultats
      .filter((etablissement): etablissement is EtablissementVitrine => etablissement !== null)
      .map((etablissement) => [etablissement.code, etablissement]),
  );
}

/**
 * L'identité d'une seule école, pour sa page d'inscription.
 *
 * Rend null si l'école est inconnue du registre ou injoignable : la page
 * s'affiche alors aux couleurs de KLASSCI, ce qu'elle faisait déjà avant.
 */
export async function identiteEtablissement(code: string): Promise<EtablissementVitrine | null> {
  return (await identitesParCode([code]))[code.trim().toLowerCase()] ?? null;
}
