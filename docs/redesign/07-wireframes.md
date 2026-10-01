# 07 · Wireframes

Wireframes de structure, indépendants de la direction artistique (ils valent
pour A, B ou C). Chaque bloc porte l'identifiant d'inventaire qu'il reprend.
Bureau à gauche (1440), téléphone en dessous (390) quand l'ordre change.
Les rendus de direction sont sur le canevas (voir `00-README.md`).

Conventions : `[Bouton]`, `(lien)`, `▾` menu, `▣` capture produit réelle,
`◎` donnée qui circule (direction B), `…` contenu repris à l'identique.

---

## Nav globale et pied de page (G-01→G-04)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ KLASSCI   Produits▾  Tarifs▾  Ressources▾  L'entreprise▾    S'inscrire  Se connecter  fr/en ◐  [Demander une démo] │
└──────────────────────────────────────────────────────────────────────────────────────┘
 Produits ▾ ─────────────────────────────────────────────────────────────
 │ Une seule donnée, de l'inscription à la décision (→ /#flux)          │
 │ ▣ Université & Grandes écoles   LMD · BTS · crédits · délibération  │
 │ ▣ Collège & Lycée               trimestres · caisse · parents       │
 │ ▣ Classe virtuelle              cours · devoirs · connecté au SIS   │
 └───────────────────────────────────────────────────────────────────────

 Téléphone : [KLASSCI]                              [Démo] [☰]
   ☰ → tiroir plein écran : Produits (3) · Tarifs (2) · Ressources (4)
       · L'entreprise (4) · S'inscrire · Se connecter · fr/en · ◐
       · [Demander une démo] fixé en bas
```

```
PIED DE PAGE (G-04, toutes les colonnes et liens actuels conservés)
┌───────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ KLASSCI       │ Produit (4)  │ Ressources(4)│ Entreprise(4)│ Contact      │
│ accroche      │              │              │              │ e-mail, ville│
│ (multi-cycle) │              │              │              │ FB · LinkedIn│
├───────────────┴──────────────┴──────────────┴──────────────┴──────────────┤
│ © année KLASSCI · African Digit Consulting       Établissements ouverts → │
└────────────────────────────────────────────────────────────────────────────┘
```

## Accueil `/` (HOME)

```
┌ HERO (HOME-01 + HOME-03) ─────────────────────────────────────────────────────┐
│ Le logiciel qui fait tourner l'établissement, de l'inscription à la décision.│  ← catégorie nommée
│ ┌──────────────────────────────┐                                              │
│ │ Quel établissement           │   ▣ composition produit réelle :             │
│ │ gérez-vous ?                 │     bureau (LMD/bulletins) + mobile (parent) │
│ │ (H1 conservé)                │     + reçu de caisse (HOME-01 étiquettes)    │
│ │ sous-titre conservé          │                                              │
│ │ [Université & Grandes écoles]│                                              │
│ │ [Collège & Lycée]            │                                              │
│ │ (Classe virtuelle)           │                                              │
│ │ « Un compte, une école… »    │                                              │
│ │ (Je suis candidat : s'inscrire →)                                           │
│ └──────────────────────────────┘                                              │
├ ÉTABLISSEMENTS OUVERTS (HOME-02, note conservée) ─────────────────────────────┤
│ [logo] Nom complet · Ville   [logo] …   (grille fixe, pas de défilé tronqué)  │
├ PORTES (HOME-04, 05, 06 + HOME-S1) ───────────────────────────────────────────┤
│ ┌ Université ───────────┐ ┌ Collège ─────────────┐ ┌ Classe virtuelle ──────┐ │
│ │ ▣ capture nette       │ │ ▣ capture nette      │ │ statut honnête          │ │
│ │ tag · nom · desc      │ │ tag · nom · desc     │ │ (« Bientôt » / livré)   │ │
│ │ métrique · compatible │ │ métrique · compatible│ │ desc · [Être informé]   │ │
│ │ [Découvrir]           │ │ [Découvrir]          │ │ (Explorer)              │ │
│ └───────────────────────┘ └──────────────────────┘ └────────────────────────┘ │
├ #flux UNE SEULE DONNÉE CIRCULE ────────────────────────────────────────────────┤
│ ◎ Demande ─ Dossier ─ Paiement ─ Classe ─ Cours ─ Présence ─ Évaluation       │
│   ─ Note ─ Bulletin ─ Décision                                                 │
│   chaque station : 1 phrase + ▣ écran réel + (doc →)                          │
├ CHACUN VOIT CE QU'IL DOIT VOIR ────────────────────────────────────────────────┤
│ [Direction][Scolarité][Comptabilité][Enseignant][Parent][Élève]  ← onglets     │
│ ▣ même fiche élève, vue du rôle choisi + 1 phrase (textes COL-04)             │
├ CONFIANCE (résumé /securite) ──────────────────────────────────────────────────┤
│ Une base par établissement · Sauvegardes quotidiennes · Qui accède à quoi ·   │
│ Si vous nous quittez                                   (Lire la page Sécurité)│
├ RESSOURCES ────────────────────────────────────────────────────────────────────┤
│ Dernier guide (BLOG) · Quickstart 60 min (DOCS-01) · Nouveautés (DOCS-11)     │
├ DÉMO (G-08) ───────────────────────────────────────────────────────────────────┤
│ Demandez une démonstration · formulaire (champs UNI-26) · réponse sous 24 h   │
└ PIED DE PAGE ──────────────────────────────────────────────────────────────────┘

Téléphone : H1 → 2 boutons d'univers pleine largeur → lien candidat → capture
(une seule, recadrée lisible) → établissements en grille 2 colonnes → portes
empilées → flux vertical (ligne le long du bord gauche) → onglets de rôle en
pastilles défilantes → confiance → ressources → démo.
```

## Université `/universite` (UNI)

```
┌ HERO (UNI-01) ─────────────────────────────────────────────────────────────────┐
│ La gestion universitaire, repensée.      (H1 conservé, couleur unie)          │
│ Logiciel de gestion pour universités et grandes écoles : LMD, BTS, … (chapô)  │
│ [Demander une démo]  (Voir comment ça marche ↓)   « navigateur, sans install. »│
│ ▣ défilé des 9 captures étiquetées (contrôlable, pause, sans auto sur mobile) │
├ SOUS-NAV COLLANTE : Fonctionnement · Fonctionnalités · Rôles · Confiance ·    │
│   Déploiement · Tarifs · FAQ · Démo                                           │
├ ÉTABLISSEMENTS (UNI-02) ───────────────────────────────────────────────────────┤
├ PILIERS (UNI-03) Simple · Complet · Sécurisé (texte conservé) ─────────────────┤
├ LE CYCLE D'UNE ANNÉE (UNI-04→11) ──────────────────────────────────────────────┤
│ intro « Ce que KLASSCI fait pour vous » (UNI-04)                               │
│ ◎ Inscription ─ Planning ─ Présences ─ Notes ─ LMD ─ Finances ─ Personnel     │
│   ┌ station active ──────────────────────────────────────────────────────┐   │
│   │ titre + description (texte conservé)    ▣ capture (non vide)          │   │
│   │ 6 puces de la modale, visibles ici      (En savoir plus → modale)     │   │
│   │ (Voir dans la documentation →)                                         │   │
│   └────────────────────────────────────────────────────────────────────────┘   │
├ FONCTIONNALITÉS SECONDAIRES (UNI-12) ──────────────────────────────────────────┤
├ ACCESSIBILITÉ ÉTUDIANTE (UNI-11 + UNI-S1 affichée) ────────────────────────────┤
│ ▣ capture · 4 cartes · chiffres marqués « instance de démonstration »          │
├ TÉMOIGNAGES (UNI-13, titre propre) + VIDÉO (UNI-15, affiche + transcription)  ┤
├ CONFIANCE UNIFIÉE (UNI-16, UNI-18, UNI-20) ────────────────────────────────────┤
│ Sécurité (aligné /securite) │ Support (engagement réel) │ Déploiement 4 étapes │
│                              3 garanties                                       │
├ FORMULE PARTENAIRE (UNI-14 reconstruite en HTML, même message) ────────────────┤
├ #tarifs (UNI-21→24) ───────────────────────────────────────────────────────────┤
│ Une seule offre, trois niveaux de service (titre + sous-titre)                 │
│ ┌ Essentiel ──────┬ PRO ────────────┬ ÉLITE (recommandée) ───────────────────┐ │
│ │ 700 k / an      │ 1,15 M / an     │ 4,8 M / an                            │ │
│ │ ≤ 500 élèves    │ ≤ 1 500 élèves  │ illimité                              │ │
│ │ pour qui        │ pour qui        │ pour qui                              │ │
│ │ [Choisir]       │ [Choisir]       │ [Souscrire] (Tester 1 mois)           │ │
│ ├─────────────────┴─────────────────┴───────────────────────────────────────┤ │
│ │ Ce qui change : comparaison DÉPLIÉE (Produit, Capacités, Service, Tarif)  │ │
│ │ Pourquoi Élite coûte plus : jours-dev, account manager, support 6j/7…     │ │
│ ├────────────────────────────────────────────────────────────────────────────┤ │
│ │ Inclus partout (UNI-22) · Première année / mensualisation                 │ │
│ └────────────────────────────────────────────────────────────────────────────┘ │
│ Pas de budget cash ? Formule Partenaire (UNI-24) · note hébergement/migration │
├ IMPACT ODD (UNI-17) ───────────────────────────────────────────────────────────┤
├ FAQ (UNI-25) ──────────────────────────────────────────────────────────────────┤
├ #contact DÉMO (UNI-26) + MOT DE L'ÉQUIPE (UNI-27), photo UNI-19 en fond ───────┤
└ PIED DE PAGE ──────────────────────────────────────────────────────────────────┘

Téléphone, tarifs : Élite en premier, puis PRO, Essentiel ; la comparaison
devient un sélecteur « comparer [Élite ▾] avec [PRO ▾] » (2 colonnes lisibles)
au lieu d'un tableau à 4 colonnes illisible.
```

## Collège `/college` (COL)

```
┌ BANDEAU OFFRE (COL-01) : -30 % première année · 50 établissements (Voir) ────┐
├ HERO (COL-02) ─────────────────────────────────────────────────────────────────┤
│ Le collège entier, dans un seul logiciel.  (H1 conservé)                       │
│ sous-titre · [Demander un devis] (Voir les interfaces)   ▣ bureau + mobile    │
├ BANDE D'INTERFACES (COL-03) ───────────────────────────────────────────────────┤
├ SOUS-NAV : Fonctionnement · Comptes · Modules · Interfaces · Rentabilité ·     │
│   Tarifs · Déploiement · Devis                                                │
├ UNE JOURNÉE AU COLLÈGE ────────────────────────────────────────────────────────┤
│ 07:30 appel (Présences) · 10:00 caisse (Frais) · 14:00 notes · 17:00 parent   │
│   chaque créneau = un module COL-05 + ▣                                        │
├ COMPTES PAR ACTEUR (COL-04) : onglets 6 rôles → même fiche, vue du rôle ──────┤
├ MODULES CLÉS (COL-05) : 8 modules, liste compacte à 2 colonnes, pas 8 cartes ─┤
├ #interfaces (COL-06) : 5 captures remplies, légendes conservées ──────────────┤
├ #rentabilite (COL-07) ─────────────────────────────────────────────────────────┤
│ 3 champs │ Formule recommandée · tarif · papier · heures · HYPOTHÈSES visibles│
│          │ [Recevoir mon devis]   (résultat visible avant tout JavaScript)   │
├ #tarifs (COL-08→10) : Élite · PRO · Essentielle · comparaison · 167 FCFA/élève│
│   · Formule Partenaire (nom distinct de celle de l'Université) · note          │
├ DÉPLOIEMENT (COL-11) : 40/30/30 · 6 inclusions · [Demander un devis] ─────────┤
├ IMPACT ODD (COL-12) ───────────────────────────────────────────────────────────┤
└ PIED DE PAGE · modale devis (COL-14) ──────────────────────────────────────────┘
```

## Classe virtuelle `/lms` (LMS)

```
┌ HERO (LMS-01) : titre, chapô, statut honnête, [Être informé] ─────────────────┐
├ CE QUI EXISTE / CE QUI ARRIVE (d'après /docs/lms seulement) ───────────────────┤
├ TROIS CAPACITÉS (LMS-02) ──────────────────────────────────────────────────────┤
├ BRANCHÉ SUR LE SIS : classes, enseignants, élèves synchronisés ; note de      │
│   devoir → moyenne → bulletin (schéma de flux, même ◎ que l'accueil)          │
├ (Docs LMS →) (LMS-03) ─────────────────────────────────────────────────────────┤
└ PIED DE PAGE ──────────────────────────────────────────────────────────────────┘
```

## Documentation `/docs/*` (DOCS)

```
┌──────────────┬──────────────────────────────────────────────┬────────────────┐
│ KLASSCI Docs │ Fil d'Ariane                                  │ Sur cette page │
│ [Rechercher ⌘K]│ Titre                                       │ sommaire       │
│ Filtres :    │ chapô · rôle(s) concerné(s) · module · durée │                │
│ Rôle ▾ Module▾│ … contenu MDX inchangé …                    │ Copier le lien │
│ Mise en route│ captures cliquables (agrandissement)          │ Signaler       │
│ Univers      │ encadrés Validation / Attention               │                │
│ Par rôle     │                                               │                │
│ Par module   │ ← Précédent            Suivant →              │                │
│ Référence    │ « Voir sur le site » (page produit liée)      │                │
│ FR/EN ◐      │                                               │                │
└──────────────┴──────────────────────────────────────────────┴────────────────┘
Téléphone : barre « ☰ Sommaire · Rechercher » collante ; sommaire de page
repliable en tête.
```

## Blog (BLOG)

```
INDEX                                          ARTICLE
┌ Ce que les textes disent vraiment ┐          ┌ Accueil / Guides / Catégorie ─────┐
│ chapô conservé                    │          │ Titre                              │
│ catégories (filtres)              │          │ chapô · auteur nommé · date · min  │
├ À LA UNE : dernier article,       ┤          │ sources citées : 11                │
│  grand titre + chapô + sources    │          ├──────────────┬─────────────────────┤
├ Liste : titre · chapô · méta      ┤          │ sommaire     │ texte (65 car.)     │
│  (2 colonnes sur bureau)          │          │ collant      │ citations encadrées │
└ Inscription à la lettre (si existe)          │              │ (pas de bordure    │
                                               │              │  latérale)          │
                                               ├──────────────┴─────────────────────┤
                                               │ Sources (notes numérotées)         │
                                               │ Articles liés · page produit liée  │
                                               │ Partager · CTA démo discret        │
                                               └────────────────────────────────────┘
```

## Pages institutionnelles (INST)

Gabarit unique : titre, chapô (`description` du MDX), sommaire latéral, texte,
nav institutionnelle (les 4 pages). `/securite` gagne un encadré d'en-tête
« En bref » mis en avant (contenu existant) et des liens retour vers les tarifs.

## Portails (PORT)

```
LISTE /inscription/universite             PORTAIL D'ÉCOLE /inscription/universite/[ecole]
┌ Trouvez votre établissement ┐           ┌ [logo école] Nom · ville  (couleurs de l'école)┐
│ [Rechercher une école…]     │           │ Étapes : Identité · Formation · Pièces ·        │
│ ┌logo┐ Nom · Ville  (→)     │           │          Vérification · Envoi   (barre 1→5)   │
│ ┌logo┐ Nom · Ville  (→)     │           ├────────────────────────────────────────────────┤
│ …                            │           │ Un écran = une question, gros champs, 390 px   │
│ Vous ne trouvez pas ? (aide)│           │ Erreurs en ligne, sauvegarde du brouillon       │
└─────────────────────────────┘           │ [Continuer]                                     │
                                          ├ Suivi de demande · pièces manquantes · état ───┤
                                          └ Propulsé par KLASSCI (discret)                 ┘
RENDEZ-VOUS : créneaux par jour, confirmation, convocation (télécharger / renvoyer)
RÉINSCRIPTION : identification → vérification → confirmation → succès
VÉRIFICATION E-MAIL : code à 6 chiffres + lien ; états expiré / déjà utilisé
```

Ces écrans gardent **l'identité de l'école** : la refonte KLASSCI ne s'y voit
que dans la qualité des composants (champs, erreurs, étapes), jamais dans la
couleur.

## 404 (G-07)

```
┌ Cette page n'existe pas (accents rétablis) ┐
│ texte conservé                              │
│ 4 reprises : Université · Collège · Docs · Accueil
│ + Rechercher dans la documentation          │
└─────────────────────────────────────────────┘
```
