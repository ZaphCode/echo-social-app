import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";

import Field from "./Field";

type Props = {
  onSearch?: (search: string) => void;
};

export default function SearchBar({ onSearch }: Props) {
  const navigation = useNavigation();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      search: "",
    },
  });

  const onSubmit = handleSubmit(({ search }) => {
    if (onSearch) return onSearch(search);

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
