'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ListChecks, CheckSquare, LogIn } from 'lucide-react'; // Added LogIn
import { ProfileMenu } from '@/components/profile-menu';
import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/auth-context'; // Import AuthProvider and useAuth
import { usePathname, useRouter } from 'next/navigation'; // Import usePathname and useRouter
import { Toaster } from '@/components/ui/toaster'; // Ensure Toaster is available globally

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Component responsible for layout structure and conditional rendering
function AppLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth(); // Get auth state and loading status
  const pathname = usePathname();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme handling effect
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = storedTheme === 'dark' || (!storedTheme && prefersDark);

    setIsDarkMode(initialDarkMode);
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const handleStorageChange = (event) => {
      if (event.key === 'theme') {
        const newTheme = event.newValue;
        setIsDarkMode(newTheme === 'dark');
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Route protection effect
  useEffect(() => {
    // Don't run protection logic until auth state is determined
    if (isLoading) {
      return;
    }

    const isPublicRoute = pathname === '/login' || pathname === '/signup';

    // If not authenticated and trying to access a protected route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Set document title
  useEffect(() => {
    document.title = 'MissionView App';
  }, []);

  // Determine if header/nav should be shown
  const showHeaderNav = isAuthenticated && pathname !== '/login' && pathname !== '/signup';
  const showLoginButton = !isAuthenticated && pathname !== '/login' && pathname !== '/signup';

  // Show a loading state or null while authentication status is being determined
  if (isLoading && pathname !== '/login' && pathname !== '/signup') {
    // Optional: Add a loading spinner or skeleton screen here
    return (
        <html lang="en" className={isDarkMode ? 'dark' : ''}>
           <head>
              <meta name="description" content="Manage your mystery shopper missions." />
           </head>
           <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200 justify-center items-center`}>
              {/* Basic Loading Indicator */}
              <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading...</span>
              </div>
              <Toaster />
           </body>
        </html>
    );
  }


  return (
    <html lang="en" className={isDarkMode ? 'dark' : ''}>
      <head>
        <meta name="description" content="Manage your mystery shopper missions." />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200`}>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <nav className="container flex h-14 items-center justify-between px-4">
            <Link href={isAuthenticated ? "/" : "/login"} className="flex items-center gap-2 font-bold text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              MissionView
            </Link>
            <div className="flex items-center gap-2">
              {showHeaderNav && (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/" className="flex items-center gap-1">
                      <Home className="w-4 h-4" /> Available
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/missions/assigned" className="flex items-center gap-1">
                      <ListChecks className="w-4 h-4" /> Assigned
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/missions/completed" className="flex items-center gap-1">
                      <CheckSquare className="w-4 h-4" /> Completed
                    </Link>
                  </Button>
                  <ProfileMenu />
                </>
              )}
               {showLoginButton && (
                 <Button variant="outline" size="sm" asChild>
                   <Link href="/login" className="flex items-center gap-1">
                     <LogIn className="w-4 h-4" /> Login
                   </Link>
                 </Button>
               )}
               {/* Login/Signup pages show minimal header */}
                {(pathname === '/login' || pathname === '/signup') && !isAuthenticated && (
                    <span className="text-sm text-muted-foreground">Welcome</span>
                )}
            </div>
          </nav>
        </header>
        <div className="flex-grow">
          {children}
        </div>
        <footer className="py-4 border-t bg-secondary/50">
          <div className="container text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} MissionView App. All rights reserved.
          </div>
        </footer>
        <Toaster /> {/* Global Toaster */}
      </body>
    </html>
  );
}

// RootLayout now wraps the AppLayout with the AuthProvider
export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <AppLayout>{children}</AppLayout>
    </AuthProvider>
  );
}
