"use client";

import React, {
  useState,
  useMemo,
  useTransition,
  useEffect,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  FileCheck,
  FileText,
  Loader2,
  UserPlus,
  Award,
  MapPin as MapPinIcon,
  Users as UsersIcon,
  FileSignature,
  UserCheck as UserCheckIcon,
  RefreshCw,
  Building2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Store,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HelpCircle,
} from "lucide-react";

import {
  assignMissionAction,
  approveApplicationAction,
  deleteMissionAction,
} from "../../actions/admin-actions.js";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteMissions, fetchMissions, getAuthToken } from "@/services/fetchData.js";
import DataPagination from "@/components/ui/data-pagination";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/";

export default function AdminMissionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = searchParams?.get("filter") || "all";
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialFilter);

  useEffect(() => {
    const f = searchParams?.get("filter");
    if (f) setStatusFilter(f);
  }, [searchParams]);

  const [activeShoppers, setActiveShoppers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedMissionForAssignment, setSelectedMissionForAssignment] =
    useState(null);
  const [selectedUsersForAssignment, setSelectedUsersForAssignment] = useState(
    [],
  );
  const [shopperSearchTerm, setShopperSearchTerm] = useState("");
  const [isTransitioning, startTransition] = useTransition();

  const [missions, setMissions] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stores, setStores] = useState([]);

  // États pour la qualification et l'attribution des candidatures
  const [waiverConfirmed, setWaiverConfirmed] = useState(false);
  const [selectedExceptionShopper, setSelectedExceptionShopper] = useState(null);
  const [selectedExceptionStoreId, setSelectedExceptionStoreId] = useState("");
  const [expandedQuizAppId, setExpandedQuizAppId] = useState(null);
  const [candidateApprovingId, setCandidateApprovingId] = useState(null);
  const [inlineStoreId, setInlineStoreId] = useState("");
  const [inlineDate, setInlineDate] = useState("");
  const [inlineSlot, setInlineSlot] = useState("60");
  const [isApprovingCandidate, setIsApprovingCandidate] = useState(false);

  // Candidats et magasins pour la mission sélectionnée
  const selectedMissionCandidates = useMemo(() => {
    if (!selectedMissionForAssignment) return [];
    return applications
      .filter((app) => app.mission_id === selectedMissionForAssignment.id)
      .map((app) => {
        let parsedQuiz = [];
        try {
          if (Array.isArray(app.quiz)) parsedQuiz = app.quiz;
          else if (typeof app.quiz === "string") parsedQuiz = JSON.parse(app.quiz);
        } catch (e) {
          parsedQuiz = [];
        }
        let parsedStores = [];
        try {
          if (Array.isArray(app.stores)) parsedStores = app.stores;
          else if (typeof app.stores === "string") parsedStores = JSON.parse(app.stores);
        } catch (e) {
          parsedStores = [];
        }
        return {
          ...app,
          parsedQuiz,
          parsedStores,
          hasProfileAnswers: parsedQuiz.length > 0,
          isRecognitionPassed: Boolean(app.recognition_passed),
        };
      });
  }, [applications, selectedMissionForAssignment]);

  const selectedMissionStores = useMemo(() => {
    if (!selectedMissionForAssignment) return [];
    return stores.filter((s) => s.mission_id === selectedMissionForAssignment.id);
  }, [stores, selectedMissionForAssignment]);

  const pendingMissionCandidates = useMemo(
    () => selectedMissionCandidates.filter((c) => c.status === "pending"),
    [selectedMissionCandidates],
  );

  const approvedMissionCandidates = useMemo(
    () =>
      selectedMissionCandidates.filter(
        (c) => c.status === "approved" || c.status === "submitted",
      ),
    [selectedMissionCandidates],
  );

  // État pour le dialogue d'assignation client partenaire
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [selectedMissionForClient, setSelectedMissionForClient] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState("none");
  const [isSavingClient, setIsSavingClient] = useState(false);

  const clientUsers = useMemo(
    () => users.filter((u) => u.role === "client"),
    [users],
  );

  const openClientAssignDialog = (mission) => {
    setSelectedMissionForClient(mission);
    setSelectedClientId(mission.clientId ? String(mission.clientId) : "none");
    setClientDialogOpen(true);
  };

  const handleSaveClientAssignment = async () => {
    if (!selectedMissionForClient) return;
    setIsSavingClient(true);
    try {
      const token = getAuthToken();
      const targetClientId =
        selectedClientId === "none" || !selectedClientId
          ? null
          : parseInt(selectedClientId);

      const res = await fetch(
        `${API_BASE_URL}missions/${selectedMissionForClient.id}/client`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-auth-token": token || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clientId: targetClientId }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        setMissions((prev) =>
          prev.map((m) =>
            m.id === selectedMissionForClient.id
              ? { ...m, clientId: targetClientId }
              : m,
          ),
        );
        toast({
          title: "Succès",
          description:
            data.message || "Client assigné à la mission avec succès.",
        });
        setClientDialogOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: data.error || "Impossible d'assigner le client.",
        });
      }
    } catch (e) {
      console.error("Erreur assignation client:", e);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'assignation.",
      });
    } finally {
      setIsSavingClient(false);
    }
  };

  const fetchAllData = useCallback(
    async (showRefreshLoader = false) => {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const missionsData = await fetchMissions(
          "admin-missions",
          API_BASE_URL + "missions/admin/all",
        );

        if (missionsData && Array.isArray(missionsData)) {
          setMissions(missionsData);
        }

        const [reportsData, usersData, applicationsData, storesData] =
          await Promise.allSettled([
            fetchMissions("reports", API_BASE_URL + "reports"),
            fetchMissions("users", API_BASE_URL + "users"),
            fetchMissions("applications", API_BASE_URL + "applications"),
            fetchMissions("stores", API_BASE_URL + "stores/missions"),
          ]);

        const getDataFromResult = (result) => {
          return result.status === "fulfilled" ? result.value || [] : [];
        };

        const validReports = getDataFromResult(reportsData);
        const validUsers = getDataFromResult(usersData);
        const validApplications = getDataFromResult(applicationsData);
        const validStores = getDataFromResult(storesData);

        setReports(validReports);
        setUsers(validUsers);
        setApplications(validApplications);
        setStores(validStores);

        const shoppers = validUsers
          .filter((user) => user.role === "shopper" && user.status === "active")
          .map((user) => ({
            value: user.id,
            label: user.name,
            email: user.email,
            city: user.city || "N/A",
            completedMissions: user.completed_missions_count ?? 0,
            profilePicUrl: user.profile_pic_url,
          }));

        setActiveShoppers(shoppers);

        if (showRefreshLoader) {
          toast({
            title: "Données actualisées",
            description: `${
              missionsData?.length || 0
            } missions chargées avec succès.`,
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: `Impossible de charger les données: ${err.message}`,
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleRefresh = useCallback(() => {
    fetchAllData(true);
  }, [fetchAllData]);

  const getStatusVariant = (status) => {
    switch (status) {
      case "available":
        return "secondary";
      case "pending_approval":
        return "outline";
      case "assigned":
        return "default";
      case "submitted":
        return "outline";
      case "approved":
        return "default";
      case "refused":
        return "destructive";
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusInfo = (status, deadline) => {
    const isExpired = deadline && new Date(deadline) < new Date();
    if (isExpired && status !== "completed" && status !== "cancelled") {
      return {
        text: "Expirée",
        className: "bg-rose-50 text-rose-700 border-rose-300 font-bold",
        isExpired: true,
      };
    }
    switch (status) {
      case "available":
        return {
          text: "Disponible",
          className: "bg-green-50 text-green-700 border-green-300",
          isExpired: false,
        };
      case "pending_approval":
        return {
          text: "En attente",
          className: "bg-orange-100 text-orange-800 border-orange-300",
          isExpired,
        };
      case "assigned":
        return {
          text: "Assignée",
          className: "bg-blue-100 text-blue-800 border-blue-300",
          isExpired,
        };
      case "submitted":
        return {
          text: "Rapports soumis",
          className: "bg-yellow-100 text-yellow-800 border-yellow-300",
          isExpired,
        };
      case "approved":
        return {
          text: "Validée",
          className: "bg-green-100 text-green-800 border-green-300",
          isExpired,
        };
      case "refused":
        return {
          text: "Refusée",
          className: "bg-red-100 text-red-800 border-red-300",
          isExpired,
        };
      case "completed":
        return {
          text: "Clôturée",
          className: "bg-purple-100 text-purple-800 border-purple-300",
          isExpired,
        };
      default:
        return {
          text: status.charAt(0).toUpperCase() + status.slice(1),
          className: "bg-gray-100 text-gray-800 border-gray-300",
          isExpired,
        };
    }
  };

  const missionReports = (mission) => {
    return reports.filter((r) => r.mission_id === mission.id);
  };

  const countSubmittedReports = (missionId) => {
    return reports.filter(
      (r) => r.mission_id === missionId && r.status === "submitted",
    ).length;
  };

  const getUserById = (userId) => {
    return users.find((u) => u.id === userId);
  };

  // Compteurs pour les onglets de statut
  const missionCounts = useMemo(() => {
    const now = new Date();
    return {
      all: missions.length,
      available: missions.filter(
        (m) =>
          m.status === "available" &&
          (!m.deadline || new Date(m.deadline) >= now),
      ).length,
      expired: missions.filter(
        (m) =>
          m.deadline &&
          new Date(m.deadline) < now &&
          m.status !== "completed" &&
          m.status !== "cancelled",
      ).length,
      completed: missions.filter((m) => m.status === "completed").length,
    };
  }, [missions]);

  const filteredMissions = useMemo(() => {
    const now = new Date();
    return missions.filter((mission) => {
      const isExpired =
        mission.deadline &&
        new Date(mission.deadline) < now &&
        mission.status !== "completed" &&
        mission.status !== "cancelled";

      // 1. Filtre par onglet
      if (statusFilter === "expired") {
        if (!isExpired) return false;
      } else if (statusFilter === "available") {
        if (mission.status !== "available" || isExpired) return false;
      } else if (statusFilter === "completed") {
        if (mission.status !== "completed") return false;
      }

      // 2. Filtre textuel
      if (!searchTerm.trim()) {
        return true;
      }

      const term = searchTerm.toLowerCase();
      const matchesTitle = mission.title
        ?.toLowerCase()
        .includes(term);
      const matchesId = mission.id
        ?.toString()
        .toLowerCase()
        .includes(term);
      const matchesLocation = mission.location
        ?.toLowerCase()
        .includes(term);
      const matchesStatus = mission.status
        ?.toLowerCase()
        .includes(term);
      const matchesBusiness = mission.businessName
        ?.toLowerCase()
        .includes(term);

      return (
        matchesTitle ||
        matchesId ||
        matchesLocation ||
        matchesStatus ||
        matchesBusiness
      );
    });
  }, [missions, searchTerm, statusFilter]);

  // Pagination des missions administratives
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const paginatedMissions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMissions.slice(start, start + itemsPerPage);
  }, [filteredMissions, currentPage, itemsPerPage]);

  const filteredShoppersForDialog = useMemo(() => {
    if (!shopperSearchTerm) return activeShoppers;
    return activeShoppers.filter(
      (shopper) =>
        shopper.label.toLowerCase().includes(shopperSearchTerm.toLowerCase()) ||
        shopper.email.toLowerCase().includes(shopperSearchTerm.toLowerCase()),
    );
  }, [activeShoppers, shopperSearchTerm]);

  const handleCreateMission = () => router.push("/admin/missions/new");
  const handleEditMission = (missionId) =>
    router.push(`/admin/missions/${missionId}/edit`);
  const handleEditSurvey = (missionId) =>
    router.push(`/admin/missions/${missionId}/survey/create`);
  const handleReviewReports = (missionId) =>
    router.push(`/admin/missions/${missionId}/reports`);

  const handleDeleteMission = async (missionId) => {
    setIsProcessing(missionId);

    try {
      const response = await deleteMissions(
        API_BASE_URL + `missions/${missionId}`,
        "admin-missions",
        API_BASE_URL + `missions/admin/all`,
      );
      /*const response = await fetch(API_BASE_URL + `missions/${missionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });*/

      if (response.success === false) {
        toast({
          variant: "destructive",
          title: "Erreur de suppression",
          description:
            result.message || "Échec de la suppression de la mission.",
        });
        return;
      }

      setMissions((prev) => prev.filter((m) => m.id !== missionId));

      setApplications((prev) =>
        prev.filter((app) => app.mission_id !== missionId),
      );

      toast({
        variant: "success",
        title: "Mission supprimée",
        description: "Mission supprimée avec succès",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de suppression",
        description: error.message,
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const openAssignDialog = (mission) => {
    setSelectedMissionForAssignment(mission);
    const currentAssignees = applications
      .filter((a) => a.mission_id === mission.id && a.status === "approved")
      .map((a) => a.user_id);
    setSelectedUsersForAssignment(currentAssignees);
    setSelectedExceptionShopper(null);
    setSelectedExceptionStoreId("");
    setWaiverConfirmed(false);
    setCandidateApprovingId(null);
    setExpandedQuizAppId(null);
    setShopperSearchTerm("");
    setAssignDialogOpen(true);
  };

  const startInlineApproval = (candidate) => {
    setCandidateApprovingId(candidate.id);
    const candidateStore =
      candidate.parsedStores && candidate.parsedStores.length > 0
        ? String(candidate.parsedStores[0])
        : selectedMissionStores[0]
        ? String(selectedMissionStores[0].id)
        : "";
    setInlineStoreId(candidateStore);
    setInlineDate(
      candidate.mission_date
        ? candidate.mission_date.split("T")[0]
        : selectedMissionForAssignment?.deadline
        ? selectedMissionForAssignment.deadline.split("T")[0]
        : new Date().toISOString().split("T")[0],
    );
    setInlineSlot(candidate.time_slot || "60");
  };

  const confirmCandidateApproval = async (candidate) => {
    if (!inlineStoreId) {
      toast({
        variant: "destructive",
        title: "Magasin requis",
        description: "Veuillez sélectionner un magasin à assigner au shopper.",
      });
      return;
    }

    setIsApprovingCandidate(true);
    try {
      const result = await approveApplicationAction(
        candidate.id,
        selectedMissionForAssignment.id,
        candidate.user_id,
        {
          store_id: parseInt(inlineStoreId, 10),
          mission_date: inlineDate
            ? new Date(inlineDate).toISOString()
            : new Date().toISOString(),
          time_slot: inlineSlot,
        },
      );

      if (result.success) {
        toast({
          title: "Candidature qualifiée et approuvée",
          description: `La mission est assignée à ${candidate.user_name || "l'utilisateur"}.`,
        });

        startTransition(() => {
          setApplications((prev) =>
            prev.map((app) =>
              app.id === candidate.id
                ? {
                    ...app,
                    status: "approved",
                    stores: JSON.stringify([parseInt(inlineStoreId, 10)]),
                    mission_date: inlineDate,
                    time_slot: inlineSlot,
                  }
                : app,
            ),
          );

          setMissions((prevMissions) =>
            prevMissions.map((m) =>
              m.id === selectedMissionForAssignment.id
                ? {
                    ...m,
                    assignedTo: Array.from(
                      new Set([
                        ...(Array.isArray(m.assignedTo) ? m.assignedTo : []),
                        candidate.user_id,
                      ]),
                    ),
                  }
                : m,
            ),
          );
        });

        setCandidateApprovingId(null);
      } else {
        throw new Error(result.message || "Échec de l'approbation.");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur d'approbation",
        description: err.message,
      });
    } finally {
      setIsApprovingCandidate(false);
    }
  };

  const handleManualExceptionAssign = async () => {
    if (!waiverConfirmed) {
      toast({
        variant: "destructive",
        title: "Dérogation non confirmée",
        description:
          "Veuillez cocher la confirmation de dérogation pour assigner sans passage des quiz.",
      });
      return;
    }
    if (!selectedExceptionShopper) {
      toast({
        variant: "destructive",
        title: "Shopper requis",
        description: "Veuillez sélectionner un shopper pour l'assignation en dérogation.",
      });
      return;
    }

    setIsAssigning(true);
    try {
      const storeIdToPass = selectedExceptionStoreId
        ? parseInt(selectedExceptionStoreId, 10)
        : selectedMissionStores[0]
        ? selectedMissionStores[0].id
        : undefined;

      const result = await assignMissionAction(
        selectedMissionForAssignment.id,
        [selectedExceptionShopper],
        storeIdToPass,
      );

      if (result.success) {
        startTransition(() => {
          setMissions((prevMissions) =>
            prevMissions.map((m) =>
              m.id === selectedMissionForAssignment.id
                ? {
                    ...m,
                    assignedTo: Array.from(
                      new Set([
                        ...(Array.isArray(m.assignedTo) ? m.assignedTo : []),
                        selectedExceptionShopper,
                      ]),
                    ),
                  }
                : m,
            ),
          );

          setApplications((prev) => {
            const remaining = prev.filter(
              (a) =>
                !(
                  a.mission_id === selectedMissionForAssignment.id &&
                  a.user_id === selectedExceptionShopper
                ),
            );
            const excShopperObj = activeShoppers.find(
              (s) => s.value === selectedExceptionShopper,
            );
            return [
              ...remaining,
              {
                id: `app-exc-${Date.now()}`,
                mission_id: selectedMissionForAssignment.id,
                user_id: selectedExceptionShopper,
                user_name: excShopperObj?.label || "Shopper",
                email: excShopperObj?.email || "",
                city: excShopperObj?.city || "",
                profile_pic_url: excShopperObj?.profilePicUrl || null,
                status: "approved",
                stores: JSON.stringify(storeIdToPass ? [storeIdToPass] : []),
                quiz: "[]",
                applied_at: new Date().toISOString(),
                recognition_passed: false,
              },
            ];
          });
        });

        toast({
          title: "Assignation en Dérogation Effectuée",
          description: "Le shopper a été assigné sans validation préalable des quiz.",
        });
        setAssignDialogOpen(false);
        setSelectedMissionForAssignment(null);
        setSelectedExceptionShopper(null);
        setSelectedExceptionStoreId("");
        setWaiverConfirmed(false);
      } else {
        throw new Error(result.message || "Échec de l'assignation.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Échec de l'assignation",
        description: error.message,
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const renderMissionActions = (
    mission,
    isCurrentProcessing,
    pendingApplicationsCount,
    submittedCount,
  ) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          disabled={isCurrentProcessing}
        >
          {isCurrentProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {["available", "assigned", "pending_approval"].includes(mission.status) && (
          <DropdownMenuItem
            onClick={() => openAssignDialog(mission)}
            disabled={isCurrentProcessing}
          >
            <UserCheckIcon className="mr-2 h-4 w-4 text-emerald-600" />
            Candidatures & Qualification
            {pendingApplicationsCount > 0 && (
              <Badge
                className="ml-auto text-[10px] px-1.5 py-0.5 bg-amber-500 hover:bg-amber-600 text-white"
              >
                {pendingApplicationsCount}
              </Badge>
            )}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() =>
            router.push(`/admin/applications?missionId=${mission.id}`)
          }
          disabled={isCurrentProcessing}
        >
          <FileSignature className="mr-2 h-4 w-4 text-blue-600" />
          Toutes les Candidatures
        </DropdownMenuItem>

        {["available", "completed", "cancelled"].includes(mission.status) &&
          missionReports(mission).length > 0 && (
            <DropdownMenuItem
              onClick={() => handleReviewReports(mission.id)}
              disabled={isCurrentProcessing}
            >
              <FileCheck className="mr-2 h-4 w-4" />
              Examiner Rapports
              {submittedCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-auto text-[10px] px-1.5 py-0.5"
                >
                  {submittedCount}
                </Badge>
              )}
            </DropdownMenuItem>
          )}

        {(() => {
          const isExp =
            mission.deadline &&
            new Date(mission.deadline) < new Date() &&
            mission.status !== "completed";
          return isExp ? (
            <DropdownMenuItem
              onClick={() => handleEditMission(mission.id)}
              disabled={isCurrentProcessing}
              className="text-amber-800 bg-amber-50/70 font-semibold focus:bg-amber-100"
            >
              <Clock className="mr-2 h-4 w-4 text-amber-600" /> Prolonger Date Limite
            </DropdownMenuItem>
          ) : null;
        })()}

        <DropdownMenuItem
          onClick={() => handleEditMission(mission.id)}
          disabled={isCurrentProcessing}
        >
          <Edit className="mr-2 h-4 w-4" /> Modifier Mission
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleEditSurvey(mission.id)}
          disabled={isCurrentProcessing}
        >
          <FileText className="mr-2 h-4 w-4" /> Modifier Enquête
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => openClientAssignDialog(mission)}
          disabled={isCurrentProcessing}
        >
          <Building2 className="mr-2 h-4 w-4 text-emerald-600" /> Assigner Client Partenaire
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
              onSelect={(e) => e.preventDefault()}
              disabled={isCurrentProcessing}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer Mission
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action supprimera définitivement la mission &quot;{mission.title}&quot; et toutes les données associées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isCurrentProcessing}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={() => handleDeleteMission(mission.id)}
                disabled={isCurrentProcessing}
              >
                {isCurrentProcessing && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des missions...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <FileSignature className="w-6 h-6" /> Gestion de Toutes les Missions
        </h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Badge variant="outline" className="text-sm">
            Total: {missions.length}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            Affichées: {filteredMissions.length}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Actualiser
          </Button>
          <Button onClick={handleCreateMission} size="sm">
            <PlusCircle className="w-4 h-4 mr-2" /> Créer une Mission
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle>Toutes les Missions</CardTitle>
              <CardDescription>
                Visualisez, modifiez, assignez et gérez toutes les missions quel que
                soit leur statut.
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
            {/* Filtres par Onglet */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                className={`text-xs h-8 ${
                  statusFilter === "all" ? "bg-[#041F40] text-white hover:bg-[#041F40]/90" : "text-slate-700"
                }`}
              >
                Toutes ({missionCounts.all})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "available" ? "default" : "outline"}
                onClick={() => setStatusFilter("available")}
                className={`text-xs h-8 ${
                  statusFilter === "available" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-slate-700"
                }`}
              >
                Disponibles ({missionCounts.available})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "expired" ? "default" : "outline"}
                onClick={() => setStatusFilter("expired")}
                className={`text-xs h-8 ${
                  statusFilter === "expired"
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "border-rose-300 text-rose-700 hover:bg-rose-50"
                }`}
              >
                ⏰ Expirées ({missionCounts.expired})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "completed" ? "default" : "outline"}
                onClick={() => setStatusFilter("completed")}
                className={`text-xs h-8 ${
                  statusFilter === "completed" ? "bg-purple-600 text-white hover:bg-purple-700" : "text-slate-700"
                }`}
              >
                Clôturées ({missionCounts.completed})
              </Button>
            </div>

            {/* Champ de recherche */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher titre, ID, ville, enseigne..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            {/* Mobile View: Cards */}
            <div className="block md:hidden space-y-4">
              {paginatedMissions.length > 0 ? (
                paginatedMissions.map((mission) => {
                  const submittedCount = countSubmittedReports(mission.id);
                  const assignedUserIds = applications
                    .filter(
                      (a) =>
                        a.mission_id === mission.id && a.status === "approved",
                    )
                    .map((a) => a.user_id);
                  const assignedShoppersDetails = assignedUserIds
                    .map((id) => getUserById(id))
                    .filter(Boolean);
                  const isCurrentProcessing = isProcessing === mission.id;
                  const statusInfo = getStatusInfo(mission.status, mission.deadline);
                  const pendingApplicationsCount = applications.filter(
                    (app) =>
                      app.mission_id === mission.id &&
                      app.status === "pending",
                  ).length;

                  return (
                    <div
                      key={mission.id}
                      className={`p-4 rounded-xl border bg-card text-card-foreground shadow-sm space-y-3 ${
                        isCurrentProcessing ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-base leading-tight">
                            {mission.title}
                          </h3>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                            <span>{mission.businessName || "Entreprise N/A"} • {mission.location}</span>
                            {(() => {
                              const assignedClient = mission.clientId
                                ? users.find((u) => u.id === mission.clientId)
                                : null;
                              return assignedClient ? (
                                <button
                                  type="button"
                                  onClick={() => openClientAssignDialog(mission)}
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60"
                                >
                                  <Building2 className="w-2.5 h-2.5 text-emerald-600" />
                                  {assignedClient.name}
                                </button>
                              ) : null;
                            })()}
                          </div>
                        </div>
                        {renderMissionActions(
                          mission,
                          isCurrentProcessing,
                          pendingApplicationsCount,
                          submittedCount,
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant={getStatusVariant(mission.status)}
                          className={`capitalize text-xs px-2 py-0.5 ${statusInfo.className}`}
                        >
                          {statusInfo.text}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-semibold">
                          ${mission.reward}
                        </Badge>
                        {mission.status === "available" && submittedCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {submittedCount} Rapports
                          </Badge>
                        )}
                        {mission.status === "available" && pendingApplicationsCount > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-orange-100 text-orange-800 border-orange-300"
                          >
                            {pendingApplicationsCount} Candidatures
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        {(() => {
                          const isExp =
                            mission.deadline &&
                            new Date(mission.deadline) < new Date() &&
                            mission.status !== "completed";
                          return isExp ? (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              Expirée : {format(new Date(mission.deadline), "PP")}
                            </span>
                          ) : (
                            <span>Limite: {format(new Date(mission.deadline), "PP")}</span>
                          );
                        })()}
                        <div>
                          {assignedShoppersDetails.length > 0 ? (
                            <span className="font-medium text-foreground">
                              {assignedShoppersDetails.length} assigné(s)
                            </span>
                          ) : (
                            <span className="italic">Non assigné</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  {missions.length === 0
                    ? "Aucune mission trouvée."
                    : "Aucune mission ne correspond à vos critères."}
                </div>
              )}
            </div>

            {/* Desktop / Tablet View: Table */}
            <div className="hidden md:block overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Date Limite</TableHead>
                    <TableHead>Récompense</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Assigné À</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMissions.length > 0 ? (
                    paginatedMissions.map((mission) => {
                      const submittedCount = countSubmittedReports(mission.id);
                      const assignedUserIds = applications
                        .filter(
                          (a) =>
                            a.mission_id === mission.id &&
                            a.status === "approved",
                        )
                        .map((a) => a.user_id);
                      const assignedShoppersDetails = assignedUserIds
                        .map((id) => getUserById(id))
                        .filter(Boolean);
                      const isCurrentProcessing = isProcessing === mission.id;
                      const statusInfo = getStatusInfo(mission.status, mission.deadline);
                      const pendingApplicationsCount = applications.filter(
                        (app) =>
                          app.mission_id === mission.id &&
                          app.status === "pending",
                      ).length;

                      return (
                        <TableRow
                          key={mission.id}
                          className={
                            isCurrentProcessing
                              ? "opacity-50 pointer-events-none"
                              : ""
                          }
                        >
                          <TableCell className="font-medium">
                            {mission.title}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-[#041F40] leading-snug">
                              {mission.businessName || "N/A"}
                            </div>
                            {(() => {
                              const assignedClient = mission.clientId
                                ? users.find((u) => u.id === mission.clientId)
                                : null;
                              return assignedClient ? (
                                <button
                                  type="button"
                                  onClick={() => openClientAssignDialog(mission)}
                                  className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-2 py-0.5 rounded-md transition-colors"
                                  title="Cliquer pour changer de client assigné"
                                >
                                  <Building2 className="w-3 h-3 text-emerald-600" />
                                  {assignedClient.name}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openClientAssignDialog(mission)}
                                  className="inline-flex items-center gap-1 mt-1 text-[11px] text-slate-500 hover:text-[#041F40] hover:bg-slate-100 px-1.5 py-0.5 rounded border border-dashed border-slate-300 transition-colors"
                                  title="Assigner un client pour lui ouvrir l'accès aux statistiques"
                                >
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  + Assigner client
                                </button>
                              );
                            })()}
                          </TableCell>
                          <TableCell>{mission.location}</TableCell>
                          <TableCell>
                            {(() => {
                              const isExp =
                                mission.deadline &&
                                new Date(mission.deadline) < new Date() &&
                                mission.status !== "completed";
                              return (
                                <div>
                                  <div
                                    className={`flex items-center gap-1.5 text-xs ${
                                      isExp
                                        ? "text-rose-600 font-bold"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {isExp && (
                                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                                    )}
                                    <span>
                                      {format(new Date(mission.deadline), "PP")}
                                    </span>
                                  </div>
                                  {isExp && (
                                    <span className="text-[10px] text-rose-500 font-semibold block">
                                      Date dépassée
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell>${mission.reward}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant={getStatusVariant(mission.status)}
                                className={`capitalize px-2 py-0.5 ${statusInfo.className}`}
                              >
                                {statusInfo.text}
                              </Badge>
                              {mission.status === "available" &&
                                submittedCount > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs px-1.5 py-0.5 h-fit leading-tight"
                                  >
                                    {`${submittedCount} Rapports soumis`}
                                  </Badge>
                                )}
                              {mission.status === "available" &&
                                pendingApplicationsCount > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-1 h-fit leading-tight bg-orange-100 text-orange-800 border-orange-300"
                                  >
                                    {pendingApplicationsCount} Nouveaux
                                    Applications
                                  </Badge>
                                )}
                            </div>
                          </TableCell>

                          <TableCell className="text-xs max-w-[150px]">
                            {assignedShoppersDetails.length > 0 ? (
                              <div className="flex items-center -space-x-2">
                                {assignedShoppersDetails
                                  .slice(0, 3)
                                  .map((shopper, index) => (
                                    <Tooltip key={index}>
                                      <TooltipTrigger asChild>
                                        <Avatar className="h-6 w-6 border-2 border-background hover:z-10">
                                          <AvatarImage
                                            src={shopper.profile_pic_url}
                                            alt={shopper.name}
                                          />
                                          <AvatarFallback>
                                            {shopper.name
                                              ?.charAt(0)
                                              ?.toUpperCase() || "U"}
                                          </AvatarFallback>
                                        </Avatar>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{shopper.name}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ))}
                                {assignedShoppersDetails.length > 3 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Avatar className="h-6 w-6 border-2 border-background bg-muted text-muted-foreground flex items-center justify-center hover:z-10">
                                        <span>
                                          +{assignedShoppersDetails.length - 3}
                                        </span>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {assignedShoppersDetails
                                          .slice(3)
                                          .map((s) => s.name)
                                          .join(", ")}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">
                                Non Assigné
                              </span>
                            )}
                          </TableCell>
                          {/* Actions Admin Column */}
                          <TableCell className="text-right">
                            {renderMissionActions(
                              mission,
                              isCurrentProcessing,
                              pendingApplicationsCount,
                              submittedCount,
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        {missions.length === 0
                          ? "Aucune mission trouvée. Vérifiez votre API ou créez votre première mission."
                          : "Aucune mission ne correspond à vos critères de recherche."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination des missions */}
            <DataPagination
              currentPage={currentPage}
              totalItems={filteredMissions.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              itemLabel="mission(s)"
            />
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Dialog de Qualification & Assignation */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b bg-muted/20">
            <div className="flex items-center justify-between gap-2 pr-6">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <UserCheckIcon className="w-5 h-5 text-emerald-600" />
                Qualification &amp; Assignation : {selectedMissionForAssignment?.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Contrôlez les quiz des mystery shoppers ayant postulé, attribuez les magasins et validez les candidatures.
            </DialogDescription>

            {/* Badges récapitulatifs de la mission */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium flex items-center gap-1.5 py-1 px-2.5",
                  (selectedMissionForAssignment?.profile_quiz_count || 0) > 0
                    ? "border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-slate-200 bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400",
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                Quiz Profil :{" "}
                {(selectedMissionForAssignment?.profile_quiz_count || 0) > 0
                  ? `${selectedMissionForAssignment.profile_quiz_count} question(s)`
                  : "Aucun"}
              </Badge>

              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium flex items-center gap-1.5 py-1 px-2.5",
                  (selectedMissionForAssignment?.recognition_quiz_count || 0) > 0
                    ? "border-purple-300 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                    : "border-slate-200 bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400",
                )}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Quiz Reconnaissance :{" "}
                {(selectedMissionForAssignment?.recognition_quiz_count || 0) > 0
                  ? `${selectedMissionForAssignment.recognition_quiz_count} question(s)`
                  : "Aucun"}
              </Badge>

              <Badge
                variant="outline"
                className="text-xs font-medium flex items-center gap-1.5 py-1 px-2.5 border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
              >
                <Store className="w-3.5 h-3.5" />
                {selectedMissionStores.length} magasin(s) rattaché(s)
              </Badge>
            </div>
          </DialogHeader>

          <Tabs defaultValue="candidates" className="flex-1 flex flex-col min-h-0">
            <div className="px-5 pt-3 pb-2 border-b bg-muted/10">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="candidates" className="text-xs font-medium">
                  Candidatures &amp; Quiz ({pendingMissionCandidates.length} en attente, {approvedMissionCandidates.length} qualifiés)
                </TabsTrigger>
                <TabsTrigger
                  value="exception"
                  className="text-xs font-medium text-rose-700 dark:text-rose-400"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Assignation d&apos;Exception (Dérogation)
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: CANDIDATURES REELLES & VERIFICATION DES 2 QUIZ */}
            <TabsContent
              value="candidates"
              className="flex-1 overflow-y-auto p-5 space-y-4 m-0"
            >
              {pendingMissionCandidates.length === 0 &&
              approvedMissionCandidates.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed rounded-xl bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 mx-auto flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                    Aucune candidature enregistrée pour cette mission
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Pour garantir la qualité des visites mystères et la fiabilité des audits,
                    les mystery shoppers doivent <strong>postuler et compléter les 2 quiz de qualification</strong>
                    (Quiz de Validation du Profil et Quiz de Reconnaissance du Scénario).
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setAssignDialogOpen(false);
                        router.push(
                          `/admin/applications?missionId=${selectedMissionForAssignment?.id}`,
                        );
                      }}
                    >
                      <FileSignature className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                      Voir toutes les candidatures en cours
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Candidats en attente */}
                  {pendingMissionCandidates.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          Candidats en attente de qualification ({pendingMissionCandidates.length})
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-blue-600 hover:text-blue-700"
                          onClick={() => {
                            setAssignDialogOpen(false);
                            router.push(
                              `/admin/applications?missionId=${selectedMissionForAssignment?.id}`,
                            );
                          }}
                        >
                          Ouvrir dans Candidatures
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {pendingMissionCandidates.map((candidate) => (
                          <div
                            key={candidate.id}
                            className="border rounded-lg p-4 bg-card shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border">
                                  <AvatarImage
                                    src={candidate.profile_pic_url}
                                    alt={candidate.user_name}
                                  />
                                  <AvatarFallback>
                                    {candidate.user_name?.charAt(0)?.toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-sm">
                                    {candidate.user_name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {candidate.email}
                                    {candidate.city && (
                                      <span className="ml-2 inline-flex items-center gap-0.5">
                                        <MapPinIcon className="w-3 h-3" />
                                        {candidate.city}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right text-xs text-muted-foreground">
                                Postulé le{" "}
                                {candidate.applied_at
                                  ? format(new Date(candidate.applied_at), "dd/MM/yyyy HH:mm")
                                  : "N/A"}
                              </div>
                            </div>

                            {/* Évaluation des 2 Quiz */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-md border text-xs">
                              {/* Quiz 1: Profil */}
                              <div className="space-y-1">
                                <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                                    1. Quiz Profil :
                                  </span>
                                  {candidate.hasProfileAnswers ? (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                                    >
                                      Complété ({candidate.parsedQuiz.length} rép.)
                                    </Badge>
                                  ) : (selectedMissionForAssignment?.profile_quiz_count || 0) > 0 ? (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300"
                                    >
                                      Non complété
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                      Non requis
                                    </Badge>
                                  )}
                                </div>
                                {candidate.hasProfileAnswers && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedQuizAppId(
                                        expandedQuizAppId === candidate.id ? null : candidate.id,
                                      )
                                    }
                                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 mt-0.5"
                                  >
                                    {expandedQuizAppId === candidate.id ? (
                                      <>
                                        <ChevronUp className="w-3 h-3" /> Masquer les réponses
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="w-3 h-3" /> Voir les réponses du quiz
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>

                              {/* Quiz 2: Reconnaissance */}
                              <div className="space-y-1">
                                <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                    2. Quiz Reconnaissance :
                                  </span>
                                  {candidate.isRecognitionPassed ? (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                                    >
                                      Validé (Réussi)
                                    </Badge>
                                  ) : (selectedMissionForAssignment?.recognition_quiz_count || 0) > 0 ? (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300"
                                    >
                                      En attente
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                      Non requis
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                  {candidate.isRecognitionPassed
                                    ? "Briefing et scénario assimilés"
                                    : (selectedMissionForAssignment?.recognition_quiz_count || 0) > 0
                                    ? "Le shopper n'a pas encore validé le quiz de scénario"
                                    : "Aucun test de reconnaissance configuré"}
                                </div>
                              </div>
                            </div>

                            {/* Accordion Réponses Quiz */}
                            {expandedQuizAppId === candidate.id && candidate.hasProfileAnswers && (
                              <div className="p-3 bg-muted/40 rounded border space-y-2 text-xs">
                                <div className="font-semibold text-muted-foreground">
                                  Réponses au questionnaire de profil :
                                </div>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                  {candidate.parsedQuiz.map((q, idx) => (
                                    <div key={idx} className="p-1.5 bg-background rounded border text-xs">
                                      <div className="font-medium text-slate-800 dark:text-slate-200">
                                        Q{idx + 1}: {q.question_text || `Question ${q.question_id}`}
                                      </div>
                                      <div className="text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                                        R: {Array.isArray(q.response) ? q.response.join(", ") : String(q.response ?? "")}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Formulaire inline de validation et assignation */}
                            {candidateApprovingId === candidate.id ? (
                              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-md space-y-3">
                                <div className="font-semibold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  Attribution magasin et planification pour {candidate.user_name}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div className="space-y-1">
                                    <Label className="text-[11px]">Magasin à assigner</Label>
                                    <select
                                      className="w-full text-xs rounded border bg-background p-1.5"
                                      value={inlineStoreId}
                                      onChange={(e) => setInlineStoreId(e.target.value)}
                                    >
                                      <option value="">-- Choisir un magasin --</option>
                                      {selectedMissionStores.map((st) => (
                                        <option key={st.id} value={st.id}>
                                          {st.name} ({st.city || "Maroc"})
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="space-y-1">
                                    <Label className="text-[11px]">Date de visite prévue</Label>
                                    <Input
                                      type="date"
                                      className="text-xs h-8"
                                      value={inlineDate}
                                      onChange={(e) => setInlineDate(e.target.value)}
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <Label className="text-[11px]">Créneau horaire</Label>
                                    <select
                                      className="w-full text-xs rounded border bg-background p-1.5"
                                      value={inlineSlot}
                                      onChange={(e) => setInlineSlot(e.target.value)}
                                    >
                                      <option value="30">30 minutes</option>
                                      <option value="60">60 minutes (Standard)</option>
                                      <option value="120">120 minutes (2h)</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-7"
                                    disabled={isApprovingCandidate}
                                    onClick={() => setCandidateApprovingId(null)}
                                  >
                                    Annuler
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={isApprovingCandidate}
                                    onClick={() => confirmCandidateApproval(candidate)}
                                  >
                                    {isApprovingCandidate ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                    ) : (
                                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                    )}
                                    Confirmer Qualification &amp; Assigner
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between pt-1">
                                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <Store className="w-3.5 h-3.5" />
                                  Magasin demandé :{" "}
                                  <span className="font-medium text-foreground">
                                    {candidate.parsedStores && candidate.parsedStores.length > 0
                                      ? selectedMissionStores.find(
                                          (s) => s.id === candidate.parsedStores[0],
                                        )?.name || `Store #${candidate.parsedStores[0]}`
                                      : "Non spécifié"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => startInlineApproval(candidate)}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                    Valider &amp; Assigner Magasin
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shoppers déjà qualifiés et assignés */}
                  {approvedMissionCandidates.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Shoppers déjà qualifiés &amp; assignés ({approvedMissionCandidates.length})
                      </h4>

                      <div className="space-y-2">
                        {approvedMissionCandidates.map((candidate) => (
                          <div
                            key={candidate.id}
                            className="border rounded-lg p-3 bg-emerald-50/30 dark:bg-emerald-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border">
                                <AvatarImage
                                  src={candidate.profile_pic_url}
                                  alt={candidate.user_name}
                                />
                                <AvatarFallback>
                                  {candidate.user_name?.charAt(0)?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm flex items-center gap-2">
                                  {candidate.user_name}
                                  <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0">
                                    Assigné &amp; Qualifié
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {candidate.email} •{" "}
                                  {candidate.parsedStores && candidate.parsedStores.length > 0
                                    ? selectedMissionStores.find(
                                        (s) => s.id === candidate.parsedStores[0],
                                      )?.name || `Store #${candidate.parsedStores[0]}`
                                    : "Magasin attribué"}
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              {candidate.mission_date
                                ? `Visite prévue le ${format(new Date(candidate.mission_date), "dd/MM/yyyy")}`
                                : "Date à convenir"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* TAB 2: ASSIGNATION D'EXCEPTION (MANUELLE) */}
            <TabsContent
              value="exception"
              className="flex-1 overflow-y-auto p-5 space-y-4 m-0"
            >
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 rounded-lg text-xs text-rose-900 dark:text-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  Assignation Manuelle d&apos;Exception (Dérogation Qualité)
                </div>
                <p>
                  Cette option permet d&apos;assigner un shopper directement sans qu&apos;il ait postulé formellement
                  ni validé les <strong>2 quiz de qualification</strong> (Quiz Profil et Quiz de Reconnaissance).
                </p>
                <p className="font-semibold text-rose-800 dark:text-rose-300">
                  Conformément aux normes d&apos;audit Emberton, cette dérogation doit être réservée à des situations exceptionnelles (shopper senior déjà certifié, remplacement urgent).
                </p>
              </div>

              {/* Checkbox de dérogation obligatoire */}
              <div className="flex items-start space-x-2.5 p-3 rounded-lg border bg-muted/20">
                <Checkbox
                  id="waiver-confirm"
                  checked={waiverConfirmed}
                  onCheckedChange={setWaiverConfirmed}
                  className="mt-0.5"
                />
                <label
                  htmlFor="waiver-confirm"
                  className="text-xs font-medium leading-relaxed cursor-pointer"
                >
                  Je confirme vouloir assigner ce shopper en <strong>dérogation exceptionnelle</strong> sans exiger le passage préalable des 2 quiz de qualification.
                </label>
              </div>

              {/* Sélection du shopper et magasin */}
              <div
                className={cn(
                  "space-y-3 transition-opacity",
                  !waiverConfirmed && "opacity-40 pointer-events-none",
                )}
              >
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    1. Magasin rattaché à la mission
                  </Label>
                  <select
                    className="w-full text-xs rounded border bg-background p-2"
                    value={selectedExceptionStoreId}
                    onChange={(e) => setSelectedExceptionStoreId(e.target.value)}
                  >
                    <option value="">
                      -- Choisir un magasin de la mission --
                    </option>
                    {selectedMissionStores.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.city || "Maroc"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    2. Choisir le Shopper à assigner en dérogation
                  </Label>
                  <Command className="rounded-lg border shadow-sm">
                    <CommandInput
                      placeholder="Rechercher shopper par nom ou email..."
                      value={shopperSearchTerm}
                      onValueChange={setShopperSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>Aucun shopper actif trouvé.</CommandEmpty>
                      <ScrollArea className="h-[180px]">
                        <CommandGroup>
                          {filteredShoppersForDialog.map((shopper) => (
                            <CommandItem
                              key={shopper.value}
                              value={`${shopper.label} ${shopper.email}`}
                              onSelect={() => setSelectedExceptionShopper(shopper.value)}
                              className={cn(
                                "flex items-center justify-between cursor-pointer p-2",
                                selectedExceptionShopper === shopper.value &&
                                  "bg-accent font-semibold",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6 border">
                                  <AvatarImage
                                    src={shopper.profilePicUrl}
                                    alt={shopper.label}
                                  />
                                  <AvatarFallback>
                                    {shopper.label?.charAt(0)?.toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-xs">{shopper.label}</div>
                                  <div className="text-[10px] text-muted-foreground">
                                    {shopper.email} • {shopper.city}
                                  </div>
                                </div>
                              </div>
                              {selectedExceptionShopper === shopper.value && (
                                <Badge className="bg-rose-600 text-white text-[10px]">
                                  Sélectionné
                                </Badge>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </ScrollArea>
                    </CommandList>
                  </Command>
                </div>

                {selectedExceptionShopper && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 rounded text-xs text-rose-800 dark:text-rose-300">
                    Shopper sélectionné pour dérogation :{" "}
                    <strong>
                      {
                        activeShoppers.find(
                          (s) => s.value === selectedExceptionShopper,
                        )?.label
                      }
                    </strong>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="p-4 border-t bg-muted/20 flex flex-row items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAssignDialogOpen(false);
                setSelectedMissionForAssignment(null);
                setSelectedExceptionShopper(null);
                setWaiverConfirmed(false);
              }}
              disabled={isAssigning}
            >
              Fermer
            </Button>

            {waiverConfirmed && selectedExceptionShopper && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleManualExceptionAssign}
                disabled={isAssigning || !selectedExceptionShopper || !waiverConfirmed}
              >
                {isAssigning && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                Assigner en Dérogation Exceptionnelle
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'assignation Client Partenaire */}
      <AlertDialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[#041F40]">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Assigner un Client Partenaire
            </AlertDialogTitle>
            <AlertDialogDescription>
              Associez la mission{" "}
              <strong className="text-[#041F40]">{selectedMissionForClient?.title}</strong>{" "}
              ({selectedMissionForClient?.businessName}) à un compte client pour lui ouvrir l'accès aux statistiques et rapports d'audit.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-3">
            <Label htmlFor="clientSelect" className="text-xs font-semibold text-[#041F40]">
              Sélectionner le compte client
            </Label>
            <select
              id="clientSelect"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-white border border-[#041F40]/20 text-[#041F40] text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#041F40]"
            >
              <option value="none">-- Aucun client assigné (Mission interne) --</option>
              {clientUsers.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#041F40]/70">
              Le client pourra se connecter avec son compte et consulter en temps réel tous les indicateurs sur son portail d'entreprise.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isSavingClient}
              onClick={() => setClientDialogOpen(false)}
            >
              Annuler
            </AlertDialogCancel>
            <Button
              onClick={handleSaveClientAssignment}
              disabled={isSavingClient}
              className="bg-[#041F40] hover:bg-[#041F40]/90 text-[#D6C799]"
            >
              {isSavingClient ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer l'assignation"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
