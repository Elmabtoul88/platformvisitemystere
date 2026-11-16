"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  ArrowLeft,
  Save,
  User,
  Mail,
  MapPin,
  Briefcase,
  CheckCircle,
  Clock,
  Cake,
  Users as UsersIcon,
  FileWarning,
} from "lucide-react"; // Renamed Users to UsersIcon, Added FileWarning
import { mockUsers } from "@/app/admin/users/users-mock.js"; // Use the alias path
import { useToast } from "@/hooks/use-toast";
import { updateUserAction } from "@/app/actions/admin-actions.js"; // Corrected import path again using alias
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/auth-context"; // Import useAuth
import {
  fetchMissions,
  patchMissions,
  updateMissions,
} from "@/services/fetchData";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { token } = useAuth(); // Get token for API call
  const userId = params.userId;
  const [user, setUser] = useState(null); // Store original user data for display
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user data on load
  useEffect(() => {
    const getUserDetails = async (user_id) => {
      try {
        setIsLoading(true);
        setError(null);
        const [foundUser] = await fetchMissions(
          "user" + user_id,
          API_BASE_URL + "users/" + user_id
        );
        // Process date if it exists
        if (foundUser) {
          setUser(foundUser);
          setFormData({
            name: foundUser.name || "",
            email: foundUser.email || "", // Display only
            city: foundUser.city || "",
            motivation: foundUser.motivation || "",
            telephone: foundUser.telephone || "",
            role: foundUser.role || "shopper",
            status: foundUser.status || "active",
            birth_year: foundUser.birth_year || "",
            gender: foundUser.gender || "prefer_not_say",
            cv_url: foundUser.cv_url || null,
            profile_pic_url: foundUser.profile_pic_url, // Store for avatar display
          });
        } else {
          setError("User not found.");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err.message);
        setError("Invalid user ID provided.");
        setIsLoading(false);
        // Optional: Redirect or show permanent error message
        // router.push('/admin/users');
      } finally {
        setIsLoading(false);
      }
    };
    getUserDetails(userId);
  }, [userId]); // Add token to dependencies

  /* */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    // Basic Validation (Add more as needed)
    if (!formData.name || !formData.role || !formData.status) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Name, Role, and Status are required.",
      });
      setIsSaving(false);
      return;
    }

    // Prepare data for API (remove read-only fields like email, cvUrl, profilePicUrl)
    const updateData = { ...formData };
    delete updateData.email;
    delete updateData.cv_url;
    delete updateData.profile_pic_url; // Don't send image URL back

    try {
      // Call the server action to update the user
      //const result = await updateUserAction(userId, updateData, token); // Pass token
      const baseUrl = API_BASE_URL + "users";
      const result = await patchMissions(
        baseUrl + "/" + userId,
        updateData,
        "user" + userId,
        baseUrl + "/" + userId
      );
      localStorage.removeItem("cache_users");
      if (result.success) {
        toast({ title: "User Updated", description: result.message });
        // Redirect back to the user detail page or user list
        router.push(`/admin/users/${userId}`); // Go back to detail view
      } else {
        // Throw error to be caught below
        throw new Error(result.message || "Failed to update user.");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message,
      });
      setIsSaving(false); // Keep form enabled on error
    }
    // No setIsSaving(false) on success due to redirect
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#041F40]" />
        <span className="text-sm font-medium text-slate-600">Chargement de l'utilisateur...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col items-center">
        <Alert variant="destructive" className="w-full mb-4">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg">
          <Link href="/admin/users">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour à la liste
          </Link>
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col items-center">
        <p className="text-sm text-slate-600 mb-4">Données utilisateur introuvables.</p>
        <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg">
          <Link href="/admin/users">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour à la liste
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div className="flex justify-between items-center">
        <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg shadow-sm">
          <Link href={`/admin/users/${userId}`}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Annuler et retourner au profil
          </Link>
        </Button>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-xl font-bold text-[#041F40] flex items-center gap-2">
            <User className="w-5 h-5 text-[#041F40]" /> Modifier le Profil Utilisateur
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Mettez à jour les coordonnées et les autorisations de {user.name}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-5">
            {/* Aperçu Avatar */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <Avatar className="h-16 w-16 border-2 border-[#041F40] shadow-sm">
                <AvatarImage
                  src={formData.profile_pic_url}
                  alt={formData.name}
                />
                <AvatarFallback className="bg-[#041F40] text-[#D6C799] font-bold">
                  {formData.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-bold text-[#041F40]">Photo de profil</p>
                <p className="text-[11px] text-slate-500">
                  Gérée et téléversée par l'utilisateur depuis son compte.
                </p>
              </div>
            </div>

            {/* Champs modifiables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700">Nom Complet *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isSaving}
                  className="bg-white border-slate-300 text-slate-900 rounded-lg text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Adresse Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed rounded-lg text-xs h-9 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Ville / Région
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className="bg-white border-slate-300 text-slate-900 rounded-lg text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telephone" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Numéro de Téléphone
                </Label>
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className="bg-white border-slate-300 text-slate-900 rounded-lg text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="motivation" className="text-xs font-semibold text-slate-700">Motivation</Label>
              <Textarea
                id="motivation"
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                className="min-h-[80px] bg-white border-slate-300 text-slate-900 rounded-lg text-xs"
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="birthYear" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Cake className="w-3.5 h-3.5 text-slate-400" /> Année de Naissance
                </Label>
                <Input
                  id="birthYear"
                  name="birth_year"
                  type="number"
                  placeholder="Ex: 1995"
                  value={formData.birth_year || ""}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className="bg-white border-slate-300 text-slate-900 rounded-lg text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gender" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <UsersIcon className="w-3.5 h-3.5 text-slate-400" /> Genre
                </Label>
                <Select
                  name="gender"
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="gender" className="bg-white border-slate-300 text-slate-900 rounded-lg text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 text-slate-900 text-xs shadow-xl rounded-lg">
                    <SelectItem value="female">Femme</SelectItem>
                    <SelectItem value="male">Homme</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                    <SelectItem value="prefer_not_say">
                      Préfère ne pas préciser
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Rôle Utilisateur *
                </Label>
                <Select
                  name="role"
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                  required
                  disabled={isSaving}
                >
                  <SelectTrigger id="role" className="bg-white border-slate-300 text-slate-900 rounded-lg text-xs h-9 font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 text-slate-900 text-xs shadow-xl rounded-lg">
                    <SelectItem value="shopper">Shopper (Auditeur)</SelectItem>
                    <SelectItem value="client">Client Partenaire</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Statut du Compte *
                </Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  required
                  disabled={isSaving}
                >
                  <SelectTrigger id="status" className="bg-white border-slate-300 text-slate-900 rounded-lg text-xs h-9 font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 text-slate-900 text-xs shadow-xl rounded-lg">
                    <SelectItem value="active">
                      <CheckCircle className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                      Actif
                    </SelectItem>
                    <SelectItem value="inactive">
                      <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                      Inactif
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-slate-100 p-5 bg-slate-50/50">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => router.push(`/admin/users/${userId}`)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-lg"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#041F40] hover:bg-[#041F40]/90 text-white font-bold text-xs h-9 rounded-lg shadow-sm px-5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#D6C799]" /> Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4 text-[#D6C799]" /> Enregistrer les Modifications
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
