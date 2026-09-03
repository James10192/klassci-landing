/**
 * Point d'entree du graphe.
 *
 * Une page appelle la fonction qui correspond a ce qu'elle est, et rend
 * `<JsonLd>`. Un seul `<script>` par page : plusieurs balises sont tolerees,
 * mais elles finissent par se contredire, et le script de controle ne sait
 * verifier les references `@id` qu'a l'interieur d'un meme graphe.
 */

export * from "./types";
export * from "./constantes";
export * from "./urls";
export * from "./serialiser";
export * from "./organization";
export * from "./website";
export * from "./breadcrumb";
export * from "./software-application";
export * from "./faq";
export * from "./tech-article";
export * from "./clients";
export * from "./pages";
