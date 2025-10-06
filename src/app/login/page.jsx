'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, login, isLoading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'client') {
        router.push('/client');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email || !password) {
        toast({ variant: "destructive", title: "Missing Fields", description: "Please enter both email and password." });
        return;
    }
    setIsSubmitting(true);

    try {
        const result = await login(email, password); // Use the login function from context
        if (result.success) {
            toast({
                title: "Login Successful",
                description: result.message,
            });
            // Redirection is handled by the useEffect hook
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message || "An unknown error occurred.",
        });
        setIsSubmitting(false); // Only stop submitting on failure
    }
  };

  // Show a loading state while auth is being checked or if a redirect is imminent
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
            <div className="text-xs text-muted-foreground text-center pt-2 space-y-1">
                 <p>Admin: <code className="bg-secondary px-1 rounded">admin@example.com</code> / <code className="bg-secondary px-1 rounded">password123</code></p>
                 <p>Client: <code className="bg-secondary px-1 rounded">client@gourmet.com</code> / <code className="bg-secondary px-1 rounded">password123</code></p>
                 <p>Shopper: <code className="bg-secondary px-1 rounded">alex@example.com</code> / <code className="bg-secondary px-1 rounded">password123</code></p>
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
