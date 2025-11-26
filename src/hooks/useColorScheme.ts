import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState = {
  activeMode: "dark" as "light" | "dark",
  colors: {
    primaryBlue: "#63C3FFFF",
    secondaryBlue: "#1D4C88",
    background: "#111315",
    darkGray: "#28292B",
    darkerGray: "#1C1D1F",
    lightGray: "#7B7C7C",
    text: "#FFFFFF",
    redError: "#FF6959",
    successGreen: "#00B86BFF",
    completePurple: "#A45EE5FF",
  },
};

type ThemeState = {
  activeMode: "light" | "dark";
  colors: typeof initialState.colors;
  setLightMode: () => void;
  setDarkMode: () => void;
};

const useColorScheme = create<ThemeState>()(
  persist(
    (set) => ({
      ...initialState,
      setLightMode: () =>
        set(() => ({
          activeMode: "light",
          colors: {
            primaryBlue: "#63C3FFFF",
            secondaryBlue: "#1D4C88",
            background: "#E4E3E3FF",
            darkGray: "#E9E9E9FF",
            darkerGray: "#EFEFEFFF",
            lightGray: "#7B7C7C",
            text: "#000000",
            redError: "#FF6959",
            successGreen: "#00B86BFF",
            completePurple: "#A45EE5FF",
          },
        })),
      setDarkMode: () =>
        set(() => ({
          activeMode: "dark",
          colors: {
            primaryBlue: "#63C3FFFF",
            secondaryBlue: "#1D4C88",
            background: "#111315",
            darkGray: "#28292B",
            darkerGray: "#1C1D1F",
            lightGray: "#7B7C7C",
            text: "#FFFFFF",
            redError: "#FF6959",
            successGreen: "#00B86BFF",
            completePurple: "#A45EE5FF",
          },
        })),
    }),
    {
      name: "theme",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useColorScheme;
