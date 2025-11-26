import { Platform } from "react-native";

export const theme = {
  colors: {
    primaryBlue: "#63C3FFFF",
    secondaryBlue: "#1D4C88",
    redError: "#FF4C4C",
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
