// Design tokens carried over 1:1 from the approved React mockup
// (downloader-ui-v2.jsx). Keep these in sync if the mockup changes.

export const colors = {
  bg: "#0A0A0C",
  surface: "#141418",
  surfaceRaised: "#1D1D23",
  border: "#232329",
  borderSoft: "#1A1A1F",
  accent: "#E4344F",
  accentDim: "#7A1B2B",
  accentSoftBg: "rgba(228,52,79,0.12)",
  textHi: "#F5F4F2",
  textMid: "#D8D8DC",
  textLo: "#8A8A93",
  textFaint: "#5A5A63",
  success: "#4ADE9A",
  warning: "#F5A623",
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const spacing = (n: number) => n * 4;

export const type = {
  eyebrow: { fontSize: 11, letterSpacing: 1, fontWeight: "700" as const },
  title: { fontSize: 16, fontWeight: "700" as const },
  body: { fontSize: 13, fontWeight: "600" as const },
  caption: { fontSize: 11 },
  mono: { fontSize: 12, fontFamily: "monospace" },
};
