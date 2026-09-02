import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Contact } from "@/components/sections/contact";
import { Deployment } from "@/components/sections/deployment";
import { Faq } from "@/components/sections/faq";
import { FeaturesBig } from "@/components/sections/features-big";
import { FeaturesSmall } from "@/components/sections/features-small";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { ImageBanner } from "@/components/sections/image-banner";
import { LetterCta } from "@/components/sections/letter-cta";
import { Nav } from "@/components/sections/nav";
import { PartnershipBanner } from "@/components/sections/partnership-banner";
import { Pillars } from "@/components/sections/pillars";
import { Pricing } from "@/components/sections/pricing";
import { Security } from "@/components/sections/security";
import { Support } from "@/components/sections/support";
import { Testimonials } from "@/components/sections/testimonials";
import { VideoTestimonial } from "@/components/sections/video-testimonial";
import { JsonLd } from "@/components/seo/json-ld";
import { UniversityImpact } from "@/components/universe/university-impact";
import { LogosEtablissements } from "@/components/vitrine/logos-etablissements";
import { routing, type Locale } from "@/i18n/routing";
import { buildUniverseMetadata } from "@/lib/seo";
import { buildEditionGraph } from "@/lib/schema/pages";
import { etablissementsVitrine } from "@/lib/vitrine/etablissements";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = routing.locales.includes(locale) ? locale : routing.defaultLocale;
  // Cette page lisait le namespace `metadata`, c'est-a-dire les chaines par
  // defaut du site. Son titre etait donc « KLASSCI, gestion scolaire
  // repensee. » : la page produit destinee aux universites et aux grandes
  // ecoles ne contenait ni « universite », ni « grande ecole », ni « LMD »
  // dans le seul texte que lit un moteur avant tout le reste.
  const t = await getTranslations({ locale: safeLocale, namespace: "universite.meta" });

  return buildUniverseMetadata({
    locale: safeLocale,
    key: "universite",
    title: t("title"),
    description: t("description"),
    path: "/universite",
    image: "/img/og/universite.png",
  });
}

export default async function UniversitePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const safeLocale = routing.locales.includes(locale as Locale)
    ? (locale as Locale)
    : routing.defaultLocale;
  const etablissements = await etablissementsVitrine();

  // La FAQ n'est declaree QUE sur cette page : c'est la seule qui la rende.
  // La poser ailleurs serait du balisage sans contenu visible.
  const faq = await getTranslations({ locale: safeLocale, namespace: "faq" });
  const graphe = await buildEditionGraph("universite", safeLocale, {
    faq: faq.raw("items") as Array<{ q: string; a: string }>,
    etablissements: etablissements.map((e) => ({
      nom: e.nom,
      ville: e.ville,
      logo: e.logo,
    })),
  });

  return (
    <>
      <JsonLd graph={graphe} />
      <Nav />
      <main>
        <Hero />
        {/* Les references viennent AVANT l'argumentaire : « qui vous fait
            deja confiance » se lit en deux secondes, la liste des
            fonctionnalites demande de s'installer. */}
        <LogosEtablissements etablissements={etablissements} locale={locale} />
        <Pillars />
        <FeaturesBig />
        <FeaturesSmall />
        <Testimonials />
        <PartnershipBanner />
        <VideoTestimonial />
        <Security />
        <UniversityImpact />
        <Support />
        <ImageBanner />
        <Deployment />
        <Pricing />
        <Faq />
        <Contact />
        <LetterCta />
      </main>
      <Footer />
    </>
  );
}
