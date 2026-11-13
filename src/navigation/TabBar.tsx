import { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthCtx } from "@/context/Auth";
import useModal from "@/hooks/useModal";
import useTheme from "@/hooks/useTheme";
import { radius, space } from "@/theme/theme";
import { SlideModal } from "@/components/ui/SlideModal";
import Text from "@/components/ui/Text";
import useAppNavigation from "./useAppNavigation";

type FeatherName = ComponentProps<typeof Feather>["name"];

const TABS: Record<string, { label: string; icon: FeatherName }> = {
  Home: { label: "Inicio", icon: "home" },
  Requests: { label: "Solicitudes", icon: "message-square" },
  Map: { label: "Mapa", icon: "map" },
  Profile: { label: "Perfil", icon: "user" },
};

type Props = BottomTabBarProps & { requestsDot?: boolean };

/** Floating pill tab bar with the central "+ Publicar" button. */
export default function TabBar({ state, navigation, requestsDot }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [publishVisible, openPublish, closePublish] = useModal();

  const renderTab = (index: number) => {
    const route = state.routes[index];
    const meta = TABS[route.name];
    const focused = state.index === index;
    const color = focused ? colors.accentText : colors.textSubtle;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };

    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={meta.label}
        onPress={onPress}
        style={styles.tab}
      >
        <View>
          <Feather name={meta.icon} size={22} color={color} />
          {route.name === "Requests" && requestsDot ? (
            <View style={[styles.dot, { backgroundColor: colors.danger, borderColor: colors.surface }]} />
          ) : null}
        </View>
        <Text variant="micro" bold color={color}>
          {meta.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <>
      <View
        pointerEvents="box-none"
        style={[styles.wrap, { paddingBottom: Math.max(insets.bottom - 6, space.sm) }]}
      >
        <View
          style={[
            styles.bar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.line,
              boxShadow: "0 18px 40px -16px rgba(0,0,0,0.55)",
            },
          ]}
        >
          {renderTab(0)}
          {renderTab(1)}
          <View style={styles.tab}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Publicar"
              onPress={openPublish}
              style={({ pressed }) => [
                styles.fab,
                {
                  backgroundColor: colors.accent,
                  boxShadow: `0 0 0 6px ${colors.bg}, 0 10px 26px -6px ${colors.accentGlow}`,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                },
              ]}
            >
              <Feather name="plus" size={28} color={colors.onAccent} />
            </Pressable>
          </View>
          {renderTab(2)}
          {renderTab(3)}
        </View>
      </View>
      <SlideModal visible={publishVisible} onClose={closePublish}>
        <PublishSheet onDone={closePublish} />
      </SlideModal>
    </>
  );
}

function PublishSheet({ onDone }: { onDone: () => void }) {
  const { user } = useAuthCtx();
  const nav = useAppNavigation();

  const go = (action: () => void) => {
    onDone();
    action();
  };

  return (
    <View style={styles.sheet}>
      <Text variant="title">¿Qué quieres publicar?</Text>
      {user.role === "provider" && (
        <PublishOption
          icon="tool"
          title="Un servicio"
          body="Ofrece tu trabajo con precio base. Los clientes te envían solicitudes."
          onPress={() => go(() => nav.editService())}
        />
      )}
      <PublishOption
        icon="briefcase"
        title="Una contratación"
        body="Describe lo que necesitas y tu presupuesto. Los profesionales aplican."
        onPress={() => go(() => nav.editContracting())}
      />
    </View>
  );
}

function PublishOption({
  icon,
  title,
  body,
  onPress,
}: {
  icon: FeatherName;
  title: string;
  body: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        { backgroundColor: colors.surface2, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.optionIcon, { backgroundColor: colors.accentSoft }]}>
        <Feather name={icon} size={22} color={colors.accentText} />
      </View>
      <View style={styles.optionText}>
        <Text bold>{title}</Text>
        <Text variant="label" tone="muted">
          {body}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.textSubtle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.md,
  },
  bar: {
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: "100%",
  },
  dot: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginTop: -30,
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    gap: space.sm,
    paddingBottom: space.xs,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.card,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
});
