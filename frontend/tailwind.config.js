/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Warm near-black with an amber cast, like an exposed negative —
        // deliberately not blue-black or pure #000.
        base: "#171310",
        surface: "#211C17",
        card: "#241F19",
        hairline: "#3A322A",
        paper: "#F5EFE6",
        muted: "#A99C8C",
        safelight: "#FF6B35",
        "safelight-dim": "#B84E28",
        lumen: "#5FD6C9",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
