import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import useTheme from "@/hooks/useTheme";
import useAppNavigation from "@/navigation/useAppNavigation";
import { fonts, radius } from "@/theme/theme";

type Props = {
  initialValue?: string;
  /** Defaults to opening the search results screen. */
  onSearch?: (search: string) => void;
  autoFocus?: boolean;
};

export default function SearchBar({ initialValue = "", onSearch, autoFocus }: Props) {
  const { colors } = useTheme();
  const nav = useAppNavigation();
  const [value, setValue] = useState(initialValue);

  const submit = () => {
    const search = value.trim();
    if (!search) return;
    if (onSearch) onSearch(search);
    else nav.search(search);
  };

  return (
    <View style={[styles.field, { backgroundColor: colors.surface, borderColor: colors.line }]}>
      <Feather name="search" size={19} color={colors.textSubtle} />
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={submit}
        placeholder="Buscar plomería, pintura…"
        placeholderTextColor={colors.textSubtle}
        accessibilityLabel="Buscar servicios"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        style={[styles.input, { color: colors.text }]}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Borrar búsqueda"
          hitSlop={10}
          onPress={() => setValue("")}
        >
          <Feather name="x-circle" size={18} color={colors.textSubtle} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: fonts.regular,
    fontSize: 15,
  },
});
