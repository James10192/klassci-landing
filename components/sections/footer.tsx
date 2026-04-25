"use client";

import { Facebook, Linkedin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback } from "react";

import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/logo";
import { track } from "@/lib/analytics/track";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

// Reuse the parent group's socials (African Digit Consulting) until KLASSCI
// gets its own dedicated handles. LinkedIn is on /company/klassci/ already —
// it's the same page that ADC renamed during the rebrand.
const SOCIAL_LINKS = [
  {
    key: "facebook",
    href: "https://web.facebook.com/p/African-Digit-Consulting-100092649035928/?_rdc=1&_rdr",
    Icon: Facebook,
  },
  {
    key: "linkedin",
    href: "https://www.linkedin.com/company/klassci/",
    Icon: Linkedin,
  },
] as const;

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale() as "fr" | "en";
  const year = new Date().getFullYear();

  const product = t.raw("columns.product") as FooterColumn;
  const resources = t.raw("columns.resources") as FooterColumn;
  const contact = t.raw("columns.contact") as FooterColumn;
  const social = t.raw("social") as Record<string, string>;

  const onLinkClick = useCallback(() => {
    track("cta_click", { location: "footer", locale });
  }, [locale]);

  function renderLink(link: FooterLink) {
    const isExternal =
      link.href.startsWith("http") ||
      link.href.startsWith("mailto:") ||
      link.href.startsWith("tel:");
    const isAnchor = link.href.startsWith("#");

    if (isExternal || isAnchor) {
      return (
        <a
          href={link.href}
          onClick={onLinkClick}
          className="text-footer-link hover:text-footer-text transition-colors text-[0.875rem]"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {link.label}
        </a>
      );
    }

    return (
      <Link
        href={link.href}
        onClick={onLinkClick}
        className="text-footer-link hover:text-footer-text transition-colors text-[0.875rem]"
      >
        {link.label}
      </Link>
    );
  }

  return (
    <footer className="bg-footer-bg text-footer-text">
      <div className="container py-16 lg:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1 max-w-sm">
            <Logo variant="footer" />
            <p className="mt-4 text-footer-link text-[0.875rem] leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-footer-link mb-4">
              {product.title}
            </h4>
            <ul className="space-y-2.5">
              {product.links.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-footer-link mb-4">
              {resources.title}
            </h4>
            <ul className="space-y-2.5">
              {resources.links.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-footer-link mb-4">
              {contact.title}
            </h4>
            <ul className="space-y-2.5">
              {contact.links.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-16 pt-6 border-t border-footer-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-footer-link text-[0.78rem] font-mono uppercase tracking-[0.06em]">
            {t("copyright", { year })}
          </p>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ key, href, Icon }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social[key]}
                className="inline-flex items-center justify-center h-9 w-9 rounded border border-footer-border text-footer-link hover:text-footer-text hover:border-footer-text transition-colors"
              >
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
