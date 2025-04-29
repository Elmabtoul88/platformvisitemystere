'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // Add state for user role (e.g., 'shopper', 'admin')
  const [isLoading, setIsLoading] = useState(true); // Start in loading state

  // Simulate checking authentication status on initial load
  useEffect(() => {
    // In a real app, check for a token and user info in localStorage/sessionStorage
    const checkAuthStatus = async () => {
       console.log("Checking auth status...");
       await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async check

       // For simulation: Check local storage for persisted state
       const storedAuth = localStorage.getItem('missionViewAuth');
       let initialAuth = false;
       let initialRole = null;
       if (storedAuth) {
         try {
            const { authenticated, role } = JSON.parse(storedAuth);
            initialAuth = authenticated;
            initialRole = role;
            console.log("Found stored auth:", { initialAuth, initialRole });
         } catch (e) {
            console.error("Failed to parse stored auth state");
            localStorage.removeItem('missionViewAuth'); // Clear invalid state
         }
       }

       setIsAuthenticated(initialAuth);
       setUserRole(initialRole);
       setIsLoading(false); // Mark loading as complete
       console.log("Auth status check complete. IsAuthenticated:", initialAuth, "Role:", initialRole);
    };

    checkAuthStatus();

     // Add event listener for storage changes (e.g., logout in another tab)
     const handleStorageChange = (event) => {
        if (event.key === 'missionViewAuth') {
           if (!event.newValue) { // User logged out
             setIsAuthenticated(false);
             setUserRole(null);
             console.log('Auth state cleared due to storage event.');
           } else {
              try {
                  const { authenticated, role } = JSON.parse(event.newValue);
                  setIsAuthenticated(authenticated);
                  setUserRole(role);
                  console.log('Auth state updated due to storage event.');
              } catch (e) {
                  console.error("Failed to parse stored auth state on storage event");
              }
           }
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
          window.removeEventListener('storage', handleStorageChange);
      };


  }, []);

  // Function to explicitly set auth state and role, persisting it
  const setAuthState = (authenticated, role) => {
     setIsAuthenticated(authenticated);
     setUserRole(role);
     if (authenticated && role) {
       localStorage.setItem('missionViewAuth', JSON.stringify({ authenticated, role }));
       console.log("Auth state persisted:", { authenticated, role });
     } else {
       localStorage.removeItem('missionViewAuth');
        console.log("Auth state cleared from storage.");
     }
  };


  const value = {
    isAuthenticated,
    userRole, // Expose userRole
    setAuthState, // Provide function to set auth state and role together
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
