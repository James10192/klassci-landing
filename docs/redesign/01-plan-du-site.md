# 01 · Plan du site actuel (exhaustif)

Relevé le 1er octobre 2026 sur `https://www.klassci.com` (production), croisé avec
le routage du dépôt (`app/[locale]/**`) et le sitemap (`app/sitemap.ts`).

Toutes les routes existent en **FR (`/fr/...`) et EN (`/en/...`)**, préfixe
toujours présent (`localePrefix: "always"`). La racine `/` redirige vers `/fr`.

## Routes indexées (sitemap, 49 adresses)

| Famille | Route | Source | Notes |
|---|---|---|---|
| Hub | `/` | `app/[locale]/page.tsx` → `UniverseHub` | Choix d'univers, bande d'établissements, pied de page |
| Université | `/universite` | `app/[locale]/universite/page.tsx` | 17 sections, seule page avec FAQ (balisée FAQPage) |
| Collège | `/college` | `components/college/college-landing.tsx` | Offre de lancement, rôles, modules, interfaces, calculateur, tarifs, déploiement, ODD, modale devis |
| LMS | `/lms` | `components/lms/lms-page.tsx` | Page d'attente « en préparation » |
| Blog | `/blog` | `lib/blog.ts` + `content/blog/*.mdx` | **FR uniquement** (`LANGUE_BLOG`) |
| Articles (7) | `/blog/calcul-moyennes-bulletins-cote-divoire`, `/blog/choisir-logiciel-gestion-scolaire-afrique`, `/blog/deliberation-jury-lmd-proces-verbal`, `/blog/eleves-affectes-subvention-etat`, `/blog/ouvrir-ecole-privee-cote-divoire`, `/blog/recouvrement-frais-scolarite`, `/blog/systeme-lmd-uemoa-credits-ue-ecue` | MDX | Adossés à des sources primaires (`verifier:citations`) |
| Docs (12) | `/docs`, `/docs/getting-started`, `/docs/concepts`, `/docs/universite`, `/docs/college`, `/docs/lms`, `/docs/superadmin/onboarding`, `/docs/secretaire/inscriptions`, `/docs/comptable/operations`, `/docs/modules/frais-comptabilite`, `/docs/api-reference`, `/docs/changelog` | fumadocs, `content/docs/**` | Navigation : Mise en route · Univers · Par rôle · Par module · Référence |
| Institutionnel (4) | `/a-propos`, `/securite`, `/confidentialite`, `/mentions-legales` | `content/institutionnel/*.mdx` | Nav dédiée « L'entreprise » |

## Routes non indexées (portails, parcours, système)

| Route | Rôle | Notes |
|---|---|---|
| `/inscription` | Aiguillage vers le portail | Lien nav « S'inscrire » |
| `/inscription/universite` | Liste des établissements ouverts | 6 écoles servies au 1er oct. : `ephrata`, `esbtp-abidjan`, `esbtp-yakro`, `presentation`, `rostan`, `usat` |
| `/inscription/universite/[ecole]` | Portail de candidature de l'école | Identité visuelle de l'école (logo, couleurs) lue sur son instance |
| `/inscription/universite/[ecole]/rendez-vous` | Prise / gestion de rendez-vous, convocation | Dernier commit : renvoi de convocation |
| `/reinscription`, `/reinscription/[ecole]` | Réinscription | Parcours dédié (`components/portail/reinscription-*`) |
| `/verification-email` | Vérification du lien e-mail | Code + lien |
| `/[...rest]` et `not-found` | 404 | 4 liens de reprise (Université, Collège, Docs, Accueil) |

## Redirections permanentes à conserver

- `/api-reference` → `/fr/docs/api-reference`
- `/changelog` → `/fr/docs/changelog`
- `/` → `/fr` (middleware next-intl)

## Points relevés par le crawl

- Le **blog n'existe qu'en français** : les URL `/en/blog/*` sont à vérifier dans
  `avant/` (statut relevé dans l'inventaire). Toute refonte doit garder ce choix
  explicite, pas le subir.
- La **liste des établissements** est dynamique (interrogée sur chaque instance,
  revalidée toutes les heures) : la refonte ne doit jamais la figer.
- Les **portails** sont hors index (`noindex` + en-tête) : ils ne sont pas du
  marketing, mais ils sont l'endroit où le plus grand nombre de personnes
  rencontrent KLASSCI (candidats, familles).
