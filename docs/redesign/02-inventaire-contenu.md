# 02 · Inventaire du contenu (référence de non-régression)

Chaque élément porte un identifiant stable. Le mapping avant/après
(`08-mapping-avant-apres.md` et `mapping.json`) reprend **ces mêmes identifiants**,
avec un statut parmi `PRESERVED`, `IMPROVED`, `MOVED`. Il n'existe pas de statut
`DELETED`.

Sources de l'inventaire, dans cet ordre de foi :

1. **Le rendu en production** (crawl du 1er octobre 2026, FR + EN, 1440 px, mouvement
   réduit, page entièrement défilée). Photographie machine :
   `docs/redesign/inventaire/reference/*.json` — texte affiché, titres, liens,
   champs de formulaire, canonique, hreflang, types JSON-LD, par route.
2. **Les sources** : `messages/*.json` (toutes les clés), `content/**/*.mdx`.
   Photographie machine : `docs/redesign/inventaire/sources.json`.
3. **Ce document**, qui donne un nom et une intention à chaque bloc.

Le contrôle `node scripts/verifier-parite-contenu.mjs --url <site>` compare une
version à cette référence et **échoue** sur toute disparition non déclarée.

Légende des colonnes : **Contenu** = texte et éléments porteurs ; **Actions** =
CTA et liens ; **Médias** ; **Remarques** = ce que l'audit a relevé (détail
dans `03-audit.md`).

---

## G · Éléments transverses

| ID | Élément | Contenu | Actions | Remarques |
|---|---|---|---|---|
| G-01 | Nav du hub et des pages LMS / institutionnelles (`site-nav.tsx`) | Logo ; Accueil · Université & Grandes écoles · Collège & Lycée · Classe virtuelle · Documentation · S'inscrire · L'entreprise ▾ (À propos, Sécurité des données, Confidentialité, Mentions légales) | Sélecteur FR/EN, bascule de thème, bouton « Contact » (ouvre G-09) ; sur `/lms` le bouton devient « Être informé » | Trois navigations différentes coexistent (G-01, G-02, G-03) |
| G-02 | Nav Université (`nav.tsx`) | Accueil · Fonctionnalités · Tarifs · FAQ · Documentation · S'inscrire | FR/EN, thème, « Contact » (→ `#contact`) | Ancres internes à la page |
| G-03 | Nav Collège | Logo KLASSCI College ; Accueil · Fonctionnalités · Interfaces · Devis · Docs · L'entreprise ▾ | FR/EN, thème, « Contact » | — |
| G-04 | Pied de page (`footer.tsx`) | Accroche « Plateforme de gestion scolaire conçue pour les établissements d'enseignement supérieur en Afrique » ; 4 colonnes : Produit (Université et grandes écoles, Collège et lycée, Apprentissage en ligne, S'inscrire en ligne) · Ressources (Guides et ressources, Documentation, Référence API, Journal des versions) · L'entreprise (À propos, Sécurité des données, Confidentialité, Mentions légales) · Contact (contact@klassci.com, Abidjan, Côte d'Ivoire) ; © année KLASSCI · African Digit Consulting | Facebook, LinkedIn | L'accroche ne parle que du supérieur alors que le site couvre aussi collèges et lycées |
| G-05 | Bascule de thème clair / sombre | Libellés Sombre / Clair | — | Toutes les pages, deux thèmes à maintenir |
| G-06 | Sélecteur de langue | fr / en | — | Le blog n'existe qu'en FR |
| G-07 | 404 (`not-found`) | « Cette page n'existe pas » + 4 reprises : KLASSCI Université, KLASSCI College, Documentation, Accueil (avec descriptions) | 4 liens | Accents manquants dans les chaînes (« demandee », « existe », « Universite ») |
| G-08 | Fenêtre « Contact » du hub (`universe-contact-dialog.tsx`) | Titre, intro, e-mail, localisation, formulaire de démonstration | Envoi | Même formulaire que UNI-24 |
| G-09 | Données structurées | Graphes JSON-LD par page (`lib/schema/`) : Organization, WebSite, SoftwareApplication/Offer, FAQPage (Université seulement), BlogPosting, BreadcrumbList… | — | Liste exacte par route dans `inventaire/reference` |
| G-10 | Images de partage | `opengraph-image.tsx` (accueil + par univers) | — | — |
| G-11 | Mesure d'audience | PostHog (catalogue typé `lib/analytics/events.ts`), Vercel Analytics, Speed Insights | — | À conserver à l'identique (§ 44 du brief) |

---

## HOME · Accueil `/` (hub)

| ID | Section | Contenu | Actions | Médias | Remarques |
|---|---|---|---|---|---|
| HOME-01 | Hero | Logo ; pastille « Le SaaS éducatif africain tout-en-un, né en Côte d'Ivoire. » ; H1 « Quel établissement gérez-vous ? » ; « KLASSCI équipe chaque niveau d'enseignement. Choisissez votre univers pour découvrir l'outil pensé pour vous. » ; « Un compte, une école. Hébergé, sauvegardé, sécurisé. » | « Voir les univers » (→ `#univers`), « S'inscrire » (→ `/inscription`) | Composition produit : bureau + mobile, trois étiquettes « Pilotage LMD, notes et bulletins », « Caisse, paiements et relances », « Parents et élèves sur mobile » | Logo affiché deux fois (nav + hero). Bouton orange à 2,59:1 de contraste (échec AA, exception déjà documentée dans `verifier-accessibilite.mjs`) |
| HOME-02 | Établissements dont l'inscription en ligne est ouverte | Repère « 01 · Confiance » ; titre ; note explicative (« Ce n'est pas la liste de nos clients… ») ; logos, noms et villes **lus en direct sur chaque instance** | Chaque école mène à son portail | Logos d'école | 4 écoles affichées sur 6 portails ouverts (instances injoignables ou exclues) ; noms tronqués par le fondu de bord |
| HOME-03 | Sélecteur d'univers | Repère « Univers KLASSCI » ; « Choisissez votre univers de pilotage » ; intro « Deux expériences métier, une même ambition… » | — | — | — |
| HOME-04 | Porte Université & Grandes écoles | Tag « Enseignement supérieur » ; « Pilotage supérieur » ; nom ; « LMD, semestres, crédits, comptabilité. Le système complet pour le supérieur. » ; « LMD · crédits · gouvernance » ; « Classe virtuelle compatible » | « Découvrir » → `/universite` | Capture produit en fond, voilée | Capture illisible sous le voile |
| HOME-05 | Porte Collège & Lycée | Tag « Collège & Lycée » ; « Terrain scolaire » ; nom ; « Trimestres, bulletins DREN, caisse, présences. Un compte pour chaque acteur de l'école. » ; « Parents · élèves · équipes » ; « Classe virtuelle compatible » | « Découvrir » → `/college` | Idem | Idem |
| HOME-06 | Capacité connectée : classe virtuelle | « Capacité connectée » ; « Classe virtuelle pour prolonger votre univers » ; « Cours, devoirs, évaluations et suivi pédagogique… » | « Explorer la classe virtuelle » → `/lms` | Icône | Traitée en simple bandeau |
| HOME-07 | Pied de page | = G-04 | | | |
| HOME-S1 | Chaînes présentes en source, **non affichées** | `welcome.doors.lms.*` (tag « Bientôt », description, CTA « Être informé »), `welcome.docs` | — | — | À réutiliser plutôt qu'à supprimer |

---

## UNI · Université & Grandes écoles `/universite`

| ID | Section | Contenu | Actions | Médias | Remarques |
|---|---|---|---|---|---|
| UNI-01 | Hero | H1 « La gestion universitaire, repensée. » ; « KLASSCI est l'outil qui remplace vos fichiers Excel, vos cahiers de notes et vos tableaux d'affichage. Un seul endroit pour tout gérer. » ; « Disponible sur navigateur. Aucune installation requise. » | « Essayer gratuitement » (+ « c'est gratuit »), « Voir comment ça marche » | Défilé de 9 captures étiquetées : Tableau de bord, Gestion des étudiants, Nouvelle inscription, Résultats et bulletins, Planning général, Gestion des présences, Parcours LMD, Gestion du personnel, Code d'émargement | Titre en dégradé de couleurs (motif proscrit) ; « Essayer gratuitement » alors que l'essai est soumis à création de compte en 2-3 jours |
| UNI-02 | Établissements ouverts | = HOME-02 | | | |
| UNI-03 | Trois piliers | Simple (« Compte test en 2-3 jours, déploiement complet en 2 semaines ») · Complet (« Zéro outil supplémentaire ») · Sécurisé (« base de données isolée ») | — | — | Numérotés 01/03, 02/03, 03/03 |
| UNI-04 | Fonctionnalités — intro | « Ce que KLASSCI fait pour vous » ; « …établissements que nous accompagnons depuis 2023. » | — | — | Repère « 02 / Fonctionnalités » |
| UNI-05 | Saisie des notes et bulletins | Description + **modale** (intro, 6 puces, conclusion) | « En savoir plus » → modale ; dans la modale « Demander une démo », « Voir les tarifs » | Capture fiche étudiant | — |
| UNI-06 | Suivi financier en temps réel | Description + modale | idem | Capture tableau de bord comptable | — |
| UNI-07 | Planning général | Description + modale | idem | Capture planning | — |
| UNI-08 | Gestion des présences | Description + modale | idem | Capture présences | — |
| UNI-09 | Système LMD complet | « Gestion des UE, ECUE, crédits et semestres conforme aux standards UEMOA… » + modale | idem | Capture **état vide** (« Aucun domaine LMD enregistré ») | La preuve du module phare montre un écran vide |
| UNI-10 | Gestion du personnel | Description + modale | idem | Capture personnel | — |
| UNI-11 | Accessibilité étudiante | Description + modale | idem | Capture suivi accessibilité | — |
| UNI-12 | Trois fonctionnalités secondaires | Inscriptions en ligne · Tableau de bord par rôle · API et intégrations | — | — | — |
| UNI-13 | Témoignages | 3 citations : Dr. Soro Kouadio (Directeur, « bulletins prêts en 48 heures »), Ama Bamba (Comptable, « Le suivi financier a complètement changé »), Tarek Mehdy (Coordinateur, « réduit l'absentéisme de 30 % ») | — | Photo (Soro Kouadio), monogrammes | **Défaut** : le titre affiché est celui de la bande d'établissements (« Les établissements dont l'inscription en ligne est ouverte ici ») sous le repère « 02 · Témoignages ». Établissements des témoins non nommés : à faire confirmer avant toute mise en avant |
| UNI-14 | Bannière Partenariat | Image « 0 FCFA · Devenez partenaire, payez presque 0 FCFA · Ne perdez pas le temps appartenez à notre communauté et bénéficier de nombreux avantages · Rejoindre dès maintenant » | (aucune action réelle : le bouton est dans l'image) | Image avec texte incrusté | Texte non lisible par un lecteur d'écran, non traduisible, deux fautes ; à reconstruire en HTML **en gardant le message** |
| UNI-15 | Vidéo témoignage | « Ils en parlent mieux que nous » ; « Découvrez le témoignage d'un responsable d'établissement… » ; badge « Témoignage » | Lecture | `testimonial.mp4` | Pas d'affiche : bloc gris tant que la vidéo n'est pas lancée ; personne ni établissement nommés |
| UNI-16 | Sécurité | « Sécurité et confiance totales » ; RGPD, équipe cybersécurité, base isolée | — | Photo d'illustration (cadenas, hexagones) | Affirmations à adosser à la page `/securite` |
| UNI-17 | Impact ODD | « Moins de papier, plus d'inclusion… » ; intro ; **9 ODD** : 04, 05, 08, 09, 10, 12, 13, 16, 17 avec texte | — | 9 visuels | — |
| UNI-S1 | Accessibilité — section détaillée, **présente en source, non affichée** | `universityImpact.accessibility` : titre, intro, 4 chiffres (10 étudiants suivis, 10 tiers-temps, 2 assistants, 8 reconnaissances), 4 cartes (Profil, Aménagements, Confidentialité, Exports et audit) | — | — | Les chiffres sont ceux d'une instance de démonstration : à ne pas présenter comme des résultats |
| UNI-18 | Support | « Support client disponible 24h/24 » ; chatbot, e-mail, WhatsApp, Telegram ; FR/EN ; « Temps de réponse moyen : moins de 2 minutes » | — | Illustration chatbot | **Contradiction** avec les tarifs (assistance Lun-Jeu / Lun-Ven / Lun-Sam) |
| UNI-19 | Bandeau photo | Photo d'étudiants | — | `imageBanner` | Aucun contenu |
| UNI-20 | Déploiement accompagné | 4 étapes (Cadrage, Migration, Formation, Mise en ligne) + 3 garanties (Sauvegardes quotidiennes, Assistance selon votre formule, Suivi de l'adoption) | — | Icônes | — |
| UNI-21 | Tarifs — Élite | « Une seule offre, trois niveaux de service » ; sous-titre ; Élite 4,8 M FCFA / an ; 6 piliers (SIS + LMS + API, WhatsApp 5 000 msg/mois, 12 jours-dev / an, comptes & élèves illimités, support 6j/7, account manager) ; « 6 M FCFA la première année · 460 k FCFA / mois en mensualisation » | « Souscrire », « Tester gratuitement 1 mois » (→ `#contact`) | — | « SIS + LMS » alors que le LMS est annoncé « en préparation » sur `/lms` |
| UNI-22 | Tarifs — inclus partout | 4 éléments + « Toutes les nouvelles fonctionnalités produit sont livrées à tous les tiers. » | — | — | — |
| UNI-23 | Tarifs — alternatives et comparaison | PRO (≤ 1 500 élèves · LMS inclus · 1,15 M FCFA / an), Essentiel (≤ 500 · 700 k FCFA / an) ; comparateur repliable : Produit (LMS, API, WhatsApp), Capacités (comptes admin, éducateurs, élèves, professeurs), Service technique (assistance, personnalisation, jours-dev, roadmap, account manager, audit), Tarif (annuel, première année, mensualisation) | « Comparer les formules », « Choisir … » ×3 | — | L'information décisive est repliée par défaut |
| UNI-24 | Tarifs — Partenaire et note | « Pas de budget cash mobilisable ? » Formule Partenaire : 500 k FCFA d'installation + 15 k FCFA / élève / an payés via les frais de scolarité ; note « hébergement, sauvegardes, conformité MESRS, migration incluse » | « En savoir plus » | — | « Conformité MESRS » : affirmation à documenter |
| UNI-25 | FAQ | 6 questions : sécurité des données, migration Excel, LMD, délai, téléphone, essai gratuit | Dépliables | — | Balisée FAQPage |
| UNI-26 | Contact / démonstration | « Demandez une démonstration » ; e-mail, localisation ; formulaire : nom, e-mail, établissement, téléphone, type (6 options), message ; « Réponse sous 24h » ; états succès / erreur | « Envoyer la demande » | — | — |
| UNI-27 | Mot de l'équipe | « Prêt à simplifier la gestion de votre établissement ? » ; texte ; | « Commencer gratuitement » | — | — |
| UNI-28 | Pied de page | = G-04 | | | |

---

## COL · Collège & Lycée `/college`

| ID | Section | Contenu | Actions | Médias | Remarques |
|---|---|---|---|---|---|
| COL-01 | Offre de lancement | Pastille « Disponible maintenant » ; « Offre de lancement · -30 % la première année · 50 établissements » ; « Réservée aux 50 premiers établissements » | « Voir l'offre en détail » → `#tarifs` | — | Encadré au-dessus du H1 : l'offre passe avant le produit |
| COL-02 | Hero | Logo KLASSCI College ; H1 « Le collège entier, dans un seul logiciel. » ; « Direction, secrétariat, comptabilité, enseignants, parents et élèves… » | « Demander un devis » (modale COL-14), « Voir les interfaces » (→ `#interfaces`) | Scène bureau + mobile | — |
| COL-03 | Bande d'interfaces | 5 vignettes : Tableau de bord, Parents, Notes, Emploi du temps, Paramètres | — | Captures | — |
| COL-04 | Comptes par acteur | « Chaque compte voit exactement ce qu'il doit traiter » ; intro ; 6 rôles : Direction, Secrétariat, Comptabilité, Enseignants, Parents, Élèves | — | Icônes | Grille de 6 cartes identiques |
| COL-05 | Modules clés | « Tout le quotidien scolaire, sans outil parallèle » ; 8 modules numérotés : Inscriptions, Frais et caisse, Notes et bulletins, Présences, Emploi du temps, Parents, Documents, Pilotage | — | — | — |
| COL-06 | Interfaces produit | « Des écrans récents, lisibles et directement exploitables » ; 5 captures légendées : Classes et séries, Dashboard mobile, Évaluations et saisies, Parents et comptes, Emploi du temps | — | 5 captures | 3 captures sur 5 montrent un état vide (« Choisissez une classe… », indicateurs à « — ») |
| COL-07 | Calculateur de rentabilité | « Calculez votre rentabilité » ; 3 champs (élèves, budget papier, heures administratives) ; formule recommandée, tarif de lancement, part du budget papier, heures annuelles, avertissement | « Recevoir mon devis » (pré-remplit la modale) | — | Ne calcule pas de rentabilité (aucun gain ni retour sur investissement chiffré) ; panneau de résultat animé depuis l'opacité 0 (à vérifier avant hydratation) |
| COL-08 | Tarifs — Élite | « Une licence annuelle, trois niveaux d'ambition » ; Élite 2,1 M FCFA la première année (3 M avant remise), 701 à 1 500 élèves, 6 atouts | « Choisir Élite » | — | Bordure latérale orange (motif proscrit) |
| COL-09 | Tarifs — inclus, alternatives, comparaison | 4 inclusions + « 30 % de réduction sur la première année » ; PRO (301-700, 1,05 M puis 1,5 M), Essentielle (≤ 300, 525 k puis 750 k) ; comparateur 8 lignes ; « Dès 167 FCFA par élève/mois » | « Choisir PRO / Essentielle », « Comparer les formules » | — | Prix calculés (`lib/college-pricing.ts`) : la source de vérité est le code, pas le texte |
| COL-10 | Tarifs — Partenaire et note | Formule Partenaire « Sur devis » ; note sur l'offre de lancement | « Étudier mon projet » | — | Même nom « Formule Partenaire » qu'à l'Université, mais **offre différente** |
| COL-11 | Déploiement | « Votre déploiement, sans friction » ; paiement échelonné 40 / 30 / 30 ; 6 inclusions (Configuration, Migration initiale, Formation, Sauvegardes, Assistance 6j/7, Accompagnement prioritaire 60 jours) ; bandeau « Prêt à simplifier votre gestion ? » | « Demander un devis » | — | Bordure latérale orange sur le bandeau |
| COL-12 | Impact ODD | « Un collège plus vert, plus connecté… » ; 9 ODD | — | 9 visuels | Même composant que UNI-17, textes propres |
| COL-13 | Pied de page | = G-04 | | | |
| COL-14 | Modale de devis | « Parlons de votre établissement » ; nom, e-mail pro, établissement, téléphone, type (Collège, Lycée, Groupe scolaire), nombre d'élèves, formule, message ; succès / erreur | « Recevoir mon devis » | — | Reprend la simulation et la formule choisie |

---

## LMS · Classe virtuelle `/lms`

| ID | Section | Contenu | Actions | Remarques |
|---|---|---|---|---|
| LMS-01 | Hero | Pastille « KLASSCI LMS » ; H1 « L'apprentissage numérique arrive dans KLASSCI. » ; « Le LMS complétera les univers Université et College… » | « Être informé » (→ `mailto:contact@klassci.com?subject=KLASSCI LMS`) | Le titre de page dit « en préparation » |
| LMS-02 | Trois capacités | Cours structurés · Devoirs et évaluations · Connecté au SIS | — | Seul contenu produit de la page |
| LMS-03 | Lien docs | « Docs » → `/docs/lms` | | |
| LMS-04 | Pied de page | = G-04 | | |

---

## BLOG · `/blog` et articles

| ID | Élément | Contenu |
|---|---|---|
| BLOG-00 | Index | Titre, chapô, liste des 7 articles (titre, résumé, date, catégorie), chrome de blog |
| BLOG-01 | `calcul-moyennes-bulletins-cote-divoire` | Article MDX complet, sources, maillage |
| BLOG-02 | `choisir-logiciel-gestion-scolaire-afrique` | idem |
| BLOG-03 | `deliberation-jury-lmd-proces-verbal` | idem |
| BLOG-04 | `eleves-affectes-subvention-etat` | idem |
| BLOG-05 | `ouvrir-ecole-privee-cote-divoire` | idem |
| BLOG-06 | `recouvrement-frais-scolarite` | idem |
| BLOG-07 | `systeme-lmd-uemoa-credits-ue-ecue` | idem |

Le texte intégral et la liste des titres de chaque article sont dans
`inventaire/reference/fr__blog__*.json`. Les articles sont repris tels quels :
la refonte ne touche que leur gabarit.

## DOCS · Documentation `/docs`

| ID | Page | Groupe |
|---|---|---|
| DOCS-00 | Accueil de la documentation | — |
| DOCS-01 | Prise en main (`getting-started`) | Mise en route |
| DOCS-02 | Concepts | Mise en route |
| DOCS-03 | Université | Univers |
| DOCS-04 | Collège | Univers |
| DOCS-05 | LMS | Univers |
| DOCS-06 | Super-admin : onboarding | Par rôle |
| DOCS-07 | Secrétaire : inscriptions | Par rôle |
| DOCS-08 | Comptable : opérations | Par rôle |
| DOCS-09 | Module frais et comptabilité | Par module |
| DOCS-10 | Référence API | Référence |
| DOCS-11 | Journal des versions (avec captures avant / après) | Référence |
| DOCS-G | Chrome fumadocs : barre latérale, recherche, sommaire, précédent / suivant, FR/EN | — |

## INST · Pages institutionnelles

| ID | Page | Contenu |
|---|---|---|
| INST-01 | `/a-propos` | MDX + nav institutionnelle |
| INST-02 | `/securite` | MDX (sauvegardes, isolation, accès) |
| INST-03 | `/confidentialite` | MDX |
| INST-04 | `/mentions-legales` | MDX |

## PORT · Portails d'inscription et parcours

| ID | Route | Contenu | Remarques |
|---|---|---|---|
| PORT-01 | `/inscription` | Aiguillage | — |
| PORT-02 | `/inscription/universite` | Liste des établissements (recherche, logos, villes) | Dynamique |
| PORT-03 | `/inscription/universite/[ecole]` | Portail à l'identité de l'école : candidature en plusieurs écrans, champs de contact, pièces justificatives, vérification e-mail (code, lien), suivi de demande, pièces manquantes, messages d'état | Les écrans dépendent de l'état de la demande : inventaire par composant `components/portail/*` |
| PORT-04 | `/inscription/universite/[ecole]/rendez-vous` | Prise de rendez-vous, convocation (gestion et renvoi) | — |
| PORT-05 | `/reinscription` + `/reinscription/[ecole]` | Parcours de réinscription, écran de succès | — |
| PORT-06 | `/verification-email` | Vérification par lien | — |

Les écrans d'état des portails (erreur, pièce manquante, succès, rendez-vous
convoqué) ne sont pas tous visibles sans une demande réelle. Ils sont
inventoriés par leurs chaînes (`messages/reinscription.*.json`,
`messages/verification.*.json`, `lib/portail/*`) et doivent être couverts par
les tests de bout en bout du lot 7, pas seulement par la capture.
