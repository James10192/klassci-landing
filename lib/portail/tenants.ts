import "server-only";

/**
 * Les établissements joignables depuis klassci.com.
 *
 * Un seul registre pour les DEUX canaux : la réinscription, qui l'a fait
 * naître, et la candidature, arrivée ensuite. Les variables d'environnement
 * gardent le préfixe `REINSCRIPTION_` de leur premier usage — elles sont posées
 * sur les déploiements de production, et les renommer fermerait le portail des
 * six écoles le temps d'un déploiement, pour une question de vocabulaire.
 *
 * Rien n'est codé en dur ici : une école apparaît sur klassci.com le jour où
 * son secret est posé dans les variables d'environnement, et disparaît le jour
 * où il est retiré. C'est la même discipline que côté KLASSCI, où le canal est
 * piloté par un réglage d'établissement et non par une ligne de code.
 *
 * Convention de nommage — pour un établissement de code `esbtp-yakro` :
 *
 *   REINSCRIPTION_SECRET_ESBTP_YAKRO   (requis)  le secret partagé, 32 car. min
 *   REINSCRIPTION_BASE_ESBTP_YAKRO     (requis)  l'URL de l'instance
 *   REINSCRIPTION_LABEL_ESBTP_YAKRO    (option)  le nom affiché
 *
 * L'URL est exigée plutôt que déduite du code. Elle ne se déduit déjà pas
 * toujours — l'établissement `rostan` est servi par `islg.klassci.com` — et
 * surtout, la déduire figerait ici une hypothèse sur un seul produit. Ce
 * module n'a pas à savoir que KLASSCI Université loge ses instances sur des
 * sous-domaines : c'est la configuration qui le dit, école par école.
 *
 * La liste des codes vient de REINSCRIPTION_TENANTS, séparés par des virgules.
 * Sans elle, aucune école n'est servie — un oubli de configuration ferme le
 * portail, il ne l'ouvre pas.
 */

/** La forme complete, interne au module : voir EtablissementVisible en dessous. */
type EtablissementPortail = {
  /** Code de l'établissement, tel qu'il sert de segment d'URL. */
  code: string;
  /** Nom affiché au visiteur. */
  libelle: string;
  /** Racine de l'instance KLASSCI, sans barre oblique finale. */
  base: string;
};

/**
 * Ce que le navigateur recoit.
 *
 * `base` n'en fait pas partie : aucun composant client ne la lit — ils
 * s'adressent au relais par le `code` — et la serialiser l'envoyait dans la
 * charge de chaque page. Ce n'est pas un secret, c'est du poids mort sur une
 * page souvent servie en 2G, et une adresse interne qui n'a aucune raison de
 * circuler.
 */
export type EtablissementVisible = Pick<EtablissementPortail, "code" | "libelle">;

/** Le secret ne quitte jamais le serveur, donc jamais ce module. */
type EtablissementInterne = EtablissementPortail & { secret: string };

const LONGUEUR_MINIMALE_SECRET = 32;

/**
 * Le code d'établissement sert de segment d'URL et de suffixe de variable
 * d'environnement. On le restreint volontairement à ce que ces deux usages
 * acceptent sans échappement : minuscules, chiffres, tirets.
 */
const CODE_VALIDE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function suffixeEnv(code: string): string {
  return code.replace(/-/g, "_").toUpperCase();
}

function libelleParDefaut(code: string): string {
  return code
    .split("-")
    .map((mot) => mot.charAt(0).toUpperCase() + mot.slice(1))
    .join(" ");
}

function lire(code: string): EtablissementInterne | null {
  if (!CODE_VALIDE.test(code)) {
    console.warn(
      `[portail] Code d'etablissement ignore, format invalide : ${code}`,
    );
    return null;
  }

  const suffixe = suffixeEnv(code);
  const secret = process.env[`REINSCRIPTION_SECRET_${suffixe}`];

  if (typeof secret !== "string" || secret.length < LONGUEUR_MINIMALE_SECRET) {
    // Volontairement bruyant : une école listée sans secret utilisable est une
    // erreur de configuration, pas un choix. La taire afficherait l'école au
    // visiteur pour lui rendre une erreur au premier envoi.
    console.warn(
      `[portail] REINSCRIPTION_SECRET_${suffixe} absent ou trop court, ` +
        `l'etablissement ${code} n'est pas servi.`,
    );
    return null;
  }

  const base = process.env[`REINSCRIPTION_BASE_${suffixe}`];

  if (typeof base !== "string" || !base.startsWith("https://")) {
    console.warn(
      `[portail] REINSCRIPTION_BASE_${suffixe} absent ou non https, ` +
        `l'etablissement ${code} n'est pas servi.`,
    );
    return null;
  }

  return {
    code,
    libelle: process.env[`REINSCRIPTION_LABEL_${suffixe}`] ?? libelleParDefaut(code),
    base: base.replace(/\/+$/, ""),
    secret,
  };
}

function tous(): EtablissementInterne[] {
  const liste = process.env.REINSCRIPTION_TENANTS ?? "";

  return liste
    .split(",")
    .map((code) => code.trim().toLowerCase())
    .filter((code) => code !== "")
    .map(lire)
    .filter((etablissement): etablissement is EtablissementInterne => etablissement !== null);
}

/**
 * Les établissements servis, réduits à ce que le navigateur peut voir.
 *
 * Le tri est ici : ces listes s'affichent, et l'ordre d'une variable
 * d'environnement n'est l'ordre de personne.
 *
 * Rendre `EtablissementVisible` plutôt que d'écarter `base` chez chaque
 * appelant : ainsi aucun appelant ne peut la laisser filer, il ne l'a pas.
 */
export function etablissementsOuverts(): EtablissementVisible[] {
  return tous()
    .map(({ code, libelle }) => ({ code, libelle }))
    .sort((a, b) => a.libelle.localeCompare(b.libelle, "fr"));
}

/**
 * Un établissement par son code, secret compris.
 *
 * Réservé aux routes serveur qui signent. Ne jamais renvoyer l'objet entier
 * dans une réponse ni le passer à un composant client.
 */
export function etablissementAvecSecret(code: string): EtablissementInterne | null {
  const recherche = code.trim().toLowerCase();

  return tous().find((etablissement) => etablissement.code === recherche) ?? null;
}
