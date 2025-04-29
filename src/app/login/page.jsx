'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setIsLoading(true);

    // --- Simulate Login ---
    // In a real app, replace this with your actual authentication logic (e.g., Firebase Auth, API call)
    console.log(`Simulating login for email: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    // Basic validation (replace with real auth)
    if (email.includes('@') && password.length >= 6) {
      console.log("Login successful (simulated)");
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      // Redirect to the home page after successful login
      router.push('/');
    } else {
      console.error("Login failed (simulated)");
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password (simulation). Please try again.",
      });
      setIsLoading(false);
    }
    // --- End Simulation ---
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1 text-center">
           {/* Simple Logo Placeholder */}
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
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {/* Optional: Add Forgot Password link */}
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
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                 <>
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                 </>
              )}
            </Button>
             {/* Optional: Add Sign Up link */}
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
