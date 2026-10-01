# 09 · Direction du design system

Écrit pour la direction recommandée (B, « Une seule donnée »). Les tokens de
couleur et les règles d'accessibilité valent pour les trois directions ; seules
la typographie et la place du bleu changent si A ou C est retenue.

Le système vit dans `app/globals.css` (variables) et `tailwind.config.ts`,
comme aujourd'hui : on remplace les valeurs, on garde le mécanisme (classe
`html.dark`, tokens consommés par Tailwind).

## 1. Couleur

### Tokens de marque (invariants)

| Token | Valeur | Rôle |
|---|---|---|
| `--klassci-bleu` | `#0453CB` | Action principale, liens, structure |
| `--klassci-bleu-profond` | `#0A2E6B` | Bandes « système », fond sous l'orange |
| `--klassci-orange` | `#F58220` | La donnée qui circule ; jamais sous du texte blanc |
| `--klassci-orange-encre` | `#A84F00` | Orange en texte (5,0:1 sur le fond) |
| `--fond` | `#F6F4F0` | Fond de page |

### Tokens de rôle, clair

| Token | Valeur | Contraste sur `--fond` |
|---|---|---|
| `--encre` | `#0B1B33` | 15,7:1 |
| `--encre-2` | `#3A4558` | 8,8:1 |
| `--encre-3` (légendes) | `#5B6475` | 5,4:1 — plancher pour tout texte |
| `--papier` (documents, cartes) | `#FFFFFF` | — |
| `--filet` | `#DDD8CE` | Bordures (non textuelles) |
| `--succes` | `#0E7A4F` | 4,9:1 — statut payé / présent |
| `--attente` | `#8A5A00` | 5,4:1 — statut en attente |
| `--erreur` | `#B42318` | 6,0:1 — erreur de formulaire |

### Sombre

Le thème sombre n'est pas une inversion : fond bleu nuit `#08121F`, papier
`#0F1C2E`, encre `#ECEFF4`, bleu éclairci `#6EA2FF` pour les liens (le
`#0453CB` tombe sous 3:1 sur fond sombre), orange inchangé (il passe à ≈ 7:1
sur `#08121F`). Chaque token est redéfini, aucun composant ne porte de couleur
littérale.

### Règles

1. Bouton principal : bleu, texte blanc (6,8:1).
2. Orange : marqueur, pastille, trait, bouton d'accent **à texte bleu nuit**
   (6,6:1). Jamais en texte courant, jamais sur `#0453CB`.
3. Les couleurs d'école (portails) restent celles de l'école ; le calcul de
   contraste existant (`lib/vitrine/couleurs.ts`) reste la frontière.
4. Statuts : la couleur n'est jamais seule ; un mot ou une icône l'accompagne.

## 2. Typographie

| Rôle | Famille | Usage |
|---|---|---|
| Titres et texte | **Schibsted Grotesk** (400–800) | Une seule famille ; la hiérarchie vient de la taille et de la graisse |
| Identifiants | **JetBrains Mono** (500) | Matricules, codes UE — jamais pour les étiquettes de section, jamais pour les montants |

Atkinson Hyperlegible Next a été essayée puis écartée : son zéro barré (« 1 2Ø5
ØØØ F ») n'a pas d'alternative dans la version Google Fonts.

Échelle fluide (ratio 1,25), `clamp()` borné :

| Niveau | Taille | Interlignage |
|---|---|---|
| Affiche (H1 accueil) | `clamp(2.5rem, 5.5vw, 4.75rem)` | 1.02 |
| H1 page | `clamp(2.25rem, 4.5vw, 3.75rem)` | 1.05 |
| H2 | `clamp(1.75rem, 3vw, 2.5rem)` | 1.1 |
| H3 | `1.375rem` | 1.25 |
| Chapô | `1.25rem` | 1.5 |
| Corps | `1.0625rem` (17 px) | 1.6 |
| Légende | `0.875rem` | 1.45 |

- Corps à 17 px : on lit sur des écrans d'entrée de gamme.
- `text-wrap: balance` sur les titres, `pretty` sur les paragraphes ; lignes de
  texte ≤ 68 caractères.
- Chiffres tabulaires (`font-variant-numeric: tabular-nums`) dans tous les
  tableaux, tarifs et montants FCFA.
- Polices auto-hébergées par `next/font`, sous-ensembles latin + latin-ext,
  `display: swap` ; Schibsted Grotesk en police variable = un seul fichier,
  plus JetBrains Mono uniquement sur les pages qui affichent des identifiants.

## 3. Espace et grille

- Pas de base 4 px ; échelle `4 · 8 · 12 · 16 · 24 · 32 · 48 · 72 · 112`.
- Grille 12 colonnes, gouttière 24 px, marge latérale `clamp(16px, 4vw, 48px)`,
  conteneur 1240 px ; le texte long tient sur 7 colonnes.
- Rythme vertical variable : sections 112 px (bureau) / 72 px (mobile), groupes
  serrés à 24 px. Pas de pas uniforme sur toute la page.
- Rayons : 4 px (champs, pastilles), 8 px (cartes, captures), 16 px (bandes de
  section). Pas de rayon généralisé.

## 4. Composants

| Composant | Notes |
|---|---|
| Bouton | Principal (bleu), secondaire (contour encre), accent (orange, texte bleu nuit), lien. Cible tactile ≥ 44 px. États : survol, focus visible 2 px décalé, désactivé, chargement (le libellé reste lisible) |
| Lien | Souligné dans le texte courant ; jamais distingué par la couleur seule |
| Champ | Libellé au-dessus, aide sous le champ, erreur en ligne avec icône et texte ; `inputmode` adapté (téléphone, nombre) ; préfixe +225 non imposé |
| Nav globale + tiroir mobile | Voir `05` § 2 |
| Sous-navigation collante | Pastilles défilantes sur mobile, élément actif suivi au défilement |
| Station de flux | Numéro de station (vraie séquence), titre, une phrase, capture, lien docs ; état actif/inactif |
| Sélecteur de rôle | Onglets ARIA (`tablist`), une fiche, six vues |
| Capture produit | Cadre neutre, légende, agrandissement au clic (dialogue natif), `next/image`, AVIF/WebP, dimensions fixées |
| Document | Rendu d'un bulletin / reçu / PV : papier blanc, réglure, chiffres tabulaires |
| Carte tarif | Prix en Schibsted, période, « pour qui », capacités, actions ; la recommandée se distingue par sa position et son fond, pas par une bordure latérale |
| Comparateur | Tableau sémantique (`<table>`, `scope`), en-têtes collants ; mobile : deux colonnes au choix |
| FAQ | `<details>` natifs (conservés) |
| Témoignage | Citation, nom, rôle, établissement ; pas de photo inventée |
| Statistique | Uniquement si sourcée ; la source est affichée |
| Logo d'établissement | Fond neutre, nom complet sur deux lignes au besoin, jamais tronqué |
| Encadré (docs) | Validation, Attention, Astuce : fond teinté + icône + titre, pas de bordure latérale |
| Tableau (docs, blog) | Défilement horizontal **dans son conteneur** seulement |
| Infobulle | Uniquement en complément ; jamais seule porteuse d'information |
| Pied de page | Voir `07` |

## 5. Imagerie

- **Captures réelles** uniquement, refaites sur une instance de démonstration
  **remplie** (aucun état vide, aucun indicateur à « — »), en FR et en EN,
  bureau et téléphone. Un jeu de données de démonstration cohérent (une même
  école fictive clairement présentée comme démonstration) traverse toutes les
  captures.
- **Documents** produits par le logiciel (bulletin, reçu, PV, emploi du temps)
  rendus en PDF puis en image : c'est la preuve qu'un directeur reconnaît.
- **Photographie** : seulement de vrais établissements, avec accord. Les
  photos d'illustration actuelles (étudiants, cadenas, robot) sont conservées
  là où elles sont tant qu'elles n'ont pas de remplaçant réel, puis remplacées
  une à une.
- Pas d'illustration vectorielle « SaaS », pas d'icône décorative au-dessus de
  chaque titre.

## 6. Accessibilité (WCAG 2.1 AA, vérifiée par `axe` à chaque lot)

Contraste calculé (voir `06`), focus visible partout, ordre des titres sans
saut, formulaires étiquetés, erreurs annoncées (`aria-live`), onglets et
accordéons au clavier, dialogues natifs (`<dialog>`) avec retour du focus,
cible ≥ 44 px, zoom jamais bloqué, `prefers-reduced-motion` respecté, langue
déclarée par page, textes alternatifs descriptifs des captures.
