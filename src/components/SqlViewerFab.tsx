import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import useSqlViewerPreference from "@/hooks/useSqlViewerPreference";
import { navigationRef } from "@/navigation/navigationRef";

type Props = {
  hidden?: boolean;
};

export default function SqlViewerFab({ hidden = false }: Props) {
  const { enabled, loading } = useSqlViewerPreference();

  if (hidden || loading || !enabled) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Abrir SQL Viewer"
      style={styles.fab}
      onPress={() => {
        if (navigationRef.isReady()) {
          navigationRef.navigate("Main", { screen: "SqlViewer" });
        }
      }}
    >
      <MaterialCommunityIcons name="database-search" size={26} color="#041018" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 18,
    bottom: 104,
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22D3EE",
    shadowColor: "#22D3EE",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    zIndex: 50,
  },
});
