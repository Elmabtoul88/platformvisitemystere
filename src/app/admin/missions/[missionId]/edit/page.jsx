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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Save,
  Loader2,
  MapPin as MapPinIcon,
  FileUp,
  Upload,
  X,
  FileText,
  Building2,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { fetchMissions, getAuthToken } from "@/services/fetchData";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/";

export default function EditMissionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const missionId = params.missionId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    reward: "",
    location: "",
    category: "",
    businessName: "",
    clientId: "",
    status: "available",
    pays: "",
    ville: "",
    profil: "",
  });

  const [clients, setClients] = useState([]);

  // Nouveaux fichiers PDF (à uploader)
  const [pdfFiles, setPdfFiles] = useState({
    briefing: null,
    scenario: null,
    questionnaire: null,
  });

  // URLs des PDFs existants (pour affichage)
  const [existingPdfUrls, setExistingPdfUrls] = useState({
    briefing: null,
    scenario: null,
    questionnaire: null,
  });

  // Indique si les fichiers existants doivent être supprimés
  const [removeExistingFiles, setRemoveExistingFiles] = useState({
    briefing: false,
    scenario: false,
    questionnaire: false,
  });

  const [availableCategories, setAvailableCategories] = useState([]);

  // Fetch mission data and categories
  useEffect(() => {
    const getMissionsAndClients = async () => {
      setIsLoading(true);
      try {
        const [missionsRes, clientsRes] = await Promise.allSettled([
          fetchMissions("admin-missions", API_BASE_URL + "missions/admin/all"),
          fetchMissions("admin-clients", API_BASE_URL + "users/role/clients"),
        ]);

        if (clientsRes.status === "fulfilled" && clientsRes.value) {
          setClients(Array.isArray(clientsRes.value) ? clientsRes.value : []);
        }

        const response =
          missionsRes.status === "fulfilled" && missionsRes.value
            ? missionsRes.value
            : [];

        const foundMission = response.find((m) => m.id === parseInt(missionId));
        if (foundMission) {
          const deadlineDate = new Date(foundMission.deadline);
          const formattedDeadline = !isNaN(deadlineDate)
            ? deadlineDate.toISOString().split("T")[0]
            : "";

          setFormData({
            title: foundMission.title || "",
            description: foundMission.description || "",
            deadline: formattedDeadline,
            reward: String(foundMission.reward) || "",
            location: foundMission.location || "",
            category: foundMission.category || "",
            businessName: foundMission.businessName || "",
            clientId: foundMission.clientId ? String(foundMission.clientId) : "",
            status: foundMission.status || "available",
            pays: foundMission.pays || "",
            ville: foundMission.ville || "",
            profil: foundMission.profil || "",
          });

          // Stocker les URLs des PDFs existants
          setExistingPdfUrls({
            briefing: foundMission.briefing || null,
            scenario: foundMission.scenario || null,
            questionnaire: foundMission.questionnaire || null,
          });

          const categories = [
            ...new Set(response.map((m) => m.category).filter(Boolean)),
          ];
          setAvailableCategories(categories);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Mission not found.",
          });
          router.push("/admin/missions");
        }
      } catch (error) {
        console.error("Erreur chargement mission ou clients:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Impossible de charger la mission.",
        });
      }
      setIsLoading(false);
    };
    getMissionsAndClients();
  }, [missionId, router, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFiles((prev) => ({ ...prev, [fieldName]: file }));
      // Si un nouveau fichier est ajouté, on ne supprime pas l'ancien automatiquement
      // On laisse l'utilisateur décider avec le bouton de suppression
      toast({
        title: "PDF ajouté",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      });
    } else if (file) {
      toast({
        variant: "destructive",
        title: "Format non supporté",
        description: "Veuillez sélectionner un fichier PDF",
      });
    }
  };

  const removeFile = (fieldName) => {
    // Si un nouveau fichier est présent, on le supprime
    if (pdfFiles[fieldName]) {
      setPdfFiles((prev) => ({ ...prev, [fieldName]: null }));
    }
    // Si un fichier existant est présent, on le marque pour suppression
    if (existingPdfUrls[fieldName]) {
      setRemoveExistingFiles((prev) => ({ ...prev, [fieldName]: true }));
      setExistingPdfUrls((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.deadline ||
      !formData.reward ||
      !formData.location ||
      !formData.category ||
      !formData.businessName ||
      !formData.status
    ) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Créer FormData pour l'envoi
      const formDataToSend = new FormData();

      // Ajouter les champs du formulaire
      Object.keys(formData).forEach((key) => {
        const val = formData[key] === "none" ? "" : formData[key] || "";
        formDataToSend.append(key, val);
      });

      // Ajouter les nouveaux fichiers PDF (uniquement s'ils ont été sélectionnés)
      if (pdfFiles.briefing) {
        formDataToSend.append("briefing", pdfFiles.briefing);
      }
      if (pdfFiles.scenario) {
        formDataToSend.append("scenario", pdfFiles.scenario);
      }
      if (pdfFiles.questionnaire) {
        formDataToSend.append("questionnaire", pdfFiles.questionnaire);
      }

      // Si des fichiers existants doivent être supprimés, on envoie un indicateur
      if (removeExistingFiles.briefing) {
        formDataToSend.append("remove_briefing", "true");
      }
      if (removeExistingFiles.scenario) {
        formDataToSend.append("remove_scenario", "true");
      }
      if (removeExistingFiles.questionnaire) {
        formDataToSend.append("remove_questionnaire", "true");
      }

      // Envoyer la requête
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}missions/${missionId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-auth-token": token || "",
        },
        body: formDataToSend,
        // Ne pas mettre Content-Type car FormData le gère
      });

      // Lire la réponse brute
      const responseText = await response.text();

      if (!response.ok) {
        // Essayer de parser la réponse si c'est du JSON
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || `Erreur ${response.status}`);
        } catch (e) {
          throw new Error(`Erreur ${response.status}: ${responseText}`);
        }
      }

      // Parser la réponse JSON
      const result = JSON.parse(responseText);

      if (result.success) {
        toast({
          title: "✅ Mission Mise à Jour",
          description: `La mission "${formData.title}" a été mise à jour avec succès.`,
        });
        router.push("/admin/missions");
      } else {
        throw new Error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("❌ Erreur détaillée:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la mission.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /*const handleGetLocation = async () => {
    setIsFetchingLocation(true);
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const latLngString = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
          setFormData((prev) => ({
            ...prev,
            location: latLngString,
          }));
          toast({
            title: "Location Fetched",
            description: `Coordonnées: ${latLngString}`,
          });
          setIsFetchingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(error.message);
          toast({
            variant: "destructive",
            title: "Location Error",
            description:
              error.message || "Impossible de récupérer votre position.",
          });
          setIsFetchingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } else {
      setLocationError("La géolocalisation n'est pas supportée.");
      toast({
        variant: "destructive",
        title: "Geolocation Not Supported",
        description: "Votre navigateur ne supporte pas la géolocalisation.",
      });
      setIsFetchingLocation(false);
    }
  };*/

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des détails de la mission...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button asChild variant="outline" size="sm" className="mb-4">
        <Link href="/admin/missions">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour à la liste
        </Link>
      </Button>

      <Card className="shadow-lg border-none ring-1 ring-border/50">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-xl font-bold text-primary">
            Modifier la Mission
          </CardTitle>
          <CardDescription>
            Modifiez les détails de la mission:{" "}
            <strong>{formData.title}</strong>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            {/* Mission Title and Business Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la mission *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Enseigne *</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Compte Client Partenaire */}
            <div className="space-y-2 p-4 rounded-xl border border-primary/10 bg-primary/5">
              <Label htmlFor="clientId" className="flex items-center gap-2 font-semibold text-primary">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Compte Client Partenaire (Portail Analytics)
              </Label>
              <Select
                value={formData.clientId ? String(formData.clientId) : "none"}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    clientId: val === "none" ? "" : val,
                  }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="clientId" className="bg-white">
                  <SelectValue placeholder="Associer à un client partenaire..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground italic">
                      Aucun client assigné (Interne)
                    </span>
                  </SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} ({c.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Le client sélectionné pourra consulter en temps réel l'ensemble des rapports d'audit, KPIs et verbatims dans son portail entreprise.
              </p>
            </div>

            {/* Pays and Ville */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pays">Pays</Label>
                <Input
                  id="pays"
                  name="pays"
                  value={formData.pays}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder="Ex: Maroc"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ville">Ville</Label>
                <Input
                  id="ville"
                  name="ville"
                  value={formData.ville}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder="Ex: Casablanca"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
                disabled={isSubmitting}
              />
            </div>

            {/* Profil recherché */}
            <div className="space-y-2">
              <Label htmlFor="profil">Profil recherché</Label>
              <Input
                id="profil"
                name="profil"
                value={formData.profil}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="Ex: Femme 30-60 ans"
              />
            </div>

            {/* Location and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="location"
                    name="location"
                    placeholder="Adresse ou coordonnées"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting || isFetchingLocation}
                    className="flex-grow"
                  />
                </div>
                {locationError && (
                  <p className="text-xs text-destructive mt-1">
                    {locationError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  name="category"
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                  required
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.length > 0 ? (
                      availableCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Beauté">Beauté</SelectItem>
                        <SelectItem value="Bricolage">Bricolage</SelectItem>
                        <SelectItem value="Hotels">Hotels</SelectItem>
                        <SelectItem value="Salles de sport">
                          Salles de sport
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deadline and Reward */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Date limite *</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward">Récompense ($) *</Label>
                <Input
                  id="reward"
                  name="reward"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.reward}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Statut *</Label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
                required
                disabled={isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PDF Documents */}
            <div className="space-y-4 border rounded-xl p-6 bg-secondary/10 border-dashed border-primary/20">
              <h3 className="font-bold flex items-center gap-2 text-primary">
                <FileUp className="w-4 h-4" /> Documents PDF
              </h3>
              <p className="text-sm text-muted-foreground">
                Téléchargez de nouveaux fichiers pour remplacer les existants.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["briefing", "scenario", "questionnaire"].map((field) => {
                  const hasExisting =
                    existingPdfUrls[field] && !removeExistingFiles[field];
                  const hasNew = pdfFiles[field];
                  const fileName = hasNew
                    ? pdfFiles[field].name
                    : hasExisting
                      ? existingPdfUrls[field].split("/").pop()
                      : null;

                  return (
                    <div key={field} className="space-y-2">
                      <Label className="text-xs capitalize flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {field}
                      </Label>

                      {hasNew ? (
                        <div className="flex items-center gap-2 p-2 bg-background rounded border border-green-500">
                          <FileUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs truncate flex-1">
                            {fileName}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-green-100 text-green-700"
                          >
                            Nouveau
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => removeFile(field)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : hasExisting ? (
                        <div className="flex items-center gap-2 p-2 bg-background rounded border border-blue-500">
                          <FileUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="text-xs truncate flex-1">
                            {fileName}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-blue-100 text-blue-700"
                          >
                            Existant
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => removeFile(field)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            type="file"
                            accept=".pdf"
                            className="bg-background cursor-pointer"
                            onChange={(e) => handleFileChange(e, field)}
                            disabled={isSubmitting}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Upload className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Taille maximale : 5MB par fichier. Formats acceptés : PDF
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 p-6 border-t bg-primary/5">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/missions")}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mise à
                  jour...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Enregistrer
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
