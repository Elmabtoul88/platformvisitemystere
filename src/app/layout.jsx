'use client'; // Add 'use client' for useEffect and useState

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ListChecks, CheckSquare } from 'lucide-react';
import { ProfileMenu } from '@/components/profile-menu';
import React, { useEffect, useState } from 'react'; // Import useEffect and useState

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Metadata cannot be exported from client components, move it to a server component if needed or manage dynamically
// export const metadata = {
//   title: 'MissionView App',
//   description: 'Manage your mystery shopper missions.',
// };

export default function RootLayout({
  children,
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check localStorage for theme preference on initial client load
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = storedTheme === 'dark' || (!storedTheme && prefersDark);

    setIsDarkMode(initialDarkMode);

    // Apply the theme class to the html element
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Add listener for changes in theme preference in localStorage (e.g., from settings page)
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


  // Use 'useEffect' to set the title dynamically if needed since metadata can't be static here
   useEffect(() => {
     document.title = 'MissionView App';
   }, []);

  return (
    // Apply the 'dark' class conditionally based on state
    <html lang="en" className={isDarkMode ? 'dark' : ''}>
      <head>
         {/* Add description meta tag manually if needed */}
         <meta name="description" content="Manage your mystery shopper missions." />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200`}>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <nav className="container flex h-14 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-primary">
              {/* Placeholder Logo/Icon */}
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                 <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
               </svg>
              MissionView
            </Link>
            <div className="flex items-center gap-2">
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
      </body>
    </html>
  );
}
