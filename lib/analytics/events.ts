// Typed event catalogue for KLASSCI landing analytics.
// Each event name maps to a strict props type so calls to track() are checked.

export type AnalyticsEventMap = {
  cta_click: {
    location:
      | "nav"
      | "nav_docs"
      | "hero_primary"
      | "hero_secondary"
      | "letter"
      | "pricing_essentiel"
      | "pricing_pro"
      | "pricing_elite"
      | "footer";
    locale: "fr" | "en";
  };
  feature_modal_open: {
    feature: "notes" | "finance" | "planning" | "presences" | "lmd" | "personnel";
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
  tenant_lookup_submit: {
    has_at_sign: boolean;
    locale: "fr" | "en";
  };
  tenant_lookup_found: {
    locale: "fr" | "en";
  };
  tenant_lookup_not_found: {
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
