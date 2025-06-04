import { FlatList, View } from "react-native";
import useList from "@/hooks/useList";
import ServiceCard from "./ServiceCard";
import { User } from "@/models/User";
import { useEffect } from "react";
import Text from "./ui/Text";

type Props = {
  authUser: User;
  category: string;
};

export default function ServiceList({ authUser, category }: Props) {
  const [services, { status }, refetch] = useList("service", {
    expand: "provider",
  });

  useEffect(() => {
    if (status !== "loading")
      refetch({
        expand: "provider",
        filter: category === "all" ? "" : `category = '${category}'`,
      });
  }, [category]);

  if (status === "loading") {
    return (
      <View style={{ padding: 16 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
      ListEmptyComponent={ListEmptyComponent}
    />
  );
}

const ListEmptyComponent = () => (
  <View style={{ padding: 16 }}>
    <Text>No hay servicios disponibles</Text>
  </View>
);

const separator = () => <View style={{ width: 24 }} />;
