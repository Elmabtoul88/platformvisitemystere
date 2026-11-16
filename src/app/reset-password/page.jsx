"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
const API_BASE_URL = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const token = searchParams.get("token");
  const userId = searchParams.get("id");

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token || !userId) {
      setIsVerifying(false);
      setIsValidToken(false);
      setErrorMessage(
        "Le lien de réinitialisation est incomplet ou invalide. Veuillez recommencer la procédure."
      );
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/verify-reset-token`,
          { userId, token }
        );

        if (response.data?.valid) {
          setIsValidToken(true);
          setUserName(response.data.name || "");
          setUserEmail(response.data.email || "");
        } else {
          setIsValidToken(false);
          setErrorMessage(
            response.data?.message ||
              "Ce lien a expiré ou a déjà été utilisé."
          );
        }
      } catch (error) {
        console.error("Token verification error:", error);
        setIsValidToken(false);
        setErrorMessage(
          error.response?.data?.message ||
            "Ce lien de réinitialisation est invalide ou a expiré."
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Mot de passe trop court",
        description: "Le mot de passe doit comporter au moins 6 caractères.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Les mots de passe ne correspondent pas",
        description: "Veuillez vous assurer que les deux champs sont identiques.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/reset-password`,
        {
          userId,
          token,
          newPassword,
        }
      );

      setIsSuccess(true);
      toast({
        title: "Mot de passe réinitialisé !",
        description:
          response.data?.message ||
          "Votre mot de passe a été mis à jour avec succès.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      const errMsg =
        error.response?.data?.message ||
        "Une erreur est survenue lors de la réinitialisation du mot de passe.";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Loading state during verification
  if (isVerifying) {
    return (
      <Card className="w-full max-w-md border-[#999999]/10 shadow-2xl shadow-[#D6C799]/5 bg-[#193356]/50 backdrop-blur-sm border p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#D6C799] animate-spin" />
          <h2 className="text-xl font-bold text-white">
            Vérification de sécurité...
          </h2>
          <p className="text-sm text-[#999999]">
            Validation de votre lien de réinitialisation.
          </p>
        </div>
      </Card>
    );
  }

  // 2. Token invalid / expired state
  if (!isValidToken) {
    return (
      <Card className="w-full max-w-md border-[#999999]/10 shadow-2xl shadow-[#D6C799]/5 bg-[#193356]/50 backdrop-blur-sm border p-6">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Lien invalide ou expiré</h2>
          <p className="text-sm text-[#999999] leading-relaxed">
            {errorMessage ||
              "Ce lien de réinitialisation n'est plus valable. Pour des raisons de sécurité, les liens expirent après 30 minutes ou après avoir été utilisés."}
          </p>
          <div className="pt-2 flex flex-col gap-3">
            <Link href="/forgot-password" className="w-full">
              <Button className="w-full bg-[#D6C799] hover:bg-[#D6C799]/90 text-[#041F40] font-semibold">
                Demander un nouveau lien
              </Button>
            </Link>
            <Link href="/login" className="w-full">
              <Button
                variant="outline"
                className="w-full border-[#999999]/30 text-white hover:bg-white/5"
              >
                Retour à la connexion
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // 3. Success state after password reset
  if (isSuccess) {
    return (
      <Card className="w-full max-w-md border-[#999999]/10 shadow-2xl shadow-[#D6C799]/5 bg-[#193356]/50 backdrop-blur-sm border p-6">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-green-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Mot de passe mis à jour !
          </h2>
          <p className="text-sm text-[#999999] leading-relaxed">
            Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter à votre compte MissionView avec votre nouvel identifiant.
          </p>
          <div className="pt-3">
            <Link href="/login" className="w-full">
              <Button className="w-full h-11 bg-[#D6C799] hover:bg-[#D6C799]/90 text-[#041F40] font-semibold shadow-lg shadow-[#D6C799]/20 flex items-center justify-center gap-2">
                Se connecter maintenant
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // 4. Form state (Token is valid, ready to enter new password)
  return (
    <Card className="w-full max-w-md border-[#999999]/10 shadow-2xl shadow-[#D6C799]/5 bg-[#193356]/50 backdrop-blur-sm border">
      <CardHeader className="space-y-2 text-center lg:text-left p-0 mb-6">
        <div className="flex justify-center lg:justify-start mb-2">
          <div className="w-14 h-14 rounded-2xl bg-[#D6C799]/10 flex items-center justify-center border border-[#D6C799]/20 shadow-inner">
            <KeyRound className="w-7 h-7 text-[#D6C799]" />
          </div>
        </div>
        <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#D6C799] via-[#D6C799]/80 to-[#999999] bg-clip-text text-transparent">
          Nouveau mot de passe
        </CardTitle>
        <CardDescription className="text-sm text-[#999999]">
          {userName
            ? `Bonjour ${userName}, choisissez un nouveau mot de passe pour votre compte.`
            : "Choisissez un nouveau mot de passe sécurisé pour votre compte."}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 p-0">
          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="text-sm font-medium flex items-center gap-2 text-white"
            >
              <Lock className="w-4 h-4 text-[#999999]" />
              Nouveau mot de passe
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Au moins 6 caractères"
                required
                className="h-11 border-[#999999]/20 bg-[#041F40]/50 text-white placeholder:text-[#999999]/50 focus:border-[#D6C799] focus:ring-2 focus:ring-[#D6C799]/20 transition-all pr-11"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium flex items-center gap-2 text-white"
            >
              <Lock className="w-4 h-4 text-[#999999]" />
              Confirmer le mot de passe
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Répétez le mot de passe"
                required
                className="h-11 border-[#999999]/20 bg-[#041F40]/50 text-white placeholder:text-[#999999]/50 focus:border-[#D6C799] focus:ring-2 focus:ring-[#D6C799]/20 transition-all pr-11"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-white transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="text-xs space-y-1 text-[#999999] pt-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  newPassword.length >= 6 ? "bg-green-400" : "bg-[#999999]/40"
                }`}
              />
              <span>Au moins 6 caractères</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  confirmPassword && newPassword === confirmPassword
                    ? "bg-green-400"
                    : "bg-[#999999]/40"
                }`}
              />
              <span>Les mots de passe correspondent</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 p-0 mt-6">
          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold bg-[#D6C799] hover:bg-[#D6C799]/90 text-[#041F40] shadow-lg shadow-[#D6C799]/20 hover:shadow-[#D6C799]/30 transition-all"
            disabled={
              isSubmitting ||
              newPassword.length < 6 ||
              newPassword !== confirmPassword
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Mise à jour en cours...
              </>
            ) : (
              "Enregistrer le nouveau mot de passe"
            )}
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs font-medium text-[#999999] hover:text-[#D6C799] transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Retour à la page de connexion
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen bg-[#041F40] text-white">
      {/* Visual Side (Left on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#041F40] via-[#193356] to-[#041F40] flex-col justify-between p-12 border-r border-[#999999]/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(214,199,153,0.08),transparent_70%)] pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <Image
            src="/images/logo/logo-site.png"
            alt="Logo"
            width={160}
            height={50}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        <div className="space-y-6 relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D6C799]/10 border border-[#D6C799]/20 text-[#D6C799] text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sécurisation de vos accès
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white/90 to-[#999999] bg-clip-text text-transparent">
            Définissez votre nouveau mot de passe sécurisé.
          </h1>
          <p className="text-[#999999] leading-relaxed text-base">
            Choisissez un mot de passe robuste d'au moins 6 caractères pour protéger votre compte et vos données d'évaluation.
          </p>

          <div className="flex flex-col gap-3 pt-4">
            <div className="flex items-center gap-3 text-sm bg-white/5 backdrop-blur-sm px-4 py-3 rounded-lg border border-[#999999]/10">
              <div className="w-2 h-2 rounded-full bg-[#D6C799]"></div>
              <span className="text-[#999999]">Mise à jour immédiate et sécurisée</span>
            </div>
            <div className="flex items-center gap-3 text-sm bg-white/5 backdrop-blur-sm px-4 py-3 rounded-lg border border-[#999999]/10">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-[#999999]">Ancien mot de passe révoqué immédiatement</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-[#999999]/60 relative z-10">
          © {new Date().getFullYear()} MissionView. Tous droits réservés.
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-8 bg-gradient-to-b from-[#041F40] via-[#193356] to-[#041F40] relative">
        <Link
          href="/login"
          className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-[#999999] hover:text-[#D6C799] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Retour à la connexion
        </Link>

        <Suspense
          fallback={
            <Card className="w-full max-w-md border-[#999999]/10 shadow-2xl shadow-[#D6C799]/5 bg-[#193356]/50 backdrop-blur-sm border p-8 text-center">
              <Loader2 className="w-8 h-8 text-[#D6C799] animate-spin mx-auto" />
            </Card>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
