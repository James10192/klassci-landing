# 08 · Mapping avant / après

Une ligne par identifiant de l'inventaire. Statuts autorisés :

- **PRESERVED** — même contenu, même route ; seule la présentation change.
- **IMPROVED** — même information, mieux dite ou mieux montrée ; le nouveau
  texte est déclaré dans `mapping.json` au moment de l'implémentation.
- **MOVED** — même information, ailleurs (autre section ou autre route) ;
  la destination est déclarée dans `mapping.json`.

`DELETED` n'existe pas. Le contrôle `scripts/verifier-parite-contenu.mjs` refuse
toute disparition qui n'est pas déclarée ici **et** dans `mapping.json`, et
refuse une déclaration sans le nouveau texte.

Total : **97 éléments** inventoriés — 0 supprimé.

## Transverse

| ID | Avant | Après | Statut |
|---|---|---|---|
| G-01 | Nav du hub (7 liens + menu entreprise + Contact) | Nav globale unique : tous les liens repris dans Produits / Ressources / L'entreprise, S'inscrire, bouton Démo | IMPROVED |
| G-02 | Nav Université (ancres Fonctionnalités, Tarifs, FAQ, Contact) | Ancres reprises dans la sous-navigation collante de `/universite` ; Tarifs aussi dans le menu Tarifs | MOVED |
| G-03 | Nav Collège (Fonctionnalités, Interfaces, Devis, Docs) | Sous-navigation collante de `/college` + menus globaux | MOVED |
| G-04 | Pied de page 4 colonnes | Mêmes colonnes et liens ; accroche élargie à tous les cycles | IMPROVED |
| G-05 | Thème clair / sombre | Conservé, les deux thèmes redessinés | PRESERVED |
| G-06 | Sélecteur FR/EN | Conservé | PRESERVED |
| G-07 | 404 | Même texte, accents rétablis, + recherche docs | IMPROVED |
| G-08 | Fenêtre Contact du hub | Même formulaire, en section « Démo » de l'accueil et en fenêtre depuis la nav | IMPROVED |
| G-09 | JSON-LD par page | Identique ; contrôlé par `verifier:schema` à chaque lot | PRESERVED |
| G-10 | Images de partage | Regénérées dans la nouvelle direction, mêmes routes | IMPROVED |
| G-11 | PostHog, Vercel Analytics, Speed Insights | Conservés + événements ajoutés (choix d'univers, onglet de rôle, comparateur) | IMPROVED |

## Accueil

| ID | Après | Statut |
|---|---|---|
| HOME-01 | Hero : une phrase de catégorie ajoutée au-dessus du H1 inchangé ; « Voir les univers » remplacé par deux boutons d'univers directs (même destination `#univers` conservée comme ancre) ; « S'inscrire » devient un lien « Je suis candidat » ; composition produit reprise avec ses trois étiquettes ; logo affiché une seule fois | IMPROVED |
| HOME-02 | Grille fixe au lieu d'un défilé tronqué ; note explicative mot pour mot | IMPROVED |
| HOME-03 | Titre et intro du sélecteur conservés, posés au-dessus des portes | PRESERVED |
| HOME-04 | Porte Université : tous les textes ; capture nette au lieu de voilée | IMPROVED |
| HOME-05 | Porte Collège : idem | IMPROVED |
| HOME-06 | Devient la 3ᵉ porte, à égalité | IMPROVED |
| HOME-07 | Pied de page | PRESERVED |
| HOME-S1 | Textes de la porte LMS enfin affichés (tag, description, « Être informé ») | IMPROVED |

## Université

| ID | Après | Statut |
|---|---|---|
| UNI-01 | H1 conservé en couleur unie (le dégradé disparaît, pas le texte) ; chapô conservé ; « Essayer gratuitement » → « Demander une démo » en principal, l'essai d'un mois restant offert dans les tarifs et la FAQ ; défilé des 9 captures conservé | IMPROVED |
| UNI-02 | = HOME-02 | IMPROVED |
| UNI-03 | Piliers, textes conservés | PRESERVED |
| UNI-04 | Intro des fonctionnalités, en tête du « cycle d'une année » | PRESERVED |
| UNI-05 → UNI-11 | Chaque fonctionnalité devient une station du cycle ; description, image et **intégralité** de la modale conservées (puces visibles, modale toujours accessible) ; lien docs ajouté ; capture LMD remplacée par une capture remplie | IMPROVED |
| UNI-12 | 3 fonctionnalités secondaires | PRESERVED |
| UNI-13 | Témoignages avec **leur** titre ; textes inchangés ; mise en avant subordonnée à la confirmation des témoins | IMPROVED |
| UNI-14 | Bannière Partenaire reconstruite en HTML : « 0 FCFA », « Devenez partenaire, payez presque 0 FCFA », message corrigé (« Ne perdez pas de temps : rejoignez notre communauté et bénéficiez de nombreux avantages »), vrai bouton « Rejoindre dès maintenant » | IMPROVED |
| UNI-15 | Vidéo avec affiche et transcription | IMPROVED |
| UNI-16 | Dans le bloc Confiance unifié, formulation alignée sur `/securite` | IMPROVED |
| UNI-17 | Impact ODD, 9 objectifs | PRESERVED |
| UNI-S1 | Section accessibilité détaillée affichée, chiffres signalés comme ceux d'une instance de démonstration | IMPROVED |
| UNI-18 | Support dans le bloc Confiance, engagement aligné sur les formules (P0-1) | IMPROVED |
| UNI-19 | Photo réutilisée en fond du bloc Démonstration | MOVED |
| UNI-20 | Déploiement 4 étapes + 3 garanties, dans le bloc Confiance | MOVED |
| UNI-21 | Élite dans une grille à trois formules, recommandée ; tous les montants et piliers conservés | IMPROVED |
| UNI-22 | Inclus partout | PRESERVED |
| UNI-23 | Comparaison dépliée par défaut sur bureau, sélecteur à deux colonnes sur mobile | IMPROVED |
| UNI-24 | Partenaire (nom distinct, P0-6) et note de bas de tarifs | IMPROVED |
| UNI-25 | FAQ, 6 questions | PRESERVED |
| UNI-26 | Formulaire de démonstration, mêmes champs | PRESERVED |
| UNI-27 | Mot de l'équipe | PRESERVED |
| UNI-28 | Pied de page | PRESERVED |

## Collège

| ID | Après | Statut |
|---|---|---|
| COL-01 | Offre de lancement en bandeau sous la nav (mêmes textes) | MOVED |
| COL-02 | Hero, textes conservés | PRESERVED |
| COL-03 | Bande d'interfaces | PRESERVED |
| COL-04 | Rôles : sélecteur sur une même fiche, textes conservés | IMPROVED |
| COL-05 | Modules : liste compacte + « une journée au collège » qui les met en scène | IMPROVED |
| COL-06 | Interfaces : 5 captures remplies, légendes conservées | IMPROVED |
| COL-07 | Calculateur : mêmes champs et résultats, hypothèses affichées, résultat visible sans JavaScript | IMPROVED |
| COL-08 | Élite, sans bordure latérale | IMPROVED |
| COL-09 | Inclus, PRO, Essentielle, comparaison, prix par élève | IMPROVED |
| COL-10 | Partenaire (nom distinct) et note | IMPROVED |
| COL-11 | Déploiement et paiement échelonné | IMPROVED |
| COL-12 | Impact ODD | PRESERVED |
| COL-13 | Pied de page | PRESERVED |
| COL-14 | Modale de devis, mêmes champs | PRESERVED |

## Classe virtuelle

| ID | Après | Statut |
|---|---|---|
| LMS-01 | Hero conservé, statut précisé | IMPROVED |
| LMS-02 | Trois capacités | PRESERVED |
| LMS-03 | Lien docs | PRESERVED |
| LMS-04 | Pied de page | PRESERVED |

## Blog, documentation, institutionnel, portails

| ID | Après | Statut |
|---|---|---|
| BLOG-00 | Index avec article à la une et filtres | IMPROVED |
| BLOG-01 → 07 | Texte intégral inchangé ; gabarit : sommaire, sources en notes, auteur, articles liés | PRESERVED (contenu) / IMPROVED (gabarit) |
| DOCS-00 → 11 | MDX inchangé | PRESERVED |
| DOCS-G | Chrome de documentation : filtres rôle / module, captures agrandissables, lien vers la page produit, accents rétablis | IMPROVED |
| INST-01 → 04 | MDX inchangé, gabarit unifié | PRESERVED |
| PORT-01 → 06 | Parcours et chaînes inchangés ; composants de formulaire, étapes et états améliorés ; identité de l'école conservée | IMPROVED |

## `mapping.json`

Le fichier machine est créé vide au lot 0 et rempli **par chaque PR** qui
modifie un texte affiché :

```json
{
  "entrees": [
    {
      "id": "UNI-14",
      "statut": "IMPROVED",
      "ancien": "Ne perdez pas le temps appartenez à notre communauté et bénéficier de nombreux avantages.",
      "nouveau": "Ne perdez pas de temps : rejoignez notre communauté et bénéficiez de nombreux avantages.",
      "route": "/fr/universite"
    }
  ]
}
```

(L'exemple ci-dessus ne s'applique pas tel quel : ce texte est aujourd'hui dans
une image, pas dans le DOM. Il illustre la forme.)
