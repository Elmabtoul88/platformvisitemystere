'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { mockUsers } from '@/app/admin/users/users-mock.js'; // Ensure path is correct

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const setAuthState = useCallback((loggedInUser) => {
    setUser(loggedInUser);
    if (loggedInUser) {
      localStorage.setItem('missionViewAuth', JSON.stringify(loggedInUser));
      console.log("Auth state persisted for:", loggedInUser.name);
    } else {
      localStorage.removeItem('missionViewAuth');
      console.log("Auth state cleared from storage.");
    }
  }, []);

  const logout = useCallback(async () => {
    console.log("Logging out user.");
    setAuthState(null);
    // No need to push here, the effect below will handle it.
  }, [setAuthState]);

  const login = useCallback(async (email, password) => {
    console.log(`Attempting login for email: ${email}`);
    // Simulate async login
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, you'd hash the password and compare it.
    // For simulation, we check plain text against our mock data.
    const foundUser = mockUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password.includes('Password') // Simplified password check for mock
    );
     const isClientLogin = email.toLowerCase() === 'client@gourmet.com' && password === 'password123';
     const isAdminLogin = email.toLowerCase() === 'admin@example.com' && password === 'password123';
     const isShopperLogin = !isClientLogin && !isAdminLogin && email.includes('@') && password.length >= 6;


    let loggedInUser = null;
    if (isClientLogin) {
        loggedInUser = mockUsers.find(u => u.role === 'client' && u.email.toLowerCase() === email.toLowerCase());
    } else if (isAdminLogin) {
        loggedInUser = mockUsers.find(u => u.role === 'admin');
    } else if(isShopperLogin) {
        loggedInUser = mockUsers.find(u => u.role === 'shopper' && u.email.toLowerCase() === email.toLowerCase());
        if (!loggedInUser) loggedInUser = mockUsers.find(u => u.role === 'shopper'); // Fallback to first shopper for demo
    }

    if (loggedInUser) {
        console.log(`Login successful for ${loggedInUser.name}, role: ${loggedInUser.role}`);
        setAuthState(loggedInUser);
        return { success: true, message: "Login successful!" };
    } else {
        console.error("Login failed: Invalid credentials.");
        return { success: false, message: "Invalid email or password." };
    }
  }, [setAuthState]);

  useEffect(() => {
    const checkAuthStatus = () => {
       console.log("Checking auth status from storage...");
       try {
         const storedAuth = localStorage.getItem('missionViewAuth');
         if (storedAuth) {
            const loggedInUser = JSON.parse(storedAuth);
            setUser(loggedInUser);
            console.log("Found stored user:", loggedInUser.name);
         }
       } catch (e) {
          console.error("Failed to parse stored auth state, clearing.");
          localStorage.removeItem('missionViewAuth');
       } finally {
          setIsLoading(false);
          console.log("Auth status check complete.");
       }
    };
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isLoading) return; // Don't run route protection until initial loading is done

    const publicRoutes = ['/login', '/signup'];
    const pathname = window.location.pathname; // Using window.location as router might not be ready
    const isPublic = publicRoutes.includes(pathname);
    const isAuthenticated = !!user;

    if (!isAuthenticated && !isPublic) {
        console.log("Redirecting to /login (unauthenticated access to protected route)");
        router.push('/login');
    } else if (isAuthenticated) {
        const userRole = user.role;
        const isAdminRoute = pathname.startsWith('/admin');
        const isShopperRoute = !isAdminRoute && !isPublic && !pathname.startsWith('/client');
        const isClientRoute = pathname.startsWith('/client');

        if (userRole === 'admin' && !isAdminRoute) {
            console.log("Redirecting admin to /admin");
            router.push('/admin');
        } else if (userRole === 'shopper' && !isShopperRoute) {
            console.log("Redirecting shopper to /");
            router.push('/');
        } else if (userRole === 'client' && !isClientRoute) {
             console.log("Redirecting client to /client");
            router.push('/client');
        }
    }
  }, [user, isLoading, router]);

  const value = {
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    logout,
    setAuthState, // Keep for direct manipulation if ever needed
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
