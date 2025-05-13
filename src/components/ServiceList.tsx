import { View, FlatList } from "react-native";
import React from "react";
import useList from "@/hooks/useList";
import ServiceCard from "./ServiceCard";

export default function ServiceList() {
  const [services, {}] = useList("service");

  return (
    <FlatList
      data={services}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ServiceCard service={item} />}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      horizontal
    />
  );
}
