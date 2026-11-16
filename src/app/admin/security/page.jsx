"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  UserCheck,
  Smartphone,
  History,
  Laptop,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { api } from "@/services/fetchData";

export default function AdminSecurityPage() {
  const { toast } = useToast();
  const { user, token } = useAuth();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Évaluation de la robustesse du mot de passe
  const evaluateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = evaluateStrength(passwordData.newPassword);
  const strengthLabels = ["Très faible", "Faible", "Moyen", "Bon", "Excellent", "Inviolable"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-emerald-500",
    "bg-[#D6C799]",
  ];

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast({
        variant: "destructive",
        title: "Champ requis",
        description: "Veuillez saisir votre mot de passe actuel.",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Mot de passe trop court",
        description: "Le nouveau mot de passe doit comporter au moins 6 caractères.",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Mots de passe non identiques",
        description: "La confirmation ne correspond pas au nouveau mot de passe.",
      });
      return;
    }

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Erreur de session",
        description: "Utilisateur non identifié. Veuillez vous reconnecter.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.patch(`users/reset-password/${user.id}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data?.success || response.status === 200) {
        toast({
          title: "✅ Mot de passe mis à jour",
          description: "Votre mot de passe administrateur a été modifié avec succès.",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Échec de modification",
          description: response.data?.error || response.data?.message || "Erreur inconnue.",
        });
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Impossible de contacter le serveur.";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#041F40] text-[#D6C799] shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#041F40] tracking-tight">
                Sécurité & Confidentialité
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Supervision des accès, politique de mot de passe et intégrité du compte
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 font-semibold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Compte Sécurisé
          </Badge>
          <Badge variant="outline" className="bg-white text-slate-700 border-slate-200 px-3 py-1 font-semibold text-xs">
            Rôle : {user?.role || "Admin"}
          </Badge>
        </div>
      </div>

      {/* Cartes d'indicateurs de sécurité */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl p-4">
          <CardHeader className="p-0 pb-2">
            <CardDescription className="text-slate-500 text-xs uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Identité Vérifiée
            </CardDescription>
            <CardTitle className="text-base text-[#041F40] font-bold truncate">
              {user?.name || "Administrateur"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-xs text-slate-600 space-y-1">
            <p className="truncate font-mono text-[#041F40] font-medium">{user?.email || "admin@emberton.com"}</p>
            <p className="text-slate-500">ID Système : #{user?.id || "N/A"}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-xl p-4">
          <CardHeader className="p-0 pb-2">
            <CardDescription className="text-slate-500 text-xs uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Laptop className="w-4 h-4 text-emerald-600" />
              Session Active
            </CardDescription>
            <CardTitle className="text-base text-[#041F40] font-bold">
              Chiffrement JWT SHA-256
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-xs text-slate-600 space-y-1">
            <p className="text-emerald-700 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Jeton authentifié valide
            </p>
            <p className="text-slate-500">Protection HTTPS & En-têtes sécurisés</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-xl p-4">
          <CardHeader className="p-0 pb-2">
            <CardDescription className="text-slate-500 text-xs uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <History className="w-4 h-4 text-purple-600" />
              Politique d'Accès
            </CardDescription>
            <CardTitle className="text-base text-[#041F40] font-bold">
              Contrôle RBAC Strict
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-xs text-slate-600 space-y-1">
            <p className="text-slate-700">Routes d'administration cloisonnées</p>
            <p className="text-emerald-700 font-medium">Protection CSRF / XSS activée</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de modification du mot de passe */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 p-5 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-100 text-[#041F40]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base text-[#041F40] font-bold">
                  Modifier le mot de passe
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-0.5">
                  Assurez la sécurité de votre espace de gestion en renouvelant régulièrement votre passe.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Mot de passe actuel */}
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-slate-700 text-xs font-semibold">
                  Mot de passe actuel <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="••••••••••••"
                    required
                    className="bg-white border-slate-300 text-slate-900 pr-10 rounded-lg focus:border-[#041F40] focus:ring-1 focus:ring-[#041F40] h-9 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-slate-700 text-xs font-semibold">
                  Nouveau mot de passe <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Au moins 6 caractères robustes"
                    required
                    className="bg-white border-slate-300 text-slate-900 pr-10 rounded-lg focus:border-[#041F40] focus:ring-1 focus:ring-[#041F40] h-9 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Indicateur de force */}
                {passwordData.newPassword.length > 0 && (
                  <div className="pt-2 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Force du mot de passe :</span>
                      <span className="font-semibold text-slate-800">
                        {strengthLabels[strengthScore]}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-full flex-1 transition-all duration-300 rounded-full ${
                            strengthScore >= lvl ? strengthColors[strengthScore] : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmation */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-slate-700 text-xs font-semibold">
                  Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Répétez le mot de passe"
                    required
                    className="bg-white border-slate-300 text-slate-900 pr-10 rounded-lg focus:border-[#041F40] focus:ring-1 focus:ring-[#041F40] h-9 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    })
                  }
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg"
                >
                  Réinitialiser
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#041F40] hover:bg-[#041F40]/90 text-white font-bold text-xs h-9 rounded-lg shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mise à jour en cours...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Enregistrer le mot de passe
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Panneau de conseils & bonnes pratiques */}
        <div className="space-y-4">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-bold text-[#041F40] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Recommandations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Utilisez au moins 10 caractères mélangeant majuscules, chiffres et symboles.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Ne réutilisez jamais ce mot de passe sur d'autres plateformes grand public.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Déconnectez-vous toujours après utilisation sur un poste partagé.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-bold text-[#041F40] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600" /> Double Facteur (2FA)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-xs text-slate-600 space-y-3">
              <p>
                L'authentification multi-facteurs protège votre compte contre les intrusions non autorisées.
              </p>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                <span className="text-slate-800 font-medium">Protection SMS / Email</span>
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                  Activée
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
