'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start in loading state

  // Simulate checking authentication status on initial load
  useEffect(() => {
    // In a real app, check for a token in localStorage, session storage, or make an API call
    const checkAuthStatus = async () => {
       console.log("Checking auth status...");
       await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async check
       // For simulation, assume not authenticated initially unless a flag is set
       // In a real app:
       // const token = localStorage.getItem('authToken');
       // if (token) { setIsAuthenticated(true); } else { setIsAuthenticated(false); }
       setIsAuthenticated(false); // Default to false for simulation
       setIsLoading(false); // Mark loading as complete
       console.log("Auth status check complete. IsAuthenticated:", false);
    };

    checkAuthStatus();
  }, []);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    isLoading, // Expose loading state
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
