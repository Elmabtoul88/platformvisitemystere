
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import images from '@/app/lib/placeholder-images.json';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, login, isLoading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'client') router.push('/client');
      else router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
        const result = await login(email, password);
        if (result.success) {
            toast({ title: "Connexion réussie", description: result.message });
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        toast({ variant: "destructive", title: "Erreur", description: error.message });
        setIsSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <Image 
            src={images["hero-bg"].url} 
            alt="Corporate" 
            fill 
            className="object-cover opacity-30 scale-105"
        />
        <div className="relative z-10 p-12 text-white space-y-6 max-w-xl">
            <div className="flex items-center gap-2 mb-12">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-accent"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                <span className="text-3xl font-black tracking-tighter">SEC <span className="text-accent font-normal">VISITE MYSTÈRE</span></span>
            </div>
            <h2 className="text-4xl font-black">Accédez à votre espace sécurisé.</h2>
            <p className="text-lg text-primary-foreground/70">Connectez-vous pour gérer vos missions, consulter vos rapports ou piloter vos indicateurs de performance.</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-background relative">
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>

        <Card className="w-full max-w-md border-none shadow-none bg-transparent">
          <CardHeader className="space-y-2 text-center lg:text-left p-0 mb-8">
            <CardTitle className="text-3xl font-black text-primary">Connexion</CardTitle>
            <CardDescription>Heureux de vous revoir sur MissionView.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6 p-0">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                    <Input
                        id="email"
                        type="email"
                        placeholder="nom@entreprise.com"
                        required
                        className="h-12"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <button type="button" className="text-xs font-bold text-primary hover:underline">Oublié ?</button>
                </div>
                <div className="relative">
                    <Input
                        id="password"
                        type="password"
                        required
                        className="h-12"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 p-0 mt-8">
              <Button type="submit" className="w-full h-12 font-black text-md" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><LogIn className="mr-2 h-5 w-5" /> Se Connecter</>}
              </Button>
              <p className="text-center text-sm text-muted-foreground font-medium">
                Pas encore de compte ?{" "}
                <Link href="/signup" className="text-primary hover:underline font-bold">
                  Rejoignez-nous
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
