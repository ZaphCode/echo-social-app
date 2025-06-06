import { FlatList, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { theme } from "@/theme/theme";
import useList from "@/hooks/useList";
import Text from "./ui/Text";
import RequestCard from "./RequestCard";
import Loader from "./ui/Loader";
import { useNavigation } from "@react-navigation/native";
import Button from "./ui/Button";

export default function RequestsList() {
  const [serviceRequests, { status }] = useList("service_request", {
    expand: "service.provider, client",
    sort: "-updated",
  });

  if (status === "loading")
    return (
      <View style={{ padding: 40 }}>
        <Loader />
      </View>
    );

  if (status === "error") return <ErrorRequestComponent />;

  return (
    <FlatList
      data={[] as any[]}
      renderItem={({ item }) => <RequestCard request={item} />}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={EmptyRequestsComponent}
      contentContainerStyle={{ flexGrow: 1 }}
    />
  );
}

function EmptyRequestsComponent() {
  const navigation = useNavigation();

  const handleGoToServices = () => {
    navigation.navigate("Main", { screen: "Tabs", params: { screen: "Home" } });
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
        color="white"
        size={theme.fontSizes.lg + 2}
        style={{ marginBottom: 4 }}
      >
        No hay solicitudes
      </Text>
      <Text
        color={theme.colors.lightGray}
        size={theme.fontSizes.md}
        style={{ textAlign: "center", opacity: 0.8, marginBottom: 24 }}
      >
        Aún no tienes solicitudes de servicio. ¡Explora servicios y haz tu
        primera solicitud!
      </Text>
      <Button
        title="Buscar servicios"
        style={{ minWidth: 220, backgroundColor: theme.colors.darkerGray }}
        onPress={handleGoToServices}
      />
    </View>
  );
}

function ErrorRequestComponent() {
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
        color={"white"}
        size={theme.fontSizes.lg + 2}
        style={{ marginBottom: 4 }}
      >
        Error al cargar solicitudes
      </Text>
      <Text
        color={theme.colors.lightGray}
        size={theme.fontSizes.md}
        style={{ textAlign: "center", opacity: 0.8 }}
      >
        {"Ocurrió un problema al cargar las solicitudes. Intenta nuevamente."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 54,
    paddingHorizontal: 30,
    opacity: 0.92,
  },
});
