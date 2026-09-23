/**
 * Les domaines d'adresse e-mail qu'on sait faux, et ce qu'on propose à la place.
 *
 * UN seul fichier de données, lu à la fois par le navigateur (la suggestion
 * sous le champ) et par le serveur (le refus dans la route d'envoi). Le même
 * contenu vit côté KLASSCIv2 : les deux dépôts se déploient séparément et
 * aucun ne peut lire l'autre à la compilation. Toute modification ici se
 * reporte là-bas, dans le même sens et le même jour.
 *
 * Pas de logique ici, uniquement de la donnée : la règle qui s'en sert est
 * dans `verifier-email.ts`.
 */

/** Fautes de frappe connues : domaine fautif → domaine voulu. */
export const CORRECTIONS_CONNUES: Readonly<Record<string, string>> = {
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.fr": "gmail.com",
  "gemail.com": "gmail.com",
  "gmel.com": "gmail.com",
  "gnail.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yaoo.fr": "yahoo.fr",
  "yahoo.frr": "yahoo.fr",
  "outlok.fr": "outlook.fr",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "outlook.con": "outlook.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "live.fe": "live.fr",
  "icloud.co": "icloud.com",
};

/**
 * Les messageries de référence.
 *
 * Un domaine à deux modifications au plus de l'une d'elles est probablement
 * une faute de frappe. L'ordre compte : en cas d'égalité de distance, la
 * première l'emporte.
 */
export const DOMAINES_REFERENCE: readonly string[] = [
  "gmail.com",
  "yahoo.com",
  "yahoo.fr",
  "outlook.com",
  "outlook.fr",
  "hotmail.com",
  "hotmail.fr",
  "live.fr",
  "icloud.com",
];

/**
 * Domaines réels, voisins d'une référence, qu'il ne faut JAMAIS corriger.
 *
 * `ymail.com` est à une lettre de `gmail.com` et appartient à Yahoo ;
 * `mail.com` et `email.com` existent aussi. Sans cette liste, la distance
 * d'édition proposerait « gmail.com » à des adresses parfaitement valides.
 */
export const DOMAINES_REELS_VOISINS: ReadonlySet<string> = new Set([
  "ymail.com",
  "mail.com",
  "email.com",
  "gmx.com",
  "live.com",
  "live.ca",
  "live.be",
  "yahoo.ca",
  "yahoo.de",
  "yahoo.it",
  "yahoo.es",
  "hotmail.be",
  "hotmail.it",
  "hotmail.es",
  "hotmail.de",
  "outlook.be",
  "outlook.de",
  "outlook.es",
  "outlook.it",
]);

/**
 * Domaines qui ne reçoivent aucun courrier.
 *
 * `esbtp.edu.ci` a été généré par KLASSCI pour des comptes importés : il
 * n'existe pas, et une convocation envoyée là est perdue sans rebond visible.
 * Les sous-domaines sont refusés aussi (`mail.example.com`).
 */
export const DOMAINES_FACTICES: readonly string[] = [
  "esbtp.edu.ci",
  "example.com",
  "example.org",
  "test.com",
];

/** Au-delà, deux domaines sont trop éloignés pour qu'on suggère l'un pour l'autre. */
export const DISTANCE_MAXIMALE = 2;
