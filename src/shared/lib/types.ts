import { AuthUser } from "@/server/auth/types";

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
}
