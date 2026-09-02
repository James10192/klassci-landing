# Plan éditorial KLASSCI — septembre 2026 → août 2027

Ce fichier est **l'état d'avancement**, pas une note d'intention. Un agent
rédacteur y prend la prochaine pièce, l'écrit, et coche la ligne. C'est le
point de reprise entre deux sessions.

## Ce que le marché a montré

Douze acteurs servent la gestion scolaire en Afrique francophone. Le plus
prolifique éditorialement publie une demi-douzaine d'articles ; la plupart
n'ont aucun blog. Ceux qui gagnent aujourd'hui la requête d'achat
(myappacademia.com, agences de développement) sont des éditeurs de contenu
sans clients sur le terrain.

La demande n'est pas sur « logiciel de gestion scolaire ». Elle est dans le
corpus réglementaire et opératoire que le fondateur, la secrétaire et le
comptable tapent toute l'année : agrément, carte scolaire, élèves affectés,
calcul de moyenne, certificat de scolarité, crédits LMD. **Personne ne publie
de contenu sourcé sur les textes.** C'est le pari de ce plan, et c'est ce
qu'un concurrent ne peut pas produire en trois semaines.

Le segment de l'enseignement supérieur est un angle mort complet : le seul
concurrent frontal identifié ne mentionne ni LMD, ni UE, ni ECUE, ni crédits,
ni jury.

## La règle de production — non négociable

Une pièce ne se publie pas sans **au moins un** de ces trois éléments :

1. une **donnée propriétaire** (chiffre issu des établissements en production,
   anonymisé) ;
2. un **texte réglementaire cité et daté**, dont l'URL figure en source ;
3. un **modèle téléchargeable**.

Un article qui n'a aucun des trois est un article qu'un concurrent refait en
une journée.

Deux interdits absolus, qui valent pour tout agent rédacteur :

- **Ne jamais inventer un chiffre, une référence de texte, un délai, un prix.**
  Un doute s'écrit (« la procédure a évolué, vérifiez auprès de votre
  DRENA »), il ne se comble pas.
- **Ne jamais inventer une donnée client KLASSCI.** L'agent n'y a pas accès.
  Un commentaire `{/* DONNEE-TERRAIN: ... */}` marque l'endroit ; un humain le
  remplit. Trois par article au maximum.

## Les cinq piliers

| État | Pilier | Slug | Cible |
|---|---|---|---|
| ✅ | Le système LMD UEMOA : crédits, UE, ECUE | `systeme-lmd-uemoa-credits-ue-ecue` | Directeur des études |
| ✅ | Ouvrir une école privée en Côte d'Ivoire | `ouvrir-ecole-privee-cote-divoire` | Fondateur K-12 |
| ✅ | Calculer les moyennes et éditer les bulletins | `calcul-moyennes-bulletins-cote-divoire` | Secrétariat, censeur |
| ✅ | Recouvrer les frais de scolarité | `recouvrement-frais-scolarite` | Comptable, DAF |
| ✅ | Choisir un logiciel de gestion scolaire | `choisir-logiciel-gestion-scolaire-afrique` | Décideur en comparaison |

## Les satellites, par priorité

`P1` d'abord. Chaque ligne indique le thème du frontmatter.

| État | Prio | Titre | Slug | Thème |
|---|---|---|---|---|
| ☐ | P1 | Délibération de jury LMD : procédure et PV | `deliberation-jury-lmd-proces-verbal` | lmd |
| ☐ | P1 | Compensation LMD : valider un semestre | `compensation-lmd-validation-semestre` | lmd |
| ☐ | P1 | Élèves affectés : gérer subvention et solde | `eleves-affectes-subvention-etat` | finance |
| ☐ | P1 | Modèle de bulletin trimestriel à télécharger | `modele-bulletin-trimestriel` | operations |
| ☐ | P1 | Prix d'un logiciel scolaire en FCFA | `prix-logiciel-gestion-scolaire-fcfa` | achat |
| ☐ | P1 | Agrément privé : dossier, délais, pièges | `agrement-etablissement-prive-cote-divoire` | reglementation |
| ☐ | P1 | Tableau de suivi des frais : modèle Excel | `tableau-suivi-frais-scolarite-excel` | finance |
| ☐ | P1 | Émargement numérique et absentéisme | `emargement-numerique-absenteisme` | operations |
| ☐ | P2 | Appréciations de bulletin : 120 formulations | `appreciations-bulletin-scolaire` | operations |
| ☐ | P2 | Conseil de classe : ordre du jour et PV | `conseil-de-classe-ordre-du-jour-pv` | operations |
| ☐ | P2 | Certificat de scolarité : modèle et mentions | `certificat-scolarite-modele` | operations |
| ☐ | P2 | Mobile Money : réconcilier la caisse | `mobile-money-frais-scolaires-caisse` | finance |
| ☐ | P2 | Échéancier de paiement qui tient | `echeancier-paiement-frais-scolaires` | finance |
| ☐ | P2 | Migrer d'Excel vers un logiciel en 30 jours | `migrer-excel-vers-logiciel-scolaire` | achat |
| ☐ | P2 | Emploi du temps : 9 contraintes à poser | `emploi-du-temps-contraintes` | operations |
| ☐ | P2 | Passer du BTS au LMD : plan en 6 étapes | `passer-du-bts-au-lmd` | lmd |
| ☐ | P2 | Checklist rentrée : 21 points côté système | `checklist-rentree-directeur` | operations |
| ☐ | P2 | Comptabilité scolaire SYSCOHADA | `comptabilite-scolaire-syscohada` | finance |
| ☐ | P2 | Carte scolaire : ce que la DRENA vérifie | `carte-scolaire-drena` | reglementation |
| ☐ | P2 | Crédits capitalisables : ce que dit la directive | `credits-capitalisables-uemoa` | lmd |
| ☐ | P3 | Supplément au diplôme : modèle LMD | `supplement-au-diplome-lmd` | lmd |
| ☐ | P3 | WhatsApp parents : cadre, coûts, limites | `whatsapp-parents-etablissement` | operations |
| ☐ | P3 | Données des élèves : vos obligations | `protection-donnees-eleves-afrique` | reglementation |
| ☐ | P3 | Suivi des heures : planifié contre réalisé | `suivi-heures-planifie-realise` | operations |
| ☐ | P3 | Règlement intérieur : modèle commenté | `reglement-interieur-etablissement-modele` | reglementation |

## Le calendrier, et pourquoi il compte

L'année scolaire ivoirienne impose son rythme, et il y en a **deux**.

Le collège et le lycée suivent le calendrier du MENA : la décision d'achat se
prend de **mai à juillet**, le déploiement en août, la rentrée à la
mi-septembre. Le supérieur suit un autre tempo : les délibérations de jury
tombent en **février** et en **juin-juillet**, et c'est juste après une
délibération douloureuse qu'un directeur des études accepte de changer
d'outil.

La règle qui en découle : **publier six mois avant le pic**. Un contenu de
rentrée s'écrit en février, pas en août — en août il n'a pas eu le temps
d'être indexé ni de mûrir.

| Période | Intention d'achat | Ce qui se publie |
|---|---|---|
| Sept.–oct. | Quasi nulle, tout le monde est dans la rentrée | Ouvrir le corpus, piliers LMD, pages métier |
| Nov.–déc. | Réveil | Moyennes et bulletins, gabarit de bulletin — le premier trimestre se ferme fin décembre |
| Janv.–févr. | Comparaison, les budgets se votent | Études de cas, pages comparatives ; côté supérieur, les délibérations de février déclenchent |
| Mars–avril | Décision | Agrément, carte scolaire : les dossiers se déposent |
| Mai–juil. | Signature | Tarifs, guide d'achat, checklist de rentrée |
| Août | Déploiement | Gel éditorial, support |

## Ce qui manque encore au site

Le corpus a besoin de surfaces d'atterrissage. Par ordre d'utilité :

- `/{locale}/tarifs` — page tarifs indexable, les deux éditions
- `/{locale}/metiers/{directeur-fondateur,secretariat,comptable-caissier,enseignant}`
- `/{locale}/fonctionnalites/{notes-bulletins,inscriptions,comptabilite,presences,emploi-du-temps,lmd}`
- `/{locale}/pays/{cote-divoire,senegal,benin,burkina-faso,mali,togo,niger}`
- `/{locale}/etudes-de-cas/{...}` — les établissements en production, avec leur accord
- `/{locale}/comparatif/{alternative-excel,tarification-par-eleve-ou-licence}`
- `/{locale}/ressources` — les modèles téléchargeables
- `/{locale}/glossaire` — UE, ECUE, crédit, DRENA, MESRS…

## Attention aux slugs

`app/robots.ts` interdit `/*/inscription$` et `/*/inscription/`. Les motifs
sont **ancrés** depuis septembre 2026 — un slug comme
`/fr/blog/inscription-en-ligne` ou `/fr/metiers/inscriptions` passe donc sans
problème. Avant de créer une section entière, relancer
`node scripts/verifier-seo.mjs --url <adresse>` pour s'en assurer.
