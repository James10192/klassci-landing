# Benchmark concurrentiel — refonte de klassci.com

*Recherche du 1er octobre 2026. Sites visités avec WebFetch (contenu texte) et, quand c'était possible, rendus dans un Chromium headless en 390 × 844 (téléphone) et 1440 × 900 (bureau). Les captures sont dans `bench/shots/`.*

## Méthode et limites, à lire avant les fiches

- **Tout chiffre cité vient du site du concurrent lui-même** et n'a pas été recoupé, sauf mention contraire. « Déclaré » = affiché par l'éditeur, non vérifié. « Non vérifié » = l'information n'a pas pu être trouvée ou confirmée.
- **Les prix sont recopiés tels qu'affichés.** Quand le site ne les affiche pas, c'est écrit « non public ».
- **Note de design (1–5)** : jugée sur la capture quand le rendu a fonctionné. Plusieurs sites (Fedena, PowerSchool, Novacole en mobile) n'ont pas chargé leur CSS, ou ont renvoyé une page anti-robot, dans l'environnement de capture : c'est probablement un artefact du proxy, pas un défaut du site. Dans ce cas la note est marquée « (sur contenu, rendu non vu) ».
- **Trois noms de la liste de départ posent problème** :
  - **Logesco** : `logesco.com` est un revendeur informatique québécois sans rapport. Le bon éditeur est **Logesco School** (`logesco.org`, marque de DIDACSOFT, Douala).
  - **SchoolExpert** : `schoolexpert.net` est un autre produit, sans lien avec l'Afrique francophone. Le bon est **`schoolexpert.ci`** (Dabou, Côte d'Ivoire).
  - **AppAcademia** : aucun éditeur trouvé sous ce nom. La piste la plus proche est **Academia ERP/SIS de Serosoft** (Inde), qui publie une app « Academia @ IUGB » sur l'App Store — IUGB étant vraisemblablement l'Université internationale de Grand-Bassam, mais l'institution est seulement désignée « IUGB College » dans la fiche : **non vérifié**. C'est cette piste qui est fichée ci-dessous.
  - **Go4School** : `go4school.com` est un domaine parqué ; le produit est sur **`go4school.net`** (FNT TECH SARL, Cameroun).

---

## A. Acteurs globaux (SIS / LMS)

### Canvas (Instructure)
- **URL** : https://www.instructure.com/canvas
- **Positionnement (verbatim)** : « When you upgrade to Canvas, you join the #1 LMS in North America and a global community of educators and partners working together to create life-changing learning experiences. »
- **Cible** : K-12, enseignement supérieur, entreprises et administrations.
- **Prix** : non public (trois offres évoquées sans montant ; `/canvas/pricing` renvoie 404).
- **Preuve (déclarée)** : « 10s of millions of users », « 99.9% uptime », « 27M mobile app downloads », « 33 languages », « 100+ countries », « 1000+ Canvas partners and integrations », étude de cas Alabama Community College System.
- **Captures produit** : vraie interface (SpeedGrader, Gradebook, messagerie étudiants), annotée.
- **Largeur fonctionnelle** : LMS uniquement (cours, devoirs, notation, mobile, intégrations). Pas de scolarité, pas de finances, pas d'inscriptions.
- **Conversion** : « Request Demo », « Get Canvas », « Connect with us ».
- **SEO** : blog abondant (guides d'achat, stratégies pédagogiques), documentation communautaire très connue, 33 langues.
- **Design** : 4/5 (sur contenu, rendu non vu) — UI réelle mise en avant, preuve chiffrée en tête.
- **Mobile** : non vu (capture non obtenue).

### PowerSchool
- **URL** : https://www.powerschool.com/
- **Positionnement (verbatim)** : « The world's most comprehensive K-12 software, unifying education ecosystems for over 60 million students in 90 countries. » ; CTA « Configure Your Own K-12 OS ».
- **Cible** : K-12 (districts, administrateurs, enseignants, familles, DSI).
- **Prix** : non public.
- **Preuve (déclarée)** : 60 millions d'élèves, 90 pays ; témoignages nominatifs (Tomball ISD, Epic Charter Schools, Colorado Springs D11, Volusia County Schools, NorthPointe Christian Schools).
- **Captures produit** : illustrations et animations stylisées, pas de vraie UI.
- **Largeur** : SIS + LMS (Schoology) + RH + finances + analytics, sur K-12 uniquement.
- **Conversion** : « Talk to an Expert ».
- **SEO** : centre de ressources, blog, podcast, webinaires, rapport annuel (« Back to School 2026: The New Math for EdTech »).
- **Design** : non noté — le site a renvoyé une vérification anti-robot Imperva à la capture.
- **Idée à retenir** : la formule « **K-12 OS** », un système d'exploitation de l'école. C'est exactement la promesse « Education Operations Platform » ; elle est déjà prise en anglais sur le K-12.

### Ellucian
- **URL** : https://www.ellucian.com/
- **Positionnement (verbatim)** : « Unifying Campus Technology Solutions to Power Higher Ed » et « Purpose Built AI: The System of Intelligence That Gives Higher Ed Its Edge ».
- **Cible** : enseignement supérieur exclusivement.
- **Prix** : non public.
- **Preuve (déclarée)** : « ~3,000 higher education institutions », « 21M+ students » ; résultats chiffrés par client nommé : « 25% boost in new student enrollment » (Olivet Nazarene), « 400% increase in financial aid files processed » (Jacksonville State), « 16% immediate increase in scholarship applications » (Augusta University).
- **Captures produit** : illustrations SVG par étape du parcours (« Recruit and Apply », « Enroll and Afford »).
- **Largeur** : SIS, ERP, CRM recrutement, aide financière, analytics, IA.
- **Conversion** : « Request a Demo », « Let's Talk ».
- **SEO** : blog, études de cas, webinaires, rapports.
- **Design** : 4/5 — la navigation **suit le parcours de l'étudiant** (recruter → inscrire → financer), c'est le modèle à suivre pour le « fil » KLASSCI.
- **Mobile** : bon — titre énorme sur fond violet, un seul CTA « Request a Demo » au premier écran, puis bandeau de distinctions (Fast Company, AI Excellence 2026). Aucune capture produit au premier écran.
- **Idée à retenir** : la preuve « client nommé + pourcentage de résultat » est plus forte qu'un compteur d'établissements.

### Blackbaud
- **URL** : https://www.blackbaud.com/solutions/education-management
- **Positionnement (verbatim)** : « Education Management Software for Private K-12 Schools » — « Innovative software to help you manage every aspect of a private or independent school. »
- **Cible** : écoles privées et indépendantes K-12.
- **Prix** : non public (« Ask About Pricing »).
- **Preuve (déclarée)** : « 22% Increase in enrollment contracts », « 50% Reduction in tuition delinquency », « 4–6X Less Time in data entry », « 100+ annual work hours saved » (Ensworth School), « More than 40 years ».
- **Captures** : non vérifié.
- **Largeur** : admissions, facturation des frais, aide financière, SIS, LMS, site web de l'école.
- **Conversion** : « Request a Demo », « Ask About Pricing », eBook en échange d'un contact.
- **SEO** : blog ENGAGE, Blackbaud Institute (études), 221 ressources filtrables.
- **Design** : non noté.
- **Idée à retenir** : « **50 % de réduction des impayés** » — l'argument financier est mis au même niveau que le pédagogique. C'est le premier souci d'un fondateur d'école privée africaine.

### Classter
- **URL** : https://www.classter.com/
- **Positionnement (verbatim)** : « The All-in-One Operating System for Educational Institutions » — « One System. One Login. Total Control. »
- **Cible** : K-12, supérieur, académies et centres de formation, séminaires, districts, formation en entreprise.
- **Prix** : modèle **par élève**, sur devis ; un exemple chiffré est publié (Vega College of Music, Croatie, 1 000 élèves) : « Core: €8.50 per student », « Academics & LMS: €6.50 per student », « Surveys & Quizzes: €6.50 per student », « Total: €25,500/year (€21.50 per active student) ». Source : https://www.classter.com/pricing/
- **Preuve (déclarée)** : « 500+ educational institutions », « 98% User Satisfaction Rating », badges Capterra / Software Advice / Slashdot, témoignages de 8 pays.
- **Captures produit** : vraies captures par portail (parent, élève, enseignant, finances).
- **Largeur** : très large, du SIS au LMS, finances, admissions, enquêtes.
- **Conversion** : « SEE IT LIVE », « BOOK A DEMO », « ASK FOR PRICING ».
- **SEO** : base de connaissances publique (help.classter.com), blog, études de cas, webinaires. **7 langues dont le français et l'arabe.**
- **Design** : 4/5 (sur contenu, rendu non vu).
- **Idée à retenir** : publier **un exemple de devis réel** plutôt qu'une grille : on rassure sur l'ordre de grandeur sans figer un prix.

### Fedena
- **URL** : https://fedena.com/
- **Positionnement (verbatim)** : « All-In-One College and School Management Software » — « Automate Institute Daily Operations, Generate Insightful Reports, Make Better & Faster Decisions. »
- **Cible** : écoles et collèges/universités, mondial (forte base en Inde).
- **Prix (public, verbatim)** : Standard « $999/year », Premium « $1,399/year », Ultimate « $1,699/year » (« Most Popular »), Enterprise sur devis. Utilisateurs illimités dans toutes les offres. Source : https://fedena.com/pricing-and-plans
- **Preuve (déclarée)** : « 40,000+ Schools & Colleges », « 200+ Countries », « 20+ Languages », écoles nommées en Inde (Vidya Vikas Academy, Braintree International School…).
- **Captures** : maquette illustrée de l'app mobile, pas de vraie UI sur l'accueil.
- **Conversion** : « Free Trial », « Book A Live Demo » (Calendly), pop-up de démo à l'arrivée.
- **SEO** : eBook, pas de blog repéré sur l'accueil.
- **Design** : 2/5 (sur contenu, rendu non vu — CSS non chargé à la capture) ; pop-up de démo immédiate.
- **Idée à retenir** : **prix forfaitaire par établissement, utilisateurs illimités**, publié. Simple à comprendre.

### Odoo (Éducation) et OpenEduCat
- **URL** : https://www.odoo.com/fr_FR/app/elearning · https://www.odoo.com/fr_FR/pricing · https://www.openeducat.org/
- **Positionnement** : Odoo n'a **pas d'application « gestion scolaire » officielle** (la page `/fr_FR/page/education` renvoie 404). Il propose « Odoo eLearning - Système gratuit de gestion de l'apprentissage » et laisse la scolarité aux modules tiers (apps.odoo.com) ou à **OpenEduCat**, bâti sur Odoo : « One Education ERP to Run Your Entire Institution ».
- **Cible** : toute structure, écoles comprises via intégrateurs.
- **Prix Odoo (verbatim, affichés en USD lors de la consultation — la devise peut dépendre du pays)** : « One Free App » à $0 ; Standard « $24.90 » par utilisateur et par mois (annuel) ; Custom « $49.00 » par utilisateur et par mois (annuel). eLearning : « C'est gratuit pour toujours, avec un nombre illimité d'utilisateurs ». **OpenEduCat** : édition libre (LGPL-3.0), essai de 15 jours, montant non public, message « fixed pricing without per-student fees » (non vérifié en détail).
- **Preuve (OpenEduCat, déclarée)** : « 3M+ users across 90+ countries », « 70+ modules », 4,5/5 G2.
- **Captures** : Odoo montre la vraie interface eLearning ; OpenEduCat montre des tableaux de bord dessinés en SVG.
- **Conversion** : « Lancez-vous - C'est gratuit ! » (sans carte bancaire) ; OpenEduCat « Start Free », « Talk to an Advisor ».
- **SEO** : très fort (Odoo), documentation publique énorme.
- **Design** : Odoo 4/5 (sur contenu) ; OpenEduCat 3/5 (sur contenu).
- **Pourquoi c'est un concurrent réel** : en Afrique francophone, des intégrateurs Odoo vendent la gestion d'école clé en main. Galactis.Education (ci-dessous) est elle-même construite sur Odoo (son image d'accueil s'intitule « Odoo CMS - a big picture »).

### Academia ERP/SIS (Serosoft) — piste « AppAcademia »
- **URL** : https://www.academiaerp.com/ · app « Academia @ IUGB » : https://apps.apple.com/br/app/id6744888986
- **Positionnement (verbatim)** : « Global Expert in Student Information Systems ».
- **Cible** : supérieur, K-12, TVET, centres de formation.
- **Prix** : non public (SaaS ou licence).
- **Preuve (déclarée)** : « 400+ Customers Served Globally », « 32 Countries », clients nommés dont Stellenbosch University et Open University of Mauritius ; cité au Magic Quadrant Gartner 2025 et 2026 (déclaré, non vérifié).
- **Présence en Côte d'Ivoire** : l'app « Academia @ IUGB » est publiée par Serosoft, institution notée « IUGB College ». Rattachement à l'Université internationale de Grand-Bassam : **probable, non vérifié**.
- **Conversion** : « Request Demo ».
- **Design** : non noté (rendu non vu).
- **Pourquoi ça compte** : c'est le profil de concurrent qu'une grande école ivoirienne anglophile ou une université privée internationale choisira. KLASSCI le bat sur le LMD UEMOA, le français et le mobile money ; pas sur la crédibilité internationale.

---

## B. Afrique francophone

### Novacole (Togo, 6 pays)
- **URL** : https://novacole.com/ · tarifs : https://www.novacole.com/tarifs · docs : https://docs.novacole.com/
- **Positionnement (verbatim)** : « Gérez votre école, simplement. » — « Notes, paiements, bulletins, communication : une seule plateforme pour toute l'administration de votre établissement, de la maternelle au lycée. »
- **Cible** : maternelle → lycée. **Pas le supérieur.**
- **Prix (public, verbatim, par élève et par an)** : Basic « 200 F CFA », Essential « 400 F CFA » (recommandé, ajoute finances et paiement « Mobile Money (Moov Money, Mixx by Yas) »), Full « 600 F CFA » (ajoute RH, paie, budget, déclarations). **Essai gratuit 3 mois sans carte.** Changement d'offre en cours d'année au prorata.
- **Preuve (déclarée)** : « 160+ établissements », « 63 400+ élèves gérés », « 6 pays couverts » (Togo, Bénin, Burkina, Mali, Niger, Côte d'Ivoire) ; écoles nommées : CPL Le Quartier Latin, Complexe Scolaire Yendaba, CS Cité des Sages.
- **Captures produit** : tableau de bord mis en scène (effectif 1 248, recouvré 87 %, présence 94 %) — c'est une **maquette stylisée aux couleurs du site**, pas une capture brute de l'application.
- **Largeur** : élèves, notes, présences, bulletins, cartes scolaires, app parent, emplois du temps, finances, RH/paie.
- **Conversion** : « Commencer gratuitement », « Essai gratuit », WhatsApp et téléphone (+228), app Google Play **et fichier APK** téléchargeable.
- **SEO** : blog, **documentation publique par profil** (« Préparer la rentrée de A à Z »), français seulement.
- **Design** : **5/5 sur bureau** — typographie éditoriale, vert profond, chiffres en italique, preuve et essai au-dessus de la ligne de flottaison. Le meilleur site du panel africain.
- **Mobile** : CSS non chargé à la capture (non concluant). Le lien APK est un vrai signal terrain (téléphones sans Play Store à jour).
- **C'est le concurrent direct le plus dangereux sur le secondaire** : prix publics très bas, essai long, docs publiques.

### Go4School (Cameroun)
- **URL** : https://www.go4school.net/fr · blog : https://blog.go4school.net/fr · docs : docs.go4school.net
- **Positionnement (verbatim)** : « L'école connectée, entre vos mains » ; sous-titre « 14 modules · 9 espaces · Mobile Money · Comptabilité OHADA ». Ailleurs : « #1 digital school management platform in Cameroon » (déclaré).
- **Cible** : écoles et directions, fondateurs/promoteurs, enseignants, parents, élèves, **réseaux et autorités éducatives**. Examens francophones et anglophones (CEP, BEPC, Probatoire, BAC, GCE O/A-Level).
- **Prix** : non public (« Demander un devis » ; `/fr/tarifs` renvoie 404).
- **Preuve (déclarée)** : « 99,9% disponibilité », « 24 à 48 h mise en service ». **Aucune école nommée.**
- **Captures produit** : vraies captures (tableaux de bord, interfaces mobiles).
- **Largeur** : la plus large du panel africain — 5 modules cœur (GO4SBOOK, GO4SCONFIG, GO4SDOC, GO4SRH, GO4SFEES) + 9 additionnels (comptabilité, dépenses, paie, stock, cantine, santé, flotte, apprentissage). **9 applications mobiles iOS/Android, mode hors ligne pour l'appel**, MTN MoMo et Orange Money natifs, NotchPay.
- **Conversion** : devis, inscription en libre-service (« Je m'inscris »), WhatsApp (+237).
- **SEO** : **blog actif et hebdomadaire** (« Guide complet de migration vers un logiciel de gestion scolaire » 10/03/2026, « Paiement échelonné des frais de scolarité : guide de mise en œuvre » 10/02/2026…), documentation, FR + EN.
- **Design** : non noté (capture non obtenue). 
- **Idée à retenir** : le **hors ligne** et le **guide de migration** répondent aux deux peurs du directeur (coupure réseau, perte de l'historique Excel).

### SchoolExpert (Côte d'Ivoire)
- **URL** : https://schoolexpert.ci/ · souscription : https://schoolexpert.ci/souscription
- **Positionnement (verbatim)** : « ERP DE GESTION SCOLAIRE ET UNIVERSITAIRE » — « Solution tout en un ».
- **Cible** : préscolaire → supérieur (fondateurs, parents, enseignants, étudiants).
- **Prix (public, verbatim)** : « Licence LITE - 50,000 FCFA », « Licence PRO - 100,000 FCFA » (recommandée), « Licence EXPERT - 100,000 FCFA » (première année), pour l'année 2026-2027 ; « Obtenez votre logiciel de gestion à partir de 50 000 Frs ». La périodicité exacte (annuelle ? par établissement ?) n'est pas claire sur la page : **non vérifié**.
- **Preuve (déclarée)** : « 118k » élèves gérés, « 100+ » établissements, « 9+ » ans, « 99% » satisfaction ; deux témoignages nominatifs sans établissement identifiable.
- **Captures** : non vérifié.
- **Largeur** : tableau de bord, scolarité (frais), comptabilité, RH, pédagogie, **SMS / WhatsApp**.
- **Conversion** : « Commencer maintenant » / « Souscrire maintenant » (achat en ligne), WhatsApp (+225).
- **SEO** : non repéré (pas de blog visible).
- **Design** : non noté (capture non obtenue).
- **Idée à retenir** : c'est le **concurrent prix d'entrée** en Côte d'Ivoire, et il revendique le supérieur. KLASSCI doit montrer ce qu'un LMD réel exige (UE, crédits, compensation, jury, PV) pour sortir de la comparaison au prix.

### Logesco School (Cameroun, 8 pays)
- **URL** : https://logesco.org/ · https://logesco.org/a-propos/ · https://logesco.org/nos-solutions/logesco-school-pro/
- **Positionnement (verbatim)** : « Logiciel de gestion scolaire tout en un ! » — « Simplifiez votre gestion scolaire avec une solution tout-en-un, intuitive et performante pour tout type d'école, collège, lycée, institut ou centre de formation ».
- **Cible** : primaire → universités et grandes écoles (produit dédié « Logesco MyUniversity »), multi-sites.
- **Prix** : non public (pages tarifs par produit, montants non trouvés ; `logesco.net/tarifs` ne résout pas).
- **Preuve (déclarée, et incohérente)** : l'accueil affiche « +1000 établissements utilisent Logesco partout dans le monde », la page À propos et la fiche produit disent « +200 établissements accompagnés ». Aussi : « +15 ans », « 8 pays » (Cameroun, Côte d'Ivoire, Tchad, Gabon, Guinée, RDC, Mauritanie, Bénin), « 98% » satisfaction, « +1M de dossiers et notes suivis chaque année ».
- **Captures** : illustrations et maquettes génériques.
- **Largeur** : 20+ modules (scolarité, notes, comptabilité, discipline, sécurité/contrôle d'accès « SecuAccess », SMS, cloud, version locale ou en ligne).
- **Conversion** : « Demandez une démo », téléphone, WhatsApp.
- **SEO** : blog orienté requêtes (« Logiciel de gestion scolaire en ligne ou local ? »), FR + EN.
- **Design** : 3/5 — propre et lisible sur mobile, mais générique (orange/bleu, compteurs).
- **Mobile** : premier écran bon — titre lisible, CTA orange, compteurs en grille 2 × 2. Mais la page mesure 605 px de large pour un écran de 390 px : **défilement horizontal** probable (mesure `scrollWidth`, à confirmer sur un vrai téléphone).
- **Leçon en creux** : deux chiffres contradictoires sur le même site détruisent la crédibilité. KLASSCI ne doit afficher qu'**un** chiffre par fait, sourcé.

### Innova School (Côte d'Ivoire)
- **URL** : http://innova-school.net/ (**pas de HTTPS** à la visite)
- **Positionnement (verbatim)** : « L'innovation au cœur de la gestion scolaire » — « Le système complet de gestion scolaire qui relie établissements, enseignants et parents — conçu en Côte d'Ivoire, pour l'école ivoirienne. »
- **Cible** : écoles primaires et secondaires ivoiriennes ; trois apps : **leFondateur**, **SuperProf**, **monEcolier**. Pas de supérieur.
- **Prix** : non public — « La tarification s'adapte à la taille et aux besoins », devis gratuit.
- **Preuve (déclarée)** : « 100+ établissements équipés », « 40 000+ élèves gérés », « 400+ enseignants utilisateurs » (compteurs animés, à 0 sans JavaScript) ; témoignages par prénom + initiale (Kouadio A., Aïcha K., Jean-Marc D.).
- **Captures produit** : vraies interfaces (emploi du temps de 3e A, rapport DELC, caisse du jour, notes de mathématiques, apps).
- **Largeur** : pédagogie, finances, notes, caisse ; Wave, Orange Money, MTN, Moov.
- **Conversion** : « Discuter sur WhatsApp », téléphone, démo gratuite.
- **SEO** : pas de blog ni de documentation.
- **Design** : 3/5 — propre, mascotte hibou, bon contraste ; hero sans aucun visuel produit.
- **Mobile** : correct, CTA principal visible, mais la mascotte occupe l'écran à la place de la preuve.
- **Idée à retenir** : nommer les **apps par rôle** (« leFondateur ») parle tout de suite au décideur. Et le « rapport DELC » montre la conformité aux documents ivoiriens.

### EDUC GO ON (Côte d'Ivoire)
- **URL** : https://educgoon.com/
- **Positionnement (verbatim)** : « La plateforme scolaire pensée pour la Côte d'Ivoire ».
- **Cible** : primaire (≤ 450 élèves), collège/lycée (451–1 000+), complexes multi-sites (> 2 000).
- **Prix (public, verbatim)** : « Démarrage : 2,500 FCFA/month », « Essentiel : 5,000 FCFA/month », « Premium : 7,500 FCFA/month », et une offre « Partner Advertising » à « 50,000 FCFA/month (500,000 FCFA annually) ». Essai 30 jours. L'unité de facturation (par élève ? par établissement ?) n'est pas lisible dans le contenu récupéré : **non vérifié**.
- **Preuve (déclarée, et honnêtement petite)** : « 14+ » écoles actives, « 2,000+ » élèves, « 414,009 FCFA » traités par Mobile Money, « 98% » satisfaction, « 5 » pays.
- **Captures** : vraie interface derrière la pop-up.
- **Largeur** : élèves, notes, présences, portail parent, SMS automatiques ; Orange Money, MTN MoMo, Wave, Moov.
- **Conversion** : « Démarrer gratuitement », WhatsApp flottant.
- **Design** : 2/5 — une **pop-up plein écran** (vidéo + boutons App Store / Google Play) masque la page dès l'arrivée, sur téléphone comme sur bureau, avec la mention « Soyez notifié dès le lancement » : les apps annoncées ne sont pas encore sorties.
- **Leçon en creux** : ne jamais bloquer la première lecture sur téléphone ; ne pas afficher de boutons de stores pour une app qui n'existe pas.

### Lakoli (Côte d'Ivoire, nouvel entrant)
- **URL** : non trouvée (seule source : article AllAfrica du 22/09/2026, https://fr.allafrica.com/stories/202609220203.html).
- **Positionnement** : gestion scolaire « pensée pour les réalités des établissements ivoiriens », fondée par Eunice Coulibaly (finance/audit, ex-Grant Thornton).
- **Cible** : maternelle → 3e (deux écoles ivoiriennes selon l'article).
- **Prix** : non public.
- **Différenciant** : **facture normalisée électronique (FNE) intégrée** — l'obligation fiscale ivoirienne. Citation de l'article : relances des impayés « envoyées automatiquement par SMS ».
- **Pourquoi le noter** : il occupe l'argument « conformité fiscale ivoirienne », qu'aucun autre ne revendique.

### Galactis.Education (international, page Côte d'Ivoire)
- **URL** : https://www.galactis.education/page/logiciel-de-gestion-scolaire-cote-d-ivoire
- **Positionnement (verbatim)** : « College and School Management Software Ivory Coast » — « Fully compliant with the Education System in Ivory Coast as well as the OHADA Accounting System. »
- **Cible** : non précisée (pas de mention LMD/BTS).
- **Prix** : non public (lien vers `/page/pricing`).
- **Preuve** : aucune école ivoirienne nommée, aucun chiffre.
- **Captures** : une seule image, intitulée « Odoo CMS - a big picture ».
- **SEO** : **pages « logiciel de gestion scolaire + pays »** — tactique de référencement local par pays.
- **Design** : 2/5 (sur contenu).
- **Leçon** : une page par pays sans preuve locale ne convainc pas, mais elle **ranke**. KLASSCI peut faire la même chose avec de vrais clients.

### LMDManagerPro (RDC, supérieur LMD)
- **URL** : https://lmdmanagerpro.com/
- **Positionnement (verbatim)** : « Plateforme de délibération intelligente LMD » — « Vos délibérations LMD, simplifiées et automatisées ».
- **Cible** : universités et instituts supérieurs de la RDC.
- **Prix** : non public, aucune mention de devis.
- **Preuve (déclarée)** : « 3+ Institutions partenaires », « 100% Conforme au système LMD » ; section témoignages vide : « Aucun témoignage pour le moment. Soyez le premier à partager votre expérience! »
- **Captures** : aucune vraie UI — une toque de diplômé en image générée, sur bureau et sur téléphone.
- **Largeur** : moyennes par UE/EC, crédits et capitalisation, compensation, décisions de jury, PV, relevés.
- **Conversion** : « Nous contacter », WhatsApp (+243).
- **Design** : 2/5 — propre mais vide de preuve ; paragraphe d'introduction de 12 lignes justifié.
- **Mobile** : l'image générée occupe tout le premier écran, la promesse n'arrive qu'en bas ; page de 446 px de large pour 390 px (léger débordement horizontal mesuré).
- **Pourquoi le noter** : c'est le **seul acteur du panel qui met le jury et le PV en titre**. Le vocabulaire qu'il emploie est celui que les directeurs des études cherchent. KLASSCI a la profondeur fonctionnelle et peut prendre ce terrain avec des captures réelles.

### SmartSchool (Sénégal)
- **URL** : https://www.smartschool.sn/
- **Positionnement (verbatim)** : « La plateforme tout-en-un pour les écoles privées africaines : suivi de scolarité, moyennes automatiques, bulletins PDF et notifications parents par SMS et WhatsApp. » ; hero : « Modernisez votre école. Simplifiez vos processus. »
- **Cible** : écoles privées africaines.
- **Prix (public, verbatim, par mois)** : « Petite école (jusqu'à 200 élèves) : 30 000FCFA / mois », « École moyenne (jusqu'à 500 élèves) : 50 000FCFA / mois », « Grande école : À partir de 70 000FCFA / mois +25 % par tranche de 1 000 élèves ». Premier mois offert. Paiement « Mobile Money (Orange Money, Wave) ou virement ».
- **Preuve** : chiffres du tableau de bord de démonstration (482 élèves, 4,2 M FCFA, 96 %) ; « 1 jour pour être pleinement opérationnel ». Aucune école nommée.
- **Captures** : tableau de bord en maquette HTML.
- **Conversion** : « Écrire sur WhatsApp » (wa.me), « Demander une démo », téléphone.
- **Design** : 3/5 — hero lisible sur téléphone, CTA pleine largeur, mais violet générique et police serif par défaut sur le paragraphe.
- **Idée à retenir** : **le prix par tranche d'effectif** se lit en trois secondes par un fondateur.

### Tayssir School (Maroc)
- **URL** : https://tayssir.school/
- **Positionnement (verbatim)** : « Plateforme de Gestion Scolaire en Ligne 100% Marocaine » ; « La plateforme la plus complète de gestion scolaire au Maroc ».
- **Cible** : établissements privés marocains ; apps parents, enseignants, chauffeurs, directeurs.
- **Prix (verbatim)** : BASIC « GRATUIT » ; PREMIUM « Sur devis ».
- **Preuve (déclarée)** : « 45000+ utilisateurs actifs », « 50+ écoles », « 97% » satisfaction ; écoles nommées avec ville (Baraem à Salé, Al Ilm Wa Alimane à Rabat, Perle des Sciences à Fès, Camille Claudel à Casablanca).
- **Différenciant** : « synchronisation native et bidirectionnelle avec MASSAR » (la plateforme du ministère) ; « Chiffrement AES-256 », « Conformité CNDP ».
- **Conversion** : « Créer votre école c'est gratuit », devis gratuit.
- **SEO** : base de connaissance, FR + arabe.
- **Design** : non noté (capture non obtenue).
- **Idée à retenir** : **l'intégration au système officiel du ministère** est mise en titre. L'équivalent ivoirien pour KLASSCI : les états et documents attendus par la DREN / le MESRS, et les affectés / non affectés.

### Autres acteurs repérés (non fichés en détail)
- **Côte d'Ivoire** : Esouclou (https://esouclou.ci/), EvalScol Africa (https://evalscolafrica.siteteck.com/), KiboERP (https://kiboerp.com/erp/ecole, « SYSCOHADA »).
- **Sénégal** : LoTech School (https://www.lotechschool.com/, « 150+ écoles au Sénégal » selon l'extrait de recherche — site en rendu JavaScript, non vérifié), EduSen (« La plateforme n°1 de gestion scolaire au Sénégal », déclaré), Scolaris (FR + arabe), School'Gest, LAXIAL.
- **Bénin** : EducMaster, plateforme **du ministère** (MEMP) appuyée par l'UNICEF, pour le primaire et le CEP — ce n'est pas un concurrent commercial mais une donnée publique à connaître.
- **Togo** : SUKU, outil académique de l'Université de Lomé (source : https://univ-lome.tg/formation-sur-suku-et-le-manuel-de-procedures-lmd-luniversite-de-lome-renforce-les-capacites-des-acteurs-academiques/).
- **Agences** : Kolonell (Dakar) ranke en Côte d'Ivoire sur « logiciel gestion école privée Abidjan prix FCFA » avec des articles de devis (développement sur mesure « 4 000 000-12 000 000 FCFA », hébergement « 100 000-250 000 FCFA/mois »). **Le sur-mesure d'agence est un concurrent réel sur ces requêtes.**

---

## Point de départ : klassci.com aujourd'hui (capture téléphone du 1er octobre 2026)

À titre de référence, même protocole de capture (390 × 844) :

- Bandeau « Le SaaS éducatif africain tout-en-un, né en Côte d'Ivoire. », titre « Quel établissement gérez-vous ? », CTA « Voir les univers » (orange) et « S'inscrire ».
- **Le premier écran pose une question au lieu d'affirmer une promesse**, et ne montre ni preuve (aucun établissement, aucun chiffre), ni capture produit (la carte « Pilotage LMD, notes et bulletins » n'apparaît qu'en bas, vide au moment de la capture).
- **Aucun lien WhatsApp détecté sur l'accueil** (recherche de `wa.me` / `whatsapp` dans la page), alors qu'Innova, EDUC GO ON, SmartSchool et LMDManagerPro en ont tous un.
- Le logo n'était pas affiché en haut à gauche au moment de la capture (chargement lent ou image manquante : à vérifier).
- Pas de débordement horizontal (390 px).

## Ce que les concurrents font mieux qu'un SaaS scolaire africain typique

1. **Ellucian et Blackbaud vendent un résultat chiffré par client nommé** (« 50 % de réduction des impayés », « +25 % d'inscriptions »), pas un nombre d'établissements.
2. **Ellucian organise son site autour du parcours de l'étudiant**, étape par étape. C'est le récit « fil unique » que KLASSCI veut raconter.
3. **Canvas et Classter montrent la vraie interface**, annotée, rôle par rôle.
4. **Classter publie un exemple de devis réel** ; Fedena, Novacole et SmartSchool publient une grille. Le prix public raccourcit le cycle de vente.
5. **Classter, Novacole et Go4School ont une documentation publique.** Elle rassure avant l'achat et fait du référencement.
6. **Go4School publie un article par semaine** sur les vraies questions des directeurs (migration, paiement échelonné, absences).
7. **Tayssir met l'intégration au système du ministère en titre** (MASSAR) et nomme ses écoles avec la ville.
8. **Novacole et EDUC GO ON offrent un essai long en libre-service** (3 mois, 30 jours), sans démo obligatoire.

## Ce que KLASSCI peut dire autrement

- **Le seul à couvrir le supérieur LMD UEMOA, le BTS et le secondaire avec la même donnée.** Les acteurs africains font soit le secondaire (Novacole, Innova, SmartSchool, Go4School), soit la délibération LMD seule (LMDManagerPro). Les globaux couvrent le supérieur sans le LMD UEMOA.
- **Le fil complet, démontré**, pas énuméré : inscription → dossier → paiement (Wave, Orange Money, MTN, Moov) → classe → cours → présence → évaluation → note → bulletin → **jury et PV**. Aucun concurrent africain ne va jusqu'au jury avec preuves visuelles.
- **Les affectés / non affectés** : la réalité ivoirienne des frais et des quotas, absente de tous les sites étudiés.
- **WhatsApp comme canal produit, pas seulement comme bouton de contact** : relances, accusés, chatbot parent.
- **Une documentation publique déjà riche** (`/docs`, par rôle : secrétaire, comptable, super-admin) et un journal des versions public. Seuls Novacole, Go4School et Classter en ont une.
- **De vraies captures, avec de vraies données anonymisées**, là où Novacole, SmartSchool et LMDManagerPro montrent des maquettes.

---

## Tableau comparatif

Notes de 1 (faible) à 5 (fort). « ? » = non évaluable faute de rendu ou d'information.

| Concurrent | Clarté du message | Transparence prix | Preuve produit | Docs / blog | Conversion | Design |
|---|---|---|---|---|---|---|
| Canvas | 4 | 1 | 5 | 5 | 4 | 4 ? |
| PowerSchool | 4 | 1 | 2 | 5 | 3 | ? |
| Ellucian | 4 | 1 | 4 | 5 | 3 | 4 ? |
| Blackbaud | 5 | 1 | 4 | 5 | 4 | ? |
| Classter | 5 | 3 | 5 | 5 | 4 | 4 ? |
| Fedena | 3 | 5 | 2 | 2 | 4 | 2 ? |
| Odoo / OpenEduCat | 3 | 5 / 2 | 4 / 3 | 5 / 3 | 5 / 4 | 4 ? |
| Academia ERP | 3 | 1 | 3 | 4 | 3 | ? |
| Novacole | 5 | 5 | 3 | 4 | 5 | 5 |
| Go4School | 4 | 1 | 4 | 5 | 4 | ? |
| SchoolExpert | 3 | 4 | 2 | 1 | 4 | ? |
| Logesco | 3 | 1 | 2 | 3 | 3 | 3 |
| Innova School | 4 | 1 | 4 | 1 | 4 | 3 |
| EDUC GO ON | 3 | 4 | 3 | 1 | 2 | 2 |
| Galactis | 2 | 1 | 1 | 2 | 2 | 2 ? |
| LMDManagerPro | 5 | 1 | 1 | 1 | 3 | 2 |
| SmartSchool | 4 | 5 | 3 | 1 | 5 | 3 |
| Tayssir | 4 | 3 | 4 | 3 | 4 | ? |

---

## Les 8 opportunités de différenciation les plus actionnables

1. **Raconter le fil, pas la liste de modules.** Une frise unique, du dossier d'inscription au PV de jury, chaque étape illustrée par une **vraie capture KLASSCI**. C'est le récit d'Ellucian, appliqué au contexte ivoirien, et personne en Afrique ne le fait.
2. **Prendre le terrain du supérieur LMD UEMOA en titre.** Une page « Université » qui parle le vocabulaire des directeurs des études — UE, ECUE, crédits, compensation, rattrapage, jury, PV numéroté, relevé — avec captures du PV et de l'écran de délibération. LMDManagerPro occupe ces mots sans rien montrer.
3. **Publier un prix, ou au minimum un exemple de devis.** Novacole (200–600 F CFA par élève et par an), SmartSchool (30 000–70 000 F CFA par mois) et SchoolExpert (dès 50 000 F CFA) fixent déjà l'ordre de grandeur dans la tête du fondateur. Sans repère, KLASSCI est supposé cher. Le format Classter (« école de 1 000 élèves, voici le devis ») évite de figer une grille.
4. **Une preuve par résultat et par client nommé.** Remplacer les compteurs par deux ou trois chiffres d'impact avec l'école et la ville (taux de recouvrement, délai de sortie des bulletins, temps de délibération). Logesco montre ce que coûtent deux compteurs contradictoires ; Tayssir montre la force d'un nom + une ville.
5. **Mettre les canaux de paiement et WhatsApp dans le produit, pas dans le pied de page.** Montrer le reçu Wave / Orange Money rapproché automatiquement, la relance WhatsApp envoyée au parent et son accusé « lu ». Tous les concurrents africains citent le mobile money ; aucun ne montre la boucle complète.
6. **Assumer les spécificités ivoiriennes que personne n'écrit** : affectés / non affectés, états attendus par la DREN et le ministère, et, à surveiller, la facture normalisée électronique que Lakoli revendique. C'est l'équivalent du « MASSAR » de Tayssir.
7. **Faire de la documentation et du journal des versions un argument commercial.** Les mettre en avant sur l'accueil (« lisez comment ça marche avant de nous appeler »), et lancer un rythme éditorial sur les requêtes réelles : migration depuis Excel, paiement échelonné, préparation du jury, rentrée. Go4School et Kolonell rankent déjà sur ces requêtes ; des pages par pays et par cycle (Galactis) avec de vraies preuves feraient mieux qu'eux.
8. **Un mobile irréprochable, sans pop-up et avec WhatsApp en un geste.** EDUC GO ON masque sa page d'une pop-up, LMDManagerPro ouvre sur une image générée, Innova sur une mascotte. Sur un téléphone à 390 px de large, KLASSCI doit montrer au premier écran : la promesse, une capture réelle, « Démarrer » et « WhatsApp ». Et proposer un essai ou une démo en libre-service, sur le modèle de l'essai de 3 mois de Novacole.

---

## Sources

- https://www.instructure.com/canvas
- https://www.powerschool.com/
- https://www.ellucian.com/
- https://www.blackbaud.com/solutions/education-management
- https://www.classter.com/ · https://www.classter.com/pricing/
- https://fedena.com/ · https://fedena.com/pricing-and-plans
- https://www.odoo.com/fr_FR/pricing · https://www.odoo.com/fr_FR/app/elearning · https://www.openeducat.org/
- https://www.academiaerp.com/ · https://apps.apple.com/br/app/id6744888986
- https://novacole.com/ · https://www.novacole.com/tarifs · https://docs.novacole.com/
- https://www.go4school.net/fr · https://www.go4school.net/en · https://blog.go4school.net/fr
- https://schoolexpert.ci/ · https://schoolexpert.ci/souscription
- https://logesco.org/ · https://logesco.org/a-propos/ · https://logesco.org/nos-solutions/logesco-school-pro/
- http://innova-school.net/
- https://educgoon.com/
- https://fr.allafrica.com/stories/202609220203.html (Lakoli)
- https://www.galactis.education/page/logiciel-de-gestion-scolaire-cote-d-ivoire
- https://lmdmanagerpro.com/
- https://www.smartschool.sn/
- https://tayssir.school/
- https://kolonell.com/fr/blog/logiciel-gestion-ecole-privee-scolarite-abidjan-fcfa-2026
- https://www.unicef.org/benin/recits/au-b%C3%A9nin-educmaster-simpose-comme-un-outil-cl%C3%A9-pour-piloter-l%C3%A9ducation
