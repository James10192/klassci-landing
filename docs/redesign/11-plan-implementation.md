# 11 · Plan d'implémentation

**Aucune ligne de la refonte n'est écrite avant validation de la phase 1**
(direction, typographie, cinq décisions de contenu de `05` § 6).

Chaque lot est une PR distincte, basée sur la branche de développement du dépôt,
petite assez pour être relue. Chaque PR passe la même porte :

```bash
pnpm verifier                                   # tsc, contrôles maison, build, schéma, budget
node scripts/verifier-parite-contenu.mjs --url http://127.0.0.1:3100   # 0 disparition
node scripts/verifier-accessibilite.mjs --url http://127.0.0.1:3100    # axe WCAG A/AA
# + captures avant/après aux 5 largeurs, FR et EN, clair et sombre
```

Une PR qui fait échouer la parité est bloquée, quelle que soit sa qualité
visuelle. Une reformulation se déclare dans `docs/redesign/mapping.json`.

## Lot 0 — Fondations de contrôle (cette phase)

- `scripts/verifier-parite-contenu.mjs` + référence `docs/redesign/inventaire/`
  (photographiée sur la production le 1ᵉʳ octobre 2026).
- Dossier `docs/redesign/` (inventaire, audit, AI, directions, wireframes,
  mapping, design system, mouvement, plan).
- **Aucun changement visible.**

## Lot 1 — Fondations visuelles, navigation, pied de page

- Tokens de couleur (clair + sombre), polices via `next/font`, échelle, grille.
- Nav globale unique (remplace `nav.tsx`, `site-nav.tsx` et la nav Collège en
  reprenant tous leurs liens), tiroir mobile, sous-navigation collante.
- Pied de page (accroche multi-cycle).
- Correction du contraste orange (fin de l'exception axe).
- Correctifs de confiance qui ne dépendent d'aucune décision : titre des
  témoignages (P0-3), accents de la 404 et de la doc (P3-3).

## Lot 2 — Accueil

Hero avec catégorie nommée, portes d'univers (Classe virtuelle à égalité),
grille des établissements, section flux, sélecteur de rôle, confiance,
ressources, démonstration. Nouvelles captures remplies (accueil uniquement).

## Lot 3 — Université

Cycle d'une année (stations = fonctionnalités, modales conservées), accessibilité
détaillée, bloc confiance unifié (support aligné, P0-1), bannière Partenaire en
HTML, tarifs en trois colonnes avec comparaison dépliée, liens vers la doc.

## Lot 4 — Collège

Bandeau d'offre, journée au collège, sélecteur de rôle, modules compacts,
captures remplies, calculateur visible sans JavaScript avec hypothèses, tarifs
(nom de Formule Partenaire distinct, P0-6).

## Lot 5 — Classe virtuelle

Statut exact (P0-2 tranché), ce qui existe / ce qui arrive, branchement SIS.

## Lot 6 — Documentation et blog

Chrome fumadocs aux couleurs du système, filtres rôle / module, captures
agrandissables, liens retour vers les pages produit ; blog : article à la une,
sommaire, sources en notes, auteur, articles liés.

## Lot 7 — Portails et formulaires

Composants de formulaire, étapes, états (erreur, pièce manquante, rendez-vous,
succès) ; tests de bout en bout des parcours d'inscription, de rendez-vous, de
réinscription et de vérification, à 390 px d'abord. L'identité de chaque école
reste la sienne.

## Lot 8 — Mouvement, performance, accessibilité

Séquences de `10-mouvement.md`, budget (`verifier:budget`), Web Vitals (LCP
< 2,5 s, CLS ≈ 0, INP < 200 ms mesurés sur Vercel Speed Insights), audit axe
complet, captures finales aux 5 largeurs.

## Ordre et dépendances

```
Lot 0 ─► Lot 1 ─┬─► Lot 2 ─┐
                ├─► Lot 3 ─┤
                ├─► Lot 4 ─┼─► Lot 8
                ├─► Lot 5 ─┤
                ├─► Lot 6 ─┤
                └─► Lot 7 ─┘
```

Les lots 2 à 7 sont indépendants une fois le lot 1 fusionné.

## Définition de « terminé » (reprise du brief, vérifiable)

| Critère | Comment on le prouve |
|---|---|
| Toutes les routes et sections inventoriées | `02-inventaire-contenu.md` + `inventaire/reference` |
| 0 section supprimée involontairement | `verifier-parite-contenu.mjs` à 0 |
| Mapping avant/après pour chaque élément | `08-mapping-avant-apres.md` + `mapping.json` |
| Hub multi-univers, Université, Collège, LMS, docs, blog, tarifs, établissements, inscriptions complets | parité + captures |
| Formulaires fonctionnels | tests de bout en bout du lot 7 + envoi réel en préproduction |
| FR / EN | parité sur les deux langues |
| SEO non cassé | `verifier:seo:prod` 13/13, `verifier:schema`, mêmes canoniques |
| Bureau / mobile | captures 1440, 1280, 1024, 768, 390 |
| Accessibilité | axe sans infraction, sans exception |
| Performance | Speed Insights au percentile 75 |
| Interfaces produit réelles | aucune capture d'état vide |
| Marque reconnaissable, pas un modèle SaaS | relecture de la direction par l'équipe |

## Risques

| Risque | Parade |
|---|---|
| Une reformulation fait disparaître une information | Parité bloquante + `mapping.json` exigeant le nouveau texte |
| Les captures « remplies » montrent des données réelles d'élèves | Instance de démonstration dédiée, données fictives annoncées comme telles |
| Le flux animé coûte cher sur téléphone d'entrée de gamme | Version statique par défaut, animation en amélioration, désactivée en mouvement réduit et sous 2 Go |
| Changement de police = régression de LCP | Sous-ensembles, ≤ 5 fichiers, `display: swap`, mesure au lot 1 |
| Décisions de contenu non tranchées (support, LMS, Partenaire) | Lot 1 ne les touche pas ; lots 3 à 5 les attendent |
