import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { setAccessToken, setUnauthorizedHandler } from "../lib/api";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

function getUserRole(user) {
  return user?.app_metadata?.role ?? user?.user_metadata?.role ?? null;
}

async function resolveUser(nextSession) {
  if (!nextSession?.access_token) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(nextSession.access_token);
  if (error) {
    return nextSession.user ?? null;
  }

  return data.user ?? nextSession.user ?? null;
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const authSyncIdRef = useRef(0);

  function clearAuthState() {
    authSyncIdRef.current += 1;
    startTransition(() => {
      setSession(null);
      setUser(null);
      setAccessToken(null);
      setLoading(false);
    });
  }

  useEffect(() => {
    let active = true;

    async function syncAuthState(nextSession) {
      const syncId = ++authSyncIdRef.current;
      const nextUser = await resolveUser(nextSession);

      if (!active || syncId !== authSyncIdRef.current) {
        return;
      }

      startTransition(() => {
        setSession(nextSession);
        setUser(nextUser);
        setAccessToken(nextSession?.access_token ?? null);
        setLoading(false);
      });
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) {
          return;
        }

        syncAuthState(data.session).catch(() => {
          if (!active) {
            return;
          }
          setLoading(false);
        });
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      syncAuthState(nextSession).catch(() => {
        if (!active) {
          return;
        }
        setLoading(false);
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      clearAuthState();
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore sign-out errors here; local auth state has already been cleared.
      }
      navigate("/", { replace: true });
    });

    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  async function login(credentials) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      throw new Error(error.message);
    }

    const nextSession = data.session;
    const nextUser = await resolveUser(nextSession);

    if (getUserRole(nextUser) !== "admin") {
      clearAuthState();
      await supabase.auth.signOut();
      throw new Error("This account does not have admin access.");
    }

    authSyncIdRef.current += 1;
    startTransition(() => {
      setSession(nextSession);
      setUser(nextUser);
      setAccessToken(nextSession?.access_token ?? null);
      setLoading(false);
    });

    return nextSession;
  }

  async function logout() {
    clearAuthState();
    navigate("/", { replace: true });
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore sign-out errors so logout never traps the UI in admin routes.
    }
  }

  const value = {
    session,
    user,
    loading,
    isAdmin: getUserRole(user) === "admin",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
