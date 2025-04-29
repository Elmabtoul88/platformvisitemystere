'use client';

import React, { useState } from 'react'; // Import useState
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge'; // Import Badge
import { User, Settings, LogOut, MessageSquare } from 'lucide-react'; // Added MessageSquare
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context'; // Import useAuth

export function ProfileMenu() {
  const { toast } = useToast();
  const router = useRouter();
  const { setIsAuthenticated } = useAuth(); // Get setIsAuthenticated from context
  // Simulate notification count - set initial value here
  const [notificationCount, setNotificationCount] = useState(3);

  const handleLogout = () => {
    // Simulate logout action
    console.log("User logged out (simulated)");
    setIsAuthenticated(false); // Update global auth state
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    // In a real app, you would clear auth tokens, etc.
    // Redirect handled by the global layout effect now, but can keep explicit push
     router.push('/login');
  };

  const handleChatClick = () => {
    // Reset notification count when chat is opened
    setNotificationCount(0);
    // Navigate to chat page (handled by Link component)
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Wrap the Button in a relative div to position the badge */}
        <div className="relative">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
            <User className="w-4 h-4" />
            <span className="sr-only">Open user menu</span>
          </Button>
           {/* Conditionally render the badge */}
           {notificationCount > 0 && (
            <Badge
              variant="destructive" // Use destructive variant for red background
              className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 flex items-center justify-center rounded-full text-[10px] pointer-events-none" // Added pointer-events-none
            >
              {notificationCount}
            </Badge>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
         {/* Chat Item - Updated with onClick */}
        <DropdownMenuItem asChild onClick={handleChatClick}>
          <Link href="/chat" className="flex items-center cursor-pointer">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Chat</span>
             {/* Optionally add a smaller badge inside the menu item too */}
             {notificationCount > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5">{notificationCount}</Badge>
            )}
          </Link>
        </DropdownMenuItem>
         {/* Settings Item */}
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Logout Item */}
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
