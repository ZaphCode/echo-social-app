import { useEffect, useState } from "react";
import { Alert, StyleSheet, Switch, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useSqlViewerPreference from "@/hooks/useSqlViewerPreference";
import useTheme from "@/hooks/useTheme";
import useAppNavigation from "@/navigation/useAppNavigation";
import { ThemePreference } from "@/theme/theme";
import { NOTIFICATIONS_KEY } from "@/utils/constants";
import InfoRow, { InfoGroup } from "./InfoRow";
import Segmented from "./ui/Segmented";
import Text from "./ui/Text";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];

export default function ProfileConfigSection() {
  const nav = useAppNavigation();
  const { colors, preference, setPreference } = useTheme();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [loading, setLoading] = useState(true);
  const {
    enabled: sqlViewerEnabled,
    loading: sqlViewerLoading,
    setSqlViewerEnabled,
  } = useSqlViewerPreference();

  useEffect(() => {
    AsyncStorage.getItem(NOTIFICATIONS_KEY)
      .then((value) => {
        if (value !== null) setNotificationsOn(value === "true");
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const toggleNotifications = async (next: boolean) => {
    setNotificationsOn(next);
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, String(next));
    } catch {
      setNotificationsOn(!next);
      Alert.alert("No se pudo guardar", "Intenta de nuevo más tarde.");
    }
  };

  const toggleSqlViewer = async (next: boolean) => {
    try {
      await setSqlViewerEnabled(next);
    } catch {
      Alert.alert("No se pudo guardar", "Intenta de nuevo más tarde.");
    }
  };

  const switchProps = {
    trackColor: { false: colors.surface3, true: colors.accent },
    thumbColor: "#FFFFFF",
    ios_backgroundColor: colors.surface3,
  };

  return (
    <InfoGroup title="Preferencias">
      <InfoRow
        icon="bell"
        label="Notificaciones"
        trailing={
          <Switch {...switchProps} value={notificationsOn} onValueChange={toggleNotifications} disabled={loading} />
        }
      />
      <View style={[styles.themeRow, { borderBottomColor: colors.line }]}>
        <Text variant="caption" tone="subtle">
          Apariencia
        </Text>
        <Segmented size="sm" value={preference} onChange={setPreference} options={THEME_OPTIONS} />
      </View>
      <InfoRow icon="shield" label="Privacidad" onPress={nav.privacy} />
      <InfoRow
        icon="database"
        label="SQL Viewer (debug)"
        last
        trailing={
          <Switch
            {...switchProps}
            value={sqlViewerEnabled}
            onValueChange={toggleSqlViewer}
            disabled={sqlViewerLoading}
          />
        }
      />
    </InfoGroup>
  );
}

const styles = StyleSheet.create({
  themeRow: {
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: 1,
  },
});
