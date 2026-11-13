import { Pressable, StyleSheet, View } from "react-native";

import Text from "./Text";

type Props = {
  title: string;
  action?: { label: string; onPress: () => void; accessibilityLabel?: string };
};

export default function SectionHeader({ title, action }: Props) {
  return (
    <View style={styles.row}>
      <Text variant="heading">{title}</Text>
      {action ? (
        <Pressable
          onPress={action.onPress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={action.accessibilityLabel ?? action.label}
        >
          <Text variant="label" bold tone="accent">
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
