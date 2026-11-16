"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Info,
  Send,
  Search,
  Navigation,
  CheckCircle2,
  Store,
  ClipboardCheck,
  ArrowRight,
  HelpCircle,
  Upload,
  Square,
  Mic,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fetchMissions, postMissions } from "@/services/fetchData";
import { useAuth } from "@/context/auth-context";

const STEPS = [
  { id: "details", label: "Détails", icon: Info },
  { id: "store", label: "Magasins", icon: Store },
  { id: "quiz", label: "Profil", icon: ClipboardCheck },
];

export default function MissionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const missionId = params.missionId;
  const { user } = useAuth();

  const [mission, setMission] = useState(null);
  const [storesMission, setStores] = useState([]);
  const [profileQuiz, setProfileQuiz] = useState([]);
  const [step, setStep] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  const [selectedStoreIds, setSelectedStoreIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [quizAnswers, setQuizAnswers] = useState({});
  const [isRecording, setIsRecording] = useState(false);

  const getMissionsDetails = async () => {
    const [missions, storesMission, quizData] = await Promise.allSettled([
      fetchMissions(
        "missions" + missionId,
        process.env.NEXT_PUBLIC_API_URL + "missions/" + missionId,
      ),
      fetchMissions(
        "stores" + missionId,
        process.env.NEXT_PUBLIC_API_URL + "stores/" + missionId,
      ),
      fetchMissions(
        "quiz" + missionId,
        process.env.NEXT_PUBLIC_API_URL + "quizQuestions/" + missionId,
      ),
    ]);
    const getDataFromResult = (result) => {
      return result.status === "fulfilled" ? result.value || [] : [];
    };

    const ValidMissions = getDataFromResult(missions);
    const ValidStores = getDataFromResult(storesMission);
    const ValidQuizData = getDataFromResult(quizData);
    console.log("Fetched mission details:", ValidMissions);
    console.log("Fetched stores for mission:", ValidStores);
    console.log("Fetched quiz data for mission:", ValidQuizData);
    setMission(ValidMissions);
    setStores(ValidStores);
    setProfileQuiz(ValidQuizData);
    setIsLoading(false);
  };

  useEffect(() => {
    getMissionsDetails();
  }, [missionId]);

  const filteredStores = useMemo(() => {
    if (!mission) return [];
    let stores = storesMission.filter(
      (s) => String(s.mission_id) === String(missionId) && s.active,
    );
    if (searchTerm) {
      stores = stores.filter(
        (s) =>
          s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return stores;
  }, [mission, searchTerm, missionId]);

  const toggleStoreSelection = (storeId) => {
    setSelectedStoreIds((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId],
    );
  };

  const isQuizComplete = useMemo(() => {
    if (!profileQuiz || profileQuiz.length === 0) return true;

    const requiredQuestions = profileQuiz.filter((q) => q.is_required === 1);

    if (requiredQuestions.length === 0) return true;

    for (const question of requiredQuestions) {
      const answer = quizAnswers[question.id];

      if (question.type === "section_header" || question.type === "info_text")
        continue;

      if (!answer) return false;

      if (question.type === "checkboxes") {
        if (!Array.isArray(answer) || answer.length === 0) return false;
      }

      if (question.type === "text") {
        if (typeof answer === "string" && answer.trim() === "") return false;
      }
    }

    return true;
  }, [profileQuiz, quizAnswers]);

  const formatQuizAnswers = () => {
    const formattedAnswers = profileQuiz
      .filter((q) => q.type !== "section_header" && q.type !== "info_text")
      .map((q) => {
        const answer = quizAnswers[q.id];
        return {
          question_id: q.id,
          question_text: q.text,
          type: q.type,
          response: answer || null,
        };
      })
      .filter((q) => q.response !== null);

    return formattedAnswers;
  };

  const handleApply = async () => {
    console.log("user id:", user?.id);
    if (mission?.has_applied) {
      toast({
        variant: "destructive",
        title: "Candidature déjà existante",
        description:
          "Vous avez déjà postulé à cette mission. Les candidatures sont limitées à une seule.",
      });
      return;
    }

    if (selectedStoreIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner au moins un magasin.",
      });
      return;
    }

    if (!isQuizComplete) {
      toast({
        variant: "destructive",
        title: "Quiz incomplet",
        description:
          "Veuillez répondre à toutes les questions obligatoires du quiz.",
      });
      return;
    }

    setIsApplying(true);
    try {
      const formattedQuiz = formatQuizAnswers();
      const submissionData = {
        mission_id: parseInt(missionId),
        user_id: parseInt(user?.id),
        status: "pending",
        stores: JSON.stringify(selectedStoreIds),
        quiz: JSON.stringify(formattedQuiz),
      };

      console.log("Submission Data:", JSON.stringify(submissionData, null, 2));

      const result = await postMissions(
        process.env.NEXT_PUBLIC_API_URL + "applications",
        submissionData,
        "applications",
        process.env.NEXT_PUBLIC_API_URL + "applications",
      );

      if (result.success) {
        toast({
          title: "Candidature Envoyée !",
          description:
            "Votre profil est en cours de validation pour " +
            selectedStoreIds.length +
            " magasin(s).",
          variant: "default",
        });
        router.push("/missions/assigned");
      }
    } catch (e) {
      console.error("Submission error:", e);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer votre candidature.",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleQuizInputChange = (questionId, value) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId, optionText, isChecked) => {
    setQuizAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isChecked) {
        return { ...prev, [questionId]: [...current, optionText] };
      } else {
        return {
          ...prev,
          [questionId]: current.filter((t) => t !== optionText),
        };
      }
    });
  };

  const handleImageUpload = (questionId, files) => {
    console.log("Image upload:", questionId, files);
  };

  const removeImage = (questionId, index) => {
    console.log("Remove image:", questionId, index);
  };

  const captureGPS = (questionId) => {
    console.log("Capture GPS:", questionId);
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: { lat: 33.5731, lng: -7.5898 },
    }));
  };

  const toggleRecording = (questionId) => {
    setIsRecording(!isRecording);
    console.log("Toggle recording:", questionId);
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);
  const hasApplied = Boolean(mission?.has_applied);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 bg-slate-50/90 min-h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-[#041F40]" />
        <p className="text-slate-600 font-semibold animate-pulse">Chargement de la mission...</p>
      </div>
    );

  if (!mission)
    return (
      <div className="container mx-auto py-20 text-center bg-slate-50/90 min-h-screen">
        <h2 className="text-2xl font-bold text-slate-900">Mission non trouvée</h2>
        <Button
          variant="outline"
          className="mt-6 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
          asChild
        >
          <Link href="/">Retour aux missions</Link>
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 py-4 sm:py-8 px-3 sm:px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (step === "details") router.push("/");
              else if (step === "store") setStep("details");
              else if (step === "quiz") setStep("store");
            }}
            className="text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-[#041F40]" />
            {step === "details" ? "Missions" : "Précédent"}
          </Button>
          <Badge
            variant="outline"
            className="bg-white text-[#041F40] border-slate-300 shadow-xs font-semibold px-3 py-1"
          >
            {mission.category}
          </Badge>
        </div>

        {hasApplied && (
          <Alert className="mb-8 bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm rounded-2xl p-5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <AlertTitle className="text-slate-900 font-bold text-base flex items-center justify-between">
              <span>Vous avez déjà postulé à cette mission</span>
              <Badge className="bg-emerald-600 text-white font-semibold text-xs">
                ✓ Déjà postulé
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-slate-700 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>
                Les shoppers ne peuvent postuler qu'une seule fois par mission.
                Votre candidature est déjà enregistrée.
              </span>
              <Button
                size="sm"
                onClick={() => router.push("/missions/assigned")}
                className="bg-[#041F40] hover:bg-[#093568] text-white font-bold text-xs whitespace-nowrap shadow-sm"
              >
                Voir dans « Missions assignées » →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8 px-4">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-[#041F40] -z-10 -translate-y-1/2 transition-all duration-500"
              style={{
                width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
              }}
            />
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-xs",
                    step === s.id || idx < currentStepIndex
                      ? "bg-[#041F40] border-[#041F40] text-white"
                      : "border-slate-300 text-slate-500 bg-white",
                  )}
                >
                  {idx < currentStepIndex ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <s.icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-bold",
                    step === s.id ? "text-[#041F40]" : "text-slate-500",
                  )}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-sm border border-slate-200 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-6 sm:p-7">
            <CardTitle className="text-xl sm:text-2xl font-black text-[#041F40]">
              {mission.title}
            </CardTitle>
            <CardDescription className="font-semibold text-slate-600 text-sm mt-1">
              {mission.businessName}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {step === "details" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-[#041F40] mt-0.5 shadow-xs">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Profil recherché</h3>
                        <p className="text-sm text-slate-600 font-medium">
                          {mission.soughtProfile || "Tout profil"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-[#041F40] mt-0.5 shadow-xs">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Lieu</h3>
                        <p className="text-sm text-slate-600 font-medium">
                          {mission.location}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 mt-0.5 shadow-xs border border-emerald-200">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Rémunération</h3>
                        <p className="text-lg font-black text-emerald-700">
                          {mission.reward} MAD
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-[#041F40] mt-0.5 shadow-xs">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Date limite</h3>
                        <p className="text-sm text-slate-600 font-medium">
                          {format(new Date(mission.deadline), "PP")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator className="bg-slate-200" />
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2 text-slate-900 text-sm">
                    <Info className="w-4 h-4 text-[#041F40]" /> Résumé de la mission
                  </h3>
                  <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 italic font-medium leading-relaxed">
                    "{mission.description}"
                  </p>
                </div>
              </div>
            )}

          {step === "store" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#041F40] flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#041F40]" /> Sélectionnez vos magasins
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-800 border-amber-300 font-bold"
                >
                  {selectedStoreIds.length} sélectionné(s)
                </Badge>
              </div>
              <Input
                placeholder="Rechercher une ville ou un magasin..."
                className="pl-4 h-11 border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#041F40] shadow-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredStores.length > 0 ? (
                  filteredStores.map((store) => {
                    const isSelected = selectedStoreIds.includes(store.id);
                    return (
                      <div
                        key={store.id}
                        onClick={() => toggleStoreSelection(store.id)}
                        className={cn(
                          "p-4 border rounded-xl cursor-pointer flex items-center justify-between group transition-all",
                          isSelected
                            ? "border-[#041F40] bg-slate-50 ring-2 ring-[#041F40]"
                            : "hover:bg-slate-50/70 border-slate-200 bg-white",
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={isSelected}
                            className="rounded-full data-[state=checked]:bg-[#041F40] data-[state=checked]:border-[#041F40]"
                            onCheckedChange={() =>
                              toggleStoreSelection(store.id)
                            }
                          />
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center shadow-xs",
                              isSelected
                                ? "bg-[#041F40] text-white"
                                : "bg-slate-100 text-slate-600",
                            )}
                          >
                            <Store className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {store.name}
                            </div>
                            <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-slate-400" /> {store.city}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-[#041F40]" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-slate-500 py-12 font-medium">
                    Aucun magasin trouvé.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === "quiz" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#041F40] flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-[#041F40]" /> Quiz de qualification
                </h3>
                <Badge
                  variant={isQuizComplete ? "default" : "destructive"}
                  className={
                    isQuizComplete
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                      : "bg-rose-50 text-rose-800 border-rose-300 font-bold"
                  }
                >
                  {isQuizComplete ? "✅ Complet" : "⏳ Incomplet"}
                </Badge>
              </div>
              <div className="space-y-6">
                {profileQuiz?.map((q, idx) => {
                  const options = q.options_json
                    ? JSON.parse(q.options_json)
                    : [];

                  if (q.type === "section_header") {
                    return (
                      <div key={q.id} className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-6 text-base font-bold text-[#041F40]">
                            {q.text}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (q.type === "info_text") {
                    return (
                      <div
                        key={q.id}
                        className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-blue-900"
                      >
                        <p className="text-sm font-medium">{q.text}</p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "space-y-4 p-5 rounded-2xl border transition-all",
                        q.is_required === 1 && !quizAnswers[q.id]
                          ? "border-amber-300 bg-amber-50/40"
                          : "bg-slate-50/60 border-slate-200",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#041F40] text-white text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <Label className="text-sm font-bold leading-tight text-slate-900">
                            {q.text}
                          </Label>
                          {q.is_required === 1 && (
                            <span className="ml-1.5 text-rose-600 text-sm font-bold">*</span>
                          )}
                          {q.is_required === 1 && !quizAnswers[q.id] && (
                            <span className="ml-2 text-xs text-amber-700 font-semibold">
                              (Réponse requise)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pl-9">
                        {q.type === "text" && (
                          <Input
                            placeholder="Votre réponse..."
                            value={quizAnswers[q.id] || ""}
                            onChange={(e) =>
                              handleQuizInputChange(q.id, e.target.value)
                            }
                            className={cn(
                              "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#041F40] shadow-xs",
                              q.is_required === 1 &&
                                !quizAnswers[q.id] &&
                                "border-amber-400",
                            )}
                          />
                        )}

                        {q.type === "multiple_choice" && (
                          <RadioGroup
                            value={quizAnswers[q.id] || ""}
                            onValueChange={(val) =>
                              handleQuizInputChange(q.id, val)
                            }
                            className="space-y-2"
                          >
                            {options.map((opt) => (
                              <div
                                key={opt.id}
                                className={cn(
                                  "flex items-center space-x-3 bg-white p-3 rounded-xl border transition-colors cursor-pointer",
                                  quizAnswers[q.id] === opt.text
                                    ? "border-[#041F40] bg-slate-50 ring-1 ring-[#041F40]"
                                    : "border-slate-200 hover:bg-slate-50/80",
                                )}
                                onClick={() =>
                                  handleQuizInputChange(q.id, opt.text)
                                }
                              >
                                <RadioGroupItem
                                  value={opt.text}
                                  id={`${q.id}-${opt.id}`}
                                  checked={quizAnswers[q.id] === opt.text}
                                  className="data-[state=checked]:bg-[#041F40] data-[state=checked]:border-[#041F40]"
                                />
                                <Label
                                  htmlFor={`${q.id}-${opt.id}`}
                                  className="cursor-pointer flex-grow font-semibold text-slate-800 text-sm"
                                >
                                  {opt.text}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {q.type === "checkboxes" && (
                          <div className="space-y-2">
                            {options.map((opt) => {
                              const currentAnswers = quizAnswers[q.id] || [];
                              const isChecked = Array.isArray(currentAnswers)
                                ? currentAnswers.includes(opt.text)
                                : false;

                              return (
                                <div
                                  key={opt.id}
                                  className={cn(
                                    "flex items-center space-x-3 bg-white p-3 rounded-xl border transition-colors cursor-pointer",
                                    isChecked
                                      ? "border-[#041F40] bg-slate-50 ring-1 ring-[#041F40]"
                                      : "border-slate-200 hover:bg-slate-50/80",
                                  )}
                                  onClick={() =>
                                    handleCheckboxChange(
                                      q.id,
                                      opt.text,
                                      !isChecked,
                                    )
                                  }
                                >
                                  <Checkbox
                                    id={`${q.id}-${opt.id}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) =>
                                      handleCheckboxChange(
                                        q.id,
                                        opt.text,
                                        checked,
                                      )
                                    }
                                    className="data-[state=checked]:bg-[#041F40] data-[state=checked]:border-[#041F40]"
                                  />
                                  <Label
                                    htmlFor={`${q.id}-${opt.id}`}
                                    className="cursor-pointer flex-grow font-semibold text-slate-800 text-sm"
                                  >
                                    {opt.text}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.type === "rating" && (
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs font-semibold text-slate-500 px-1">
                              <span>{q.min_label || "Pas satisfait"}</span>
                              <span>{q.max_label || "Très satisfait"}</span>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {Array.from(
                                { length: q.max_rating || 5 },
                                (_, i) => i + 1,
                              ).map((rating) => (
                                <button
                                  key={rating}
                                  onClick={() =>
                                    handleQuizInputChange(q.id, rating)
                                  }
                                  className={`w-11 h-11 rounded-xl border-2 transition-all font-bold text-sm ${
                                    quizAnswers[q.id] === rating
                                      ? "border-[#041F40] bg-[#041F40] text-white shadow-sm scale-105"
                                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                                  }`}
                                >
                                  {rating}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {q.type === "image_upload" && (
                          <div className="space-y-3">
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-slate-400 transition-colors cursor-pointer bg-white">
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="w-7 h-7 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-700">
                                  Cliquez pour télécharger des images
                                </p>
                                {q.max_images && (
                                  <p className="text-xs text-slate-500 font-medium">
                                    Maximum {q.max_images} image
                                    {q.max_images > 1 ? "s" : ""}
                                  </p>
                                )}
                              </div>
                              <Input
                                type="file"
                                accept="image/*"
                                multiple={q.allow_multiple === 1}
                                className="hidden"
                                onChange={(e) =>
                                  handleImageUpload(q.id, e.target.files)
                                }
                              />
                            </div>
                          </div>
                        )}

                        {q.type === "gps_capture" && (
                          <div className="space-y-3">
                            <Button
                              onClick={() => captureGPS(q.id)}
                              className="w-full border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-semibold"
                              variant="outline"
                            >
                              <MapPin className="w-4 h-4 mr-2 text-[#041F40]" />
                              {quizAnswers[q.id]
                                ? "Recapturer la position"
                                : "Capturer la position GPS"}
                            </Button>
                            {quizAnswers[q.id] && (
                              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                                <p className="text-xs font-mono font-bold text-emerald-800">
                                  📍 {quizAnswers[q.id].lat},{" "}
                                  {quizAnswers[q.id].lng}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {q.type === "audio_recording" && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-4">
                              <Button
                                onClick={() => toggleRecording(q.id)}
                                variant={
                                  isRecording ? "destructive" : "outline"
                                }
                                className={
                                  isRecording
                                    ? "bg-red-600 hover:bg-red-700 text-white font-bold"
                                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-semibold"
                                }
                              >
                                {isRecording ? (
                                  <>
                                    <Square className="w-4 h-4 mr-2" />
                                    Arrêter l'enregistrement
                                  </>
                                ) : (
                                  <>
                                    <Mic className="w-4 h-4 mr-2 text-[#041F40]" />
                                    {quizAnswers[q.id]
                                      ? "Ré-enregistrer"
                                      : "Enregistrer l'audio"}
                                  </>
                                )}
                              </Button>
                              {q.max_duration_seconds && (
                                <span className="text-xs text-slate-500 font-medium">
                                  Max: {q.max_duration_seconds}s
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50/80 p-6 sm:p-8 border-t border-slate-100">
          {hasApplied ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                disabled
                className="h-12 flex-1 text-base font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-not-allowed opacity-90 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Déjà postulé
              </Button>
              <Button
                onClick={() => router.push("/missions/assigned")}
                className="h-12 flex-1 text-base font-bold bg-[#041F40] hover:bg-[#093568] text-white shadow-md"
              >
                Voir dans « Missions assignées » →
              </Button>
            </div>
          ) : step === "details" ? (
            <Button
              onClick={() => setStep("store")}
              className="w-full h-12 text-base font-bold bg-[#041F40] hover:bg-[#093568] text-white shadow-md hover:shadow-lg transition-all"
            >
              Se positionner sur cette mission <ArrowRight className="ml-2 h-5 w-5 text-[#D6C799]" />
            </Button>
          ) : step === "store" ? (
            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                onClick={() => setStep("details")}
                className="h-12 flex-1 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-semibold"
              >
                Retour
              </Button>
              <Button
                onClick={() => setStep("quiz")}
                disabled={selectedStoreIds.length === 0}
                className="h-12 flex-[2] text-base font-bold bg-[#041F40] hover:bg-[#093568] text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer ({selectedStoreIds.length} magasin{selectedStoreIds.length > 1 ? "s" : ""})
              </Button>
            </div>
          ) : (
            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                onClick={() => setStep("store")}
                className="h-12 flex-1 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-semibold"
              >
                Retour
              </Button>
              <Button
                onClick={handleApply}
                disabled={isApplying || !isQuizComplete}
                className="h-12 flex-[2] text-base font-bold bg-[#041F40] hover:bg-[#093568] text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplying ? (
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                ) : (
                  <Send className="mr-2 h-5 w-5 text-[#D6C799]" />
                )}
                Envoyer ma candidature
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  </div>
  );
}
