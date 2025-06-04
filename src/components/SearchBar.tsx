import { View, Alert } from "react-native";
import { useForm } from "react-hook-form";

import Field from "./ui/Field";
import { useNavigation } from "@react-navigation/native";

export default function SearchBar() {
  const navigation = useNavigation();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      search: "",
    },
  });

  const onSubmit = handleSubmit(({ search }) => {
    navigation.navigate("Main", {
      screen: "Tabs",
      params: {
        screen: "Home",
        params: { screen: "SearchService", params: { search } },
      },
    });
  });

  return (
    <View>
      <Field
        name="search"
        placeholder="Buscar..."
        icon="search"
        keyboardType="default"
        rules={{ required: false }}
        control={control}
        onSubmitEditing={onSubmit}
      />
    </View>
  );
}
