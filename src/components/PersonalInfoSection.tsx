import { useEffect, useState } from "react";

import EditProfileView from "@/components/EditProfileView";
import InfoRow, { InfoGroup } from "@/components/InfoRow";
import { SlideModal } from "@/components/ui/SlideModal";
import useModal from "@/hooks/useModal";
import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { User } from "@/models/User";

type Props = {
  user: User;
  profile: ClientProfile | ProviderProfile;
  editable?: boolean;
};

const OFFLINE_PLACEHOLDER = "Disponible cuando vuelvas a conectarte";

export default function PersonalInfoSection({ user, profile, editable }: Props) {
  const [modalVisible, openModal, closeModal] = useModal();
  const [optimisticProfile, setOptimisticProfile] = useState(profile);
  const { address, phone, city, state, zip } = optimisticProfile;

  useEffect(() => {
    setOptimisticProfile(profile);
  }, [profile]);

  const fallback = editable ? "" : OFFLINE_PLACEHOLDER;
  const addressValue =
    [
      ...[address, city, state].map((part) => part.trim()).filter(Boolean),
      zip.trim() ? `CP ${zip.trim()}` : "",
    ]
      .filter(Boolean)
      .join(", ") || fallback;

  return (
    <>
      <InfoGroup title="Información personal" onEdit={editable ? openModal : undefined}>
        <InfoRow icon="mail" label="Correo" value={user.email} />
        <InfoRow icon="phone" label="Teléfono" value={phone.trim() || fallback} />
        <InfoRow icon="map-pin" label="Dirección" value={addressValue} last />
      </InfoGroup>
      {editable && (
        <SlideModal visible={modalVisible} onClose={closeModal}>
          <EditProfileView
            profile={optimisticProfile}
            userId={user.id}
            userRole={user.role}
            onSuccess={(newData) => {
              setOptimisticProfile(newData);
              closeModal();
            }}
          />
        </SlideModal>
      )}
    </>
  );
}
