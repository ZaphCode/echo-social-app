import { useCallback, useState } from "react";
import { FlatList, Linking, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { categoriesKeys } from "@/api/categories";
import { contractingsKeys, listContractingsByCategory } from "@/api/contractings";
import { countUnreadNotificationsByUser, notificationsKeys } from "@/api/notifications";
import { listServicesByCategory, servicesKeys } from "@/api/services";
import { ContractingWithOwner, ServiceWithProvider } from "@/api/types";
import CategoryList from "@/components/CategoryList";
import ContractingCard from "@/components/ContractingCard";
import SearchBar from "@/components/forms/SearchBar";
import ServiceCard from "@/components/ServiceCard";
import EchoMark from "@/components/ui/EchoMark";
import EmptyState from "@/components/ui/EmptyState";
import IconButton from "@/components/ui/IconButton";
import Loader from "@/components/ui/Loader";
import SectionHeader from "@/components/ui/SectionHeader";
import Segmented from "@/components/ui/Segmented";
import Text from "@/components/ui/Text";
import { useAuthCtx } from "@/context/Auth";
import { useOffline } from "@/context/Offline";
import useTheme from "@/hooks/useTheme";
import useUserLocation from "@/hooks/useUserLocation";
import useAppNavigation from "@/navigation/useAppNavigation";
import { radius, space, TAB_BAR_SPACE } from "@/theme/theme";

type FeedTab = "services" | "contractings";
type FeedItem =
  | { kind: "service"; item: ServiceWithProvider }
  | { kind: "contracting"; item: ContractingWithOwner };

export default function Home() {
  const { user } = useAuthCtx();
  const { colors } = useTheme();
  const { isOnline } = useOffline();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const nav = useAppNavigation();
  const { coords, status, canAskAgain, refresh } = useUserLocation();
  const [category, setCategory] = useState("all");
  const [tab, setTab] = useState<FeedTab>("services");
  const [refreshing, setRefreshing] = useState(false);

  const servicesQuery = useQuery({
    queryKey: servicesKeys.byCategory(category, coords),
    queryFn: () => listServicesByCategory(category, coords),
    placeholderData: keepPreviousData,
  });
  const contractingsQuery = useQuery({
    queryKey: contractingsKeys.byCategory(category, user.id, coords),
    queryFn: () => listContractingsByCategory(category, user.id, coords),
    placeholderData: keepPreviousData,
  });
  const unreadNotifications =
    useQuery({
      queryKey: notificationsKeys.unreadCount(user.id),
      queryFn: () => countUnreadNotificationsByUser(user.id),
    }).data ?? 0;

  const activeQuery = tab === "services" ? servicesQuery : contractingsQuery;
  const feed: FeedItem[] =
    tab === "services"
      ? (servicesQuery.data ?? []).map((item) => ({ kind: "service", item }))
      : (contractingsQuery.data ?? []).map((item) => ({ kind: "contracting", item }));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all }),
      queryClient.invalidateQueries({ queryKey: servicesKeys.all }),
      queryClient.invalidateQueries({ queryKey: contractingsKeys.all }),
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unreadCount(user.id) }),
    ]);
    setRefreshing(false);
  }, [queryClient, user.id]);

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => (
      <View style={styles.feedItem}>
        {item.kind === "service" ? (
          <ServiceCard authUser={user} service={item.item} />
        ) : (
          <ContractingCard authUser={user} contracting={item.item} />
        )}
      </View>
    ),
    [user],
  );

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + space.xs }]}>
      <View style={styles.topBar}>
        <EchoMark height={26} />
        <View style={styles.topActions}>
          <IconButton
            icon={isOnline ? "cloud" : "cloud-off"}
            iconColor={isOnline ? colors.success : colors.warn}
            accessibilityLabel={isOnline ? "En línea, actualizar" : "Sin conexión"}
            onPress={isOnline ? onRefresh : undefined}
          />
          <IconButton
            icon="bell"
            accessibilityLabel={
              unreadNotifications > 0
                ? `Notificaciones, ${unreadNotifications} sin leer`
                : "Notificaciones"
            }
            badge={unreadNotifications}
            onPress={nav.notifications}
          />
        </View>
      </View>

      <View style={styles.gutter}>
        <Text variant="display">{`Hola, ${user.name.split(" ")[0]}`}</Text>
        <Text tone="muted">¿Qué necesitas resolver hoy?</Text>
      </View>

      <View style={styles.gutter}>
        <SearchBar />
      </View>

      {status === "denied" && (
        <Pressable
          onPress={() => (canAskAgain ? refresh({ request: true }) : Linking.openSettings())}
          style={[styles.locationHint, { backgroundColor: colors.accentSoft }]}
          accessibilityRole="button"
        >
          <Feather name="map-pin" size={16} color={colors.accentText} />
          <Text variant="label" style={styles.flex}>
            Activa tu ubicación para ver primero lo más cercano
          </Text>
          <Feather name="chevron-right" size={16} color={colors.accentText} />
        </Pressable>
      )}

      <View style={styles.section}>
        <View style={styles.gutter}>
          <SectionHeader title="Categorías" />
        </View>
        <CategoryList selectedCategoryId={category} setSelectedCategoryId={setCategory} />
      </View>

      <View style={styles.gutter}>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "services", label: "Servicios", count: servicesQuery.data?.length },
            { value: "contractings", label: "Contrataciones", count: contractingsQuery.data?.length },
          ]}
        />
      </View>

    </View>
  );

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={activeQuery.isPending || activeQuery.isError ? [] : feed}
      keyExtractor={(entry) => `${entry.kind}:${entry.item.id}`}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListEmptyComponent={
        activeQuery.isPending ? (
          <Loader />
        ) : activeQuery.isError ? (
          <EmptyState
            tone="error"
            icon="alert-circle"
            title={tab === "services" ? "No pudimos cargar los servicios" : "No pudimos cargar las contrataciones"}
            message="Revisa tu conexión e intenta de nuevo."
            action={{ label: "Reintentar", onPress: () => activeQuery.refetch() }}
          />
        ) : tab === "services" ? (
          <EmptyState
            icon="search"
            title="Aún no hay servicios aquí"
            message="Prueba otra categoría o vuelve más tarde."
          />
        ) : (
          <EmptyState
            icon="briefcase"
            title="No hay contrataciones abiertas"
            message="Cuando alguien publique lo que necesita en esta categoría, aparecerá aquí."
          />
        )
      }
      contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_SPACE + insets.bottom }]}
      ItemSeparatorComponent={Separator}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textSubtle} />
      }
    />
  );
}

function Separator() {
  return <View style={{ height: 14 }} />;
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  feedItem: {
    paddingHorizontal: space.gutter,
  },
  header: {
    gap: 18,
    marginBottom: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.gutter,
  },
  topActions: {
    flexDirection: "row",
    gap: 10,
  },
  gutter: {
    paddingHorizontal: space.gutter,
    gap: 4,
  },
  section: {
    gap: 12,
  },
  locationHint: {
    marginHorizontal: space.gutter,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    borderRadius: radius.input,
  },
  flex: {
    flex: 1,
  },
});
