"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ClipboardList,
  FileText,
  CheckCircle,
  PlayCircle,
  Download,
  Clock,
  AlertTriangle,
  MapPin,
  XCircle,
  Info,
  Calendar,
  Building2,
  Award,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  format,
  isWithinInterval,
  addMinutes,
  subMinutes,
  isAfter,
  isBefore,
} from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchMissions, api } from "@/services/fetchData";
import { queryClient } from "@/context/query-provider";
import { useAuth } from "@/context/auth-context";

// Composant Modal pour le quiz de reconnaissance
const RecognitionQuizModal = ({ missionId, onClose, onSuccess }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [passingScore, setPassingScore] = useState(100);
  const [attempts, setAttempts] = useState(0);
  const [lastScore, setLastScore] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchQuiz = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/missions/${missionId}/recognition-quiz/${user?.id}`);
      const data = res.data;

      if (data.success) {
        if (!data.questions || data.questions.length === 0) {
          onSuccess(true);
          return;
        }

        const questionsWithIds = data.questions.map((q) => ({
          ...q,
          options: (q.options || []).map((opt, index) => ({
            ...opt,
            id: opt.id || `opt-${q.id}-${index}`,
          })),
        }));

        setQuestions(questionsWithIds);
        setPassingScore(data.passingScore || 100);
        setAttempts(data.attempts || 0);
        setLastScore(data.lastScore || null);

        if (data.hasPassed) {
          toast({
            title: "Quiz déjà complété",
            description: "Vous avez déjà réussi ce quiz.",
          });
          onSuccess(true);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Information",
          description: data.error || "Impossible de charger le quiz.",
        });
        onClose();
      }
    } catch (error) {
      console.error("Erreur chargement quiz:", error);
      // Si 404, pas de quiz requis
      if (error.response?.status === 404) {
        onSuccess(true);
        return;
      }
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.error || "Impossible de charger le quiz.",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }, [missionId, user, toast, onSuccess, onClose]);

  useEffect(() => {
    if (missionId && user?.id) {
      fetchQuiz();
    }
  }, [missionId, user, fetchQuiz]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCheckboxChange = (questionId, optionText, checked) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, optionText] };
      } else {
        return {
          ...prev,
          [questionId]: current.filter((t) => t !== optionText),
        };
      }
    });
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((q) => {
      if (q.type === "multiple_choice") {
        return !answers[q.id];
      } else if (q.type === "checkboxes") {
        return !answers[q.id] || answers[q.id].length === 0;
      }
      return false;
    });

    if (unanswered.length > 0) {
      toast({
        variant: "destructive",
        title: "Questions manquantes",
        description: "Veuillez répondre à toutes les questions.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(
        `missions/${missionId}/recognition-quiz/submit/${user?.id}`,
        { answers },
      );
      const data = res.data;

      if (data.success) {
        if (data.hasPassed) {
          toast({
            title: "✅ Quiz réussi !",
            description:
              "Félicitations ! Vous pouvez accéder au questionnaire final.",
          });
          setTimeout(() => {
            onSuccess(true);
          }, 1000);
        } else {
          toast({
            variant: "destructive",
            title: "❌ Quiz non réussi",
            description: `Score: ${Math.round(data.score)}%. Score minimum requis: ${passingScore}%. Vous serez bloqué pendant 15 minutes.`,
          });

          setTimeout(() => {
            onClose();
            onSuccess(false);
          }, 2000);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: data.error || "Erreur lors de la soumission.",
        });
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Erreur soumission:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de la soumission du quiz.",
      });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <Card className="w-full max-w-2xl border-slate-200 bg-white shadow-2xl rounded-2xl">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#041F40]" />
            <p className="text-slate-600 font-medium">Chargement du quiz...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200 bg-white shadow-2xl rounded-2xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-[#041F40] text-xl font-bold">
            <Award className="h-5 w-5 text-[#041F40]" />
            Quiz de Reconnaissance
          </CardTitle>
          <CardDescription className="text-slate-600">
            Répondez correctement à toutes les questions pour accéder au
            questionnaire final. Score minimum requis :{" "}
            <strong className="text-[#041F40] font-bold">{passingScore}%</strong>
            {attempts > 0 && (
              <span className="ml-2 text-slate-500 font-medium">
                (Tentative {attempts + 1})
              </span>
            )}
            {lastScore !== null && (
              <span className="ml-2 text-amber-700 font-semibold">
                Dernier score: {Math.round(lastScore)}%
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-5">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="border-b border-slate-100 pb-4 last:border-0"
            >
              <Label className="font-bold block mb-3 text-slate-900 text-sm">
                {idx + 1}. {q.question}
              </Label>

              {q.type === "multiple_choice" && (
                <RadioGroup
                  value={answers[q.id] || ""}
                  onValueChange={(value) => handleAnswerChange(q.id, value)}
                  className="space-y-2"
                >
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={opt.id || oIdx}
                      className="flex items-center space-x-2.5 p-2.5 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      <RadioGroupItem
                        value={opt.text}
                        id={`q${q.id}-opt${oIdx}`}
                        className="data-[state=checked]:bg-[#041F40] data-[state=checked]:border-[#041F40]"
                      />
                      <Label
                        htmlFor={`q${q.id}-opt${oIdx}`}
                        className="cursor-pointer flex-grow text-slate-700 font-medium text-sm"
                      >
                        {opt.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {q.type === "checkboxes" && (
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={opt.id || oIdx}
                      className="flex items-center space-x-2.5 p-2.5 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        id={`q${q.id}-opt${oIdx}`}
                        checked={answers[q.id]?.includes(opt.text) || false}
                        onChange={(e) =>
                          handleCheckboxChange(q.id, opt.text, e.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-[#041F40] focus:ring-[#041F40]/20"
                      />
                      <Label
                        htmlFor={`q${q.id}-opt${oIdx}`}
                        className="cursor-pointer flex-grow text-slate-700 font-medium text-sm"
                      >
                        {opt.text}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>

        <CardFooter className="flex justify-end gap-2 border-t border-slate-100 pt-4 bg-slate-50/50">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            Fermer
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#041F40] hover:bg-[#093568] text-white px-8 font-semibold shadow-md"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              "Valider le quiz"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default function AssignedMissionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [myAssignments, setMyAssignments] = useState([]);
  const [mySubmittedMissions, setMySubmittedMissions] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myRefusedMissions, setMyRefusedMissions] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [recognitionQuizOpen, setRecognitionQuizOpen] = useState(false);
  const [accessStatus, setAccessStatus] = useState({});
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      Object.keys(accessStatus).forEach((missionId) => {
        const status = accessStatus[missionId];
        if (status?.isBlocked) {
          checkMissionAccess(missionId);
        }
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [accessStatus]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        if (!user?.id) return;

        const applied = await fetchMissions(
          "assigned_userId" + user.id,
          process.env.NEXT_PUBLIC_API_URL + "applications/assigned/" + user.id,
        );
        console.log("Missions assignées récupérées :", applied);

        const assigned = (applied || []).filter(
          (app) => app.status === "approved" && !app.has_submitted_report,
        );
        const submitted = (applied || []).filter(
          (app) => app.status === "submitted" || app.has_submitted_report,
        );
        const refused = (applied || []).filter((app) => app.status === "refused");
        const app = (applied || []).filter((app) => app.status === "pending");

        setMyApplications(app);
        setMyAssignments(assigned);
        setMySubmittedMissions(submitted);
        setMyRefusedMissions(refused);

        for (const mission of assigned) {
          await checkMissionAccess(mission.mission_id);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des missions assignées :",
          error,
        );
      }
    };
    fetchAssignments();
  }, [user, refreshKey]);

  const checkMissionAccess = async (missionId) => {
    try {
      const res = await api.get(`/missions/${missionId}/check-access/${user?.id}`);
      const data = res.data;

      if (data.success) {
        setAccessStatus((prev) => ({
          ...prev,
          [missionId]: data,
        }));
        return data;
      }
    } catch (error) {
      console.error("Erreur vérification accès:", error);
    }
    return null;
  };

  const handleDocDownload = async (docUrl, docName, missionTitle) => {
    if (!docUrl) {
      toast({
        title: "Document non disponible",
        description: "Ce document n'a pas encore été mis en ligne.",
        variant: "destructive",
      });
      return;
    }

    // Normaliser l'URL pour assurer l'accès correct
    let targetUrl = docUrl;
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
    const backendBase = apiBase.replace(/\/api\/?$/, "");

    if (targetUrl.startsWith("/")) {
      targetUrl = `${backendBase}${targetUrl}`;
    } else if (
      targetUrl.startsWith("http://localhost:5000") &&
      !apiBase.includes("localhost:5000")
    ) {
      targetUrl = targetUrl.replace("http://localhost:5000", backendBase);
    }

    try {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const fileName =
        targetUrl.split("/").pop() || `${docName}_${missionTitle || "mission"}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);

      toast({
        title: "Document téléchargé",
        description: `${docName} téléchargé avec succès.`,
      });
    } catch (error) {
      console.warn("Téléchargement direct échoué, ouverture directe:", error);
      // Fallback: ouvrir directement dans un nouvel onglet
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      toast({
        title: "Ouverture du document",
        description: `Le document ${docName} a été ouvert dans un nouvel onglet.`,
      });
    }
  };

  const handleQuizSuccess = (missionId) => {
    const m = myApplications.find(
      (x) => String(x.mission_id) === String(missionId),
    );
    if (m) {
      m.knowledgeQuizPassed = true;
    }
    toast({
      title: "Quiz réussi !",
      description: "Le questionnaire est débloqué pour l'heure de visite.",
    });
    setActiveQuiz(null);
    router.refresh();
  };

  const handleRecognitionQuizSuccess = (success = true) => {
    setRecognitionQuizOpen(false);
    setSelectedMissionId(null);

    if (success) {
      toast({
        title: "✅ Quiz réussi !",
        description: "Vous pouvez maintenant accéder au questionnaire final.",
      });
    }

    if (selectedMissionId) {
      setTimeout(() => {
        checkMissionAccess(selectedMissionId);
      }, 500);
    }
    setRefreshKey((prev) => prev + 1);
    router.refresh();
  };

  const handleOpenFinalQuestionnaire = async (asg, specificStore = null) => {
    const missionId = asg.mission_id;
    try {
      const data = await checkMissionAccess(missionId);

      if (data) {
        if (data.canAccess) {
          const store =
            specificStore ||
            (selectedMissionId === missionId && selectedStore) ||
            (asg.stores && asg.stores.length > 0 ? asg.stores[0] : null);

          const params = new URLSearchParams();
          if (store?.id) params.set("storeId", store.id);
          if (store?.name) params.set("storeName", store.name);
          if (store?.address) params.set("specificStoreAddress", store.address);
          if (store?.city) params.set("ville", store.city);
          if (asg.scenario) params.set("scenario", asg.scenario);
          if (asg.mission_date) params.set("dateTimeMission", asg.mission_date);

          const qs = params.toString();
          router.push(`/report/${missionId}${qs ? `?${qs}` : ""}`);
        } else if (data.isBlocked) {
          toast({
            variant: "destructive",
            title: "⏳ Veuillez patienter",
            description: data.message,
          });
        } else {
          setSelectedMissionId(missionId);
          setRecognitionQuizOpen(true);
        }
      }
    } catch (error) {
      console.error("Erreur vérification accès:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de vérifier votre accès.",
      });
    }
  };

  const handleManualRefresh = () => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ["assigned_userId" + user.id] });
      queryClient.removeQueries({ queryKey: ["assigned_userId" + user.id] });
    }
    setRefreshKey((prev) => prev + 1);
    toast({ title: "Actualisation", description: "Données rafraîchies." });
  };

  const handleRetryQuiz = (missionId) => {
    setSelectedMissionId(missionId);
    setRecognitionQuizOpen(true);
  };

  const formatBlockTime = (minutes) => {
    if (minutes <= 0) return "0 min";
    if (minutes < 1) return "< 1 min";
    return `${Math.ceil(minutes)} min`;
  };

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 py-4 sm:py-8 px-3 sm:px-4">
      <div className="container mx-auto max-w-4xl">
        {/* En-tête exécutif Emberton */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#041F40] via-[#093568] to-[#041F40] text-white p-5 sm:p-7 shadow-lg mb-6">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#D6C799] text-xs font-semibold mb-2">
                <Award className="w-3.5 h-3.5 text-[#D6C799]" />
                Espace Shopper Mystère
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                <ClipboardList className="w-6 h-6 text-[#D6C799]" /> Suivi de mes Missions
              </h1>
              <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-xl">
                Consultez vos missions approuvées, accédez aux questionnaires et suivez vos candidatures.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:text-white backdrop-blur-sm self-start sm:self-auto font-medium"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        <Tabs defaultValue="assigned" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl gap-1.5 sm:gap-2 p-1.5 bg-slate-200/90 border border-slate-300 rounded-xl h-auto">
            <TabsTrigger
              value="assigned"
              className="data-[state=active]:bg-white data-[state=active]:text-[#041F40] data-[state=active]:shadow-sm transition-all text-slate-600 font-semibold text-xs sm:text-sm py-2 px-2"
            >
              <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-blue-600" />
              Assignées ({myAssignments.length})
            </TabsTrigger>
            <TabsTrigger
              value="submitted"
              className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all text-slate-600 font-semibold text-xs sm:text-sm py-2 px-2"
            >
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-emerald-600" />
              Soumises ({mySubmittedMissions.length})
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm transition-all text-slate-600 font-semibold text-xs sm:text-sm py-2 px-2"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-amber-600" />
              Candidatures ({myApplications.length})
            </TabsTrigger>
            <TabsTrigger
              value="refused"
              className="data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:shadow-sm transition-all text-slate-600 font-semibold text-xs sm:text-sm py-2 px-2"
            >
              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-rose-600" />
              Refusées ({myRefusedMissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="space-y-6 mt-6">
            {myAssignments.length > 0 ? (
              myAssignments.map((asg) => {
                const plannedDate = new Date(asg.mission_date || asg.applied_at);
                const isValidDate = !isNaN(plannedDate.getTime());
                const isSlotOpen = asg.time_slot === "open";
                const parsedSlot = Number(asg.time_slot);
                const windowMin =
                  !isNaN(parsedSlot) && parsedSlot > 0 ? parsedSlot : 60;

                const startTime = isValidDate
                  ? subMinutes(plannedDate, windowMin)
                  : new Date();
                const endTime = isValidDate
                  ? addMinutes(plannedDate, windowMin)
                  : new Date();

                let beforeMission = false;
                let missionActive = true;
                let missionExpired = false;

                if (!isSlotOpen && isValidDate) {
                  beforeMission = isBefore(currentTime, startTime);
                  missionActive = isWithinInterval(currentTime, {
                    start: startTime,
                    end: endTime,
                  });
                  missionExpired = isAfter(currentTime, endTime);
                }

                const hasDocs = Boolean(
                  asg.briefing || asg.scenario || asg.questionnaire,
                );
                const access = accessStatus[asg.mission_id];
                const effectiveStore =
                  (selectedMissionId === asg.mission_id && selectedStore) ||
                  (asg.stores && asg.stores.length > 0 ? asg.stores[0] : null);

                return (
                  <Card
                    key={asg.application_id || asg.mission_id}
                    className={cn(
                      "overflow-hidden shadow-sm hover:shadow-md border rounded-2xl transition-all bg-white",
                      missionExpired
                        ? "border-rose-200 bg-rose-50/20"
                        : "border-slate-200",
                    )}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3 border-b border-slate-100 bg-slate-50/50">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold text-[#041F40]">
                          {asg.title}
                        </CardTitle>

                        <CardDescription className="space-y-1">
                          <div className="font-semibold text-slate-800 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-500" />
                            {asg.businessName}
                          </div>

                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {asg.stores?.[0]?.name || asg.location}
                          </div>
                        </CardDescription>
                      </div>

                      <div className="text-right space-y-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "flex items-center gap-1 border-slate-300 text-slate-700 bg-white font-medium",
                            missionActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold"
                              : "",
                          )}
                        >
                          <Clock className="w-3 h-3" />
                          {isValidDate
                            ? format(plannedDate, "PPp", { locale: fr })
                            : "Date non définie"}
                        </Badge>

                        <p className="text-[11px] text-slate-500 font-medium">
                          {isSlotOpen ? "Créneau libre" : `± ${windowMin} min`}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-4">
                      <div className="flex gap-2 flex-wrap">
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          Mission approuvée
                        </Badge>

                        {beforeMission && (
                          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                            En attente du créneau
                          </Badge>
                        )}

                        {missionActive && (
                          <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                            Créneau ouvert
                          </Badge>
                        )}

                        {missionExpired && (
                          <Badge className="bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                            Créneau expiré
                          </Badge>
                        )}

                        {access?.hasPassed && (
                          <Badge className="bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                            <CheckCircle className="w-3 h-3 mr-1 text-purple-600" />
                            Prêt pour enquête
                          </Badge>
                        )}
                      </div>

                      {hasDocs && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-slate-800 text-sm">
                            <FileText size={16} className="text-[#041F40]" />
                            Documents de la mission
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {asg.briefing && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDocDownload(
                                    asg.briefing,
                                    "Briefing",
                                    asg.title,
                                  )
                                }
                                className="justify-start border-slate-300 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium"
                              >
                                <Download className="mr-2 h-4 w-4 text-[#041F40]" />
                                Briefing
                              </Button>
                            )}

                            {asg.scenario && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDocDownload(
                                    asg.scenario,
                                    "Scénario",
                                    asg.title,
                                  )
                                }
                                className="justify-start border-slate-300 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium"
                              >
                                <Download className="mr-2 h-4 w-4 text-[#041F40]" />
                                Scénario
                              </Button>
                            )}

                            {asg.questionnaire && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDocDownload(
                                    asg.questionnaire,
                                    "Questionnaire",
                                    asg.title,
                                  )
                                }
                                className="justify-start border-slate-300 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium"
                              >
                                <Download className="mr-2 h-4 w-4 text-[#041F40]" />
                                Questionnaire
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {asg.total_stores_count > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                          <span className="font-semibold text-amber-900">
                            Progression de la mission multi-magasins :
                          </span>
                          <span className="font-bold text-[#041F40] bg-white px-2.5 py-0.5 rounded-full border border-amber-200 shadow-xs">
                            {(asg.submitted_store_ids || []).length} / {asg.total_stores_count} magasin(s) évalué(s)
                          </span>
                        </div>
                      )}

                      {asg.stores && asg.stores.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2 text-slate-800 text-sm">
                            {asg.stores.length > 1
                              ? "Sélectionner le magasin à évaluer :"
                              : "Magasin assigné à évaluer :"}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {asg.stores.map((store) => {
                              const isSelected =
                                effectiveStore?.id === store.id &&
                                (selectedMissionId === asg.mission_id || !selectedMissionId);
                              return (
                                <Button
                                  key={store.id}
                                  size="sm"
                                  variant={isSelected ? "default" : "outline"}
                                  onClick={() => {
                                    setSelectedStore(store);
                                    setSelectedMissionId(asg.mission_id);
                                  }}
                                  className={cn(
                                    isSelected
                                      ? "bg-[#041F40] text-white hover:bg-[#093568] font-bold shadow-sm"
                                      : "border-slate-300 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100",
                                  )}
                                >
                                  <MapPin className="mr-1 h-3.5 w-3.5" />
                                  {store.name} {store.city ? `(${store.city})` : ""}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {missionActive && (
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                          {asg.has_submitted_report ? (
                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 gap-3">
                              <div className="flex items-center gap-2.5">
                                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                                <div>
                                  <div className="font-bold text-slate-900">Rapport final soumis</div>
                                  <div className="text-xs text-slate-600">Tous les magasins ont été évalués. En cours d'évaluation par l'administrateur.</div>
                                </div>
                              </div>
                              <Button asChild size="sm" className="bg-[#041F40] text-white hover:bg-[#093568] font-medium shadow-sm">
                                <Link href="/missions/completed">
                                  Mes missions complétées
                                </Link>
                              </Button>
                            </div>
                          ) : access?.hasPassed ? (
                            <Button
                              className="w-full bg-[#041F40] hover:bg-[#093568] text-white font-bold shadow-md hover:shadow-lg py-5 text-base"
                              onClick={() => handleOpenFinalQuestionnaire(asg, effectiveStore)}
                            >
                              <PlayCircle className="mr-2 h-5 w-5 text-[#D6C799]" />
                              Remplir le questionnaire final
                              {effectiveStore?.name ? ` — ${effectiveStore.name}` : ""}
                            </Button>
                          ) : access?.isBlocked ? (
                            <>
                              <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                                <Clock className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="font-bold text-amber-900">
                                  Accès bloqué temporairement
                                </AlertTitle>
                                <AlertDescription className="text-amber-800">
                                  {access.message}
                                  <br />
                                  <span className="font-bold text-base text-amber-900">
                                    ⏳{" "}
                                    {formatBlockTime(access.blockRemainingMinutes)}{" "}
                                    restantes
                                  </span>
                                </AlertDescription>
                              </Alert>
                              <Button className="w-full" disabled variant="outline">
                                <Clock className="mr-2 h-4 w-4 animate-pulse" />
                                Accès dans{" "}
                                {formatBlockTime(access.blockRemainingMinutes)}
                              </Button>
                            </>
                          ) : (
                            <Button
                              className="w-full bg-[#041F40] hover:bg-[#093568] text-white font-bold py-5 text-base shadow-md"
                              onClick={() => handleOpenFinalQuestionnaire(asg)}
                            >
                              <PlayCircle className="mr-2 h-5 w-5 text-[#D6C799]" />
                              Accéder au questionnaire
                            </Button>
                          )}
                        </div>
                      )}

                      {beforeMission && (
                        <Alert className="bg-blue-50 border-blue-200 text-blue-900">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <AlertTitle className="font-bold text-blue-900">Mission programmée</AlertTitle>
                          <AlertDescription className="text-blue-800">
                            Disponible le {format(plannedDate, "EEEE d MMMM yyyy", { locale: fr })} à partir de : {format(startTime, "HH:mm")}
                          </AlertDescription>
                        </Alert>
                      )}

                      {missionExpired && (
                        <Alert className="bg-rose-50 border-rose-200 text-rose-900">
                          <AlertTriangle className="h-4 w-4 text-rose-600" />
                          <AlertTitle className="font-bold text-rose-900">Créneau expiré</AlertTitle>
                          <AlertDescription className="text-rose-800">
                            Le délai pour réaliser cette mission est dépassé (Date : {format(plannedDate, "d MMMM yyyy", { locale: fr })}).
                            Fenêtre : {isSlotOpen ? "Créneau libre" : `${format(startTime, "HH:mm")} → ${format(endTime, "HH:mm")}`}
                          </AlertDescription>
                        </Alert>
                      )}

                      {isValidDate && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Calendar className="w-4 h-4 text-[#041F40] flex-shrink-0" />
                            <span>
                              Date de visite :{" "}
                              <strong className="text-slate-900 capitalize font-bold">
                                {format(plannedDate, "EEEE d MMMM yyyy", { locale: fr })}
                              </strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700">
                            <Clock className="w-4 h-4 text-[#041F40] flex-shrink-0" />
                            <span>
                              Fenêtre active :{" "}
                              <strong className="text-slate-900 font-bold">
                                {isSlotOpen
                                  ? "Toute la journée (créneau libre)"
                                  : `${format(startTime, "HH:mm")} → ${format(endTime, "HH:mm")} (± ${windowMin} min)`}
                              </strong>
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Alert className="mt-6 bg-white border-slate-200 text-slate-700 shadow-sm rounded-2xl p-6">
                <ClipboardList className="h-5 w-5 text-[#041F40]" />
                <AlertTitle className="text-slate-900 font-bold text-base">
                  Aucune mission assignée
                </AlertTitle>
                <AlertDescription className="text-slate-600 mt-1">
                  Postulez à des missions pour les voir apparaître ici.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-6 mt-6">
            {mySubmittedMissions.length > 0 ? (
              mySubmittedMissions.map((sub) => {
                const hasDocs = Boolean(
                  sub.briefing || sub.scenario || sub.questionnaire,
                );
                return (
                  <Card
                    key={sub.application_id || sub.mission_id}
                    className="overflow-hidden shadow-sm border border-slate-200 border-l-4 border-l-emerald-500 rounded-2xl bg-white"
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3 border-b border-slate-100 bg-slate-50/50">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold text-[#041F40]">
                          {sub.title}
                        </CardTitle>
                        <CardDescription className="space-y-1">
                          <div className="font-semibold text-slate-800 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-500" />
                            {sub.businessName}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {sub.stores?.[0]?.name || sub.location}
                          </div>
                        </CardDescription>
                      </div>
                      <div className="text-right space-y-1.5">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Rapport Soumis
                        </Badge>
                        <div className="text-lg font-extrabold text-emerald-700">
                          {sub.reward} MAD
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="font-medium">
                          Votre questionnaire a été soumis avec succès et est en cours d'évaluation par l'administrateur.
                        </span>
                      </div>

                      {hasDocs && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-slate-800 text-sm">
                            <FileText size={16} className="text-[#041F40]" />
                            Documents de la mission
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {sub.briefing && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDocDownload(
                                    sub.briefing,
                                    "Briefing",
                                    sub.title,
                                  )
                                }
                                className="justify-start border-slate-300 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium"
                              >
                                <Download className="mr-2 h-4 w-4 text-[#041F40]" />
                                Briefing
                              </Button>
                            )}
                            {sub.scenario && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDocDownload(
                                    sub.scenario,
                                    "Scénario",
                                    sub.title,
                                  )
                                }
                                className="justify-start border-slate-300 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium"
                              >
                                <Download className="mr-2 h-4 w-4 text-[#041F40]" />
                                Scénario
                              </Button>
                            )}
                            {sub.questionnaire && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDocDownload(
                                    sub.questionnaire,
                                    "Questionnaire",
                                    sub.title,
                                  )
                                }
                                className="justify-start border-slate-300 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium"
                              >
                                <Download className="mr-2 h-4 w-4 text-[#041F40]" />
                                Questionnaire
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-3 pb-3 border-t border-slate-100 flex justify-end bg-slate-50/50">
                      <Button
                        asChild
                        size="sm"
                        className="bg-[#041F40] hover:bg-[#093568] text-white font-bold shadow-sm"
                      >
                        <Link href="/missions/completed">
                          Consulter mes missions complétées
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <Card className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <CardContent className="space-y-4">
                  <CheckCircle className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-800">
                    Aucun rapport soumis
                  </h3>
                  <p className="text-slate-500 max-w-sm mx-auto text-sm">
                    Lorsque vous aurez rempli et envoyé le questionnaire d'une mission assignée, elle apparaîtra ici.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-4 mt-6">
            {myApplications.length > 0 ? (
              myApplications.map((app) => {
                return (
                  <Card
                    key={app.application_id}
                    className="shadow-sm border border-slate-200 rounded-2xl bg-white hover:shadow-md transition-all p-5"
                  >
                    <CardHeader className="p-0 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-[#041F40]">
                          {app.title}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-800 border-amber-300 font-semibold"
                        >
                          {app.status === "pending"
                            ? "En attente"
                            : app.status === "approved"
                              ? "Approuvée"
                              : "Refusée"}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2 text-slate-600 font-medium mt-1">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        {app.businessName}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0 space-y-3">
                      <p className="text-sm text-slate-600 leading-relaxed">{app.description}</p>

                      {app.stores?.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {app.stores?.map((s) => (
                            <Badge
                              key={s.id}
                              variant="secondary"
                              className="bg-slate-100 text-slate-700 border-slate-200 font-medium"
                            >
                              <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                              {s.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {app.quiz?.length > 0 && (
                        <div className="mt-2 text-xs border border-emerald-200 p-2.5 rounded-xl bg-emerald-50 text-emerald-800">
                          <strong className="flex items-center gap-1.5 font-bold">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Quiz complété : {app.quiz.length} question(s)
                          </strong>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm p-6">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  Vous n'avez envoyé aucune candidature pour le moment.
                </p>
                <Button
                  asChild
                  variant="link"
                  className="mt-2 text-[#041F40] font-bold hover:text-[#093568]"
                >
                  <Link href="/">Voir les missions disponibles →</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="refused" className="space-y-4 mt-6">
            {myRefusedMissions.length > 0 ? (
              myRefusedMissions.map((app) => {
                return (
                  <Card
                    key={app.application_id}
                    className="border border-rose-200 border-l-4 border-l-rose-500 bg-white shadow-sm hover:shadow-md transition-all rounded-2xl p-5"
                  >
                    <CardHeader className="p-0 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-bold text-rose-700">
                            {app.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 text-slate-600 font-medium">
                            <Building2 className="w-4 h-4 text-slate-500" />
                            {app.businessName}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="destructive"
                          className="flex items-center gap-1 shadow-xs bg-rose-50 text-rose-700 border-rose-200 font-semibold"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Refusée
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0 space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed">{app.description}</p>

                      {app.refusal_reason && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-1">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                                Motif du refus
                              </h4>
                              <p className="text-sm text-rose-900 mt-1 whitespace-pre-wrap font-medium">
                                {app.refusal_reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {app.stores?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 mb-2">
                            Magasins concernés :
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {app.stores?.map((s) => (
                              <Badge
                                key={s.id}
                                variant="secondary"
                                className="bg-slate-100 text-slate-700 border-slate-200 font-medium"
                              >
                                <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                                {s.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Candidature soumise le :{" "}
                        {format(new Date(app.applied_at), "PPP", { locale: fr })}
                      </div>

                      <Button
                        variant="outline"
                        className="mt-2 w-full border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                        onClick={() => {
                          router.push(`/missions/${app.mission_id}/details`);
                        }}
                      >
                        <Info className="mr-2 h-4 w-4" />
                        Voir les détails de la mission
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm p-6">
                <XCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  Aucune mission refusée pour le moment.
                </p>
                <Button
                  asChild
                  variant="link"
                  className="mt-2 text-[#041F40] font-bold hover:text-[#093568]"
                >
                  <Link href="/">Voir les missions disponibles →</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quiz de connaissances */}
        {activeQuiz && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-lg shadow-2xl border-slate-200 bg-white rounded-2xl">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-[#041F40] text-xl font-bold">
                  Quiz de connaissances
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Validez que vous avez bien lu le briefing et le scénario.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-900">
                    Le passage en caisse est-il obligatoire pour cette mission ?
                  </Label>
                  <RadioGroup defaultValue="oui" onValueChange={() => {}} className="space-y-2">
                    <div className="flex items-center space-x-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
                      <RadioGroupItem
                        value="oui"
                        id="r-oui"
                        className="data-[state=checked]:bg-[#041F40] data-[state=checked]:border-[#041F40]"
                      />
                      <Label
                        htmlFor="r-oui"
                        className="flex-grow cursor-pointer font-medium text-slate-800 text-sm"
                      >
                        Vrai (Oui)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
                      <RadioGroupItem
                        value="non"
                        id="r-non"
                        className="data-[state=checked]:bg-[#041F40] data-[state=checked]:border-[#041F40]"
                      />
                      <Label
                        htmlFor="r-non"
                        className="flex-grow cursor-pointer font-medium text-slate-800 text-sm"
                      >
                        Faux (Non)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-slate-100 pt-4 bg-slate-50/50">
                <Button
                  variant="ghost"
                  onClick={() => setActiveQuiz(null)}
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  Fermer
                </Button>
                <Button
                  onClick={() => handleQuizSuccess(activeQuiz)}
                  className="bg-[#041F40] hover:bg-[#093568] text-white px-8 font-semibold shadow-md"
                >
                  Valider
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Quiz de reconnaissance */}
        {recognitionQuizOpen && (
          <RecognitionQuizModal
            missionId={selectedMissionId}
            onClose={() => {
              setRecognitionQuizOpen(false);
              setSelectedMissionId(null);
            }}
            onSuccess={handleRecognitionQuizSuccess}
          />
        )}
      </div>
    </div>
  );
}
