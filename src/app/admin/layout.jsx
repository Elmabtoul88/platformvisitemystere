"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useMessage } from "@/context/message-context";
import {
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  UserCheck,
  Users,
  Store,
  CreditCard,
  MessageSquare,
  Settings,
  ShieldCheck,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Shield,
  Bell,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { messageCount } = useMessage();

  // État de réduction de la sidebar (Desktop)
  const [isCollapsed, setIsCollapsed] = useState(false);
  // État du tiroir mobile
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Fermer le menu mobile lors d'un changement de route
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Si non authentifié ou pas admin (laisser auth middleware gérer la redirection ou afficher chargement)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-[#D6C799] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Chargement de l'espace administration...</span>
        </div>
      </div>
    );
  }

  // Groupes de navigation pour toutes les pages d'administration
  const navigationGroups = [
    {
      groupTitle: "Vue d'ensemble",
      items: [
        {
          label: "Tableau de bord",
          href: "/admin",
          icon: LayoutDashboard,
          exact: true,
        },
      ],
    },
    {
      groupTitle: "Missions & Audits",
      items: [
        {
          label: "Toutes les Missions",
          href: "/admin/missions",
          icon: ListChecks,
          exact: true,
        },
        {
          label: "Créer une Mission",
          href: "/admin/missions/new",
          icon: PlusCircle,
          exact: true,
        },
        {
          label: "Candidatures",
          href: "/admin/applications",
          icon: UserCheck,
          exact: false,
        },
      ],
    },
    {
      groupTitle: "Réseau & Utilisateurs",
      items: [
        {
          label: "Utilisateurs & Shoppers",
          href: "/admin/users",
          icon: Users,
          exact: false,
        },
        {
          label: "Magasins & Réseau",
          href: "/admin/stores",
          icon: Store,
          exact: false,
        },
      ],
    },
    {
      groupTitle: "Finances & Communication",
      items: [
        {
          label: "Gestion des Paiements",
          href: "/admin/payments",
          icon: CreditCard,
          exact: false,
          highlight: true,
        },
        {
          label: "Messagerie & Chat",
          href: "/admin/chat",
          icon: MessageSquare,
          exact: false,
          badge: messageCount > 0 ? messageCount : null,
        },
      ],
    },
    {
      groupTitle: "Configuration & Profil",
      items: [
        {
          label: "Paramètres Admin",
          href: "/admin/settings",
          icon: Settings,
          exact: false,
        },
        {
          label: "Sécurité & Mot de passe",
          href: "/admin/security",
          icon: ShieldCheck,
          exact: false,
        },
        {
          label: "Voir le Site Public",
          href: "/",
          icon: ExternalLink,
          exact: true,
          external: true,
        },
      ],
    },
  ];

  // Helper pour déterminer si une page est active
  const isItemActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  // Trouver le titre de la page courante
  let currentPageTitle = "Administration";
  for (const group of navigationGroups) {
    for (const item of group.items) {
      if (isItemActive(item)) {
        currentPageTitle = item.label;
        break;
      }
    }
  }

  // Rendu des liens de navigation
  const renderNavLinks = (isMobile = false) => {
    return (
      <div className="space-y-6">
        {navigationGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            {!isCollapsed && (
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#D6C799]/70 select-none">
                {group.groupTitle}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isItemActive(item);

                const linkElement = (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => isMobile && setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      active
                        ? "bg-[#D6C799] text-[#041F40] font-semibold shadow-md shadow-black/20"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    } ${isCollapsed && !isMobile ? "justify-center px-2" : ""}`}
                  >
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                        active
                          ? "text-[#041F40]"
                          : item.highlight
                          ? "text-[#D6C799]"
                          : "text-slate-400 group-hover:text-white"
                      }`}
                    />

                    {(!isCollapsed || isMobile) && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {(!isCollapsed || isMobile) && item.badge && (
                      <Badge
                        variant="destructive"
                        className="ml-auto bg-red-500 text-white hover:bg-red-600 text-xs px-2 py-0.5 rounded-full"
                      >
                        {item.badge}
                      </Badge>
                    )}

                    {(!isCollapsed || isMobile) && item.external && (
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-50 ml-auto" />
                    )}
                  </Link>
                );

                if (isCollapsed && !isMobile) {
                  return (
                    <Tooltip key={item.href} delayDuration={100}>
                      <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
                      <TooltipContent side="right" className="bg-[#041F40] text-[#D6C799] border border-[#D6C799]/30 font-medium">
                        {item.label}
                        {item.badge && ` (${item.badge})`}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return linkElement;
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row antialiased">
        {/* ============================================================== */}
        {/* 1. SIDEBAR DESKTOP (MENU LATÉRAL FIXE)                         */}
        {/* ============================================================== */}
        <aside
          className={`hidden lg:flex flex-col flex-shrink-0 bg-[#041F40] text-white border-r border-[#041F40]/20 transition-all duration-300 relative select-none ${
            isCollapsed ? "w-20" : "w-64 xl:w-72"
          }`}
        >
          {/* Header de la sidebar avec Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 overflow-hidden ${
                isCollapsed ? "justify-center w-full" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#D6C799] flex items-center justify-center flex-shrink-0 shadow-md">
                <Shield className="w-5 h-5 text-[#041F40]" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col leading-tight">
                  <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                    MISSION<span className="text-[#D6C799]">VIEW</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#D6C799] tracking-wider uppercase">
                    Espace Admin
                  </span>
                </div>
              )}
            </Link>

            {/* Bouton pour réduire / agrandir la sidebar */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Réduire le menu"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bouton pour ré-agrandir en mode réduit */}
          {isCollapsed && (
            <div className="py-2 flex justify-center border-b border-white/10">
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="p-1.5 rounded-lg text-[#D6C799] hover:bg-white/10 transition-colors"
                title="Agrandir le menu"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Liste de navigation scrollable */}
          <div className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin scrollbar-thumb-white/10">
            {renderNavLinks(false)}
          </div>

          {/* Bas de sidebar : Profil Administrateur & Déconnexion */}
          <div className="p-3 border-t border-white/10 bg-[#041F40]/80">
            <div
              className={`flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 ${
                isCollapsed ? "justify-center p-1.5" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#D6C799]/20 border border-[#D6C799]/40 flex items-center justify-center text-sm font-bold text-[#D6C799] flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-white truncate">
                    {user?.name || "Administrateur"}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user?.email || "admin@missionview.com"}
                  </div>
                </div>
              )}

              {!isCollapsed && (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {isCollapsed && (
              <div className="mt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ============================================================== */}
        {/* 2. MENU LATÉRAL MOBILE (DRAWER EN SUPERPOSITION)               */}
        {/* ============================================================== */}
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop assombrissant */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Volet coulissant */}
            <div className="relative w-72 max-w-[80vw] bg-[#041F40] text-white flex flex-col h-full shadow-2xl z-10">
              <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#D6C799] flex items-center justify-center text-[#041F40]">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-white">
                    MISSION<span className="text-[#D6C799]">VIEW</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5">
                {renderNavLinks(true)}
              </div>

              <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#D6C799] text-[#041F40] font-bold flex items-center justify-center text-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">
                        {user?.name || "Administrateur"}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. ZONE PRINCIPALE : TOPBAR + CONTENU DES PAGES ADMIN          */}
        {/* ============================================================== */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
          {/* Header interne de l'administration */}
          <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            {/* Côté gauche : Bouton mobile + Titre de la page */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-black hover:bg-slate-100 transition-colors"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Admin
                </span>
                <span className="hidden sm:inline-block text-slate-300">/</span>
                <h1 className="text-base sm:text-lg font-bold text-[#041F40] truncate">
                  {currentPageTitle}
                </h1>
              </div>
            </div>

            {/* Côté droit : Raccourcis et Profil */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/admin/chat">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-slate-600 hover:text-[#041F40] hover:bg-slate-100"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden md:inline-block ml-1.5 text-xs">Messages</span>
                  {messageCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {messageCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/admin/missions/new">
                <Button
                  size="sm"
                  className="bg-[#041F40] hover:bg-[#041F40]/90 text-white font-medium shadow-sm flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4 text-[#D6C799]" />
                  <span className="hidden sm:inline-block text-xs">Nouvelle Mission</span>
                </Button>
              </Link>

              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

              <div className="flex items-center gap-2 pl-1">
                <div className="w-8 h-8 rounded-full bg-[#041F40] text-[#D6C799] flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-[10px] text-slate-500">Super Admin</p>
                </div>
              </div>
            </div>
          </header>

          {/* Contenu de la page avec fond neutre et padding responsive */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-100/70">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
