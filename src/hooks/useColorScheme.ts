import useAppTheme from "@/hooks/useAppTheme";

export default function useColorScheme() {
  const { theme, preference, resolvedTheme, setThemePreference } = useAppTheme();

  return {
    activeMode: resolvedTheme,
    colors: theme.colors,
    themePreference: preference,
    setThemePreference,
    setLightMode: () => setThemePreference("light"),
    setDarkMode: () => setThemePreference("dark"),
    setAutoMode: () => setThemePreference("auto"),
  };
}
