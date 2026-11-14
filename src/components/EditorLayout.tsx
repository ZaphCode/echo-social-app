import { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useTheme from "@/hooks/useTheme";
import useAppNavigation from "@/navigation/useAppNavigation";
import { space } from "@/theme/theme";
import IconButton from "./ui/IconButton";
import { KeyboardAwareScrollView, useKeyboardInset } from "./ui/KeyboardAware";
import Text from "./ui/Text";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
};

/** Modal form screen (publicar / editar): close button, scrolling body, sticky CTA. */
export default function EditorLayout({ title, subtitle, children, footer }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const nav = useAppNavigation();
  const topInset = Platform.OS === "ios" ? space.md : insets.top + space.xs;

  return (
    <View style={[styles.fill, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingTop: topInset }]}>
        <IconButton icon="x" accessibilityLabel="Cerrar" onPress={nav.back} />
        <View style={styles.headerText}>
          <Text variant="heading">{title}</Text>
          {subtitle ? (
            <Text variant="caption" tone="subtle">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        footer={<Footer>{footer}</Footer>}
      >
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}

/** Sticky CTA bar; sits right on the keyboard while it is open. */
function Footer({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  // The keyboard already covers the home indicator / nav bar.
  const keyboardOpen = useKeyboardInset() > 0;

  return (
    <View
      style={[
        styles.footer,
        {
          borderTopColor: colors.line,
          paddingBottom: keyboardOpen ? space.sm : Math.max(insets.bottom, space.md),
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: space.gutter,
    paddingBottom: space.sm,
  },
  headerText: {
    flex: 1,
  },
  body: {
    paddingHorizontal: space.gutter,
    paddingTop: space.sm,
    paddingBottom: space.xl,
    gap: 18,
  },
  footer: {
    paddingHorizontal: space.gutter,
    paddingTop: space.sm,
    borderTopWidth: 1,
  },
});
