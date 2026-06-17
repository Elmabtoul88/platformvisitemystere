
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { mockUsers } from '@/app/admin/users/users-mock.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const setAuthState = useCallback((loggedInUser) => {
    setUser(loggedInUser);
    if (loggedInUser) {
      localStorage.setItem('missionViewAuth', JSON.stringify(loggedInUser));
    } else {
      localStorage.removeItem('missionViewAuth');
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState(null);
    router.push('/');
  }, [setAuthState, router]);

  const login = useCallback(async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulations simples pour le prototype
    const isClientLogin = email.toLowerCase() === 'client@gourmet.com' && password === 'password123';
    const isAdminLogin = email.toLowerCase() === 'admin@example.com' && password === 'password123';
    const isShopperLogin = email.toLowerCase() === 'alex@example.com' && password === 'password123';

    let loggedInUser = null;
    if (isClientLogin) {
        loggedInUser = mockUsers.find(u => u.role === 'client' && u.email.toLowerCase() === email.toLowerCase());
    } else if (isAdminLogin) {
        loggedInUser = mockUsers.find(u => u.role === 'admin');
    } else if(isShopperLogin) {
        loggedInUser = mockUsers.find(u => u.role === 'shopper' && u.email.toLowerCase() === email.toLowerCase());
    }

    if (loggedInUser) {
        setAuthState(loggedInUser);
        return { success: true, message: "Connexion réussie !" };
    } else {
        return { success: false, message: "Email ou mot de passe incorrect." };
    }
  }, [setAuthState]);

  useEffect(() => {
    const checkAuthStatus = () => {
       try {
         const storedAuth = localStorage.getItem('missionViewAuth');
         if (storedAuth) {
            const loggedInUser = JSON.parse(storedAuth);
            setUser(loggedInUser);
         }
       } catch (e) {
          localStorage.removeItem('missionViewAuth');
       } finally {
          setIsLoading(false);
       }
    };
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // Pages accessibles sans connexion
    const publicRoutes = ['/', '/login', '/signup', '/about', '/services', '/contact'];
    const isPublic = publicRoutes.includes(pathname);
    const isAuthenticated = !!user;

    // Protection des routes privées uniquement
    if (!isAuthenticated && !isPublic) {
        router.push('/login');
    } else if (isAuthenticated) {
        // Redirection intelligente si on essaie d'aller sur login/signup alors qu'on est connecté
        if (pathname === '/login' || pathname === '/signup') {
            if (user.role === 'admin') router.push('/admin');
            else if (user.role === 'client') router.push('/client');
            else router.push('/dashboard');
        }
    }
  }, [user, isLoading, pathname, router]);

  const value = {
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    logout,
    setAuthState,
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
