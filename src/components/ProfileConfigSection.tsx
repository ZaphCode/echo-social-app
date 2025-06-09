import React, { useState } from "react";
import { View, Pressable, StyleSheet, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import Text from "@/components/ui/Text";
import { theme } from "@/theme/theme";
import HelpFormModal from "./HelpFormModal";
import PrivacyContractModal from "./PrivacyContractModal";

export default function ProfileConfigSection() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleNotifications = () => {
    setNotificationsEnabled(prev => !prev);
    // Here you would typically also update the actual notification settings
    // For example, call an API or update local storage
    console.log("Notifications:", notificationsEnabled ? "disabled" : "enabled");
  };

  return (
    <>
      <View style={styles.infoContainer}>
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Feather name="settings" size={20} color={theme.colors.primaryBlue} />
            <Text fontFamily="bold" color="white" size={theme.fontSizes.lg}>
              Configuración
            </Text>
          </View>
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.labelContainer}>
            <Feather name="bell" size={20} color={theme.colors.lightGray} />
            <Text color="white" style={styles.settingLabel}>
              Notificaciones
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ 
              false: theme.colors.darkGray, 
              true: theme.colors.primaryBlue 
            }}
            thumbColor={notificationsEnabled ? "white" : theme.colors.lightGray}
            ios_backgroundColor={theme.colors.darkGray}
          />
        </View>
        
        <Pressable
          style={styles.settingRow}
          onPress={() => setShowPrivacyModal(true)}
        >
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
        
        <Pressable 
          style={styles.settingRow} 
          onPress={() => setShowHelpModal(true)}
        >
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

      <HelpFormModal 
        visible={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />
      
      <PrivacyContractModal 
        visible={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />
    </>
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
