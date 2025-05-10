import { View, Alert } from "react-native";
import { useForm } from "react-hook-form";

import Field from "./ui/Field";

export default function SearchBar() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      search: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    Alert.alert("Search", `Searching for ${data.search}`);
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
