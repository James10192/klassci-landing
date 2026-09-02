import type { MetadataRoute } from "next";

/**
 * Le manifeste d'application.
 *
 * Beaucoup de directeurs d'etablissement consultent le site depuis un
 * telephone Android et gardent les outils qu'ils utilisent en raccourci sur
 * leur ecran d'accueil. Sans manifeste, ce raccourci porte une capture de la
 * page et le nom de domaine ; avec, il porte le logo et le nom du produit.
 * C'est aussi un signal d'installabilite que Lighthouse controle.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KLASSCI — logiciel de gestion scolaire",
    short_name: "KLASSCI",
    description:
      "Gestion des inscriptions, notes, bulletins, presences, emplois du temps et frais de scolarite, pour les etablissements d'Afrique de l'Ouest.",
    start_url: "/fr",
    scope: "/",
    display: "standalone",
    background_color: "#f6f4f0",
    theme_color: "#0453cb",
    lang: "fr",
    dir: "ltr",
    categories: ["education", "productivity", "business"],
    icons: [
      {
        src: "/icone-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icone-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icone-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
