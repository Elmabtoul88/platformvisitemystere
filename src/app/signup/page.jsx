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
  Mail,
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [completeName, setCompleteName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "client") router.push("/client");
      else router.push("/");
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

    if (!completeName.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: "Veuillez entrer votre nom complet.",
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
      const response = await axios.post(`${API_BASE_URL}users`, {
        name: completeName,
        email: email,
        password: password,
        telephone: telephone,
        role: "shopper",
      });

      if (response.status === 201) {
        toast({
          title: "✨ Compte créé !",
          description:
            "Votre inscription a été enregistrée. Veuillez vous connecter.",
          className:
            "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
        });
        router.push("/login");
      } else {
        throw new Error(
          response.data.message || "Erreur lors de l'inscription.",
        );
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description:
          error.response?.data?.message ||
          error.message ||
          "Une erreur est survenue.",
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#041F40]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#D6C799]" />
          <p className="text-sm text-[#999999]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#041F40]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#D6C799]" />
          <p className="text-sm text-[#999999]">Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Visual Side - Image à gauche */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#041F40] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#041F40]/90 via-[#193356]/80 to-[#041F40]/90 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80')] bg-cover bg-center opacity-15"></div>
        {/* Particules décoratives */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#D6C799]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D6C799]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-20 p-10 text-white space-y-4 max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-[#D6C799]"
            >
              <path
                fillRule="evenodd"
                d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-2xl font-black tracking-tighter">
              MISSION <span className="text-[#D6C799] font-normal">VIEW</span>
            </span>
          </div>

          <h2 className="text-3xl font-black leading-tight">
            Rejoignez notre réseau <br />
            <span className="text-[#D6C799]">d'excellence</span>
          </h2>

          <p className="text-base text-[#999999] leading-relaxed">
            Devenez shopper mystère et participez à l'audit des plus grandes
            marques.
          </p>

          <div className="space-y-2 pt-2">
            {[
              "Accès à des missions exclusives",
              "Dédommagement garanti sous 30 jours",
              "Flexibilité totale de votre emploi du temps",
              "Développement de vos compétences analytiques",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm bg-white/5 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#999999]/10"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D6C799] flex-shrink-0" />
                <span className="text-[#999999]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Side - Formulaire à droite */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 md:p-6 bg-gradient-to-b from-[#041F40] via-[#193356] to-[#041F40] relative overflow-y-auto">
        <Link
          href="/"
          className="absolute top-4 left-4 flex items-center gap-2 text-sm font-medium text-[#999999] hover:text-[#D6C799] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Retour à l'accueil
        </Link>

        <Card className="w-full max-w-sm border-[#999999]/10 shadow-2xl shadow-[#D6C799]/5 bg-[#193356]/50 backdrop-blur-sm border mt-8 lg:mt-0">
          <CardHeader className="space-y-0.5 text-center lg:text-left p-0 mb-4 pt-6 px-6">
            <div className="lg:hidden flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-[#D6C799]/10 flex items-center justify-center border border-[#D6C799]/20">
                <UserPlus className="w-7 h-7 text-[#D6C799]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#D6C799] via-[#D6C799]/80 to-[#999999] bg-clip-text text-transparent">
              Inscription
            </CardTitle>
            <CardDescription className="text-sm text-[#999999]">
              Créez votre profil shopper en quelques instants.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-3 p-6 pt-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="completeName"
                  className="text-xs font-medium flex items-center gap-1.5 text-white"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#999999]" />
                  Nom complet *
                </Label>
                <Input
                  id="completeName"
                  type="text"
                  placeholder="Prénom et Nom"
                  required
                  className="h-9 text-sm border-[#999999]/20 bg-[#041F40]/50 text-white placeholder:text-[#999999]/50 focus:border-[#D6C799] focus:ring-2 focus:ring-[#D6C799]/20 transition-all"
                  value={completeName}
                  onChange={(e) => setCompleteName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium flex items-center gap-1.5 text-white"
                >
                  <Mail className="w-3.5 h-3.5 text-[#999999]" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                  className="h-9 text-sm border-[#999999]/20 bg-[#041F40]/50 text-white placeholder:text-[#999999]/50 focus:border-[#D6C799] focus:ring-2 focus:ring-[#D6C799]/20 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="telephone"
                  className="text-xs font-medium flex items-center gap-1.5 text-white"
                >
                  <Phone className="w-3.5 h-3.5 text-[#999999]" />
                  Téléphone
                </Label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="+33 6..."
                  className="h-9 text-sm border-[#999999]/20 bg-[#041F40]/50 text-white placeholder:text-[#999999]/50 focus:border-[#D6C799] focus:ring-2 focus:ring-[#D6C799]/20 transition-all"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium flex items-center gap-1.5 text-white"
                >
                  <Lock className="w-3.5 h-3.5 text-[#999999]" />
                  Mot de passe *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="h-9 text-sm border-[#999999]/20 bg-[#041F40]/50 text-white placeholder:text-[#999999]/50 focus:border-[#D6C799] focus:ring-2 focus:ring-[#D6C799]/20 transition-all pr-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999999] hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-[#999999]">
                  Minimum 6 caractères
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="confirm-password"
                  className="text-xs font-medium flex items-center gap-1.5 text-white"
                >
                  <Lock className="w-3.5 h-3.5 text-[#999999]" />
                  Confirmation *
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="h-9 text-sm border-[#999999]/20 bg-[#041F40]/50 text-white placeholder:text-[#999999]/50 focus:border-[#D6C799] focus:ring-2 focus:ring-[#D6C799]/20 transition-all pr-9"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999999] hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2.5 p-6 pt-0">
              <Button
                type="submit"
                className="w-full h-9 text-sm font-semibold bg-[#D6C799] hover:bg-[#D6C799]/90 text-[#041F40] shadow-lg shadow-[#D6C799]/20 hover:shadow-[#D6C799]/30 transition-all"
                disabled={
                  isSubmitting ||
                  !completeName ||
                  !email ||
                  !password ||
                  !confirmPassword
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Créer mon compte
                  </>
                )}
              </Button>

              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#999999]/20"></div>
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="bg-[#193356]/50 px-3 text-[#999999]">
                    Déjà membre ?
                  </span>
                </div>
              </div>

              <Link
                href="/login"
                className="text-sm font-medium text-[#D6C799] hover:text-[#D6C799]/80 transition-colors hover:underline flex items-center justify-center gap-1"
              >
                Connectez-vous ici
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#999999]/70">
                <Shield className="w-3 h-3 text-[#D6C799]" />
                <span>Sécurisé • Chiffré</span>
                <Sparkles className="w-3 h-3 text-[#D6C799]" />
              </div>

              <p className="text-[9px] text-[#999999]/60 text-center">
                En vous inscrivant, vous acceptez nos CGU et notre politique de
                confidentialité.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
