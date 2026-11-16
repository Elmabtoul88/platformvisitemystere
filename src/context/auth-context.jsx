"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "missionViewAuth";

function setAuthCookie(data) {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(data));
  const maxAge = 7 * 24 * 60 * 60; // 7 jours
  document.cookie = `${AUTH_STORAGE_KEY}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function removeAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

function getAuthCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${AUTH_STORAGE_KEY}=([^;]+)`));
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[2]));
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Routes publiques
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/about",
  "/contact",
  "/services",
  "/dashboard",
];

export function AuthProvider({ children }) {
  const { toast } = useToast();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
  });
  const router = useRouter();
  const pathname = usePathname();

  // --- Charger l'état d'authentification ---
  const loadAuthState = useCallback(() => {
    try {
      // 1. Lire depuis le cookie prioritairement (compatible Next.js middleware)
      let stored = getAuthCookie();

      // 2. Fallback sur localStorage si besoin
      if (!stored && typeof window !== "undefined") {
        const local = localStorage.getItem(AUTH_STORAGE_KEY);
        if (local) {
          try {
            stored = JSON.parse(local);
            if (stored) setAuthCookie(stored); // Sync vers cookie
          } catch (e) {}
        }
      }

      if (stored) {
        const userObj = stored.user || (stored.id ? stored : null);
        const tokenVal =
          stored.token ||
          (typeof stored === "string" ? stored : null) ||
          (typeof window !== "undefined" ? localStorage.getItem("token") : null);

        if (tokenVal && userObj && userObj.id) {
          if (typeof window !== "undefined") {
            localStorage.setItem("token", tokenVal);
          }
          setAuthState({
            isAuthenticated: true,
            user: userObj,
            token: tokenVal,
            isLoading: false,
          });
          return;
        }
      }
    } catch (error) {
      console.error("AuthProvider: Erreur parsing auth:", error);
    }

    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    loadAuthState();
    const handleStorageChange = (event) => {
      if (event.key === AUTH_STORAGE_KEY) loadAuthState();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadAuthState]);

  // --- Connexion ---
  const login = useCallback(
    (apiResponseData) => {
      const { user: apiUser, token } = apiResponseData || {};
      if (!apiUser || !token || !apiUser.id || !apiUser.role || !apiUser.name) {
        toast({
          title: "Erreur",
          description: "Données de connexion invalides",
          variant: "destructive",
        });
        return;
      }

      const userContextData = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role,
        profilePicUrl: apiUser?.profile_pic_url || apiUser?.profilePicUrl,
        completedMissions: apiUser?.completed_missions_count || apiUser?.completedMissions || 0,
        city: apiUser.city,
        motivation: apiUser.motivation,
        cvUrl: apiUser.cv_url || apiUser?.cvUrl,
        birthYear: apiUser.birth_year || apiUser?.birthYear,
        gender: apiUser.gender,
      };

      setAuthState({
        isAuthenticated: true,
        user: userContextData,
        token: token,
        isLoading: false,
      });

      const sessionData = { user: userContextData, token };
      setAuthCookie(sessionData);
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
        localStorage.setItem("token", token);
      }

      const redirectMap = {
        admin: "/admin",
        client: "/client",
        shopper: "/",
      };
      setTimeout(
        () => router.push(redirectMap[userContextData.role] || "/"),
        50,
      );
    },
    [router, toast],
  );

  // --- Déconnexion ---
  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
    removeAuthCookie();
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem("token");
    }
    setTimeout(() => router.push("/login"), 50);
  }, [router]);

  // --- Protection des routes ---
  useEffect(() => {
    if (authState.isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    );
    const isLoginOrSignup = pathname === "/login" || pathname === "/signup";
    const isAuthPage =
      isLoginOrSignup ||
      pathname === "/forgot-password" ||
      pathname.startsWith("/reset-password");
    const isAdminRoute = pathname.startsWith("/admin");
    const isClientRoute = pathname.startsWith("/client");
    const isSharedAuthRoute =
      pathname === "/settings" || pathname.startsWith("/settings/");

    if (!authState.isAuthenticated) {
      if (!isPublicRoute && !isAuthPage) {
        router.replace("/login");
      }
      return;
    }

    const userRole = authState.user?.role;
    if (!userRole || !["admin", "shopper", "client"].includes(userRole)) {
      logout();
      return;
    }

    if (isLoginOrSignup) {
      const redirectMap = {
        admin: "/admin",
        client: "/client",
        shopper: "/",
      };
      router.replace(redirectMap[userRole] || "/");
      return;
    }

    if (isPublicRoute || isSharedAuthRoute) return;

    if (userRole === "admin") {
      if (!isAdminRoute) router.replace("/admin");
    } else if (userRole === "client") {
      if (!isClientRoute) router.replace("/client");
    } else if (userRole === "shopper") {
      if (isAdminRoute || isClientRoute) router.replace("/");
    }
  }, [
    authState.isLoading,
    authState.isAuthenticated,
    authState.user,
    pathname,
    router,
    logout,
  ]);

  const updateUser = useCallback((partialUser) => {
    setAuthState((prev) => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...partialUser };
      const sessionData = { user: updatedUser, token: prev.token };
      setAuthCookie(sessionData);
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      }
      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  const value = {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    userRole: authState?.user?.role,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
