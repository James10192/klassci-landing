# 06 · Trois directions artistiques

Les trois directions gardent **strictement** l'identité : bleu KLASSCI
`#0453CB`, orange KLASSCI `#F58220`, fond `#F6F4F0`, logo officiel. Elles
diffèrent par ce qui structure la page (le document, le flux, le temps), par la
typographie, par la stratégie de couleur et par le mouvement.

Les maquettes (hero bureau, hero mobile, accueil, université, collège, tarifs,
documentation) sont sur le canevas de design lié dans `00-README.md`. Elles
utilisent **les vraies captures du produit** déjà publiées sur le site.

## Contrainte commune : ce que l'identité impose

### Le contraste de l'orange

Mesuré (WCAG 2.1, luminance relative) :

| Couple | Rapport | Verdict |
|---|---|---|
| Blanc sur orange `#F58220` | 2,59:1 | Échec AA, même en grand texte (bouton actuel de l'accueil) |
| Bleu nuit `#0B1B33` sur orange `#F58220` | ≈ 6,6:1 | AA, y compris petit texte |
| Blanc sur bleu `#0453CB` | ≈ 6,8:1 | AA |
| Orange `#F58220` en texte sur `#F6F4F0` | ≈ 2,3:1 | Échec |
| Orange encre `#A84F00` en texte sur `#F6F4F0` | ≈ 5,0:1 | AA |
| Orange `#F58220` sur bleu `#0453CB` | 2,61:1 | Échec, même pour un élément graphique (seuil 3:1) |
| Orange `#F58220` sur bleu profond `#0A2E6B` | 5,0:1 | AA |

Rapports calculés par la formule de luminance relative WCAG 2.1, pas estimés.

Conséquences, valables pour les trois directions :

- **Action principale = bleu**, texte blanc.
- **L'orange ne porte jamais de texte blanc.** Quand il fait fond (pastille,
  marqueur, bouton secondaire d'accent), le texte est bleu nuit.
- **L'orange n'est jamais une couleur de texte courant** ; une variante
  « orange encre » `#A84F00` sert aux mots soulignés et aux liens d'accent.
- **L'orange ne se pose pas sur le bleu KLASSCI** (2,61:1). Les bandes bleues
  qui portent un marqueur orange utilisent le bleu profond `#0A2E6B`, ou le
  marqueur reçoit un liseré blanc.
- L'exception inscrite dans `verifier-accessibilite.mjs` disparaît au lot 1.

### Ce que les trois directions refusent

Dégradé dans le texte, bordures latérales colorées, bandeau de repères
numérotés au-dessus de chaque section, grilles de cartes identiques, photos
d'illustration générées, « verre dépoli » décoratif, 3D, défilement horizontal
dans le parcours d'achat, compteurs animés, chiffres non sourcés. Et le registre
« éditorial » par réflexe (serif léger + petites capitales mono + filets), qui
est celui du site actuel et celui de la plupart des sites générés en 2026.

### Typographie : sortir d'IBM Plex

Le site utilise IBM Plex Serif, Sans et Mono. C'est une famille saine, mais
devenue un marqueur de site généré, et elle ne dit rien de l'école. Les trois
directions proposent un remplacement, toutes servies par Google Fonts, donc
auto-hébergeables par `next/font` sans requête externe.

**Une piste écartée après rendu.** Atkinson Hyperlegible Next (Braille
Institute, dessinée pour la basse vision) était la première candidate pour le
texte courant. Le rendu l'a éliminée : son zéro est barré, sans forme
alternative dans la version Google Fonts. « 2023 » devient « 2Ø23 » et
« 1 205 000 F » devient « 1 2Ø5 ØØØ F » : dans une page qui parle d'argent en
FCFA, c'est rédhibitoire. Le texte courant est donc composé dans une famille au
zéro ordinaire.

---

## A · Le Registre (« Institutional OS »)

**Idée** : KLASSCI est l'institution qui tient le registre. La page se compose
comme les documents officiels que le logiciel produit : bulletin, relevé LMD,
reçu de caisse, procès-verbal de délibération. Le site *montre ces documents*
et adopte leur rigueur : réglure, colonnes, cotes, visas.

- **Phrase de scène** : une directrice des études, dans son bureau à Abidjan en
  fin d'après-midi, compare deux logiciels sur un ordinateur portable, un
  bulletin papier à côté du clavier.
- **Références** : le bulletin trimestriel ivoirien et le relevé de notes LMD ;
  les rapports annuels de banques centrales africaines (BCEAO) ; la signalétique
  administrative suisse (rigueur de grille, pas de décor).
- **Couleur** : *Restrained*. Fond `#F6F4F0`, encre bleu nuit, le bleu KLASSCI
  pour la structure (filets, en-têtes de colonne), l'orange en marqueur unique
  (le tampon « Validé », la ligne sélectionnée).
- **Typographie** : Spectral (titres, dessinée pour l'écran, sérieuse sans
  apprêt) + Public Sans (texte, dessinée pour l'administration publique,
  neutre et très lisible) + JetBrains Mono (codes UE, matricules).
- **Motif** : la réglure du registre — grille de 12 colonnes rendue visible
  en filets fins, numéros de ligne en marge, « visas » (petits tampons)
  pour les preuves.
- **Mouvement** : quasi nul. Un document se « remplit » ligne à ligne quand il
  entre à l'écran (note, moyenne, rang, mention), une fois, en 600 ms.
- **Risque** : c'est la direction la plus proche du site actuel. Bien exécutée,
  elle inspire une confiance immédiate ; mal exécutée, elle redevient le
  registre éditorial générique qu'on cherche à quitter.

## B · Une seule donnée (« One Data Flow ») — **recommandée**

**Idée** : la promesse « de l'inscription à la décision, une seule donnée
circule » devient la mise en page elle-même. Un dossier d'élève (un matricule,
une pastille orange) traverse la page de station en station — demande, dossier,
paiement, classe, cours, présence, évaluation, note, bulletin, décision — et à
chaque station on voit le vrai écran où cette donnée vit.

- **Phrase de scène** : un fondateur de groupe scolaire, sur son téléphone entre
  deux rendez-vous à Yamoussoukro, en 4G instable, qui doit comprendre en une
  minute pourquoi il changerait de logiciel.
- **Références** : les plans de lignes de transport (une ligne, des stations
  nommées, une correspondance) ; le parcours d'un colis suivi (statuts horodatés) ;
  la fiche de suivi d'un dossier administratif.
- **Couleur** : *Committed*. Le bleu KLASSCI porte 30 à 40 % de la surface : il
  est « le système » (bandes pleines où circule la donnée). Le fond `#F6F4F0`
  porte les documents. L'orange est réservé à **la donnée qui circule** —
  pastille, trait, matricule — et à rien d'autre. Quand on voit de l'orange,
  c'est la donnée de l'élève.
- **Typographie** : Schibsted Grotesk **seule**, des titres au texte courant
  (une grotesque née dans la presse quotidienne, institutionnelle sans être
  froide, de 400 à 800 ; le contraste vient des graisses, pas d'un second
  dessin) + JetBrains Mono, réservé aux identifiants (matricule `DEM090036`,
  codes UE `UE-GC-501`).
- **Motif** : la ligne. Un trait continu relie les stations ; sur bureau il
  serpente entre deux colonnes, sur mobile il descend verticalement le long du
  bord gauche (aucun défilement horizontal).
- **Mouvement** : le seul mouvement important du site. Au défilement, la
  pastille avance de station en station et l'écran de la station s'allume ; les
  autres sections restent immobiles. Avec mouvement réduit : la ligne est
  dessinée entière, toutes les stations sont visibles.
- **Pourquoi elle est recommandée** :
  1. Elle **dit le positionnement** (« Education Operations Platform ») au lieu
     de l'affirmer ; aucun concurrent relevé ne raconte son produit comme un
     flux, tous listent des modules.
  2. Elle **reclasse le contenu existant sans en retirer** : les 7 grandes
     fonctionnalités Université et les 8 modules Collège deviennent des stations.
  3. Elle sert le mobile : une ligne verticale, des écrans un par un.
  4. Elle donne au bleu une raison d'être massif, ce qui rend la marque
     reconnaissable de loin.

## C · L'école en mouvement (« The School in Motion »)

**Idée** : une école est une journée. La page suit l'horloge d'un établissement,
de 7 h (l'appel) à 18 h (le parent reçoit le bulletin), et chaque heure montre
quel rôle agit, sur quel écran. La structure est celle d'un **emploi du temps** :
heures en colonnes, rôles en lignes.

- **Phrase de scène** : un proviseur de lycée privé, le soir, qui revit sa
  journée : la caisse saturée à 10 h, les notes en retard à 15 h, le parent qui
  appelle à 17 h.
- **Références** : l'emploi du temps affiché en salle des professeurs ; les
  tableaux de départs d'une gare ; le cahier de textes.
- **Couleur** : *Full palette*, empruntée au produit lui-même : bleu (structure),
  orange (action en cours), vert émeraude (présent, payé), ambre (en attente) —
  exactement les statuts que l'application affiche déjà.
- **Typographie** : Bricolage Grotesque (titres, plus chaleureuse et plus
  expressive) + Public Sans (texte), chiffres tabulaires pour les heures.
- **Motif** : la grille d'emploi du temps — cases, créneaux, rôles colorés.
- **Mouvement** : une aiguille d'heure qui avance au défilement et allume le
  créneau courant ; le sélecteur de rôle recompose la journée.
- **Risque** : la plus vivante, la plus proche du collège (qui vit au rythme de
  la journée) ; moins naturelle pour l'université (qui vit au rythme du
  semestre). Bricolage Grotesque est très à la mode en 2026 : elle datera vite.

---

## Recommandation

**B, enrichie de deux emprunts.**

- De **A**, la discipline documentaire : chaque station du flux montre un
  *document réel* (bulletin, reçu, PV, emploi du temps) et pas seulement un
  tableau de bord. La preuve la plus forte pour un directeur, c'est le document
  qu'il signe.
- De **C**, le sélecteur de rôle : sur la page Collège, la section « Comptes par
  acteur » recompose la même fiche selon le rôle choisi (direction, secrétariat,
  comptabilité, enseignant, parent, élève).

Ce qu'on demande de valider : la direction (A, B ou C), la typographie
proposée pour elle, et les cinq décisions de contenu de
`05-architecture-information.md` § 6.
