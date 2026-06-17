
'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Home, ListChecks, CheckSquare, LogIn, Shield, Users, Settings as SettingsIcon,
    Map, Loader2, FileSignature, Menu, Bell, UserCheck as UserCheckIcon, Briefcase, Building, CreditCard,
    Facebook, Linkedin, Twitter, Mail, Phone, MapPin
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

function Header({ isAuthenticated, userRole, pathname, closeMobileMenu }) {
  const isPublicPage = ['/', '/about', '/services', '/contact', '/login', '/signup'].includes(pathname);
  
  const publicLinks = (
    <>
      <Button variant={pathname === '/' ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
        <Link href="/">Accueil</Link>
      </Button>
      <Button variant={pathname === '/about' ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
        <Link href="/about">À Propos</Link>
      </Button>
      <Button variant={pathname === '/services' ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
        <Link href="/services">Services</Link>
      </Button>
      <Button variant={pathname === '/contact' ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
        <Link href="/contact">Contact</Link>
      </Button>
    </>
  );

  const shopperLinks = (
    <>
      <Button variant={pathname === '/dashboard' ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
        <Link href="/dashboard"><Home className="w-4 h-4 mr-1" /> Missions</Link>
      </Button>
      <Button variant={pathname === '/missions/assigned' ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
        <Link href="/missions/assigned"><ListChecks className="w-4 h-4 mr-1" /> Suivi</Link>
      </Button>
      <Button variant={pathname === '/missions/completed' ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
        <Link href="/missions/completed"><CheckSquare className="w-4 h-4 mr-1" /> Gains</Link>
      </Button>
    </>
  );

  const adminLinks = (
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
    </>
  );

  const clientLinks = (
    <Button variant={pathname === '/client' ? "secondary" : "ghost"} size="sm" asChild onClick={closeMobileMenu}>
        <Link href="/client"><Briefcase className="w-4 h-4 mr-1" /> Mes Projets</Link>
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shadow-sm h-16">
      <nav className="container mx-auto flex h-full items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-black text-primary text-xl">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-accent"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
          <span className="hidden sm:inline">SEC <span className="text-accent font-normal">VISITE MYSTÈRE</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-1 font-bold">
          {!isAuthenticated ? publicLinks : (
            <>
              {userRole === 'admin' ? adminLinks : userRole === 'client' ? clientLinks : shopperLinks}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? <ProfileMenu /> : (
             <Button className="font-black bg-primary text-white hover:bg-primary/90 px-6" asChild>
                <Link href="/login">Espace Membre</Link>
             </Button>
          )}
          
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="w-5 h-5" /></Button></SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader className="mb-8 text-left border-b pb-4"><SheetTitle className="text-primary font-black text-2xl">MENU</SheetTitle></SheetHeader>
                <nav className="flex flex-col gap-4">
                  {!isAuthenticated ? publicLinks : (
                    <>
                      {userRole === 'admin' ? adminLinks : userRole === 'client' ? clientLinks : shopperLinks}
                      <div className="border-t pt-4 mt-2"><ProfileMenu isMobile={true} /></div>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
    return (
        <footer className="bg-primary text-white py-16 border-t border-white/10">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 font-black text-2xl">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-accent"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                        SEC <span className="text-accent font-normal">VISITE MYSTÈRE</span>
                    </div>
                    <p className="text-sm text-primary-foreground/60 leading-relaxed">Spécialiste de l'audit et de l'évaluation de la qualité de service pour les marques d'exception.</p>
                    <div className="flex gap-4">
                        <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-primary transition-all"><Linkedin className="w-5 h-5" /></button>
                        <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-primary transition-all"><Twitter className="w-5 h-5" /></button>
                        <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-primary transition-all"><Facebook className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="space-y-6">
                    <h4 className="font-bold text-accent uppercase tracking-widest text-sm">Navigation</h4>
                    <nav className="flex flex-col gap-4 text-sm text-primary-foreground/80">
                        <Link href="/about" className="hover:text-accent transition-colors">À Propos</Link>
                        <Link href="/services" className="hover:text-accent transition-colors">Nos Services</Link>
                        <Link href="/contact" className="hover:text-accent transition-colors">Nous Contacter</Link>
                        <Link href="/login" className="hover:text-accent transition-colors">Espace Client</Link>
                    </nav>
                </div>

                <div className="space-y-6">
                    <h4 className="font-bold text-accent uppercase tracking-widest text-sm">Services</h4>
                    <nav className="flex flex-col gap-4 text-sm text-primary-foreground/80">
                        <span className="cursor-default">Visites Mystères</span>
                        <span className="cursor-default">Audits Qualité</span>
                        <span className="cursor-default">Analyse concurrentielle</span>
                        <span className="cursor-default">Client Mystère Digital</span>
                    </nav>
                </div>

                <div className="space-y-6">
                    <h4 className="font-bold text-accent uppercase tracking-widest text-sm">Contact</h4>
                    <div className="space-y-4 text-sm text-primary-foreground/80">
                        <div className="flex gap-3"><MapPin className="w-4 h-4 text-accent" /> 123 Avenue de l'Expérience, Paris</div>
                        <div className="flex gap-3"><Phone className="w-4 h-4 text-accent" /> +33 (0)1 23 45 67 89</div>
                        <div className="flex gap-3"><Mail className="w-4 h-4 text-accent" /> contact@sec.com</div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-16 pt-8 border-t border-white/10 text-center text-[10px] text-primary-foreground/40 uppercase tracking-widest">
                © {new Date().getFullYear()} SEC Visite Mystère. TOUS DROITS RÉSERVÉS.
            </div>
        </footer>
    );
}

function AppLayout({ children }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
        <html lang="fr" className="dark">
           <body className="flex h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></body>
        </html>
    );
  }

  // La page login n'affiche pas le header/footer habituel
  const isLoginPage = pathname === '/login' || pathname === '/signup';

  return (
    <html lang="fr">
      <head><title>SEC Visite Mystère</title></head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200`}>
        {!isLoginPage && <Header isAuthenticated={isAuthenticated} userRole={user?.role} pathname={pathname} />}
        <main className="flex-grow">
          <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>{children}</Suspense>
        </main>
        {!isLoginPage && <Footer />}
        <Toaster />
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return <AuthProvider><AppLayout>{children}</AppLayout></AuthProvider>;
}
