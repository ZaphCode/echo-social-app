import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from "@react-navigation/native";

export type ThemePreference = "auto" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

/**
 * Echo design tokens. Dark is the primary theme; light mirrors every token.
 * The accent is the electric blue from the reference design (#3E8CFD): white
 * text on it only at 15px+ bold (buttons, pills), never for body copy.
 */
const palettes = {
  dark: {
    bg: "#0E0F11",
    surface: "#18191C",
    surface2: "#222327",
    surface3: "#2C2E33",
    line: "rgba(255,255,255,0.07)",
    lineStrong: "rgba(255,255,255,0.14)",
    text: "#F4F5F7",
    textMuted: "#A9ACB3",
    textSubtle: "#868A92",
    accent: "#3E8CFD",
    accentText: "#7DB3FF",
    accentSoft: "rgba(62,140,253,0.16)",
    accentGlow: "rgba(62,140,253,0.55)",
    onAccent: "#FFFFFF",
    success: "#3DD598",
    successSoft: "rgba(61,213,152,0.14)",
    danger: "#FF7A6E",
    dangerSoft: "rgba(255,122,110,0.14)",
    done: "#BC98FF",
    doneSoft: "rgba(188,152,255,0.14)",
    warn: "#F2B544",
    warnSoft: "rgba(242,181,68,0.14)",
    star: "#FFC94D",
    scrim: "rgba(0,0,0,0.6)",
    glass: "#18191C",
    imageOverlay: "rgba(0,0,0,0.38)",
  },
  light: {
    bg: "#F2F3F6",
    surface: "#FFFFFF",
    surface2: "#EBEDF1",
    surface3: "#DFE2E8",
    line: "rgba(15,17,21,0.08)",
    lineStrong: "rgba(15,17,21,0.16)",
    text: "#0F1115",
    textMuted: "#4C525C",
    textSubtle: "#626873",
    accent: "#3E8CFD",
    accentText: "#1A66D6",
    accentSoft: "rgba(62,140,253,0.12)",
    accentGlow: "rgba(62,140,253,0.4)",
    onAccent: "#FFFFFF",
    success: "#047857",
    successSoft: "rgba(4,120,87,0.1)",
    danger: "#C2372B",
    dangerSoft: "rgba(194,55,43,0.1)",
    done: "#6A3FD4",
    doneSoft: "rgba(106,63,212,0.1)",
    warn: "#8A5A0B",
    warnSoft: "rgba(138,90,11,0.1)",
    star: "#E8A400",
    scrim: "rgba(15,17,21,0.45)",
    glass: "#FFFFFF",
    imageOverlay: "rgba(0,0,0,0.32)",
  },
} as const;

export type ThemeColors = { [K in keyof (typeof palettes)["dark"]]: string };

export const fonts = {
  regular: "Geist-Regular",
  bold: "Geist-Bold",
} as const;

/** Type scale: [fontSize, lineHeight]. */
export const typeScale = {
  display: [30, 36],
  title: [24, 30],
  heading: [19, 25],
  body: [16, 23],
  label: [14, 19],
  caption: [13, 17],
  micro: [11, 14],
} as const;

export type TypeVariant = keyof typeof typeScale;

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  /** Horizontal screen gutter. */
  gutter: 20,
} as const;

export const radius = {
  sm: 12,
  input: 16,
  card: 22,
  feed: 28,
  sheet: 32,
  pill: 999,
} as const;

/** Bottom inset reserved for the floating tab bar. */
export const TAB_BAR_SPACE = 112;

export type AppTheme = {
  mode: ResolvedTheme;
  colors: ThemeColors;
  navigationTheme: NavigationTheme;
};

function createNavigationTheme(
  mode: ResolvedTheme,
  colors: ThemeColors,
): NavigationTheme {
  const base = mode === "dark" ? DarkTheme : DefaultTheme;

  return {
    ...base,
    dark: mode === "dark",
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.bg,
      card: colors.bg,
      text: colors.text,
      border: colors.line,
      notification: colors.danger,
    },
    fonts: {
      regular: { fontFamily: fonts.regular, fontWeight: "normal" },
      medium: { fontFamily: fonts.regular, fontWeight: "normal" },
      bold: { fontFamily: fonts.bold, fontWeight: "normal" },
      heavy: { fontFamily: fonts.bold, fontWeight: "normal" },
    },
  };
}

function createAppTheme(mode: ResolvedTheme): AppTheme {
  const colors = palettes[mode];
  return { mode, colors, navigationTheme: createNavigationTheme(mode, colors) };
}

export const appThemes = {
  light: createAppTheme("light"),
  dark: createAppTheme("dark"),
} as const;
