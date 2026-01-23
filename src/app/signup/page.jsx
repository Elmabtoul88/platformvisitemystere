"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  Loader2,
  ArrowLeft,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context"; // Import useAuth

// Base URL for the backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth(); // Get loading state and auth status
  const [completeName, setCompleteName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect effect is now handled globally by AuthProvider
  // useEffect(() => { ... });

  const handleSignUp = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    console.log(
      `Attempting sign up for: Name: ${completeName}, Email: ${email}, Phone: ${telephone}`
    );

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Passwords do not match.",
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
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Password must be at least 6 characters.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users`, {
        name: completeName,
        email: email,
        password: password,
        telephone: telephone,
        role: "shopper", // Explicitly set role for sign up
        // Add other optional fields if collected here (city, etc.)
      });
      console.log(response);
      const data = response.data;

      if (response.status === 201) {
        // Check for 201 Created status
        console.log("Sign up API success:", data);
        toast({
          title: "Sign Up Successful",
          description: "Account created! Please log in.",
        });
        router.push("/login"); // Redirect to login page after successful registration
      } else {
        console.error("Sign up API failed:", data);
        // Use the message from the API response if available
        throw new Error(
          data.message || `Sign up failed with status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Sign Up Error:", error);
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message || "An error occurred. Please try again.",
      });
      setIsSubmitting(false); // Re-enable button on failure
    }
    // No setIsSubmitting(false) needed on success because of navigation
  };

  // Show loading indicator if auth state is loading OR if already authenticated
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  // Prevent rendering form if already logged in (provider handles redirect)
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting...</span>
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
          <CardDescription>
            Enter your details to sign up as a shopper.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="completeName" className="flex items-center gap-1">
                {" "}
                <UserIcon className="w-3 h-3" /> Complete Name *
              </Label>
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
              <Label htmlFor="telephone" className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> Telephone (Optional)
              </Label>
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </>
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                <ArrowLeft className="inline w-3 h-3 mr-1" /> Log In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
