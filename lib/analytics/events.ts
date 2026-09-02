// Typed event catalogue for KLASSCI landing analytics.
// Each event name maps to a strict props type so calls to track() are checked.

/**
 * Les endroits d'ou part un appel a l'action.
 *
 * Nomme et exporte : les barres de navigation partagent desormais une meme
 * coquille, et chaque page lui passe ses propres declencheurs — il leur faut un
 * type a annoter, sans quoi la liste se contourne par une chaine libre et le
 * catalogue cesse d'etre un catalogue.
 */
export type CtaLocation =
  | "nav"
  | "nav_docs"
  | "nav_inscription"
  | "hub_inscription"
  | "hub_nav_contact"
  | "hero_primary"
  | "hero_secondary"
  | "letter"
  | "pricing_essentiel"
  | "pricing_pro"
  | "pricing_elite"
  | "pricing_elite_trial"
  | "pricing_compare_open"
  | "pricing_partenaire"
  | "footer";

export type AnalyticsEventMap = {
  cta_click: {
    location: CtaLocation;
    locale: "fr" | "en";
  };
  feature_modal_open: {
    feature: "notes" | "finance" | "planning" | "presences" | "lmd" | "personnel" | "accessibilite";
    locale: "fr" | "en";
  };
  faq_open: {
    index: number;
    locale: "fr" | "en";
  };
  contact_submit: {
    school_type: string;
    has_phone: boolean;
    has_message: boolean;
    locale: "fr" | "en";
  };
  contact_submit_success: {
    locale: "fr" | "en";
  };
  contact_submit_error: {
    locale: "fr" | "en";
  };
  language_switch: {
    from: "fr" | "en";
    to: "fr" | "en";
  };
  theme_toggle: {
    to: "light" | "dark";
  };
  video_play: {
    locale: "fr" | "en";
  };
};

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type EventProps<N extends AnalyticsEventName> = AnalyticsEventMap[N];
