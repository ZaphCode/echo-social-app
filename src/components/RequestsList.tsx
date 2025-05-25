import useList from "@/hooks/useList";
import { FlatList } from "react-native";
import Text from "./ui/Text";
import RequestCard from "./RequestCard";

export default function RequestsList() {
  const [serviceRequests, _] = useList("service_request", {
    expand: "service.provider, client",
  });

  return (
    <FlatList
      data={serviceRequests}
      renderItem={({ item }) => <RequestCard serviceRequest={item} />}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<Text>No hay solicitudes</Text>}
    />
  );
}
