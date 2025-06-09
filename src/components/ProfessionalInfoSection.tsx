import { View, StyleSheet, Pressable } from "react-native";
import { Feather, Foundation } from "@expo/vector-icons";
import { useState } from "react";

import { theme } from "@/theme/theme";
import { ProviderProfile } from "@/models/ProviderProfile";
import { SlideModal } from "./ui/SlideModal";
import Text from "@/components/ui/Text";
import InfoRow from "./InfoRow";
import useModal from "@/hooks/useModal";
import EditProviderInfoView from "./EditProviderInfoView";

interface Props {
  providerProfile: ProviderProfile;
  editable?: boolean;
}

const weekDays = [
  { key: "SUN", label: "Dom" },
  { key: "MON", label: "Lun" },
  { key: "TUE", label: "Mar" },
  { key: "WED", label: "Mié" },
  { key: "THU", label: "Jue" },
  { key: "FRI", label: "Vie" },
  { key: "SAT", label: "Sáb" },
];

export default function ProfessionalInfoSection({
  providerProfile,
  editable,
}: Props) {
  const [modalVisible, openModal, closeModal] = useModal();
  const [optimisticProfile, setOptimisticProfile] = useState(providerProfile);

  const { available_days, experience_years } = optimisticProfile;
  const specialty = optimisticProfile.expand?.specialty?.name;

  const experience_years_value = `${experience_years} ${
    experience_years === 1 ? "año" : "años"
  }`;

  return (
    <View style={styles.block}>
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Foundation
            name="torso-business"
            size={28}
            color={theme.colors.primaryBlue}
          />
          <Text fontFamily="bold" color="white" size={theme.fontSizes.lg - 2.5}>
            Información Profesional
          </Text>
        </View>
        {editable && (
          <Pressable style={styles.editButton} onPress={openModal}>
            <Feather name="edit-2" size={16} color={theme.colors.primaryBlue} />
            <Text
              color={theme.colors.primaryBlue}
              style={styles.editButtonText}
            >
              Editar
            </Text>
          </Pressable>
        )}
      </View>
      {specialty && (
        <InfoRow label="Especialidad" value={specialty} icon="briefcase" />
      )}
      <InfoRow
        label="Experiencia"
        value={experience_years_value}
        icon="calendar"
      />
      <View style={{ marginTop: 12, marginBottom: 12 }}>
        <View style={styles.labelContainer}>
          <Feather
            name={"check-square"}
            size={20}
            color={theme.colors.lightGray}
          />
          <Text style={styles.label}>Días disponibles</Text>
        </View>
        <View style={styles.daysRow}>
          {weekDays.map((d) => {
            const selected = available_days?.includes(d.key);
            return (
              <View key={d.key} style={styles.dayCol}>
                {selected ? (
                  <Feather
                    name="check"
                    size={16}
                    color={theme.colors.secondaryBlue}
                    style={{ marginBottom: 2 }}
                  />
                ) : (
                  <View style={{ height: 16, marginBottom: 2 }} />
                )}
                <Text
                  style={[styles.dayText, selected && styles.dayTextActive]}
                >
                  {d.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      {editable && (
        <SlideModal visible={modalVisible} onClose={closeModal}>
          <EditProviderInfoView
            providerProfile={optimisticProfile}
            onSuccess={(data) => {
              setOptimisticProfile(data);
              closeModal();
            }}
          />
        </SlideModal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  block: {
    backgroundColor: theme.colors.darkerGray,
    borderRadius: 16,
    padding: 26,
    width: "90%",
    marginTop: 20,
    marginBottom: 8,
    gap: 10,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    marginTop: 2,
    marginBottom: 2,
    alignItems: "flex-end",
  },
  dayCol: {
    alignItems: "center",
    width: 37,
  },
  dayText: {
    color: "white",
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    textAlign: "center",
  },
  dayTextActive: {
    color: theme.colors.primaryBlue,
    fontFamily: theme.fontFamily.bold,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  label: { fontSize: theme.fontSizes.md },
  value: { fontSize: theme.fontSizes.md, marginLeft: 28, marginTop: 5 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editButton: { flexDirection: "row", alignItems: "center", gap: 5 },
  editButtonText: { fontSize: theme.fontSizes.sm, fontWeight: "600" },
});
