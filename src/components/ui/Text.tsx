import { Text as RNText, TextProps } from "react-native";

import useTheme from "@/hooks/useTheme";
import { fonts, ThemeColors, typeScale, TypeVariant } from "@/theme/theme";

type Tone = "default" | "muted" | "subtle" | "accent" | "danger" | "success" | "done" | "onAccent";

type Props = TextProps & {
  variant?: TypeVariant;
  bold?: boolean;
  tone?: Tone;
  /** Raw color; wins over `tone`. */
  color?: string;
  align?: "left" | "center" | "right";
};

const toneKey: Record<Tone, keyof ThemeColors> = {
  default: "text",
  muted: "textMuted",
  subtle: "textSubtle",
  accent: "accentText",
  danger: "danger",
  success: "success",
  done: "done",
  onAccent: "onAccent",
};

export default function Text({
  variant = "body",
  bold,
  tone = "default",
  color,
  align,
  style,
  ...rest
}: Props) {
  const { colors } = useTheme();
  const [fontSize, lineHeight] = typeScale[variant];
  const isHeading = variant === "display" || variant === "title" || variant === "heading";

  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: bold ?? isHeading ? fonts.bold : fonts.regular,
          fontSize,
          lineHeight,
          color: color ?? colors[toneKey[tone]],
          letterSpacing: isHeading ? -0.3 : 0,
          textAlign: align,
        },
        style,
      ]}
    />
  );
}
