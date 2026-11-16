"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./responsive.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Home,
  ListChecks,
  CheckSquare,
  LogIn,
  Shield,
  Users,
  Map,
  UserCheck as UserCheckIcon,
  Building,
  Menu,
  X,
  Briefcase,
  Info,
  Phone,
  Mail,
  Layers,
  LayoutDashboard,
  Sparkles,
  CreditCard,
  Settings,
} from "lucide-react";
import { ProfileMenu } from "@/components/profile-menu";
import React, { useEffect, useState, useCallback } from "react";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { QueryProvider } from "@/context/query-provider";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { MessageProvider, useMessage } from "@/context/message-context";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function AppLayout({ children }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const userRole = user?.role;
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { messageCount } = useMessage();

  // Theme handling
  useEffect(() => {
    const applyTheme = () => {
      const storedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const initialDarkMode =
        storedTheme === "dark" || (!storedTheme && prefersDark);
      setIsDarkMode(initialDarkMode);
      document.documentElement.classList.toggle("dark", initialDarkMode);
    };

    applyTheme();

    const handleStorageChange = (event) => {
      if (event.key === "theme") {
        applyTheme();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (!localStorage.getItem("theme")) {
        applyTheme();
      }
    };
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    document.title = "EmbertonGroup";
  }, []);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname?.startsWith("/reset-password");
  const isAdminPath = pathname?.startsWith("/admin");
  const isPublicPage = [
    "/",
    "/about",
    "/contact",
    "/services",
    "/dashboard",
    "/forgot-password",
    "/reset-password",
  ].includes(pathname);
  const showHeaderNav = isAuthenticated && !isAuthPage && !isAdminPath;
  const showPublicNav = !isAuthenticated && !isAuthPage && !isAdminPath;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (isLoading) {
    return (
      <html lang="en" className={isDarkMode ? "dark" : ""}>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="Manage your mystery shopper missions."
          />
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-[#D6C799] text-[#041F40] transition-colors duration-200 justify-center items-center`}
        >
          <div className="flex items-center space-x-3 bg-[#041F40]/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-[#041F40]/10">
            <Loader2 className="h-5 w-5 animate-spin text-[#041F40]" />
            <span className="text-[#041F40] font-medium">
              Chargement de la session...
            </span>
          </div>
          <Toaster />
        </body>
      </html>
    );
  }

  const homeLink = isAuthenticated
    ? userRole === "admin"
      ? "/admin"
      : userRole === "client"
        ? "/client"
        : "/"
    : "/";

  // Navigation items par rôle
  const publicNavItems = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/about", label: "À propos", icon: Info },
    { href: "/services", label: "Services", icon: Layers },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  const shopperNavItems = [
    { href: "/", label: "Disponibles", icon: Home },
    { href: "/missions/assigned", label: "Assignées", icon: ListChecks },
    { href: "/missions/completed", label: "Terminées", icon: CheckSquare },
    { href: "/map", label: "Carte", icon: Map },
  ];

  const adminNavItems = [
    { href: "/admin", label: "Tableau de bord", icon: Shield },
    { href: "/admin/missions", label: "Missions", icon: ListChecks },
    { href: "/admin/applications", label: "Candidatures", icon: UserCheckIcon },
    { href: "/admin/stores", label: "Magasins", icon: Building },
    { href: "/admin/payments", label: "Paiements", icon: CreditCard },
    {
      href: "/admin/chat",
      label: "Chat",
      icon: UserCheckIcon,
      badge: messageCount > 0 ? messageCount : null,
    },
    { href: "/admin/users", label: "Utilisateurs", icon: Users },
    { href: "/admin/settings", label: "Paramètres", icon: Settings },
  ];

  const clientNavItems = [
    { href: "/client", label: "Mes Missions", icon: Briefcase },
  ];

  // Fonction pour rendre les éléments de navigation
  const renderNavItems = (items, isMobile = false) => {
    return items.map((item) => {
      const isActive =
        pathname === item.href ||
        (item.href !== "/" && pathname.startsWith(item.href));

      return (
        <Button
          key={item.href}
          variant={isActive ? "default" : "ghost"}
          size="sm"
          asChild
          onClick={isMobile ? closeMobileMenu : undefined}
          className={
            isMobile
              ? "nav-button w-full justify-start text-[#041F40] hover:bg-[#041F40]/10"
              : "nav-button text-[#041F40] hover:bg-[#041F40]/10"
          }
          style={
            isActive
              ? {
                  backgroundColor: "#041F40",
                  color: "#D6C799",
                }
              : {}
          }
        >
          <Link href={item.href} className="flex items-center gap-2">
            <item.icon className="w-4 h-4" />
            <span className="nav-button-text">{item.label}</span>
            {item.badge && (
              <Badge
                variant="destructive"
                className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-[#041F40] text-[#D6C799]"
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        </Button>
      );
    });
  };

  return (
    <html lang="en" className={isDarkMode ? "dark" : ""}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta
          name="description"
          content="Manage your mystery shopper missions."
        />
        <meta name="theme-color" content="#041F40" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen ${
          isAdminPath ? "bg-slate-100" : "bg-[#D6C799]"
        } text-[#041F40] transition-colors duration-200`}
      >
        {!isAdminPath && (
          <header className="header bg-[#D6C799] border-b border-[#041F40]/10 shadow-sm">
            <nav className="header-nav responsive-container">
              {/* Logo */}
              <Link
                href={homeLink}
                className="logo flex items-center gap-2 text-[#041F40]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="logo-icon w-8 h-8 text-[#041F40]"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="logo-text font-bold text-xl tracking-tight">
                  EmbertonGroup
                  {isAuthenticated && userRole === "admin" && (
                    <span className="admin-badge text-[#041F40]/60 text-xs font-medium ml-1">
                      (Admin)
                    </span>
                  )}
                  {isAuthenticated && userRole === "client" && (
                    <span className="admin-badge text-[#041F40]/60 text-xs font-medium ml-1">
                      (Client)
                    </span>
                  )}
                </span>
              </Link>

              {/* Navigation Desktop */}
              <div className="nav-desktop flex items-center gap-1">
                {/* Navigation publique (non authentifié) */}
                {showPublicNav && (
                  <>
                    {renderNavItems(publicNavItems)}
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                      className="bg-[#041F40] text-[#D6C799] hover:bg-[#041F40]/90"
                    >
                      <Link href="/login" className="nav-button">
                        <LogIn className="w-4 h-4" />
                        <span className="nav-button-text">Connexion</span>
                      </Link>
                    </Button>
                  </>
                )}

                {/* Navigation Shopper */}
                {showHeaderNav && userRole === "shopper" && (
                  <>
                    {renderNavItems(shopperNavItems)}
                    <ProfileMenu />
                  </>
                )}

                {/* Navigation Admin */}
                {showHeaderNav && userRole === "admin" && (
                  <>
                    {renderNavItems(adminNavItems)}
                    <ProfileMenu />
                  </>
                )}

                {/* Navigation Client */}
                {showHeaderNav && userRole === "client" && (
                  <>
                    {renderNavItems(clientNavItems)}
                    <ProfileMenu />
                  </>
                )}

                {/* Pages d'authentification */}
                {isAuthPage && !isAuthenticated && (
                  <span className="text-sm text-[#041F40]/60 font-medium">
                    Bienvenue
                  </span>
                )}
              </div>

              {/* Navigation Mobile */}
              <div className="nav-mobile flex items-center gap-2">
                {showHeaderNav && <ProfileMenu />}
                {(showHeaderNav || showPublicNav) && (
                  <button
                    className="mobile-menu-button p-2 rounded-lg hover:bg-[#041F40]/10 transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-5 h-5 text-[#041F40]" />
                    ) : (
                      <Menu className="w-5 h-5 text-[#041F40]" />
                    )}
                  </button>
                )}
                {showPublicNav && !isMobileMenuOpen && (
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                    className="bg-[#041F40] text-[#D6C799] hover:bg-[#041F40]/90"
                  >
                    <Link href="/login">
                      <LogIn className="w-4 h-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </nav>

            {/* Menu Mobile Déroulant */}
            {isMobileMenuOpen && (showHeaderNav || showPublicNav) && (
              <div
                className={`mobile-menu ${isMobileMenuOpen ? "open" : ""} bg-[#D6C799] border-t border-[#041F40]/10 shadow-lg`}
              >
                <div className="mobile-menu-grid p-4 space-y-1">
                  {showPublicNav && renderNavItems(publicNavItems, true)}
                  {showPublicNav && (
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                      onClick={closeMobileMenu}
                      className="w-full justify-start mt-2 bg-[#041F40] text-[#D6C799] hover:bg-[#041F40]/90"
                    >
                      <Link href="/login" className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        <span>Connexion</span>
                      </Link>
                    </Button>
                  )}
                  {showHeaderNav &&
                    userRole === "shopper" &&
                    renderNavItems(shopperNavItems, true)}
                  {showHeaderNav &&
                    userRole === "admin" &&
                    renderNavItems(adminNavItems, true)}
                  {showHeaderNav &&
                    userRole === "client" &&
                    renderNavItems(clientNavItems, true)}
                </div>
              </div>
            )}
          </header>
        )}

        <main className={`main-content flex-1 ${isAdminPath ? "p-0" : ""}`}>
          {children}
        </main>

        {!isAdminPath && (
          <footer className="footer bg-[#041F40] text-white border-t border-[#D6C799]/30 pt-12 pb-8">
            <div className="responsive-container">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-white/10">
                <div className="space-y-3 md:col-span-1">
                  <div className="flex items-center gap-2 text-[#D6C799]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-7 h-7 text-[#D6C799]"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-bold text-lg tracking-tight text-white">
                      Emberton<span className="text-[#D6C799]">Group</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Leader du shopping mystère et de l'audit de performance de l'expérience client d'exception.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6C799] mb-3">
                    Navigation
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li>
                      <Link href="/" className="hover:text-white transition-colors">
                        Accueil
                      </Link>
                    </li>
                    <li>
                      <Link href="/services" className="hover:text-white transition-colors">
                        Nos Services
                      </Link>
                    </li>
                    <li>
                      <Link href="/about" className="hover:text-white transition-colors">
                        À propos
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard" className="hover:text-white transition-colors">
                        Tableau de bord
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6C799] mb-3">
                    Espace Shopper
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li>
                      <Link href="/signup" className="hover:text-white transition-colors">
                        Devenir Client Mystère
                      </Link>
                    </li>
                    <li>
                      <Link href="/login" className="hover:text-white transition-colors">
                        Espace Connexion
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="hover:text-white transition-colors">
                        Support & Contact
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6C799] mb-3">
                    Contactez-nous
                  </h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#D6C799]" />
                      contact@embertongroup.com
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#D6C799]" />
                      +33 (0)1 42 68 55 00
                    </p>
                    <p className="flex items-center gap-2">
                      <Map className="w-3.5 h-3.5 text-[#D6C799]" />
                      Paris & Casablanca
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
                <div>
                  © {new Date().getFullYear()} Emberton Group. Tous droits réservés.
                </div>
                <div className="flex gap-6">
                  <span className="hover:text-white cursor-pointer transition-colors">Confidentialité</span>
                  <span className="hover:text-white cursor-pointer transition-colors">Mentions Légales</span>
                  <span className="hover:text-white cursor-pointer transition-colors">Conditions Générales</span>
                </div>
              </div>
            </div>
          </footer>
        )}

        <PwaInstallPrompt />
        <Toaster />
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <MessageProvider>
          <AppLayout>{children}</AppLayout>
        </MessageProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
