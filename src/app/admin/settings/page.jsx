"use client";

import React from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  Bell,
  Users,
  BarChart2,
  Loader2,
  Save,
  Mail,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchMissions, putMissions } from "@/services/fetchData.js";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [adminEmail, setAdminEmail] = React.useState("admin@example.com");
  const [notificationSettings, setNotificationSettings] = React.useState({
    newUserSignup: true,
    reportSubmitted: true,
    missionExpiringSoon: false,
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  React.useEffect(() => {
    loadSettings();
  }, []);
  const loadSettings = async () => {
    try {
      const data = await fetchMissions(
        "notificationSettings",
        API_BASE_URL + "notifications"
      );

      setNotificationSettings({
        newUserSignup: data.newUserSignup,
        reportSubmitted: data.reportSubmitted,
        missionExpiringSoon: data.missionExpiringSoon,
      });
      setAdminEmail(data.email);

      toast({
        title: "Paramètres chargés",
        description: "Configuration mise à jour",
      });
    } catch (error) {
      console.error("Erreur chargement:", error);
      toast({
        title: "Erreur Backend",
        description:
          "Impossible de se connecter au backend. Vérifiez que le serveur est démarré sur le port 5000.",
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsLoaded(true);
    }
  };

  // Fonction pour basculer les notifications
  const handleNotificationToggle = (key, checked) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: checked }));
  };

  // Fonction pour sauvegarder les paramètres
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const data = await putMissions(
        API_BASE_URL + "notifications",
        { notificationSettings },
        "notificationSettings",
        API_BASE_URL + "notifications"
      );
      toast({
        title: "Paramètres sauvegardés",
        description:
          "Vos préférences de notification ont été mises à jour dans la base de données.",
      });
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: `Impossible de sauvegarder: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const NotificationRow = ({ id, title, description, settingKey }) => (
    <div className="flex items-center justify-between space-x-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
      <Label
        htmlFor={id}
        className="flex flex-col space-y-0.5 flex-grow pr-4 cursor-pointer"
      >
        <span className="font-semibold text-xs sm:text-sm text-[#041F40]">{title}</span>
        <span className="font-normal text-xs text-slate-500 leading-snug">
          {description}
        </span>
      </Label>
      <Switch
        id={id}
        checked={notificationSettings[settingKey]}
        onCheckedChange={(checked) =>
          handleNotificationToggle(settingKey, checked)
        }
        className="data-[state=checked]:bg-emerald-600"
        aria-label={`Toggle ${title} notifications`}
      />
    </div>
  );

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#041F40]" />
        <span className="text-sm font-medium text-slate-600">
          Chargement des paramètres...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#041F40] text-[#D6C799] shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#041F40] tracking-tight">
                Paramètres Système
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Gérez les notifications par email et les préférences de la plateforme
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="bg-[#041F40] hover:bg-[#041F40]/90 text-white font-bold text-xs h-9 rounded-lg shadow-sm px-5 self-start md:self-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#D6C799]" />
              Sauvegarde en cours...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2 text-[#D6C799]" />
              Sauvegarder les Paramètres
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Compte Administrateur */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="p-5 border-b border-slate-100 bg-white">
            <CardTitle className="text-base font-bold text-[#041F40] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#041F40]" />
              Compte Administrateur & Réception
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Informations sur le compte administrateur et adresse de réception des alertes système
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="adminEmail" className="text-xs font-semibold text-slate-700">
                Email de notification Administrateur
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative flex-grow">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="adminEmail"
                    value={adminEmail}
                    readOnly
                    disabled
                    className="pl-9 bg-slate-50 border-slate-300 text-slate-900 cursor-not-allowed text-xs h-9 rounded-lg font-medium"
                  />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Configuré</span>
                </div>
              </div>
            </div>
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
              <strong>Notice d'environnement :</strong> Cette adresse est synchronisée avec la configuration du serveur backend. Tous les emails de supervision et d'alertes y sont acheminés automatiquement.
            </div>
          </CardContent>
        </Card>

        {/* Notifications Email */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="p-5 border-b border-slate-100 bg-white">
            <CardTitle className="text-base font-bold text-[#041F40] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#041F40]" />
              Notifications Email Automatiques
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Configurez les événements déclenchant des notifications par email automatiques
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <NotificationRow
              id="newUserSignup"
              title="Nouvelle Inscription Mystery Shopper"
              description="Recevoir une alerte par email quand un nouvel auditeur crée son compte sur la plateforme."
              settingKey="newUserSignup"
            />

            <NotificationRow
              id="reportSubmitted"
              title="Rapport de Mission Soumis"
              description="Recevoir un email d'alerte dès qu'un shopper soumet un questionnaire d'audit pour validation."
              settingKey="reportSubmitted"
            />

            <NotificationRow
              id="missionExpiringSoon"
              title="Mission Arrivant à Expiration"
              description="Recevoir un rappel pour les missions approchant de leur date limite sans rapport complété."
              settingKey="missionExpiringSoon"
            />
          </CardContent>
        </Card>

        {/* Configuration Système */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="p-5 border-b border-slate-100 bg-white">
            <CardTitle className="text-base font-bold text-[#041F40] flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#041F40]" />
              Configuration Avancée
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Options supplémentaires et intégrité du système
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed space-y-1.5">
              <p className="font-semibold text-slate-800">
                Paramètres globaux gérés par le système :
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Gestion automatique des statuts de missions (Available / Completed / Cancelled)</li>
                <li>Attribution instantanée par assignation d'exception</li>
                <li>Sécurité JWT avec jetons chiffrés et contrôle RBAC strict</li>
                <li>Compatibilité avec les modèles d'importation Excel (.xlsx, .csv)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
