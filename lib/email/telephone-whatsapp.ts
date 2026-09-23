/**
 * Un numéro WhatsApp ivoirien, quand il sert de canal de vérification.
 *
 * Depuis 2021 les numéros ivoiriens ont dix chiffres. Les mobiles commencent
 * par 01 (Moov), 05 (MTN) ou 07 (Orange) : ce sont les seuls qui portent
 * WhatsApp, un fixe (21, 25, 27) ne recevra jamais le code.
 *
 * Module pur, partagé par le formulaire et la route serveur.
 */

const MOBILE_CI = /^(01|05|07)\d{8}$/;

/**
 * Le numéro au format international `+225XXXXXXXXXX`, ou `null` s'il n'est
 * pas un mobile ivoirien.
 *
 * Accepte ce qu'on tape vraiment : espaces, points, tirets, `+225`, `00225`.
 */
export function normaliserWhatsapp(brut: string): string | null {
  let chiffres = brut.replace(/[\s.\-()]/g, "");

  if (chiffres.startsWith("+225")) chiffres = chiffres.slice(4);
  else if (chiffres.startsWith("00225")) chiffres = chiffres.slice(5);
  else if (chiffres.startsWith("225") && chiffres.length === 13) chiffres = chiffres.slice(3);

  return MOBILE_CI.test(chiffres) ? `+225${chiffres}` : null;
}
