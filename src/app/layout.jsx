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
  Menu,
  X,
  Briefcase,
} from "lucide-react";
import { ProfileMenu } from "@/components/profile-menu";
import React, { useEffect, useState, useCallback } from "react";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { MessageProvider, useMessage } from "@/context/message-context";

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
        "(prefers-color-scheme: dark)"
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
    document.title = "MissionView App";
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const showHeaderNav = isAuthenticated && !isAuthPage;
  const showLoginButton = !isAuthenticated && !isAuthPage;

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
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200 justify-center items-center`}
        >
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Loading Session...</span>
          </div>
          <Toaster />
        </body>
      </html>
    );
  }

  const homeLink = isAuthenticated
    ? userRole === "admin"
      ? "/admin"
      : "/"
    : "/login";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200`}
      >
        <header className="header">
          <nav className="header-nav responsive-container">
            {/* Logo */}
            <Link href={homeLink} className="logo text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="logo-icon"
              >
                <path
                  fillRule="evenodd"
                  d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="logo-text">
                MissionView
                {userRole === "admin" && (
                  <span className="admin-badge text-muted-foreground">
                    (Admin)
                  </span>
                )}
              </span>
            </Link>

            {/* Navigation Desktop */}
            <div className="nav-desktop">
              {showHeaderNav && userRole === "shopper" && (
                <>
                  <Button
                    variant={pathname === "/" ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link href="/" className="nav-button">
                      <Home className="w-4 h-4" />
                      <span className="nav-button-text">Available</span>
                    </Link>
                  </Button>
                  <Button
                    variant={
                      pathname === "/missions/assigned" ? "secondary" : "ghost"
                    }
                    size="sm"
                    asChild
                  >
                    <Link href="/missions/assigned" className="nav-button">
                      <ListChecks className="w-4 h-4" />
                      <span className="nav-button-text">Assigned</span>
                    </Link>
                  </Button>
                  <Button
                    variant={
                      pathname === "/missions/completed" ? "secondary" : "ghost"
                    }
                    size="sm"
                    asChild
                  >
                    <Link href="/missions/completed" className="nav-button">
                      <CheckSquare className="w-4 h-4" />
                      <span className="nav-button-text">Completed</span>
                    </Link>
                  </Button>
                  <Button
                    variant={pathname === "/map" ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link href="/map" className="nav-button">
                      <Map className="w-4 h-4" />
                      <span className="nav-button-text">Map</span>
                    </Link>
                  </Button>
                  <ProfileMenu />
                </>
              )}

              {showHeaderNav && userRole === "admin" && (
                <>
                  <Button
                    variant={pathname === "/admin" ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link href="/admin" className="nav-button">
                      <Shield className="w-4 h-4" />
                      <span className="nav-button-text">Dashboard</span>
                    </Link>
                  </Button>
                  <Button
                    variant={
                      pathname.startsWith("/admin/missions")
                        ? "secondary"
                        : "ghost"
                    }
                    size="sm"
                    asChild
                  >
                    <Link href="/admin/missions" className="nav-button">
                      <ListChecks className="w-4 h-4" />
                      <span className="nav-button-text">Missions</span>
                    </Link>
                  </Button>
                  <Button
                    variant={
                      pathname.startsWith("/admin/applications")
                        ? "secondary"
                        : "ghost"
                    }
                    size="sm"
                    asChild
                  >
                    <Link href="/admin/applications" className="nav-button">
                      <UserCheckIcon className="w-4 h-4" />
                      <span className="nav-button-text">Applications</span>
                    </Link>
                  </Button>
                  <div className="relative">
                    <Button
                      variant={
                        pathname.startsWith("/admin/chat")
                          ? "secondary"
                          : "ghost"
                      }
                      size="sm"
                      asChild
                    >
                      <Link href="/admin/chat" className="nav-button">
                        <UserCheckIcon className="w-4 h-4" />
                        <span className="nav-button-text">Chat</span>
                      </Link>
                    </Button>
                    {messageCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {messageCount}
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant={
                      pathname.startsWith("/admin/users")
                        ? "secondary"
                        : "ghost"
                    }
                    size="sm"
                    asChild
                  >
                    <Link href="/admin/users" className="nav-button">
                      <Users className="w-4 h-4" />
                      <span className="nav-button-text">Users</span>
                    </Link>
                  </Button>
                  <ProfileMenu />
                </>
              )}
              {userRole === "client" && (
                <Button
                  variant={pathname === "/client" ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                  onClick={closeMobileMenu}
                >
                  <Link href="/client" className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" /> My Missions
                  </Link>
                </Button>
              )}

              {showLoginButton && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login" className="nav-button">
                    <LogIn className="w-4 h-4" />
                    <span className="nav-button-text">Login</span>
                  </Link>
                </Button>
              )}

              {isAuthPage && !isAuthenticated && (
                <span className="text-sm text-muted-foreground">Welcome</span>
              )}
            </div>

            {/* Navigation Mobile */}
            <div className="nav-mobile">
              {showHeaderNav && <ProfileMenu />}
              {showHeaderNav && (
                <button
                  className="mobile-menu-button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Menu className="w-4 h-4" />
                  )}
                </button>
              )}
              {showLoginButton && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">
                    <LogIn className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
          </nav>

          {/* Menu Mobile Déroulant */}
          {isMobileMenuOpen && showHeaderNav && (
            <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
              <div className="mobile-menu-grid">
                {userRole === "shopper" && (
                  <>
                    <Button
                      variant={pathname === "/" ? "secondary" : "ghost"}
                      size="sm"
                      className="nav-button"
                      onClick={closeMobileMenu}
                      asChild
                    >
                      <Link href="/">
                        <Home className="w-4 h-4" />
                        <span className="nav-button-text">Available</span>
                      </Link>
                    </Button>
                    <Button
                      variant={
                        pathname === "/missions/assigned"
                          ? "secondary"
                          : "ghost"
                      }
                      size="sm"
                      className="nav-button"
                      onClick={closeMobileMenu}
                      asChild
                    >
                      <Link href="/missions/assigned">
                        <ListChecks className="w-4 h-4" />
                        <span className="nav-button-text">Assigned</span>
                      </Link>
                    </Button>
                    <Button
                      variant={
                        pathname === "/missions/completed"
                          ? "secondary"
                          : "ghost"
                      }
                      size="sm"
                      className="nav-button"
                      onClick={closeMobileMenu}
                      asChild
                    >
                      <Link href="/missions/completed">
                        <CheckSquare className="w-4 h-4" />
                        <span className="nav-button-text">Completed</span>
                      </Link>
                    </Button>
                    <Button
                      variant={pathname === "/map" ? "secondary" : "ghost"}
                      size="sm"
                      className="nav-button"
                      onClick={closeMobileMenu}
                      asChild
                    >
                      <Link href="/map">
                        <Map className="w-4 h-4" />
                        <span className="nav-button-text">Map</span>
                      </Link>
                    </Button>
                  </>
                )}

                {userRole === "admin" && (
                  <>
                    <Button
                      variant={pathname === "/admin" ? "secondary" : "ghost"}
                      size="sm"
                      className="nav-button"
                      onClick={closeMobileMenu}
                      asChild
                    >
                      <Link href="/admin">
                        <Shield className="w-4 h-4" />
                        <span className="nav-button-text">Dashboard</span>
                      </Link>
                    </Button>
                    <Button
                      variant={
                        pathname.startsWith("/admin/missions")
                          ? "secondary"
                          : "ghost"
                      }
                      size="sm"
                      className="nav-button"
                      onClick={closeMobileMenu}
                      asChild
                    >
                      <Link href="/admin/missions">
                        <ListChecks className="w-4 h-4" />
                        <span className="nav-button-text">Missions</span>
                      </Link>
                    </Button>
                    <Button
                      variant={
                        pathname.startsWith("/admin/applications")
                          ? "secondary"
                          : "ghost"
                      }
                      size="sm"
                      className="nav-button"
                      onClick={closeMobileMenu}
                      asChild
                    >
                      <Link href="/admin/applications">
                        <UserCheckIcon className="w-4 h-4" />
                        <span className="nav-button-text">Applications</span>
                      </Link>
                    </Button>

                    {/*MOBILE CHAT BUTTON WITH BADGE */}
                    <div className="relative">
                      <Button
                        variant={
                          pathname.startsWith("/admin/chat")
                            ? "secondary"
                            : "ghost"
                        }
                        size="sm"
                        className="nav-button"
                        onClick={closeMobileMenu}
                        asChild
                      >
                        <Link href="/admin/chat">
                          <UserCheckIcon className="w-4 h-4" />
                          <span className="nav-button-text">Chat</span>
                        </Link>
                      </Button>
                      {messageCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {messageCount}
                        </Badge>
                      )}
                    </div>

                    <Button
                      variant={
                        pathname.startsWith("/admin/users")
                          ? "secondary"
                          : "ghost"
                      }
                      size="sm"
                      className="nav-button"
                      onClick={closeMobileMenu}
                      asChild
                    >
                      <Link href="/admin/users">
                        <Users className="w-4 h-4" />
                        <span className="nav-button-text">Users</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </header>

        <main className="main-content">{children}</main>

        <footer className="footer bg-secondary/50">
          <div className="responsive-container">
            <div className="text-muted-foreground">
              © {new Date().getFullYear()} MissionView App. All rights reserved.
            </div>
          </div>
        </footer>

        <Toaster />
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <MessageProvider>
        <AppLayout>{children}</AppLayout>
      </MessageProvider>
    </AuthProvider>
  );
}
