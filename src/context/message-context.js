"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { fetchMissions } from "@/services/fetchData";

const MessageContext = createContext();

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

export const MessageProvider = ({ children }) => {
  const [messageCount, setMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, userRole, user } = useAuth();

  const fetchMessageCount = useCallback(async () => {
    if (!isAuthenticated || userRole !== "admin" || !user?.id) {
      setMessageCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const apiUrl = `${API_BASE_URL}messages/count/${user.id}`;
      const response = await fetchMissions("message-count", apiUrl);

      if (response && typeof response.count === "number") {
        setMessageCount(response.count);
      } else {
        setMessageCount(0);
      }
    } catch (error) {
      console.warn("Échec de récupération du nombre de messages:", error?.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userRole, user?.id]);

  useEffect(() => {
    fetchMessageCount();
  }, [fetchMessageCount]);

  useEffect(() => {
    if (isAuthenticated && userRole === "admin") {
      const interval = setInterval(fetchMessageCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, userRole, fetchMessageCount]);

  const decrementMessageCount = useCallback((count = 1) => {
    setMessageCount((prev) => Math.max(0, prev - count));
  }, []);

  const value = {
    messageCount,
    setMessageCount,
    decrementMessageCount,
    isLoading,
    refreshMessageCount: fetchMessageCount,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};
