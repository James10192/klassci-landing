# Refonte klassci.com · Phase 1 (cadrage)

Ce dossier est le livrable de la phase 1 de la refonte de klassci.com. **Aucune
ligne du site n'a été modifiée** : la refonte ne commence qu'après validation de
ce dossier.

Règle qui gouverne tout le reste : **aucun contenu existant n'est supprimé.**
Chaque page, section, tarif, question, article, formulaire, école affichée,
appel à l'action, balise SEO, version française et version anglaise est
inventorié avec un identifiant, puis rattaché à son emplacement futur avec un
statut `PRESERVED`, `IMPROVED` ou `MOVED`. Le statut `DELETED` n'existe pas.

## Maquettes

Les trois directions artistiques sont dessinées sur un canevas de design :
<https://claude.ai/artifact/X4syTD799xYrbpsPP7B3U8>

21 planches, sept par direction : hero bureau, hero mobile, accueil, université,
collège, tarifs, documentation. Elles utilisent uniquement les vraies captures
du produit déjà publiées sur le site, et les textes réels de `messages/*.json`.
Le canevas est privé tant qu'il n'a pas été partagé depuis claude.ai.

## Sommaire

| Fichier | Livrable du brief | Contenu |
|---|---|---|
| `01-plan-du-site.md` | A | Les 49 adresses indexées, les portails par école, les redirections |
| `02-inventaire-contenu.md` | C | 97 éléments identifiés (`HOME-01`, `UNI-14`, `COL-03`…) |
| `03-audit.md` | D, H | Audit page par page, problèmes classés P0 à P3, mesures |
| `04-benchmark.md` | E, F, G | Synthèse des références ; détail dans `benchmarks/` |
| `05-architecture-information.md` | I | Navigation unique, parcours par visiteur, ordre des pages |
| `06-directions-artistiques.md` | J | Directions A, B, C et recommandation |
| `07-wireframes.md` | K | Structure de toutes les pages clés, portails et 404 compris |
| `08-mapping-avant-apres.md` | L | Chaque identifiant, son emplacement futur, son statut |
| `09-design-system.md` | M | Jetons, contrastes mesurés, typographie, composants |
| `10-mouvement.md` | N | Un mouvement orchestré par page, mouvement réduit |
| `11-plan-implementation.md` | O | Huit lots de PR, contrôles de passage, risques |
| `mapping.json` | — | Déclarations de déplacement lues par le contrôle de parité |
| `inventaire/` | B | Photographie du contenu de production (référence) |

Les captures d'écran avant refonte (1440, 1280, 1024, 768 et 390 px, toutes les
routes) ne sont pas versionnées : elles pèsent plusieurs centaines de mégaoctets
et se régénèrent.

## Le contrôle qui garantit « aucune perte »

`scripts/verifier-parite-contenu.mjs` compare le site refait à la photographie
de production stockée dans `inventaire/` :

```bash
# Photographier la production (référence, avant tout lot)
node scripts/verifier-parite-contenu.mjs --photographier --url https://www.klassci.com

# Comparer le site local après un lot
pnpm build && pnpm start &
node scripts/verifier-parite-contenu.mjs --url http://localhost:3000
```

Il vérifie, route par route et dans les deux langues : chaque bloc de texte
visible (y compris dans les fenêtres et les accordéons), chaque clé de
traduction, chaque fichier MDX, le titre, la canonique, les hreflang, les types
de données structurées et les champs des formulaires. Un texte qui disparaît
fait échouer le contrôle, sauf s'il est déclaré dans `mapping.json` avec son
nouvel emplacement et un statut valide. Il s'ajoute aux contrôles existants
(`pnpm verifier`), il n'en remplace aucun.

## Ce qui a été trouvé de plus important

Détail et preuves dans `03-audit.md`. Les sept problèmes P0, à corriger quelle
que soit la direction retenue :

1. Le site promet une assistance « 24h/24 » et les tarifs disent Lun-Jeu,
   Lun-Ven ou Lun-Sam.
2. La plateforme de cours (LMS) est vendue comme incluse dans PRO et Élite, et
   présentée ailleurs comme « en préparation ».
3. La section des témoignages affiche le titre de la bande précédente.
4. Les témoignages ne sont pas rattachés à des personnes vérifiables.
5. Des mentions de conformité (RGPD, cybersécurité, MESRS) ne sont étayées par
   aucun document public.
6. Deux offres différentes portent le même nom, « Formule Partenaire ».
7. `/en/blog` renvoie une 404, et ce lien figure dans le pied de page anglais de
   chaque page.

## Ce qu'on demande de valider

1. **La direction artistique** : A « Le Registre », B « Une seule donnée »
   (recommandée), ou C « L'école en mouvement ».
2. **La typographie** de la direction retenue (B : Schibsted Grotesk seule,
   JetBrains Mono pour les identifiants).
3. **Les cinq décisions de contenu** de `05-architecture-information.md` § 6 :
   bouton « Se connecter », nom des deux offres Partenaire, engagement
   d'assistance réel, statut réel du LMS, consentement des auteurs des
   témoignages.
4. **Le numéro WhatsApp commercial** à afficher, s'il en existe un distinct du
   standard.

Les points 3 et 4 ne se tranchent pas par le design : ce sont des faits que
seule l'équipe KLASSCI peut confirmer, et le site n'affichera rien qui ne l'ait
été.

## Suite

Après validation, la refonte se livre en huit lots, chacun dans sa propre PR
issue de la branche principale (détail dans `11-plan-implementation.md`) :
fondations et navigation, accueil, université, collège, LMS, documentation et
blog, portails et formulaires, mouvement et performance. Chaque lot passe
`pnpm verifier`, le contrôle de parité et le contrôle d'accessibilité avant
d'être proposé.
