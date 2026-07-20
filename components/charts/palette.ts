// Validated categorical slots from the dataviz skill's reference palette,
// checked against this project's actual light (#ffffff) and dark (#18181b)
// chart surfaces with scripts/validate_palette.js — not eyeballed. Only the
// contrast-safe-on-light slots (1 blue, 2 green, 6 orange) are used here;
// slots 3/4/5 (magenta, yellow, aqua) fail 3:1 on the light surface and
// would need direct-label relief this project doesn't build for every chart.
export const CHART_COLORS = {
  revenue: { light: "#2a78d6", dark: "#3987e5" },
  units: { light: "#008300", dark: "#008300" },
  traffic: { light: "#eb6834", dark: "#d95926" },
  neutral: { light: "#2a78d6", dark: "#3987e5" },
} as const;
