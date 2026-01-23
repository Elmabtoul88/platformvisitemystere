"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
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
import { LogIn, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context"; // Import useAuth

// Base URL for the backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, login, isLoading } = useAuth(); // Use login function from context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirection effect is handled globally by AuthProvider

  const handleLogin = async (event) => {
    event.preventDefault();
    // Prevent multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true); // Set submitting state at the beginning
    console.log(`Attempting login for email: ${email}`);

    try {
      const response = await axios.post(`${API_BASE_URL}auth`, {
        email,
        password,
      });

      const data = response.data;
      console.log("response", response);
      if (response.status === 200 && data.success && data.user && data.token) {
        // Check for success flag and essential data
        console.log("Login API success:", data);
        // Call the login function from context to update state and trigger redirection
        // Pass the entire successful API response data
        // The login function in AuthProvider will handle setting state and redirecting
        const cntx = login(data); // Call context login first
        console.log("login context response", cntx);
        console.log(data.user);
        toast({
          title: "Login Successful",
          // Correctly access the user's name from the API response
          description: `Welcome back, ${
            data.user.name || "User"
          }! Redirecting...`,
        });
        // Redirection is handled by the login function in the context
        // No need to call router.push here
        // No need to setIsSubmitting(false) here because navigation will unmount the component
      } else {
        console.error("Login API failed:", data);
        console.log(
          data.message || `Login failed with status: ${response.status}`
        );
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast({
          variant: "destructive",
          title: "login failed",
          description: "Invalid email or password",
        });
      }
      /*toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An error occurred. Please try again.",
      });*/
      // IMPORTANT: Reset submitting state ONLY on error to allow retry
      setIsSubmitting(false);
    }
  };

  // Show loading indicator if auth state is loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Session...</span>
      </div>
    );
  }

  // Prevent rendering form if already logged in (though provider should redirect first)
  if (isAuthenticated && !isLoading) {
    // Check !isLoading again
    console.log(
      "LoginPage: Already authenticated, redirecting (via AuthProvider)..."
    );
    // Render a loading state while AuthProvider handles the redirect
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
            <LogIn className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
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
                disabled={isSubmitting} // Disable input while submitting
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
                disabled={isSubmitting} // Disable input while submitting
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !email || !password}
            >
              {" "}
              {/* Disable button if submitting or fields are empty */}
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
              <Link
                href="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
