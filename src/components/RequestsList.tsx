import useList from "@/hooks/useList";
import { FlatList, View } from "react-native";
import Text from "./ui/Text";
import RequestCard from "./RequestCard";

export default function RequestsList() {
  const [serviceRequests, { status }] = useList("service_request", {
    expand: "service.provider, client",
    sort: "-updated",
  });

  if (status === "loading")
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <FlatList
      data={serviceRequests}
      renderItem={({ item }) => <RequestCard request={item} />}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<Text>No hay solicitudes</Text>}
    />
  );
}
