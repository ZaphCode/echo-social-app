import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationsKeys } from "@/api/notifications";
import { listAllUserRequests, serviceRequestsKeys } from "@/api/serviceRequests";
import useUnreadMessageCounts from "@/chat/useUnreadMessageCounts";
import { useAuthCtx } from "@/context/Auth";
import useSubscription from "@/hooks/useSubscription";
import { useSyncUserLocation } from "@/hooks/useUserLocation";
import { Notification } from "@/models/Notification";
import ContractingsMap from "@/screens/ContractingsMap";
import Home from "@/screens/Home";
import MyProfile from "@/screens/MyProfile";
import Requests from "@/screens/Requests";
import TabBar from "../TabBar";

type TabsParamList = {
  Home: undefined;
  Requests: undefined;
  Map: { category?: string };
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

export function Tabs() {
  const { user } = useAuthCtx();
  const queryClient = useQueryClient();
  const requestsQuery = useQuery({
    queryKey: serviceRequestsKeys.allForUser(user.id),
    queryFn: () => listAllUserRequests(user.id),
  });
  const unreadCounts = useUnreadMessageCounts(requestsQuery.data, user.id);
  const hasUnreadMessages = Object.values(unreadCounts.data ?? {}).some(
    (count) => count > 0,
  );

  useSyncUserLocation();

  useSubscription<Notification>("notification", user.id, async ({ record }) => {
    if (record.user !== user.id) return;

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: notificationsKeys.byUser(user.id) }),
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unreadCount(user.id) }),
    ]);
  });

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} requestsDot={hasUnreadMessages} />}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Requests" component={Requests} />
      <Tab.Screen name="Map" component={ContractingsMap} />
      <Tab.Screen name="Profile" component={MyProfile} />
    </Tab.Navigator>
  );
}
