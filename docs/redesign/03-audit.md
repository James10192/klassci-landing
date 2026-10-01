# 03 · Audit du site actuel

Constats faits sur la production le 1er octobre 2026 : captures à 1440, 1280,
1024, 768 et 390 px, lecture du code, exécution de `verifier-seo.mjs` contre
`https://www.klassci.com`. Chaque constat renvoie à un identifiant de
l'inventaire (`02-inventaire-contenu.md`).

## Ce qui est déjà solide — à protéger

Une refonte qui casse ceci recule, même si elle est plus belle.

1. **Le socle technique et SEO.** `verifier-seo` en production : 13 contrôles
   passés, 48 adresses valides au sitemap, 97 liens internes et 196 ressources
   résolus, toutes les images avec `alt`, canonique et hreflang cohérents,
   cartes de partage sur 14 pages. Le dépôt porte une batterie de contrôles
   (budget, données structurées, citations, accessibilité, traceurs) qu'aucun
   concurrent africain relevé ne possède.
2. **L'honnêteté du discours là où il a été retravaillé.** La bande
   d'établissements dit ce qu'elle est (« Ce n'est pas la liste de nos
   clients »). Le blog s'annonce « Ce que les textes disent vraiment » et
   rattache chaque affirmation réglementaire à sa source. La page Sécurité dit
   « Si vous nous quittez » et « Portée et limites ». C'est le ton à étendre au
   reste du site.
3. **Le blog et la documentation.** Sept guides de 12 à 27 minutes, sourcés
   (11 à 20 sources chacun), et une documentation organisée par univers, rôle et
   module, avec un « Quickstart 60 minutes » en 8 étapes vérifiables. C'est de
   l'autorité réelle, rare sur ce marché.
4. **Les vraies captures produit.** Le site montre l'application, pas des
   illustrations — même si les captures choisies desservent le propos (voir P1-3).
5. **Les portails d'inscription.** L'identité de chaque école est lue en direct
   sur son instance ; une école injoignable disparaît sans casser la page.

## Problèmes prioritaires

### P0 — Confiance (à corriger avant toute considération esthétique)

Un directeur qui relève une contradiction cesse de croire le reste.

| # | Constat | Où | Pourquoi c'est P0 |
|---|---|---|---|
| P0-1 | « Support client disponible 24h/24 », « Temps de réponse moyen : moins de 2 minutes » ; plus bas, les tarifs annoncent une assistance Lun-Jeu, Lun-Ven ou Lun-Sam selon la formule | UNI-18 vs UNI-21/23, COL-11 | Contradiction frontale sur un engagement de service |
| P0-2 | « SIS + LMS + API », « LMS inclus » dans les tarifs, alors que `/lms` dit « L'apprentissage numérique arrive » et que le titre de page dit « en préparation » | UNI-21, UNI-23 vs LMS-01 | On vend une capacité que le site déclare non livrée |
| P0-3 | Le titre de la section Témoignages est celui de la bande d'établissements (« Les établissements dont l'inscription en ligne est ouverte ici ») | UNI-13 | Défaut visible ; les témoignages n'ont pas de titre propre |
| P0-4 | Trois témoignages sans établissement nommé ; deux sans photo réelle ; chiffres « 48 heures » et « 30 % » non rattachés à une école | UNI-13, UNI-15 | Ce sont les seuls chiffres de résultat du site : invérifiables, ils affaiblissent tout le reste. À faire confirmer (nom, établissement, accord écrit) avant toute mise en avant ; à défaut, les garder à leur place actuelle sans les amplifier |
| P0-5 | Affirmations non documentées : « respect strict des normes RGPD », « équipe dédiée à la cybersécurité », « conformité MESRS » | UNI-16, UNI-24 | La page `/securite` est précise et prudente ; la page de vente ne l'est pas. Les deux doivent dire la même chose |
| P0-6 | Deux offres différentes portent le même nom « Formule Partenaire » (Université : 500 k + 15 k / élève via les frais ; Collège : configuration Élite sur devis) | UNI-24 vs COL-10 | Un groupe scolaire qui a les deux cycles lit deux promesses incompatibles |
| P0-7 | Sur **chaque page anglaise**, le pied de page renvoie « Guides and resources » vers `/en/blog`, qui répond **404** (vérifié le 1ᵉʳ octobre 2026). Le blog n'existe qu'en français ; le lien ne le dit pas. `verifier-seo` ne le voit pas (il ne suit pas ce lien en anglais) | G-04 (EN) | Un lien cassé dans le gabarit de toutes les pages anglaises, invisible des contrôles |

### P1 — Compréhension et preuve

| # | Constat | Où |
|---|---|---|
| P1-1 | **Le positionnement n'est dit nulle part.** L'accueil demande « Quel établissement gérez-vous ? » avant d'avoir dit ce que fait KLASSCI ; l'Université dit « La gestion universitaire, repensée » (formule interchangeable avec n'importe quel concurrent). Aucune page n'exprime l'idée qui distingue le produit : une seule donnée circule de l'inscription à la décision. | HOME-01, UNI-01 |
| P1-2 | **La valeur est présentée comme une liste de modules**, jamais comme un fonctionnement. 7 grandes fonctionnalités + 3 petites + 3 piliers à l'Université, 6 rôles + 8 modules au Collège : le visiteur doit reconstituer lui-même comment ces morceaux s'enchaînent. | UNI-03 à UNI-12, COL-04, COL-05 |
| P1-3 | **Les captures desservent la preuve.** Le module LMD — argument numéro un du supérieur — est illustré par un écran vide (« Aucun domaine LMD enregistré ») ; 3 captures sur 5 du Collège montrent des états vides ou des indicateurs à « — » ; sur mobile, des écrans de bureau réduits à 350 px sont illisibles. | UNI-09, COL-06, mobile |
| P1-4 | **Le produit réel est plus riche que ce que le site en dit.** Le journal des versions décrit la réconciliation de caisse OHADA (comptage par mode : espèces, Wave, Orange Money, MTN MoMo, Moov Money ; PV signable), les relances WhatsApp pré-remplies, l'accessibilité étudiante… rien de cela n'atteint les pages de vente, sauf l'accessibilité. | DOCS-11 vs UNI, COL |
| P1-5 | **Les tarifs Université cachent l'information décisive** : la comparaison des formules est repliée par défaut ; « pourquoi Élite coûte plus » n'est dit qu'en filigrane (« le niveau de service humain »). | UNI-21 à UNI-24 |
| P1-6 | **Le calculateur Collège ne calcule pas de rentabilité** : il recommande une formule et rapporte le budget papier au prix, sans gain chiffré, sans hypothèse affichée. Le titre promet plus que l'outil. | COL-07 |
| P1-7 | **Trois navigations différentes** (hub, Université, Collège) et trois boutons d'action principaux différents (« Contact », « Prendre contact », « Être informé ») ; la Classe virtuelle disparaît de la nav Université. | G-01 à G-03 |
| P1-8 | **Parcours de conversion mélangés** : « Essayer gratuitement », « Souscrire », « Tester gratuitement 1 mois », « Commencer gratuitement », « Demander une démonstration », « Choisir Élite » mènent tous au même formulaire `#contact`. Le visiteur ne sait pas ce qui se passera. | UNI-01, 21, 26, 27 |

### P2 — Design et lisibilité

| # | Constat | Où |
|---|---|---|
| P2-1 | Motifs génériques ou proscrits : titre en dégradé de couleurs (UNI-01) ; bordures latérales orange (COL-08, COL-11) ; repères numérotés « 01 · Confiance / 02 · Fonctionnalités / 02 · Témoignages / 07 · Témoignage / 08 · Sécurité » en tête de presque chaque section, numérotation incohérente ; grilles de cartes identiques (COL-04, COL-05, ODD) | Transverse |
| P2-2 | **Registre éditorial saturé.** IBM Plex Serif en graisse légère + petites capitales en Plex Mono espacées + filets : c'est aujourd'hui l'esthétique « éditoriale » par défaut des sites générés. Elle ne distingue plus KLASSCI. | Transverse |
| P2-3 | **Photographies d'illustration** d'apparence générée (étudiants souriants, homme en costume entouré d'icônes de cadenas, robot de chatbot) ; bannière Partenaire en image avec texte incrusté (police différente, deux fautes : « Ne perdez pas le temps appartenez », « bénéficier »), bouton dessiné dans l'image donc non cliquable, non traduit, illisible par lecteur d'écran. | UNI-14, 16, 18, 19 ; ODD |
| P2-4 | Bandeau photo sans contenu (UNI-19) ; vidéo sans affiche, rendue comme un rectangle gris (UNI-15) | UNI-15, UNI-19 |
| P2-5 | **Longueur** : la page Université mesure 16 960 px à 1440 et **21 678 px sur téléphone** (~26 écrans) ; Collège 17 003 px sur téléphone. Aucune navigation contextuelle ne permet de sauter aux tarifs ou à la FAQ sur mobile. | UNI, COL |
| P2-6 | L'accueil répète le logo (nav + hero) ; les portes d'univers posent du texte sur une capture voilée illisible ; la Classe virtuelle n'est qu'un bandeau ; la bande d'établissements tronque les noms par un fondu. | HOME |
| P2-7 | La documentation (fumadocs, titres gras noirs, autre typographie) ressemble à un autre produit ; l'encart « Le produit » de la barre latérale perd ses accents (« Universite et grandes ecoles »). | DOCS-G |
| P2-8 | Le blog n'a ni visuels, ni auteur identifiable au-delà d'« Équipe KLASSCI », ni sommaire sur les articles de 20+ minutes ; la carte d'article occupe toute la largeur pour un texte sur la moitié gauche. | BLOG |

### P3 — Accessibilité, mouvement, finitions

| # | Constat |
|---|---|
| P3-1 | Blanc sur l'orange de marque `#F58220` : 2,59:1 (échec AA, même en grand texte). L'exception est documentée dans `verifier-accessibilite.mjs`, mais le bouton principal de l'accueil et de nombreux CTA Collège en dépendent. Le système de couleur doit résoudre ce point, pas le contourner. |
| P3-2 | Le panneau de résultat du calculateur est rendu à `opacity: 0` côté serveur puis animé : sur une connexion lente, le résultat est invisible tant que le JavaScript n'a pas tourné. Le contenu doit être visible par défaut, l'animation ne faisant que l'accompagner. |
| P3-3 | Chaînes sans accents dans la 404 (« demandee », « existe », « Universite ») et dans la barre latérale de la doc. |
| P3-4 | Accroche du pied de page limitée au supérieur alors que le site couvre aussi collèges et lycées (G-04). |
| P3-5 | Contenu écrit mais jamais affiché : section détaillée « Accessibilité étudiante » (UNI-S1), textes de la porte LMS (HOME-S1). |

## Audit par page

### Accueil (HOME)
- **Rôle attendu** : hub. Il l'est, mais il ne dit ni ce qu'est KLASSCI ni pourquoi
  le croire avant de demander un choix. Le visiteur candidat (qui cherche son
  école) et la direction (qui cherche un logiciel) ont le même premier écran ;
  seul un petit bouton « S'inscrire » sert le premier.
- **Preuve** : la bande d'établissements est la meilleure preuve du site et elle
  est placée au bon endroit. Elle mérite mieux qu'un défilé tronqué.
- **Mobile** : correct, mais la composition produit du hero passe sous le pli et
  ses étiquettes deviennent minuscules.

### Université (UNI)
- **Ordre** : références → piliers → 7 fonctionnalités → 3 fonctionnalités →
  témoignages → bannière → vidéo → sécurité → ODD → support → photo →
  déploiement → tarifs → FAQ → contact → mot de l'équipe. Trois blocs de
  réassurance (sécurité, support, déploiement) sont séparés par l'ODD et une
  photo ; la confiance est dispersée au lieu d'être construite.
- **Modales « En savoir plus »** : contenu riche (6 puces par fonctionnalité)
  caché derrière un clic ; à conserver, mais il peut porter la page au lieu d'y
  être enfoui.
- **Tarifs** : l'idée « une seule offre, trois niveaux de service » est la bonne
  et différenciante ; elle est desservie par une comparaison repliée.

### Collège (COL)
- **Le meilleur moment** : « Chaque compte voit exactement ce qu'il doit
  traiter » — c'est la promesse « une donnée commune, des vues par rôle », à
  porter jusqu'au visuel (aujourd'hui, six cartes texte identiques).
- L'offre de lancement passe **avant** le H1 : on vend la remise avant le
  produit.
- Calculateur, tarifs, déploiement et paiement échelonné 40/30/30 : contenu
  commercial clair et honnête, présentation à hiérarchiser.
- Pas de FAQ ni de formulaire en page (modale seulement) : conservé tel quel,
  la refonte peut ajouter, jamais retirer.

### Classe virtuelle (LMS)
- Page d'attente honnête mais pauvre : trois cartes, un `mailto`. Elle doit dire
  précisément ce qui existe, ce qui arrive, et comment le LMS se branche sur le
  SIS — sans rien promettre de plus que la documentation `/docs/lms`.

### Documentation (DOCS)
- Fond excellent (étapes chronométrées, validations, captures). Forme :
  chrome fumadocs par défaut, rupture visuelle avec le site, captures petites,
  pas de filtre par rôle ou par module au-delà de la barre latérale.

### Blog (BLOG)
- Positionnement éditorial fort et rare. Gabarit trop sec : pas de sommaire,
  pas d'article à la une, pas d'auteur nommé, citations en bordure latérale.

### Institutionnel (INST)
- `/securite` est la page la plus rassurante du site et elle est reléguée dans
  un sous-menu « L'entreprise ». Elle doit être citée depuis chaque tarif et
  chaque FAQ sécurité.

### Portails (PORT)
- Ce sont les écrans que verront le plus de gens (familles, candidats). Ils
  portent l'identité de l'école, à juste titre. La refonte doit les traiter
  comme un produit : états d'erreur, pièces manquantes, rendez-vous et
  confirmation testés de bout en bout, sur 390 px d'abord.

## Mesures à reprendre avant et après chaque lot

| Mesure | Outil | Référence au 1er oct. 2026 |
|---|---|---|
| SEO technique | `pnpm verifier:seo:prod` | 13 / 13 passés |
| Parité de contenu | `node scripts/verifier-parite-contenu.mjs` | référence `inventaire/` |
| Données structurées | `pnpm verifier:schema` | à relever au lot 1 |
| Budget JS / images | `pnpm verifier:budget` | à relever au lot 1 |
| Accessibilité (axe, WCAG A/AA) | `node scripts/verifier-accessibilite.mjs` | 1 exception connue (P3-1) |
| Web Vitals | Vercel Speed Insights (terrain) | à relever au lot 1 |
