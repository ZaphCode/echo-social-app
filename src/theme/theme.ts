import { Platform } from "react-native";

export const theme = {
  colors: {
    primaryBlue: "#63C3FFFF",
    secondaryBlue: "#1D4C88",
    background: "#111315",
    darkGray: "#28292B",
    darkerGray: "#1C1D1F",
    lightGray: "#7B7C7C",
    redError: "#FF6959",
    successGreen: "#00B86BFF",
    completePurple: "#A45EE5FF",
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
};
