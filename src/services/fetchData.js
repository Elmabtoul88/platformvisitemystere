import axios from "axios";
import { queryClient } from "@/context/query-provider";
import base_url from "@/services/baseUrl";

const api = axios.create({
  baseURL: base_url,
});

function getToken() {
  if (typeof document === "undefined") return null;

  // 1. Lire depuis le cookie
  const match = document.cookie.match(/(^| )missionViewAuth=([^;]+)/);
  if (match) {
    try {
      const parsed = JSON.parse(decodeURIComponent(match[2]));
      console.log("Token from cookie:", parsed?.token);
      if (parsed?.token) return parsed.token;
    } catch (e) {
      // ignore
    }
  }

  // 2. Fallback localStorage
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("missionViewAuth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.token) return parsed.token;
      } catch (e) {
        // ignore
      }
    }
  }

  return null;
}

// Token interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["x-auth-token"] = token;
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor avec gestion d'erreur douce (sans vider tout le localStorage brutalement)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response && error.response.status === 401) {
      // Si la session est expirée sur une route protégée
      const isPublicPath = [
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/",
        "/about",
        "/contact",
      ].some((p) => window.location.pathname === p || window.location.pathname.startsWith(p + "/"));
      if (!isPublicPath) {
        document.cookie = "missionViewAuth=; path=/; max-age=0; SameSite=Lax";
        localStorage.removeItem("missionViewAuth");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Invalidation de cache TanStack Query
const clearAdminCaches = () => {
  queryClient.invalidateQueries({ queryKey: ["admin-missions"] });
  queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
  queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  queryClient.invalidateQueries({ queryKey: ["usersMonth"] });
  queryClient.invalidateQueries({ queryKey: ["missions"] });
};

// GET avec cache intelligent et déduplication TanStack Query
const fetchMissions = async (name, url) => {
  try {
    return await queryClient.fetchQuery({
      queryKey: [name, url],
      queryFn: async () => {
        const response = await api.get(url);
        return response.data;
      },
      staleTime: 1000 * 60 * 2, // 2 minutes de fraîcheur
    });
  } catch (error) {
    console.error(`Erreur fetch [${name}] depuis [${url}]:`, error?.response?.data || error.message);
    throw error;
  }
};

// PUT
const updateMissions = async (url, data, cacheName = null) => {
  try {
    const response = await api.put(url, data);
    clearAdminCaches();
    if (cacheName) queryClient.invalidateQueries({ queryKey: [cacheName] });
    return response.data;
  } catch (error) {
    console.error(`Erreur put [${url}]:`, error);
    throw error;
  }
};

// PATCH
const patchMissions = async (url, data, cacheName = null) => {
  try {
    const response = await api.patch(url, data);
    clearAdminCaches();
    if (cacheName) queryClient.invalidateQueries({ queryKey: [cacheName] });
    return response.data;
  } catch (error) {
    console.error(`Erreur patch [${url}]:`, error);
    throw error;
  }
};

// PUT alias
const putMissions = async (url, data, cacheName = null) => {
  return updateMissions(url, data, cacheName);
};

// DELETE
const deleteMissions = async (url, cacheName = null) => {
  try {
    const response = await api.delete(url);
    clearAdminCaches();
    if (cacheName) queryClient.invalidateQueries({ queryKey: [cacheName] });
    return response.data;
  } catch (error) {
    console.error(`Erreur delete [${url}]:`, error);
    throw error;
  }
};

// POST
const postMissions = async (url, data, cacheName = null) => {
  try {
    const response = await api.post(url, data);
    clearAdminCaches();
    if (cacheName) queryClient.invalidateQueries({ queryKey: [cacheName] });
    return {
      success: true,
      status: response.status,
      data: response.data,
      message: "success",
    };
  } catch (error) {
    console.error(`Erreur post [${url}]:`, error);
    return {
      success: false,
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
      error: true,
    };
  }
};

export {
  fetchMissions,
  updateMissions,
  patchMissions,
  putMissions,
  deleteMissions,
  postMissions,
  clearAdminCaches,
  api,
  getToken,
  getToken as getAuthToken,
};
