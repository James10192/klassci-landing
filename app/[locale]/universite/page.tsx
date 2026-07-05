import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ClientMarquee } from "@/components/sections/client-marquee";
import { Contact } from "@/components/sections/contact";
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
import { StructuredData } from "@/components/seo/structured-data";
import { routing, type Locale } from "@/i18n/routing";
import { buildUniverseMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = routing.locales.includes(locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: safeLocale, namespace: "metadata" });

  return buildUniverseMetadata({
    locale: safeLocale,
    key: "universite",
    title: t("title"),
    description: t("description"),
    path: "/universite",
  });
}

export default async function UniversitePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "metadata" });

  return (
    <>
      <StructuredData description={t("description")} />
      <Nav />
      <main>
        <Hero />
        <Pillars />
        <FeaturesBig />
        <FeaturesSmall />
        <ClientMarquee />
        <Testimonials />
        <PartnershipBanner />
        <VideoTestimonial />
        <Security />
        <Support />
        <ImageBanner />
        <Pricing />
        <Faq />
        <Contact />
        <LetterCta />
      </main>
      <Footer />
    </>
  );
}
