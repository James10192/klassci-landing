import "server-only";

import { estDemonstration } from "../instances-demonstration.ts";

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
 * Les écoles servies mais **non proposées** dans le sélecteur.
 *
 * Une notion distincte de l'instance de démonstration, et il faut le dire parce
 * que les deux aboutissent au même effet visible. `presentation` est écartée
 * parce que **ce n'est pas une école** : elle n'a rien à faire non plus sur le
 * mur de logos de l'accueil, et c'est `INSTANCES_DEMONSTRATION` qui s'en charge,
 * pour les deux surfaces à la fois.
 *
 * Ici, il s'agit d'écoles bien réelles, bien clientes, qui doivent continuer
 * de figurer parmi « nos établissements » — mais que klassci.com ne propose pas
 * aux familles dans son sélecteur d'inscription. Les ranger parmi les
 * démonstrations les ferait disparaître des deux endroits, et mentirait sur la
 * raison.
 *
 * La décision est celle de klassci.com, pas celle de l'école : elle vit donc
 * dans la configuration de klassci.com. Vide par défaut — on ne cache personne
 * sans l'avoir demandé.
 *
 * L'école reste **adressable** par son lien direct. C'est la même règle que
 * pour la démonstration : ne plus proposer quelque chose n'est pas le retirer à
 * qui vient le chercher.
 */
function codesNonProposes(): string[] {
  return (process.env.PORTAIL_NON_PROPOSES ?? "")
    .split(",")
    .map((code) => code.trim().toLowerCase())
    .filter((code) => code !== "");
}

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

function lire(code: string, rejets: string[]): EtablissementInterne | null {
  if (!CODE_VALIDE.test(code)) {
    rejets.push(`${code} (code de format invalide)`);
    return null;
  }

  const suffixe = suffixeEnv(code);
  const secret = process.env[`REINSCRIPTION_SECRET_${suffixe}`];

  // Une école déclarée mais pas servie est une erreur de configuration, pas un
  // choix : la taire afficherait l'école au visiteur pour lui rendre une erreur
  // au premier envoi. Les motifs sont rassemblés et dits en UNE ligne par
  // `tous()` — une école manquante se remarque par ce qui ne s'affiche pas,
  // c'est-à-dire par rien, et un avertissement noyé parmi d'autres ne se
  // remarque pas davantage.
  if (typeof secret !== "string" || secret.length < LONGUEUR_MINIMALE_SECRET) {
    rejets.push(`${code} (REINSCRIPTION_SECRET_${suffixe} absent ou de moins de ${LONGUEUR_MINIMALE_SECRET} caractères)`);
    return null;
  }

  const base = process.env[`REINSCRIPTION_BASE_${suffixe}`];

  if (typeof base !== "string" || !base.startsWith("https://")) {
    rejets.push(`${code} (REINSCRIPTION_BASE_${suffixe} absent ou non https)`);
    return null;
  }

  return {
    code,
    libelle: process.env[`REINSCRIPTION_LABEL_${suffixe}`] ?? libelleParDefaut(code),
    base: base.replace(/\/+$/, ""),
    secret,
  };
}

let rejetsDejaDits = false;

function tous(): EtablissementInterne[] {
  const declares = (process.env.REINSCRIPTION_TENANTS ?? "")
    .split(",")
    .map((code) => code.trim().toLowerCase())
    .filter((code) => code !== "");

  const rejets: string[] = [];

  const servis = declares
    .map((code) => lire(code, rejets))
    .filter((etablissement): etablissement is EtablissementInterne => etablissement !== null);

  // Une fois par processus. `tous()` est appelé à chaque rendu, et par deux
  // chemins différents : répéter l'avertissement à chaque requête le noierait
  // exactement comme le faisaient les avertissements dispersés d'avant.
  if (rejets.length > 0 && !rejetsDejaDits) {
    rejetsDejaDits = true;
    console.warn(
      `[portail] ${rejets.length} etablissement(s) declare(s) dans REINSCRIPTION_TENANTS ` +
        `mais NON SERVIS : ${rejets.join(", ")}. ` +
        `Servis : ${servis.map((e) => e.code).join(", ") || "aucun"}.`,
    );
  }

  return servis;
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
    // L'instance de démonstration reste servie — son URL directe fonctionne,
    // une démonstration du parcours doit rester possible — mais elle n'est
    // plus PROPOSÉE. Elle s'affichait ici entre des écoles réelles, sous le nom
    // laissé par la dernière démonstration, et une famille pouvait y déposer un
    // dossier.
    .filter(({ code }) => !estDemonstration(code))
    .filter(({ code }) => !codesNonProposes().includes(code))
    .map(({ code, libelle }) => ({ code, libelle }))
    .sort((a, b) => a.libelle.localeCompare(b.libelle, "fr"));
}

/**
 * Un établissement par son code, s'il est servi — proposé ou non.
 *
 * La page d'une école ne doit PAS se fonder sur la liste du sélecteur. Elle le
 * faisait, et l'instance de démonstration en payait déjà le prix : son module
 * promet qu'elle « reste adressable par son URL directe », et son lien rendait
 * pourtant 404. Le même piège aurait frappé chaque école non proposée.
 *
 * Ne rien rendre pour une école qui n'est pas servie reste le bon
 * comportement : la page répond alors 404, et rien ne confirme à qui devine des
 * codes dans l'URL qu'un établissement est client de KLASSCI.
 */
export function etablissementServi(code: string): EtablissementVisible | null {
  const etablissement = etablissementAvecSecret(code);

  return etablissement === null
    ? null
    : { code: etablissement.code, libelle: etablissement.libelle };
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
