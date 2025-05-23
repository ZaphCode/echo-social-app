import useList from "@/hooks/useList";
import { FlatList, VirtualizedList } from "react-native";
import Text from "./ui/Text";
import RequestCard from "./RequestCard";
import { useAuthCtx } from "@/context/Auth";

export default function RequestsList() {
  const { user } = useAuthCtx();

  const filter =
    user.role === "client"
      ? `client = "${user.id}"`
      : `service.provider = "${user.id}"`;

  const [serviceRequests, fetchData] = useList("service_request", {
    expand: "service.provider, client",
    filter,
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
