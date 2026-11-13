import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { ProviderProfileWithCategory } from "@/api/types";
import useModal from "@/hooks/useModal";
import useTheme from "@/hooks/useTheme";
import { radius } from "@/theme/theme";
import EditProviderInfoView from "./EditProviderInfoView";
import { WEEK_DAYS } from "./forms/WeekdaysPicker";
import InfoRow, { InfoGroup } from "./InfoRow";
import { SlideModal } from "./ui/SlideModal";
import Text from "./ui/Text";

type Props = {
  providerProfile: ProviderProfileWithCategory;
  userId?: string;
  editable?: boolean;
};

const OFFLINE_PLACEHOLDER = "Disponible cuando vuelvas a conectarte";

export default function ProfessionalInfoSection({ providerProfile, userId, editable }: Props) {
  const { colors } = useTheme();
  const [modalVisible, openModal, closeModal] = useModal();
  const [profile, setProfile] = useState(providerProfile);

  useEffect(() => {
    setProfile(providerProfile);
  }, [providerProfile]);

  const { available_days = [], experience_years, description } = profile;
  const specialty = profile.specialty_category?.name;
  const experience =
    experience_years > 0 || editable
      ? `${experience_years} ${experience_years === 1 ? "año" : "años"}`
      : OFFLINE_PLACEHOLDER;

  return (
    <>
      <InfoGroup title="Información profesional" onEdit={editable ? openModal : undefined}>
        {description?.trim() ? (
          <View style={[styles.about, { borderBottomColor: colors.line }]}>
            <Text variant="label" tone="muted">
              {description}
            </Text>
          </View>
        ) : null}
        <InfoRow icon="tag" label="Especialidad" value={specialty || (editable ? "" : OFFLINE_PLACEHOLDER)} />
        <InfoRow icon="award" label="Experiencia" value={experience} />
        <View style={styles.daysBlock}>
          <Text variant="caption" tone="subtle">
            Días disponibles
          </Text>
          <View style={styles.days}>
            {WEEK_DAYS.map((day) => {
              const on = available_days.includes(day.key);
              return (
                <View
                  key={day.key}
                  accessibilityLabel={`${day.label}: ${on ? "disponible" : "no disponible"}`}
                  style={[styles.day, { backgroundColor: on ? colors.accentSoft : colors.surface2 }]}
                >
                  <Text variant="caption" bold color={on ? colors.accentText : colors.textSubtle}>
                    {day.short}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </InfoGroup>
      {editable && (
        <SlideModal visible={modalVisible} onClose={closeModal}>
          <EditProviderInfoView
            providerProfile={profile}
            userId={userId ?? providerProfile.user}
            onSuccess={(data) => {
              setProfile(data);
              closeModal();
            }}
          />
        </SlideModal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  about: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  daysBlock: {
    paddingVertical: 14,
    gap: 10,
  },
  days: {
    flexDirection: "row",
    gap: 6,
  },
  day: {
    flex: 1,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
