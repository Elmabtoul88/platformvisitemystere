"use client";

import React, { useState, useEffect } from "react";
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
  LogIn,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, login, isLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirection après authentification
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "client") router.push("/client");
      else router.push("/");
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}auth`, {
        email,
        password,
      });

      const data = response.data;

      if (response.status === 200 && data.success && data.user && data.token) {
        login(data);
        toast({
          title: "✨ Connexion réussie",
          description: `Bonjour ${data.user.name || "Utilisateur"}!`,
          className:
            "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description:
            data.message || "Identifiants invalides. Veuillez réessayer.",
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast({
          variant: "destructive",
          title: "Échec de la connexion",
          description: "Email ou mot de passe incorrect.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur réseau",
          description:
            "Impossible de se connecter au serveur. Veuillez réessayer.",
        });
      }
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#041F40]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#D6C799]" />
          <p className="text-sm text-[#999999]">Chargement de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Visual Side - Image à gauche */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#041F40] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#041F40]/90 via-[#193356]/80 to-[#041F40]/90 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80')] bg-cover bg-center opacity-15"></div>
        {/* Particules décoratives */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#D6C799]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D6C799]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-20 p-12 text-white space-y-6 max-w-xl">
          <div className="flex items-center gap-2 mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-10 h-10 text-[#D6C799]"
            >
              <path
                fillRule="evenodd"
                d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-3xl font-black tracking-tighter">
              MISSION <span className="text-[#D6C799] font-normal">VIEW</span>
            </span>
          </div>

          <h2 className="text-4xl font-black leading-tight">
            Gérez vos missions <br />
            <span className="text-[#D6C799]">en toute simplicité</span>
          </h2>

          <p className="text-lg text-[#999999] leading-relaxed">
            Connectez-vous pour accéder à votre tableau de bord, suivre vos
            missions et optimiser votre performance.
          </p>

          <div className="flex flex-col gap-3 pt-4">
            <div className="flex items-center gap-3 text-sm bg-white/5 backdrop-blur-sm px-4 py-3 rounded-lg border border-[#999999]/10">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-[#999999]">
                Suivez vos missions en temps réel
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm bg-white/5 backdrop-blur-sm px-4 py-3 rounded-lg border border-[#999999]/10">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-[#999999]">Analysez vos performances</span>
            </div>
            <div className="flex items-center gap-3 text-sm bg-white/5 backdrop-blur-sm px-4 py-3 rounded-lg border border-[#999999]/10">
              <div className="w-2 h-2 rounded-full bg-[#D6C799]"></div>
              <span className="text-[#999999]">Développez votre activité</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side - Formulaire à droite */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-8 bg-gradient-to-b from-[#041F40] via-[#193356] to-[#041F40] relative">
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-[#999999] hover:text-[#D6C799] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Retour à l'accueil
        </Link>

        <Card className="w-full max-w-md border-[#999999]/10 shadow-2xl shadow-[#D6C799]/5 bg-[#193356]/50 backdrop-blur-sm border p-6 sm:p-8 mt-12 sm:mt-0">
          <CardHeader className="space-y-1 text-center lg:text-left p-0 mb-6">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#D6C799]/10 flex items-center justify-center border border-[#D6C799]/20">
                <LogIn className="w-8 h-8 text-[#D6C799]" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#D6C799] via-[#D6C799]/80 to-[#999999] bg-clip-text text-transparent">
              Connexion
            </CardTitle>
            <CardDescription className="text-base text-[#999999]">
              Heureux de vous revoir sur MissionView.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5 p-0">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium flex items-center gap-2 text-white"
                >
                  <Mail className="w-4 h-4 text-[#999999]" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@entreprise.com"
                  required
                  className="h-11 border-[#999999]/20 bg-[#041F40]/50 text-white placeholder:text-[#999999]/50 focus:border-[#D6C799] focus:ring-2 focus:ring-[#D6C799]/20 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium flex items-center gap-2 text-white"
                  >
                    <Lock className="w-4 h-4 text-[#999999]" />
                    Mot de passe
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#D6C799] hover:text-[#D6C799]/80 transition-colors hover:underline"
                  >
                    Oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="h-11 border-[#999999]/20 bg-[#041F40]/50 text-white placeholder:text-[#999999]/50 focus:border-[#D6C799] focus:ring-2 focus:ring-[#D6C799]/20 transition-all pr-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 rounded border-2 border-[#999999]/30 group-hover:border-[#D6C799] transition-colors flex items-center justify-center">
                    <div className="w-2 h-2 rounded-sm bg-[#D6C799] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-sm text-[#999999] group-hover:text-white transition-colors">
                    Se souvenir de moi
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 p-0 mt-6">
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold bg-[#D6C799] hover:bg-[#D6C799]/90 text-[#041F40] shadow-lg shadow-[#D6C799]/20 hover:shadow-[#D6C799]/30 transition-all"
                disabled={isSubmitting || !email || !password}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Se Connecter
                  </>
                )}
              </Button>

              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#999999]/20"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#193356]/50 px-3 text-[#999999]">
                    Nouveau sur MissionView ?
                  </span>
                </div>
              </div>

              <Link
                href="/signup"
                className="text-sm font-medium text-[#D6C799] hover:text-[#D6C799]/80 transition-colors hover:underline flex items-center justify-center gap-1"
              >
                Créer un compte
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-[#999999]/70 pt-1">
                <Shield className="w-3 h-3 text-[#D6C799]" />
                <span>Sécurisé • Chiffré</span>
                <Sparkles className="w-3 h-3 text-[#D6C799]" />
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
