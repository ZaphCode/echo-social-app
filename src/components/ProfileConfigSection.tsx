import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import {
  View,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Text from "@/components/ui/Text";
import { theme } from "@/theme/theme";
import { useNavigation } from "@react-navigation/native";
import { NOTIFICATIONS_KEY } from "@/utils/constants";
import useColorScheme from "@/hooks/useColorScheme";

export default function ProfileConfigSection() {
  const navigation = useNavigation();
  const { colors, activeMode, setDarkMode, setLightMode } = useColorScheme();
  const [notificationsOn, setNotificationOn] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
        if (value !== null) {
          setNotificationOn(value === "true");
        }
      } catch (e) {
        Alert.alert(
          "Error al cargar configuración",
          "Hubo un problema al cargar tu configuración de notificaciones. Por favor, intenta más tarde.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggle = async () => {
    try {
      const newValue = !notificationsOn;
      setNotificationOn(newValue);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, newValue.toString());
    } catch (e) {
      Alert.alert(
        "Error al guardar configuración",
        "Hubo un problema al guardar tu configuración de notificaciones. Por favor, intenta más tarde.",
      );
    }
  };

  const toggleTheme = () => {
    if (activeMode === "dark") {
      setLightMode();
    } else {
      setDarkMode();
    }
  };

  const goToPrivacy = () => {
    navigation.navigate("Main", { screen: "Privacy" });
  };

  return (
    <View
      style={{ ...styles.infoContainer, backgroundColor: colors.darkerGray }}
    >
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Feather name="settings" size={20} color={colors.primaryBlue} />
          <Text fontFamily="bold" color={colors.text} size={theme.fontSizes.lg}>
            Configuración
          </Text>
        </View>
      </View>
      <View style={[styles.settingRow, { borderBottomColor: colors.darkGray }]}>
        <View style={styles.labelContainer}>
          <Feather name="bell" size={20} color={colors.text} />
          <Text color={colors.text} style={styles.settingLabel}>
            Notificaciones
          </Text>
        </View>
        <Switch
          trackColor={{
            false: colors.lightGray,
            true: colors.primaryBlue,
          }}
          thumbColor={"white"}
          style={styles.switch}
          ios_backgroundColor={colors.lightGray}
          value={notificationsOn}
          onValueChange={handleToggle}
          disabled={loading}
        />
      </View>
      <View style={[styles.settingRow, { borderBottomColor: colors.darkGray }]}>
        <View style={styles.labelContainer}>
          <Feather name="moon" size={20} color={colors.text} />
          <Text color={colors.text} style={styles.settingLabel}>
            Modo Oscuro
          </Text>
        </View>
        <Switch
          trackColor={{
            false: colors.lightGray,
            true: colors.primaryBlue,
          }}
          thumbColor={"white"}
          style={styles.switch}
          ios_backgroundColor={colors.lightGray}
          value={activeMode === "dark"}
          onValueChange={toggleTheme}
          disabled={loading}
        />
      </View>
      <Pressable
        style={[styles.settingRow, { borderBottomColor: colors.darkGray }]}
        onPress={goToPrivacy}
      >
        <View style={styles.labelContainer}>
          <Feather name="lock" size={20} color={colors.text} />
          <Text color={colors.text} style={styles.settingLabel}>
            Privacidad
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.lightGray} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    width: "90%",
    borderRadius: 15,
    padding: 26,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingLabel: {
    fontSize: theme.fontSizes.md,
  },
  switch: {
    transform:
      Platform.OS === "ios"
        ? [{ scaleX: 0.75 }, { scaleY: 0.75 }]
        : [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
});
