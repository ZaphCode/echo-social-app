import { FlatList, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listAllUserRequests,
  serviceRequestsKeys,
} from "@/api/serviceRequests";
import useUnreadMessageCounts from "@/chat/useUnreadMessageCounts";
import { chatMessagesKeys } from "@/chat/sync";
import { theme } from "@/theme/theme";
import Text from "./ui/Text";
import RequestCard from "./RequestCard";
import Loader from "./ui/Loader";
import Button from "./ui/Button";
import { useAuthCtx } from "@/context/Auth";
import useColorScheme from "@/hooks/useColorScheme";

export default function RequestsList() {
  const { user } = useAuthCtx();
  const queryClient = useQueryClient();
  const requestsQuery = useQuery({
    queryKey: serviceRequestsKeys.allForUser(user.id),
    queryFn: () => listAllUserRequests(user.id),
  });
  const unreadCountsQuery = useUnreadMessageCounts(requestsQuery.data, user.id);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: chatMessagesKeys.unreadCountsForUser(user.id),
      });
    }, [queryClient, user.id])
  );

  if (requestsQuery.isPending)
    return (
      <View style={{ padding: 40 }}>
        <Loader />
      </View>
    );

  if (requestsQuery.isError) return <ErrorRequestComponent />;

  return (
    <FlatList
      style={styles.list}
      data={requestsQuery.data}
      renderItem={({ item }) => (
        <RequestCard
          request={item}
          unreadCount={unreadCountsQuery.data?.[item.id] ?? 0}
        />
      )}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={EmptyRequestsComponent}
      contentContainerStyle={styles.contentContainer}
    />
  );
}

function EmptyRequestsComponent() {
  const navigation = useNavigation();
  const { colors } = useColorScheme();
  const handleGoToServices = () => {
    (navigation.navigate as any)("Main", {
      screen: "Tabs",
      params: { screen: "Home" },
    });
  };

  return (
    <View style={styles.centeredContainer}>
      <MaterialCommunityIcons
        name="inbox-arrow-down-outline"
        size={52}
        color={theme.colors.primaryBlue}
        style={{ marginBottom: 16 }}
      />
      <Text
        fontFamily="bold"
        color={colors.text}
        size={theme.fontSizes.lg + 2}
        style={{ marginBottom: 4 }}
      >
        No hay solicitudes
      </Text>
      <Text
        color={colors.lightGray}
        size={theme.fontSizes.md}
        style={{ textAlign: "center", opacity: 0.8, marginBottom: 24 }}
      >
        Aún no tienes solicitudes o aplicaciones. Explora servicios y
        contrataciones para iniciar una negociación.
      </Text>
      <Button
        title="Buscar servicios"
        style={{ minWidth: 220, backgroundColor: colors.darkerGray }}
        onPress={handleGoToServices}
      />
    </View>
  );
}

function ErrorRequestComponent() {
  const { colors } = useColorScheme();
  return (
    <View style={styles.centeredContainer}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={52}
        color={theme.colors.redError}
        style={{ marginBottom: 12 }}
      />
      <Text
        fontFamily="bold"
        color={colors.text}
        size={theme.fontSizes.lg + 2}
        style={{ marginBottom: 4 }}
      >
        Error al cargar solicitudes
      </Text>
      <Text
        color={colors.lightGray}
        size={theme.fontSizes.md}
        style={{ textAlign: "center", opacity: 0.8 }}
      >
        {"Ocurrió un problema al cargar las solicitudes. Intenta nuevamente."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  centeredContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 54,
    paddingHorizontal: 30,
    opacity: 0.92,
  },
});
