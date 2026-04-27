import useAppTheme from "@/hooks/useAppTheme";
import { theme } from "../../theme/theme";
import { Text as RNText, TextProps } from "react-native";

type FontFamily = keyof typeof theme.fontFamily;

type Props = {
  fontFamily?: FontFamily;
  color?: string;
  children?: string;
  size?: number;
} & TextProps;

export default function Text({
  fontFamily,
  color,
  children,
  style,
  size,
  ...rest
}: Props) {
  const { theme: appTheme } = useAppTheme();
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: fontFamily
            ? theme.fontFamily[fontFamily]
            : theme.fontFamily.regular,
          color: color ?? appTheme.colors.text,
          fontSize: size ?? theme.fontSizes.md,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
