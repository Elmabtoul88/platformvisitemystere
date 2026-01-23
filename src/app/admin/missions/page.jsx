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
} from "lucide-react";

import {
  assignMissionAction,
  deleteMissionAction,
} from "../../actions/admin-actions.js";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { deleteMissions, fetchMissions } from "@/services/fetchData.js";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
export default function AdminMissionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [missions, setMissions] = useState([]);
  const [activeShoppers, setActiveShoppers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedMissionForAssignment, setSelectedMissionForAssignment] =
    useState(null);
  const [selectedUsersForAssignment, setSelectedUsersForAssignment] = useState(
    []
  );
  const [shopperSearchTerm, setShopperSearchTerm] = useState("");
  const [isTransitioning, startTransition] = useTransition();

  const [mockMissions, setMockMissions] = useState([]);
  const [mockReports, setMockReports] = useState([]);
  const [mockUsers, setMockUsers] = useState([]);
  const [mockAssignments, setMockAssignments] = useState([]);
  const [mockApplications, setMockApplications] = useState([]);

  /*
  const parseAssignedTo = useCallback((assignedTo) => {
    if (!assignedTo) return [];
    if (Array.isArray(assignedTo)) return assignedTo;
    if (typeof assignedTo === "string") {
      try {
        const parsed = JSON.parse(assignedTo);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Error parsing assignedTo:", e);
        return [];
      }
    }
    return [];
  }, []);*/

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
          API_BASE_URL + "missions/admin/all"
        );

        if (missionsData && Array.isArray(missionsData)) {
          setMissions(missionsData);
          setMockMissions(missionsData);
        }

        const [reportsData, usersData, assignmentsData, applicationsData] =
          await Promise.allSettled([
            fetchMissions("reports", API_BASE_URL + "reports"),
            fetchMissions("users", API_BASE_URL + "users"),
            fetchMissions("assignments", API_BASE_URL + "assignements"),
            fetchMissions("applications", API_BASE_URL + "applications"),
          ]);

        const getDataFromResult = (result) => {
          return result.status === "fulfilled" ? result.value || [] : [];
        };

        const reports = getDataFromResult(reportsData);
        const users = getDataFromResult(usersData);
        const assignments = getDataFromResult(assignmentsData);
        const applications = getDataFromResult(applicationsData);

        setMockReports(reports);
        setMockUsers(users);
        setMockAssignments(assignments);
        setMockApplications(applications);

        const shoppers = users
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
    [toast]
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  /*useEffect(() => {
    console.log("État missions mis à jour:", {
      total: missions.length,
      missions: missions.map((m) => ({
        id: m.id,
        title: m.title,
        status: m.status,
      })),
    });
  }, [missions]);*/

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

  const getStatusInfo = (status) => {
    switch (status) {
      case "available":
        return {
          text: "Available",
          className: "bg-green-50 text-green-700 border-green-300",
        };
      case "pending_approval":
        return {
          text: "Pending App.",
          className: "bg-orange-100 text-orange-800 border-orange-300",
        };
      case "assigned":
        return {
          text: "Assigned",
          className: "bg-blue-100 text-blue-800 border-blue-300",
        };
      case "submitted":
        return {
          text: "Review Reports",
          className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        };
      case "approved":
        return {
          text: "Approved",
          className: "bg-green-100 text-green-800 border-green-300",
        };
      case "refused":
        return {
          text: "Refused",
          className: "bg-red-100 text-red-800 border-red-300",
        };
      case "completed":
        return {
          text: "Completed",
          className: "bg-purple-100 text-purple-800 border-purple-300",
        };
      default:
        return {
          text: status.charAt(0).toUpperCase() + status.slice(1),
          className: "bg-gray-100 text-gray-800 border-gray-300",
        };
    }
  };

  const countSubmittedReports = (missionId) => {
    return mockReports.filter(
      (r) => r.mission_id === missionId && r.status === "submitted"
    ).length;
  };

  const getUserById = (userId) => {
    return mockUsers.find((u) => u.id === userId);
  };

  const filteredMissions = useMemo(() => {
    console.log("Filtrage - État actuel:", {
      totalMissions: missions.length,
      searchTerm: searchTerm.trim(),
      missionsPreview: missions
        .slice(0, 3)
        .map((m) => ({ id: m.id, title: m.title, status: m.status })),
    });

    if (!searchTerm.trim()) {
      console.log(
        "Pas de terme de recherche - retour de toutes les missions:",
        missions.length
      );
      return missions;
    }

    const filtered = missions.filter((mission) => {
      const matchesTitle = mission.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesId = mission.id
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesLocation = mission.location
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = mission.status
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesBusiness = mission.businessName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return (
        matchesTitle ||
        matchesId ||
        matchesLocation ||
        matchesStatus ||
        matchesBusiness
      );
    });

    return filtered;
  }, [missions, searchTerm]);

  const filteredShoppersForDialog = useMemo(() => {
    if (!shopperSearchTerm) return activeShoppers;
    return activeShoppers.filter(
      (shopper) =>
        shopper.label.toLowerCase().includes(shopperSearchTerm.toLowerCase()) ||
        shopper.email.toLowerCase().includes(shopperSearchTerm.toLowerCase())
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
      const response = await fetch(API_BASE_URL + `missions/${missionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success === false) {
        throw new Error(result.message || "Suppression échouée");
      }

      setMissions((prev) => prev.filter((m) => m.id !== missionId));
      setMockMissions((prev) => prev.filter((m) => m.id !== missionId));
      setMockApplications((prev) =>
        prev.filter((app) => app.mission_id !== missionId)
      );
      setMockAssignments((prev) =>
        prev.filter((assign) => assign.mission_id !== missionId)
      );
      setMockReports((prev) =>
        prev.filter((report) => report.mission_id !== missionId)
      );

      toast({
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
    if (
      !["available", "assigned", "pending_approval"].includes(mission.status)
    ) {
      toast({
        variant: "destructive",
        title: "Impossible d'assigner",
        description: `Le statut de la mission (${mission.status}) empêche l'assignation.`,
      });
      return;
    }
    setSelectedMissionForAssignment(mission);
    const currentAssignees = mockAssignments
      .filter((a) => a.mission_id === mission.id)
      .map((a) => a.user_id);
    setSelectedUsersForAssignment(currentAssignees);
    setShopperSearchTerm("");
    setAssignDialogOpen(true);
  };

  const handleUserSelectionChange = (userId) => {
    setSelectedUsersForAssignment((prevSelected) => {
      const isSelected = prevSelected.includes(userId);
      return isSelected
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId];
    });
  };

  const handleAssignMission = async () => {
    if (
      !selectedMissionForAssignment ||
      selectedUsersForAssignment.length === 0
    ) {
      toast({
        variant: "destructive",
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un utilisateur.",
      });
      return;
    }

    setIsAssigning(true);
    try {
      const result = await assignMissionAction(
        selectedMissionForAssignment.id,
        selectedUsersForAssignment
      );
      if (result.success) {
        startTransition(() => {
          setMissions((prevMissions) =>
            prevMissions.map((m) =>
              m.id === selectedMissionForAssignment.id
                ? {
                    ...m,
                    status: "assigned",
                    assignedTo: selectedUsersForAssignment,
                  }
                : m
            )
          );
          setMockAssignments((prev) => {
            const filtered = prev.filter(
              (a) => a.mission_id !== selectedMissionForAssignment.id
            );
            const newAssignments = selectedUsersForAssignment.map((userId) => ({
              id: `asg-${Date.now()}-${userId}`,
              mission_id: selectedMissionForAssignment.id,
              user_id: userId,
              assigned_at: new Date().toISOString(),
            }));
            return [...filtered, ...newAssignments];
          });
        });
        toast({ title: "Mission assignée", description: result.message });
        setAssignDialogOpen(false);
        setSelectedMissionForAssignment(null);
        setSelectedUsersForAssignment([]);
      } else {
        throw new Error(result.message || "Échec de l'assignation");
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <FileSignature className="w-6 h-6" /> Gestion de Toutes les Missions
        </h1>
        <div className="flex items-center gap-2">
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
        <CardHeader>
          <CardTitle>Toutes les Missions</CardTitle>
          <CardDescription>
            Visualisez, modifiez, assignez et gérez toutes les missions quel que
            soit leur statut.
            {missions.length === 0 &&
              " Aucune mission trouvée - vérifiez votre API."}
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher missions (titre, ID, localisation, statut, entreprise)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full md:w-1/2 lg:w-1/3"
            />
          </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
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
                {filteredMissions.length > 0 ? (
                  filteredMissions.map((mission) => {
                    const submittedCount = countSubmittedReports(mission.id);
                    const assignedUserIds = mockAssignments
                      .filter((a) => a.mission_id === mission.id)
                      .map((a) => a.user_id);
                    const assignedShoppersDetails = assignedUserIds
                      .map((id) => getUserById(id))
                      .filter(Boolean);
                    const isCurrentProcessing = isProcessing === mission.id;
                    const statusInfo = getStatusInfo(mission.status);
                    const pendingApplicationsCount = mockApplications.filter(
                      (app) =>
                        app.mission_id === mission.id &&
                        app.status === "pending"
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
                        <TableCell>{mission.businessName || "N/A"}</TableCell>
                        <TableCell>{mission.location}</TableCell>
                        <TableCell>
                          {format(new Date(mission.deadline), "PP")}
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
                            {mission.status === "submitted" &&
                              submittedCount > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs px-1.5 py-0.5 h-fit leading-tight"
                                >
                                  {submittedCount}
                                </Badge>
                              )}
                            {mission.status === "pending_approval" &&
                              pendingApplicationsCount > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1.5 py-1 h-fit leading-tight bg-orange-100 text-orange-800 border-orange-300"
                                >
                                  {pendingApplicationsCount} Nouveaux
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

                        <TableCell className="text-right">
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

                              {mission.status === "pending_approval" &&
                                pendingApplicationsCount > 0 && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/admin/applications?missionId=${mission.id}`
                                      )
                                    }
                                    disabled={isCurrentProcessing}
                                  >
                                    <UserCheckIcon className="mr-2 h-4 w-4" />
                                    Voir Candidatures (
                                    {pendingApplicationsCount})
                                  </DropdownMenuItem>
                                )}

                              {[
                                "available",
                                "assigned",
                                "pending_approval",
                              ].includes(mission.status) && (
                                <DropdownMenuItem
                                  onClick={() => openAssignDialog(mission)}
                                  disabled={isCurrentProcessing}
                                >
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Assigner/Réassigner
                                </DropdownMenuItem>
                              )}

                              {[
                                "submitted",
                                "approved",
                                "refused",
                                "completed",
                              ].includes(mission.status) && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleReviewReports(mission.id)
                                  }
                                  disabled={isCurrentProcessing}
                                >
                                  <FileCheck className="mr-2 h-4 w-4" />{" "}
                                  Examiner Rapports
                                  {submittedCount > 0 &&
                                    mission.status === "submitted" && (
                                      <Badge
                                        variant="destructive"
                                        className="ml-auto text-[10px] px-1.5 py-0.5"
                                      >
                                        {submittedCount}
                                      </Badge>
                                    )}
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() => handleEditMission(mission.id)}
                                disabled={isCurrentProcessing}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Modifier
                                Mission
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditSurvey(mission.id)}
                                disabled={isCurrentProcessing}
                              >
                                <FileText className="mr-2 h-4 w-4" /> Modifier
                                Enquête
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                    onSelect={(e) => e.preventDefault()}
                                    disabled={isCurrentProcessing}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />{" "}
                                    Supprimer Mission
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Êtes-vous sûr ?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action supprimera définitivement la
                                      mission "{mission.title}" et toutes les
                                      données associées.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      disabled={isCurrentProcessing}
                                    >
                                      Annuler
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className={buttonVariants({
                                        variant: "destructive",
                                      })}
                                      onClick={() =>
                                        handleDeleteMission(mission.id)
                                      }
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
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Dialog d'assignation */}
      <AlertDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Assigner Mission: {selectedMissionForAssignment?.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sélectionnez un ou plusieurs shoppers actifs pour assigner cette
              mission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="shopper-search">Sélectionner Shopper(s)</Label>
            <Command className="rounded-lg border shadow-sm">
              <CommandInput
                id="shopper-search"
                placeholder="Rechercher par nom ou email..."
                value={shopperSearchTerm}
                onValueChange={setShopperSearchTerm}
              />
              <CommandList>
                <CommandEmpty>Aucun shopper actif trouvé.</CommandEmpty>
                <ScrollArea className="h-[200px]">
                  <CommandGroup>
                    {filteredShoppersForDialog.length > 0 ? (
                      filteredShoppersForDialog.map((shopper) => (
                        <CommandItem
                          key={shopper.value}
                          value={`${shopper.label} ${shopper.email}`}
                          onSelect={() => {}}
                          className={cn(
                            "flex items-center gap-2 cursor-pointer aria-selected:bg-accent/50",
                            isAssigning && "pointer-events-auto opacity-100"
                          )}
                        >
                          <Checkbox
                            id={`user-${shopper.value}`}
                            checked={selectedUsersForAssignment.includes(
                              shopper.value
                            )}
                            onCheckedChange={() =>
                              handleUserSelectionChange(shopper.value)
                            }
                            aria-label={`Select ${shopper.label}`}
                            disabled={isAssigning}
                            className="shrink-0"
                          />
                          <Label
                            htmlFor={`user-${shopper.value}`}
                            className="flex flex-col text-sm flex-grow cursor-pointer pl-2"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 border">
                                <AvatarImage
                                  src={shopper.profilePicUrl}
                                  alt={shopper.label}
                                />
                                <AvatarFallback>
                                  {shopper.label?.charAt(0)?.toUpperCase() ||
                                    "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span>{shopper.label}</span>
                            </div>
                            <span className="text-xs text-muted-foreground ml-8">
                              {shopper.email}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 ml-8">
                              <span className="flex items-center gap-1">
                                <MapPinIcon className="w-3 h-3" />{" "}
                                {shopper.city}
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />{" "}
                                {shopper.completedMissions} terminées
                              </span>
                            </div>
                          </Label>
                        </CommandItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Aucun shopper actif correspondant trouvé.
                      </div>
                    )}
                  </CommandGroup>
                </ScrollArea>
              </CommandList>
            </Command>
            {selectedUsersForAssignment.length > 0 && (
              <div className="pt-2 text-xs text-muted-foreground">
                Sélectionnés:{" "}
                {selectedUsersForAssignment
                  .map(
                    (id) => activeShoppers.find((s) => s.value === id)?.label
                  )
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setAssignDialogOpen(false);
                setSelectedMissionForAssignment(null);
                setSelectedUsersForAssignment([]);
              }}
              disabled={isAssigning}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAssignMission}
              disabled={isAssigning || selectedUsersForAssignment.length === 0}
            >
              {isAssigning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Assigner Mission
              {selectedUsersForAssignment.length !== 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
