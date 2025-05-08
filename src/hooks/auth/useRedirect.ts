import { useAuthCtx } from "@/context/Auth";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

export default function useRedirect() {
  const { authenticated } = useAuthCtx();
  const navigation = useNavigation();

  useEffect(() => {
    if (authenticated) navigation.navigate("Main");
  }, [authenticated]);

  return;
}
