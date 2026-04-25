import { setRequestLocale } from "next-intl/server";

import { Contact } from "@/components/sections/contact";
import { Faq } from "@/components/sections/faq";
import { FeaturesBig } from "@/components/sections/features-big";
import { FeaturesSmall } from "@/components/sections/features-small";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { LetterCta } from "@/components/sections/letter-cta";
import { Nav } from "@/components/sections/nav";
import { Pillars } from "@/components/sections/pillars";
import { Pricing } from "@/components/sections/pricing";
import { Testimonials } from "@/components/sections/testimonials";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Pillars />
        <FeaturesBig />
        <FeaturesSmall />
        <Testimonials />
        <Pricing />
        <Faq />
        <Contact />
        <LetterCta />
      </main>
      <Footer />
    </>
  );
}
