import type { User } from "~/server/types/user";
import { useApi } from "~/server/utils/useApi";

export const useAuth = () => {
  const user = useState<User | null>("user", () => null); // store the user in memory

  const fetchUser = async () => {
    try {
      const response = await useApi<User>(
        "/api/auth/me",
        "GET",
        {},
        true
      );

      if (response.status === "error") {
        user.value = null;
        return;
      }

      user.value = response.data;
    } catch (error) {
      // TODO send error to sentry example
      console.error("Error fetching user:", error);
      user.value = null;
    }
  };

  return {
    user,
    fetchUser,
    isAuthenticated: computed(() => !!user.value),
  };
};
