import { FlatList, View } from "react-native";
import useList from "@/hooks/useList";
import ServiceCard from "./ServiceCard";

export default function ServiceList() {
  const [services, { status }] = useList("service", { expand: "provider" });

  return (
    <FlatList
      data={services}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ServiceCard service={item} />}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={separator}
      horizontal
    />
  );
}

const separator = () => <View style={{ width: 20 }} />;
