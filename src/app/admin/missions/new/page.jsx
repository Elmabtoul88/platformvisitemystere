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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  FileUp,
  ListOrdered,
  TextCursorInput,
  CheckSquare,
  Info,
  Upload,
  X,
  Award,
  UserCheck,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAuthToken } from "@/services/fetchData";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/";

const ITEM_TYPES = {
  TEXT: "text",
  MULTIPLE_CHOICE: "multiple_choice",
  CHECKBOXES: "checkboxes",
};

const getIconForType = (type) => {
  switch (type) {
    case ITEM_TYPES.TEXT:
      return <TextCursorInput className="w-4 h-4 mr-1" />;
    case ITEM_TYPES.MULTIPLE_CHOICE:
      return <ListOrdered className="w-4 h-4 mr-1" />;
    case ITEM_TYPES.CHECKBOXES:
      return <CheckSquare className="w-4 h-4 mr-1" />;
    default:
      return null;
  }
};

const createNewItem = (type, id) => {
  const base = { id, type, text: "", isRequired: true };
  if (type === ITEM_TYPES.MULTIPLE_CHOICE || type === ITEM_TYPES.CHECKBOXES) {
    base.options = [
      { id: Date.now() + 1, text: "", isCorrect: false },
      { id: Date.now() + 2, text: "", isCorrect: false },
    ];
  }
  return base;
};

export default function CreateMissionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    title: "",
    businessName: "",
    clientId: "",
    description: "",
    deadline: "",
    reward: "",
    country: "",
    city: "",
    category: "",
    soughtProfile: "",
  });

  const [clients, setClients] = useState([]);

  const [pdfFiles, setPdfFiles] = useState({
    briefing: null,
    scenario: null,
    questionnaire: null,
  });

  // Quiz de validation du profil
  const [profileQuiz, setProfileQuiz] = useState([]);

  // Quiz de reconnaissance
  const [recognitionQuiz, setRecognitionQuiz] = useState([]);
  const [recognitionPassingScore, setRecognitionPassingScore] = useState(100);

  // Récupérer l'utilisateur connecté et la liste des clients partenaires
  useEffect(() => {
    const fetchUserAndClients = async () => {
      try {
        const token = getAuthToken();
        const headers = {
          Authorization: `Bearer ${token}`,
          "x-auth-token": token || "",
        };

        const [userRes, clientsRes] = await Promise.allSettled([
          fetch("/api/auth/me", { headers }),
          fetch(`${API_BASE_URL}users/role/clients`, { headers }),
        ]);

        if (userRes.status === "fulfilled" && userRes.value.ok) {
          const data = await userRes.value.json();
          setUser(data.user);
        }

        if (clientsRes.status === "fulfilled" && clientsRes.value.ok) {
          const clientList = await clientsRes.value.json();
          setClients(Array.isArray(clientList) ? clientList : []);
        }
      } catch (error) {
        console.error("Erreur récupération utilisateur ou clients:", error);
      }
    };
    fetchUserAndClients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFiles((prev) => ({ ...prev, [fieldName]: file }));
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
    setPdfFiles((prev) => ({ ...prev, [fieldName]: null }));
  };

  // Fonctions pour le quiz de validation
  const addProfileItem = (type) =>
    setProfileQuiz((prev) => [...prev, createNewItem(type, Date.now())]);
  const removeProfileItem = (id) =>
    setProfileQuiz((prev) => prev.filter((item) => item.id !== id));

  const updateProfileItem = (id, field, value) => {
    setProfileQuiz((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const updateProfileItemOption = (itemId, optionId, value) => {
    setProfileQuiz((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            options: item.options.map((opt) =>
              opt.id === optionId ? { ...opt, text: value } : opt,
            ),
          };
        }
        return item;
      }),
    );
  };

  const addProfileItemOption = (itemId) => {
    setProfileQuiz((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            options: [...item.options, { id: Date.now(), text: "" }],
          };
        }
        return item;
      }),
    );
  };

  // Fonctions pour le quiz de reconnaissance
  const addRecognitionItem = (type) =>
    setRecognitionQuiz((prev) => [...prev, createNewItem(type, Date.now())]);
  const removeRecognitionItem = (id) =>
    setRecognitionQuiz((prev) => prev.filter((item) => item.id !== id));

  const updateRecognitionItem = (id, field, value) => {
    setRecognitionQuiz((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const updateRecognitionItemOption = (itemId, optionId, value) => {
    setRecognitionQuiz((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            options: item.options.map((opt) =>
              opt.id === optionId ? { ...opt, text: value } : opt,
            ),
          };
        }
        return item;
      }),
    );
  };

  const toggleRecognitionOptionCorrect = (itemId, optionId) => {
    setRecognitionQuiz((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          if (item.type === ITEM_TYPES.MULTIPLE_CHOICE) {
            return {
              ...item,
              options: item.options.map((opt) => ({
                ...opt,
                isCorrect: opt.id === optionId,
              })),
            };
          }
          return {
            ...item,
            options: item.options.map((opt) =>
              opt.id === optionId ? { ...opt, isCorrect: !opt.isCorrect } : opt,
            ),
          };
        }
        return item;
      }),
    );
  };

  const addRecognitionItemOption = (itemId) => {
    setRecognitionQuiz((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            options: [
              ...item.options,
              { id: Date.now(), text: "", isCorrect: false },
            ],
          };
        }
        return item;
      }),
    );
  };

  // Gestion du drag & drop - Version simplifiée comme l'original
  const handleDragStart = (e, index, quizType) => {
    e.dataTransfer.setData("itemIndex", index);
    e.dataTransfer.setData("quizType", quizType);
  };

  const handleDrop = (e, index, quizType) => {
    const draggedIndex = parseInt(e.dataTransfer.getData("itemIndex"), 10);
    const draggedQuizType = e.dataTransfer.getData("quizType");

    if (draggedQuizType !== quizType || draggedIndex === index) return;

    const setQuiz =
      quizType === "profile" ? setProfileQuiz : setRecognitionQuiz;
    const quiz = quizType === "profile" ? profileQuiz : recognitionQuiz;

    const newItems = [...quiz];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setQuiz(newItems);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!formData.title || !formData.businessName || !formData.deadline) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
      });
      setIsSubmitting(false);
      return;
    }

    if (profileQuiz.length === 0) {
      toast({
        variant: "destructive",
        title: "Quiz de validation vide",
        description: "Veuillez ajouter au moins une question de validation.",
      });
      setIsSubmitting(false);
      return;
    }

    if (recognitionQuiz.length === 0) {
      toast({
        variant: "destructive",
        title: "Quiz de reconnaissance vide",
        description:
          "Veuillez ajouter au moins une question de reconnaissance.",
      });
      setIsSubmitting(false);
      return;
    }

    const hasCorrectAnswers = recognitionQuiz.every((item) => {
      if (item.type === ITEM_TYPES.TEXT) return true;
      return item.options.some((opt) => opt.isCorrect);
    });

    if (!hasCorrectAnswers) {
      toast({
        variant: "destructive",
        title: "Réponses manquantes",
        description:
          "Chaque question doit avoir au moins une réponse correcte.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title);
      formDataToSend.append("businessName", formData.businessName);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("deadline", formData.deadline);
      formDataToSend.append("reward", formData.reward);
      formDataToSend.append("pays", formData.country);
      formDataToSend.append("ville", formData.city);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("profil", formData.soughtProfile);
      formDataToSend.append(
        "location",
        `${formData.city}, ${formData.country}`,
      );
      formDataToSend.append(
        "clientId",
        formData.clientId && formData.clientId !== "none" ? formData.clientId : "",
      );
      formDataToSend.append("status", "available");
      formDataToSend.append("recognitionPassingScore", recognitionPassingScore);

      if (pdfFiles.briefing) {
        formDataToSend.append("briefing", pdfFiles.briefing);
      }
      if (pdfFiles.scenario) {
        formDataToSend.append("scenario", pdfFiles.scenario);
      }
      if (pdfFiles.questionnaire) {
        formDataToSend.append("questionnaire", pdfFiles.questionnaire);
      }

      const profileQuizData = profileQuiz.map((q) => ({
        type: q.type,
        text: q.text,
        isRequired: q.isRequired,
        options: q.options || [],
        allow_multiple: q.type === "checkboxes" ? 1 : 0,
      }));
      formDataToSend.append("profileQuiz", JSON.stringify(profileQuizData));

      const recognitionQuizData = recognitionQuiz.map((q) => ({
        type: q.type,
        text: q.text,
        isRequired: true,
        options: q.options.map((opt) => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
        allow_multiple: q.type === "checkboxes" ? 1 : 0,
      }));
      formDataToSend.append(
        "recognitionQuiz",
        JSON.stringify(recognitionQuizData),
      );

      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}missions/quiz_mission`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-auth-token": token || "",
          },
          body: formDataToSend,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la création");
      }

      if (result.success) {
        toast({
          title: "✅ Mission Créée",
          description: `${result.profileQuizCount} questions de validation et ${result.recognitionQuizCount} questions de reconnaissance ajoutées.`,
        });
        router.push(`/admin/missions/${result.missionId}/survey/create`);
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error.message || "Erreur lors de la création de la mission",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button asChild variant="outline" size="sm" className="mb-4">
        <Link href="/admin/missions">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Link>
      </Button>

      <Card className="shadow-lg border-none ring-1 ring-border/50">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-xl font-bold text-primary">
            Étape 1 : Création de la mission
          </CardTitle>
          <CardDescription>
            Configurez les détails et les quiz de validation et de
            reconnaissance.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-8">
            {/* Informations de base & Assignation Client */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Enseigne / Marque *</Label>
                <Input
                  name="businessName"
                  placeholder="Ex: Yves Rocher"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 font-semibold text-[#041F40]">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Client Partenaire (Accès Analytics)
                </Label>
                <Select
                  value={formData.clientId || "none"}
                  onValueChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      clientId: val === "none" ? "" : val,
                    }))
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Associer à un compte client..." />
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
                <p className="text-[11px] text-muted-foreground">
                  Le client sélectionné pourra consulter en temps réel les indicateurs et rapports dans son espace entreprise.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Titre de la mission *</Label>
              <Input
                name="title"
                placeholder="Ex: Audit Accueil & Conseil Clientèle"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Pays *</Label>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Ville *</Label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Type Enseigne</Label>
                <Select
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Beauté">Beauté</SelectItem>
                    <SelectItem value="Bricolage">Bricolage</SelectItem>
                    <SelectItem value="Hotels">Hotels</SelectItem>
                    <SelectItem value="Salles de sport">
                      Salles de sport
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Date limite *</Label>
                <Input
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Récompense ($) *</Label>
                <Input
                  name="reward"
                  type="number"
                  step="0.01"
                  value={formData.reward}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Upload PDFs - inchangé */}
            <div className="space-y-4 border rounded-xl p-6 bg-secondary/10 border-dashed border-primary/20">
              <h3 className="font-bold flex items-center gap-2 text-primary">
                <FileUp className="w-4 h-4" /> Documents PDF
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["briefing", "scenario", "questionnaire"].map((field) => (
                  <div key={field} className="space-y-2">
                    <Label className="text-xs capitalize">{field} PDF</Label>
                    {pdfFiles[field] ? (
                      <div className="flex items-center gap-2 p-2 bg-background rounded border">
                        <FileUp className="w-4 h-4 text-primary" />
                        <span className="text-xs truncate flex-1">
                          {pdfFiles[field].name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
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
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Upload className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Taille maximale : 5MB par fichier
              </p>
            </div>

            <div className="space-y-2">
              <Label>Profil recherché *</Label>
              <Input
                name="soughtProfile"
                value={formData.soughtProfile}
                onChange={handleInputChange}
                placeholder="Ex: Femme 30-60 ans"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Résumé de la visite *</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Détaillez le scénario ici..."
                required
                className="min-h-[120px]"
              />
            </div>

            {/* Tabs pour les deux quiz */}
            <div className="border-t pt-8">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="profile"
                    className="flex items-center gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    Quiz de Validation
                  </TabsTrigger>
                  <TabsTrigger
                    value="recognition"
                    className="flex items-center gap-2"
                  >
                    <Award className="h-4 w-4" />
                    Quiz de Reconnaissance
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                  {/* Quiz de validation - Structure identique à l'original */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                        <UserCheck className="w-5 h-5" /> Quiz de validation du
                        profil
                      </h3>
                      <Badge variant="secondary">
                        {profileQuiz.length} questions
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {profileQuiz.map((item, idx) => (
                        <Card
                          key={item.id}
                          className="relative p-5 border bg-background shadow-sm hover:shadow-md transition-all group"
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, idx, "profile")
                          }
                          onDrop={(e) => handleDrop(e, idx, "profile")}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          <GripVertical className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground cursor-move h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => removeProfileItem(item.id)}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <div className="pl-6 space-y-4">
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className="h-6 w-6 rounded-full flex items-center justify-center p-0"
                              >
                                {idx + 1}
                              </Badge>
                              <div className="flex-grow">
                                <Input
                                  placeholder="Votre question..."
                                  value={item.text}
                                  onChange={(e) =>
                                    updateProfileItem(
                                      item.id,
                                      "text",
                                      e.target.value,
                                    )
                                  }
                                  className="font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0 text-md"
                                  required
                                />
                              </div>
                            </div>

                            <Badge
                              variant="secondary"
                              className="text-[10px] uppercase tracking-wider"
                            >
                              {getIconForType(item.type)}{" "}
                              {item.type.replace("_", " ")}
                            </Badge>

                            {(item.type === ITEM_TYPES.MULTIPLE_CHOICE ||
                              item.type === ITEM_TYPES.CHECKBOXES) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-9">
                                {item.options.map((opt, oIdx) => (
                                  <div
                                    key={opt.id}
                                    className="flex items-center gap-2 group/opt"
                                  >
                                    <div
                                      className={cn(
                                        "h-3 w-3 border border-muted-foreground/40 flex-shrink-0",
                                        item.type === ITEM_TYPES.MULTIPLE_CHOICE
                                          ? "rounded-full"
                                          : "rounded-sm",
                                      )}
                                    />
                                    <Input
                                      placeholder={`Option ${oIdx + 1}`}
                                      value={opt.text}
                                      onChange={(e) =>
                                        updateProfileItemOption(
                                          item.id,
                                          opt.id,
                                          e.target.value,
                                        )
                                      }
                                      className="h-8 text-sm"
                                      required
                                    />
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 justify-start text-primary text-xs"
                                  onClick={() => addProfileItemOption(item.id)}
                                >
                                  <Plus className="w-3 h-3 mr-1" /> Ajouter une
                                  option
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}

                      {profileQuiz.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-secondary/10">
                          <p className="text-sm text-muted-foreground">
                            Aucune question de validation ajoutée pour le
                            moment.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addProfileItem(ITEM_TYPES.TEXT)}
                      >
                        <TextCursorInput className="w-4 h-4 mr-2" /> Texte Libre
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          addProfileItem(ITEM_TYPES.MULTIPLE_CHOICE)
                        }
                      >
                        <ListOrdered className="w-4 h-4 mr-2" /> Choix Unique
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addProfileItem(ITEM_TYPES.CHECKBOXES)}
                      >
                        <CheckSquare className="w-4 h-4 mr-2" /> Choix Multiples
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="recognition" className="mt-6">
                  {/* Quiz de reconnaissance */}
                  <div className="space-y-6">
                    <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-800">
                            Quiz de Reconnaissance
                          </h4>
                          <p className="text-sm text-yellow-700">
                            Ce quiz évalue la reconnaissance des éléments clés
                            de la mission. Le candidat doit obtenir un score de{" "}
                            {recognitionPassingScore}% pour réussir. Pour chaque
                            question, sélectionnez la ou les bonnes réponses en
                            cliquant sur le cercle.
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-4">
                        <Label className="text-sm font-medium">
                          Score minimum requis :
                        </Label>
                        <RadioGroup
                          value={String(recognitionPassingScore)}
                          onValueChange={(value) =>
                            setRecognitionPassingScore(Number(value))
                          }
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="100" id="score-100" />
                            <Label htmlFor="score-100" className="text-sm">
                              100%
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="50" id="score-50" />
                            <Label htmlFor="score-50" className="text-sm">
                              50%
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                        <Award className="w-5 h-5" /> Quiz de reconnaissance
                      </h3>
                      <Badge variant="secondary">
                        {recognitionQuiz.length} questions
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {recognitionQuiz.map((item, idx) => (
                        <Card
                          key={item.id}
                          className="relative p-5 border bg-background shadow-sm hover:shadow-md transition-all group"
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, idx, "recognition")
                          }
                          onDrop={(e) => handleDrop(e, idx, "recognition")}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          <GripVertical className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground cursor-move h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => removeRecognitionItem(item.id)}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <div className="pl-6 space-y-4">
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className="h-6 w-6 rounded-full flex items-center justify-center p-0"
                              >
                                {idx + 1}
                              </Badge>
                              <div className="flex-grow">
                                <Input
                                  placeholder="Votre question..."
                                  value={item.text}
                                  onChange={(e) =>
                                    updateRecognitionItem(
                                      item.id,
                                      "text",
                                      e.target.value,
                                    )
                                  }
                                  className="font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0 text-md"
                                  required
                                />
                              </div>
                            </div>

                            <Badge
                              variant="secondary"
                              className="text-[10px] uppercase tracking-wider"
                            >
                              {getIconForType(item.type)}{" "}
                              {item.type.replace("_", " ")}
                            </Badge>

                            {(item.type === ITEM_TYPES.MULTIPLE_CHOICE ||
                              item.type === ITEM_TYPES.CHECKBOXES) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-9">
                                {item.options.map((opt, oIdx) => (
                                  <div
                                    key={opt.id}
                                    className="flex items-center gap-2 group/opt"
                                  >
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className={cn(
                                        "h-5 w-5 p-0 rounded-full border-2 flex-shrink-0",
                                        opt.isCorrect
                                          ? "border-green-500 bg-green-100 text-green-500"
                                          : "border-gray-300 hover:border-green-300",
                                      )}
                                      onClick={() =>
                                        toggleRecognitionOptionCorrect(
                                          item.id,
                                          opt.id,
                                        )
                                      }
                                    >
                                      {opt.isCorrect && (
                                        <CheckSquare className="h-3 w-3" />
                                      )}
                                    </Button>
                                    <div
                                      className={cn(
                                        "h-3 w-3 border border-muted-foreground/40 flex-shrink-0",
                                        item.type === ITEM_TYPES.MULTIPLE_CHOICE
                                          ? "rounded-full"
                                          : "rounded-sm",
                                      )}
                                    />
                                    <Input
                                      placeholder={`Option ${oIdx + 1}`}
                                      value={opt.text}
                                      onChange={(e) =>
                                        updateRecognitionItemOption(
                                          item.id,
                                          opt.id,
                                          e.target.value,
                                        )
                                      }
                                      className="h-8 text-sm"
                                      required
                                    />
                                    {opt.isCorrect && (
                                      <Badge
                                        variant="success"
                                        className="text-[8px] px-1 flex-shrink-0"
                                      >
                                        ✓
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 justify-start text-primary text-xs"
                                  onClick={() =>
                                    addRecognitionItemOption(item.id)
                                  }
                                >
                                  <Plus className="w-3 h-3 mr-1" /> Ajouter une
                                  option
                                </Button>
                              </div>
                            )}

                            {item.type === ITEM_TYPES.TEXT && (
                              <div className="pl-9">
                                <p className="text-xs text-muted-foreground">
                                  <Info className="inline h-3 w-3 mr-1" />
                                  Les réponses textuelles seront évaluées
                                  manuellement
                                </p>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}

                      {recognitionQuiz.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-secondary/10">
                          <p className="text-sm text-muted-foreground">
                            Aucune question de reconnaissance ajoutée pour le
                            moment.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          addRecognitionItem(ITEM_TYPES.MULTIPLE_CHOICE)
                        }
                      >
                        <ListOrdered className="w-4 h-4 mr-2" /> Choix Unique
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          addRecognitionItem(ITEM_TYPES.CHECKBOXES)
                        }
                      >
                        <CheckSquare className="w-4 h-4 mr-2" /> Choix Multiples
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end p-6 border-t bg-primary/5">
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="px-8 shadow-lg"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              {isSubmitting ? "Création en cours..." : "Créer la Mission"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
