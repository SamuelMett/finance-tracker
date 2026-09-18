/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#fbfaf6",
        "paper-dim": "#f3f1e9",
        ink: "#181510",
        sub: "#8a8175",
        rule: "#d9d3c4",
        "rule-strong": "#181510",
        pos: "#3c5e3f",
        neg: "#8a3324",
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
}

