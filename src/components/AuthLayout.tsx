import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useTheme from "@/hooks/useTheme";
import { space } from "@/theme/theme";
import IconButton from "./ui/IconButton";
import { KeyboardAwareScrollView } from "./ui/KeyboardAware";
import Text from "./ui/Text";

type Props = {
  step?: { current: number; total: number };
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  canGoBack?: boolean;
};

/** Registration steps: back button, step bar, title and a scrolling form. */
export default function AuthLayout({ step, title, subtitle, children, footer, canGoBack = true }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <KeyboardAwareScrollView
      containerStyle={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.xs, paddingBottom: insets.bottom + space.lg },
      ]}
      showsVerticalScrollIndicator={false}
    >
        <View style={styles.topRow}>
          {canGoBack ? (
            <IconButton icon="chevron-left" accessibilityLabel="Volver" onPress={navigation.goBack} />
          ) : (
            <View />
          )}
          {step ? (
            <View style={styles.steps} accessibilityLabel={`Paso ${step.current} de ${step.total}`}>
              {Array.from({ length: step.total }, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepBar,
                    { backgroundColor: index < step.current ? colors.accent : colors.surface3 },
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.heading}>
          {step ? (
            <Text variant="label" bold tone="accent">
              {`Paso ${step.current} de ${step.total}`}
            </Text>
          ) : null}
          <Text variant="display">{title}</Text>
          {subtitle ? <Text tone="muted">{subtitle}</Text> : null}
        </View>

        <View style={styles.body}>{children}</View>
        {footer}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: space.gutter,
    gap: space.lg,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  steps: {
    flexDirection: "row",
    gap: 6,
  },
  stepBar: {
    width: 28,
    height: 5,
    borderRadius: 3,
  },
  heading: {
    gap: 6,
  },
  body: {
    gap: 16,
  },
});
