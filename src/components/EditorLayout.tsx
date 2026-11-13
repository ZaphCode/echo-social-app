import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useTheme from "@/hooks/useTheme";
import useAppNavigation from "@/navigation/useAppNavigation";
import { space } from "@/theme/theme";
import IconButton from "./ui/IconButton";
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
    <KeyboardAvoidingView
      style={[styles.fill, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      <View
        style={[
          styles.footer,
          { borderTopColor: colors.line, paddingBottom: Math.max(insets.bottom, space.md) },
        ]}
      >
        {footer}
      </View>
    </KeyboardAvoidingView>
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
