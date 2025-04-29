import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ListChecks, CheckSquare, User } from 'lucide-react'; // Import icons

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MissionView App', // Updated title
  description: 'Manage your mystery shopper missions.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
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
               {/* Placeholder for Profile/Auth */}
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <User className="w-4 h-4" />
                    <span className="sr-only">Profile</span>
                </Button>
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

