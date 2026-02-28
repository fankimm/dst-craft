"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { loginWithGoogle, type AuthUser } from "@/lib/favorites-api";

// GIS typings
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
            },
          ) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  /** true when GIS script is ready */
  gisReady: boolean;
  logout: () => void;
  /** Call with a container element to render Google's sign-in button into it */
  renderGoogleButton: (el: HTMLElement, mode?: "standard" | "icon") => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "dst-auth-token";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (parts[1].length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gisReady, setGisReady] = useState(false);
  const initialized = useRef(false);

  // Restore token from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const payload = decodeJWTPayload(saved);
        if (payload && typeof payload.exp === "number" && payload.exp > Date.now() / 1000) {
          setToken(saved);
          setUser({
            sub: payload.sub as string,
            email: payload.email as string,
            name: payload.name as string,
            picture: payload.picture as string,
          });
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // Initialize GIS once the script loads
  useEffect(() => {
    if (!CLIENT_ID) return;

    function tryInit() {
      if (initialized.current || !window.google) return;
      initialized.current = true;

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        use_fedcm_for_prompt: false,
        callback: async (response) => {
          try {
            const result = await loginWithGoogle(response.credential);
            const payload = decodeJWTPayload(result.token);
            localStorage.setItem(STORAGE_KEY, result.token);
            setToken(result.token);
            setUser({
              sub: (payload?.sub as string) ?? "",
              email: (payload?.email as string) ?? "",
              name: (payload?.name as string) ?? "",
              picture: (payload?.picture as string) ?? "",
            });
          } catch (err) {
            console.error("[Auth] Login failed:", err);
          }
        },
      });
      setGisReady(true);
    }

    // GIS script might already be loaded
    if (window.google) {
      tryInit();
    } else {
      // Poll until loaded (script has strategy="afterInteractive")
      const interval = setInterval(() => {
        if (window.google) {
          tryInit();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  const renderGoogleButton = useCallback((el: HTMLElement, mode: "standard" | "icon" = "standard") => {
    if (!window.google || !gisReady) return;
    el.innerHTML = "";
    const isDark = document.documentElement.classList.contains("dark");
    window.google.accounts.id.renderButton(el, {
      type: mode,
      theme: isDark ? "filled_black" : "outline",
      size: mode === "icon" ? "small" : "large",
      shape: mode === "icon" ? "circle" : "rectangular",
      width: mode === "standard" ? 280 : undefined,
    });
  }, [gisReady]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, gisReady, logout, renderGoogleButton }),
    [user, token, loading, gisReady, logout, renderGoogleButton],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
