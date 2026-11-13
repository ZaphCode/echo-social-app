import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { listAllUserRequests, serviceRequestsKeys } from "@/api/serviceRequests";
import { chatMessagesKeys } from "@/chat/sync";
import useUnreadMessageCounts from "@/chat/useUnreadMessageCounts";
import RequestCard from "@/components/RequestCard";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";
import { AGREEMENT_STATES } from "@/components/ui/StatusPill";
import Text from "@/components/ui/Text";
import { useAuthCtx } from "@/context/Auth";
import useTheme from "@/hooks/useTheme";
import { ServiceRequest } from "@/models/ServiceRequest";
import useAppNavigation from "@/navigation/useAppNavigation";
import { radius, space, TAB_BAR_SPACE } from "@/theme/theme";

type Filter = "ALL" | ServiceRequest["agreement_state"];

const FILTERS: { value: Filter; label: string }[] = [
  { value: "ALL", label: "Todas" },
  ...(Object.keys(AGREEMENT_STATES) as ServiceRequest["agreement_state"][]).map((state) => ({
    value: state,
    label: AGREEMENT_STATES[state].label,
  })),
];

export default function Requests() {
  const { user } = useAuthCtx();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const nav = useAppNavigation();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const requestsQuery = useQuery({
    queryKey: serviceRequestsKeys.allForUser(user.id),
    queryFn: () => listAllUserRequests(user.id),
  });
  const requests = useMemo(
    () =>
      requestsQuery.data?.filter(
        (request) => request.client === user.id || request.provider === user.id,
      ) ?? [],
    [requestsQuery.data, user.id],
  );
  const unreadCounts = useUnreadMessageCounts(requests, user.id).data;
  const visible = filter === "ALL" ? requests : requests.filter((r) => r.agreement_state === filter);

  const refresh = useCallback(
    () =>
      Promise.all([
        queryClient.refetchQueries({ queryKey: serviceRequestsKeys.allForUser(user.id), exact: true }),
        queryClient.invalidateQueries({ queryKey: chatMessagesKeys.unreadCountsForUser(user.id) }),
      ]),
    [queryClient, user.id],
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const onPullRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <View style={[styles.fill, { backgroundColor: colors.bg, paddingTop: insets.top + space.xs }]}>
      <View style={styles.header}>
        <Text variant="display">Solicitudes</Text>
        <Text tone="muted">Tus negociaciones activas y pasadas</Text>
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((option) => {
            const selected = option.value === filter;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setFilter(option.value)}
                style={[
                  styles.filter,
                  {
                    backgroundColor: selected ? colors.text : colors.surface,
                    borderColor: selected ? colors.text : colors.line,
                  },
                ]}
              >
                <Text variant="label" bold color={selected ? colors.bg : colors.textMuted}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {requestsQuery.isPending ? (
        <Loader />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RequestCard request={item} authUserId={user.id} unreadCount={unreadCounts?.[item.id] ?? 0} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={[styles.list, { paddingBottom: TAB_BAR_SPACE + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onPullRefresh} tintColor={colors.textSubtle} />
          }
          ListEmptyComponent={
            requestsQuery.isError ? (
              <EmptyState
                tone="error"
                icon="alert-circle"
                title="No pudimos cargar tus solicitudes"
                message="Revisa tu conexión e intenta de nuevo."
                action={{ label: "Reintentar", onPress: () => requestsQuery.refetch() }}
              />
            ) : filter === "ALL" ? (
              <EmptyState
                icon="message-square"
                title="Aún no tienes solicitudes"
                message="Explora servicios y contrataciones para empezar a negociar."
                action={{ label: "Explorar", onPress: () => nav.tab("Home") }}
              />
            ) : (
              <EmptyState
                icon="filter"
                title={`Nada en “${AGREEMENT_STATES[filter].label}”`}
                message="Prueba con otro filtro."
              />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  header: {
    paddingHorizontal: space.gutter,
    paddingTop: space.xs,
    gap: 4,
  },
  filters: {
    paddingHorizontal: space.gutter,
    paddingVertical: space.md,
    gap: 8,
  },
  filter: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: "center",
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: space.gutter,
  },
});
