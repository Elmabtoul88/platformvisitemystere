"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
const MessageContext = createContext();

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const MessageProvider = ({ children }) => {
  const { toast } = useToast();
  const [messageCount, setMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, userRole, user } = useAuth();
  const fetchMessageCount = async () => {
    if (!isAuthenticated || userRole !== "admin") {
      setMessageCount(0);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const apiUrl = user?.id
        ? `${API_BASE_URL}messages/count/${user.id}`
        : API_BASE_URL + "messages/count";

      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        setMessageCount(data.count || 0);
      } else {
        setMessageCount(0);
      }
    } catch (error) {
      toast({ title: "Erreur fetch count", description: error });
      setMessageCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessageCount();
  }, [isAuthenticated, userRole, user?.id]);

  useEffect(() => {
    if (isAuthenticated && userRole === "admin") {
      const interval = setInterval(fetchMessageCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, userRole]);

  const incrementMessageCount = () => {
    setMessageCount((prev) => prev + 1);
  };

  const decrementMessageCount = (amount = 1) => {
    setMessageCount((prev) => Math.max(0, prev - amount));
  };

  const resetMessageCount = () => {
    setMessageCount(0);
  };

  const markMessagesByUser = async (userId) => {
    if (!isAuthenticated || userRole !== "admin") return;

    try {
      const response = await fetch(
        `${API_BASE_URL}messages/mark-read/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminId: user?.id || 2 }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.markedAsRead > 0) {
          decrementMessageCount(data.markedAsRead);
        }
        return data;
      }
    } catch (error) {
      toast({ title: "Erreur markMessagesByUser", description: error });
    }
  };

  const value = {
    messageCount,
    setMessageCount,
    incrementMessageCount,
    decrementMessageCount,
    resetMessageCount,
    refreshMessageCount: fetchMessageCount,
    markMessagesByUser,
    isLoading,
    isAdmin: userRole === "admin",
  };

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};
