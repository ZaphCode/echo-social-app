import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { StaticScreenProps } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import {
  contractingCoords,
  contractingsKeys,
  listContractingsInBounds,
} from "@/api/contractings";
import CategoryList from "@/components/CategoryList";
import MapView, { MapRegion, MapViewHandle } from "@/components/map/MapView";
import EmptyState from "@/components/ui/EmptyState";
import IconButton from "@/components/ui/IconButton";
import StorageImage from "@/components/ui/StorageImage";
import Text from "@/components/ui/Text";
import { useOffline } from "@/context/Offline";
import useTheme from "@/hooks/useTheme";
import useAppNavigation from "@/navigation/useAppNavigation";
import { ContractingWithOwner } from "@/api/types";
import { formatPrice } from "@/utils/format";
import useUserLocation from "@/hooks/useUserLocation";
import { radius, space, TAB_BAR_SPACE } from "@/theme/theme";
import {
  APPROXIMATE_RADIUS_M,
  boundsFromRegion,
  Coords,
  MapBounds,
} from "@/utils/geo";

// Mexico City, only used when neither the device nor the profile has a point.
const FALLBACK_CENTER: Coords = { lat: 19.4326, lon: -99.1332 };
const INITIAL_ZOOM = 12;
const INITIAL_DELTA = { lat: 0.12, lon: 0.08 };
const REGION_DEBOUNCE_MS = 400;

type Props = StaticScreenProps<{ category?: string }>;

export default function ContractingsMap({ route }: Props) {
  const { isOnline } = useOffline();
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const nav = useAppNavigation();
  const { coords, status, refresh } = useUserLocation();
  const mapRef = useRef<MapViewHandle>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [initialCenter] = useState(() => coords ?? FALLBACK_CENTER);
  const [category, setCategory] = useState(route.params?.category ?? "all");

  // Home can deep-link a category into this tab.
  useEffect(() => {
    if (route.params?.category) setCategory(route.params.category);
  }, [route.params?.category]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bounds, setBounds] = useState<MapBounds>(() =>
    boundsFromRegion(initialCenter, INITIAL_DELTA.lat, INITIAL_DELTA.lon)
  );

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const contractingsQuery = useQuery({
    queryKey: contractingsKeys.inBounds(category, bounds),
    queryFn: () => listContractingsInBounds(category, bounds),
    enabled: isOnline,
    placeholderData: keepPreviousData,
  });

  const contractings = contractingsQuery.data ?? [];
  const selected = contractings.find((item) => item.id === selectedId) ?? null;

  const { markers, circles } = useMemo(() => {
    const located = contractings.flatMap((item) => {
      const point = contractingCoords(item);
      return point ? [{ item, point }] : [];
    });
    return {
      markers: located.map(({ item, point }) => ({
        id: item.id,
        coords: point,
        title: item.name,
      })),
      circles: located.map(({ item, point }) => ({
        id: item.id,
        center: point,
        radiusMeters: APPROXIMATE_RADIUS_M,
      })),
    };
  }, [contractings]);

  const handleRegionChange = (region: MapRegion) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setBounds(
        boundsFromRegion(
          region.center,
          region.latitudeDelta || INITIAL_DELTA.lat,
          region.longitudeDelta || INITIAL_DELTA.lon
        )
      );
    }, REGION_DEBOUNCE_MS);
  };

  const goToMyLocation = async () => {
    const point = (await refresh({ request: true })) ?? coords;
    if (point) mapRef.current?.moveTo(point, 14);
  };

  if (!isOnline) {
    return (
      <View style={[styles.offline, { backgroundColor: colors.bg }]}>
        <EmptyState
          icon="wifi-off"
          title="El mapa necesita conexión"
          message="Las contrataciones guardadas siguen disponibles en Inicio."
          action={{ label: "Ir a Inicio", onPress: () => nav.tab("Home") }}
        />
      </View>
    );
  }

  const countLabel = contractingsQuery.isFetching
    ? "Buscando en esta zona…"
    : contractingsQuery.isError
      ? "No se pudieron cargar las contrataciones"
      : markers.length === 0
        ? "Sin contrataciones en esta zona"
        : `${markers.length} ${markers.length === 1 ? "contratación" : "contrataciones"} en esta zona`;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialCenter={initialCenter}
        initialZoom={INITIAL_ZOOM}
        markers={markers}
        circles={circles}
        showUserLocation={status === "granted"}
        darkMode={mode === "dark"}
        accentColor={colors.accent}
        onRegionChange={handleRegionChange}
        onMarkerPress={setSelectedId}
        onMapPress={() => setSelectedId(null)}
      />

      <View style={[styles.top, { paddingTop: insets.top + space.xs }]} pointerEvents="box-none">
        <View style={styles.titleRow} pointerEvents="box-none">
          <View style={[styles.titlePill, { backgroundColor: colors.glass, borderColor: colors.line }]}>
            <Text variant="heading">Mapa</Text>
            <Text variant="caption" tone="subtle">
              {countLabel}
            </Text>
          </View>
          <IconButton
            icon="crosshair"
            accessibilityLabel="Ir a mi ubicación"
            onPress={goToMyLocation}
            iconColor={colors.accentText}
          />
        </View>
        <CategoryList
          look="chip"
          selectedCategoryId={category}
          setSelectedCategoryId={(id) => {
            setCategory(id);
            setSelectedId(null);
          }}
        />
      </View>

      {selected ? (
        <View
          style={[styles.bottom, { bottom: TAB_BAR_SPACE + insets.bottom - space.md }]}
          pointerEvents="box-none"
        >
          <MapContractingCard contracting={selected} onPress={() => nav.contracting(selected)} />
        </View>
      ) : null}
    </View>
  );
}

function MapContractingCard({
  contracting,
  onPress,
}: {
  contracting: ContractingWithOwner;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ${contracting.name}`}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.line, boxShadow: "0 16px 36px -14px rgba(0,0,0,0.5)" },
      ]}
    >
      <StorageImage bucket="service-photos" path={contracting.photos?.[0]} style={styles.cardImage} />
      <View style={styles.cardText}>
        <Text bold numberOfLines={1}>
          {contracting.name}
        </Text>
        <Text variant="caption" tone="subtle" numberOfLines={1}>
          {contracting.owner_profile?.name ?? "Cliente"}
        </Text>
        <Text variant="label" bold tone="accent">
          {formatPrice(contracting.base_price)}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.textSubtle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offline: {
    flex: 1,
    justifyContent: "center",
  },
  top: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    gap: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: space.gutter,
  },
  titlePill: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  bottom: {
    position: "absolute",
    left: space.gutter,
    right: space.gutter,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
});
