"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useMessage } from "@/context/message-context";

const CHAT_NOTIFICATION_KEY = "chatNotificationCount";

export function ProfileMenu({ isMobile = false, onLinkClick }) {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, userRole, user, logout } = useAuth(); // Ajout de 'user'
  const { messageCount } = useMessage();

  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const updateCountFromStorage = () => {
      try {
        const count = parseInt(
          localStorage.getItem(CHAT_NOTIFICATION_KEY) || "0",
          10
        );
        setNotificationCount(count);
      } catch (error) {
        console.error(
          "Failed to read notification count from localStorage:",
          error
        );
        setNotificationCount(0);
      }
    };

    updateCountFromStorage();
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleStorageChange = (event) => {
    if (event.key === CHAT_NOTIFICATION_KEY) {
      const count = parseInt(event.newValue || "0", 10);
      setNotificationCount(count);
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    if (onLinkClick) onLinkClick();
    router.push("/login");
  };

  const handleChatClick = () => {
    setNotificationCount(0);
    try {
      localStorage.setItem(CHAT_NOTIFICATION_KEY, "0");
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: CHAT_NOTIFICATION_KEY,
          newValue: "0",
          storageArea: localStorage,
        })
      );
    } catch (error) {
      console.error(
        "Failed to reset notification count in localStorage:",
        error
      );
    }
    if (onLinkClick) onLinkClick();
  };

  const handleSettingsClick = () => {
    if (onLinkClick) onLinkClick();
  };

  if (!isAuthenticated) {
    return null;
  }

  const chatLink = userRole === "admin" ? "/admin/chat" : "/chat";
  const settingsLink = userRole === "admin" ? "/admin/settings" : "/settings";
  
  // Extraire nom et initiales
  const userName = user?.name || "User";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  // Version mobile avec nom
  if (isMobile) {
    return (
      <div className="flex flex-col gap-1 w-full">
        {/* Affichage du profil shopper */}
        {userRole === "shopper" && (
          <div className="flex items-center gap-3 p-3 border-b">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profilePicUrl} alt={userName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{userName}</span>
              <span className="text-xs text-muted-foreground">Shopper</span>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          asChild
          onClick={handleChatClick}
          className="justify-start"
        >
          <Link href={chatLink} className="flex items-center gap-2 w-full">
            <Bell className="w-4 h-4" />
            <span>Chat</span>
            {notificationCount > 0 || messageCount > 0 ? (
    <Badge
      variant="destructive"
      className="ml-auto text-xs px-1.5 py-0.5"
    >
      {notificationCount + messageCount}
    </Badge>
  ) : null}
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          asChild
          onClick={handleSettingsClick}
          className="justify-start"
        >
          <Link href={settingsLink} className="flex items-center gap-2 w-full">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogoutClick}
          className="justify-start text-destructive hover:bg-destructive/10 w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Logout</span>
        </Button>
      </div>
    );
  }

  // Version desktop avec avatar et nom
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Button
            variant="outline"
            className="h-8 gap-2 px-2 rounded-full"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user?.profilePicUrl} alt={userName} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {userRole === "shopper" && (
              <span className="hidden sm:inline-block text-sm font-medium max-w-[100px] truncate">
                {userName}
              </span>
            )}
            <span className="sr-only">Open user menu</span>
          </Button>
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 flex items-center justify-center rounded-full text-[10px] pointer-events-none"
            >
              {notificationCount}
            </Badge>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profilePicUrl} alt={userName} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{userName}</span>
              <span className="text-xs text-muted-foreground font-normal">
                {userRole === "admin" ? "Administrator" : "Shopper"}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild onClick={handleChatClick}>
          <Link href={chatLink} className="flex items-center cursor-pointer">
            <Bell className="mr-2 h-4 w-4" />
            <span>Chat</span>
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-auto text-xs px-1.5 py-0.5"
              >
                {notificationCount}
              </Badge>
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild onClick={handleSettingsClick}>
          <Link
            href={settingsLink}
            className="flex items-center cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogoutClick}
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}