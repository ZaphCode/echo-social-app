import { FlatList, View } from "react-native";
import useList from "@/hooks/useList";
import ServiceCard from "./ServiceCard";
import { User } from "@/models/User";

type Props = {
  authUser: User;
};

export default function ServiceList({ authUser }: Props) {
  const [services, { status }] = useList("service", { expand: "provider" });

  return (
    <FlatList
      data={services}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ServiceCard authUser={authUser} service={item} />
      )}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={separator}
      horizontal
    />
  );
}

const separator = () => <View style={{ width: 24 }} />;
