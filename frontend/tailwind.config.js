/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:      "#14B8A6",
        "primary-dark": "#0D9488",
        "primary-light": "#CCFBF1",
        secondary:    "#0EA5E9",
        "secondary-dark": "#0284C7",
        "secondary-light": "#E0F2FE",
        accent:       "#22C55E",
        "accent-dark": "#16A34A",
        "accent-light": "#DCFCE7",
        danger:       "#EF4444",
        warning:      "#F59E0B",
        success:      "#22C55E",
        "bg-base":    "#F8FAFC",
        "text-primary": "#0F172A",
        "text-secondary": "#334155",
        "text-muted": "#64748B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      gridTemplateColumns: {
        auto: "repeat(auto-fill, minmax(220px, 1fr))",
        "auto-sm": "repeat(auto-fill, minmax(160px, 1fr))",
      },
      boxShadow: {
        card:      "0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06)",
        "card-md": "0 4px 16px -2px rgba(0,0,0,.08), 0 2px 4px -2px rgba(0,0,0,.04)",
        "card-lg": "0 10px 40px -6px rgba(0,0,0,.12), 0 4px 16px -4px rgba(0,0,0,.06)",
        teal:      "0 8px 24px -4px rgba(20,184,166,.35)",
        glow:      "0 0 0 3px rgba(20,184,166,.18)",
      },
      animation: {
        "fade-in":    "fadeIn .5s ease both",
        "slide-up":   "slideUp .5s ease both",
        "slide-in":   "slideIn .4s ease both",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        float:        "float 4s ease-in-out infinite",
        shimmer:      "shimmer 1.6s infinite linear",
        "bounce-soft":"bounceSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:      { from:{ opacity:0 }, to:{ opacity:1 } },
        slideUp:     { from:{ opacity:0, transform:"translateY(24px)" }, to:{ opacity:1, transform:"translateY(0)" } },
        slideIn:     { from:{ opacity:0, transform:"translateX(-16px)" }, to:{ opacity:1, transform:"translateX(0)" } },
        float:       { "0%,100%":{ transform:"translateY(0)" }, "50%":{ transform:"translateY(-12px)" } },
        shimmer:     { from:{ backgroundPosition:"200% 0" }, to:{ backgroundPosition:"-200% 0" } },
        bounceSoft:  { "0%,100%":{ transform:"translateY(0)" }, "50%":{ transform:"translateY(-6px)" } },
      },
      backgroundImage: {
        "gradient-hero":    "linear-gradient(135deg, #0F172A 0%, #134E4A 50%, #0C4A6E 100%)",
        "gradient-teal":    "linear-gradient(135deg, #14B8A6 0%, #0EA5E9 100%)",
        "gradient-card":    "linear-gradient(135deg, #F0FDFA 0%, #E0F2FE 100%)",
        "gradient-section": "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)",
        shimmer:            "linear-gradient(90deg, transparent 25%, rgba(255,255,255,.6) 50%, transparent 75%)",
      },
    },
  },
  plugins: [],
}