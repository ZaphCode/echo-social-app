import { useColorScheme } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  appThemes,
  ResolvedTheme,
  ThemeColors,
  ThemePreference,
} from "@/theme/theme";

type ThemePreferenceState = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

type PersistedThemeState =
  | {
      themePreference?: ThemePreference;
      preference?: ThemePreference;
      activeMode?: ResolvedTheme;
    }
  | undefined;

const useThemePreferenceStore = create<ThemePreferenceState>()(
  persist(
    (set) => ({
      preference: "auto",
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: "theme",
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState) => {
        const state = persistedState as PersistedThemeState;
        const preference =
          state?.preference ??
          state?.themePreference ??
          (state?.activeMode === "light" || state?.activeMode === "dark"
            ? state.activeMode
            : "auto");

        return { preference };
      },
    },
  ),
);

export type UseThemeResult = {
  colors: ThemeColors;
  mode: ResolvedTheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  navigationTheme: (typeof appThemes)[ResolvedTheme]["navigationTheme"];
};

/** Single source for the active palette and the user's theme preference. */
export default function useTheme(): UseThemeResult {
  const preference = useThemePreferenceStore((state) => state.preference);
  const setPreference = useThemePreferenceStore((state) => state.setPreference);
  const systemScheme = useColorScheme();

  const mode: ResolvedTheme =
    preference === "auto" ? (systemScheme === "light" ? "light" : "dark") : preference;
  const { colors, navigationTheme } = appThemes[mode];

  return { colors, mode, preference, setPreference, navigationTheme };
}
