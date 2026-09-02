import { notFound } from "next/navigation";

/**
 * Attrape-tout de langue.
 *
 * Sans lui, une adresse inconnue sous `/fr` ou `/en` ne correspond a aucune
 * route et Next sert le `not-found` racine — donc sans la mise en page de
 * langue, sans navigation, sans traduction. Le visiteur atterrit sur une page
 * nue et repart. Ce fichier renvoie explicitement vers le 404 localise, qui
 * lui propose des chemins de sortie.
 */
export default function AdresseInconnue() {
  notFound();
}
