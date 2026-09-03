---
name: seo
description: Fait tourner un cycle SEO complet sur klassci-landing — veille, audit technique, performance, données structurées, publication d'un article du plan éditorial. Utiliser quand on demande « un point SEO », « publier le prochain article », « vérifier le SEO avant mise en ligne », ou un contrôle périodique.
---

# Le cycle SEO de KLASSCI

Ce dépôt a cinq agents spécialisés dans `.claude/agents/`. Cette compétence dit
lequel appeler, dans quel ordre, et ce qu'on fait de ce qu'il rapporte.

## D'abord, lire l'état

Deux fichiers portent la mémoire du chantier. Lis-les avant de décider quoi
que ce soit.

- `docs/seo/regles.md` — ce qui a été établi et vérifié : les pannes déjà
  rencontrées et leur cause, l'état 2026 des types schema.org, les règles
  hreflang, le budget de performance. **Ne redécouvre pas ce qui y est écrit.**
- `docs/seo/plan-editorial.md` — les trente pièces du corpus, leur état, et le
  calendrier calé sur l'année scolaire ivoirienne.

## Le cycle

Cinq étapes. Elles ne se font pas toutes à chaque fois : l'étape 0 dit
lesquelles.

### 0. Mesurer avant de bouger

```bash
node scripts/verifier-seo.mjs
pnpm build && node scripts/verifier-donnees-structurees.mjs
node scripts/verifier-seo.mjs --url https://www.klassci.com
```

Une anomalie bloquante se corrige **avant** toute autre chose. Une régression
technique annule le bénéfice de dix articles.

### 1. Veille — mensuel

`seo-veille` regarde ce que publient les concurrents, qui sort sur les
requêtes cibles, et si les règles des moteurs ont changé. Son rapport peut
modifier l'ordre du plan éditorial : un sujet qu'un concurrent vient
d'occuper devient plus difficile, un sujet qu'il vient d'abandonner devient
une occasion.

### 2. Audit technique — avant chaque mise en ligne notable

`seo-technique` relit la sortie réelle, pas le code. C'est la leçon de
septembre 2026 : les quatre pannes qui rendaient le site invisible étaient
toutes invisibles en lecture de code.

### 3. Performance — après tout ajout de dépendance ou de page

`seo-performance` fait respecter le budget. Un dépassement se traite tout de
suite : le poids ne se retire jamais tout seul.

### 4. Publication — le cœur du cycle

`seo-redacteur` prend la première ligne non cochée du plan, dans l'ordre de
priorité, et écrit l'article. **Un agent, un article, un fichier.** Plusieurs
agents rédacteurs peuvent travailler en parallèle si chacun a son slug.

Ensuite, et c'est toi qui le fais, pas l'agent :

1. Lire le compte rendu, en particulier **ce qu'il n'a pas pu vérifier**.
2. Relire les passages sensibles : affirmations réglementaires, chiffres,
   propos sur un concurrent, tout ce qui est défavorable à KLASSCI.
3. Chercher les `{/* DONNEE-TERRAIN: … */}` et les signaler à l'humain — ce
   sont les seuls endroits qu'un agent ne peut pas remplir.
4. `pnpm build`, puis les deux vérificateurs.
5. Cocher la ligne dans `docs/seo/plan-editorial.md`.
6. Committer.

### 5. Données structurées — quand le balisage doit suivre

`seo-donnees-structurees` intervient pour une page d'un type nouveau, un
changement de prix, ou une évolution des règles de Google.

## Ce qui ne se délègue jamais

- **La relecture de ce qui est défavorable à KLASSCI.** Le guide d'achat
  conclut que la formule Partenaire est l'option la plus chère à effectif
  égal. C'est ce qui le rend citable, et c'est exactement pour cela qu'un
  humain doit le lire avant publication.
- **Les données terrain.** Un agent n'a pas accès aux établissements en
  production. Il laisse un marqueur ; un humain le remplit ou le retire.
- **Les faits juridiques et d'entreprise.** Immatriculation, adresse,
  hébergeur, dirigeant : aucun agent ne les invente.

## Ce qu'on ne fait pas

- Publier un article qui n'a ni donnée propre, ni texte cité, ni modèle
  téléchargeable. C'est un article qu'un concurrent refait en une journée.
- Traduire automatiquement le corpus réglementaire. Un article ivoirien mal
  traduit dessert l'autorité qu'il construit. Le blog est français, et le code
  le sait — pas d'alternate anglais, 404 sous `/en`.
- Fabriquer une note ou un avis pour obtenir des étoiles. Voir les trois
  interdits de `docs/seo/regles.md`.

## Après publication

Le retour n'est pas immédiat : sur un contenu réglementaire, l'indexation et
la maturation se comptent en semaines. Ce qu'on regarde à J+7 puis à J+30, dans
la Search Console :

- les pages nouvellement indexées, et les éventuelles exclusions ;
- le rapport « Fils d'Ariane », dans Améliorations ;
- les requêtes sur lesquelles une page apparaît sans être cliquée — le titre ou
  la description sont alors à revoir, pas le contenu.
