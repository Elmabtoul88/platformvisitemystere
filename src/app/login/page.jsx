'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context'; // Import useAuth

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated, isLoading } = useAuth(); // Use auth context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed from isLoading to avoid conflict

  // Redirect if already authenticated
  useEffect(() => {
    // Check isLoading first to avoid premature redirect
    if (!isLoading && isAuthenticated) {
       console.log("Already authenticated, redirecting from login...");
      router.push('/'); // Redirect to home or dashboard
    }
  }, [isAuthenticated, isLoading, router]);


  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // --- Simulate Login ---
    console.log(`Simulating login for email: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Basic validation (replace with real auth)
    if (email.includes('@') && password.length >= 6) {
      console.log("Login successful (simulated)");
      setIsAuthenticated(true); // Update auth state
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      // Redirect handled by the useEffect hook now, but can keep direct push as fallback/explicit action
       router.push('/');
    } else {
      console.error("Login failed (simulated)");
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password (simulation). Please try again.",
      });
      setIsSubmitting(false);
    }
    // --- End Simulation ---
  };

   // Don't render the form if redirecting or if auth state is loading
   if (isLoading || (!isLoading && isAuthenticated)) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-background p-4">
         {/* Optional: Add a loading indicator if needed */}
         <p>Loading...</p>
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
          <CardDescription>Enter your credentials to access your missions.</CardDescription>
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
