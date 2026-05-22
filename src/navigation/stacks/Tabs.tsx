import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Foundation, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { IndexStack } from "./Index";
import MyProfile from "@/screens/MyProfile";
import Notifications from "@/screens/Notifications";
import Requests from "@/screens/Requests";
import useColorScheme from "@/hooks/useColorScheme";
import { theme } from "@/theme/theme";
import {
  countUnreadNotificationsByUser,
  notificationsKeys,
} from "@/api/notifications";
import { useAuthCtx } from "@/context/Auth";
import useSubscription from "@/hooks/useSubscription";
import { Notification } from "@/models/Notification";

type TabsParamList = {
  Home: undefined;
  Requests: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

export function Tabs() {
  const { colors } = useColorScheme();
  const { user } = useAuthCtx();
  const queryClient = useQueryClient();
  const unreadNotificationsQuery = useQuery({
    queryKey: notificationsKeys.unreadCount(user.id),
    queryFn: () => countUnreadNotificationsByUser(user.id),
  });
  const unreadNotifications = unreadNotificationsQuery.data ?? 0;

  useSubscription<Notification>("notification", user.id, async ({ record }) => {
    if (record.user !== user.id) return;

    await queryClient.invalidateQueries({
      queryKey: notificationsKeys.byUser(user.id),
    });
    await queryClient.invalidateQueries({
      queryKey: notificationsKeys.unreadCount(user.id),
    });
  });

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.darkGray,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === "ios" ? 90 : 70,
        },
        tabBarActiveTintColor: colors.primaryBlue,
        tabBarInactiveTintColor: colors.lightGray,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={IndexStack}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color }) => (
            <Foundation
              name="home"
              size={24}
              color={color}
              style={{ marginBottom: -5 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={Requests}
        options={{
          tabBarLabel: "Solicitudes",
          tabBarIcon: ({ color }) => (
            <Foundation
              name="list-thumbnails"
              size={24}
              color={color}
              style={{ marginBottom: -5 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={Notifications}
        options={{
          tabBarLabel: "Notificaciones",
          tabBarBadge:
            unreadNotifications > 0
              ? unreadNotifications > 99
                ? "99+"
                : unreadNotifications
              : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.redError,
            color: theme.colors.textOnBrand,
            fontFamily: theme.fontFamily.bold,
          },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="bell"
              size={24}
              color={color}
              style={{ marginBottom: -5 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={MyProfile}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => (
            <Foundation
              name="torso"
              size={24}
              color={color}
              style={{ marginBottom: -5 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
