import { useColorScheme as useNativeColorScheme } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  appThemes,
  AppTheme,
  ResolvedTheme,
  ThemePreference,
} from "@/theme/theme";

type ThemePreferenceState = {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
};

type PersistedThemeState =
  | {
      themePreference?: ThemePreference;
      activeMode?: ResolvedTheme;
    }
  | undefined;

const useThemePreferenceStore = create<ThemePreferenceState>()(
  persist(
    (set) => ({
      themePreference: "auto",
      setThemePreference: (themePreference) => set({ themePreference }),
    }),
    {
      name: "theme",
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState) => {
        const state = persistedState as PersistedThemeState;

        if (!state) {
          return { themePreference: "auto" };
        }

        if (state.themePreference) {
          return { themePreference: state.themePreference };
        }

        if (state.activeMode === "light" || state.activeMode === "dark") {
          return { themePreference: state.activeMode };
        }

        return { themePreference: "auto" };
      },
    },
  ),
);

type UseAppThemeResult = {
  theme: AppTheme;
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (preference: ThemePreference) => void;
};

export default function useAppTheme(): UseAppThemeResult {
  const preference = useThemePreferenceStore((state) => state.themePreference);
  const setThemePreference = useThemePreferenceStore(
    (state) => state.setThemePreference,
  );
  const nativeColorScheme = useNativeColorScheme();

  const resolvedTheme: ResolvedTheme =
    preference === "auto"
      ? nativeColorScheme === "light"
        ? "light"
        : "dark"
      : preference;

  return {
    theme: appThemes[resolvedTheme],
    preference,
    resolvedTheme,
    setThemePreference,
  };
}
