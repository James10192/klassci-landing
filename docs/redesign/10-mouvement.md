# 10 · Direction du mouvement

Le mouvement n'est là que pour **montrer comment le produit fonctionne**. Il ne
simule jamais un résultat : aucune note, aucun montant, aucun compteur ne
« s'anime » vers une valeur qui n'existe pas.

## Principes

1. **Un seul moment orchestré par page**, le reste immobile.
   - Accueil : la donnée ◎ qui avance de station en station.
   - Université : le cycle d'une année (station active).
   - Collège : la journée (créneau actif) et le sélecteur de rôle.
   - Tarifs, FAQ, docs, blog, portails : pas d'animation d'entrée.
2. **Visible par défaut.** Tout contenu est lisible dans le HTML rendu côté
   serveur ; l'animation part d'un état visible. Aucun bloc ne naît à
   `opacity: 0` en attendant le JavaScript (défaut constaté sur le calculateur).
3. **Courbes et durées** : sortie exponentielle `cubic-bezier(0.16, 1, 0.3, 1)` ;
   120 ms (retour d'interaction), 240 ms (changement d'onglet, ouverture),
   600 ms (une étape du flux). Ni rebond, ni ressort.
4. **Propriétés animées** : `transform`, `opacity`, `clip-path`. Jamais de
   propriétés de mise en page.
5. **Mouvement réduit** : le flux est dessiné entier, toutes les stations
   visibles ; les transitions deviennent des fondus de 120 ms ou rien.
6. **Coût** : CSS d'abord (`animation-timeline: view()` là où il est pris en
   charge, avec repli statique), JavaScript minimal. `framer-motion` est déjà
   chargé (`LazyMotion + domMax`) : on le garde pour les onglets et dialogues,
   on n'en ajoute pas d'autre. Aucune bibliothèque de défilement doux.
7. **Pause et contrôle** : tout défilé automatique (captures du hero) a un
   bouton pause et s'arrête au survol, au focus et en mouvement réduit ; sur
   téléphone il ne défile pas tout seul.

## Séquences prévues

| Où | Déclencheur | Ce qui bouge | Durée |
|---|---|---|---|
| Accueil, flux | Défilement (la station entre au tiers de l'écran) | La pastille ◎ glisse le long du trait ; la capture de la station passe de grisée à pleine | 600 ms |
| Sélecteur de rôle | Clic / flèches | La fiche reste ; les blocs non pertinents pour le rôle s'estompent, ceux du rôle se révèlent | 240 ms |
| Journée au collège | Défilement | Une aiguille avance sur la réglette horaire, le créneau courant s'allume | 600 ms |
| Document (direction A et emprunt B) | Entrée à l'écran, une fois | Les lignes du bulletin apparaissent dans l'ordre : matière, note, moyenne, rang, mention — **valeurs de la capture réelle** | 600 ms |
| Paiement | Entrée à l'écran, une fois | Le statut d'un reçu passe de « En attente » à « Payé » (état réel de l'application) | 240 ms |
| Comparateur de tarifs | Changement de formule | Les cellules qui diffèrent se surlignent brièvement | 240 ms |
| Boutons, liens | Survol / pression | Teinte, soulignement | 120 ms |

## Garde-fous de performance

- Aucune animation pendant le chargement initial (LCP intact).
- Pas de vidéo en lecture automatique ; la vidéo témoignage garde son affiche et
  ne charge rien avant le clic.
- Les animations liées au défilement sont désactivées sous 2 Go de mémoire
  annoncée (`navigator.deviceMemory`) quand l'information est disponible.
