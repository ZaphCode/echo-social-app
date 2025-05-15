import { View, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import useList from "@/hooks/useList";
import { Service } from "@/models/Service";
import ServiceCard from "./ServiceCard";

export default function ServiceList() {
  const [service, setService] = useState<Service | null>(null);
  const [services, {}] = useList("service", {
    expand: "provider_id, provider_id.user_id",
  });

  useEffect(() => {
    if (services) {
      console.log("services", services);

      if (services.length > 0) {
        setService(services[1]);
        console.log("service", services[0]);
      }

      if (service?.expand.provider_id.expand) {
        console.log("service expand", service.expand.provider_id);
      }
    }
  }, [services]);

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
