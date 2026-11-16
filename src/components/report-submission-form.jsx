"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Star,
  Upload,
  Send,
  Loader2,
  MapPin,
  Mic,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  RadioGroupIndicator,
  TextCursorInput,
  ListOrdered,
  CheckSquare,
  Calendar,
  Clock,
  CheckCircle2,
  Hash,
  Columns,
  Info,
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Save,
} from "lucide-react"; // Import base icons
import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/context/query-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Assuming RadioGroup exists
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For GPS/Audio messages
import { compressImages } from "@/lib/imageCompression";

// Helper to get icon for display
const getIconForType = (type) => {
  switch (type) {
    case "text":
      return <TextCursorInput className="w-4 h-4 mr-1" />;
    case "multiple_choice":
      return <ListOrdered className="w-4 h-4 mr-1" />;
    case "checkboxes":
      return <CheckSquare className="w-4 h-4 mr-1" />;
    case "rating":
      return <Star className="w-4 h-4 mr-1" />;
    case "image_upload":
      return <ImageIcon className="w-4 h-4 mr-1" />;
    case "gps_capture":
      return <MapPin className="w-4 h-4 mr-1" />;
    case "audio_recording":
      return <Mic className="w-4 h-4 mr-1" />;
    case "date":
      return <Calendar className="w-4 h-4 mr-1 text-blue-600" />;
    case "time":
      return <Clock className="w-4 h-4 mr-1 text-amber-600" />;
    case "yes_no":
      return <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />;
    case "number":
      return <Hash className="w-4 h-4 mr-1 text-purple-600" />;
    case "section_header":
      return <Columns className="w-4 h-4 mr-1" />;
    case "info_text":
      return <Info className="w-4 h-4 mr-1" />;
    default:
      return null;
  }
};
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// Component now receives surveyQuestions prop
export function ReportSubmissionForm({
  mission,
  surveyQuestions = [],
  onSubmitAction,
  userId, // Ajout
  token, // Ajout
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState({});
  const [gpsCoords, setGpsCoords] = useState({});
  const [audioData, setAudioData] = useState({});

  const audioRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);

  // Initialize react-hook-form without resolver, as fields are dynamic
  const form = useForm({
    // No defaultValues needed here initially, they are set based on questions
  });

  const getFieldName = (q) => `q${q.id}_${q.type}`;

  // Découpage du questionnaire en sections successives (Next / Previous)
  const sections = useMemo(() => {
    if (!surveyQuestions || surveyQuestions.length === 0) return [];

    const secList = [];
    let currentSec = {
      id: "sec-0",
      title: "Général",
      description: "",
      items: [],
    };

    surveyQuestions.forEach((item, index) => {
      if (item.type === "section_header") {
        if (currentSec.items.length > 0) {
          secList.push(currentSec);
        }
        currentSec = {
          id: item.id ? `sec-${item.id}` : `sec-${index}`,
          title: item.text || item.title || `Section ${secList.length + 1}`,
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
  }, [surveyQuestions]);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const totalSections = Math.max(1, sections.length);
  const currentSection =
    sections[currentSectionIndex] || sections[0] || { items: [] };
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === totalSections - 1;

  // -------------------------------------------------------------------------
  // GESTION DU BROUILLON AUTOMATIQUE (LOCALSTORAGE MOBILE-FIRST)
  // -------------------------------------------------------------------------
  const draftStorageKey = useMemo(() => {
    const mId = mission?.id || "m";
    const sId = mission?.storeId || "default";
    const uId = userId || "shopper";
    return `emberton_draft_${mId}_${sId}_${uId}`;
  }, [mission?.id, mission?.storeId, userId]);

  const [hasDraft, setHasDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState("idle"); // "idle", "saving", "saved"

  // 1. Détection initiale du brouillon
  useEffect(() => {
    if (typeof window === "undefined" || !draftStorageKey) return;
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.answers && Object.keys(parsed.answers).length > 0) {
          setHasDraft(true);
          setDraftSavedAt(parsed.savedAt ? new Date(parsed.savedAt) : new Date());
        }
      }
    } catch (e) {
      console.warn("Erreur lecture brouillon:", e);
    }
  }, [draftStorageKey]);

  // 2. Sauvegarde automatique en arrière-plan à chaque saisie
  useEffect(() => {
    if (typeof window === "undefined" || !draftStorageKey) return;

    const subscription = form.watch((values) => {
      if (!values || Object.keys(values).length === 0) return;

      setAutoSaveStatus("saving");
      const timeout = setTimeout(() => {
        try {
          const draftData = {
            answers: values,
            imagePreviews,
            gpsCoords,
            audioData,
            currentSectionIndex,
            savedAt: new Date().toISOString(),
            missionId: mission?.id,
            storeId: mission?.storeId,
          };
          localStorage.setItem(draftStorageKey, JSON.stringify(draftData));
          setDraftSavedAt(new Date());
          setAutoSaveStatus("saved");
        } catch (err) {
          console.warn("Échec sauvegarde auto:", err);
        }
      }, 700);

      return () => clearTimeout(timeout);
    });

    return () => subscription.unsubscribe();
  }, [form, draftStorageKey, imagePreviews, gpsCoords, audioData, currentSectionIndex, mission?.id, mission?.storeId]);

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.answers) {
        Object.entries(parsed.answers).forEach(([field, val]) => {
          form.setValue(field, val, { shouldDirty: true, shouldTouch: true });
        });
      }
      if (parsed?.imagePreviews) setImagePreviews(parsed.imagePreviews);
      if (parsed?.gpsCoords) setGpsCoords(parsed.gpsCoords);
      if (parsed?.audioData) setAudioData(parsed.audioData);
      if (typeof parsed?.currentSectionIndex === "number" && parsed.currentSectionIndex < sections.length) {
        setCurrentSectionIndex(parsed.currentSectionIndex);
      }
      setHasDraft(false);
      setAutoSaveStatus("saved");
      toast({
        title: "Brouillon restauré avec succès",
        description: "Toutes vos réponses précédentes ont été rechargées.",
      });
    } catch (e) {
      console.error("Erreur restauration brouillon:", e);
    }
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(draftStorageKey);
      setHasDraft(false);
      setDraftSavedAt(null);
      toast({
        title: "Brouillon réinitialisé",
        description: "Vous repartez sur une enquête vierge.",
      });
    } catch (e) {}
  };

  // Numérotation continue globale de toutes les questions du questionnaire
  const questionNumberMap = useMemo(() => {
    const map = new Map();
    let counter = 0;
    surveyQuestions.forEach((q) => {
      if (q.type !== "section_header" && q.type !== "info_text") {
        counter += 1;
        map.set(q.id, counter);
      }
    });
    return map;
  }, [surveyQuestions]);

  // Passage à la section suivante avec validation des champs requis
  const handleNextSection = async () => {
    const currentItems = sections[currentSectionIndex]?.items || [];
    const fieldsToValidate = currentItems
      .filter((q) => q.type !== "section_header" && q.type !== "info_text")
      .map((q) => getFieldName(q));

    const isValid = await form.trigger(fieldsToValidate);

    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Champs obligatoires manquants",
        description:
          "Veuillez répondre à toutes les questions obligatoires de cette section avant de continuer.",
      });
      return;
    }

    setCurrentSectionIndex((prev) => Math.min(totalSections - 1, prev + 1));
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  // Retour à la section précédente
  const handlePrevSection = () => {
    setCurrentSectionIndex((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  // Gestion des erreurs globales lors du submit final
  const onFormError = (errors) => {
    console.log("Validation errors on submit:", errors);
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      for (let sIdx = 0; sIdx < sections.length; sIdx++) {
        const secFieldNames = sections[sIdx].items
          .filter((q) => q.type !== "section_header" && q.type !== "info_text")
          .map((q) => getFieldName(q));

        if (errorKeys.some((k) => secFieldNames.includes(k))) {
          setCurrentSectionIndex(sIdx);
          toast({
            variant: "destructive",
            title: `Section "${sections[sIdx].title}" incomplète`,
            description:
              "Veuillez compléter toutes les questions obligatoires avant de soumettre.",
          });
          break;
        }
      }
    }
  };
  const handleImageChange = async (
    event,
    questionId,
    maxImages,
    allowMultiple,
  ) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const currentPreviews = imagePreviews[questionId] || [];
    const rawFilesToProcess = allowMultiple
      ? files.slice(0, maxImages - currentPreviews.length)
      : [files[0]];

    if (
      rawFilesToProcess.length === 0 &&
      !allowMultiple &&
      currentPreviews.length > 0
    ) {
      toast({
        variant: "destructive",
        title: "Limite atteinte",
        description: "Une seule image est autorisée pour cette question.",
      });
      return;
    }

    // Compression haute efficacité côté smartphone avant envoi (économise l'espace cPanel et accélère en 4G)
    const filesToProcess = await compressImages(rawFilesToProcess);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });

    try {
      let uploadedUrls = [];

      if (allowMultiple && filesToProcess.length > 1) {
        const formData = new FormData();
        filesToProcess.forEach((file) => {
          formData.append("images", file);
        });

        const response = await fetch(API_BASE_URL + "upload/images", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        const result = await response.json();
        uploadedUrls = result.files.map((file) => file.url);
      } else {
        const formData = new FormData();
        formData.append("file", filesToProcess[0]);

        const response = await fetch(API_BASE_URL + "upload/image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        const result = await response.json();
        uploadedUrls = [result.file.url];
      }
      const existingUrls =
        form.getValues(
          getFieldName({ id: questionId, type: "image_upload" }),
        ) || [];
      const finalUrls = allowMultiple
        ? [...existingUrls, ...uploadedUrls]
        : uploadedUrls;

      form.setValue(
        getFieldName({ id: questionId, type: "image_upload" }),
        finalUrls,
      );

      toast({
        title: `Uploaded ${uploadedUrls.length} image(s)`,
        description: "Images successfully uploaded.",
      });
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Could not upload images.",
      });
    }
  };
  const removeImage = (questionId, indexToRemove) => {
    const currentUrls =
      form.getValues(getFieldName({ id: questionId, type: "image_upload" })) ||
      [];
    const updatedUrls = currentUrls.filter(
      (_, index) => index !== indexToRemove,
    );
    form.setValue(
      getFieldName({ id: questionId, type: "image_upload" }),
      updatedUrls,
    );

    setImagePreviews((prev) => ({
      ...prev,
      [questionId]: (prev[questionId] || []).filter(
        (_, index) => index !== indexToRemove,
      ),
    }));
  };

  const handleGpsCapture = (questionId) => {
    setGpsCoords((prev) => ({ ...prev, [questionId]: "loading" }));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setGpsCoords((prev) => ({ ...prev, [questionId]: coords }));
          form.setValue(
            getFieldName({ id: questionId, type: "gps_capture" }),
            coords,
          );
          toast({
            title: "Location Captured",
            description: `Lat: ${coords.lat.toFixed(
              4,
            )}, Lng: ${coords.lng.toFixed(4)}`,
          });
        },
        (error) => {
          setGpsCoords((prev) => ({ ...prev, [questionId]: "error" }));

          let errorMessage = "Unable to get your location.";
          let errorTitle = "Location Error";

          switch (error.code) {
            case 1:
              errorTitle = "Permission Denied";
              errorMessage =
                "Location access was denied. Please check browser permissions.";
              break;
            case 2:
              errorTitle = "Position Unavailable";
              errorMessage =
                "Your location could not be determined. This often happens on localhost.";
              break;
            case 3:
              errorTitle = "Request Timeout";
              errorMessage = "Location request timed out. Please try again.";
              break;
            default:
              errorMessage =
                error.message || "Unknown location error occurred.";
              break;
          }

          toast({
            variant: "destructive",
            title: errorTitle,
            description: errorMessage,
          });

          form.setValue(
            getFieldName({ id: questionId, type: "gps_capture" }),
            null,
          );

          form.setValue(
            getFieldName({ id: questionId, type: "gps_capture" }),
            null,
          ); // Clear RHF value on error
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }, // Options
      );
    } else {
      setGpsCoords((prev) => ({ ...prev, [questionId]: "error" }));
      toast({
        variant: "destructive",
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
      });
      form.setValue(
        getFieldName({ id: questionId, type: "gps_capture" }),
        null,
      );
    }
  };

  // Audio Recording Handling
  const startRecording = async (questionId, maxDurationSeconds) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRecorderRef.current = new MediaRecorder(stream);
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      audioRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      audioRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        try {
          const formData = new FormData();
          formData.append(
            "audio",
            audioBlob,
            `audio_${questionId}_${Date.now()}.webm`,
          );

          const response = await fetch(API_BASE_URL + "upload/audio", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();

          const audioUrl = result.url;

          setAudioData((prev) => ({
            ...prev,
            [questionId]: { url: audioUrl, status: "recorded" },
          }));

          form.setValue(
            getFieldName({ id: questionId, type: "audio_recording" }),
            audioUrl,
          );

          toast({ title: "Audio Recorded & Uploaded!" });
        } catch (error) {
          console.error("Erreur audio:", error);
          toast({ title: "Audio upload failed" });
        }

        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
        }
      };
      audioRecorderRef.current.start();
      setAudioData((prev) => ({
        ...prev,
        [questionId]: { url: null, status: "recording" },
      }));
      toast({
        title: "Recording Started...",
        description: `Max ${maxDurationSeconds} seconds.`,
      });

      setTimeout(() => {
        if (
          audioRecorderRef.current &&
          audioRecorderRef.current.state === "recording"
        ) {
          stopRecording(questionId);
        }
      }, maxDurationSeconds * 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        variant: "destructive",
        title: "Audio Error",
        description: "Could not start recording. Check microphone permissions.",
      });
      setAudioData((prev) => ({
        ...prev,
        [questionId]: { url: null, status: "error" },
      }));
    }
  };

  const stopRecording = (questionId) => {
    if (
      audioRecorderRef.current &&
      audioRecorderRef.current.state === "recording"
    ) {
      audioRecorderRef.current.stop();

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const removeAudio = (questionId) => {
    setAudioData((prev) => ({
      ...prev,
      [questionId]: { url: null, status: "idle" },
    }));
    form.setValue(
      getFieldName({ id: questionId, type: "audio_recording" }),
      null,
    );
    if (
      audioRecorderRef.current &&
      audioRecorderRef.current.state === "recording"
    ) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current.stream
        ?.getTracks()
        .forEach((track) => track.stop());
    }
    toast({ title: "Audio Removed" });
  };

  /*const processSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Transform flat react-hook-form data into structured array
      const formattedAnswers = surveyQuestions.map((q) => {
        const fieldName = `q${q.id}_${q.type}`;
        const rawValue = data[fieldName];

        // Normalize type names
        let type = q.type;
        switch (q.type) {
          case "multiple_choice":
            type = "choice";
            break;
          case "checkboxes":
            type = "checkboxes";
            break;
          case "image_upload":
            type = "upload";
            break;
          case "gps_capture":
            type = "capture";
            break;
          case "audio_recording":
            type = "recording";
            break;
          case "rating":
            type = "rating";
            break;
          default:
            type = "text";
        }

        // Special handling for GPS fields
        let value = rawValue;
        if (type === "capture" && rawValue) {
          value = {
            lat: rawValue.lat || null,
            lng: rawValue.lng || null,
          };
        }

        // ✅ Return clean object (no nesting, no "type": index)

        return {
          question: q.text || "",
          type,
          value,
        };
      });

      // Final structured submission
      const submittedData = {
        mission_id: mission.id,
        nomMagazin: mission.nomMagazin,
        specificStoreAddress: mission.specificStoreAddress,
        scenario: mission.scenario,
        dateTimeMission: mission.dateTimeMission,
        user_id: userId,
        answers: formattedAnswers,
        submitted_at: new Date().toISOString(),
      };
      console.log("Formatted Answers:", formattedAnswers);
      const result = await onSubmitAction(
        submittedData,
        mission.id,
        userId,
        token,
      );
      if (!result.success && result.status === 409) {
        toast({
          variant: "destructive",
          title: "Duplicate Report",
          description: "You have already submitted a report for this mission.",
        });
      }

      if (result.success) {
        toast({
          title: "Report Submitted Successfully!",
          description: `Your report for "${mission.title}" has been submitted.`,
          variant: "default", // Use default style for success
        });
      }
      router.push("/missions/assigned");
    } catch (error) {
      console.error("Submission failed:", error);
      toast({
        title: "Submission Failed",
        description:
          error.message || "Could not submit the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };*/
  const processSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const groupedAnswers = [];
      let currentSection = null;

      surveyQuestions.forEach((q) => {
        // 1️⃣ SECTION HEADER
        if (q.type === "section_header") {
          currentSection = {
            section_id: q.id,
            section_header: q.text || q.title || "Section",
            responses: [],
          };
          groupedAnswers.push(currentSection);
          return;
        }

        // Ignore informational text blocks (no answer needed)
        if (q.type === "info_text") {
          return;
        }

        // 2️⃣ Ensure a section exists (default to Général if not set)
        if (!currentSection) {
          currentSection = {
            section_id: 0,
            section_header: "Général",
            responses: [],
          };
          groupedAnswers.push(currentSection);
        }

        const fieldName = `q${q.id}_${q.type}`;
        const rawValue = data[fieldName];

        // Skip empty answers
        if (
          rawValue === undefined ||
          rawValue === null ||
          rawValue === "" ||
          (Array.isArray(rawValue) && rawValue.length === 0)
        ) {
          return;
        }

        // Normalize GPS
        let value = rawValue;
        if (q.type === "gps_capture" && rawValue) {
          value = {
            lat: rawValue.lat ?? null,
            lng: rawValue.lng ?? null,
          };
        }

        currentSection.responses.push({
          question_id: q.id,
          question: q.text,
          type: q.type,
          value,
        });
      });

      const submittedData = {
        mission_id: mission.id,
        user_id: userId,
        nomMagazin: mission.nomMagazin || mission.businessName || mission.title || "Magasin",
        store_id: mission.storeId || mission.store_id || (mission.stores?.[0]?.id) || 1,
        scenario: mission.scenario || "Visite mystère",
        dateTimeMission: mission.dateTimeMission || new Date().toISOString(),
        specificStoreAddress: mission.specificStoreAddress || mission.location || "",
        ville: mission.ville || mission.location || "Maroc",
        answers: groupedAnswers,
        status: "submitted",
      };

      console.log("Structured Submission Data:", submittedData);

      const result = await onSubmitAction(
        submittedData,
        mission.id,
        userId,
        token,
      );

      // Invalider les caches TanStack Query pour rafraîchir immédiatement la liste des missions
      if (queryClient) {
        if (userId) {
          queryClient.invalidateQueries({ queryKey: ["assigned_userId" + userId] });
          queryClient.removeQueries({ queryKey: ["assigned_userId" + userId] });
        }
        queryClient.invalidateQueries({ queryKey: ["missions"] });
        queryClient.invalidateQueries({ queryKey: ["reports"] });
      }

      if (result.success) {
        // Nettoyage immédiat du brouillon local après soumission réussie
        try {
          if (typeof window !== "undefined" && draftStorageKey) {
            localStorage.removeItem(draftStorageKey);
          }
        } catch (e) {}

        const isAllDone =
          result.data?.allStoresCompleted ??
          result.allStoresCompleted ??
          true;
        const remaining =
          result.data?.remainingStoresCount ??
          result.remainingStoresCount ??
          0;

        if (!isAllDone && remaining > 0) {
          toast({
            title: "Magasin enregistré avec succès !",
            description: `Votre rapport pour "${mission.nomMagazin || mission.title}" a été enregistré. Il vous reste ${remaining} magasin(s) à évaluer pour cette mission.`,
          });
          router.push("/missions/assigned");
        } else {
          toast({
            title: "Mission complétée avec succès !",
            description: `Tous les magasins de la mission "${mission.title}" ont été évalués. Votre rapport est en attente de validation.`,
          });
          router.push("/missions/completed");
        }
      } else {
        toast({
          variant: "destructive",
          title: "Information",
          description:
            result.message ||
            "Vous avez déjà soumis un rapport pour ce magasin.",
        });
        router.push("/missions/assigned");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      toast({
        variant: "destructive",
        title: "Échec de la soumission",
        description: error.message || "Impossible de soumettre le rapport.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl border border-[#041F40]/10 overflow-hidden rounded-2xl bg-white">
      <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-[#041F40] to-[#0A2E5C] text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6C799]">
                Questionnaire d'Audit Mystère
              </span>
              <Badge className="bg-[#D6C799] text-[#041F40] border-none font-bold text-[10px]">
                {totalSections} Section{totalSections > 1 ? "s" : ""}
              </Badge>
            </div>
            <CardTitle className="text-lg sm:text-xl font-bold text-white mt-1">
              {mission.title}
            </CardTitle>
            <CardDescription className="text-slate-300 text-xs mt-0.5">
              Remplissez attentivement les critères section par section
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {autoSaveStatus === "saving" && (
              <span className="text-[11px] text-[#D6C799] flex items-center gap-1 font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...
              </span>
            )}
            {autoSaveStatus === "saved" && draftSavedAt && (
              <span className="text-[11px] text-emerald-300 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Brouillon auto
              </span>
            )}
            <Badge className="bg-white/10 text-[#D6C799] border-white/20 text-xs font-semibold px-3 py-1">
              Étape {currentSectionIndex + 1} / {totalSections}
            </Badge>
          </div>
        </div>

        {/* Alerte Détection de Brouillon non finalisé */}
        {hasDraft && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-bold text-xs text-white">
                <RotateCcw className="w-4 h-4 text-[#D6C799] shrink-0" />
                <span>Brouillon d'enquête sauvegardé</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Sauvegardé sur cet appareil le {draftSavedAt?.toLocaleDateString()} à {draftSavedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Button
                type="button"
                size="sm"
                onClick={restoreDraft}
                className="flex-1 sm:flex-initial bg-[#D6C799] hover:bg-[#D6C799]/90 text-[#041F40] font-bold text-xs h-8 px-3"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Reprendre
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={discardDraft}
                className="flex-1 sm:flex-initial text-slate-300 hover:text-white hover:bg-white/10 text-xs h-8 px-2"
              >
                Ignorer
              </Button>
            </div>
          </div>
        )}

        {/* Barre de progression & Stepper */}
        {totalSections > 1 && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Progression du questionnaire</span>
              <span className="text-[#D6C799] font-bold">
                {Math.round(((currentSectionIndex + 1) / totalSections) * 100)}%
              </span>
            </div>

            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#D6C799] h-full transition-all duration-300 ease-out rounded-full"
                style={{
                  width: `${Math.round(((currentSectionIndex + 1) / totalSections) * 100)}%`,
                }}
              />
            </div>

            {/* Stepper pills cliquables */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
              {sections.map((sec, sIdx) => {
                const isActive = sIdx === currentSectionIndex;
                const isPast = sIdx < currentSectionIndex;

                return (
                  <button
                    key={sec.id || sIdx}
                    type="button"
                    onClick={async () => {
                      if (sIdx <= currentSectionIndex) {
                        setCurrentSectionIndex(sIdx);
                      } else {
                        const currentItems =
                          sections[currentSectionIndex]?.items || [];
                        const fieldsToValidate = currentItems
                          .filter(
                            (q) =>
                              q.type !== "section_header" &&
                              q.type !== "info_text",
                          )
                          .map((q) => getFieldName(q));

                        const isValid = await form.trigger(fieldsToValidate);
                        if (isValid) {
                          setCurrentSectionIndex(sIdx);
                        } else {
                          toast({
                            variant: "destructive",
                            title: "Section incomplète",
                            description:
                              "Veuillez compléter toutes les questions obligatoires de la section en cours.",
                          });
                        }
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                      isActive
                        ? "bg-[#D6C799] text-[#041F40] border-[#D6C799] shadow-sm font-bold"
                        : isPast
                          ? "bg-white/15 text-emerald-300 border-emerald-400/30 hover:bg-white/25"
                          : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {isPast ? (
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isActive
                            ? "bg-[#041F40] text-[#D6C799] font-bold"
                            : "bg-white/20 text-slate-200"
                        }`}
                      >
                        {sIdx + 1}
                      </span>
                    )}
                    <span className="truncate max-w-[130px]">{sec.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardHeader>
      <Form {...form}>
        {/* Use RHF's handleSubmit to trigger validation and then call processSubmit */}
        <form
          onSubmit={form.handleSubmit(processSubmit, onFormError)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !isLastSection &&
              e.target.tagName !== "TEXTAREA"
            ) {
              e.preventDefault();
              handleNextSection();
            }
          }}
          className="space-y-6"
        >
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {surveyQuestions.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                Aucune question trouvée pour cette mission.
              </p>
            )}

            {sections.map((sec, secIdx) => {
              const isCurrent = secIdx === currentSectionIndex;
              return (
                <div
                  key={sec.id || `section-${secIdx}`}
                  className={isCurrent ? "space-y-6 block" : "hidden"}
                >
                  {/* Bannière de titre de la section */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#041F40]/10 via-[#D6C799]/15 to-transparent border-l-4 border-[#041F40] mb-6">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-[#041F40] flex items-center gap-2">
                        <Columns className="w-5 h-5 text-[#D6C799]" />
                        {sec.title}
                      </h3>
                      <Badge className="bg-[#041F40] text-[#D6C799] border-none text-[11px] font-bold">
                        Section {secIdx + 1} / {totalSections}
                      </Badge>
                    </div>
                    {sec.description && (
                      <p className="text-xs text-slate-600 mt-1.5 font-medium leading-relaxed">
                        {sec.description}
                      </p>
                    )}
                  </div>

                  {sec.items.length === 0 ? (
                    <p className="text-center text-slate-400 py-6 text-sm">
                      Aucune question dans cette section.
                    </p>
                  ) : (
                    sec.items.map((q, qLocalIndex) => {
                      if (q.type === "info_text") {
                        return (
                          <div
                            key={q.id || `info-${qLocalIndex}`}
                            className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-sm flex items-start gap-3 my-3 shadow-xs"
                          >
                            <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                            <div className="whitespace-pre-line leading-relaxed font-medium">
                              {q.text || q.content}
                            </div>
                          </div>
                        );
                      }

                      const qNumber =
                        questionNumberMap.get(q.id) || qLocalIndex + 1;
                      const fieldName = getFieldName(q);
                      return (
                        <FormField
                          control={form.control}
                          name={fieldName}
                          rules={{ required: q.isRequired }}
                          key={q.id || `q-${qLocalIndex}`}
                          render={({ field }) => (
                      <FormItem className="border-t pt-6 first:border-t-0 first:pt-0">
                        {/* Question Label with Type Icon */}
                        <FormLabel className="font-semibold text-md flex items-center gap-2 text-slate-900">
                          {getIconForType(q.type)}
                          <span>
                            {qNumber}. {q.text}
                          </span>
                          {q.isRequired && (
                            <span className="text-destructive text-xs ml-1 font-bold">
                              *
                            </span>
                          )}
                        </FormLabel>
                        {/* Optional Description */}
                        {q.description && (
                          <FormDescription className="text-sm ml-6">
                            {q.description}
                          </FormDescription>
                        )}

                        {/* Render input based on question type */}
                        <FormControl className="pl-6 mt-2">
                          <div>
                            {q.type === "text" && (
                              <Textarea
                                placeholder="Votre réponse détaillée..."
                                className="min-h-[90px] focus:border-[#041F40]"
                                {...field}
                                value={field.value || ""}
                              />
                            )}

                            {q.type === "date" && (
                              <Input
                                type="date"
                                className="max-w-xs focus:border-[#041F40]"
                                {...field}
                                value={field.value || ""}
                              />
                            )}

                            {q.type === "time" && (
                              <Input
                                type="time"
                                className="max-w-xs focus:border-[#041F40]"
                                {...field}
                                value={field.value || ""}
                              />
                            )}

                            {q.type === "number" && (
                              <Input
                                type="number"
                                placeholder="0"
                                className="max-w-xs focus:border-[#041F40]"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            )}

                            {q.type === "yes_no" && (
                              <div className="flex gap-4 items-center pt-1">
                                <Button
                                  type="button"
                                  variant={field.value === "Oui" ? "default" : "outline"}
                                  className={
                                    field.value === "Oui"
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                                      : "border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
                                  }
                                  onClick={() =>
                                    form.setValue(fieldName, "Oui", {
                                      shouldValidate: true,
                                    })
                                  }
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Oui
                                </Button>
                                <Button
                                  type="button"
                                  variant={field.value === "Non" ? "default" : "outline"}
                                  className={
                                    field.value === "Non"
                                      ? "bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm"
                                      : "border-slate-300 text-slate-700 hover:border-rose-500 hover:text-rose-700"
                                  }
                                  onClick={() =>
                                    form.setValue(fieldName, "Non", {
                                      shouldValidate: true,
                                    })
                                  }
                                >
                                  <AlertCircle className="w-4 h-4 mr-1.5" /> Non
                                </Button>
                              </div>
                            )}

                          {q.type === "rating" && (
                            <div className="flex space-x-1 items-center">
                              <span className="text-xs mr-2 text-muted-foreground">
                                {q.minLabel || "Poor"}
                              </span>
                              {[...Array(q.maxRating || 5).keys()].map((i) => {
                                const ratingValue = i + 1;
                                return (
                                  <Button
                                    key={ratingValue}
                                    type="button"
                                    variant={
                                      field.value >= ratingValue
                                        ? "default"
                                        : "outline"
                                    }
                                    size="icon"
                                    className={`h-8 w-8 ${
                                      field.value >= ratingValue
                                        ? "bg-accent text-accent-foreground border-accent"
                                        : "text-muted-foreground"
                                    } hover:bg-accent/80 hover:text-accent-foreground transition-colors`}
                                    onClick={() =>
                                      form.setValue(fieldName, ratingValue, {
                                        shouldValidate: true,
                                      })
                                    }
                                  >
                                    <Star
                                      className="w-5 h-5"
                                      fill={
                                        field.value >= ratingValue
                                          ? "currentColor"
                                          : "none"
                                      }
                                    />
                                  </Button>
                                );
                              })}
                              <span className="text-xs ml-2 text-muted-foreground">
                                {q.maxLabel || "Excellent"}
                              </span>
                            </div>
                          )}

                          {q.type === "multiple_choice" && (
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="space-y-2"
                            >
                              {(q.options || [])?.map((opt) => (
                                <FormItem
                                  key={opt.id}
                                  className="flex items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <RadioGroupItem value={opt.text} />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {opt.text}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          )}

                          {q.type === "checkboxes" && (
                            <FormField
                              control={form.control}
                              name={fieldName}
                              defaultValue={{}}
                              render={({ field }) => (
                                <div className="space-y-2">
                                  {(q.options || []).map((opt) => {
                                    const checked =
                                      field.value?.[opt.text] || false;

                                    return (
                                      <FormItem
                                        key={opt.id}
                                        className="flex items-center space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={checked}
                                            onCheckedChange={(value) => {
                                              field.onChange({
                                                ...field.value,
                                                [opt.text]: value,
                                              });
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {opt.text}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  })}
                                </div>
                              )}
                            />
                          )}

                          {q.type === "image_upload" && (
                            <div className="space-y-3">
                              <Input
                                id={`q-img-${q.id}`}
                                type="file"
                                accept="image/*"
                                multiple={q.allowMultiple ?? true}
                                onChange={(e) =>
                                  handleImageChange(
                                    e,
                                    q.id,
                                    q.maxImages ?? 5,
                                    q.allowMultiple ?? true,
                                  )
                                }
                                disabled={
                                  (imagePreviews[q.id]?.length || 0) >=
                                    (q.maxImages ?? 5) && q.allowMultiple
                                }
                                className="block w-full max-w-xs text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                              />
                              {(imagePreviews[q.id]?.length || 0) > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {(imagePreviews[q.id] || []).map(
                                    (url, index) => (
                                      <div
                                        key={index}
                                        className="relative group"
                                      >
                                        <Image
                                          src={url}
                                          alt={`Preview ${index + 1}`}
                                          width={100}
                                          height={75}
                                          className="rounded-md object-cover border"
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="icon"
                                          className="absolute top-0 right-0 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() =>
                                            removeImage(q.id, index)
                                          }
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                              <FormDescription className="text-xs">
                                {q.allowMultiple
                                  ? `Upload up to ${q.maxImages ?? 5} images.`
                                  : `Upload 1 image.`}{" "}
                                Allowed types: JPG, PNG.
                              </FormDescription>
                              {/* Hidden input managed internally by RHF */}
                            </div>
                          )}

                          {q.type === "gps_capture" && (
                            <div className="space-y-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleGpsCapture(q.id)}
                                disabled={gpsCoords[q.id] === "loading"}
                              >
                                <MapPin className="w-4 h-4 mr-2" />
                                {gpsCoords[q.id] === "loading" && (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                {gpsCoords[q.id] &&
                                typeof gpsCoords[q.id] === "object"
                                  ? "Recapture Location"
                                  : "Capture Current Location"}
                              </Button>
                              {gpsCoords[q.id] &&
                                typeof gpsCoords[q.id] === "object" && (
                                  <p className="text-sm text-green-600">
                                    Location captured: Lat{" "}
                                    {gpsCoords[q.id].lat.toFixed(4)}, Lng{" "}
                                    {gpsCoords[q.id].lng.toFixed(4)}
                                  </p>
                                )}
                              {gpsCoords[q.id] === "error" && (
                                <p className="text-sm text-destructive">
                                  Could not capture location.
                                </p>
                              )}
                              {/* Hidden input managed internally by RHF */}
                            </div>
                          )}

                          {q.type === "audio_recording" && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    startRecording(
                                      q.id,
                                      q.maxDurationSeconds ?? 60,
                                    )
                                  }
                                  disabled={
                                    audioData[q.id]?.status === "recording" ||
                                    !!audioData[q.id]?.url
                                  }
                                >
                                  <Mic className="w-4 h-4 mr-2" /> Start
                                  Recording
                                </Button>
                                {audioData[q.id]?.status === "recording" && (
                                  <>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      onClick={() => stopRecording(q.id)}
                                    >
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                                      Stop Recording
                                    </Button>
                                    <span className="text-xs text-muted-foreground italic">
                                      Recording...
                                    </span>
                                  </>
                                )}
                              </div>
                              {audioData[q.id]?.url && (
                                <div className="flex items-center gap-2 p-2 border rounded bg-secondary">
                                  {/* Check if it's a simulated URL before rendering the player */}
                                  {audioData[q.id].url.startsWith(
                                    "/audio/simulated_",
                                  ) ? (
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm italic flex-grow">
                                      <Mic className="w-4 h-4" />
                                      <span>
                                        Audio recorded (simulation:{" "}
                                        {audioData[q.id].url.split("/").pop()})
                                      </span>
                                    </div>
                                  ) : (
                                    <audio
                                      controls
                                      src={audioData[q.id].url}
                                      className="w-full max-w-xs h-10 flex-grow"
                                    >
                                      Your browser does not support the audio
                                      element.
                                    </audio>
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => removeAudio(q.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                              {audioData[q.id]?.status === "error" && (
                                <p className="text-sm text-destructive">
                                  Audio recording failed.
                                </p>
                              )}
                              <FormDescription className="text-xs">
                                Record audio up to {q.maxDurationSeconds ?? 60}{" "}
                                seconds.
                              </FormDescription>
                              {/* Hidden input managed internally by RHF */}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      {/* Validation Message */}
                      <FormMessage className="pl-6" />
                    </FormItem>
                  )}
                />
              );
            })
          )}
        </div>
      );
    })}
  </CardContent>

  {/* PIED DE PAGE : NAVIGATION ENTRE SECTIONS & ENVOI FINAL */}
  <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 bg-slate-50/90 border-t border-slate-200">
    {/* Bouton Précédent */}
    {currentSectionIndex > 0 ? (
      <Button
        type="button"
        variant="outline"
        onClick={handlePrevSection}
        className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 sm:h-10 px-5 text-sm font-semibold border-slate-300 text-[#041F40] hover:bg-white rounded-xl shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        Section précédente
      </Button>
    ) : (
      <div className="hidden sm:block" />
    )}

    <div className="text-xs font-semibold text-slate-500 text-center order-first sm:order-none">
      Section {currentSectionIndex + 1} sur {totalSections}
    </div>

    {/* Bouton Suivant OU Finaliser & Envoyer */}
    {!isLastSection ? (
      <Button
        type="button"
        onClick={handleNextSection}
        className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 sm:h-10 px-6 text-sm font-bold bg-[#041F40] hover:bg-[#0c2b54] text-[#D6C799] rounded-xl shadow-md transition-all hover:scale-[1.02]"
      >
        Section suivante
        <ArrowRight className="w-4 h-4" />
      </Button>
    ) : (
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 sm:h-11 px-8 text-sm font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Envoi du rapport en cours...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Finaliser & Envoyer le rapport
          </>
        )}
      </Button>
    )}
  </CardFooter>
        </form>
      </Form>
      {/* Global error for permissions if needed */}
      {/* Example: Display if camera/mic/location is generally denied */}
      {/* <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Permissions Required</AlertTitle>
            <AlertDescription>
                 Please ensure location, microphone, and camera permissions are enabled in your browser settings to use all features.
            </AlertDescription>
         </Alert> */}
    </Card>
  );
}
