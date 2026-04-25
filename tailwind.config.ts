import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "html.dark"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./i18n/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1120px",
        "2xl": "1120px",
      },
    },
    extend: {
      colors: {
        // KLASSCI brand
        bg: "var(--bg)",
        "bg-alt": "var(--bg-alt)",
        "bg-card": "var(--bg-card)",
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          light: "var(--accent-light)",
        },
        brand: {
          orange: "var(--brand-orange)",
          "orange-hover": "var(--brand-orange-hover)",
          "orange-light": "var(--brand-orange-light)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        // Footer (uses accent)
        "footer-bg": "var(--footer-bg)",
        "footer-text": "var(--footer-text)",
        "footer-link": "var(--footer-link)",
        "footer-border": "var(--footer-border)",
      },
      fontFamily: {
        serif: ["var(--font-plex-serif)", "Georgia", "serif"],
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Fluid hero h1
        "hero-1": [
          "clamp(2.75rem, 7vw, 3.5rem)",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "300" },
        ],
        "section-h2": [
          "clamp(1.75rem, 4vw, 2.25rem)",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "300" },
        ],
        "hero-sub": [
          "clamp(1rem, 1.8vw, 1.15rem)",
          { lineHeight: "1.6", letterSpacing: "-0.02em" },
        ],
      },
      spacing: {
        "section": "5rem",
        "hero": "10rem",
      },
      borderRadius: {
        DEFAULT: "4px",
        klassci: "4px",
      },
      maxWidth: {
        klassci: "1120px",
        "klassci-narrow": "680px",
      },
      transitionTimingFunction: {
        klassci: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        clipReveal: {
          "0%": { clipPath: "inset(0 100% 0 0)" },
          "100%": { clipPath: "inset(0 0 0 0)" },
        },
        gradientText: {
          "0%": { backgroundPosition: "0% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        marqueeScroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(calc(-50% - 0.75rem))" },
        },
        btnPulse: {
          "0%": { opacity: "0.4", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(1.15)" },
        },
        videoPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        "clip-reveal": "clipReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both",
        "gradient-text": "gradientText 4s linear infinite",
        "marquee-25": "marqueeScroll 25s linear infinite",
        "marquee-40": "marqueeScroll 40s linear infinite",
        "btn-pulse": "btnPulse 2.5s cubic-bezier(0.22, 1, 0.36, 1) infinite",
        "video-pulse": "videoPulse 1.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
