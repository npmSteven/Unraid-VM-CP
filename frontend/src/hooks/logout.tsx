import { useAuth } from "../contexts/auth"
import { useUser } from "../contexts/user";
import { useVMs } from "../contexts/vms";

export const useLogout = () => {
  const { clearAuth } = useAuth();
  const { clearUser } = useUser()
  const { clearVMs } = useVMs();

  const logout = () => {
    clearAuth();
    clearUser();
    clearVMs();
  }

  return logout;
}