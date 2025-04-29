'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, ArrowLeft, Phone, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context'; // Import useAuth

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
   const { isAuthenticated, setAuthState, isLoading, userRole } = useAuth(); // Use auth context, get setAuthState
  const [completeName, setCompleteName] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed from isLoading

   // Redirect if already authenticated
   useEffect(() => {
      // Redirect logic based on role (similar to login page)
       if (!isLoading && isAuthenticated) {
         if (userRole === 'admin') {
           router.push('/admin');
         } else if (userRole === 'shopper') {
           router.push('/');
         } else {
           router.push('/login'); // Fallback
         }
       }
  }, [isAuthenticated, isLoading, userRole, router]);

  const handleSignUp = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    console.log(`Simulating sign up for: Name: ${completeName}, Email: ${email}, Phone: ${telephone}`);

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Passwords do not match. Please try again.",
      });
      setIsSubmitting(false);
      return;
    }

    if (!completeName.trim()) {
       toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Please enter your complete name.",
      });
      setIsSubmitting(false);
      return;
    }

     // Basic email and password validation
    if (email.includes('@') && password.length >= 6) {
       // Simulate backend call
       await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Sign up successful (simulated)");
      // Important: DO NOT set auth state here. User needs to log in.
      // setAuthState(true, 'shopper'); // REMOVED - User should log in after signing up

      toast({
        title: "Sign Up Successful",
        description: "Account created! Please log in.",
      });
      // Ensure auth state is cleared locally before redirecting to login, just in case
       setAuthState(false, null);
      router.push('/login');
    } else {
      console.error("Sign up failed (simulated) - invalid email or password length");
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Please provide a valid email and a password of at least 6 characters.",
      });
      setIsSubmitting(false);
    }
  };

   // Don't render the form if redirecting or if auth state is loading
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
             <UserPlus className="h-6 w-6 text-primary" aria-hidden="true" />
           </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Enter your details to sign up as a shopper.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="completeName" className="flex items-center gap-1"> <UserIcon className="w-3 h-3"/> Complete Name *</Label>
              <Input
                id="completeName"
                type="text"
                placeholder="John Doe"
                required
                value={completeName}
                onChange={(e) => setCompleteName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
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
              <Label htmlFor="telephone" className="flex items-center gap-1"><Phone className="w-3 h-3"/> Telephone (Optional)</Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="+1234567890"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="******** (min. 6 characters)"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
             <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password *</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="********"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                </>
              ) : (
                 <>
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                 </>
              )}
            </Button>
             <p className="text-center text-sm text-muted-foreground">
               Already have an account?{" "}
               <Link href="/login" className="text-primary hover:underline font-medium">
                 <ArrowLeft className="inline w-3 h-3 mr-1" /> Log In
               </Link>
             </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
