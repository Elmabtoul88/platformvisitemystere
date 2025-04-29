'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2, ShieldCheck } from 'lucide-react'; // Added ShieldCheck for admin indication
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context'; // Import useAuth

// Define Admin Credentials (for simulation)
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "password123"; // Keep password requirements reasonable

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, setAuthState, isLoading, userRole } = useAuth(); // Use auth context, get setAuthState
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated based on role
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (userRole === 'admin') {
        console.log("Admin already authenticated, redirecting to /admin...");
        router.push('/admin');
      } else if (userRole === 'shopper') {
        console.log("Shopper already authenticated, redirecting to /...");
        router.push('/');
      } else {
         // Fallback if role is somehow null/undefined but authenticated
         console.log("Authenticated but no role, redirecting to login...");
         router.push('/login'); // Or handle appropriately
      }
    }
  }, [isAuthenticated, isLoading, userRole, router]);


  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // --- Simulate Login ---
    console.log(`Simulating login for email: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Shorter delay

    let loggedIn = false;
    let role = null;

    // Check for Admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      console.log("Admin login successful (simulated)");
      loggedIn = true;
      role = 'admin';
      toast({
        title: "Admin Login Successful",
        description: "Welcome, Administrator!",
      });
    }
    // Check for Shopper (basic validation for simulation)
    else if (email.includes('@') && password.length >= 6) {
      console.log("Shopper login successful (simulated)");
      loggedIn = true;
      role = 'shopper';
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    }
    // Login Failed
    else {
      console.error("Login failed (simulated)");
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
      });
    }

    // Update Auth State and Redirect (handled by useEffect)
    if (loggedIn && role) {
      setAuthState(true, role); // Update auth state and role using the context function
       // Redirection will be handled by the useEffect hook based on the new role
    } else {
      setIsSubmitting(false); // Only set submitting false if login failed
    }
    // --- End Simulation ---
  };

   // Show loading indicator while auth state is loading or redirecting
   if (isLoading || (!isLoading && isAuthenticated)) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading...</span>
       </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1 text-center">
           <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4 border border-primary/20 shadow-sm">
             <LogIn className="h-6 w-6 text-primary" aria-hidden="true" />
           </div>
          <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                 <Link href="#" className="text-sm text-primary hover:underline">
                   Forgot password?
                 </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
             {/* Hint for admin login */}
            <p className="text-xs text-muted-foreground text-center pt-2">
                Admin Login: <code className="bg-secondary px-1 rounded">admin@example.com</code> / <code className="bg-secondary px-1 rounded">password123</code>
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                 <>
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                 </>
              )}
            </Button>
             <p className="text-center text-sm text-muted-foreground">
               Don't have an account?{" "}
               <Link href="/signup" className="text-primary hover:underline font-medium">
                 Sign Up
               </Link>
             </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```