import { StyleSheet } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import { serviceRequestsKeys } from "@/api/serviceRequests";
import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import RequestsList from "@/components/RequestsList";
import Divider from "@/components/ui/Divider";
import useColorScheme from "@/hooks/useColorScheme";
import Title from "@/components/ui/Title";
import { useAuthCtx } from "@/context/Auth";

export default function Requests() {
  const { colors } = useColorScheme();
  const queryClient = useQueryClient();
  const { user } = useAuthCtx();

  const refreshRequests = useCallback(() => {
    return queryClient.refetchQueries({
      queryKey: serviceRequestsKeys.allForUser(user.id),
      exact: true,
    });
  }, [queryClient, user.id]);

  useFocusEffect(
    useCallback(() => {
      refreshRequests();
    }, [refreshRequests])
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Title title="Solicitudes" onRefresh={refreshRequests} />
      <Divider />
      <RequestsList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.tabPT,
    gap: theme.spacing.sm,
  },
});
