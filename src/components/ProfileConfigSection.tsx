import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Text from "@/components/ui/Text";
import { theme } from "@/theme/theme";
import { useNavigation } from "@react-navigation/native";

export default function ProfileConfigSection() {
  const navigation = useNavigation();

  const goToPrivacy = () => {
    navigation.navigate("Main", { screen: "Privacy" });
  };

  return (
    <View style={styles.infoContainer}>
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Feather name="settings" size={20} color={theme.colors.primaryBlue} />
          <Text fontFamily="bold" color="white" size={theme.fontSizes.lg}>
            Configuración
          </Text>
        </View>
      </View>
      <Pressable
        style={styles.settingRow}
        onPress={() => console.log("Notifications")}
      >
        <View style={styles.labelContainer}>
          <Feather name="bell" size={20} color={theme.colors.lightGray} />
          <Text color="white" style={styles.settingLabel}>
            Notificaciones
          </Text>
        </View>
        <Feather
          name="chevron-right"
          size={20}
          color={theme.colors.lightGray}
        />
      </Pressable>
      <Pressable style={styles.settingRow} onPress={goToPrivacy}>
        <View style={styles.labelContainer}>
          <Feather name="lock" size={20} color={theme.colors.lightGray} />
          <Text color="white" style={styles.settingLabel}>
            Privacidad
          </Text>
        </View>
        <Feather
          name="chevron-right"
          size={20}
          color={theme.colors.lightGray}
        />
      </Pressable>
      <Pressable style={styles.settingRow} onPress={() => console.log("Help")}>
        <View style={styles.labelContainer}>
          <Feather
            name="help-circle"
            size={20}
            color={theme.colors.lightGray}
          />
          <Text color="white" style={styles.settingLabel}>
            Ayuda
          </Text>
        </View>
        <Feather
          name="chevron-right"
          size={20}
          color={theme.colors.lightGray}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    width: "90%",
    backgroundColor: theme.colors.darkerGray,
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
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingLabel: {
    fontSize: theme.fontSizes.md,
  },
});
