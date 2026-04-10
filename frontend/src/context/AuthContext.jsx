import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { setAccessToken, setUnauthorizedHandler } from "../lib/api";
import { adminAuthService } from "../services/adminAuthService";

const AuthContext = createContext(null);
const ADMIN_TOKEN_STORAGE_KEY = "kp_admin_access_token";

function isAdminUser(user) {
  return user?.role === "admin";
}

function readStoredAdminToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

function persistAdminToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    return;
  }

  window.sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function clearAuthState() {
    setAccessToken(null);
    persistAdminToken(null);
    startTransition(() => {
      setSession(null);
      setUser(null);
      setLoading(false);
    });
  }

  useEffect(() => {
    let active = true;
    const storedToken = readStoredAdminToken();

    if (storedToken) {
      setAccessToken(storedToken);
    }

    adminAuthService
      .getSession()
      .then((nextSession) => {
        if (!active) {
          return;
        }
        startTransition(() => {
          setSession(nextSession);
          setUser(nextSession.user);
          setLoading(false);
        });
      })
      .catch(() => {
        if (!active) {
          return;
        }
        clearAuthState();
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      clearAuthState();
      try {
        await adminAuthService.logout();
      } catch {
        // Ignore logout errors here; local auth state has already been cleared.
      }
      if (window.location.pathname.startsWith("/admin")) {
        navigate("/admin/login", { replace: true });
      }
    });

    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  async function login(credentials) {
    const nextSession = await adminAuthService.login(credentials);
    setAccessToken(nextSession.access_token);
    persistAdminToken(nextSession.access_token);
    startTransition(() => {
      setSession(nextSession);
      setUser(nextSession.user);
      setLoading(false);
    });
    return nextSession;
  }

  async function logout() {
    clearAuthState();
    try {
      await adminAuthService.logout();
    } catch {
      // Ignore logout errors so admin exit never traps the UI in protected routes.
    }
    navigate("/", { replace: true });
  }

  const value = {
    session,
    user,
    loading,
    isAdmin: isAdminUser(user),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
