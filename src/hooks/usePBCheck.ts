import { useEffect } from "react";
import { pb } from "@/lib/pocketbase";
import { useNavigation } from "@react-navigation/native";

export default function usePBCheck() {
  const navigation = useNavigation();

  useEffect(() => {
    pb.health.check().catch((err) => {
      navigation.navigate("ChangeApi");
    });
  }, []);
}
