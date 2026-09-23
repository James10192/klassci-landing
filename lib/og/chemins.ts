/**
 * L'adresse de la carte d'une page de documentation.
 *
 * La documentation vit sous un segment `[[...slug]]` facultatif, où Next
 * refuse un `opengraph-image` (« Catch-all must be the last part of the URL »).
 * Ses cartes sont donc servies par une route à part, construite au déploiement
 * comme les autres. L'extension `.png` n'est pas décorative : sans point dans
 * l'adresse, le middleware de langue s'en saisirait et la redirigerait.
 */
export function cheminCarteDoc(locale: string, slug: string[] | undefined): string {
  const segments = slug && slug.length > 0 ? slug : ["index"];

  return `/cartes/docs/${locale}/${segments.join("/")}.png`;
}
