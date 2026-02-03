"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation"; // Import hooks for redirection
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = "missionViewAuth";

export function AuthProvider({ children }) {
  const { toast } = useToast();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null, // Store user details (id, name, email, role)
    token: null,
    isLoading: true, // Start in loading state
  });
  const router = useRouter();
  const pathname = usePathname();

  // --- Load Auth State ---
  const loadAuthState = useCallback(() => {
    let loadedState = {
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false, // Will be false after loading attempt
    };
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const { user: storedUser, token: storedToken } = JSON.parse(storedAuth);
        // **Stricter Validation:** Check all necessary fields, especially role

        if (
          storedUser &&
          storedToken &&
          typeof storedUser.id !== "undefined" &&
          storedUser.id !== null && // Ensure ID exists and is not null
          typeof storedUser.role === "string" &&
          storedUser.role.trim() !== "" && // Ensure role is non-empty string
          typeof storedUser.name === "string" // Ensure name is a string (can be empty)
        ) {
          loadedState = {
            isAuthenticated: true,
            user: storedUser, // Use the validated user object from storage
            token: storedToken,
            isLoading: false,
          };
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } else {
        toast({
          variant: "destructive",
          title: "ERROR",
          description: "AuthProvider: No stored auth found.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "ERROR",
        description:
          "AuthProvider: Failed to parse stored auth state. Clearing.",
      });
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setAuthState(loadedState);
  }, []);

  useEffect(() => {
    loadAuthState(); // Load state on initial mount

    const handleStorageChange = (event) => {
      if (event.key === AUTH_STORAGE_KEY) {
        loadAuthState(); // Reload state from storage
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadAuthState]);

  // --- Login Function ---
  // --- Login Function ---
  const login = useCallback(
    (apiResponseData) => {
      const { user: apiUser, token } = apiResponseData || {};

      // ✅ Add "client" as a valid role
      if (
        !apiUser ||
        !token ||
        typeof apiUser.id === "undefined" ||
        apiUser.id === null ||
        typeof apiUser.role !== "string" ||
        !["shopper", "admin", "client"].includes(apiUser.role) || // ⬅️ Updated
        typeof apiUser.name !== "string"
      ) {
        toast({
          title: "Error",
          description:
            "AuthProvider: Invalid login data received from API. User object or required fields (id, valid role, name) missing or invalid.",
        });
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        }));
        return;
      }

      const userContextData = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role,
        profilePicUrl: apiUser?.profile_pic_url,
        completedMissions: apiUser?.completed_missions_count,
        city: apiUser.city,
        motivation: apiUser.motivation,
        cvUrl: apiUser.cv_url,
        birthYear: apiUser.birth_year,
        gender: apiUser.gender,
      };

      setAuthState((prevState) => ({
        ...prevState,
        isAuthenticated: true,
        user: userContextData,
        token: token,
        isLoading: false,
      }));

      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: userContextData, token }),
      );

      // ✅ Redirect based on role
      let redirectPath = "/";
      if (userContextData.role === "admin") redirectPath = "/admin";
      else if (userContextData.role === "client")
        redirectPath = "/client"; // ⬅️ NEW
      else redirectPath = "/";

      setTimeout(() => router.push(redirectPath), 50);
    },
    [router],
  );

  // --- Logout Function ---
  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
    //localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.clear();

    // Use setTimeout for redirect after logout as well, just in case
    setTimeout(() => {
      router.push("/login");
    }, 50);
  }, [router]); // Added router to dependency array

  // --- Route Protection Effect ---
  // --- Route Protection Effect ---
  useEffect(() => {
    if (authState.isLoading) return;

    const isPublicRoute = pathname === "/login" || pathname === "/signup";
    const isAdminRoute = pathname.startsWith("/admin");
    const isClientRoute = pathname.startsWith("/client"); // ⬅️ NEW
    const isShopperRoute = !isPublicRoute && !isAdminRoute && !isClientRoute;

    if (!authState.isAuthenticated) {
      if (!isPublicRoute) setTimeout(() => router.push("/login"), 0);
      return;
    }

    const userRole = authState.user?.role;
    const userId = authState.user?.id;

    if (
      !authState.user ||
      userId == null ||
      !["admin", "shopper", "client"].includes(userRole) // ⬅️ UPDATED
    ) {
      toast({
        title: "Error",
        description: "AuthProvider: Invalid user data — logging out.",
      });
      setTimeout(() => logout(), 50);
      return;
    }

    // ✅ Role-based access and redirection
    if (userRole === "admin") {
      if (!isAdminRoute) setTimeout(() => router.push("/admin"), 0);
    } else if (userRole === "shopper") {
      if (!isShopperRoute) setTimeout(() => router.push("/"), 0);
    } else if (userRole === "client") {
      if (!isClientRoute) setTimeout(() => router.push("/client"), 0); // ⬅️ NEW
    } else {
      setTimeout(() => logout(), 50);
    }
  }, [
    authState.isAuthenticated,
    authState.user,
    authState.isLoading,
    pathname,
    router,
    logout,
  ]);

  const value = {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    userRole: authState?.user?.role,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
