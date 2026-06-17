'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Home, ListChecks, CheckSquare, LogIn, Shield, Users, Settings as SettingsIcon,
    Map, Loader2, FileSignature, Menu, Bell, UserCheck as UserCheckIcon, Briefcase, Building, CreditCard
} from 'lucide-react';
import { ProfileMenu } from '@/components/profile-menu';
import React, { useEffect, useState, Suspense } from 'react';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

function AppLayout({ children }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const userRole = user?.role;
  const pathname = usePathname();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const showHeaderNav = isAuthenticated && !isAuthPage;
  const showLoginButton = !isAuthenticated && !isAuthPage;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (isLoading) {
    return (
        <html lang="fr" className={isDarkMode ? 'dark' : ''}>
           <body className="flex h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></body>
        </html>
    );
  }

  const homeLink = isAuthenticated ? (userRole === 'admin' ? '/admin' : userRole === 'client' ? '/client' : '/') : '/login';

  const commonNavLinks = (
    <>
      {userRole === 'shopper' && (
        <>
          <Button variant={pathname === '/' ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
            <Link href="/"><Home className="w-4 h-4 mr-1" /> Disponibles</Link>
          </Button>
          <Button variant={pathname === '/missions/assigned' ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
            <Link href="/missions/assigned"><ListChecks className="w-4 h-4 mr-1" /> Mes Missions</Link>
          </Button>
          <Button variant={pathname === '/missions/completed' ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
            <Link href="/missions/completed"><CheckSquare className="w-4 h-4 mr-1" /> Terminées & Gains</Link>
          </Button>
          <Button variant={pathname === '/map' ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
            <Link href="/map"><Map className="w-4 h-4 mr-1" /> Carte</Link>
          </Button>
        </>
      )}
      {userRole === 'admin' && (
        <>
          <Button variant={pathname === '/admin' ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
            <Link href="/admin"><Shield className="w-4 h-4 mr-1" /> Dashboard</Link>
          </Button>
          <Button variant={pathname.startsWith('/admin/missions') ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
            <Link href="/admin/missions"><FileSignature className="w-4 h-4 mr-1" /> Missions</Link>
          </Button>
          <Button variant={pathname.startsWith('/admin/payments') ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
            <Link href="/admin/payments"><CreditCard className="w-4 h-4 mr-1" /> Paiements</Link>
          </Button>
          <Button variant={pathname.startsWith('/admin/applications') ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
            <Link href="/admin/applications"><UserCheckIcon className="w-4 h-4 mr-1" /> Candidatures</Link>
          </Button>
          <Button variant={pathname.startsWith('/admin/users') ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
            <Link href="/admin/users"><Users className="w-4 h-4 mr-1" /> Utilisateurs</Link>
          </Button>
        </>
      )}
      {userRole === 'client' && (
         <Button variant={pathname === '/client' ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
            <Link href="/client"><Briefcase className="w-4 h-4 mr-1" /> Mes Projets</Link>
          </Button>
      )}
    </>
  );

  return (
    <html lang="fr" className={isDarkMode ? 'dark' : ''}>
      <head><title>MissionView</title><meta name="description" content="Plateforme de Visite Mystère" /></head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200`}>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shadow-sm">
          <nav className="container flex h-14 items-center justify-between px-4">
            <Link href={homeLink} className="flex items-center gap-2 font-bold text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
              MissionView
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {showHeaderNav && commonNavLinks}
              {isAuthenticated && <ProfileMenu />}
              {showLoginButton && <Button variant="outline" size="sm" asChild><Link href="/login"><LogIn className="w-4 h-4 mr-1" /> Connexion</Link></Button>}
            </div>

            <div className="md:hidden">
              {isAuthenticated && (
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="w-5 h-5" /></Button></SheetTrigger>
                  <SheetContent side="right" className="w-[280px]">
                    <SheetHeader className="mb-4 text-left"><SheetTitle className="text-primary font-bold">MissionView Menu</SheetTitle></SheetHeader>
                    <nav className="flex flex-col gap-2">
                      {showHeaderNav && commonNavLinks}
                      {isAuthenticated && <div className="border-t pt-2 mt-2"><ProfileMenu isMobile={true} onLinkClick={closeMobileMenu} /></div>}
                    </nav>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </nav>
        </header>
        <main className="flex-grow">
          <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>{children}</Suspense>
        </main>
        <footer className="py-4 border-t bg-secondary/30 text-center text-[10px] text-muted-foreground">
          © {new Date().getFullYear()} MissionView Mystery Shopping. Tous droits réservés.
        </footer>
        <Toaster />
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return <AuthProvider><AppLayout>{children}</AppLayout></AuthProvider>;
}
