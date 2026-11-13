import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Control, Controller } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import * as Loc from "expo-location";

import MapView, { MapViewHandle } from "@/components/map/MapView";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import useTheme from "@/hooks/useTheme";
import useUserLocation from "@/hooks/useUserLocation";
import { radius, space } from "@/theme/theme";
import { Coords } from "@/utils/geo";

// Mexico City, only used when neither the device nor the profile has a point.
const FALLBACK_CENTER: Coords = { lat: 19.4326, lon: -99.1332 };

type Props = {
  control: Control<any>;
  name: string;
  label?: string;
  disabled?: boolean;
};

export default function LocationPickerField({
  control,
  name,
  label = "Ubicación del trabajo",
  disabled = false,
}: Props) {
  const { colors } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <View>
          <Text variant="label" bold tone="muted" style={styles.label}>
            {label}
          </Text>
          <Pressable
            disabled={disabled}
            onPress={() => setPickerOpen(true)}
            style={[
              styles.row,
              { backgroundColor: colors.surface, borderColor: colors.line, opacity: disabled ? 0.6 : 1 },
            ]}
          >
            <Feather
              name="map-pin"
              size={20}
              color={value ? colors.accentText : colors.textSubtle}
            />
            <View style={styles.rowText}>
              <LocationSummary coords={value ?? null} />
              <Text variant="caption" tone="subtle">
                {disabled
                  ? "Necesitas conexión para cambiar la ubicación"
                  : "Otros usuarios solo verán la zona aproximada"}
              </Text>
            </View>
            {!disabled && (
              <Feather name="chevron-right" size={20} color={colors.textSubtle} />
            )}
          </Pressable>

          <LocationPickerModal
            visible={pickerOpen}
            initial={value ?? null}
            onClose={() => setPickerOpen(false)}
            onClear={() => {
              onChange(null);
              setPickerOpen(false);
            }}
            onConfirm={(coords) => {
              onChange(coords);
              setPickerOpen(false);
            }}
          />
        </View>
      )}
    />
  );
}

function LocationSummary({ coords }: { coords: Coords | null }) {
  const { colors } = useTheme();
  const [placeName, setPlaceName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPlaceName(null);
    if (!coords) return;

    Loc.reverseGeocodeAsync({ latitude: coords.lat, longitude: coords.lon })
      .then(([place]) => {
        if (cancelled || !place) return;
        const parts = [place.district || place.street, place.city]
          .map((part) => part?.trim())
          .filter(Boolean);
        setPlaceName(parts.join(", ") || null);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [coords?.lat, coords?.lon]);

  if (!coords) {
    return (
      <Text color={colors.text}>Sin ubicación (no aparecerá en el mapa)</Text>
    );
  }

  return <Text color={colors.text}>{placeName ?? "Ubicación seleccionada"}</Text>;
}

type ModalProps = {
  visible: boolean;
  initial: Coords | null;
  onClose: () => void;
  onClear: () => void;
  onConfirm: (coords: Coords) => void;
};

function LocationPickerModal({
  visible,
  initial,
  onClose,
  onClear,
  onConfirm,
}: ModalProps) {
  const { colors, mode } = useTheme();
  const { coords: userCoords, status, refresh } = useUserLocation();
  const mapRef = useRef<MapViewHandle>(null);
  const start = initial ?? userCoords ?? FALLBACK_CENTER;
  const [center, setCenter] = useState<Coords>(start);

  useEffect(() => {
    if (visible) setCenter(start);
  }, [visible]);

  const goToMyLocation = async () => {
    const coords = (await refresh({ request: true })) ?? userCoords;
    if (coords) {
      mapRef.current?.moveTo(coords, 16);
      setCenter(coords);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.modal, { backgroundColor: colors.bg }]}
        edges={["bottom"]}
      >
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text bold tone="accent">Cancelar</Text>
          </Pressable>
          <Text bold>Ubicación del trabajo</Text>
          <Pressable onPress={onClear} hitSlop={12} disabled={!initial}>
            <Text bold color={initial ? colors.danger : colors.textSubtle}>
              Quitar
            </Text>
          </Pressable>
        </View>

        <View style={styles.mapContainer}>
          {visible && (
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              initialCenter={start}
              initialZoom={initial ? 16 : 14}
              showUserLocation={status === "granted"}
              darkMode={mode === "dark"}
              accentColor={colors.accent}
              onRegionChange={(region) => setCenter(region.center)}
            />
          )}
          <View pointerEvents="none" style={styles.centerPin}>
            <Feather name="map-pin" size={36} color={colors.accent} />
          </View>
          <Pressable
            onPress={goToMyLocation}
            style={[styles.myLocation, { backgroundColor: colors.surface }]}
          >
            <Feather name="crosshair" size={20} color={colors.accentText} />
          </Pressable>
        </View>

        <View style={styles.modalFooter}>
          <Text variant="caption" tone="subtle">
            Mueve el mapa para colocar el pin donde se hará el trabajo. Se
            publicará solo la zona aproximada (~500 m).
          </Text>
          <Button title="Usar esta ubicación" onPress={() => onConfirm(center)} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    borderRadius: radius.input,
    borderWidth: 1,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: space.md,
  },
  mapContainer: {
    flex: 1,
  },
  centerPin: {
    position: "absolute",
    top: "50%",
    left: "50%",
    // Anchor the pin's tip (bottom center of the icon) on the map center.
    marginLeft: -18,
    marginTop: -36,
  },
  myLocation: {
    position: "absolute",
    right: space.md,
    bottom: space.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  modalFooter: {
    padding: space.md,
    gap: space.md,
  },
});
