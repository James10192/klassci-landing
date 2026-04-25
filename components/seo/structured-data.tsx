// JSON-LD schemas served on the homepage so Google associates the brand
// "KLASSCI" unambiguously with klassci.com (Organization), describes the
// site itself (WebSite) and the product (SoftwareApplication / SaaS).
//
// Validate with: https://search.google.com/test/rich-results

const SITE_URL = "https://klassci.com";

const ORG_ID = `${SITE_URL}/#org`;
const SITE_ID = `${SITE_URL}/#site`;
const PRODUCT_ID = `${SITE_URL}/#product`;

interface StructuredDataProps {
  description: string;
}

export function StructuredData({ description }: StructuredDataProps) {
  const graph = [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "KLASSCI",
      legalName: "KLASSCI",
      url: SITE_URL,
      logo: `${SITE_URL}/img/logo-klassci.png`,
      description,
      foundingDate: "2024",
      areaServed: ["CI", "Africa"],
      sameAs: ["https://www.linkedin.com/company/klassci/"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "contact@klassci.com",
        availableLanguage: ["French", "English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": SITE_ID,
      url: SITE_URL,
      name: "KLASSCI",
      description,
      publisher: { "@id": ORG_ID },
      inLanguage: ["fr-FR", "en-US"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": PRODUCT_ID,
      name: "KLASSCI",
      applicationCategory: "EducationApplication",
      applicationSubCategory: "School Management Software",
      operatingSystem: "Web Browser",
      url: SITE_URL,
      description,
      provider: { "@id": ORG_ID },
      offers: {
        "@type": "Offer",
        priceCurrency: "XOF",
        price: "0",
        availability: "https://schema.org/InStock",
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}
