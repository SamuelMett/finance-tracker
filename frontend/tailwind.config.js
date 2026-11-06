/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0c0e",
        surface: "#111215",
        raised: "#17191d",
        line: "#24272d",
        "line-hi": "#383c45",
        fg: "#ececee",
        mute: "#8c919a",
        faint: "#5a5f69",
        navy: "#27386a",
        "navy-hi": "#34498a",
        accent: "#f0a561",
        pos: "#7bcf9a",
        neg: "#ee7b70",
      },
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: { DEFAULT: "3px", md: "4px", lg: "6px" },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        blink: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0 } },
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        blink: "blink 1.1s steps(1) infinite",
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
