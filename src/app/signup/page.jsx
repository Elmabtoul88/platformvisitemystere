
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, ArrowLeft, Phone, User as UserIcon } from 'lucide-react'; // Added Phone and UserIcon
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [completeName, setCompleteName] = useState(''); // Added state for complete name
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState(''); // Added state for telephone
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    // --- Simulate Sign Up ---
    console.log(`Simulating sign up for: Name: ${completeName}, Email: ${email}, Phone: ${telephone}`);

    // Basic validation
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Passwords do not match. Please try again.",
      });
      setIsLoading(false);
      return;
    }

    // Add validation for complete name
    if (!completeName.trim()) {
       toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Please enter your complete name.",
      });
      setIsLoading(false);
      return;
    }

    if (email.includes('@') && password.length >= 6) {
       await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      console.log("Sign up successful (simulated)");
      toast({
        title: "Sign Up Successful",
        description: "Account created! You can now log in.",
      });
      // Redirect to the login page after successful sign up
      router.push('/login');
    } else {
      console.error("Sign up failed (simulated)");
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Please provide a valid email and a password of at least 6 characters.",
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
             <UserPlus className="h-6 w-6 text-primary" aria-hidden="true" />
           </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Enter your details to sign up.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="completeName" className="flex items-center gap-1"> <UserIcon className="w-3 h-3"/> Complete Name</Label> {/* Added field */}
              <Input
                id="completeName"
                type="text"
                placeholder="John Doe"
                required
                value={completeName}
                onChange={(e) => setCompleteName(e.target.value)}
                disabled={isLoading}
              />
            </div>
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
              <Label htmlFor="telephone" className="flex items-center gap-1"><Phone className="w-3 h-3"/> Telephone (Optional)</Label> {/* Added field */}
              <Input
                id="telephone"
                type="tel" // Use tel type for phone numbers
                placeholder="+1234567890"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                minLength={6} // Enforce min length in HTML
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
             <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="********"
                required
                minLength={6} // Enforce min length in HTML
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
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

