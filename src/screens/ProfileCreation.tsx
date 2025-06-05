import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Loc from "expo-location";

import { User } from "@/models/User";
import { theme } from "@/theme/theme";
import AvatarPicker from "@/components/AvatarPicker";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Divider from "@/components/ui/Divider";
import useRegister from "@/hooks/auth/useRegister";

type Props = StaticScreenProps<{
  userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: User["role"];
    avatar?: string;
  };
}>;

export default function ProfileCreation({ route }: Props) {
  const { userData } = route.params;
  const [avatarSrc, setAvatarSrc] = useState<string>();
  const navigation = useNavigation();

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      phone: "",
      address: "",
      state: "",
      city: "",
      zipCode: "",
    },
  });

  const { registerClient } = useRegister();

  const [locationCords, setLocationCords] = useState<Loc.LocationObject>();
  const [locationData, setLocationData] =
    useState<Loc.LocationGeocodedAddress>();

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (locationData) {
      setValue("city", locationData.city || "");
      setValue("state", locationData.region || "");
      setValue("zipCode", locationData.postalCode || "");
    }
  }, [locationData]);

  const getLocation = async () => {
    const { status } = await Loc.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Se requiere acceso a la ubicación.");
      return;
    }

    const location = await Loc.getCurrentPositionAsync({});

    setLocationCords(location);

    const { latitude, longitude } = location.coords;

    const address = await Loc.reverseGeocodeAsync({ latitude, longitude });

    setLocationData(address[0]);
  };

  const onContinue = handleSubmit(async (profileData) => {
    const allData = {
      ...userData,
      ...profileData,
      avatar: avatarSrc,
      location: locationCords && {
        lat: locationCords.coords.latitude,
        lon: locationCords.coords.longitude,
      },
    };

    if (userData.role === "provider") {
      navigation.navigate("Auth", {
        screen: "ProviderData",
        params: { userData: allData },
      });
    } else {
      const error = await registerClient(allData);

      if (error) {
        console.log("Error al registrar cliente:", error);
        Alert.alert(
          "Error al registrar cliente",
          "Hubo un problema al crear tu perfil. Por favor, intenta nuevamente más tarde."
        );
      }
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <AvatarPicker onChange={setAvatarSrc} />
        <View style={styles.fieldsContainer}>
          <Field
            name="phone"
            control={control}
            label="Teléfono"
            placeholder="+52 123 456 7890"
            keyboardType="numeric"
          />
          <Divider />

          <Field
            name="address"
            control={control}
            label="Dirección"
            placeholder="Calle Reforma, Número 123"
          />
          <Field
            name="city"
            control={control}
            label="Ciudad"
            placeholder="Ciudad de México"
          />
          <Field
            name="state"
            control={control}
            label="Estado"
            placeholder="Ciudad de México"
          />
          <Field
            name="zipCode"
            control={control}
            label="Código Postal"
            placeholder="12345"
            keyboardType="numeric"
          />
          <Button
            title={userData.role === "provider" ? "Continuar" : "Registrar"}
            onPress={onContinue}
            style={{ marginTop: 18 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
    paddingTop: theme.spacing.tabPT,
  },
  fieldsContainer: {
    paddingHorizontal: theme.spacing.md - 2,
    gap: theme.spacing.sm - 2,
    paddingBottom: theme.spacing.lg + 24,
  },
});
