"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  User,
  Bell,
  Save,
  Camera,
  Moon,
  Sun,
  Share2,
  Linkedin,
  Facebook,
  Settings,
  Info,
  Upload,
  FileText,
  MapPin,
  Cake,
  Users,
  CreditCard,
  Landmark,
  Globe,
  Loader2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuthToken, api } from "@/services/fetchData";
import { useAuth } from "@/context/auth-context";

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

export default function SettingsPage() {
  const { toast } = useToast();
  const { updateUser } = useAuth();

  const [userProfile, setUserProfile] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    profilePicUrl: "",
    city: "",
    motivation: "",
    cvUrl: "",
    birthYear: "",
    gender: "",
  });

  const [profilePicPreview, setProfilePicPreview] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [notifications, setNotifications] = useState({
    newMissionEmail: true,
    deadlineReminderEmail: false,
    reportStatusPush: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cvFileName, setCvFileName] = useState("");
  const [isBankSaving, setIsBankSaving] = useState(false);
  const [bankingData, setBankingData] = useState({
    accountHolder: "",
    rib: "",
    bankName: "",
    swift: "",
    country: "Maroc",
    currency: "MAD",
  });

  // Gestion du changement de mot de passe
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez renseigner votre mot de passe actuel et le nouveau.",
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
        title: "Mots de passe différents",
        description: "La confirmation ne correspond pas au nouveau mot de passe.",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-auth-token": token || "",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "✅ Mot de passe modifié",
          description: data.message || "Votre mot de passe a été mis à jour avec succès.",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordSection(false);
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: data.message || "Impossible de modifier le mot de passe.",
        });
      }
    } catch (err) {
      console.error("Erreur changement de mot de passe:", err);
      toast({
        variant: "destructive",
        title: "Erreur réseau",
        description: "Une erreur est survenue lors de la communication avec le serveur.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("missionViewAuth"));
    if (currentUser?.user) {
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        id: currentUser.user.id || "",
        name: currentUser.user.name || "",
        email: currentUser.user.email || "",
        role: currentUser.user.role || "",
        profilePicUrl: currentUser.user.profilePicUrl || "",
        city: currentUser.user.city || "",
        motivation: currentUser.user.motivation || "",
        cvUrl: currentUser.user.cvUrl || "",
        birthYear: currentUser.user.birthYear || "",
        gender: currentUser.user.gender || "",
      }));
      setProfilePicPreview(currentUser.user.profilePicUrl || "");
    }

    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialDarkMode =
      storedTheme === "dark" || (!storedTheme && prefersDark);
    setIsDarkMode(initialDarkMode);
    fetchBankInfo(currentUser.user.id);
  }, []);

  const fetchBankInfo = async (userId) => {
    try {
      const response = await api.get(`bank_info/${userId}`);
      const result = response.data;
      console.log("Données bancaires récupérées:", result);
      if (result && result.data) {
        setBankingData({
          accountHolder: result.data.account_holder || "",
          rib: result.data.rib || "",
          bankName: result.data.bank_name || "",
          swift: result.data.swift || "",
          country: result.data.country || "Maroc",
          currency: result.data.currency || "MAD",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.warn("Erreur chargement données bancaires:", error);
      return false;
    }
  };

  useEffect(() => {
    if (userProfile.id) {
      fetchBankInfo(userProfile.id);
    }
  }, [userProfile.id]);

  const handleInputChange = (event) => {
    const { name, value, type } = event.target;
    const processedValue =
      type === "number" ? (value ? parseInt(value, 10) : "") : value;
    setUserProfile((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleGenderChange = (value) => {
    setUserProfile((prev) => ({ ...prev, gender: value || "" }));
  };

  const handleThemeChange = (checked) => {
    setIsDarkMode(checked);
    const newTheme = checked ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.dispatchEvent(
      new StorageEvent("storage", { key: "theme", newValue: newTheme }),
    );
    toast({
      title: `Theme Changed`,
      description: `Switched to ${checked ? "Dark" : "Light"} Mode.`,
    });
  };

  const handleNotificationChange = (id, checked) => {
    setNotifications((prev) => ({ ...prev, [id]: checked }));
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Format non valide",
        description: "Veuillez sélectionner un fichier image (JPG, PNG, WEBP).",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Fichier trop volumineux",
        description: "L'image ne doit pas dépasser 10 Mo.",
      });
      return;
    }

    // Prévisualisation instantanée
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setIsUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload réel vers le serveur backend
      const uploadRes = await api.post("upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = uploadRes.data?.file?.url;
      if (!uploadedUrl) {
        throw new Error("L'URL de l'image n'a pas été retournée par le serveur.");
      }

      // Sauvegarde persistante en base de données
      const userId =
        userProfile.id ||
        JSON.parse(localStorage.getItem("missionViewAuth") || "{}")?.user?.id;

      if (userId) {
        await api.patch(`users/${userId}`, { profilePicUrl: uploadedUrl });
      }

      setUserProfile((prev) => ({ ...prev, profilePicUrl: uploadedUrl }));
      setProfilePicPreview(uploadedUrl);

      if (updateUser) {
        updateUser({ profilePicUrl: uploadedUrl });
      }

      // Synchronisation du localStorage et des cookies pour persistance immédiate
      const currentStored = localStorage.getItem("missionViewAuth");
      if (currentStored) {
        try {
          const parsed = JSON.parse(currentStored);
          if (parsed?.user) {
            parsed.user.profilePicUrl = uploadedUrl;
            parsed.user.profile_pic_url = uploadedUrl;
            localStorage.setItem("missionViewAuth", JSON.stringify(parsed));
            const maxAge = 7 * 24 * 60 * 60;
            document.cookie = `missionViewAuth=${encodeURIComponent(
              JSON.stringify(parsed),
            )}; path=/; max-age=${maxAge}; SameSite=Lax`;
          }
        } catch (e) {}
      }

      toast({
        title: "✅ Photo enregistrée",
        description: "Votre nouvelle photo de profil est sauvegardée avec succès.",
      });
    } catch (err) {
      console.error("Erreur upload photo:", err);
      toast({
        variant: "destructive",
        title: "Échec du téléchargement",
        description:
          err.response?.data?.error ||
          err.message ||
          "Impossible d'enregistrer la photo sur le serveur.",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCvChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setCvFileName("");
      setUserProfile((prev) => ({ ...prev, cvUrl: "" }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Fichier trop volumineux",
        description: "Le CV ne doit pas dépasser 10 Mo.",
      });
      return;
    }

    setCvFileName(file.name);
    setIsUploadingCv(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await api.post("upload/document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = uploadRes.data?.file?.url;
      if (!uploadedUrl) {
        throw new Error("URL du CV manquante.");
      }

      const userId =
        userProfile.id ||
        JSON.parse(localStorage.getItem("missionViewAuth") || "{}")?.user?.id;

      if (userId) {
        await api.patch(`users/${userId}`, { cvUrl: uploadedUrl });
      }

      setUserProfile((prev) => ({ ...prev, cvUrl: uploadedUrl }));
      if (updateUser) {
        updateUser({ cvUrl: uploadedUrl });
      }

      toast({
        title: "✅ CV enregistré",
        description: `Le document ${file.name} a été téléversé avec succès.`,
      });
    } catch (err) {
      console.error("Erreur upload CV:", err);
      toast({
        variant: "destructive",
        title: "Erreur CV",
        description:
          err.response?.data?.error ||
          err.message ||
          "Échec de l'upload du CV.",
      });
    } finally {
      setIsUploadingCv(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);

    try {
      const userId =
        userProfile.id ||
        JSON.parse(localStorage.getItem("missionViewAuth") || "{}")?.user?.id;

      // 1. Sauvegarde des données profil en base de données
      if (userId) {
        await api.patch(`users/${userId}`, {
          city: userProfile.city || null,
          motivation: userProfile.motivation || null,
          birthYear: userProfile.birthYear
            ? parseInt(userProfile.birthYear, 10)
            : null,
          gender: userProfile.gender || null,
        });

        if (updateUser) {
          updateUser({
            city: userProfile.city,
            motivation: userProfile.motivation,
            birthYear: userProfile.birthYear,
            gender: userProfile.gender,
          });
        }
      }

      // 2. Sauvegarde des préférences notifications
      if (userId) {
        try {
          await fetch(`${API_BASE_URL}user-notifications/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notifications }),
          });
        } catch (e) {
          // ignore notification service warning
        }
      }

      toast({
        title: "✅ Modifications enregistrées",
        description: "Vos paramètres et profil ont été enregistrés.",
      });
    } catch (err) {
      console.error("Erreur sauvegarde paramètres:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          err.response?.data?.message ||
          "Impossible d'enregistrer vos paramètres.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBankingChange = (e) => {
    const { name, value } = e.target;
    setBankingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveBankingInfo = async () => {
    if (
      !bankingData.accountHolder ||
      !bankingData.rib ||
      !bankingData.bankName
    ) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description:
          "Veuillez remplir le titulaire, le RIB et le nom de la banque.",
      });
      return;
    }

    setIsBankSaving(true);

    try {
      const userId = userProfile.id;
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "ID utilisateur non trouvé. Veuillez vous reconnecter.",
        });
        setIsBankSaving(false);
        return;
      }

      const bankData = {
        user_id: parseInt(userId),
        account_holder: bankingData.accountHolder,
        rib: bankingData.rib,
        bank_name: bankingData.bankName,
        swift: bankingData.swift || null,
        country: bankingData.country || "Maroc",
        currency: bankingData.currency || "MAD",
      };

      console.log("📤 Envoi des données bancaires:", bankData);

      let hasExistingData = false;
      try {
        const checkResponse = await api.get(`bank_info/${userId}`);
        hasExistingData = Boolean(checkResponse.data?.data);
      } catch (e) {
        hasExistingData = false;
      }

      console.log("🔍 Données existantes?", hasExistingData);

      let result;
      if (hasExistingData) {
        console.log("🔄 Mise à jour des données bancaires");
        const res = await api.put(`bank_info/${userId}`, bankData);
        result = res.data;
      } else {
        console.log("➕ Création de nouvelles données bancaires");
        const res = await api.post("bank_info", bankData);
        result = res.data;
      }

      toast({
        title: hasExistingData
          ? "Coordonnées bancaires mises à jour"
          : "Coordonnées bancaires enregistrées",
        description:
          result?.message ||
          "Vos informations ont été sauvegardées avec succès.",
      });

      await fetchBankInfo(userId);
    } catch (error) {
      console.error("❌ Erreur sauvegarde bancaire:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error.message ||
          "Impossible d'enregistrer vos coordonnées bancaires. Veuillez réessayer.",
      });
    } finally {
      setIsBankSaving(false);
    }
  };

  const handleShare = (platform) => {
    const profileUrl = window.location.origin;
    const text = `Check out my MissionView profile!`;
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}&quote=${encodeURIComponent(text)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation retour */}
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-sm text-xs sm:text-sm rounded-xl font-medium"
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-1.5 text-slate-500" /> Retour aux missions
          </Link>
        </Button>

        {/* Bannière Executive */}
        <div className="rounded-2xl p-5 sm:p-7 bg-gradient-to-r from-[#041F40] via-[#093568] to-[#041F40] text-white shadow-lg flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6C799]">
                Compte & Préférences
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-[#D6C799]" /> Mes Paramètres
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Gérez votre profil, vos coordonnées bancaires et vos notifications.
            </p>
          </div>
        </div>

        {/* Profile Information Section */}
        <Card className="shadow-sm border border-slate-200/80 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-[#041F40]">
              <User className="w-5 h-5 text-[#D6C799]" /> Informations Personnelles
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs sm:text-sm">
              Gérez vos informations personnelles et votre photo de profil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-[#D6C799] shadow-md">
                  <AvatarImage
                    src={profilePicPreview || userProfile.profilePicUrl}
                    alt={userProfile.name}
                  />
                  <AvatarFallback className="bg-[#041F40] text-[#D6C799] text-2xl font-bold">
                    {userProfile.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center backdrop-blur-xs">
                    <Loader2 className="w-6 h-6 text-[#D6C799] animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-grow space-y-2 text-center sm:text-left">
                <Label
                  htmlFor="profile-picture-upload"
                  className="text-sm font-semibold text-slate-800"
                >
                  Photo de profil
                </Label>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />
                  <Button
                    asChild={!isUploadingPhoto}
                    disabled={isUploadingPhoto}
                    variant="outline"
                    size="sm"
                    className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl shadow-xs"
                  >
                    {isUploadingPhoto ? (
                      <span className="flex items-center text-xs">
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-[#041F40]" />
                        Téléchargement...
                      </span>
                    ) : (
                      <Label
                        htmlFor="profile-picture-upload"
                        className="cursor-pointer flex items-center"
                      >
                        <Camera className="w-4 h-4 mr-2 text-[#041F40]" />
                        Changer la photo
                      </Label>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Téléchargez une photo de profil nette (JPG, PNG, WEBP).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-slate-700 font-semibold text-xs sm:text-sm">
                  Nom Complet
                </Label>
                <Input
                  id="name"
                  value={userProfile.name}
                  readOnly
                  className="bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed font-medium"
                />
                <p className="text-xs text-slate-400 pt-1">
                  Le nom est lié à votre compte.
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-slate-700 font-semibold text-xs sm:text-sm">
                  Adresse Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  readOnly
                  className="bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed font-medium"
                />
                <p className="text-xs text-slate-400 pt-1">
                  L'email est utilisé pour la connexion.
                </p>
              </div>
            </div>

            {/* Section Modification de Mot de Passe */}
            <div className="pt-2 border-t border-slate-200">
              {!showPasswordSection ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordSection(true)}
                  className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 gap-2 h-9 text-xs font-semibold rounded-xl shadow-xs"
                >
                  <KeyRound className="w-4 h-4 text-[#041F40]" />
                  Modifier mon mot de passe
                </Button>
              ) : (
                <form
                  onSubmit={handlePasswordChange}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 max-w-lg shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#041F40] flex items-center gap-1.5 uppercase tracking-wider">
                      <Lock className="w-3.5 h-3.5 text-[#041F40]" /> Sécurité & Mot de passe
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPasswordSection(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                    >
                      Fermer
                    </button>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-slate-700 font-medium">Mot de passe actuel *</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="••••••••"
                        required
                        className="h-9 bg-white border-slate-200 text-slate-900 text-xs pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-700 font-medium">Nouveau mot de passe *</Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          placeholder="Min. 6 caractères"
                          required
                          className="h-9 bg-white border-slate-200 text-slate-900 text-xs pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-slate-700 font-medium">Confirmer le mot de passe *</Label>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="Répétez le nouveau"
                        required
                        className="h-9 bg-white border-slate-200 text-slate-900 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      className="h-8 px-4 text-xs font-semibold bg-[#041F40] hover:bg-[#073366] text-[#D6C799] rounded-xl shadow-xs"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Mise à jour...
                        </>
                      ) : (
                        "Confirmer la modification"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPasswordSection(false)}
                      className="h-8 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Profile Information Section */}
        <Card className="shadow-sm border border-slate-200/80 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-[#041F40]">
              <Info className="w-5 h-5 text-[#D6C799]" /> Informations Complémentaires
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs sm:text-sm">
              Complétez votre profil pour augmenter vos chances d'obtenir des missions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="birthYear"
                  className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs sm:text-sm"
                >
                  <Cake className="w-4 h-4 text-[#041F40]" /> Année de naissance
                </Label>
                <Input
                  id="birthYear"
                  name="birthYear"
                  type="number"
                  placeholder="AAAA"
                  min="1920"
                  max={new Date().getFullYear() - 18}
                  value={userProfile.birthYear}
                  onChange={handleInputChange}
                  className="border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#041F40]"
                />
                <p className="text-xs text-slate-400 pt-1">
                  Permet d'adapter les missions à votre profil.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="gender"
                  className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs sm:text-sm"
                >
                  <Users className="w-4 h-4 text-[#041F40]" /> Genre
                </Label>
                <Select
                  name="gender"
                  value={userProfile.gender}
                  onValueChange={handleGenderChange}
                >
                  <SelectTrigger
                    id="gender"
                    className="border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#041F40]"
                  >
                    <SelectValue placeholder="Sélectionnez votre genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900 shadow-md">
                    <SelectItem value="female">Féminin</SelectItem>
                    <SelectItem value="male">Masculin</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                    <SelectItem value="prefer_not_say">Je préfère ne pas dire</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400 pt-1">
                  Information démographique optionnelle.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="city"
                className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs sm:text-sm"
              >
                <MapPin className="w-4 h-4 text-[#041F40]" /> Ville / Localisation
              </Label>
              <Input
                id="city"
                name="city"
                placeholder="Entrez votre ville"
                value={userProfile.city}
                onChange={handleInputChange}
                className="border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#041F40]"
              />
              <p className="text-xs text-slate-400 pt-1">
                Nous aide à trouver des missions près de chez vous.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="motivation" className="text-slate-700 font-semibold text-xs sm:text-sm">
                Votre Motivation
              </Label>
              <Textarea
                id="motivation"
                name="motivation"
                placeholder="Dites-nous pourquoi vous souhaitez devenir shopper mystère..."
                className="resize-y min-h-[90px] border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#041F40]"
                value={userProfile.motivation}
                onChange={handleInputChange}
              />
              <p className="text-xs text-slate-400 pt-1">
                Décrivez brièvement votre intérêt et vos compétences.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="cv-upload"
                className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs sm:text-sm"
              >
                <FileText className="w-4 h-4 text-[#041F40]" /> Télécharger CV (Optionnel)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cv-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvChange}
                  disabled={isUploadingCv}
                  className="hidden"
                />
                <Button
                  asChild={!isUploadingCv}
                  disabled={isUploadingCv}
                  variant="outline"
                  size="sm"
                  className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl shadow-xs"
                >
                  {isUploadingCv ? (
                    <span className="flex items-center text-xs">
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-[#041F40]" />
                      Téléchargement du CV...
                    </span>
                  ) : (
                    <Label
                      htmlFor="cv-upload"
                      className="cursor-pointer flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2 text-[#041F40]" /> Choisir un fichier
                    </Label>
                  )}
                </Button>
                {cvFileName && (
                  <span className="text-sm text-slate-600 font-medium">
                    {cvFileName}
                  </span>
                )}
              </div>
              {userProfile.cvUrl && !cvFileName && (
                <p className="text-xs text-slate-500 pt-1">
                  Fichier actuel:{" "}
                  <Link
                    href={userProfile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#041F40] font-semibold hover:text-[#093568]"
                  >
                    {userProfile.cvUrl.split("/").pop()}
                  </Link>
                </p>
              )}
              <p className="text-xs text-slate-400 pt-1">
                Téléchargez votre CV (PDF, DOC, DOCX).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Banking Information Section */}
        <Card className="shadow-sm border border-slate-200/80 bg-white rounded-2xl overflow-hidden border-l-4 border-l-[#D6C799]">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-[#041F40]">
              <CreditCard className="w-5 h-5 text-[#D6C799]" /> Coordonnées Bancaires
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs sm:text-sm">
              Ces informations sont nécessaires pour le virement de vos dédommagements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="accountHolder"
                  className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs sm:text-sm"
                >
                  Nom du titulaire <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="accountHolder"
                  name="accountHolder"
                  value={bankingData.accountHolder}
                  onChange={handleBankingChange}
                  placeholder="Ex: Jean Dupont"
                  className="border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#041F40]"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="bankName"
                  className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs sm:text-sm"
                >
                  <Landmark className="w-4 h-4 text-[#041F40]" /> Nom de la Banque <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="bankName"
                  name="bankName"
                  value={bankingData.bankName}
                  onChange={handleBankingChange}
                  placeholder="Ex: CIH, Attijari, BNP, Société Générale..."
                  className="border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#041F40]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rib" className="text-slate-700 font-semibold text-xs sm:text-sm">
                RIB / IBAN <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="rib"
                name="rib"
                value={bankingData.rib}
                onChange={handleBankingChange}
                placeholder="Saisissez votre RIB complet (24 chiffres pour le Maroc)"
                className="border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#041F40] font-mono text-xs sm:text-sm"
              />
              <p className="text-[11px] text-slate-400">
                Vérifiez scrupuleusement votre RIB avant d'enregistrer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="swift" className="text-slate-700 font-semibold text-xs sm:text-sm">
                  Code SWIFT/BIC
                </Label>
                <Input
                  id="swift"
                  name="swift"
                  value={bankingData.swift}
                  onChange={handleBankingChange}
                  placeholder="Optionnel"
                  className="border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#041F40] font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="country"
                  className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs sm:text-sm"
                >
                  <Globe className="w-4 h-4 text-[#041F40]" /> Pays
                </Label>
                <Input
                  id="country"
                  name="country"
                  value={bankingData.country}
                  onChange={handleBankingChange}
                  className="border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#041F40]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold text-xs sm:text-sm">Devise</Label>
                <Select
                  value={bankingData.currency}
                  onValueChange={(v) =>
                    setBankingData((p) => ({ ...p, currency: v }))
                  }
                >
                  <SelectTrigger className="border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#041F40]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900 shadow-md">
                    <SelectItem value="MAD">MAD (Dirham)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    <SelectItem value="USD">USD (Dollar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t border-slate-100 justify-end py-4 px-6">
            <Button
              onClick={handleSaveBankingInfo}
              disabled={isBankSaving}
              className="bg-[#041F40] hover:bg-[#082a52] text-[#D6C799] font-bold rounded-xl shadow-sm text-xs sm:text-sm"
            >
              {isBankSaving ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Enregistrer mes coordonnées
            </Button>
          </CardFooter>
        </Card>

        {/* Appearance Section */}
        <Card className="shadow-sm border border-slate-200/80 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-[#041F40]">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-[#D6C799]" />
              ) : (
                <Sun className="w-5 h-5 text-[#D6C799]" />
              )}{" "}
              Apparence
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs sm:text-sm">
              Personnalisez l'affichage de l'application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between space-x-2 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <Label
                htmlFor="dark-mode"
                className="flex flex-col space-y-1 text-slate-800"
              >
                <span className="font-semibold text-sm">Mode Sombre</span>
                <span className="font-normal leading-snug text-slate-500 text-xs">
                  Activez le thème sombre pour réduire la fatigue oculaire.
                </span>
              </Label>
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={handleThemeChange}
                aria-label="Toggle dark mode"
                className="data-[state=checked]:bg-[#041F40]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings Section */}
        <Card className="shadow-sm border border-slate-200/80 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-[#041F40]">
              <Bell className="w-5 h-5 text-[#D6C799]" /> Préférences de Notification
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs sm:text-sm">
              Choisissez comment vous souhaitez être informé des missions et mises à jour.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center justify-between space-x-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
              <Label
                htmlFor="new-mission-email"
                className="flex flex-col space-y-1 text-slate-800"
              >
                <span className="font-semibold text-sm">Alertes nouvelles missions (Email)</span>
                <span className="font-normal leading-snug text-slate-500 text-xs">
                  Recevez un email lorsqu'une nouvelle mission correspond à votre profil.
                </span>
              </Label>
              <Switch
                id="new-mission-email"
                checked={notifications.newMissionEmail}
                onCheckedChange={(checked) =>
                  handleNotificationChange("newMissionEmail", checked)
                }
                aria-label="Toggle new mission email alerts"
                className="data-[state=checked]:bg-[#041F40]"
              />
            </div>
            <div className="flex items-center justify-between space-x-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
              <Label
                htmlFor="deadline-reminder-email"
                className="flex flex-col space-y-1 text-slate-800"
              >
                <span className="font-semibold text-sm">Rappels d'échéances (Email)</span>
                <span className="font-normal leading-snug text-slate-500 text-xs">
                  Recevez un rappel avant la date limite de soumission de vos rapports.
                </span>
              </Label>
              <Switch
                id="deadline-reminder-email"
                checked={notifications.deadlineReminderEmail}
                onCheckedChange={(checked) =>
                  handleNotificationChange("deadlineReminderEmail", checked)
                }
                aria-label="Toggle deadline reminder email alerts"
                className="data-[state=checked]:bg-[#041F40]"
              />
            </div>
            <div className="flex items-center justify-between space-x-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
              <Label
                htmlFor="report-status-push"
                className="flex flex-col space-y-1 text-slate-800"
              >
                <span className="font-semibold text-sm">Mises à jour des rapports (Push)</span>
                <span className="font-normal leading-snug text-slate-500 text-xs">
                  Notifications immédiates lorsque votre rapport est validé ou traité.
                </span>
              </Label>
              <Switch
                id="report-status-push"
                checked={notifications.reportStatusPush}
                onCheckedChange={(checked) =>
                  handleNotificationChange("reportStatusPush", checked)
                }
                aria-label="Toggle report status push notifications"
                className="data-[state=checked]:bg-[#041F40]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Share Profile Section */}
        <Card className="shadow-sm border border-slate-200/80 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-[#041F40]">
              <Share2 className="w-5 h-5 text-[#D6C799]" /> Partager votre profil
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs sm:text-sm">
              Faites connaître votre activité de shopper d'élite auprès de votre réseau.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-start gap-3 pt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare("twitter")}
              aria-label="Share on Twitter"
              className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl shadow-xs h-10 w-10"
            >
              <TwitterIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare("facebook")}
              aria-label="Share on Facebook"
              className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl shadow-xs h-10 w-10"
            >
              <Facebook className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare("linkedin")}
              aria-label="Share on LinkedIn"
              className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl shadow-xs h-10 w-10"
            >
              <Linkedin className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin);
                toast({ title: "Lien copié dans le presse-papiers !" });
              }}
              className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl shadow-xs text-xs font-semibold h-10 px-4"
            >
              Copier le lien
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-4 pb-12">
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="bg-[#041F40] hover:bg-[#082a52] text-[#D6C799] font-bold shadow-md rounded-xl px-6 py-3 h-11 text-sm transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Sauvegarde en cours...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Enregistrer toutes les modifications
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
