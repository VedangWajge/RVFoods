import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "80rem",
      },
    },
    extend: {
      colors: {
        /* Shadcn semantic tokens (HSL via CSS variables) */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        /* RV Foods brand palette (direct hex — use in layouts & marketing) */
        primary: {
          DEFAULT: "#C84B31",
          dark: "#A63A24",
          light: "#E8755A",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F5A623",
          light: "#FDD284",
          foreground: "#1A1A1A",
        },
        background: "#FDFAF6",
        surface: "#FFFFFF",
        "text-primary": "#1A1A1A",
        "text-secondary": "#6B6B6B",
        "text-muted": "#A3A3A3",
        success: {
          DEFAULT: "#2D6A4F",
          foreground: "#FFFFFF",
        },
        error: {
          DEFAULT: "#C0392B",
          foreground: "#FFFFFF",
        },
        footer: "#1A1A1A",
      },
      fontFamily: {
        heading: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        serif: ['"Playfair Display"', "Georgia", "serif"],
      },
      fontSize: {
        "display-lg": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-sm": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(26 26 26 / 0.06), 0 1px 2px -1px rgb(26 26 26 / 0.06)",
        "card-hover":
          "0 10px 15px -3px rgb(26 26 26 / 0.08), 0 4px 6px -4px rgb(26 26 26 / 0.06)",
        nav: "0 1px 0 0 #E8E0D5",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #FDF6EC 0%, #FDFAF6 50%, #FDFAF6 100%)",
        "accent-gradient": "linear-gradient(135deg, #F5A623 0%, #FDD284 100%)",
        "primary-gradient": "linear-gradient(135deg, #C84B31 0%, #E8755A 100%)",
        "spice-pattern":
          "radial-gradient(circle at 20% 80%, rgb(200 75 49 / 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgb(245 166 35 / 0.08) 0%, transparent 50%)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      maxWidth: {
        content: "80rem",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-top": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
        "slide-in-top": "slide-in-top 0.3s ease-out forwards",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
