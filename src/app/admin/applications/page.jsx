"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  UserCheck,
  Building,
  Clock,
  AlertCircle,
  ClipboardCheck,
  Info,
  XCircle,
  Store,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronRight,
  Mail,
  MapPin,
  Calendar,
  Users,
  FileText,
  ShoppingBag,
  Search,
  Filter,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import DataPagination from "@/components/ui/data-pagination";
import axios from "axios";

// Configuration axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

// Token interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const cachData = localStorage.getItem("missionViewAuth");
      const parsedCacheData = cachData ? JSON.parse(cachData) : null;
      const token = parsedCacheData?.token;
      if (token) {
        config.headers["x-auth-token"] = token;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default function AdminApplicationsPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [stores, setStores] = useState([]);
  const [missions, setMissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);
  const [expandedQuiz, setExpandedQuiz] = useState(null);

  // Filtres et Recherche
  const searchParams = useSearchParams();
  const [selectedMissionId, setSelectedMissionId] = useState(
    searchParams?.get("missionId") || "",
  );

  useEffect(() => {
    const mId = searchParams?.get("missionId");
    if (mId) setSelectedMissionId(mId);
  }, [searchParams]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Approval Dialog State
  const [appToApprove, setAppToApprove] = useState(null);
  const [plannedDate, setPlannedDate] = useState("");
  const [plannedTime, setPlannedTime] = useState("14:00");
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);
  const [timeWindow, setTimeWindow] = useState("60");
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // Refusal Dialog State
  const [appToRefuse, setAppToRefuse] = useState(null);
  const [refusalReason, setRefusalReason] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Parser robuste pour normaliser une application
  const normalizeApp = (app) => {
    let storeIds = [];
    try {
      if (Array.isArray(app.stores)) {
        storeIds = app.stores;
      } else if (typeof app.stores === "string") {
        storeIds = JSON.parse(app.stores);
      }
      if (!Array.isArray(storeIds)) storeIds = [];
    } catch (e) {
      storeIds = [];
    }

    let quizData = [];
    try {
      if (Array.isArray(app.quiz)) {
        quizData = app.quiz;
      } else if (typeof app.quiz === "string") {
        quizData = JSON.parse(app.quiz);
      }
      if (!Array.isArray(quizData)) quizData = [];
    } catch (e) {
      quizData = [];
    }

    const quizAnswers = {};
    quizData.forEach((item) => {
      if (item.question_id && item.response !== undefined) {
        quizAnswers[item.question_id] = {
          question_text:
            item.question_text || `Question ${item.question_id}`,
          response: item.response,
          type: item.type || "text",
        };
      }
    });

    return {
      ...app,
      storeIds,
      quizAnswers,
      quizData,
      hasQuiz: quizData.length > 0,
    };
  };

  // Compteurs par statut (tenant compte du filtre mission éventuel)
  const statusCounts = React.useMemo(() => {
    const list = selectedMissionId
      ? applications.filter(
          (a) => String(a.mission_id) === String(selectedMissionId),
        )
      : applications;
    return {
      all: list.length,
      pending: list.filter((a) => a.status === "pending").length,
      approved: list.filter((a) => a.status === "approved").length,
      submitted: list.filter((a) => a.status === "submitted").length,
      refused: list.filter((a) => a.status === "refused").length,
    };
  }, [applications, selectedMissionId]);

  // Candidatures filtrées
  const filteredApplications = React.useMemo(() => {
    return applications.filter((app) => {
      // 0. Filtre par mission
      if (
        selectedMissionId &&
        String(app.mission_id) !== String(selectedMissionId)
      ) {
        return false;
      }

      // 1. Filtre de statut
      if (statusFilter !== "all" && app.status !== statusFilter) {
        return false;
      }

      // 2. Recherche textuelle
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();

      const userName = (app.user_name || "").toLowerCase();
      const userEmail = (app.email || "").toLowerCase();
      const missionTitle = (app.mission_title || "").toLowerCase();
      const requestedStoresMatch = stores
        .filter((s) => app.storeIds?.includes(s.id))
        .some(
          (s) =>
            s.name?.toLowerCase().includes(term) ||
            s.city?.toLowerCase().includes(term)
        );

      return (
        userName.includes(term) ||
        userEmail.includes(term) ||
        missionTitle.includes(term) ||
        requestedStoresMatch
      );
    });
  }, [applications, statusFilter, searchTerm, stores, selectedMissionId]);

  // Réinitialiser la pagination lors d'un changement de filtre
  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, selectedMissionId]);

  const paginatedApplications = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(start, start + itemsPerPage);
  }, [filteredApplications, currentPage, itemsPerPage]);

  // Charger toutes les candidatures et données associées
  const refreshApplications = async () => {
    try {
      const appsRes = await api.get("/applications");
      const rawApps = Array.isArray(appsRes.data)
        ? appsRes.data
        : appsRes.data?.applications || [];
      setApplications(rawApps.map(normalizeApp));
    } catch (error) {
      console.error("Error refreshing applications:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [appsRes, storesRes, missionsRes, usersRes] = await Promise.all([
          api.get("/applications"),
          api.get("/stores/missions"),
          api.get("/missions/admin/all"),
          api.get("/users"),
        ]);

        const rawApps = Array.isArray(appsRes.data)
          ? appsRes.data
          : appsRes.data?.applications || [];

        const allStores = Array.isArray(storesRes.data) ? storesRes.data : [];
        const allMissions = Array.isArray(missionsRes.data) ? missionsRes.data : [];
        const allUsers = Array.isArray(usersRes.data) ? usersRes.data : [];

        setApplications(rawApps.map(normalizeApp));
        setStores(allStores);
        setMissions(allMissions);
        setUsers(allUsers);
      } catch (error) {
        console.error("❌ Erreur lors du chargement:", error);
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description:
            error.response?.data?.message ||
            "Impossible de charger les données. Veuillez réessayer.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const toggleStore = (id) => {
    setSelectedStoreIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleAllStores = (allStoreIds) => {
    if (selectedStoreIds.length === allStoreIds.length) {
      setSelectedStoreIds([]);
    } else {
      setSelectedStoreIds(allStoreIds);
    }
  };

  const toggleQuestionExpand = (index) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Fonction pour approuver une application
  const handleApprove = async () => {
    if (!appToApprove) return;

    setIsProcessing(appToApprove.id);

    try {
      if (selectedStoreIds.length === 0) {
        const response = await api.patch(
          `applications/validate/${appToApprove.id}`,
          {
            status: "refused",
            refusal_reason: "Aucun magasin sélectionné pour la mission",
          },
        );

        if (response.data.success) {
          toast({
            variant: "destructive",
            title: "❌ Candidature refusée",
            description:
              "Aucun magasin sélectionné. La candidature a été refusée automatiquement.",
          });
          await refreshApplications();
          setAppToApprove(null);
          setSelectedStoreIds([]);
        }
        return;
      }

      const [hours, minutes] = plannedTime.split(":");
      const finalDate = new Date(plannedDate);
      finalDate.setHours(parseInt(hours), parseInt(minutes));

      const response = await api.patch(
        `applications/validate/${appToApprove.id}`,
        {
          selectedStores: selectedStoreIds,
          status: "approved",
        },
      );

      if (response.data.success) {
        await api.patch(`applications/patch/${appToApprove.id}`, {
          mission_date: finalDate.toISOString(),
          time_slot: timeWindow,
        });

        toast({
          title: "✅ Candidature validée",
          description: `${selectedStoreIds.length} magasin(s) assigné(s) avec succès.`,
        });

        await refreshApplications();
        setAppToApprove(null);
        setSelectedStoreIds([]);
      }
    } catch (error) {
      console.error("Error processing application:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error.response?.data?.message ||
          "Impossible de traiter la candidature.",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRefuse = async () => {
    if (!appToRefuse) return;

    if (!refusalReason.trim()) {
      toast({
        variant: "destructive",
        title: "Motif requis",
        description: "Veuillez fournir une raison pour le refus.",
      });
      return;
    }

    setIsProcessing(appToRefuse.id);

    try {
      const response = await api.patch(
        `applications/validate/${appToRefuse.id}`,
        {
          status: "refused",
          refusal_reason: refusalReason,
        },
      );

      if (response.data.success) {
        toast({
          variant: "destructive",
          title: "❌ Candidature refusée",
          description: "Le shopper a été notifié.",
        });

        await refreshApplications();
        setAppToRefuse(null);
        setRefusalReason("");
      }
    } catch (error) {
      console.error("Error refusing application:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error.response?.data?.message ||
          "Impossible de refuser la candidature.",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRemoveStore = async (applicationId, storeId) => {
    try {
      const response = await api.patch(
        `applications/remove-store/${applicationId}`,
        {
          storeId: storeId,
        },
      );

      if (response.data.success) {
        toast({
          title: "Magasin retiré",
          description: "Le magasin a été retiré de la candidature.",
        });
        await refreshApplications();
      }
    } catch (error) {
      console.error("Error removing store:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error.response?.data?.message || "Impossible de retirer le magasin.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#041F40] flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#041F40]" />
            Gestion des Candidatures Shoppers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Qualifiez les candidatures, assignez les magasins et suivez l'avancement des visites.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
            Total : {applications.length}
          </Badge>
          {statusCounts.pending > 0 ? (
            <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-xs font-semibold px-3 py-1 animate-pulse">
              {statusCounts.pending} à valider
            </Badge>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-semibold px-3 py-1">
              ✓ Toutes traitées
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshApplications}
            disabled={isLoading}
            className="gap-2 ml-2"
          >
            <Loader2 className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* Bannière de filtrage contextuel par mission */}
      {selectedMissionId && (
        <div className="flex items-center justify-between p-3 px-4 bg-blue-50/90 border border-blue-200 rounded-xl text-xs text-blue-950 shadow-xs">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              Candidatures filtrées pour la mission :{" "}
              <strong>
                {missions.find(
                  (m) => String(m.id) === String(selectedMissionId),
                )?.title || `Mission #${selectedMissionId}`}
              </strong>{" "}
              ({statusCounts.all} postulant{statusCounts.all > 1 ? "s" : ""})
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-100"
            onClick={() => setSelectedMissionId("")}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Afficher toutes les missions
          </Button>
        </div>
      )}

      {/* 2. Filtres par Statut et Recherche */}
      <Card className="shadow-sm border">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Onglets Filtres Statut */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                className={`text-xs h-8 ${
                  statusFilter === "all"
                    ? "bg-[#041F40] text-white hover:bg-[#041F40]/90"
                    : "text-slate-700"
                }`}
              >
                Toutes ({statusCounts.all})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
                className={`text-xs h-8 ${
                  statusFilter === "pending"
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "text-slate-700"
                }`}
              >
                En attente ({statusCounts.pending})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "approved" ? "default" : "outline"}
                onClick={() => setStatusFilter("approved")}
                className={`text-xs h-8 ${
                  statusFilter === "approved"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "text-slate-700"
                }`}
              >
                Approuvées ({statusCounts.approved})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "submitted" ? "default" : "outline"}
                onClick={() => setStatusFilter("submitted")}
                className={`text-xs h-8 ${
                  statusFilter === "submitted"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-slate-700"
                }`}
              >
                Rapports Soumis ({statusCounts.submitted})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "refused" ? "default" : "outline"}
                onClick={() => setStatusFilter("refused")}
                className={`text-xs h-8 ${
                  statusFilter === "refused"
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "text-slate-700"
                }`}
              >
                Refusées ({statusCounts.refused})
              </Button>
            </div>

            {/* Barre de Recherche */}
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher shopper, mission, magasin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Liste des Candidatures */}
      <Card className="shadow-sm border overflow-hidden">
        <CardContent className="p-0">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Store className="w-16 h-16 mx-auto mb-4 opacity-30 text-[#041F40]" />
              <p className="text-lg font-bold text-slate-800">
                {searchTerm || statusFilter !== "all"
                  ? "Aucune candidature ne correspond à vos critères"
                  : "Aucune candidature enregistrée"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchTerm || statusFilter !== "all"
                  ? "Essayez de modifier votre recherche ou de réinitialiser les filtres."
                  : "Les nouvelles candidatures soumises par les shoppers apparaîtront ici."}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchTerm("");
                  }}
                  className="mt-4 text-xs"
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden p-4 space-y-4">
                {paginatedApplications.map((app) => {
                  const mission = missions.find(
                    (m) => String(m.id) === String(app.mission_id),
                  );
                  const user = users.find(
                    (u) => String(u.id) === String(app.user_id),
                  );
                  const requestedStores = stores.filter((s) =>
                    app.storeIds?.includes(s.id),
                  );
                  const hasQuiz =
                    app.hasQuiz && Object.keys(app.quizAnswers).length > 0;
                  const isQuizExpanded = expandedQuiz === app.id;

                  return (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/10">
                            <AvatarImage src={app.profile_pic_url || user?.profilePicUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-bold">
                              {(app.user_name || user?.name || "U")?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm truncate">
                              {app.user_name || user?.name || "Utilisateur inconnu"}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                {app.email || user?.email || "Email non disponible"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Badge de statut */}
                        <div>
                          {app.status === "pending" && (
                            <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-semibold text-[11px]">
                              ⏳ En attente
                            </Badge>
                          )}
                          {app.status === "approved" && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold text-[11px]">
                              ✅ Approuvée
                            </Badge>
                          )}
                          {app.status === "submitted" && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-semibold text-[11px]">
                              📝 Rapport Soumis
                            </Badge>
                          )}
                          {app.status === "refused" && (
                            <Badge variant="destructive" className="font-semibold text-[11px]">
                              ❌ Refusée
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/40 text-xs space-y-1">
                        <div className="font-medium text-primary flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {app.mission_title || mission?.title || "Mission inconnue"}
                          </span>
                        </div>
                        {mission?.city && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span>{mission.city}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground">
                          Magasins demandés:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {requestedStores.length > 0 ? (
                            requestedStores.map((s) => (
                              <Badge
                                key={s.id}
                                variant="secondary"
                                className="text-[11px] py-1 px-2 flex items-center gap-1"
                              >
                                <Building className="w-3 h-3" />
                                <span>
                                  {s.name} ({s.city})
                                </span>
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Aucun magasin demandé
                            </span>
                          )}
                        </div>
                      </div>

                      {hasQuiz && (
                        <div className="text-xs">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              Quiz ({Object.keys(app.quizAnswers).length}{" "}
                              réponses)
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() =>
                                setExpandedQuiz(isQuizExpanded ? null : app.id)
                              }
                            >
                              {isQuizExpanded ? "Masquer" : "Voir réponses"}
                            </Button>
                          </div>
                          {isQuizExpanded && (
                            <div className="mt-2 space-y-2 p-3 bg-muted/30 rounded-lg border max-h-[180px] overflow-y-auto">
                              {Object.entries(app.quizAnswers).map(
                                ([qid, data]) => (
                                  <div key={qid} className="text-xs">
                                    <div className="font-medium text-muted-foreground">
                                      {data.question_text}
                                    </div>
                                    <div className="mt-0.5 text-foreground font-medium">
                                      {Array.isArray(data.response)
                                        ? data.response.join(", ")
                                        : String(data.response)}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-2 border-t">
                        {app.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3"
                              onClick={() => setAppToRefuse(app)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Refuser
                            </Button>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-4"
                              onClick={() => {
                                setAppToApprove(app);
                                setSelectedStoreIds(app.storeIds || []);
                                setPlannedDate(
                                  new Date().toISOString().split("T")[0],
                                );
                                setPlannedTime("14:00");
                                setExpandedQuestions({});
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Valider
                            </Button>
                          </>
                        )}
                        {app.status === "submitted" && (
                          <Link href={`/admin/missions/${app.mission_id}/reports`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-300"
                            >
                              <FileText className="w-3.5 h-3.5 mr-1 text-blue-600" />
                              Examiner Rapport
                            </Button>
                          </Link>
                        )}
                        {app.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                              setAppToApprove(app);
                              setSelectedStoreIds(app.storeIds || []);
                              setPlannedDate(
                                app.mission_date
                                  ? new Date(app.mission_date).toISOString().split("T")[0]
                                  : new Date().toISOString().split("T")[0]
                              );
                              setPlannedTime(app.time_slot ? "14:00" : "14:00");
                              setExpandedQuestions({});
                            }}
                          >
                            Replanifier
                          </Button>
                        )}
                        {app.status === "refused" && app.refusal_reason && (
                          <span className="text-[11px] text-muted-foreground italic truncate max-w-[200px]" title={app.refusal_reason}>
                            Motif: {app.refusal_reason}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50/80">
                      <TableHead className="w-[200px] font-bold text-slate-700">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#041F40]" />
                          Shopper
                        </div>
                      </TableHead>
                      <TableHead className="w-[180px] font-bold text-slate-700">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-[#041F40]" />
                          Mission
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[220px] font-bold text-slate-700">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-[#041F40]" />
                          Magasins demandés
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[150px] font-bold text-slate-700">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#041F40]" />
                          Quiz
                        </div>
                      </TableHead>
                      <TableHead className="w-[140px] font-bold text-slate-700">
                        Statut
                      </TableHead>
                      <TableHead className="text-right w-[190px] font-bold text-slate-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedApplications.map((app) => {
                      const mission = missions.find(
                        (m) => String(m.id) === String(app.mission_id),
                      );
                      const user = users.find(
                        (u) => String(u.id) === String(app.user_id),
                      );
                      const requestedStores = stores.filter((s) =>
                        app.storeIds?.includes(s.id),
                      );
                      const hasQuiz =
                        app.hasQuiz && Object.keys(app.quizAnswers).length > 0;
                      const isQuizExpanded = expandedQuiz === app.id;

                      return (
                        <TableRow
                          key={app.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-primary/10">
                                <AvatarImage src={app.profile_pic_url || user?.profilePicUrl} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-bold">
                                  {(app.user_name || user?.name || "U")?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-semibold text-sm text-slate-900 truncate">
                                  {app.user_name || user?.name || "Shopper"}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate">
                                    {app.email || user?.email || "Email non disponible"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-semibold text-[#041F40] text-sm truncate">
                                {app.mission_title || mission?.title || "Mission"}
                              </div>
                              {mission?.city && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span>{mission.city}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap gap-1.5">
                                {requestedStores.length > 0 ? (
                                  requestedStores.map((s) => (
                                    <Badge
                                      key={s.id}
                                      variant="secondary"
                                      className="text-[11px] py-1 px-2.5 flex items-center gap-1.5 group hover:bg-secondary/80 transition-colors"
                                    >
                                      <Building className="w-3 h-3" />
                                      <span>{s.name}</span>
                                      <span className="text-muted-foreground text-[10px]">
                                        ({s.city})
                                      </span>
                                      {app.status === "pending" && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveStore(app.id, s.id);
                                          }}
                                          className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                                          title="Retirer ce magasin"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">
                                    Aucun magasin demandé
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {requestedStores.length} magasin(s) demandé(s)
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {hasQuiz ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold"
                                    >
                                      {Object.keys(app.quizAnswers).length}{" "}
                                      réponse(s)
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-xs text-slate-600 hover:text-slate-900"
                                      onClick={() =>
                                        setExpandedQuiz(
                                          isQuizExpanded ? null : app.id,
                                        )
                                      }
                                    >
                                      {isQuizExpanded ? (
                                        <ChevronDown className="w-3 h-3 mr-1" />
                                      ) : (
                                        <ChevronRight className="w-3 h-3 mr-1" />
                                      )}
                                      {isQuizExpanded ? "Masquer" : "Voir"}
                                    </Button>
                                  </div>
                                  {isQuizExpanded && (
                                    <div className="mt-2 space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-[200px] overflow-y-auto">
                                      {Object.entries(app.quizAnswers).map(
                                        ([qid, data]) => (
                                          <div key={qid} className="text-xs">
                                            <div className="font-semibold text-slate-700">
                                              {data.question_text}
                                            </div>
                                            <div className="mt-0.5 text-slate-900 font-medium">
                                              {Array.isArray(data.response)
                                                ? data.response.join(", ")
                                                : String(data.response)}
                                            </div>
                                            <Separator className="my-1.5" />
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <AlertCircle className="w-4 h-4 text-slate-400" />
                                  <span className="text-xs text-muted-foreground italic">
                                    Quiz non requis
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Statut Badge */}
                          <TableCell>
                            {app.status === "pending" && (
                              <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-semibold text-xs">
                                ⏳ En attente
                              </Badge>
                            )}
                            {app.status === "approved" && (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold text-xs">
                                ✅ Approuvée
                              </Badge>
                            )}
                            {app.status === "submitted" && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-semibold text-xs">
                                📝 Rapport Soumis
                              </Badge>
                            )}
                            {app.status === "refused" && (
                              <Badge variant="destructive" className="font-semibold text-xs">
                                ❌ Refusée
                              </Badge>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {app.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3"
                                    onClick={() => setAppToRefuse(app)}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Refuser
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 shadow-xs font-semibold"
                                    onClick={() => {
                                      setAppToApprove(app);
                                      setSelectedStoreIds(app.storeIds || []);
                                      setPlannedDate(
                                        new Date().toISOString().split("T")[0],
                                      );
                                      setPlannedTime("14:00");
                                      setExpandedQuestions({});
                                    }}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Valider
                                  </Button>
                                </>
                              )}
                              {app.status === "submitted" && (
                                <Link href={`/admin/missions/${app.mission_id}/reports`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-300"
                                  >
                                    <FileText className="w-3.5 h-3.5 mr-1 text-blue-600" />
                                    Examiner Rapport
                                  </Button>
                                </Link>
                              )}
                              {app.status === "approved" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                                  onClick={() => {
                                    setAppToApprove(app);
                                    setSelectedStoreIds(app.storeIds || []);
                                    setPlannedDate(
                                      app.mission_date
                                        ? new Date(app.mission_date).toISOString().split("T")[0]
                                        : new Date().toISOString().split("T")[0]
                                    );
                                    setPlannedTime(app.time_slot ? "14:00" : "14:00");
                                    setExpandedQuestions({});
                                  }}
                                >
                                  Replanifier
                                </Button>
                              )}
                              {app.status === "refused" && app.refusal_reason && (
                                <span className="text-[11px] text-muted-foreground italic truncate max-w-[160px]" title={app.refusal_reason}>
                                  {app.refusal_reason}
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination des candidatures */}
              <div className="p-4 border-t">
                <DataPagination
                  currentPage={currentPage}
                  totalItems={filteredApplications.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                  itemLabel="candidature(s)"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Approval Modal */}
      <AlertDialog
        open={!!appToApprove}
        onOpenChange={() => setAppToApprove(null)}
      >
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b p-6">
            <AlertDialogHeader className="space-y-1">
              <AlertDialogTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-primary/10 rounded-full">
                  <ClipboardCheck className="w-6 h-6 text-primary" />
                </div>
                Validation & Planification
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Examinez les réponses du quiz, sélectionnez les magasins et
                planifiez la mission
              </AlertDialogDescription>
              {selectedStoreIds.length === 0 && (
                <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-destructive font-medium">
                    ⚠️ Aucun magasin sélectionné - la candidature sera refusée
                    automatiquement
                  </span>
                </div>
              )}
            </AlertDialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {/* Shopper Info */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                  <AvatarImage
                    src={
                      users.find(
                        (u) => String(u.id) === String(appToApprove?.user_id),
                      )?.profilePicUrl
                    }
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xl">
                    {users
                      .find(
                        (u) => String(u.id) === String(appToApprove?.user_id),
                      )
                      ?.name?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">
                    {users.find(
                      (u) => String(u.id) === String(appToApprove?.user_id),
                    )?.name || "Shopper"}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {users.find(
                        (u) => String(u.id) === String(appToApprove?.user_id),
                      )?.email || "Email non disponible"}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-4 h-4" />
                      {missions.find(
                        (m) =>
                          String(m.id) === String(appToApprove?.mission_id),
                      )?.title || "Mission"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quiz Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-lg">Réponses au Quiz</h4>
                <Badge variant="outline" className="ml-2">
                  {Object.keys(appToApprove?.quizAnswers || {}).length} réponses
                </Badge>
              </div>

              {Object.keys(appToApprove?.quizAnswers || {}).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
                  {Object.entries(appToApprove?.quizAnswers || {}).map(
                    ([qid, data], index) => {
                      const isExpanded = expandedQuestions[index];
                      const response = data.response;

                      return (
                        <div
                          key={qid}
                          className="bg-background/50 p-3 rounded-lg border hover:border-primary/30 transition-colors"
                        >
                          <div
                            className="flex items-start justify-between cursor-pointer"
                            onClick={() => toggleQuestionExpand(index)}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-muted-foreground">
                                {data.question_text}
                              </p>
                              <p className="font-medium text-sm mt-1 line-clamp-2">
                                {Array.isArray(response)
                                  ? response.join(", ")
                                  : String(response)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 flex-shrink-0"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {isExpanded && (
                            <div className="mt-2 pt-2 border-t text-sm text-muted-foreground">
                              <p className="font-medium text-foreground">
                                Réponse complète:
                              </p>
                              <p className="mt-1">
                                {Array.isArray(response)
                                  ? response.join(", ")
                                  : String(response)}
                              </p>
                              {data.type && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Type: {data.type}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Le shopper n'a pas rempli le quiz
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Store Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-lg">Sélection des Magasins</h4>
                  <Badge variant="secondary" className="ml-2">
                    {selectedStoreIds.length} sélectionné(s)
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    const allStoreIds = stores
                      .filter(
                        (s) =>
                          String(s.mission_id) ===
                          String(appToApprove?.mission_id),
                      )
                      .map((s) => s.id);
                    toggleAllStores(allStoreIds);
                  }}
                >
                  {selectedStoreIds.length ===
                  stores.filter(
                    (s) =>
                      String(s.mission_id) === String(appToApprove?.mission_id),
                  ).length
                    ? "Tout désélectionner"
                    : "Tout sélectionner"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
                {stores
                  .filter(
                    (s) =>
                      String(s.mission_id) === String(appToApprove?.mission_id),
                  )
                  .map((s) => {
                    const isRequested = appToApprove?.storeIds?.includes(s.id);
                    const isSelected = selectedStoreIds.includes(s.id);

                    return (
                      <div
                        key={s.id}
                        className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-sm"
                            : "bg-background hover:bg-secondary/20 border-border hover:border-primary/30"
                        }`}
                        onClick={() => toggleStore(s.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleStore(s.id)}
                          className="mt-1"
                        />
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">
                              {s.name}
                            </span>
                            {isRequested && (
                              <Badge className="bg-orange-100 text-orange-700 border-none text-[10px]">
                                Demandé
                              </Badge>
                            )}
                            {isSelected && !isRequested && (
                              <Badge className="bg-green-100 text-green-700 border-none text-[10px]">
                                Ajouté
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {s.address}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {s.city}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {s.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {stores.filter(
                  (s) =>
                    String(s.mission_id) === String(appToApprove?.mission_id),
                ).length === 0 && (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <Building className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Aucun magasin disponible pour cette mission</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Date de la visite *
                </Label>
                <Input
                  type="date"
                  value={plannedDate}
                  onChange={(e) => setPlannedDate(e.target.value)}
                  className="h-11"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Heure prévue *
                </Label>
                <Input
                  type="time"
                  value={plannedTime}
                  onChange={(e) => setPlannedTime(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            {/* Validity Window */}
            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
              <Label className="flex items-center gap-2 text-sm font-bold text-orange-800">
                <Clock className="w-4 h-4" />
                Créneau de validité
              </Label>
              <Select value={timeWindow} onValueChange={setTimeWindow}>
                <SelectTrigger className="mt-2 bg-background">
                  <SelectValue placeholder="Sélectionnez un créneau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">⏱ ± 30 minutes</SelectItem>
                  <SelectItem value="60">⏱ ± 1 heure (Standard)</SelectItem>
                  <SelectItem value="120">⏱ ± 2 heures</SelectItem>
                  <SelectItem value="open">⏱ Toute la journée</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Détermine la plage horaire pendant laquelle le shopper peut
                soumettre le questionnaire final.
              </p>
            </div>
          </div>

          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-6">
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="h-11 px-6">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprove}
                className={`h-11 px-8 font-bold ${
                  selectedStoreIds.length === 0
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                } text-white shadow-lg hover:shadow-xl transition-all`}
                disabled={isProcessing === appToApprove?.id}
              >
                {isProcessing === appToApprove?.id ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : selectedStoreIds.length === 0 ? (
                  "❌ Refuser (aucun magasin)"
                ) : (
                  `✅ Approuver (${selectedStoreIds.length})`
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Refusal Modal */}
      <AlertDialog
        open={!!appToRefuse}
        onOpenChange={() => setAppToRefuse(null)}
      >
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-full">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl">
                Refuser la candidature
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base mt-2">
              Expliquez au shopper pourquoi son profil n'a pas été retenu pour
              cette mission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">Motif du refus *</Label>
              <Textarea
                placeholder="Ex: Le créneau demandé n'est plus disponible ou le profil ne correspond pas aux critères du client..."
                value={refusalReason}
                onChange={(e) => setRefusalReason(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
            <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Ce message sera envoyé au shopper pour l'informer du refus de sa
                candidature.
              </p>
            </div>
          </div>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              onClick={() => {
                setRefusalReason("");
              }}
              className="h-11 px-6"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefuse}
              disabled={!refusalReason.trim() || isProcessing}
              className="h-11 px-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {isProcessing === appToRefuse?.id ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Confirmer le refus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
