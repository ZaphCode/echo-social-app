import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from "@react-navigation/native";
import { Platform } from "react-native";

export type ThemePreference = "auto" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const brandColors = {
  primary: "#63C3FF",
  brandSurface: "#1D4C88",
  danger: "#FF6959",
  success: "#00B86B",
  accent: "#A45EE5",
  textOnBrand: "#FFFFFF",
  textOnBrandMuted: "rgba(255,255,255,0.78)",
} as const;

const palettes = {
  light: {
    background: "#F4F7FB",
    surface: "#FFFFFF",
    surfaceMuted: "#E8EEF5",
    text: "#111827",
    textMuted: "#667085",
    border: "#D0D9E5",
  },
  dark: {
    background: "#111315",
    surface: "#28292B",
    surfaceMuted: "#1C1D1F",
    text: "#FFFFFF",
    textMuted: "#7B7C7C",
    border: "#34363A",
  },
} as const;

export const theme: {
  colors: {
    primary: string;
    brandSurface: string;
    danger: string;
    success: string;
    accent: string;
    textOnBrand: string;
    textOnBrandMuted: string;
    primaryBlue: string;
    secondaryBlue: string;
    redError: string;
    successGreen: string;
    completePurple: string;
  };
  fontFamily: {
    regular: string;
    bold: string;
  };
  fontSizes: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    tabPT: number;
  };
  radii: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
} = {
  colors: {
    ...brandColors,
    primaryBlue: brandColors.primary,
    secondaryBlue: brandColors.brandSurface,
    redError: brandColors.danger,
    successGreen: brandColors.success,
    completePurple: brandColors.accent,
  },
  fontFamily: {
    regular: "Geist-Regular",
    bold: "Geist-Bold",
  },
  fontSizes: {
    sm: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
  },
  spacing: {
    xs: 8,
    sm: 10,
    md: 16,
    lg: 24,
    tabPT: Platform.OS === "android" ? 48 : 16,
  },
  radii: {
    sm: 10,
    md: 12,
    lg: 15,
    pill: 999,
  },
};

export type ThemeBase = typeof theme;

export type ThemeColors = (typeof palettes)[ResolvedTheme] & {
  primary: string;
  brandSurface: string;
  danger: string;
  success: string;
  accent: string;
  textOnBrand: string;
  textOnBrandMuted: string;
  primaryBlue: string;
  secondaryBlue: string;
  darkGray: string;
  darkerGray: string;
  lightGray: string;
  redError: string;
  successGreen: string;
  completePurple: string;
};

export type AppTheme = ThemeBase & {
  mode: ResolvedTheme;
  colors: ThemeColors;
  navigationTheme: NavigationTheme;
};

function createNavigationTheme(
  mode: ResolvedTheme,
  colors: ThemeColors,
): NavigationTheme {
  const baseTheme = mode === "dark" ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    dark: mode === "dark",
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surfaceMuted,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };
}

export function createAppTheme(mode: ResolvedTheme): AppTheme {
  const palette = palettes[mode];
  const colors: ThemeColors = {
    ...palette,
    ...brandColors,
    primaryBlue: brandColors.primary,
    secondaryBlue: brandColors.brandSurface,
    darkGray: palette.surface,
    darkerGray: palette.surfaceMuted,
    lightGray: palette.textMuted,
    redError: brandColors.danger,
    successGreen: brandColors.success,
    completePurple: brandColors.accent,
  };

  return {
    ...theme,
    mode,
    colors,
    navigationTheme: createNavigationTheme(mode, colors),
  };
}

export const appThemes = {
  light: createAppTheme("light"),
  dark: createAppTheme("dark"),
} as const;
