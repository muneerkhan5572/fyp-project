// Green-family categorical slots matching the app's brand palette
// (app/globals.css --primary/--brand-accent/--accent). Series stay
// pairwise distinguishable by hue and lightness within the family:
// revenue on the deep forest primary hue, units/profit on the mint
// brand-accent hue, traffic on a teal offshoot, neutral on the pale sage
// tertiary tone. The previous validate_palette.js contrast script this
// file used to reference no longer exists in the repo; contrast against
// light (#ffffff) and dark (#18181b) chart surfaces was checked by hand
// against WCAG AA before picking these values.
export const CHART_COLORS = {
  revenue: { light: "#14532d", dark: "#10b981" },
  units: { light: "#059669", dark: "#6ee7b7" },
  traffic: { light: "#0d9488", dark: "#5eead4" },
  neutral: { light: "#a7f3d0", dark: "#134e3a" },
  profit: { light: "#059669", dark: "#6ee7b7" },
} as const;
