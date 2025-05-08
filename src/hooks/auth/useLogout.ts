import { useAuthCtx } from "@/context/Auth";
import { pb } from "@/lib/pocketbase";

export default function useLogout() {
  const auth = useAuthCtx();

  const logout = async () => {
    pb.authStore.clear();
    auth.logout();
  };

  return logout;
}
