# 05 · Architecture d'information proposée

Principe directeur : **aucune URL ne bouge.** Les 49 adresses indexées et les
routes de portail gardent leur chemin ; on réorganise ce qu'elles contiennent et
la façon d'y accéder. Les ajouts éventuels sont des **ajouts**, jamais des
remplacements.

## 1. Quatre visiteurs, quatre parcours

| Visiteur | Ce qu'il cherche | Porte d'entrée | Destination | Action |
|---|---|---|---|---|
| **Direction** (fondateur, DG, directeur des études) | Comprendre, comparer, être rassuré | Accueil → univers | Page univers → tarifs | « Demander une démonstration » |
| **Établissement prêt** (a déjà vu une démo) | Prix, conditions, délai | Lien direct, recherche « tarif logiciel scolaire » | `/universite#tarifs`, `/college#tarifs` | « Demander un devis » (pré-rempli : formule, effectif) |
| **Utilisateur KLASSCI** (secrétaire, comptable, enseignant) | Savoir faire une tâche, se connecter | Nav « Documentation », « Se connecter » | `/docs/...` | Guide, puis son instance |
| **Candidat / famille** | Trouver son école, s'inscrire, son rendez-vous | Nav « S'inscrire », lien de l'école | `/inscription/universite/[ecole]` | Déposer sa candidature |

Ces quatre parcours ne doivent **jamais se mélanger dans un même bouton**.
Aujourd'hui, six libellés différents mènent au même formulaire (audit P1-8).

## 2. Navigation globale (une seule, partout)

Remplace les trois navigations actuelles (G-01, G-02, G-03) **en reprenant tous
leurs liens**.

```
[KLASSCI]   Produits ▾   Tarifs ▾   Ressources ▾   L'entreprise ▾        S'inscrire · Se connecter · FR/EN · ◐   [Demander une démo]
```

| Menu | Contenu | Reprend |
|---|---|---|
| Produits ▾ | Université & Grandes écoles · Collège & Lycée · Classe virtuelle ; en tête du menu : « Une seule donnée, de l'inscription à la décision » (→ section flux de l'accueil) | G-01 (univers), G-03 « Fonctionnalités », G-02 « Fonctionnalités » |
| Tarifs ▾ | Université (→ `/universite#tarifs`) · Collège (→ `/college#tarifs`) · Formules Partenaire (les deux, nommées distinctement — voir P0-6) | G-02 « Tarifs », G-03 « Devis » |
| Ressources ▾ | Documentation · Guides (blog) · Journal des versions · Référence API | G-01/G-02 « Documentation », pied de page « Ressources » |
| L'entreprise ▾ | À propos · Sécurité des données · Confidentialité · Mentions légales | G-01 « L'entreprise » |
| S'inscrire | → `/inscription` (candidats) | G-01/G-02 « S'inscrire » |
| Se connecter | **Ajout** : « Trouver mon établissement » → liste des instances (même registre que le portail, `lib/portail/tenants.ts`) | — (nouveau, à valider) |
| Demander une démo | Bouton principal, ouvre le formulaire de démonstration | « Contact », « Prendre contact », « Être informé » |
| FAQ | Reste dans la page Université (ancre `#faq`) et dans la sous-navigation | G-02 « FAQ » |

Sur mobile : un tiroir plein écran en trois groupes (Produits, Ressources,
Entreprise), puis les deux actions personnelles (S'inscrire, Se connecter) et
le bouton « Demander une démo » fixé en bas du tiroir.

## 3. Navigation contextuelle des pages univers

Une barre secondaire collante apparaît sous la nav globale dès qu'on quitte le
hero de `/universite` et `/college`. Elle réutilise **les ancres existantes**
(`#fonctionnalites`, `#interfaces`, `#tarifs`, `#impact`, `#contact`) et en
ajoute sans en retirer.

- **Université** : Fonctionnement · Fonctionnalités · Rôles · Confiance · Déploiement · Tarifs · FAQ · Démo
- **Collège** : Fonctionnement · Comptes · Modules · Interfaces · Rentabilité · Tarifs · Déploiement · Devis

Sur téléphone : une ligne défilante horizontale de pastilles, l'élément actif
centré. C'est la réponse à une page de 26 écrans (audit P2-5) : on ne raccourcit
pas en retirant, on rend chaque partie atteignable en un geste.

## 4. Organisation des pages

Les identifiants renvoient à l'inventaire. **Gras** = section nouvelle, construite
uniquement à partir de contenu existant ou de faits produit vérifiables dans la
documentation (jamais inventée).

### Accueil `/` (hub)

| # | Section | Reprend |
|---|---|---|
| 1 | Hero : positionnement + choix d'univers dans le même écran (« Quel établissement gérez-vous ? » reste la question, posée après une phrase qui dit ce qu'est KLASSCI) + preuve produit réelle | HOME-01, HOME-03 |
| 2 | Établissements dont l'inscription est ouverte (note explicative conservée mot pour mot) | HOME-02 |
| 3 | Portes d'univers : Université, Collège, Classe virtuelle (la 3ᵉ devient une vraie porte, avec les textes HOME-S1) | HOME-04, 05, 06, S1 |
| 4 | **Une seule donnée circule** : demande → dossier → paiement → classe → cours → présence → évaluation → note → bulletin → décision | Modules UNI-05→12 et COL-05, docs |
| 5 | **Chacun voit ce qu'il doit voir** : sélecteur de rôle sur une même fiche | COL-04, UNI-12 « Tableau de bord par rôle » |
| 6 | **Confiance** : une base par établissement, sauvegardes, accès, réversibilité — résumé de `/securite`, lien | UNI-16, UNI-20 assurances, INST-02 |
| 7 | **Ressources** : dernier guide, quickstart, journal des versions | BLOG, DOCS-01, DOCS-11 |
| 8 | Demande de démonstration | G-08 |
| 9 | Pied de page | G-04 |

### Université `/universite`

| # | Section | Reprend |
|---|---|---|
| 1 | Hero (H1 conservé, catégorie nommée dans le chapô) + défilé des 9 captures | UNI-01 |
| 2 | Établissements ouverts | UNI-02 |
| 3 | Trois piliers Simple / Complet / Sécurisé | UNI-03 |
| 4 | **Le cycle d'une année LMD** (candidature → inscription → UE/ECUE → présences → évaluations → délibération → PV) : chaque étape ouvre la fonctionnalité correspondante et sa modale | UNI-04 à UNI-11 (textes et modales conservés intégralement) |
| 5 | Fonctionnalités secondaires | UNI-12 |
| 6 | Accessibilité étudiante (section détaillée enfin affichée) | UNI-11, UNI-S1 |
| 7 | Témoignages (titre propre) + vidéo avec affiche | UNI-13, UNI-15 |
| 8 | **Bloc confiance unifié** : sécurité, support (aligné sur les engagements des formules), déploiement en 4 étapes + 3 garanties | UNI-16, UNI-18, UNI-20 |
| 9 | Formule Partenaire (bannière reconstruite en HTML, même message) | UNI-14 |
| 10 | Tarifs : Élite, inclus, comparaison **dépliée sur bureau**, Partenaire, note | UNI-21 à UNI-24 |
| 11 | Impact ODD (9) | UNI-17 |
| 12 | FAQ | UNI-25 |
| 13 | Démonstration + mot de l'équipe | UNI-26, UNI-27 |
| 14 | Photo (UNI-19) : conservée comme fond du bloc Démonstration | UNI-19 |

### Collège `/college`

| # | Section | Reprend |
|---|---|---|
| 1 | Hero (H1 conservé) ; offre de lancement en bandeau sous la nav au lieu d'avant le titre | COL-02, COL-01 |
| 2 | Bande d'interfaces | COL-03 |
| 3 | **Une journée au collège** : 7 h l'appel, 10 h la caisse, 14 h les notes, 17 h le parent reçoit… | COL-04, COL-05 |
| 4 | Comptes par acteur (sélecteur de rôle sur une fiche élève) | COL-04 |
| 5 | Modules clés | COL-05 |
| 6 | Interfaces produit (captures remplies, pas d'états vides) | COL-06 |
| 7 | Calculateur (hypothèses affichées, résultat visible par défaut) | COL-07 |
| 8 | Tarifs, inclus, comparaison, prix par élève, Partenaire | COL-08 à COL-10 |
| 9 | Déploiement + paiement échelonné | COL-11 |
| 10 | Impact ODD | COL-12 |
| 11 | Modale de devis | COL-14 |

### Classe virtuelle `/lms`

Hero (LMS-01) · **ce qui existe aujourd'hui / ce qui arrive** (sur la base de
`/docs/lms` uniquement) · trois capacités (LMS-02) · **comment le LMS se branche
sur le SIS** (classes, enseignants, notes qui remontent au bulletin) · « Être
informé » (même `mailto`, plus un formulaire si validé) · lien docs (LMS-03).

### Documentation, blog, institutionnel, portails

Mêmes URL, même contenu. Changent : le gabarit (`09-design-system.md`), la
navigation interne (filtres par rôle et par module en docs, sommaire et article
à la une au blog), et le lien croisé **marketing ↔ documentation** : chaque
fonctionnalité des pages univers pointe vers la page de doc qui la montre.

## 5. Liens croisés obligatoires

| De | Vers | Pourquoi |
|---|---|---|
| Chaque fonctionnalité (UNI-05→11, COL-05) | Page de doc correspondante | « Voyez exactement comment cela fonctionne » (preuve) |
| Chaque bloc tarifs | `/securite`, FAQ, journal des versions | Les objections d'un acheteur prudent |
| Footer | Toutes les routes indexées | Conserver le maillage actuel (le pied de page de l'accueil a été ajouté pour ça) |
| 404 | Université, Collège, Docs, Accueil | Conservé (G-07) |
| Article de blog | Univers concerné + doc concernée | Le blog est un levier d'autorité, il doit mener quelque part |

## 6. Ce qui reste à décider (bloquant pour le lot 1)

1. **« Se connecter »** : ajouter l'entrée « Trouver mon établissement » ? (registre
   des instances déjà présent côté portail).
2. **Formules Partenaire** : quels noms distincts pour l'offre Université
   (financée par les frais de scolarité) et l'offre Collège (sur devis) ?
3. **Support** : quel est l'engagement réel (heures, jours, canaux, délai) à
   afficher partout ?
4. **LMS** : qu'est-ce qui est livré aujourd'hui, et à quelles formules ?
5. **Témoignages** : établissements et accord des trois témoins.
