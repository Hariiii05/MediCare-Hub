import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authApi, type LoginData, type RegisterData } from "../api/client";

/** JWT dùng base64url; atob() chỉ chấp nhận base64 chuẩn */
function parseJwtPayload(accessToken: string): Record<string, unknown> {
  const part = accessToken.split(".")[1];
  if (!part) throw new Error("Invalid token");
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  return JSON.parse(atob(padded)) as Record<string, unknown>;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  // Auth modal
  authModalOpen: boolean;
  authModalTab: "login" | "register";
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  switchAuthTab: (tab: "login" | "register") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  const isAuthenticated = !!token;

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = async (data: LoginData) => {
    const res = await authApi.login(data);
    setToken(res.data.access_token);
    const payload = parseJwtPayload(res.data.access_token);
    setUser({
      id: Number(payload.sub),
      username: String(payload.username ?? data.username),
      email: String(payload.email ?? ""),
      role: String(payload.role ?? "patient"),
    });
  };

  const register = async (data: RegisterData) => {
    await authApi.register(data);
    const loginRes = await authApi.login({
      username: data.username,
      password: data.password,
    });
    setToken(loginRes.data.access_token);
    const payload = parseJwtPayload(loginRes.data.access_token);
    setUser({
      id: Number(payload.sub),
      username: String(payload.username ?? data.username),
      email: String(payload.email ?? data.email),
      role: String(payload.role ?? "patient"),
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const openAuthModal = (tab: "login" | "register" = "login") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => setAuthModalOpen(false);
  const switchAuthTab = (tab: "login" | "register") => setAuthModalTab(tab);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        switchAuthTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
