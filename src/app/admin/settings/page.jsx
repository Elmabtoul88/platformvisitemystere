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
    <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border bg-background hover:bg-muted/20 transition-colors">
      <Label
        htmlFor={id}
        className="flex flex-col space-y-1 flex-grow pr-4 cursor-pointer"
      >
        <span className="font-medium text-base">{title}</span>
        <span className="font-normal leading-snug text-muted-foreground text-sm">
          {description}
        </span>
      </Label>
      <Switch
        id={id}
        checked={notificationSettings[settingKey]}
        onCheckedChange={(checked) =>
          handleNotificationToggle(settingKey, checked)
        }
        aria-label={`Toggle ${title} notifications`}
      />
    </div>
  );

  if (!isLoaded) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">
            Chargement des paramètres...
          </h2>
          <p className="text-muted-foreground">
            Connexion au backend en cours...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3 text-primary flex items-center gap-3">
          <Shield className="w-8 h-8" />
          Admin Settings
        </h1>
        <p className="text-lg text-muted-foreground">
          Gérez les notifications par email et les paramètres système.
        </p>
      </div>

      <div className="space-y-8">
        {/* Compte Administrateur */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Compte Administrateur
            </CardTitle>
            <CardDescription className="text-base">
              Informations sur le compte administrateur et email de réception
              des notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminEmail" className="text-sm font-medium">
                Email Admin
              </Label>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <Input
                  id="adminEmail"
                  value={adminEmail}
                  readOnly
                  disabled
                  className="bg-secondary/50 cursor-not-allowed flex-grow text-base font-medium"
                />
                <CheckCircle
                  className="w-6 h-6 text-green-500"
                  title="Email configuré"
                />
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>
                  Cet email est configuré dans les variables d'environnement
                  backend (.env).
                </strong>
                <br />
                Tous les emails de notification seront envoyés à cette adresse.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Notifications Email
            </CardTitle>
            <CardDescription className="text-base">
              Configurez quels événements déclenchent des notifications par
              email automatiques.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <NotificationRow
              id="newUserSignup"
              title="Nouvelle Inscription Shopper"
              description="Recevoir un email quand un nouveau mystery shopper s'inscrit sur la plateforme."
              settingKey="newUserSignup"
            />

            <NotificationRow
              id="reportSubmitted"
              title="Rapport de Mission Soumis"
              description="Recevoir un email quand un shopper soumet un rapport de mission pour révision."
              settingKey="reportSubmitted"
            />

            <NotificationRow
              id="missionExpiringSoon"
              title="Mission Arrivant à Expiration"
              description="Recevoir un email d'alerte pour les missions approchant de leur deadline sans rapport."
              settingKey="missionExpiringSoon"
            />
          </CardContent>
        </Card>

        {/* Configuration Système */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-primary" />
              Configuration Système
            </CardTitle>
            <CardDescription className="text-base">
              Paramètres avancés et configuration du système.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground">
                <strong>
                  Espace réservé pour les futures fonctionnalités :
                </strong>
                <br />
                • Points de récompense par défaut
                <br />
                • Workflows de révision des rapports
                <br />
                • Paramètres de délai des missions
                <br />• Configuration des templates d'email
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bouton de Sauvegarde */}
        <div className="flex justify-end pt-6">
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving}
            size="lg"
            className="min-w-[220px] text-base font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sauvegarde en cours...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Sauvegarder les Paramètres
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
