'use client';

import React, { useState, useEffect } from 'react'; // Import useEffect
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

const CHAT_NOTIFICATION_KEY = 'chatNotificationCount';

export function ProfileMenu() {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, userRole, setAuthState } = useAuth(); // Get setAuthState and userRole from context
  const [notificationCount, setNotificationCount] = useState(0); // Initialize with 0

  // Effect to read initial count and listen for changes
  useEffect(() => {
    // Function to read and update count
    const updateCountFromStorage = () => {
        try {
            const count = parseInt(localStorage.getItem(CHAT_NOTIFICATION_KEY) || '0', 10);
            setNotificationCount(count);
            console.log("ProfileMenu: Read notification count from storage:", count);
        } catch (error) {
            console.error("Failed to read notification count from localStorage:", error);
            setNotificationCount(0); // Reset on error
        }
    };

    // Initial read
    updateCountFromStorage();

    // Listener for changes in other tabs/components
    const handleStorageChange = (event) => {
        if (event.key === CHAT_NOTIFICATION_KEY) {
            console.log("ProfileMenu: Detected storage change for notifications.");
            updateCountFromStorage();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleLogout = () => {
    // Simulate logout action
    console.log("User logged out (simulated)");
    setAuthState(false, null); // Update global auth state and clear role
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    // Redirect handled by the global layout effect now, but can keep explicit push
     router.push('/login');
  };

  const handleChatClick = () => {
    // Reset notification count when chat is opened
    setNotificationCount(0);
    // Also reset the count in localStorage
     try {
        localStorage.setItem(CHAT_NOTIFICATION_KEY, '0');
        console.log("Reset notification count in storage.");
        // Manually dispatch event to ensure immediate update if needed elsewhere
        window.dispatchEvent(new StorageEvent('storage', {
            key: CHAT_NOTIFICATION_KEY,
            newValue: '0',
            storageArea: localStorage,
        }));
    } catch (error) {
        console.error("Failed to reset notification count in localStorage:", error);
    }
    // Navigation handled by Link component
  };

  // Determine the correct links based on user role
  const chatLink = userRole === 'admin' ? '/admin/chat' : '/chat';
  const settingsLink = userRole === 'admin' ? '/admin/settings' : '/settings';


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
         {/* Chat Item - Updated with dynamic link and onClick */}
        <DropdownMenuItem asChild onClick={handleChatClick}>
          <Link href={chatLink} className="flex items-center cursor-pointer">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Chat</span>
             {/* Optionally add a smaller badge inside the menu item too */}
             {notificationCount > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5">{notificationCount}</Badge>
            )}
          </Link>
        </DropdownMenuItem>
         {/* Settings Item - Updated with dynamic link */}
        <DropdownMenuItem asChild>
          <Link href={settingsLink} className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Logout Item */}
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
