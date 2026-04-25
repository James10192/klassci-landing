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

export default async function HomePage({
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
