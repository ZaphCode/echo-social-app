import { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";

import {
  ContractingWithOwner,
  ServiceRequestWithRelations,
  ServiceWithProvider,
} from "@/api/types";
import { Contracting } from "@/models/Contracting";
import { Service } from "@/models/Service";
import { User } from "@/models/User";

export type TabName = "Home" | "Requests" | "Map" | "Profile";

/**
 * Every cross-stack jump in one place, so screens never build nested
 * `navigate("Main", { screen, params })` objects by hand.
 */
export default function useAppNavigation() {
  const navigation = useNavigation();

  return useMemo(() => {
    const main = (screen: string, params?: object) =>
      (navigation.navigate as (...args: unknown[]) => void)("Main", { screen, params });

    return {
      back: () => navigation.goBack(),
      tab: (screen: TabName, params?: object) => main("Tabs", { screen, params }),
      service: (service: ServiceWithProvider) => main("ServiceOverview", { service }),
      contracting: (contracting: ContractingWithOwner) =>
        main("ContractingOverview", { contracting }),
      chat: (request: ServiceRequestWithRelations) => main("Chatroom", { request }),
      user: (user: Pick<User, "id"> & Partial<User>, authUserId: string) =>
        user.id === authUserId
          ? main("Tabs", { screen: "Profile" })
          : main("UserProfile", { user }),
      editService: (serviceToEdit?: Service) => main("ServiceEditor", { serviceToEdit }),
      editContracting: (contractingToEdit?: Contracting) =>
        main("ContractingEditor", { contractingToEdit }),
      search: (search: string) => main("SearchService", { search }),
      notifications: () => main("Notifications"),
      privacy: () => main("Privacy"),
    };
  }, [navigation]);
}
