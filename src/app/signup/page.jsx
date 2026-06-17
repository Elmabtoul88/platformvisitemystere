'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, ArrowLeft, Phone, User as UserIcon, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import images from '@/app/lib/placeholder-images.json';

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, setAuthState, isLoading, user } = useAuth();
  
  const [completeName, setCompleteName] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'client') router.push('/client');
      else router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleSignUp = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur de mot de passe",
        description: "Les mots de passe ne correspondent pas.",
      });
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
        toast({
            variant: "destructive",
            title: "Sécurité insuffisante",
            description: "Le mot de passe doit contenir au moins 6 caractères.",
        });
        setIsSubmitting(false);
        return;
    }

    try {
       // Simulation backend
       await new Promise(resolve => setTimeout(resolve, 1500));
       
       toast({
         title: "Compte créé !",
         description: "Votre inscription a été enregistrée. Veuillez vous connecter.",
       });
       router.push('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: "Une erreur est survenue lors de la création du compte.",
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <Image 
            src={images["service-mystery"].url} 
            alt="Corporate Community" 
            fill 
            className="object-cover opacity-20 scale-110"
        />
        <div className="relative z-10 p-12 text-white space-y-8 max-w-xl">
            <div className="flex items-center gap-2 mb-12">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-accent"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                <span className="text-3xl font-black tracking-tighter">SEC <span className="text-accent font-normal text-2xl tracking-normal">SHOOPER</span></span>
            </div>
            <h2 className="text-5xl font-black leading-tight">Devenez un maillon de l'excellence.</h2>
            <p className="text-xl text-primary-foreground/70 font-light">Rejoignez notre réseau international de shoppers et participez à l'audit des plus grandes marques mondiales.</p>
            
            <div className="space-y-6 pt-6">
                {[
                    "Accès à des missions exclusives",
                    "Dédommagement garanti sous 30 jours",
                    "Flexibilité totale de votre emploi du temps",
                    "Développement de vos compétences analytiques"
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-background relative overflow-y-auto py-20">
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-4xl font-black text-primary tracking-tight">Inscription</h1>
            <p className="text-muted-foreground font-medium">Créez votre profil shopper en quelques instants.</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="completeName" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Nom Complet *</Label>
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="completeName"
                        placeholder="Prénom et Nom"
                        required
                        className="h-12 pl-10"
                        value={completeName}
                        onChange={(e) => setCompleteName(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Email *</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="votre@email.com"
                            required
                            className="h-12 pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Téléphone</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="telephone"
                            type="tel"
                            placeholder="+33 6..."
                            className="h-12 pl-10"
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Mot de passe *</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="password"
                            type="password"
                            required
                            className="h-12 pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Confirmation *</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="confirm-password"
                            type="password"
                            required
                            className="h-12 pl-10"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                  </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <Button type="submit" className="w-full h-14 font-black text-lg rounded-xl shadow-xl shadow-primary/20" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><UserPlus className="mr-2 h-5 w-5" /> Créer mon compte</>}
              </Button>
              <p className="text-center text-sm text-muted-foreground font-medium">
                Déjà membre de notre réseau ?{" "}
                <Link href="/login" className="text-primary hover:underline font-bold">
                  Connectez-vous ici
                </Link>
              </p>
            </div>
          </form>
          
          <div className="text-[10px] text-muted-foreground text-center pt-8 uppercase tracking-widest font-bold">
            En vous inscrivant, vous acceptez nos CGU et notre politique de confidentialité.
          </div>
        </div>
      </div>
    </div>
  );
}
