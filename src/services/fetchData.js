import axios from "axios";
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes
const api = axios.create();

// Token interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const cachData = localStorage.getItem("missionViewAuth");
      const parsedCacheData = cachData ? JSON.parse(cachData) : null;
      const token = parsedCacheData?.token;
      if (token) {
        console.log("tooooookkkennn", token);
        config.headers["x-auth-token"] = token;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper: Store cache
const setCache = (cacheName, data) => {
  if (typeof window === "undefined") return; // Protection SSR

  const cacheKey = `cache_${cacheName}`;
  const newCache = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem(cacheKey, JSON.stringify(newCache));
  console.log(`Cache refreshed for [${cacheName}]`);
};

// Helper: Clear admin caches
const clearAdminCaches = () => {
  if (typeof window === "undefined") return; // Protection SSR

  localStorage.removeItem("cache_admin-missions");
  localStorage.removeItem("cache_admin-reports");
  localStorage.removeItem("cache_admin-users");
  localStorage.removeItem("cache_usersMonth");
  console.log("Admin caches cleared");
};

// Helper: Fetch and refresh cache
const refreshCache = async (cacheName, url) => {
  try {
    const response = await api.get(url);
    setCache(cacheName, response.data);
  } catch (err) {
    console.error(
      `Failed to refresh cache for [${cacheName}] from [${url}]`,
      err
    );
  }
};

// GET with cache
const fetchMissions = async (name, url) => {
  const now = Date.now();
  const cacheKey = `cache_${name}`;

  if (typeof window !== "undefined") {
    const cachedString = localStorage.getItem(cacheKey);
    if (cachedString) {
      const cached = JSON.parse(cachedString);
      if (now - cached.timestamp < CACHE_EXPIRATION_TIME) {
        console.log(`Returning cached data for [${name}]`);
        return cached.data;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
  }

  try {
    const response = await api.get(url);
    if (Array.isArray(response.data) && response.data.length === 0) {
      console.log(`Returning empty array for [${name}], not caching`);
      return response.data;
    }

    setCache(name, response.data);
    return response.data;
  } catch (error) {
    console.log(
      `Error fetching [${name}] from [${url}]`,
      error?.response.data || "error fetching path : " + url
    );
    //throw error;
  }
};

// POST
const updateMissions = async (url, data, cacheName = null, fetchUrl = null) => {
  try {
    const response = await api.put(url, data);

    clearAdminCaches();
    if (cacheName && fetchUrl) await refreshCache(cacheName, fetchUrl);
    return response.data;
  } catch (error) {
    console.error(`Error posting to [${url}]`, error);
    throw error;
  }
};

// PATCH
const patchMissions = async (url, data, cacheName = null, fetchUrl = null) => {
  try {
    const response = await api.patch(url, data);

    clearAdminCaches();

    if (cacheName && fetchUrl) await refreshCache(cacheName, fetchUrl);
    return response.data;
  } catch (error) {
    console.error(`Error patching [${url}]`, error);
    throw error;
  }
};

// PUT
const putMissions = async (url, data, cacheName = null, fetchUrl = null) => {
  try {
    const response = await api.put(url, data);
    clearAdminCaches();

    if (cacheName && fetchUrl) await refreshCache(cacheName, fetchUrl);
    return response.data;
  } catch (error) {
    console.error(`Error putting [${url}]`, error);
    throw error;
  }
};

// DELETE
const deleteMissions = async (url, cacheName = null, fetchUrl = null) => {
  try {
    const response = await api.delete(url);

    clearAdminCaches();

    if (cacheName && fetchUrl) await refreshCache(cacheName, fetchUrl);
    return response.data;
  } catch (error) {
    console.error(`Error deleting [${url}]`, error);
    throw error;
  }
};

//post mision
const postMissions = async (url, data, cacheName = null, fetchUrl = null) => {
  try {
    const response = await api.post(url, data);
    clearAdminCaches();

    if (cacheName && fetchUrl) {
      await refreshCache(cacheName, fetchUrl);
    }

    // Retourner une structure cohérente
    return {
      success: true,
      status: response.status,
      data: response.data,
      message: "success",
    };
  } catch (error) {
    console.error(`Error posting to [${url}]`, error);

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
};
