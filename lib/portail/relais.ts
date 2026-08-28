import "server-only";

import { isIP } from "node:net";

import { NextResponse, type NextRequest } from "next/server";

import { debitDepasse, lectureEnCache, retenirLecture } from "./amortisseur";
import { preparerAppel } from "./signature";
import { etablissementAvecSecret } from "./tenants";

/**
 * Le relais entre le navigateur du visiteur et l'instance KLASSCI de son école.
 *
 * Il existe pour une seule raison : le secret partagé ne doit jamais atteindre
 * le navigateur. Le visiteur parle à klassci.com, klassci.com signe et parle à
 * l'école. Personne d'autre ne peut appeler ces points d'entrée.
 *
 * Deux disciplines s'ajoutent, et ce sont elles qui font tout le travail :
 *
 * 1. On ne relaie que ce que KLASSCI attend. Le corps est reconstruit champ par
 *    champ par l'appelant à partir de ce qu'il a validé — jamais l'objet reçu
 *    tel quel. Sans cela, un champ ajouté par l'appelant traverserait le relais
 *    et entrerait dans la charge signée, avec notre secret pour l'authentifier.
 * 2. L'adresse transmise est celle que la plateforme a constatée, pas celle que
 *    l'appelant déclare. C'est cette adresse qui borne la limitation de débit
 *    côté KLASSCI ; la laisser au choix de l'appelant reviendrait à supprimer
 *    la limitation tout en la croyant en place.
 */

/**
 * Les points d'entrée publics de KLASSCI, côté instance.
 *
 * Deux canaux : la réinscription identifie un dossier existant, la candidature
 * n'identifie personne. Ils partagent ce relais, la signature et le registre —
 * mais pas leur protection, qui diffère par nature.
 */
export const CHEMINS = {
  reinscriptionLookup: "api/public/reinscription/lookup",
  reinscriptionSubmit: "api/public/reinscription/submit",
  inscriptionChoix: "api/public/inscription/choix",
  inscriptionSubmit: "api/public/inscription/submit",
} as const;

export type CheminPublic = (typeof CHEMINS)[keyof typeof CHEMINS];

/** Au-delà, l'instance est considérée injoignable. */
const DELAI_MAX_MS = 12_000;

/**
 * Ce que le relais accepte par établissement, par adresse et par minute.
 *
 * Le REGROUPEMENT compte autant que les chiffres, et il reprend celui de
 * KLASSCI (`CanalPortailPublic::seaux`) : un seau par établissement, par canal
 * et par nature. Donner un seau à chaque point d'entrée aurait laissé passer,
 * sur la réinscription, deux fois ce que l'école retient — elle compte
 * l'identification et l'envoi dans un compteur commun de dix.
 *
 * Par établissement, aussi : côté KLASSCI chaque instance a ses propres
 * compteurs, par construction. Une clé commune aux six écoles aurait fait
 * qu'une consultation du catalogue de l'une entame le quota d'une autre.
 */
const SEAUX: Record<CheminPublic, { groupe: string; maximum: number }> = {
  // Un seul compteur pour l'identification et l'envoi, comme côté école.
  [CHEMINS.reinscriptionLookup]: { groupe: "reinscriptions", maximum: 10 },
  [CHEMINS.reinscriptionSubmit]: { groupe: "reinscriptions", maximum: 10 },
  [CHEMINS.inscriptionSubmit]: { groupe: "candidatures", maximum: 10 },
  // Le catalogue a le sien, plus large : ouvrir le formulaire ne doit pas
  // coûter le droit de le déposer.
  [CHEMINS.inscriptionChoix]: { groupe: "candidatures-catalogue", maximum: 30 },
};

/** Les points d'entrée dont la réponse est la même pour tous les visiteurs. */
const LECTURES_PARTAGEES: ReadonlySet<string> = new Set([CHEMINS.inscriptionChoix]);

/**
 * Le seau par adresse est plein.
 *
 * Mot pour mot ce que l'école aurait répondu : même code, même phrase que
 * `SeauDeDebit::parAdresse`. Le relais refuse plus TÔT, pas autre chose — le
 * visiteur ne doit pas pouvoir distinguer les deux, sans quoi la même minute
 * de trafic produirait deux explications différentes du même refus.
 *
 * Surtout, ne rien dire de l'appareil du visiteur. Ce compteur porte sur une
 * adresse publique, et sous le NAT d'un opérateur — répandu en Côte d'Ivoire —
 * c'est un compteur partagé par tout un quartier. « Trop de tentatives depuis
 * cet appareil » accuserait alors quelqu'un qui a appuyé une seule fois.
 */
function tropDeTentatives(): NextResponse {
  return NextResponse.json(
    {
      enregistre: false,
      code: "trop_de_tentatives",
      message: "Trop de tentatives. Réessayez dans quelques minutes.",
    },
    { status: 429, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Réponse rendue quand le relais lui-même échoue.
 *
 * Volontairement distincte de « aucun dossier ne correspond » : dire
 * « introuvable » alors que l'école est injoignable enverrait la famille
 * vérifier un matricule qui est correct.
 */
function indisponible(): NextResponse {
  return NextResponse.json(
    { erreur: "indisponible" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * L'adresse du visiteur, telle que la plateforme l'a constatée.
 *
 * `requete.ip` est renseigné par la plateforme et n'est atteignable par aucun
 * en-tête : c'est la seule valeur qu'un appelant ne peut pas choisir. Elle
 * compte, parce que c'est elle qui borne la limitation par adresse côté
 * KLASSCI. Lire un en-tête à sa place laisserait n'importe qui s'attribuer un
 * compteur neuf à chaque requête, et supprimerait donc la borne tout en la
 * laissant croire en place.
 *
 * `x-forwarded-for` ne sert que de repli hors plateforme (développement,
 * exécution derrière un mandataire tiers) ; son premier élément est le client
 * d'origine.
 */
function adresseVisiteur(requete: NextRequest): string | null {
  const brute = requete.ip ?? requete.headers.get("x-forwarded-for")?.split(",")[0] ?? "";

  const adresse = brute.trim();

  // KLASSCI valide `ip_client` en `ip`, et c'est le SEUL champ du contrat que
  // le formulaire ne dessine pas. Une valeur fantaisiste — « unknown », ou un
  // `41.66.12.3:51321` que certains mandataires écrivent — produirait donc un
  // 422 dont le portail dirait au candidat « vérifiez les champs signalés »
  // sans en signaler aucun. Il corrigerait au hasard, renverrait, relirait la
  // même phrase, indéfiniment — et cela pour TOUS les candidats de l'école,
  // puisque la cause n'a rien à voir avec eux.
  //
  // Ce champ est injecté par le relais : c'est donc au relais de le refuser,
  // et `indisponible()` est le message honnête (« nous n'arrivons pas à
  // joindre l'établissement »).
  return isIP(adresse) === 0 ? null : adresse;
}

/**
 * Relaie un appel signé vers l'instance de l'école.
 *
 * Rend telle quelle la réponse de KLASSCI — corps et code de statut — parce que
 * c'est KLASSCI qui décide de ce que le visiteur a le droit de savoir. Le
 * relais n'interprète ni n'enrichit : réécrire ici « aucun dossier » en un
 * message plus précis reviendrait à défaire, depuis le site vitrine, la
 * discipline de réponse uniforme qui protège de l'énumération.
 */
export async function relayer(
  code: string,
  chemin: CheminPublic,
  corpsMetier: Record<string, unknown>,
  requete: NextRequest,
): Promise<NextResponse> {
  const etablissement = etablissementAvecSecret(code);

  if (etablissement === null) {
    return NextResponse.json(
      { erreur: "etablissement_inconnu" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  const adresse = adresseVisiteur(requete);

  if (adresse === null) {
    console.error("[portail] Adresse du visiteur indeterminable");

    return indisponible();
  }

  const maintenant = Date.now();

  const seau = SEAUX[chemin];

  if (debitDepasse(`${etablissement.code}:${seau.groupe}:${adresse}`, seau.maximum, maintenant)) {
    return tropDeTentatives();
  }

  // Le catalogue d'une école est le même pour tous ses visiteurs et ne bouge
  // que deux fois par an. Le relayer à chaque ouverture de formulaire faisait
  // de ce point d'entrée un amplificateur : aucun champ exigé, donc aucune
  // validation locale pour le freiner.
  const cleLecture = `${etablissement.code}:${chemin}`;
  const partagee = LECTURES_PARTAGEES.has(chemin);
  const enCache = partagee ? lectureEnCache(cleLecture, maintenant) : null;

  if (enCache !== null) {
    return new NextResponse(enCache.corps, {
      status: enCache.statut,
      headers: { "Content-Type": enCache.type, "Cache-Control": "no-store" },
    });
  }

  const appel = preparerAppel(
    // L'adresse est ajoutée ICI, jamais par l'appelant : c'est elle qui borne
    // la limitation de débit côté KLASSCI.
    { ...corpsMetier, ip_client: adresse },
    "POST",
    chemin,
    etablissement.secret,
  );

  try {
    const reponse = await fetch(`${etablissement.base}/${chemin}`, {
      method: "POST",
      headers: appel.entetes,
      // Le corps envoyé est EXACTEMENT celui qui a été signé. Re-sérialiser ici
      // produirait peut-être les mêmes octets, mais rien ne le garantirait.
      body: appel.corps,
      cache: "no-store",
      signal: AbortSignal.timeout(DELAI_MAX_MS),
    });

    // Un 401 ne vient jamais du visiteur : il signifie que notre signature a
    // été refusée — secret tourné d'un seul côté, ou horloge dérivée au-delà
    // de la fenêtre de cinq minutes. Sans cette ligne, la panne est
    // parfaitement muette : le portail d'une école entière se ferme et
    // l'utilisateur ne lit que « service momentanément indisponible ».
    if (reponse.status === 401) {
      console.error(
        `[portail] ${etablissement.code} refuse notre signature — secret desynchronise ou horloge derivee`,
      );
    }

    const texte = await reponse.text();
    const type = reponse.headers.get("Content-Type") ?? "application/json";

    if (partagee) {
      retenirLecture(cleLecture, { statut: reponse.status, corps: texte, type }, maintenant);
    }

    return new NextResponse(texte, {
      status: reponse.status,
      headers: { "Content-Type": type, "Cache-Control": "no-store" },
    });
  } catch (erreur) {
    // On journalise le code de l'établissement, jamais le matricule ni la date
    // de naissance : ce sont les deux moitiés d'un identifiant.
    console.error(`[portail] Instance ${etablissement.code} injoignable`, erreur);

    return indisponible();
  }
}
