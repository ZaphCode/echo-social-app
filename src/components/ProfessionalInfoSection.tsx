import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { theme } from "@/theme/theme";
import { ProviderProfile } from "@/models/ProviderProfile";
import { SlideModal } from "./ui/SlideModal";
import Text from "@/components/ui/Text";
import InfoRow from "./InfoRow";
import Divider from "./ui/Divider";
import useModal from "@/hooks/useModal";
import EditProviderInfoView from "./EditProviderInfoView";

interface Props {
  providerProfile: ProviderProfile;
  editable?: boolean;
}

const weekDays = [
  { key: "MON", label: "Lun" },
  { key: "TUE", label: "Mar" },
  { key: "WED", label: "Mié" },
  { key: "THU", label: "Jue" },
  { key: "FRI", label: "Vie" },
  { key: "SAT", label: "Sáb" },
  { key: "SUN", label: "Dom" },
];

export default function ProfessionalInfoSection({
  providerProfile,
  editable,
}: Props) {
  const specialty = providerProfile.expand?.specialty?.name;
  const rating = 0;

  const [modalVisible, openModal, closeModal] = useModal();

  return (
    <View style={styles.block}>
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Feather name="archive" size={20} color={theme.colors.primaryBlue} />
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
      <View style={{ marginTop: 12, marginBottom: 12 }}>
        <View style={styles.labelContainer}>
          <Feather name={"calendar"} size={20} color={theme.colors.lightGray} />
          <Text style={styles.label}>Días disponibles</Text>
        </View>
        <View style={styles.daysRow}>
          {weekDays.map((d) => {
            const selected = providerProfile.available_days?.includes(d.key);
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
      <Divider size={3} />
      <View style={styles.numbersRow}>
        <StatBox
          label="Experiencia"
          value={`${providerProfile.experience_years} años`}
          icon="award"
        />
        <StatBox
          label="Servicios"
          value={providerProfile.jobs_done}
          icon="check-circle"
          iconColor={theme.colors.successGreen}
        />
        <StatBox
          label="Calif."
          value={typeof rating === "number" ? rating.toFixed(1) : "-"}
          icon="star"
          iconColor="#ffc700"
        />
      </View>
      {editable && (
        <SlideModal visible={modalVisible} onClose={closeModal}>
          <EditProviderInfoView providerProfile={providerProfile} />
        </SlideModal>
      )}
    </View>
  );
}

function StatBox({
  label,
  value,
  icon,
  iconColor,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  iconColor?: string;
}) {
  return (
    <View style={styles.statBox}>
      <Feather
        name={icon}
        size={18}
        color={iconColor || theme.colors.primaryBlue}
      />
      <Text
        fontFamily="bold"
        color="white"
        size={theme.fontSizes.lg}
        style={{ marginLeft: 4 }}
      >
        {`${value}`}
      </Text>
      <Text color={theme.colors.lightGray} size={theme.fontSizes.sm}>
        {label}
      </Text>
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
  numbersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 18,
    marginTop: 6,
    marginBottom: 4,
  },
  statBox: {
    alignItems: "center",
    gap: 2,
    flex: 1,
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
