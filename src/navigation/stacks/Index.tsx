import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ServiceWithProvider } from "@/api/types";
import Home from "@/screens/Home";
import SearchService from "@/screens/SearchService";
import ServiceOverview from "@/screens/ServiceOverview";
import { theme } from "@/theme/theme";

type IndexStackParamList = {
  Inicio: undefined;
  SearchService: { search: string };
  ServiceOverview: { service: ServiceWithProvider };
};

const Stack = createNativeStackNavigator<IndexStackParamList>();

export function IndexStack() {
  return (
    <Stack.Navigator
      initialRouteName="Inicio"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Inicio" component={Home} />
      <Stack.Screen
        name="SearchService"
        component={SearchService}
        options={{
          headerShown: true,
          title: "",
          headerTintColor: theme.colors.textOnBrand,
          headerStyle: {
            backgroundColor: theme.colors.brandSurface,
          },
        }}
      />
      <Stack.Screen
        name="ServiceOverview"
        component={ServiceOverview}
        options={{
          headerShown: true,
          title: "",
          headerTintColor: theme.colors.textOnBrand,
          headerStyle: {
            backgroundColor: theme.colors.brandSurface,
          },
        }}
      />
    </Stack.Navigator>
  );
}
