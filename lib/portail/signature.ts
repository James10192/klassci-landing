import "server-only";

import { createHmac } from "node:crypto";

/**
 * Signature HMAC-SHA256 des appels à l'export de réinscription KLASSCI.
 *
 * Le miroir exact de `App\Services\Reinscription\PortailSignatureVerifier`
 * côté KLASSCI. Trois points du contrat se paient cher si on les manque, et
 * chacun rend un 401 sans aucune explication :
 *
 * 1. La charge signée contient le CORPS BRUT, pas un objet ré-encodé. Il faut
 *    donc construire la chaîne JSON une seule fois, signer cette chaîne, et
 *    envoyer exactement ces octets-là. Sérialiser deux fois le même objet peut
 *    produire deux chaînes différentes ; côté KLASSCI, deux intergiciels
 *    globaux modifient de surcroît l'entrée après désérialisation.
 * 2. La méthode et le chemin entrent dans la charge. Sans eux, une signature
 *    émise pour /lookup serait arithmétiquement valide sur /submit.
 * 3. L'horodatage est en MILLISECONDES, sur treize chiffres. KLASSCI refuse
 *    explicitement un horodatage en secondes plutôt que d'échouer plus loin de
 *    façon opaque.
 *
 * Une signature n'est utilisable qu'une fois, dans une fenêtre de cinq minutes.
 */

export type AppelSigne = {
  corps: string;
  entetes: Record<string, string>;
};

/**
 * Le chemin tel que KLASSCI le voit : `$request->path()`, donc sans barre
 * oblique de tête ni de queue, et sans le nom de domaine.
 */
function cheminNormalise(chemin: string): string {
  return chemin.replace(/^\/+/, "").replace(/\/+$/, "");
}

export function chargeSignee(
  corpsBrut: string,
  methode: string,
  chemin: string,
  horodatageMs: number,
): string {
  return [horodatageMs, methode.toUpperCase(), cheminNormalise(chemin), corpsBrut].join(".");
}

export function signer(
  corpsBrut: string,
  methode: string,
  chemin: string,
  horodatageMs: number,
  secret: string,
): string {
  return createHmac("sha256", secret)
    .update(chargeSignee(corpsBrut, methode, chemin, horodatageMs), "utf8")
    .digest("hex");
}

/**
 * Prépare un appel signé : le corps à envoyer et les en-têtes qui
 * l'authentifient.
 *
 * Rendre les deux ensemble est délibéré. C'est ce qui empêche l'appelant de
 * signer un corps puis d'en envoyer un autre — la faute la plus facile à
 * commettre ici, et la plus difficile à diagnostiquer.
 */
export function preparerAppel(
  donnees: unknown,
  methode: string,
  chemin: string,
  secret: string,
  horodatageMs: number = Date.now(),
): AppelSigne {
  const corps = JSON.stringify(donnees);

  return {
    corps,
    entetes: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Klassci-Signature": signer(corps, methode, chemin, horodatageMs, secret),
      "X-Klassci-Timestamp": String(horodatageMs),
    },
  };
}
