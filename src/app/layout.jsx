'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ListChecks, CheckSquare, LogIn, Shield, Users, Settings as SettingsIcon, Map } from 'lucide-react'; // Added Admin icons & Map
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
  const { isAuthenticated, userRole, isLoading } = useAuth(); // Get auth state, role, and loading status
  const pathname = usePathname();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- Theme handling (unchanged) ---
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

  // --- Route protection effect ---
  useEffect(() => {
    if (isLoading) {
      return; // Wait until auth status and role are determined
    }

    const isPublicRoute = pathname === '/login' || pathname === '/signup';
    const isAdminRoute = pathname.startsWith('/admin');
    const isShopperRoute = !isPublicRoute && !isAdminRoute; // Routes other than public and admin

    console.log(`Route Protection Check: Path=${pathname}, IsAuth=${isAuthenticated}, Role=${userRole}, IsLoading=${isLoading}, IsAdminRoute=${isAdminRoute}, IsShopperRoute=${isShopperRoute}`);

    if (!isAuthenticated) {
      // If not authenticated, allow only public routes
      if (!isPublicRoute) {
        console.log("Redirecting unauthenticated user to /login");
        router.push('/login');
      }
    } else {
      // If authenticated...
      if (userRole === 'admin') {
        // Allow access to admin routes, redirect from non-admin routes (except potentially settings, chat?)
         // Adjusted check: Allow admin access to /admin/* routes
         if (!isAdminRoute && !isPublicRoute) {
             console.log("Redirecting admin from non-admin/non-public route to /admin");
             router.push('/admin');
         } else if (isPublicRoute) {
            console.log("Redirecting admin from public route to /admin");
             router.push('/admin');
         }
      } else if (userRole === 'shopper') {
        // Allow access to shopper routes, redirect from admin routes
        if (isAdminRoute) {
          console.log("Redirecting shopper from admin route to /");
          router.push('/');
        } else if (isPublicRoute) {
            console.log("Redirecting shopper from public route to /");
            router.push('/');
         }
      } else {
          // Authenticated but no role? Redirect to login to be safe
          console.warn("Authenticated user has no role. Redirecting to /login.");
          if (!isPublicRoute) {
              router.push('/login');
          }
      }
    }
  }, [isAuthenticated, userRole, isLoading, pathname, router]);

  // --- Set document title (unchanged) ---
  useEffect(() => {
    document.title = 'MissionView App';
  }, []);

  // --- Determine header/nav visibility ---
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const showHeaderNav = isAuthenticated && !isAuthPage;
  const showLoginButton = !isAuthenticated && !isAuthPage;

  // --- Loading state ---
   if (isLoading) { // Show loading indicator if auth state is loading AND not on public pages
    return (
        <html lang="en" className={isDarkMode ? 'dark' : ''}>
           <head>
              <meta name="description" content="Manage your mystery shopper missions." />
           </head>
           <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200 justify-center items-center`}>
              <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading Authentication...</span>
              </div>
              <Toaster />
           </body>
        </html>
    );
  }


  // Determine home link based on role
  const homeLink = isAuthenticated ? (userRole === 'admin' ? '/admin' : '/') : '/login';

  return (
    <html lang="en" className={isDarkMode ? 'dark' : ''}>
      <head>
        <meta name="description" content="Manage your mystery shopper missions." />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200`}>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <nav className="container flex h-14 items-center justify-between px-4">
            {/* Logo links to appropriate dashboard or login */}
            <Link href={homeLink} className="flex items-center gap-2 font-bold text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              MissionView {userRole === 'admin' && <span className="text-xs font-normal text-muted-foreground">(Admin)</span>}
            </Link>

            <div className="flex items-center gap-2">
              {showHeaderNav && userRole === 'shopper' && (
                <>
                  {/* Shopper Navigation */}
                  <Button variant={pathname === '/' ? "secondary" : "ghost"} size="sm" asChild>
                    <Link href="/" className="flex items-center gap-1">
                      <Home className="w-4 h-4" /> Available
                    </Link>
                  </Button>
                  <Button variant={pathname === '/missions/assigned' ? "secondary" : "ghost"} size="sm" asChild>
                    <Link href="/missions/assigned" className="flex items-center gap-1">
                      <ListChecks className="w-4 h-4" /> Assigned
                    </Link>
                  </Button>
                   <Button variant={pathname === '/missions/completed' ? "secondary" : "ghost"} size="sm" asChild>
                    <Link href="/missions/completed" className="flex items-center gap-1">
                      <CheckSquare className="w-4 h-4" /> Completed
                    </Link>
                  </Button>
                   {/* Map Link */}
                   <Button variant={pathname === '/map' ? "secondary" : "ghost"} size="sm" asChild>
                     <Link href="/map" className="flex items-center gap-1">
                       <Map className="w-4 h-4" /> Map
                     </Link>
                   </Button>
                  {/* ProfileMenu handles its own dynamic links */}
                  <ProfileMenu />
                </>
              )}
               {showHeaderNav && userRole === 'admin' && (
                <>
                  {/* Admin Navigation */}
                  <Button variant={pathname === '/admin' ? "secondary" : "ghost"} size="sm" asChild>
                    <Link href="/admin" className="flex items-center gap-1">
                      <Shield className="w-4 h-4" /> Dashboard
                    </Link>
                  </Button>
                  <Button variant={pathname.startsWith('/admin/missions') ? "secondary" : "ghost"} size="sm" asChild>
                    <Link href="/admin/missions" className="flex items-center gap-1">
                      <ListChecks className="w-4 h-4" /> Manage Missions
                    </Link>
                  </Button>
                  <Button variant={pathname.startsWith('/admin/users') ? "secondary" : "ghost"} size="sm" asChild>
                    <Link href="/admin/users" className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> Manage Users
                    </Link>
                  </Button>
                  {/* Added Admin Chat Link */}
                   <Button variant={pathname.startsWith('/admin/chat') ? "secondary" : "ghost"} size="sm" asChild>
                     <Link href="/admin/chat" className="flex items-center gap-1">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                         <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
                       </svg>
                       Chat
                     </Link>
                   </Button>
                  {/* ProfileMenu handles its own dynamic links */}
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
               {/* Minimal header for Login/Signup */}
                {isAuthPage && !isAuthenticated && (
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
