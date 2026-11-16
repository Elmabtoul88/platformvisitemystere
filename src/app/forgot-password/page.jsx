"use client";

import React, { useState } from "react";
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
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Send,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
const API_BASE_URL = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/forgot-password`,
        { email }
      );

      setIsSent(true);
      toast({
        title: "Email envoyé !",
        description:
          response.data?.message ||
          "Un lien de réinitialisation a été envoyé à votre adresse email.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      const errMsg =
        error.response?.data?.message ||
        "Une erreur est survenue lors de l'envoi de l'email.";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Sécurité renforcée de votre compte
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white/90 to-[#999999] bg-clip-text text-transparent">
            Récupérez l'accès à votre espace en toute sérénité.
          </h1>
          <p className="text-[#999999] leading-relaxed text-base">
            Nous vous enverrons un lien de réinitialisation sécurisé par email. Ce lien est unique, temporaire et strictement confidentiel.
          </p>

          <div className="flex flex-col gap-3 pt-4">
            <div className="flex items-center gap-3 text-sm bg-white/5 backdrop-blur-sm px-4 py-3 rounded-lg border border-[#999999]/10">
              <div className="w-2 h-2 rounded-full bg-[#D6C799]"></div>
              <span className="text-[#999999]">Lien valable pendant 30 minutes</span>
            </div>
            <div className="flex items-center gap-3 text-sm bg-white/5 backdrop-blur-sm px-4 py-3 rounded-lg border border-[#999999]/10">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-[#999999]">Chiffrement de sécurité de bout en bout</span>
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

        <Card className="w-full max-w-md border-[#999999]/10 shadow-2xl shadow-[#D6C799]/5 bg-[#193356]/50 backdrop-blur-sm border">
          <CardHeader className="space-y-2 text-center lg:text-left p-0 mb-6">
            <div className="flex justify-center lg:justify-start mb-2">
              <div className="w-14 h-14 rounded-2xl bg-[#D6C799]/10 flex items-center justify-center border border-[#D6C799]/20 shadow-inner">
                <KeyRound className="w-7 h-7 text-[#D6C799]" />
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#D6C799] via-[#D6C799]/80 to-[#999999] bg-clip-text text-transparent">
              {isSent ? "Email envoyé !" : "Mot de passe oublié ?"}
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-[#999999]">
              {isSent
                ? "Veuillez consulter votre boîte de réception pour continuer."
                : "Entrez l'adresse email associée à votre compte pour recevoir un lien de réinitialisation."}
            </CardDescription>
          </CardHeader>

          {!isSent ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 p-0">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium flex items-center gap-2 text-white"
                  >
                    <Mail className="w-4 h-4 text-[#999999]" />
                    Adresse email
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
              </CardContent>

              <CardFooter className="flex flex-col gap-4 p-0 mt-6">
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold bg-[#D6C799] hover:bg-[#D6C799]/90 text-[#041F40] shadow-lg shadow-[#D6C799]/20 hover:shadow-[#D6C799]/30 transition-all"
                  disabled={isSubmitting || !email}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer le lien de réinitialisation
                    </>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-xs font-medium text-[#999999] hover:text-[#D6C799] transition-colors"
                  >
                    Vous vous souvenez de votre mot de passe ?{" "}
                    <span className="text-[#D6C799] underline">Se connecter</span>
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#D6C799]/10 border border-[#D6C799]/20 space-y-2">
                <div className="flex items-center gap-2 text-[#D6C799] font-medium text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Lien envoyé à <span className="underline">{email}</span>
                </div>
                <p className="text-xs text-[#999999] leading-relaxed">
                  Cliquez sur le lien reçu dans l'email pour définir un nouveau mot de passe. Pensez à vérifier vos dossiers de spams ou courriers indésirables si vous ne le recevez pas dans les prochaines minutes.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsSent(false)}
                  className="w-full h-10 border-[#999999]/30 text-white hover:bg-white/5 hover:border-[#D6C799]"
                >
                  Renvoyer un autre email
                </Button>
                <Link href="/login" className="w-full">
                  <Button className="w-full h-10 bg-[#D6C799] hover:bg-[#D6C799]/90 text-[#041F40] font-semibold">
                    Retour à la page de connexion
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
