import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { Metadata } from "next";
import { ImageResponse } from "next/og";

import type { Locale } from "@/i18n/routing";
import type { EtablissementVitrine } from "@/lib/vitrine/etablissements";
import { luminance, rapportContraste } from "@/lib/vitrine/couleurs";

/**
 * Les images de partage de klassci.com : un seul gabarit, dessiné ici.
 *
 * Avant, le site servait cinq PNG fixes pour toutes ses pages. Un lien vers le
 * portail d'inscription s'affichait sur WhatsApp avec la carte de la
 * documentation, « Gestion scolaire, documentée de bout en bout ». La page
 * anglaise partageait une image rédigée en français. Deux styles cohabitaient,
 * et deux cartes avaient leurs propres défauts : un « K » brun au lieu de
 * l'orange de la marque, un titre qui passait sous la capture d'écran.
 *
 * Chaque page déclare maintenant une image `opengraph-image`, rendue par ce
 * module à partir du titre et de la description que la page annonce déjà.
 * L'image ne peut donc plus contredire la page qu'elle représente.
 *
 * Le rendu passe par Satori : seulement du flexbox, et pas de WOFF2. Les
 * polices sont donc embarquées en WOFF, dans `assets/og/`.
 */

export const TAILLE_CARTE = { width: 1200, height: 630 } as const;
export const TYPE_CARTE = "image/png";

const BLEU = "#0453cb";
const BLEU_NUIT = "#0b2a6b";
const ORANGE = "#f58220";
const ENCRE = "#0f172a";
const GRIS = "#475569";
const FOND = "#f8fafc";

/** Les libellés de rubrique, affichés au-dessus du titre. */
export type Rubrique =
  | "accueil"
  | "universite"
  | "college"
  | "lms"
  | "documentation"
  | "ressources"
  | "institutionnel"
  | "inscription"
  | "rendezVous";

const RUBRIQUES: Record<Locale, Record<Rubrique, string>> = {
  fr: {
    accueil: "Gestion scolaire",
    universite: "KLASSCI Université",
    college: "KLASSCI College",
    lms: "KLASSCI LMS",
    documentation: "Documentation",
    ressources: "Ressources",
    institutionnel: "KLASSCI",
    inscription: "Inscription en ligne",
    rendezVous: "Rendez-vous",
  },
  en: {
    accueil: "School management",
    universite: "KLASSCI University",
    college: "KLASSCI College",
    lms: "KLASSCI LMS",
    documentation: "Documentation",
    ressources: "Resources",
    institutionnel: "KLASSCI",
    inscription: "Online enrolment",
    rendezVous: "Appointment",
  },
};

const MENTIONS: Record<Locale, { propulse: string; inscription: string; rdv: string }> = {
  fr: {
    propulse: "Inscription en ligne propulsée par",
    inscription: "Déposez votre dossier d'inscription en ligne",
    rdv: "Prenez rendez-vous au guichet",
  },
  en: {
    propulse: "Online enrolment powered by",
    inscription: "Submit your enrolment file online",
    rdv: "Book an appointment at the desk",
  },
};

/* ─────────────────────────────── Ressources ─────────────────────────────── */

let ressources: Promise<{
  polices: NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"];
  logo: string;
}> | null = null;

/**
 * Polices et logo, lus une fois par processus.
 *
 * Lus depuis le disque, et non depuis le site lui-même : une carte ne doit pas
 * dépendre d'un aller-retour vers le déploiement qui la sert.
 */
function chargerRessources() {
  ressources ??= (async () => {
    const lire = (...chemin: string[]) => readFile(join(process.cwd(), ...chemin));

    const [serif, sans, sansGras, mono, logo] = await Promise.all([
      lire("assets", "og", "IBMPlexSerif-600.woff"),
      lire("assets", "og", "IBMPlexSans-400.woff"),
      lire("assets", "og", "IBMPlexSans-600.woff"),
      lire("assets", "og", "IBMPlexMono-500.woff"),
      lire("public", "img", "logo-klassci-full.png"),
    ]);

    return {
      polices: [
        { name: "Plex Serif", data: serif, weight: 600 as const, style: "normal" as const },
        { name: "Plex Sans", data: sans, weight: 400 as const, style: "normal" as const },
        { name: "Plex Sans", data: sansGras, weight: 600 as const, style: "normal" as const },
        { name: "Plex Mono", data: mono, weight: 500 as const, style: "normal" as const },
      ],
      logo: `data:image/png;base64,${logo.toString("base64")}`,
    };
  })();

  return ressources;
}

/* ──────────────────────────────── Textes ──────────────────────────────── */

/** Coupe au mot, sans dépasser, et le dit par une ellipse. */
function couper(texte: string, maximum: number): string {
  const net = texte.replace(/\s+/g, " ").trim();
  if (net.length <= maximum) return net;

  const coupe = net.slice(0, maximum - 1);
  const espace = coupe.lastIndexOf(" ");

  return `${(espace > maximum * 0.6 ? coupe.slice(0, espace) : coupe).replace(/[\s,;:—–-]+$/, "")}…`;
}

/** Plus le titre est long, plus il est petit : il doit tenir en trois lignes. */
function tailleTitre(titre: string): number {
  if (titre.length <= 32) return 76;
  if (titre.length <= 52) return 64;
  if (titre.length <= 80) return 54;
  return 46;
}

/**
 * Le titre et la description d'une page, tels que ses métadonnées les déclarent.
 *
 * L'image lit les métadonnées plutôt que de recevoir son propre texte : une
 * page renommée change de carte sans qu'on ait à y penser.
 */
export function texteDesMetadonnees(meta: Metadata): { titre: string; description: string } {
  const brut = meta.openGraph?.title ?? meta.title;
  const titre =
    typeof brut === "string"
      ? brut
      : brut && typeof brut === "object" && "absolute" in brut
        ? String(brut.absolute)
        : brut && typeof brut === "object" && "default" in brut
          ? String(brut.default)
          : "KLASSCI";

  return {
    titre,
    description: String(meta.openGraph?.description ?? meta.description ?? ""),
  };
}

/* ───────────────────────────── Pièces communes ───────────────────────────── */

/** La barre de marque : le bleu KLASSCI, terminé par l'orange du logo. */
function BarreMarque({ hauteur = 630 }: { hauteur?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 14, height: hauteur }}>
      <div style={{ display: "flex", flex: 1, background: BLEU }} />
      <div style={{ display: "flex", height: 110, background: ORANGE }} />
    </div>
  );
}

function Pastille({ texte, couleur = BLEU }: { texte: string; couleur?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignSelf: "flex-start",
        padding: "8px 18px",
        borderRadius: 999,
        border: `2px solid ${couleur}`,
        color: couleur,
        fontFamily: "Plex Mono",
        fontSize: 22,
        letterSpacing: 2,
        textTransform: "uppercase",
      }}
    >
      {texte}
    </div>
  );
}

function Domaine({ texte }: { texte: string }) {
  return (
    <div
      style={{
        display: "flex",
        padding: "12px 24px",
        borderRadius: 12,
        background: ENCRE,
        color: "#ffffff",
        fontFamily: "Plex Mono",
        fontSize: 26,
      }}
    >
      {texte}
    </div>
  );
}

/* ─────────────────────────────── Les cartes ─────────────────────────────── */

/**
 * La carte d'une page de KLASSCI : vitrine, documentation, ressources, pages
 * institutionnelles.
 */
export async function carteKlassci({
  locale,
  rubrique,
  titre,
  description,
}: {
  locale: Locale;
  rubrique: Rubrique;
  titre: string;
  description: string;
}): Promise<ImageResponse> {
  const { polices, logo } = await chargerRessources();
  const titreCourt = couper(titre, 110);
  const descriptionCourte = couper(description, 170);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: FOND }}>
        <BarreMarque />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "56px 72px 52px 66px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" width={236} height={90} />
            <Pastille texte={RUBRIQUES[locale][rubrique]} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Plex Serif",
                fontSize: tailleTitre(titreCourt),
                lineHeight: 1.1,
                color: BLEU_NUIT,
                letterSpacing: -1,
              }}
            >
              {titreCourt}
            </div>
            {descriptionCourte ? (
              <div
                style={{
                  display: "flex",
                  marginTop: 24,
                  fontFamily: "Plex Sans",
                  fontSize: 28,
                  lineHeight: 1.4,
                  color: GRIS,
                  maxWidth: 980,
                }}
              >
                {descriptionCourte}
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", width: 44, height: 6, borderRadius: 3, background: BLEU }} />
              <div style={{ display: "flex", width: 18, height: 6, borderRadius: 3, background: ORANGE }} />
            </div>
            <Domaine texte="klassci.com" />
          </div>
        </div>
      </div>
    ),
    { ...TAILLE_CARTE, fonts: polices },
  );
}

/**
 * Le logo de l'école, prêt à être dessiné, ou null.
 *
 * Satori ne lit que le PNG et le JPEG. Une école qui a déposé un WebP ou un SVG
 * obtient son monogramme, pas une carte cassée. Le poids est plafonné : ce
 * fichier vient du réseau, et il finit en base64 dans la mémoire du rendu.
 */
async function logoEcole(url: string | null): Promise<string | null> {
  if (url === null) return null;

  try {
    const reponse = await fetch(url, { signal: AbortSignal.timeout(4_000), next: { revalidate: 3600 } });
    if (!reponse.ok) return null;

    const type = (reponse.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (type !== "image/png" && type !== "image/jpeg") return null;

    const octets = Buffer.from(await reponse.arrayBuffer());
    if (octets.length === 0 || octets.length > 1_500_000) return null;

    return `data:${type};base64,${octets.toString("base64")}`;
  } catch {
    return null;
  }
}

function initiales(nom: string, sigle: string): string {
  if (sigle) return sigle.slice(0, 5).toUpperCase();

  return nom
    .split(/\s+/)
    .filter((mot) => mot.length > 2 || /^[A-Z]{2,}$/.test(mot))
    .slice(0, 3)
    .map((mot) => mot.charAt(0).toUpperCase())
    .join("");
}

/** Au-dessus, une couleur est trop pâle pour porter une moitié de carte. */
const LUMINANCE_MAX_PANNEAU = 0.8;

/**
 * La couleur de la moitié « école » de la carte, et le texte qui tient dessus.
 *
 * Le bandeau de l'école est le premier choix : c'est la couleur que KLASSCI
 * met déjà en tête de ses documents. Mais plusieurs écoles l'ont laissé
 * blanc — les deux ESBTP — et leur moitié de carte se confondait alors avec
 * le fond. On retombe sur leur couleur principale, puis sur la couleur de
 * texte de leur bandeau, qui porte souvent leur teinte réelle. Faute de
 * mieux, le bleu KLASSCI.
 *
 * Le texte est recalculé : blanc ou encre, celui des deux qui contraste le
 * plus. Une vignette de partage est lue en petit, sur un téléphone.
 */
function couleursPanneau(identite: EtablissementVitrine["identite"]): { fond: string; texte: string } {
  const candidats = [identite.bandeauFond, identite.couleurPrincipale, identite.bandeauTexte, BLEU];
  const fond = candidats.find((couleur) => (luminance(couleur) ?? 1) <= LUMINANCE_MAX_PANNEAU) ?? BLEU;

  const surBlanc = rapportContraste(fond, "#ffffff") ?? 0;
  const surEncre = rapportContraste(fond, ENCRE) ?? 0;

  return { fond, texte: surBlanc >= surEncre ? "#ffffff" : ENCRE };
}

/**
 * La carte d'une école sur le portail d'inscription.
 *
 * La moitié gauche est aux couleurs de l'école : son bandeau, avec le texte
 * que KLASSCI a déjà calculé lisible dessus, son logo, son nom. La moitié
 * droite reste celle de KLASSCI — logo, bleu, orange — parce que c'est
 * KLASSCI qui reçoit le dossier, et que le parent qui ouvre le lien doit
 * reconnaître les deux.
 *
 * Le choix de la couleur est détaillé dans `couleursPanneau`.
 */
export async function carteEcole({
  locale,
  rubrique,
  ecole,
}: {
  locale: Locale;
  rubrique: "inscription" | "rendezVous";
  ecole: EtablissementVitrine;
}): Promise<ImageResponse> {
  const [{ polices, logo }, logoDeLEcole] = await Promise.all([
    chargerRessources(),
    logoEcole(ecole.logo),
  ]);

  const { fond, texte } = couleursPanneau(ecole.identite);

  const nom = couper(ecole.nom, 96);
  const lieu = [ecole.sigle && ecole.sigle !== ecole.nom ? ecole.sigle : "", ecole.ville]
    .filter(Boolean)
    .join(" · ");
  const mentions = MENTIONS[locale];
  const monogramme = initiales(ecole.nom, ecole.sigle) || "K";

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: FOND }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 520,
            height: "100%",
            padding: "56px 52px",
            background: fond,
            color: texte,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 176,
              height: 176,
              borderRadius: 28,
              background: "#ffffff",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
            }}
          >
            {logoDeLEcole ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoDeLEcole}
                alt=""
                style={{ width: 148, height: 148, objectFit: "contain" }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  fontFamily: "Plex Serif",
                  fontSize: monogramme.length <= 3 ? 64 : 46,
                  color: (rapportContraste(fond, "#ffffff") ?? 0) >= 3 ? fond : BLEU,
                }}
              >
                {monogramme}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontFamily: "Plex Serif",
              fontSize: nom.length <= 30 ? 50 : nom.length <= 60 ? 42 : 34,
              lineHeight: 1.15,
            }}
          >
            {nom}
          </div>
          {lieu ? (
            <div style={{ display: "flex", marginTop: 16, fontFamily: "Plex Sans", fontSize: 26, opacity: 0.85 }}>
              {lieu}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "56px 60px 52px 56px" }}>
          <Pastille texte={RUBRIQUES[locale][rubrique]} />

          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              fontFamily: "Plex Serif",
              fontSize: 54,
              lineHeight: 1.12,
              color: BLEU_NUIT,
              letterSpacing: -1,
            }}
          >
            {rubrique === "rendezVous" ? mentions.rdv : mentions.inscription}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", fontFamily: "Plex Sans", fontSize: 22, color: GRIS }}>
              {mentions.propulse}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt="" width={210} height={80} />
              <Domaine texte="klassci.com" />
            </div>
            <div style={{ display: "flex", height: 8, marginTop: 8 }}>
              <div style={{ display: "flex", flex: 3, background: fond }} />
              <div style={{ display: "flex", flex: 5, background: BLEU }} />
              <div style={{ display: "flex", flex: 1, background: ORANGE }} />
            </div>
          </div>
        </div>
      </div>
    ),
    { ...TAILLE_CARTE, fonts: polices },
  );
}
