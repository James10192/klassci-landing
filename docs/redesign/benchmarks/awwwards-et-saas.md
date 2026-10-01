# Benchmark : Awwwards 2024–2026 et storytelling SaaS — principes transférables à klassci.com

*Recherche du 1er octobre 2026. Objectif : refonte klassci.com, positionnement « Education Operations Platform », direction artistique « institutionnel éditorial × logiciel produit ». On extrait des principes, on ne copie rien.*

---

## 0. Méthode et limites (à lire avant le reste)

- **Sources** : fiches Awwwards (`awwwards.com/sites/<slug>`) et pages de recherche/catégories Awwwards, puis les sites eux-mêmes, récupérés avec un outil de lecture web (WebFetch) le 1er octobre 2026. Les titres H1/H2 cités ont été revérifiés en téléchargeant le HTML brut (curl) quand c'était possible.
- **Ce que l'outil voit** : le texte et la structure du HTML, pas le rendu visuel ni l'animation. Les remarques sur le mouvement viennent soit du texte de la page, soit des tags Awwwards (« Scrolling », « 3D », « Microinteractions »), soit des notes « Developer Award ». Je ne décris aucune animation que je n'ai pas pu constater.
- **Mesure « mobile/perf »** : poids du HTML compressé téléchargé avec un user-agent Android, nombre de balises `<script>`, d'images/vidéos et de `loading="lazy"`. C'est un **indicateur de lourdeur**, pas un Lighthouse : il ne compte ni le JS ni les images effectivement chargés.
- **Échecs consignés** :
  - `velocityx.ai` et `www.velocityx.ai` → **HTTP 404** (le site primé n'existe plus à cette adresse).
  - `developers.mews.com` → le curl reçoit une page de captcha SiteGround (HTTP 202) ; WebFetch a obtenu le contenu.
  - `ramp.com` sert à nos deux outils une **« Machine Version »** en Markdown (5,5 Ko, 0 script), même avec un user-agent Chrome desktop : impossible de lire le hero humain. Je l'analyse donc sous cet angle.
  - `webflow.com/pricing` → erreur « Header overflow », non lue.
  - `why.zero.university` : le HTML ne contient que le titre et un compteur ; tout le contenu est rendu en WebGL côté client.
- **Ce benchmark ne contient aucun chiffre inventé** : chaque statistique citée est celle qu'affiche le site source, à la date du fetch.

---

## Partie 1 — Awwwards

### 1.1 Velocity X

- **Fiche** : https://www.awwwards.com/sites/velocity-x — *Nominee* du 11 janvier 2024, catégories Business & Corporate, Web & Interactive, Startups ; tags Clean, Colorful, **Horizontal Layout**, Minimal, Microinteractions. Créateurs : LUCERRÁ et Amar Singh Rathore. Moyenne 7,39/10 (11 votes).
- **Site live** : https://www.velocityx.ai/ → **404**. Impossible d'analyser la page elle-même. Les principes ci-dessous ne s'appuient que sur la fiche Awwwards et sont donc à prendre comme des hypothèses.

**Principes (à faible niveau de preuve)**
1. Un jury Awwwards récompense des **micro-interactions** sur une page minimale : la qualité perçue tient aux détails d'état (survol, focus, transitions courtes), pas à la quantité d'effets.
2. Une palette « colorée » peut rester « clean » si la structure est minimale — pertinent pour faire cohabiter bleu #0453CB et orange #F58220 sans bruit.

**À NE PAS importer** : la **mise en page horizontale**. Sur un téléphone Android d'entrée de gamme, un défilement horizontal piloté au scroll vertical désoriente et casse l'accessibilité clavier/lecteur d'écran.

**Leçon méta** : un site primé en janvier 2024 renvoie 404 en octobre 2026. Un site de marque dont la pérennité est un argument (une école confie ses données dix ans) doit garder ses URLs stables.

### 1.2 PX5 RTOS

- **Fiche** : https://www.awwwards.com/sites/px5-rtos — *Nominee* du 25 juillet 2024, Business & Corporate, Technology ; tags Minimal, SEO, **Content Architecture**, UI Design. Agence : ArtenergyDesign. Description : « simplifies complex tech with stunning, informative infographics ».
- **Site** : https://px5rtos.com — H1 vérifié : « Best RTOS for Embedded Developers » ; H2 : « PX5 RTOS IS CERTIFIED FOR SAFETY-CRITICAL SYSTEMS IN AUTOMOTIVE, INDUSTRIAL, MEDICAL AND MORE ».

**Principes**
1. **La preuve normative remonte dans le hero.** Les certifications (IEC 61508 SIL 4, ISO 26262 ASIL D…) et le sceau SGS-TÜV Saar sont posés dès le sous-titre. Pour un acheteur prudent, la conformité est l'argument d'entrée, pas une annexe.
2. **Chiffrer l'abstrait.** Le produit est invisible (un noyau temps réel) ; il est rendu tangible par des mesures : « Less than 1KB », « Sub-microsecond context-switching ». Un logiciel de gestion scolaire se prête à la même chose (délai de génération d'un bulletin, nombre de paiements rapprochés, etc. — à condition de les mesurer).
3. **Trois piliers, puis la profondeur.** « Enhance / Simplify / Unite » ouvrent la page ; chaque pilier se déplie ensuite en section dédiée (« Fastest RTOS », « Deterministic RTOS », « Certified Safe »).
4. **« You Are Not Alone! »** : une section entière sur l'accompagnement. Le support est vendu comme une caractéristique produit.
5. **Écosystème = logos de partenaires techniques** (Renesas, NXP, STMicroelectronics…), placés sous le titre « Trusted & Proven ».

**À NE PAS importer** : les titres en **CAPITALES** sur toute une ligne (le H2 du hero). En français, lisibilité dégradée, accents souvent mal rendus, et ton « fiche technique » qui ne parle pas à une directrice d'établissement.

**Mobile/perf** : HTML 15,6 Ko compressés, **8 scripts**, 23 images, **0 `loading="lazy"`**. Page très légère côté HTML/JS, mais aucune image différée : sur 3G, toutes partent au chargement.

### 1.3 Mews Developers

- **Fiche** : https://www.awwwards.com/sites/mews-developers — *Nominee* du 31 octobre 2023, tags Hotel/Restaurant, Startups, Clean, Minimal. Agence : The Weather. Moyenne 7,47/10 (15 votes). Décrit comme « newly redesigned developer portal » à « sleek, structured layout ».
- **Site** : https://developers.mews.com/ — aujourd'hui c'est d'abord le **site R&D** de Mews : accroche « Make it remarkable », navigation Blog / Podcast / Open Source / Career / Events, articles datés et signés (ex. « From 30 Seconds to 200ms: What a Slow Search Taught Us About Scale », juillet 2026), dépôts open source avec langages, lien de pied vers Mews.com. La partie « portail API » décrite par la fiche n'est plus l'entrée principale.

**Principes**
1. **Un sous-domaine éditorial séparé du site commercial** pour une audience différente (développeurs, recrutement). Le marketing produit reste sur Mews.com et le pied de page fait le pont.
2. **L'expertise se prouve par des récits datés et signés** (catégories Engineering, Design, Product, Leadership), pas par des slogans.
3. **Chiffres d'ancrage dans le pied de page** : « 70+ countries », « 3000+ hotels » — la preuve d'échelle accompagne chaque article.
4. **Taxonomie visible** sur chaque carte (catégorie + date + auteur) : le lecteur trie avant de cliquer.

**À NE PAS importer** : un podcast ou un blog « culture d'ingénierie » comme vitrine principale. Une directrice d'établissement ne vient pas chercher la culture interne de l'éditeur ; chez KLASSCI, ce registre a sa place dans le blog, pas dans le parcours d'achat.

**Mobile/perf** : non mesurable par curl (captcha SiteGround). À retenir : une protection anti-bot qui bloque aussi les robots peut nuire à l'indexation.

### 1.4 StratusGrid

- **Fiche** : https://www.awwwards.com/sites/stratusgrid — *Nominee* du 17 décembre 2024, Business & Corporate ; tags Clean, Scrolling, SEO, **3D**, Interaction Design. Agence : Kalungi (agence marketing B2B SaaS). Moyenne 7,10 (8 votes). Éléments cités : « 3D scroll-linked homepage hero », intégrations, landing pages webinaires.
- **Site** : https://stratusgrid.com → titre actuel « Stratusphere™ by StratusGrid - Infra, Reinvented. » Le site a été **repositionné depuis la nomination** (d'une offre de services cloud vers une plateforme multi-agents). H1 vérifiés : « Infra, Reinvented. » puis « Board-grade Results . Engineer-grade Ally . » ; H2 « A multi-agent platform that turns cloud complexity into outcomes », « A C-Suite's Dream ».

**Principes**
1. **Le problème avant la solution** : le sous-titre décrit la douleur (« Enterprises drown in dashboards… ») avant de nommer le produit.
2. **Double promesse explicite par persona** : « Board-grade Results » pour la direction, « Engineer-grade Ally » pour l'équipe technique, chacune avec ses bénéfices (P&L mesurable vs sécurité des changements). Transposition directe : **fondateur/directeur** vs **comptable/secrétariat**.
3. **CTA de haut niveau, pas d'essai gratuit** : « Request an Executive Briefing ». Pour un achat institutionnel, on vend un rendez-vous, pas un formulaire d'inscription.
4. **Un positionnement « plateforme »** se raconte en blocs de capacités nommées (« Closed-loop Solution », « Safety by Design », « Embedded Expertise »), pas en liste de fonctionnalités.

**À NE PAS importer** : le **hero 3D lié au scroll** signalé par Awwwards. Coûteux sur mobile d'entrée de gamme, et il retarde l'accès au message pour un visiteur qui découvre la marque.

**Mobile/perf** : HTML 37 Ko, 28 scripts, 23 images dont 22 en lazy. Discipline de chargement correcte.

### 1.5 Superconscious

- **Fiche** : https://www.awwwards.com/sites/superconscious — **Honorable Mention** du 3 juin 2025 (la liste de recherche Awwwards l'affiche aussi sous « Product Honors, Jun 2025 » — deux libellés pour la même entrée). Mobile & Apps, Web & Interactive ; tags Animation, Icons, Scrolling. Agence : Outcrowd. Moyenne 7,96/10. Live : https://superconscious-app.webflow.io (sous-domaine Webflow, application en bêta).
- **Site** : « Control Your Mind Manifest Your Reality », CTA unique « Join Waitlist », maquettes téléphone/tablette, flux en 4 étapes (« Upgrade Your Reality »), segmentation particuliers / équipes. **Aucune preuve sociale, aucun tarif.**

**Principes**
1. **Expliquer un système en 4 étapes numérotées** (saisir → analyser → générer un parcours → s'adapter). Format directement réutilisable pour le parcours d'inscription KLASSCI (candidature → rendez-vous → caisse → contrôle des pièces → inscription).
2. **Un seul CTA répété** à plusieurs hauteurs de page : pas de choix à faire.
3. **Segmentation dans la page** (individus / équipes) plutôt que dans la navigation, quand l'offre est petite.

**À NE PAS importer** : **une page sans aucune preuve** et des écrans de produit fictifs. C'est acceptable pour une liste d'attente grand public, rédhibitoire pour une école qui confie ses données financières et académiques. Et la palette sombre/violette (#0C0B0C, #7322F2) est à l'opposé de la direction « institutionnel éditorial ».

**Mobile/perf** : HTML 13,9 Ko, 23 scripts, 15 images dont 14 lazy. Page légère.

### 1.6 Autres références Awwwards pertinentes (éducation et logiciel B2B)

#### ParentSquare — la plus proche de KLASSCI
- **Fiche** : https://www.awwwards.com/sites/parentsquare — *Nominee* du 28 septembre 2026, **Culture & Education**, Technology ; tags Storytelling, Interaction Design, Microinteractions. Agence : Boldworld. Moyenne 8,58/10 (5 votes). Description : « make a complex education platform feel clear, warm, and connected ».
- **Site** : https://www.parentsquare.com/ — H1 vérifié : « The K-12 family engagement platform built to reach every family ». Sous-titre : « One unified platform for communication, websites, attendance, and payments ». H2 : « Family engagement infrastructure trusted by 42,000+ schools », « Made for how schools actually work », « The platform behind family engagement: All of your tools, one platform ».

**Principes**
1. **Nommer la catégorie dans le H1** (« K-12 family engagement platform ») puis lister les modules en une phrase. C'est exactement le geste « Education Operations Platform ».
2. **Navigation à double segmentation** : par **rôle** (Superintendents, Communications, Technology, Teachers, Families) et par **type d'établissement** (petits/grands districts, privé/charter). Transposition : par rôle (direction, scolarité, comptabilité, enseignants, familles) et par cycle (université LMD/BTS, collège-lycée).
3. **Preuves d'adoption orientées résultat éducatif** : « 99% district retention », « 190+ languages translated », « 99.5% family contactability ». La traduction est vendue comme un argument d'équité (« reach every family »).
4. **Vraies captures d'interface** (tableau de bord d'engagement) + icônes pour les modules secondaires.
5. **Témoignages de décideurs** (superintendents, directions techniques), pas d'utilisateurs anonymes.

**À NE PAS importer** : le vocabulaire et les rôles du système scolaire américain (district, superintendent, K-12). Il faut reconstruire la segmentation sur la réalité ivoirienne (DRENA, établissement privé confessionnel, grande école, université LMD).

**Mobile/perf** : HTML 42,9 Ko mais **91 scripts** et 82 images (45 lazy). Le site primé le plus chargé en scripts du panel éducation : bonne preuve qu'un site « chaleureux » peut devenir lourd.

#### Why Zero (Zero University) — SOTD éducation
- **Fiche** : https://www.awwwards.com/sites/why-zero — **Site of the Day** du 7 septembre 2026 (plus Developer Award), Culture & Education, Technology ; Three.js, GSAP, Blender, son, 3D. Décrit comme montrant comment Zero University « is replacing the broken education system with AI-native learning ».
- **Site** : https://why.zero.university/ — le HTML ne contient que `<title>` « Zero — Human Infrastructure to Get Hired », la méta-description et un compteur ; **tout le récit est rendu en WebGL**. Note : la balise viewport interdit le zoom (`maximum-scale=1.0, user-scalable=no`).

**Principes**
1. **Une seule couleur d'accent** (blanc + vert vif, selon Awwwards) suffit à rendre une marque éducative reconnaissable.
2. **Récit d'un modèle pédagogique en chapitres** : le site entier sert un seul argument (« pourquoi le système actuel est cassé »). Un manifeste peut vivre sur une page dédiée, séparée du parcours commercial.

**À NE PAS importer** : le **contenu entièrement en WebGL**. Invisible pour les moteurs et les lecteurs d'écran, inutilisable sur réseau instable, et zoom désactivé (contraire aux règles d'accessibilité). C'est l'anti-modèle exact pour une directrice sur Android en 3G.

#### Wispr Flow — preuve produit par démonstration
- **Fiche** : https://www.awwwards.com/sites/wispr-flow — *Nominee* du 19 septembre 2026. Agence N4 Studio. Moyenne 7,93.
- **Site** : https://wisprflow.ai/ — « Don't type, just speak. »

**Principes**
1. **Avant/après sur données réelles** : texte dicté brut vs texte nettoyé, montrés côte à côte. Pour KLASSCI : une feuille de notes papier vs le bulletin généré ; un reçu manuscrit vs le journal de caisse rapproché.
2. **Comparaison chiffrée simple** (« Keyboard 45 wpm vs Flow 220 wpm ») qui se lit en une seconde.
3. **CTA par plateforme** (Mac, Windows, iPhone, Android) — la plateforme du visiteur est un critère de décision.
4. **Sécurité et conformité en section propre** (SOC 2, HIPAA, ISO 27001) + **FAQ longue** (13 questions) en bas de page.

**À NE PAS importer** : les témoignages de célébrités du podcast américain. La preuve qui compte pour une école ivoirienne est un pair (une autre direction d'école), pas une personnalité.

**Mobile/perf** : HTML 92,8 Ko, 71 scripts, 56 images/vidéos mais **seulement 6 en lazy** : la plupart des médias partent au chargement.

#### Butter — SOTD logiciel (fiche seule)
- **Fiche** : https://www.awwwards.com/sites/butter — **Site of the Day** du 28 septembre 2026 + Developer Award, Business & Corporate, « App Style ». Agence ToyFight. Palette à deux couleurs (#1E1E1E / #F7F7F7). Note « Content » 7,69, la plus haute de ses sous-notes. Site live (non lu) : https://www.butter.video/

**Principes (depuis la fiche uniquement)**
1. **Le site emprunte la grammaire de l'application** (« App Style », « timeline functionality ») : la page d'accueil ressemble au produit qu'elle vend.
2. **Bichromie stricte** : la retenue chromatique est jugée comme une qualité de contenu, pas un manque.

**À NE PAS importer** : WebGL/P5.js en page d'accueil pour une cible à connectivité variable.

#### Moto Finance — SOTD finance (fiche seule)
- **Fiche** : https://www.awwwards.com/sites/moto-finance — **Site of the Day** du 24 septembre 2026, Technology, Luxury ; Webflow, GSAP, Three.js. Description : « Designed to make the card feel worth carrying before you even apply. » Site live (non lu) : https://www.moto-card.com/

**Principe** : **faire désirer l'objet avant le formulaire**. Pour KLASSCI, l'objet désirable est tangible : le bulletin PDF, le reçu, la carte d'étudiant, le relevé LMD. Les montrer en haute qualité avant de demander une démo.

**À NE PAS importer** : le registre « luxe » (grandes images en fond, parallax). Le message d'un logiciel scolaire est la fiabilité, pas l'exclusivité.

#### Krackerz Learning et The Shape of Intelligence (fiches seules, nominés éducation septembre 2026)
- https://www.awwwards.com/sites/krackerz-learning — *Nominee* 28/09/2026, Culture & Education, Framer, « stickers interactions », moyenne 8,29.
- https://www.awwwards.com/sites/the-shape-of-intelligence — *Nominee* 26/09/2026, Culture & Education, « interactive history of AI », WebGL, typographie ray-marchée, moyenne 7,91.

**Constat transversal** : sur les 15 entrées listées dans la catégorie Éducation d'Awwwards au moment du fetch (https://www.awwwards.com/websites/education/), presque toutes sont des expériences narratives ou des sites de formation ; **ParentSquare est la seule plateforme de gestion scolaire B2B**. Autrement dit, la référence « logiciel éducatif institutionnel » est quasiment vide chez Awwwards : c'est un espace où KLASSCI peut se distinguer, à condition de ne pas emprunter le registre « expérience immersive » qui domine la catégorie.

---

## Partie 2 — Storytelling produit SaaS

Tableau de mesure (HTML compressé, UA Android, 1er oct. 2026) :

| Site | HTML | `<script>` | img/vidéo | lazy |
|---|---|---|---|---|
| stripe.com | 188 Ko | 87 | 35 | 34 |
| linear.app | 172 Ko | **185** | 38 | 32 |
| vercel.com | 58 Ko | 71 | 19 | 12 |
| notion.com | 33 Ko | 47 | 55 | 21 |
| ramp.com | 5,5 Ko (version machine) | 0 | 0 | 0 |
| intercom.com | **273 Ko** | 38 | 60 | 56 |
| attio.com | 135 Ko | 72 | 47 | 32 |
| retool.com | 44 Ko | 48 | 132 | 131 |
| clerk.com | 118 Ko | 47 | 102 | 97 |
| supabase.com | 95 Ko | 93 | 57 | 29 |
| webflow.com | 97 Ko | 45 | 158 | 84 |

*Lecture : un gros HTML signale généralement du contenu rendu côté serveur (bon pour l'indexation) mais lourd à télécharger ; un grand nombre de `<script>` signale un coût d'exécution sur téléphone modeste.*

### 2.1 Stripe — https://stripe.com/
- **Hero** : « Financial infrastructure to grow your revenue. Accept payments, offer financial services, and implement custom revenue models—from your first transaction to your billionth. » (H1 vérifié). Pas d'interface produit dans le hero d'après la lecture : fond animé illustré + bandeau de logos clients.
- **Système complexe** : grille de modules (« Flexible solutions for every business model »), outil de recommandation (« Get Stripe product recommendations » / « Guide me »), chiffres d'échelle (« $1.9T in payments volume processed in 2025 », « 99.999% historical uptime »), puis sections par stade (entreprise, startup, plateforme) en accordéons et carrousels.
- **Navigation** : Products / Solutions (par **stade**, par **cas d'usage**, par **secteur**) / Developers / Resources / Pricing.
- **Tarifs** (https://stripe.com/pricing) : tarif public par transaction (« 2.9% + 30¢ per successful transaction for domestic cards »), offres sur devis (« Design a custom package »), FAQ, **sélecteur pays/devise** en pied (50+ régions).
- **Docs** (https://docs.stripe.com/) : entrée **par objectif** (« Accept payments online », « Collect payments with invoices », « Accept payments in-person »…) puis **par produit**. Le marketing pointe vers docs, GitHub et des voies **no-code**.
- **CTA** : « Get started » (self-service) / « Contact sales » (grands comptes).

**Principes**
1. **Le système se découpe trois fois** : par stade, par cas d'usage, par secteur. Un même module est atteignable par trois portes.
2. **Un assistant de choix** (« Guide me ») pour le visiteur qui ne sait pas quoi acheter.
3. **Les chiffres d'infrastructure** (disponibilité, volumes) sont des arguments commerciaux.
4. **Docs organisées par tâche métier** avant d'être organisées par produit, avec une voie no-code explicite.
5. **Tarif publié + devis** : le prix de base rassure, le devis absorbe les cas complexes.

**À NE PAS importer** : la densité de la méga-navigation (Products liste ~25 produits en pied). Une directrice ne doit pas avoir à choisir parmi 25 entrées ; KLASSCI a deux ou trois portes, pas vingt-cinq.

**Mobile/perf** : 188 Ko de HTML, 87 scripts. Riche et rendu serveur, mais lourd.

### 2.2 Linear — https://linear.app/
- **Hero** : « The product development system for teams and agents » + « Purpose-built for planning and building products. Designed for the AI era. »
- **Preuve** : **vraies captures de l'application** (issue DRV-8852, diff de code, roadmap, conversation d'agent).
- **Système** : **quatre chapitres = quatre étapes du cycle** (Intake and integrations → Planning and monitoring → AI and automations → Build, review, and ship), chacun avec capture réelle et « Learn more→ ». Puis section **Changelog** datée sur la page d'accueil.
- **Navigation** : Product, Resources, Customers, Pricing, Now, Contact, **Docs**, Open app, Log in, Sign up.
- **Tarifs** (https://linear.app/pricing) : Free / Basic $10 / Business $16 / Enterprise ; tableau de comparaison **groupé par familles** (Issues, Teams, Triage, Security, Support…) ; logique cumulative « All Basic features + ».
- **Éditorial** : https://linear.app/method — « The Linear Method », chapitres numérotés (1.1, 2.1…) en deux parties « Direction » et « Building » ; vend une **méthode** avant un outil.
- **Docs** (https://linear.app/docs) : organisées **par flux de travail**, avec un « Start Guide » et un guide d'import depuis d'autres outils.

**Principes**
1. **Le produit se prouve par sa vraie interface**, pas par une illustration.
2. **Les sections de la page d'accueil suivent le cycle métier**, pas l'organigramme des modules. Pour KLASSCI : inscription → scolarité → notes et bulletins → finances → pilotage.
3. **Un changelog daté sur la page d'accueil** prouve que le produit vit.
4. **Une méthode publiée** (doctrine numérotée) installe une autorité éditoriale — c'est le cœur de la direction « institutionnel éditorial ».
5. **Un guide de migration** depuis l'outil précédent réduit la peur du changement.

**À NE PAS importer** : le H1 répété trois fois pour un effet typographique (constaté dans le HTML) et les **185 scripts**. Le registre « culture tech » (agents, diffs de code) ne parle pas à un acheteur scolaire.

### 2.3 Vercel — https://vercel.com/
- **Hero** : « Agentic Infrastructure » / « For coding agents to ship apps and agents automated by agents. » CTA « Deploy now » / « Talk to sales ».
- **Système** : quatre piliers (Durable Orchestration, Sandboxed Environments, AI Model Gateway, Fluid Compute) racontés **à travers trois clients** (Notion, Zapier, Mintlify), chacun avec une métrique et les capacités utilisées.
- **Tarifs** (https://vercel.com/pricing) : Hobby gratuit / Pro « $20/mo » / Enterprise ; usage à la consommation ; **budget de dépense par défaut** (« default on-demand usage budget of $200 »). Pas de calculateur.

**Principes**
1. **Raconter une capacité par un client qui l'utilise** : le cas client sert de démonstration fonctionnelle.
2. **Un garde-fou de coût visible** (plafond par défaut) rassure l'acheteur sur les dérapages.
3. **CTA d'action directe + CTA humain** côte à côte.

**À NE PAS importer** : un hero en jargon de catégorie émergente (« Agentic Infrastructure »). Le H1 KLASSCI doit être compris par une directrice en une lecture.

### 2.4 Notion — https://www.notion.com/
- **Hero** : « Where teams and agents Think together. » CTA « Get Notion free » / « Request a demo ».
- **Système** : **onglets** (Capture knowledge / Find answers / Automate busywork), chaque onglet change l'interface affichée ; quatre cas d'usage concrets en dessous.
- **Navigation** : segments Enterprise / Small businesses / Startups / Developers ; lien « Download the Notion App ».
- **Tarifs** (https://www.notion.com/pricing) : Free / Plus $10 / Business $20 (« Recommended ») / Enterprise ; bascule mensuel/annuel (« Save up to 20% with yearly ») ; **offre éducation explicite** (« free for students and educators ») ; FAQ incluant les règles de remboursement UE ; **13 langues** en pied.

**Principes**
1. **Les onglets montrent un système sans le simplifier** : trois verbes, trois écrans.
2. **Un plan « recommandé »** évite la paralysie du choix.
3. **Le tarif traite le cas éducation** explicitement.
4. **FAQ juridique adaptée à la région** (ici l'UE) : les questions de facturation locale sont traitées sur la page tarifs.

**À NE PAS importer** : le modèle freemium « par membre ». Une école achète au nombre d'élèves/étudiants ou par établissement, pas par siège d'utilisateur.

**Mobile/perf** : 33 Ko de HTML, 47 scripts — la plus sobre des grandes pages SaaS mesurées.

### 2.5 Ramp — https://ramp.com/
- Nos deux outils reçoivent une **« Ramp — Machine Version »** (Markdown, 0 script) : liens rapides (Docs, Help Center, Integrations, Pricing, Trust Center), offre promotionnelle, chiffres (« 70,000+ businesses », « 27M+ hours saved collectively »), modules, **flux de données en 8 étapes**, **checklist d'implémentation**, section comparatif concurrentiel. Le hero visuel n'a pas pu être lu.
- **Tarifs** (https://ramp.com/pricing) : Free $0 / Plus « $15/mo/user + Platform fee based on team size » / Enterprise ; tableau par grandes fonctions (Card, Expense, AP, AR, Procurement…) ; « Savings calculator » ; slogan « Start for free. Scale with Intelligence. »

**Principes**
1. **Une version lisible par les machines** (agents IA, moteurs) du site commercial : contenu structuré, liens canoniques, chiffres. Pertinent pour KLASSCI (aucun `llms.txt` ni équivalent trouvé dans le dépôt `klassci-landing` au 1er octobre 2026) : si une telle version est créée, la garder **synchronisée** avec le site humain.
2. **Une checklist d'implémentation publiée** rend l'onboarding prévisible avant l'achat.
3. **Un calculateur d'économies** ramène la décision à un chiffre propre au visiteur.

**À NE PAS importer** : les primes d'inscription (« $3,100 signup bonus »). Dans le contexte scolaire, une incitation financière à signer sape la crédibilité institutionnelle.

### 2.6 Intercom — https://www.intercom.com/
- **Hero** : « A complete system for human and AI customer service ». CTA « Start free trial » / « View demo », mention « 14 day free trial. No credit card required. »
- **Preuve** : vraies captures (raisonnement de l'agent Fin), **métrique de résultat** (« averaging 76% across 12,000+ customers »), témoignages nominatifs.
- **Système** : deux produits (Helpdesk + Fin AI Agent) puis leur combinaison (« Together, they deliver… »).
- **Tarifs** (https://www.intercom.com/pricing) : « Seats » + « Usage » expliqués en une phrase ; Essential $29 / Advanced $85 / Expert $132 par siège ; « $0.99 per Fin outcome » ; **calculateur de prix + calculateur de ROI** ; « Startups get 93% off ».

**Principes**
1. **Expliquer le modèle de prix en une phrase** avant les montants (« Intercom pricing has two components… »).
2. **Une métrique de résultat moyenne, avec sa base** (« across 12,000+ customers ») plutôt qu'un superlatif.
3. **Deux modules + leur synergie** : présenter d'abord les briques, puis ce que leur combinaison permet. Transposition : ERP scolaire + LMS, puis ce qu'apporte l'intégration.
4. **Réduire le risque de l'essai** : durée affichée, « no credit card required ».

**À NE PAS importer** : la facturation « au résultat » à l'unité. Elle est illisible pour un budget d'établissement voté une fois par an.

**Mobile/perf** : **273 Ko de HTML**, la page la plus lourde du panel, mais 56 des 60 médias en lazy.

### 2.7 Attio — https://attio.com/
- **Hero** : « Welcome to agentic revenue. » / « Attio is the CRM that builds pipeline, advances deals, and grows accounts around the clock. » CTA : « Talk to sales », « Start for free », « Send me a demo ».
- **Système** : **cinq onglets = cinq étapes du cycle commercial** (Build pipeline → Convert leads → Run sales motions → Forecast revenue → Retain/expand), avec captures réelles (kanban, tableaux de bord, conversation Slack), et révélation progressive au scroll (« sticky »).
- **Tarifs** (https://attio.com/pricing) : Free / Plus / Pro (« Popular ») / Enterprise, bascule mensuel/annuel, tableau groupé (Credits, Workspace, Automations…), programme startup « up to 80% off ».
- **Ressources** : guides d'import depuis Salesforce, HubSpot, Pipedrive, Zoho.

**Principes**
1. **Trois CTA de niveaux d'engagement différents** : parler à quelqu'un, essayer seul, recevoir une démo asynchrone (« Send me a demo »). Le troisième est précieux pour un décideur pressé ou mal connecté.
2. **Onglets = étapes du cycle de vie** du client (pour KLASSCI : de la candidature au diplôme).
3. **Guides de migration par outil concurrent** nommé.

**À NE PAS importer** : la promesse « around the clock » / agents autonomes. Pour une école, l'automatisation doit être présentée sous contrôle humain (validation, double signature), pas comme un remplacement.

### 2.8 Retool — https://retool.com/
- **Hero lu** : « Secure your vibe-coded apps » + « Explore the new Retool app builder for free ». La lecture ne restitue **pas** de capture du constructeur dans le contenu ; la preuve passe par des logos et des résultats chiffrés (« Ramp saved $8M and 20,000+ hours »). 132 images/vidéos dans le HTML, dont 131 en lazy.
- **Navigation** : par cas d'usage et par **secteur** (manufacturing, financial services).

**Principes**
1. **Résultat client chiffré** comme preuve principale quand le produit est un outil générique.
2. **Galerie d'applications** (« View app gallery ») : montrer ce que d'autres ont construit.
3. **Lazy-loading quasi systématique** des médias (131/132).

**À NE PAS importer** : un H1 dicté par l'actualité d'un nouveau produit plutôt que par la promesse permanente. Le H1 de KLASSCI doit rester stable d'un trimestre à l'autre.

### 2.9 Clerk — https://clerk.com/
- **Hero** : « More than authentication. Clerk gives you full stack auth and user management… » CTA unique répété « Start building for free ».
- **Système** : **galerie de composants nommés** (`<SignUp />`, `<UserButton />`, `<OrganizationSwitcher />`) regroupés par domaine (authentification, multi-organisation, facturation).
- **Tarifs** (https://clerk.com/pricing) : Hobby gratuit / Pro $25 / Business $300 / Enterprise ; quotas « 50,000 MRU limit per app » avec **délai de grâce d'un mois** en cas de dépassement ; FAQ qui ose « Less than you might fear » sur la croissance virale.

**Principes**
1. **Montrer les briques comme des objets nommés et cliquables** : chaque composant est une preuve isolée. Transposition : bulletin, relevé, reçu, emploi du temps, carte d'étudiant comme « objets » montrés un par un.
2. **Le dépassement de quota ne coupe pas le service** (délai de grâce), et la page le dit.
3. **FAQ qui répond à la peur du coût** franchement.

**À NE PAS importer** : la galerie en noms de code. Pour une directrice, les « composants » s'appellent par leur nom métier, illustrés par le document réel.

### 2.10 Supabase — https://supabase.com/
- **Hero** : « Build in a weekend. Scale to millions. » ; positionnement « open source », « Built on Postgres ».
- **Système** : grille de **six produits** (Database, Auth, Storage, Edge Functions, Realtime, Vector) ; **table « par objectif » renvoyant vers la doc** ; mention de l'absence d'enfermement (connexion psql, Prisma, Drizzle).
- **Tarifs** (https://supabase.com/pricing) : Free / Pro « from $25/month » / Team / Enterprise ; **plafonds de dépense activés par défaut** ; **exemple de facture calculé à la main** (« $25 (plan) + $10 + $10 - $10 (credits) = $35/month ») ; FAQ.

**Principes**
1. **L'argument de réversibilité** (vos données restent exportables) est un argument de vente — crucial pour un établissement qui craint l'enfermement.
2. **Un exemple de facture réel** vaut mieux qu'un calculateur pour des cas simples.
3. **Le marketing route directement vers la bonne page de doc** par objectif.

**À NE PAS importer** : le registre développeur (commandes `npx`, MCP) dans le parcours principal. Chez KLASSCI, la doc technique existe pour l'intégration, mais la porte d'entrée est métier.

### 2.11 Webflow — https://webflow.com/
- **Hero** : « Build for what's next » ; CTA « Get started » / « Talk to Sales ».
- **Preuve** : **vraies captures de l'éditeur** (bureau et tablette), vidéo plus bas.
- **Système** : sections **par rôle** (marketing, design, ingénierie, agences), chacune titre + visuel + bénéfices.
- **Tarifs** : `webflow.com/pricing` **non lu** (erreur « Header overflow »).

**Principes**
1. **Une section par rôle dans la page d'accueil** : chaque visiteur se reconnaît sans changer de page.
2. **Captures multi-supports** (bureau + tablette) : prouver que le produit marche sur l'écran du visiteur.

**À NE PAS importer** : 158 médias sur une page d'accueil (84 seulement en lazy). Trop pour un réseau mobile variable.

---

## Partie 3 — Synthèse : les 12 principes pour KLASSCI

Chaque principe est rattaché à une page précise. Les sources entre parenthèses sont les sites où il a été constaté.

| # | Principe | Page KLASSCI | D'où il vient |
|---|---|---|---|
| 1 | **Nommer la catégorie dans le H1, lister les modules dans la phrase suivante.** « La plateforme d'exploitation des établissements scolaires » puis « inscriptions, scolarité, notes et bulletins, finances, classe virtuelle ». | **Accueil (hub)** | ParentSquare, Stripe |
| 2 | **Deux portes, pas vingt-cinq** : choisir son cycle (université LMD/BTS ↔ collège-lycée) puis son rôle (direction, scolarité, comptabilité, enseignant, famille). | **Accueil (hub)** + navigation | ParentSquare, Stripe (par stade/usage/secteur), Webflow |
| 3 | **Le produit se prouve par sa vraie interface et ses vrais documents**, recadrés et lisibles sur téléphone : bulletin PDF, relevé LMD, reçu de caisse, emploi du temps. Aucune maquette fictive. | **Université**, **Collège** | Linear, Intercom, Webflow ; contre-exemple Superconscious |
| 4 | **Raconter le cycle de vie, pas l'organigramme des modules** : chapitres ou onglets « Candidature → Inscription → Cours → Évaluations → Bulletins/Délibération → Diplôme ». | **Université** (LMD : UE/ECUE, jury, PV) et **Collège** (trimestres, conseil de classe) | Linear, Attio, Notion |
| 5 | **Avant/après concret** : la feuille de notes papier vs le bulletin généré ; le cahier de caisse vs le rapprochement de fin de journée. | **Collège**, **Université**, **Accueil** | Wispr Flow |
| 6 | **Expliquer le parcours en étapes numérotées**, exactement comme l'école le vit (candidature, rendez-vous, caisse, contrôle des pièces, inscription), avec ce que voit la famille à chaque étape. | **Portails d'inscription** | Superconscious (format), ParentSquare |
| 7 | **Montrer l'ERP et le LMS séparément, puis ce que leur intégration permet** (les notes du devoir en ligne remontent au bulletin sans ressaisie). | **LMS / classe virtuelle** | Intercom |
| 8 | **Tarifs : expliquer le modèle en une phrase, publier un prix d'entrée, un plan recommandé, un exemple de facture réel**, un tableau groupé par familles (académique, finances, communication, sécurité), une FAQ sur les vraies peurs (dépassement, résiliation, export des données). Montants en **FCFA**. | **Tarifs** | Intercom, Notion, Supabase, Linear, Clerk |
| 9 | **Réversibilité et conformité dès le haut de page** : « vos données restent exportables », hébergement, sauvegardes, journal d'audit, séparation des rôles. Pour un acheteur prudent, c'est l'argument d'entrée. | **Tarifs**, **Accueil**, page **Sécurité** | PX5 RTOS, Supabase, Wispr Flow |
| 10 | **Docs organisées par tâche métier**, chaque section marketing renvoyant vers la page de doc correspondante (« Configurer une délibération », « Clôturer la caisse »), plus un guide de migration depuis Excel/ancien logiciel. | **Docs** (et liens depuis Université/Collège) | Stripe docs, Linear docs, Supabase, Attio (import) |
| 11 | **Une doctrine éditoriale numérotée** (« la méthode KLASSCI » : principes de gestion d'un établissement), des articles datés et signés, et un journal des nouveautés visible depuis l'accueil. C'est le pilier « institutionnel éditorial ». | **Blog** + extrait sur **Accueil** | Linear Method + Changelog, Mews Developers |
| 12 | **CTA par niveau d'engagement** — « Demander une présentation » (direction), « Recevoir une démo vidéo » (asynchrone, léger en données), « Voir un établissement en démonstration » — et un **assistant de choix** pour qui ne sait pas quelle offre prendre. | **Accueil**, **Tarifs**, fin de chaque page | Attio, StratusGrid (« Executive Briefing »), Stripe (« Guide me ») |

### Garde-fous transversaux (mobile, connectivité, public)

- **Pas de WebGL, de 3D liée au scroll ni de défilement horizontal** dans le parcours d'achat (Why Zero, StratusGrid, Velocity X, Butter, Moto Finance). Si une pièce immersive existe, elle vit sur une page manifeste séparée, avec une version texte complète.
- **Ne jamais désactiver le zoom** (constaté sur Why Zero).
- **Budget de scripts et de médias** : les pages SaaS mesurées vont de 38 à 185 balises `<script>` ; les médias non différés sont fréquents (Wispr Flow : 6 lazy sur 56). Pour KLASSCI, viser l'inverse : médias différés par défaut, captures en WebP, aucune vidéo en lecture automatique.
- **Preuve par les pairs** : témoignages de directions d'établissement de la sous-région, pas de célébrités ni de logos de multinationales.
- **Tout chiffre affiché doit être mesuré** (nombre d'établissements, d'élèves, de bulletins générés) ; à défaut, ne pas en afficher. Les sites de référence tirent leur crédibilité de chiffres sourcés et datés.
- **Envisager une version machine synchronisée** (type `llms.txt`, absente du dépôt aujourd'hui), sur le modèle de Ramp, sans y mettre d'offre promotionnelle.
