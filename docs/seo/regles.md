# Les règles SEO du dépôt

Ce qui a été établi en septembre 2026, vérifié à la source, et qui ne doit pas
être redécouvert à chaque session. Les agents `.claude/agents/seo-*.md` s'y
réfèrent.

## Ce qui a réellement cassé, et pourquoi

Ces quatre pannes ont coexisté en production sans qu'aucune ne déclenche
d'erreur. Elles ne se voyaient qu'en regardant la sortie servie.

**Le sitemap entier était invalide.** La variable `NEXT_PUBLIC_SITE_URL`
contenait un saut de ligne final. Le constructeur `URL` l'ignore — les balises
`canonical` restaient donc correctes — mais `sitemap.ts` et `robots.ts`
assemblent leurs adresses par concaténation de chaînes. Les trente-deux
`<loc>` valaient `https://klassci.com\n/fr`, et la directive `Sitemap:` du
robots.txt était coupée en deux.

→ **Règle.** L'adresse du site se lit **uniquement** via `lib/site-url.ts`,
qui nettoie et valide. `scripts/verifier-seo.mjs` refuse toute lecture directe
de la variable ailleurs.

**Les vingt-quatre pages de documentation se déclaraient doublons de
l'accueil.** Leur `generateMetadata` ne posait ni canonical ni alternates ;
Next fusionnait alors avec le layout parent, dont le canonical vaut `/{locale}`.

→ **Règle.** Toute route rendue pose son propre canonical. Le vérificateur
échoue si une page rendue n'a ni `generateMetadata` ni `metadata`.

**`page.url` de fumadocs porte déjà le préfixe de langue.** Le préfixer une
seconde fois donnait `/fr/fr/docs/...`. Et `getPages()` sans argument ne
renvoie que la langue par défaut : les douze pages anglaises n'étaient jamais
déclarées.

→ **Règle.** Parcourir `source.getPages(locale)` par langue, et utiliser
`page.url` tel quel.

**`robots.txt` fermait au crawl la meilleure page du site.** Le motif
`/*/inscription` est un préfixe au sens de la spécification : il interdisait
aussi `/docs/secretaire/inscriptions`, quatre mille mots, dans les deux
langues.

→ **Règle.** Tout motif `Disallow` est ancré par `$` ou suivi d'une barre
oblique.

## L'état 2026 des données structurées

Vérifié sur la documentation Google, septembre 2026.

| Type | Statut | Décision |
|---|---|---|
| `BreadcrumbList` | Résultat enrichi vivant | À poser partout où une hiérarchie existe |
| `Organization` | Pas de résultat enrichi, mais compréhension d'entité et panneau de connaissance | Le nœud le plus rentable |
| `WebSite` | Structure du graphe | Sans `potentialAction` : la sitelinks searchbox est abandonnée depuis novembre 2024 |
| `FAQPage` | **Mort.** Restreint en 2023, affichage arrêté en mai 2026, documentation retirée en juin 2026 | Émis quand même, pour les moteurs de réponse — **et seulement sur une page qui affiche la FAQ** |
| `SoftwareApplication` | Exige `aggregateRating` ou `review` pour l'affichage enrichi | Émis sans note : voir la règle des avis |
| `Article` / `TechArticle` | Compréhension, aucune propriété obligatoire | Sur la documentation et le blog |
| `HowTo` | Déprécié en septembre 2023 | Ne rien écrire |
| `Course` | « Course info » supprimé en septembre 2025 | Sans objet : KLASSCI vend un logiciel, pas des cours |
| `VideoObject` | Vivant, mais exige `thumbnailUrl` et `uploadDate` | Reporté : ni vignette, ni date, et la `<source>` est injectée en JavaScript |
| `LocalBusiness` | Réservé aux commerces avec point de vente | Ne pas utiliser |

### Les trois interdits

1. **Aucun `aggregateRating`, aucun `review`.** Google exclut du résultat
   « étoiles » toute organisation qui contrôle les avis publiés sur elle-même.
   Les témoignages du site sont recueillis et publiés par KLASSCI. Une note
   fabriquée expose à une action manuelle qui retire la page de **tous** les
   résultats enrichis — le fil d'Ariane compris. Renoncer aux étoiles qu'on
   n'a pas le droit d'avoir, c'est garder celui qu'on peut avoir.

2. **Aucun prix qui ne figure pas sur la page.** L'ancien balisage annonçait
   `price: "0"` en XOF à trois centimètres d'un texte disant « 4,8 M FCFA /
   an ». Un prix promotionnel exige `priceValidUntil` — sans date de fin, la
   promotion se périme en silence et le balisage devient faux tout seul.

3. **Aucun `new Date()` dans `dateModified`.** Chaque déploiement déclarerait
   toutes les pages modifiées le jour même. Google recoupe ces dates avec ce
   qu'il voit du contenu : une page qui se dit fraîche sans jamais changer
   perd la confiance accordée à sa date, et les pages qui bougent vraiment la
   perdent avec elle.

## hreflang

- Le préfixe de langue est systématique (`localePrefix: "always"`). Toute
  adresse de page en porte un.
- `alternateLinks: false` dans `i18n/routing.ts` : next-intl posait un en-tête
  HTTP `Link` dont le x-default visait une adresse en 307, quand le HTML en
  visait une en 200. Deux annotations contradictoires font écarter la grappe
  entière. **Le HTML fait foi, et lui seul.**
- `fr`, jamais `fr-CI` : un code régional amputerait le Sénégal, le Bénin, le
  Burkina et le Togo.
- `x-default` vise le français : c'est la langue du marché principal.
- **Une page publiée dans une seule langue ne déclare pas d'alternate dans
  l'autre.** Le blog est français : `buildUniverseMetadata` reçoit
  `languesDisponibles: ["fr"]`, et la route répond 404 sous `/en`. Un hreflang
  vers une page absente casse la réciprocité, et une grappe dont un maillon ne
  répond pas est ignorée en entier.

## Le budget de performance

Les visiteurs sont en Afrique de l'Ouest, sur 4G instable et téléphones
d'entrée de gamme. Chaque kilo-octet se paie deux fois : en secondes et en
forfait.

| Mesure | Budget |
|---|---|
| Paquet de premier chargement | ≤ 150 ko |
| Polices préchargées | ≤ 6 fichiers, ≤ 110 ko |
| Balises `<img>` brutes hors documentation | **0** |
| Images au-dessus de la ligne de flottaison | ≤ 100 ko |

Trois pièges déjà rencontrés :

- une balise `<img>` contourne l'optimiseur : dix d'entre elles pesaient 8 Mo
  sur trois pages, pour 534 ko une fois passées par le pipeline AVIF déjà
  configuré ;
- une `<Image>` sans `sizes` fait choisir la variante 2048 pixels à un
  téléphone en DPR 2 ;
- `priority` sur le logo pose un préchargement en concurrence avec la vraie
  image LCP.

## Ce qui marche pour être cité par un moteur de réponse

Le guide officiel de Google de mai 2026 déclare inutiles `llms.txt`, le
découpage en fragments, un balisage spécial et l'écriture « pour l'IA ». Ce
qui reste mesuré (étude Princeton, KDD 2024) :

- des **statistiques attribuées à une source nommée** ;
- des **citations exactes** ;
- une **réponse directe en tête de section**.

D'où la forme retenue pour le blog : des `<h2>` formulés comme de vraies
questions, une réponse en une ou deux phrases dès l'ouverture de la section,
puis le développement. Et un bloc `sources` en frontmatter, qui devient une
propriété `citation` dans le balisage.

## Les deux vérificateurs

```bash
node scripts/verifier-seo.mjs                      # le dépôt, hors ligne
node scripts/verifier-seo.mjs --url https://www.klassci.com   # la production
pnpm build && node scripts/verifier-donnees-structurees.mjs   # les pages construites
```

Le premier refuse : une route sans canonical, une lecture directe de
`NEXT_PUBLIC_SITE_URL`, un prix à zéro dans un JSON-LD, une image sans `alt`.
Le second relit chaque graphe construit et vérifie les références `@id`, les
prix, la langue, l'absence d'avis auto-décernés.

## Le point à trancher côté hébergement

Le site répond 200 sur `www.klassci.com` ; l'apex renvoie un **307
temporaire** vers www. Tous les canoniques doivent viser l'hôte qui répond
200, et la redirection doit être **permanente (308)**. À régler dans la
configuration de domaine Vercel, et à refléter dans
`NEXT_PUBLIC_SITE_URL` — **sans espace ni saut de ligne**.
