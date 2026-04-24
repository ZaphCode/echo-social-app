import { useAuthCtx } from "@/context/Auth";
import { supabase } from "@/lib/supabase";

export default function useLogout() {
  const auth = useAuthCtx();

  const logout = async () => {
    await supabase.auth.signOut();
    auth.logout();
  };

  return logout;
}
