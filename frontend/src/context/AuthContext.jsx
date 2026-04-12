import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { setUnauthorizedHandler } from "../lib/api";
import { adminAuthService } from "../services/adminAuthService";

const AuthContext = createContext(null);

function isAdminUser(user) {
  return user?.role === "admin";
}

function createAuthError(message, code) {
  return { error: true, message, code };
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function clearAuthState() {
    startTransition(() => {
      setSession(null);
      setUser(null);
      setLoading(false);
    });
  }

  useEffect(() => {
    let active = true;
    const isAdminPath =
      typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

    const shouldProbeSession = isAdminPath;

    if (!shouldProbeSession) {
      setLoading(false);
      return () => {
        active = false;
      };
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
        navigate("/adminlogin", { replace: true });
      }
    });

    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  async function login(credentials) {
    const nextSession = await adminAuthService.login(credentials);
    let verifiedSession;

    try {
      verifiedSession = await adminAuthService.getSession();
    } catch {
      throw createAuthError(
        "Signed in, but your session could not be saved in the browser. Check CORS_ORIGIN, API base URL, and cookie settings.",
        "SESSION_NOT_PERSISTED"
      );
    }

    if (!isAdminUser(verifiedSession?.user)) {
      throw createAuthError(
        "Login succeeded, but admin session validation failed. Please try again.",
        "SESSION_VALIDATION_FAILED"
      );
    }

    startTransition(() => {
      setSession(verifiedSession);
      setUser(verifiedSession.user);
      setLoading(false);
    });
    return verifiedSession || nextSession;
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
