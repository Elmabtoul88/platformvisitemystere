"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  PlusCircle,
  Trash2,
  GripVertical,
  Loader2,
  ListOrdered,
  TextCursorInput,
  Star,
  Circle,
  Image as ImageIcon,
  MapPin,
  Mic,
  CheckSquare as CheckSquareIcon,
  Columns,
  Info,
  Calendar,
  Clock,
  CheckCircle2,
  Hash,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchMissions, postMissions } from "@/services/fetchData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const QUESTION_TYPES = {
  DATE: "date",
  TIME: "time",
  YES_NO: "yes_no",
  RATING: "rating",
  NUMBER: "number",
  TEXT: "text",
  MULTIPLE_CHOICE: "multiple_choice",
  CHECKBOXES: "checkboxes",
  IMAGE_UPLOAD: "image_upload",
  GPS_CAPTURE: "gps_capture",
  AUDIO_RECORDING: "audio_recording",
  SECTION_HEADER: "section_header",
  INFO_TEXT: "info_text",
};

// Metadata and styling per type
const TYPE_CONFIG = {
  [QUESTION_TYPES.DATE]: {
    label: "Date",
    description: "Date de visite, date d'achat, péremption...",
    icon: Calendar,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    badgeColor: "bg-blue-600 text-white",
  },
  [QUESTION_TYPES.TIME]: {
    label: "Heure",
    description: "Heure d'entrée, passage en caisse, attente...",
    icon: Clock,
    color: "bg-amber-50 text-amber-700 border-amber-200",
    badgeColor: "bg-amber-600 text-white",
  },
  [QUESTION_TYPES.YES_NO]: {
    label: "Oui / Non",
    description: "Question binaire de conformité (Accueil, propreté...)",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeColor: "bg-emerald-600 text-white",
  },
  [QUESTION_TYPES.RATING]: {
    label: "Évaluation / Étoiles",
    description: "Note sur 5 ou 10 étoiles avec étiquettes",
    icon: Star,
    color: "bg-yellow-50 text-yellow-800 border-yellow-200",
    badgeColor: "bg-yellow-600 text-white",
  },
  [QUESTION_TYPES.NUMBER]: {
    label: "Nombre / Montant",
    description: "Montant du ticket, effectif de l'équipe, durée...",
    icon: Hash,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    badgeColor: "bg-purple-600 text-white",
  },
  [QUESTION_TYPES.TEXT]: {
    label: "Texte libre",
    description: "Commentaire détaillé, remarques ou verbatims",
    icon: TextCursorInput,
    color: "bg-slate-50 text-slate-700 border-slate-200",
    badgeColor: "bg-slate-700 text-white",
  },
  [QUESTION_TYPES.MULTIPLE_CHOICE]: {
    label: "Choix unique (QCM)",
    description: "Une seule réponse possible parmi une liste",
    icon: ListOrdered,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    badgeColor: "bg-indigo-600 text-white",
  },
  [QUESTION_TYPES.CHECKBOXES]: {
    label: "Choix multiples",
    description: "Plusieurs cases cochables simultanément",
    icon: CheckSquareIcon,
    color: "bg-violet-50 text-violet-700 border-violet-200",
    badgeColor: "bg-violet-600 text-white",
  },
  [QUESTION_TYPES.IMAGE_UPLOAD]: {
    label: "Photo / Preuve",
    description: "Ticket de caisse, rayon, vitrine, tenue...",
    icon: ImageIcon,
    color: "bg-rose-50 text-rose-700 border-rose-200",
    badgeColor: "bg-rose-600 text-white",
  },
  [QUESTION_TYPES.GPS_CAPTURE]: {
    label: "Localisation GPS",
    description: "Vérification de présence physique sur place",
    icon: MapPin,
    color: "bg-teal-50 text-teal-700 border-teal-200",
    badgeColor: "bg-teal-600 text-white",
  },
  [QUESTION_TYPES.AUDIO_RECORDING]: {
    label: "Enregistrement Audio",
    description: "Enregistrement vocal de synthèse ou ambiance",
    icon: Mic,
    color: "bg-orange-50 text-orange-700 border-orange-200",
    badgeColor: "bg-orange-600 text-white",
  },
  [QUESTION_TYPES.SECTION_HEADER]: {
    label: "Titre de Section",
    description: "Organise l'enquête par étapes de la visite",
    icon: Columns,
    color: "bg-[#041F40]/10 text-[#041F40] border-[#041F40]/20",
    badgeColor: "bg-[#041F40] text-white",
  },
  [QUESTION_TYPES.INFO_TEXT]: {
    label: "Consigne / Info",
    description: "Instructions et règles pour le client mystère",
    icon: Info,
    color: "bg-sky-50 text-sky-700 border-sky-200",
    badgeColor: "bg-sky-600 text-white",
  },
};

const getIconForType = (type) => {
  const cfg = TYPE_CONFIG[type];
  if (!cfg) return null;
  const IconComponent = cfg.icon;
  return <IconComponent className="w-4 h-4 mr-1.5 inline-block shrink-0" />;
};

const createNewQuestion = (type, id = Date.now()) => {
  if (type === QUESTION_TYPES.SECTION_HEADER) {
    return {
      id,
      type,
      title: "Nouvelle section",
      text: "Nouvelle section",
      isRequired: false,
    };
  }

  if (type === QUESTION_TYPES.INFO_TEXT) {
    return {
      id,
      type,
      content: "Consignes spécifiques pour le shopper à cette étape de la visite mystère.",
      text: "Consignes spécifiques pour le shopper à cette étape de la visite mystère.",
      isRequired: false,
    };
  }

  const base = {
    id,
    type,
    text: "",
    isRequired: true,
  };

  switch (type) {
    case QUESTION_TYPES.DATE:
      base.text = "Date de la visite mystère";
      break;
    case QUESTION_TYPES.TIME:
      base.text = "Heure d'entrée dans l'établissement";
      break;
    case QUESTION_TYPES.YES_NO:
      base.text = "Avez-vous été accueilli(e) avec le sourire dès votre arrivée ?";
      break;
    case QUESTION_TYPES.NUMBER:
      base.text = "Montant total de votre achat (en MAD)";
      break;
    case QUESTION_TYPES.TEXT:
      base.text = "Décrivez en détail l'attitude et les conseils du vendeur";
      break;
    case QUESTION_TYPES.RATING:
      base.text = "Note globale de la propreté et du merchandising";
      base.maxRating = 5;
      base.minLabel = "Très insatisfaisant";
      base.maxLabel = "Excellent";
      break;
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      base.text = "Quel type de conseiller vous a pris en charge ?";
      base.options = [
        { id: Date.now() + 1, text: "Conseiller de vente" },
        { id: Date.now() + 2, text: "Responsable de magasin" },
        { id: Date.now() + 3, text: "Personnel en caisse" },
      ];
      break;
    case QUESTION_TYPES.CHECKBOXES:
      base.text = "Quels standards de présentation étaient respectés ?";
      base.options = [
        { id: Date.now() + 1, text: "Tenue réglementaire portée" },
        { id: Date.now() + 2, text: "Badge avec prénom visible" },
        { id: Date.now() + 3, text: "Rayon ordonné et propre" },
      ];
      break;
    case QUESTION_TYPES.IMAGE_UPLOAD:
      base.text = "Photo du ticket de caisse ou de la vitrine";
      base.maxImages = 3;
      base.allowMultiple = true;
      break;
    case QUESTION_TYPES.GPS_CAPTURE:
      base.text = "Pointage GPS de confirmation sur le point de vente";
      break;
    case QUESTION_TYPES.AUDIO_RECORDING:
      base.text = "Enregistrement vocal de synthèse post-visite";
      base.maxDurationSeconds = 60;
      break;
    default:
      base.text = "Nouvelle question";
  }

  return base;
};

export default function CreateSurveyPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params.missionId;
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  
  const [questions, setQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [missionTitle, setMissionTitle] = useState("Chargement...");
  const [missionStatus, setMissionStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSectionIndex, setPreviewSectionIndex] = useState(0);

  // Groupement des questions en sections pour l'aperçu dynamique Shopper
  const previewSections = useMemo(() => {
    if (!questions || questions.length === 0) return [];
    const secList = [];
    let currentSec = {
      id: "sec-0",
      title: "Général",
      description: "",
      items: [],
    };

    questions.forEach((item, index) => {
      if (item.type === QUESTION_TYPES.SECTION_HEADER) {
        if (currentSec.items.length > 0) {
          secList.push(currentSec);
        }
        currentSec = {
          id: item.id ? `sec-${item.id}` : `sec-${index}`,
          title: item.title || item.text || `Section ${secList.length + 1}`,
          description: item.description || "",
          items: [],
        };
      } else {
        currentSec.items.push(item);
      }
    });

    if (currentSec.items.length > 0 || secList.length === 0) {
      secList.push(currentSec);
    }
    return secList;
  }, [questions]);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      let currentUserId = authUser?.id || null;
      if (!currentUserId && typeof window !== "undefined") {
        const rawUser = localStorage.getItem("missionViewAuth");
        if (rawUser) {
          try {
            const parsed = JSON.parse(rawUser);
            currentUserId = parsed?.user?.id || parsed?.id || null;
          } catch (e) {}
        }
      }
      if (currentUserId) setCurrentUser(currentUserId);

      try {
        const [m, sq] = await Promise.all([
          fetchMissions(
            "admin-missions" + missionId,
            API_BASE_URL + "missions/" + missionId,
          ),
          fetchMissions(
            "surveyQuestions" + missionId,
            API_BASE_URL + "surveyQuestions/surveyqBymission/" + missionId,
          ),
        ]);

        if (m) {
          const missionData = Array.isArray(m) ? m[0] : m;
          const title = missionData?.title;
          if (title) setMissionTitle(title);
          if (missionData?.status) setMissionStatus(missionData.status);
        }

        if (sq && Array.isArray(sq)) {
          // Normalize loaded questions
          const normalized = sq.map((q) => ({
            ...q,
            id: q.id || Date.now() + Math.random(),
            title: q.type === QUESTION_TYPES.SECTION_HEADER ? (q.title || q.text || "Section") : undefined,
            content: q.type === QUESTION_TYPES.INFO_TEXT ? (q.content || q.text || "") : undefined,
            text: q.text || q.title || q.content || "",
            options: Array.isArray(q.options)
              ? q.options.map((opt, i) =>
                  typeof opt === "string" ? { id: Date.now() + i, text: opt } : opt,
                )
              : [],
          }));
          setQuestions(normalized);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: error.message || "Impossible de charger les données.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (missionId) {
      fetchData();
    }
  }, [missionId, toast, authUser, API_BASE_URL]);

  // Question manipulation
  const addQuestion = (type) => {
    const newQ = createNewQuestion(type);
    setQuestions((prev) => [...prev, newQ]);
    // Smooth scroll down
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const duplicateQuestion = (index) => {
    const original = questions[index];
    if (!original) return;
    const duplicated = {
      ...JSON.parse(JSON.stringify(original)),
      id: Date.now(),
      text: original.text ? `${original.text} (copie)` : "",
      title: original.title ? `${original.title} (copie)` : undefined,
    };
    const updated = [...questions];
    updated.splice(index + 1, 0, duplicated);
    setQuestions(updated);
    toast({
      title: "Élément dupliqué",
      description: "Une copie a été ajoutée directement en dessous.",
    });
  };

  const moveQuestion = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= questions.length) return;
    const updated = [...questions];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setQuestions(updated);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const updated = { ...q, [field]: value };
          // Keep text in sync with title or content for DB compatibility
          if (q.type === QUESTION_TYPES.SECTION_HEADER && field === "title") {
            updated.text = value;
          }
          if (q.type === QUESTION_TYPES.INFO_TEXT && field === "content") {
            updated.text = value;
          }
          return updated;
        }
        return q;
      }),
    );
  };

  const handleNumericInputChange = (questionId, field, rawValue) => {
    if (rawValue === "") {
      updateQuestion(questionId, field, "");
      return;
    }
    const parsed = parseInt(rawValue, 10);
    if (!isNaN(parsed)) {
      updateQuestion(questionId, field, parsed);
    }
  };

  // Option management for multiple choice & checkboxes
  const updateQuestionOption = (questionId, optionId, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: (q.options || []).map((opt) =>
              opt.id === optionId ? { ...opt, text: value } : opt,
            ),
          };
        }
        return q;
      }),
    );
  };

  const addQuestionOption = (questionId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const count = (q.options || []).length + 1;
          return {
            ...q,
            options: [
              ...(q.options || []),
              { id: Date.now(), text: `Option ${count}` },
            ],
          };
        }
        return q;
      }),
    );
  };

  const removeQuestionOption = (questionId, optionId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && (q.options || []).length > 1) {
          return {
            ...q,
            options: q.options.filter((opt) => opt.id !== optionId),
          };
        }
        return q;
      }),
    );
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...questions];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);
    setQuestions(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Save Survey Handler
  const handleSaveSurvey = async () => {
    setIsSaving(true);

    if (questions.length === 0) {
      toast({
        variant: "destructive",
        title: "Questionnaire vide",
        description: "Veuillez ajouter au moins une question ou un champ avant d'enregistrer.",
      });
      setIsSaving(false);
      return;
    }

    // Sanitize questions array
    const sanitizedQuestions = questions.map((q, idx) => {
      let questionText = q.text || "";
      if (q.type === QUESTION_TYPES.SECTION_HEADER) {
        questionText = q.title || q.text || `Section ${idx + 1}`;
      } else if (q.type === QUESTION_TYPES.INFO_TEXT) {
        questionText = q.content || q.text || "Consignes pour le shopper";
      } else if (!questionText.trim()) {
        questionText = `Question ${idx + 1}`;
      }

      const sanitizedQ = {
        mission_id: parseInt(missionId, 10),
        type: q.type,
        text: questionText,
        title: q.type === QUESTION_TYPES.SECTION_HEADER ? questionText : undefined,
        content: q.type === QUESTION_TYPES.INFO_TEXT ? questionText : undefined,
        isRequired: Boolean(q.isRequired),
      };

      if (
        q.type === QUESTION_TYPES.MULTIPLE_CHOICE ||
        q.type === QUESTION_TYPES.CHECKBOXES
      ) {
        sanitizedQ.options = (q.options || [])
          .filter((opt) => opt && opt.text && String(opt.text).trim() !== "")
          .map((opt) => ({ id: opt.id, text: opt.text.trim() }));
      }

      if (q.type === QUESTION_TYPES.RATING) {
        sanitizedQ.maxRating = parseInt(q.maxRating, 10) || 5;
        sanitizedQ.minLabel = q.minLabel || "Insatisfaisant";
        sanitizedQ.maxLabel = q.maxLabel || "Excellent";
      }

      if (q.type === QUESTION_TYPES.IMAGE_UPLOAD) {
        sanitizedQ.maxImages = parseInt(q.maxImages, 10) || 3;
        sanitizedQ.allowMultiple = q.allowMultiple ?? true;
      }

      if (q.type === QUESTION_TYPES.AUDIO_RECORDING) {
        sanitizedQ.maxDurationSeconds =
          parseInt(q.maxDurationSeconds, 10) || 60;
      }

      return sanitizedQ;
    });

    const payload = {
      mission_id: parseInt(missionId, 10),
      user_id: currentUser,
      questions: sanitizedQuestions,
    };

    try {
      const baseUrl = API_BASE_URL + "surveyQuestions";
      const result = await postMissions(
        baseUrl,
        payload,
        "surveyQuestions" + missionId,
        baseUrl + "/" + missionId,
      );

      if (result.status === 200 || result.success) {
        toast({
          title: "Questionnaire enregistré avec succès !",
          description: `${sanitizedQuestions.length} élément(s) configuré(s) pour la mission "${missionTitle}".`,
        });
        router.push("/admin/missions");
      } else {
        throw new Error(result.message || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Échec de l'enregistrement",
        description: error.message || "Une erreur est survenue.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Stats calculation
  const totalQuestions = questions.filter(
    (q) => q.type !== QUESTION_TYPES.SECTION_HEADER && q.type !== QUESTION_TYPES.INFO_TEXT,
  ).length;
  const totalSections = questions.filter(
    (q) => q.type === QUESTION_TYPES.SECTION_HEADER,
  ).length;
  const requiredCount = questions.filter(
    (q) => q.isRequired && q.type !== QUESTION_TYPES.SECTION_HEADER && q.type !== QUESTION_TYPES.INFO_TEXT,
  ).length;

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col justify-center items-center min-h-[400px]">
        <div className="p-4 rounded-full bg-[#041F40]/10 mb-4 animate-pulse">
          <Loader2 className="h-10 w-10 animate-spin text-[#041F40]" />
        </div>
        <p className="text-lg font-semibold text-[#041F40]">Chargement du concepteur d'enquête...</p>
        <p className="text-sm text-muted-foreground mt-1">Préparation des champs et de l'interface visuelle</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Top Sticky Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="container mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hover:bg-slate-100 text-slate-700"
            >
              <Link href="/admin/missions">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Missions
              </Link>
            </Button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#041F40] leading-tight truncate max-w-md">
                  Éditeur d'enquête
                </h1>
                <Badge variant="outline" className="text-xs bg-[#041F40]/5 text-[#041F40] border-[#041F40]/20">
                  Mission #{missionId}
                </Badge>
                {missionStatus && (
                  <Badge
                    className={
                      missionStatus === "completed" || missionStatus === "cloturee"
                        ? "bg-slate-700 text-white text-xs font-semibold"
                        : missionStatus === "cancelled"
                          ? "bg-rose-600 text-white text-xs font-semibold"
                          : "bg-emerald-600 text-white text-xs font-semibold"
                    }
                  >
                    {missionStatus === "completed" || missionStatus === "cloturee"
                      ? "Clôturée"
                      : missionStatus === "cancelled"
                        ? "Annulée"
                        : "Active"}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md">
                {missionTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPreviewSectionIndex(0);
                setIsPreviewOpen(true);
              }}
              className="border-slate-300 hover:bg-slate-100 text-slate-700"
            >
              <Eye className="w-4 h-4 mr-1.5 text-slate-600" />
              Aperçu Shopper
            </Button>

            <Button
              onClick={handleSaveSurvey}
              disabled={isSaving}
              size="sm"
              className="bg-[#041F40] hover:bg-[#041F40]/90 text-white font-medium shadow-sm transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4 text-[#D6C799]" />
                  Enregistrer l'enquête
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick summary bar */}
        <div className="bg-slate-100/70 border-t border-slate-200/80 px-4 py-1.5">
          <div className="container mx-auto max-w-5xl flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span>
                <strong>{totalQuestions}</strong> question{totalQuestions > 1 ? "s" : ""}
              </span>
              <span>•</span>
              <span>
                <strong>{totalSections}</strong> section{totalSections > 1 ? "s" : ""}
              </span>
              <span>•</span>
              <span>
                <strong>{requiredCount}</strong> obligatoire{requiredCount > 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-slate-500 hidden sm:flex items-center gap-1.5">
              <GripVertical className="w-3.5 h-3.5" />
              <span>Glissez-déposez les cartes ou utilisez les flèches pour réordonner</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto max-w-5xl px-4 pt-6 space-y-6">
        {/* Alerte si la mission est clôturée */}
        {(missionStatus === "completed" || missionStatus === "cloturee") && (
          <Alert className="bg-amber-50 border-amber-300 text-amber-900 shadow-xs">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <AlertTitle className="font-bold text-amber-900">Mission clôturée</AlertTitle>
            <AlertDescription className="text-xs text-amber-800 mt-1">
              Cette mission est actuellement clôturée. Vous pouvez toujours consulter ou adapter les critères d'évaluation de l'enquête, mais les nouveaux rapports shoppers ne sont plus acceptés pour cette mission.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Add Palette (Top) */}
        <Card className="border-slate-200/90 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader className="pb-3 pt-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#041F40] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D6C799]" />
                  Palette d'ajout de champs
                </CardTitle>
                <CardDescription className="text-xs">
                  Cliquez sur un type pour l'insérer à la fin du questionnaire.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 space-y-4">
            {/* Category 1: Essentiels Visite Mystère */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                ⚡ Essentiels Visite Mystère & Audit
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion(QUESTION_TYPES.DATE)}
                  className="h-auto py-2 px-2.5 justify-start border-blue-200 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-900 transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-2 text-blue-600 shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-xs text-blue-950">Date</div>
                    <div className="text-[10px] text-blue-600/80 leading-tight">Visite / achat</div>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion(QUESTION_TYPES.TIME)}
                  className="h-auto py-2 px-2.5 justify-start border-amber-200 bg-amber-50/50 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                >
                  <Clock className="w-4 h-4 mr-2 text-amber-600 shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-xs text-amber-950">Heure</div>
                    <div className="text-[10px] text-amber-600/80 leading-tight">Entrée / caisse</div>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion(QUESTION_TYPES.YES_NO)}
                  className="h-auto py-2 px-2.5 justify-start border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 hover:text-emerald-900 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-xs text-emerald-950">Oui / Non</div>
                    <div className="text-[10px] text-emerald-600/80 leading-tight">Conformité standard</div>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion(QUESTION_TYPES.RATING)}
                  className="h-auto py-2 px-2.5 justify-start border-yellow-200 bg-yellow-50/50 hover:bg-yellow-100 hover:text-yellow-900 transition-colors"
                >
                  <Star className="w-4 h-4 mr-2 text-yellow-600 shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-xs text-yellow-950">Note Étoiles</div>
                    <div className="text-[10px] text-yellow-600/80 leading-tight">1 à 5 étoiles</div>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion(QUESTION_TYPES.NUMBER)}
                  className="h-auto py-2 px-2.5 justify-start border-purple-200 bg-purple-50/50 hover:bg-purple-100 hover:text-purple-900 transition-colors"
                >
                  <Hash className="w-4 h-4 mr-2 text-purple-600 shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-xs text-purple-950">Nombre</div>
                    <div className="text-[10px] text-purple-600/80 leading-tight">Montant / durée</div>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion(QUESTION_TYPES.TEXT)}
                  className="h-auto py-2 px-2.5 justify-start border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <TextCursorInput className="w-4 h-4 mr-2 text-slate-700 shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-xs text-slate-900">Texte libre</div>
                    <div className="text-[10px] text-slate-500 leading-tight">Commentaire détaillé</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Category 2: Choix, Preuves et Structure */}
            <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  📋 Choix & Sélections
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion(QUESTION_TYPES.MULTIPLE_CHOICE)}
                    className="flex-1 text-xs justify-start border-indigo-200 bg-indigo-50/40 hover:bg-indigo-100 hover:text-indigo-900"
                  >
                    <ListOrdered className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                    Choix unique (QCM)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion(QUESTION_TYPES.CHECKBOXES)}
                    className="flex-1 text-xs justify-start border-violet-200 bg-violet-50/40 hover:bg-violet-100 hover:text-violet-900"
                  >
                    <CheckSquareIcon className="w-3.5 h-3.5 mr-1.5 text-violet-600" />
                    Cases à cocher
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  📸 Preuves sur le terrain
                </p>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion(QUESTION_TYPES.IMAGE_UPLOAD)}
                    className="flex-1 text-xs justify-start border-rose-200 bg-rose-50/40 hover:bg-rose-100 hover:text-rose-900"
                  >
                    <ImageIcon className="w-3.5 h-3.5 mr-1 text-rose-600" />
                    Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion(QUESTION_TYPES.GPS_CAPTURE)}
                    className="flex-1 text-xs justify-start border-teal-200 bg-teal-50/40 hover:bg-teal-100 hover:text-teal-900"
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1 text-teal-600" />
                    GPS
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion(QUESTION_TYPES.AUDIO_RECORDING)}
                    className="flex-1 text-xs justify-start border-orange-200 bg-orange-50/40 hover:bg-orange-100 hover:text-orange-900"
                  >
                    <Mic className="w-3.5 h-3.5 mr-1 text-orange-600" />
                    Audio
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  🗂️ Structure & Directives
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion(QUESTION_TYPES.SECTION_HEADER)}
                    className="flex-1 text-xs justify-start border-[#041F40]/30 bg-[#041F40]/5 hover:bg-[#041F40]/15 text-[#041F40]"
                  >
                    <Columns className="w-3.5 h-3.5 mr-1.5 text-[#041F40]" />
                    Titre Section
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion(QUESTION_TYPES.INFO_TEXT)}
                    className="flex-1 text-xs justify-start border-sky-200 bg-sky-50/40 hover:bg-sky-100 hover:text-sky-900"
                  >
                    <Info className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                    Consigne Shopper
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questionnaire Element List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-300 p-12 text-center bg-white shadow-xs">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#041F40]/10 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-[#041F40]" />
              </div>
              <h3 className="text-base font-bold text-[#041F40]">Le questionnaire est vide</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
                Commencez par ajouter un titre de section, la date et l'heure de visite, ou les questions d'évaluation ci-dessus.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  onClick={() => addQuestion(QUESTION_TYPES.SECTION_HEADER)}
                  size="sm"
                  className="bg-[#041F40] hover:bg-[#041F40]/90 text-white"
                >
                  <Columns className="w-4 h-4 mr-1.5" />
                  Ajouter une section
                </Button>
                <Button
                  onClick={() => addQuestion(QUESTION_TYPES.DATE)}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700"
                >
                  <Calendar className="w-4 h-4 mr-1.5 text-blue-600" />
                  Date de visite
                </Button>
                <Button
                  onClick={() => addQuestion(QUESTION_TYPES.YES_NO)}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Question Oui/Non
                </Button>
              </div>
            </Card>
          ) : (
            (() => {
              let questionIndex = 0;
              return questions.map((q, index) => {
                const isSectionHeader = q.type === QUESTION_TYPES.SECTION_HEADER;
                const isInfoText = q.type === QUESTION_TYPES.INFO_TEXT;
                if (!isSectionHeader && !isInfoText) {
                  questionIndex += 1;
                }

                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;

                return (
                  <div
                    key={q.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`transition-all duration-200 rounded-xl relative ${
                      isDragging ? "opacity-30 scale-[0.99]" : "opacity-100"
                    } ${
                      isDragOver
                        ? "border-2 border-[#041F40] ring-4 ring-[#041F40]/10 shadow-lg"
                        : ""
                    }`}
                  >
                    {/* SECTION HEADER CARD */}
                    {isSectionHeader && (
                      <Card className="border-l-4 border-l-[#041F40] border-t border-r border-b border-slate-200/90 bg-gradient-to-r from-[#041F40]/5 via-white to-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 gap-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                              title="Glisser pour réorganiser"
                            >
                              <GripVertical className="h-5 w-5" />
                            </div>
                            <Badge className="bg-[#041F40] text-white font-bold px-2 py-0.5 text-xs">
                              SECTION
                            </Badge>
                            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                              Étape de visite
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={index === 0}
                              onClick={() => moveQuestion(index, index - 1)}
                              className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              title="Monter"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={index === questions.length - 1}
                              onClick={() => moveQuestion(index, index + 1)}
                              className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              title="Descendre"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => duplicateQuestion(index)}
                              className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              title="Dupliquer"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeQuestion(q.id)}
                              className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Supprimer la section"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-[#041F40] uppercase tracking-wide">
                              Nom de la section (ex: Accueil en boutique, Passage en caisse...)
                            </Label>
                            <Input
                              value={q.title || q.text || ""}
                              onChange={(e) =>
                                updateQuestion(q.id, "title", e.target.value)
                              }
                              placeholder="Ex: 1. Accueil & Première impression"
                              className="text-base font-bold text-[#041F40] border-[#041F40]/30 focus:border-[#041F40] focus:ring-[#041F40]"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* INFO TEXT CARD */}
                    {isInfoText && (
                      <Card className="border-l-4 border-l-sky-500 border-t border-r border-b border-sky-100 bg-sky-50/40 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between space-y-0 gap-3 border-b border-sky-100">
                          <div className="flex items-center gap-2">
                            <div
                              className="cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-sky-200/60 text-sky-400 hover:text-sky-700 transition-colors"
                              title="Glisser pour réorganiser"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <Badge className="bg-sky-600 text-white font-medium text-xs">
                              <Info className="w-3 h-3 mr-1" /> Consigne Shopper
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={index === 0}
                              onClick={() => moveQuestion(index, index - 1)}
                              className="h-7 w-7 text-slate-500 hover:text-slate-900"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={index === questions.length - 1}
                              onClick={() => moveQuestion(index, index + 1)}
                              className="h-7 w-7 text-slate-500 hover:text-slate-900"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => duplicateQuestion(index)}
                              className="h-7 w-7 text-slate-500 hover:text-slate-900"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeQuestion(q.id)}
                              className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-sky-900">
                              Instructions & consignes pour le client mystère
                            </Label>
                            <Textarea
                              value={q.content || q.text || ""}
                              onChange={(e) =>
                                updateQuestion(q.id, "content", e.target.value)
                              }
                              placeholder="Ex: Veuillez observer discrètement le rayon cosmétique pendant 3 minutes sans interpeller le vendeur en premier..."
                              className="min-h-[70px] bg-white border-sky-200 text-sm"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* REGULAR QUESTION CARDS */}
                    {!isSectionHeader && !isInfoText && (
                      <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between space-y-0 gap-3 border-b border-slate-100 bg-slate-50/50">
                          <div className="flex items-center gap-2">
                            <div
                              className="cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                              title="Glisser pour déplacer la question"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>

                            <span className="font-bold text-xs bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded">
                              Q{questionIndex}
                            </span>

                            <Badge
                              variant="outline"
                              className={`text-xs font-semibold ${TYPE_CONFIG[q.type]?.color || "bg-slate-100 text-slate-700"}`}
                            >
                              {getIconForType(q.type)}
                              {TYPE_CONFIG[q.type]?.label || q.type}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={index === 0}
                              onClick={() => moveQuestion(index, index - 1)}
                              className="h-7 w-7 text-slate-400 hover:text-slate-800"
                              title="Monter"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={index === questions.length - 1}
                              onClick={() => moveQuestion(index, index + 1)}
                              className="h-7 w-7 text-slate-400 hover:text-slate-800"
                              title="Descendre"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => duplicateQuestion(index)}
                              className="h-7 w-7 text-slate-400 hover:text-slate-800"
                              title="Dupliquer"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeQuestion(q.id)}
                              className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Supprimer la question"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 space-y-4">
                          {/* Intitulé de la question */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-semibold text-slate-700">
                                Intitulé de la question / Consigne demandée au shopper
                              </Label>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`req-${q.id}`}
                                  checked={Boolean(q.isRequired)}
                                  onCheckedChange={(checked) =>
                                    updateQuestion(q.id, "isRequired", Boolean(checked))
                                  }
                                />
                                <Label
                                  htmlFor={`req-${q.id}`}
                                  className="text-xs text-slate-600 cursor-pointer font-medium"
                                >
                                  Réponse obligatoire
                                </Label>
                              </div>
                            </div>
                            <Input
                              value={q.text ?? ""}
                              onChange={(e) =>
                                updateQuestion(q.id, "text", e.target.value)
                              }
                              placeholder="Ex: Quelle note donnez-vous à l'accueil en caisse ?"
                              className="font-medium text-slate-900 border-slate-300 focus:border-[#041F40]"
                            />
                          </div>

                          {/* SPECIFIC CONFIGURATIONS BY QUESTION TYPE */}

                          {/* 1. DATE */}
                          {q.type === QUESTION_TYPES.DATE && (
                            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-blue-900">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span>Le client mystère sélectionnera une date avec un calendrier (JJ/MM/AAAA)</span>
                              </div>
                              <Input
                                type="date"
                                disabled
                                className="w-40 h-8 text-xs bg-white text-slate-400 opacity-80"
                                value={new Date().toISOString().split("T")[0]}
                              />
                            </div>
                          )}

                          {/* 2. TIME */}
                          {q.type === QUESTION_TYPES.TIME && (
                            <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-amber-900">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <span>Le client mystère renseignera l'heure exacte (HH:MM)</span>
                              </div>
                              <Input
                                type="time"
                                disabled
                                className="w-32 h-8 text-xs bg-white text-slate-400 opacity-80"
                                value="14:30"
                              />
                            </div>
                          )}

                          {/* 3. YES / NO */}
                          {q.type === QUESTION_TYPES.YES_NO && (
                            <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-emerald-900">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Réponse simple et rapide par deux boutons interactifs</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="h-8 border-emerald-300 text-emerald-700 bg-white"
                                >
                                  <Check className="w-3.5 h-3.5 mr-1" /> Oui
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="h-8 border-rose-300 text-rose-700 bg-white"
                                >
                                  <X className="w-3.5 h-3.5 mr-1" /> Non
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* 4. NUMBER */}
                          {q.type === QUESTION_TYPES.NUMBER && (
                            <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-purple-900">
                                <Hash className="w-4 h-4 text-purple-600" />
                                <span>Champ numérique dédié (ex: montant dépensé, temps d'attente en minutes)</span>
                              </div>
                              <Input
                                type="number"
                                disabled
                                placeholder="0.00"
                                className="w-32 h-8 text-xs bg-white opacity-80"
                              />
                            </div>
                          )}

                          {/* 5. RATING (STARS) */}
                          {q.type === QUESTION_TYPES.RATING && (
                            <div className="space-y-3 p-3.5 rounded-lg bg-yellow-50/40 border border-yellow-200/80">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-yellow-900">
                                  Échelle d'évaluation :
                                </Label>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500">Note max :</span>
                                  <Select
                                    value={String(q.maxRating ?? 5)}
                                    onValueChange={(val) =>
                                      updateQuestion(q.id, "maxRating", parseInt(val, 10))
                                    }
                                  >
                                    <SelectTrigger className="w-24 h-7 text-xs bg-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <SelectItem key={num} value={String(num)}>
                                          {num} étoiles
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* Star preview */}
                              <div className="flex items-center gap-1.5 py-1">
                                {[...Array(q.maxRating || 5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-5 h-5 text-amber-500 fill-amber-400"
                                  />
                                ))}
                              </div>

                              <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                  <Label className="text-[11px] text-slate-500">
                                    Libellé note minimale (1) :
                                  </Label>
                                  <Input
                                    value={q.minLabel || ""}
                                    onChange={(e) =>
                                      updateQuestion(q.id, "minLabel", e.target.value)
                                    }
                                    placeholder="Ex: Insatisfaisant"
                                    className="h-8 text-xs bg-white mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-[11px] text-slate-500">
                                    Libellé note maximale ({q.maxRating || 5}) :
                                  </Label>
                                  <Input
                                    value={q.maxLabel || ""}
                                    onChange={(e) =>
                                      updateQuestion(q.id, "maxLabel", e.target.value)
                                    }
                                    placeholder="Ex: Excellent"
                                    className="h-8 text-xs bg-white mt-1"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 6. MULTIPLE CHOICE & CHECKBOXES */}
                          {(q.type === QUESTION_TYPES.MULTIPLE_CHOICE ||
                            q.type === QUESTION_TYPES.CHECKBOXES) && (
                            <div className="space-y-2.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-slate-700">
                                  {q.type === QUESTION_TYPES.MULTIPLE_CHOICE
                                    ? "Options du QCM (Choix unique) :"
                                    : "Options des cases à cocher (Choix multiples) :"}
                                </Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addQuestionOption(q.id)}
                                  className="h-7 text-xs bg-white text-[#041F40] border-slate-300 hover:bg-[#041F40]/5"
                                >
                                  <PlusCircle className="w-3.5 h-3.5 mr-1 text-[#041F40]" />
                                  Ajouter une option
                                </Button>
                              </div>

                              <div className="space-y-2">
                                {(q.options || []).map((opt, optIdx) => (
                                  <div key={opt.id} className="flex items-center gap-2">
                                    {q.type === QUESTION_TYPES.MULTIPLE_CHOICE ? (
                                      <Circle className="h-4 w-4 text-slate-400 shrink-0" />
                                    ) : (
                                      <Checkbox disabled className="shrink-0" />
                                    )}
                                    <Input
                                      value={opt.text}
                                      onChange={(e) =>
                                        updateQuestionOption(q.id, opt.id, e.target.value)
                                      }
                                      placeholder={`Option ${optIdx + 1}`}
                                      className="h-8 text-xs bg-white flex-1"
                                    />
                                    {(q.options || []).length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeQuestionOption(q.id, opt.id)}
                                        className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 7. IMAGE UPLOAD */}
                          {q.type === QUESTION_TYPES.IMAGE_UPLOAD && (
                            <div className="space-y-3 p-3.5 rounded-lg bg-rose-50/40 border border-rose-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`img-multi-${q.id}`}
                                    checked={q.allowMultiple ?? true}
                                    onCheckedChange={(checked) =>
                                      updateQuestion(q.id, "allowMultiple", Boolean(checked))
                                    }
                                  />
                                  <Label
                                    htmlFor={`img-multi-${q.id}`}
                                    className="text-xs text-slate-700 cursor-pointer"
                                  >
                                    Autoriser plusieurs photos
                                  </Label>
                                </div>

                                <div className="flex items-center gap-2 justify-end">
                                  <span className="text-xs text-slate-600">Nombre max de photos :</span>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={q.maxImages ?? 3}
                                    onChange={(e) =>
                                      handleNumericInputChange(q.id, "maxImages", e.target.value)
                                    }
                                    className="w-20 h-7 text-xs bg-white"
                                  />
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Le shopper sera invité à téléverser ses justificatifs (ticket de caisse, photos de rayon ou vitrine).
                              </p>
                            </div>
                          )}

                          {/* 8. GPS CAPTURE */}
                          {q.type === QUESTION_TYPES.GPS_CAPTURE && (
                            <div className="p-3 rounded-lg bg-teal-50/50 border border-teal-200 flex items-center justify-between text-xs text-teal-900">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-teal-600" />
                                <span>Un bouton permettra au shopper de géolocaliser sa position exacte sur le point de vente.</span>
                              </div>
                            </div>
                          )}

                          {/* 9. AUDIO RECORDING */}
                          {q.type === QUESTION_TYPES.AUDIO_RECORDING && (
                            <div className="p-3 rounded-lg bg-orange-50/50 border border-orange-200 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-orange-900">
                                <Mic className="w-4 h-4 text-orange-600" />
                                <span>Enregistrement vocal via le microphone du smartphone</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-600">Durée max :</span>
                                <Input
                                  type="number"
                                  min="10"
                                  max="300"
                                  value={q.maxDurationSeconds ?? 60}
                                  onChange={(e) =>
                                    handleNumericInputChange(
                                      q.id,
                                      "maxDurationSeconds",
                                      e.target.value,
                                    )
                                  }
                                  className="w-20 h-7 text-xs bg-white"
                                />
                                <span className="text-xs text-slate-500">sec</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              });
            })()
          )}
        </div>

        {/* Bottom Save & Action Card */}
        <Card className="border-slate-200 shadow-md bg-white p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-[#041F40] text-sm">
                Finaliser le questionnaire de la mission
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Total de {questions.length} élément(s) configuré(s). Toutes les modifications seront appliquées immédiatement.
              </p>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                setPreviewSectionIndex(0);
                setIsPreviewOpen(true);
              }}
                className="flex-1 sm:flex-none border-slate-300 text-slate-700"
              >
                <Eye className="w-4 h-4 mr-1.5" />
                Aperçu
              </Button>
              <Button
                onClick={handleSaveSurvey}
                disabled={isSaving}
                className="flex-1 sm:flex-none bg-[#041F40] hover:bg-[#041F40]/90 text-white font-semibold px-6 shadow-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2 text-[#D6C799]" />
                    Enregistrer l'enquête
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </main>

      {/* LIVE PREVIEW MODAL / DIALOG */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#041F40] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#D6C799]" />
              Aperçu en direct du questionnaire Shopper
            </DialogTitle>
            <DialogDescription className="text-xs">
              Voici comment les questions et sections apparaîtront à vos clients mystères.
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-xl p-5 bg-white space-y-6">
            <div className="border-b pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Mission #{missionId}
                </span>
                <Badge className="bg-[#041F40] text-[#D6C799] border-none text-[11px] font-bold">
                  {previewSections.length} Section{previewSections.length > 1 ? "s" : ""}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-[#041F40]">{missionTitle}</h2>
              <p className="text-xs text-slate-500 mt-1">
                Aperçu pas-à-pas tel que vu par le client mystère (Section 1 → Suivant → Section 2 → Envoyer).
              </p>

              {/* Stepper pills pour l'aperçu */}
              {previewSections.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
                  {previewSections.map((sec, sIdx) => {
                    const isActive = sIdx === previewSectionIndex;
                    const isPast = sIdx < previewSectionIndex;
                    return (
                      <button
                        key={sec.id || sIdx}
                        type="button"
                        onClick={() => setPreviewSectionIndex(sIdx)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                          isActive
                            ? "bg-[#041F40] text-[#D6C799] border-[#041F40] font-bold"
                            : isPast
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-white/40">
                          {sIdx + 1}
                        </span>
                        <span className="truncate max-w-[120px]">{sec.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {questions.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Aucun élément dans le questionnaire.</p>
            ) : (
              (() => {
                const currentSec =
                  previewSections[previewSectionIndex] ||
                  previewSections[0] || { items: [] };

                return (
                  <div className="space-y-5">
                    {/* En-tête de section aperçu */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#041F40]/10 via-[#D6C799]/15 to-transparent border-l-4 border-[#041F40]">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-[#041F40] flex items-center gap-2">
                          <Columns className="w-4 h-4 text-[#D6C799]" />
                          {currentSec.title}
                        </h3>
                        <span className="text-xs text-slate-500 font-semibold">
                          Section {previewSectionIndex + 1} sur{" "}
                          {previewSections.length}
                        </span>
                      </div>
                      {currentSec.description && (
                        <p className="text-xs text-slate-600 mt-1">
                          {currentSec.description}
                        </p>
                      )}
                    </div>

                    {currentSec.items.length === 0 ? (
                      <p className="text-center text-slate-400 py-6 text-sm">
                        Aucune question dans cette section.
                      </p>
                    ) : (
                      currentSec.items.map((q, idx) => {
                        if (q.type === QUESTION_TYPES.INFO_TEXT) {
                          return (
                            <div
                              key={idx}
                              className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-start gap-2.5 my-2"
                            >
                              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                              <div className="whitespace-pre-line leading-relaxed">
                                {q.content || q.text}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={idx}
                            className="space-y-2 border-t pt-4 first:border-t-0 first:pt-0"
                          >
                            <Label className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                              {getIconForType(q.type)}
                              <span>
                                {idx + 1}. {q.text || "Question sans titre"}
                              </span>
                              {q.isRequired && (
                                <span className="text-rose-500 text-xs font-bold">
                                  *
                                </span>
                              )}
                            </Label>

                            <div className="pl-6">
                              {q.type === QUESTION_TYPES.DATE && (
                                <Input
                                  type="date"
                                  className="max-w-xs"
                                  defaultValue={
                                    new Date().toISOString().split("T")[0]
                                  }
                                />
                              )}

                              {q.type === QUESTION_TYPES.TIME && (
                                <Input
                                  type="time"
                                  className="max-w-xs"
                                  defaultValue="14:00"
                                />
                              )}

                              {q.type === QUESTION_TYPES.YES_NO && (
                                <div className="flex gap-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />{" "}
                                    Oui
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-rose-400 text-rose-700 hover:bg-rose-50"
                                  >
                                    <X className="w-3.5 h-3.5 mr-1" /> Non
                                  </Button>
                                </div>
                              )}

                              {q.type === QUESTION_TYPES.NUMBER && (
                                <Input
                                  type="number"
                                  placeholder="0"
                                  className="max-w-xs"
                                />
                              )}

                              {q.type === QUESTION_TYPES.TEXT && (
                                <Textarea
                                  placeholder="Votre réponse détaillée..."
                                  className="min-h-[80px]"
                                />
                              )}

                              {q.type === QUESTION_TYPES.RATING && (
                                <div className="flex items-center gap-1.5 py-1">
                                  <span className="text-xs text-slate-500 mr-2">
                                    {q.minLabel || "1"}
                                  </span>
                                  {[...Array(q.maxRating || 5)].map(
                                    (_, starIdx) => (
                                      <Star
                                        key={starIdx}
                                        className="w-6 h-6 text-amber-400 hover:fill-amber-400 cursor-pointer transition-colors"
                                      />
                                    ),
                                  )}
                                  <span className="text-xs text-slate-500 ml-2">
                                    {q.maxLabel || q.maxRating || 5}
                                  </span>
                                </div>
                              )}

                              {q.type === QUESTION_TYPES.MULTIPLE_CHOICE && (
                                <div className="space-y-1.5">
                                  {(q.options || []).map((opt) => (
                                    <label
                                      key={opt.id}
                                      className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                                    >
                                      <input
                                        type="radio"
                                        name={`preview_${idx}`}
                                        className="text-[#041F40]"
                                      />
                                      <span>{opt.text}</span>
                                    </label>
                                  ))}
                                </div>
                              )}

                              {q.type === QUESTION_TYPES.CHECKBOXES && (
                                <div className="space-y-1.5">
                                  {(q.options || []).map((opt) => (
                                    <label
                                      key={opt.id}
                                      className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                                    >
                                      <Checkbox />
                                      <span>{opt.text}</span>
                                    </label>
                                  ))}
                                </div>
                              )}

                              {q.type === QUESTION_TYPES.IMAGE_UPLOAD && (
                                <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-50 max-w-sm">
                                  <ImageIcon className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                                  <p className="text-xs text-slate-600 font-medium">
                                    Déposer une photo ou cliquer pour parcourir
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    Jusqu'à {q.maxImages || 3} fichier(s)
                                  </p>
                                </div>
                              )}

                              {q.type === QUESTION_TYPES.GPS_CAPTURE && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  className="text-xs"
                                >
                                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                                  Capturer ma position GPS
                                </Button>
                              )}

                              {q.type === QUESTION_TYPES.AUDIO_RECORDING && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  className="text-xs"
                                >
                                  <Mic className="w-3.5 h-3.5 mr-1.5 text-orange-600" />
                                  Commencer l'enregistrement (max{" "}
                                  {q.maxDurationSeconds || 60}s)
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Navigation Aperçu Suivant / Précédent */}
                    <div className="flex items-center justify-between pt-6 border-t mt-6">
                      {previewSectionIndex > 0 ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPreviewSectionIndex((prev) =>
                              Math.max(0, prev - 1),
                            )
                          }
                          className="text-xs"
                        >
                          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Section
                          précédente
                        </Button>
                      ) : (
                        <div />
                      )}

                      <span className="text-xs text-slate-400 font-medium">
                        Section {previewSectionIndex + 1} /{" "}
                        {previewSections.length}
                      </span>

                      {previewSectionIndex < previewSections.length - 1 ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            setPreviewSectionIndex((prev) =>
                              Math.min(previewSections.length - 1, prev + 1),
                            )
                          }
                          className="bg-[#041F40] text-[#D6C799] text-xs font-semibold"
                        >
                          Section suivante{" "}
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          className="bg-emerald-600 text-white text-xs font-semibold"
                        >
                          <Save className="w-3.5 h-3.5 mr-1" /> Finaliser &
                          Envoyer (Aperçu)
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
