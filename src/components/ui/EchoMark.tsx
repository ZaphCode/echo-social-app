import { Image } from "expo-image";

import useTheme from "@/hooks/useTheme";

const LOGO_LIGHT_TEXT = require("@Assets/app-logo-mark-white.png");
const LOGO_DARK_TEXT = require("@Assets/app-logo-mark-black.png");

/** Width / height of the cropped logo assets (1300×460). */
const ASPECT = 1300 / 460;

type Props = { height?: number };

/**
 * The original "echo" logo (assets/app-logo-*.png, cropped to the wordmark).
 * White text on the dark theme, black text on the light theme.
 */
export default function EchoMark({ height = 26 }: Props) {
  const { mode } = useTheme();
  const boxHeight = height * 1.25;

  return (
    <Image
      accessibilityRole="header"
      accessibilityLabel="echo"
      source={mode === "dark" ? LOGO_LIGHT_TEXT : LOGO_DARK_TEXT}
      style={{ height: boxHeight, width: boxHeight * ASPECT }}
      contentFit="contain"
    />
  );
}
