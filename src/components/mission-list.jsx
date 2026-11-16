"use client";

import React, { useState, useMemo, useEffect } from "react";
import { MissionCard } from "./mission-card";
import { MissionFilters } from "./mission-filters";
import {
  fetchMissions,
  patchMissions,
  postMissions,
  api,
} from "@/services/fetchData";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListFilter, SearchX, Loader2, Eye, Map, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataPagination } from "@/components/ui/data-pagination";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

export function MissionList() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    applied: 0,
    pending: 0,
    approved: 0,
    refused: 0,
    totalEarned: 0,
  });
  const [filters, setFilters] = useState({
    location: "",
    date: "",
    category: "",
    status: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // 3x3 grille optimale pour cartes compactes

  useEffect(() => {
    if (!user) return router.push("/login");
    const currentUser = user.id;
    currentUser && setUserId(currentUser);

    const getMissions = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMissions(
          `missions_app_${currentUser}`,
          `missions/missionsApp/${currentUser}`,
        );

        const missionsData = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

        console.log("Fetched missions:", missionsData);
        setMissions(missionsData);

        const categories = [
          ...new Set(missionsData.map((m) => m?.category).filter(Boolean)),
        ];
        setCategories(categories);

        try {
          const statsRes = await api.get(`missions/stats/${currentUser}`);
          if (statsRes.data?.data) {
            setStats(statsRes.data.data);
          }
        } catch (sErr) {
          console.warn("Could not load stats:", sErr);
        }
      } catch (err) {
        console.error("Error fetching missions:", err);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les missions.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      getMissions();
    }
  }, [user, router, toast]);

  const filteredMissions = useMemo(() => {
    const list = missions.filter((mission) => {
      const locationMatch =
        !filters.location ||
        (mission.location &&
          mission.location
            .toLowerCase()
            .includes(filters.location.toLowerCase())) ||
        (mission.ville &&
          mission.ville
            .toLowerCase()
            .includes(filters.location.toLowerCase())) ||
        (mission.businessName &&
          mission.businessName
            .toLowerCase()
            .includes(filters.location.toLowerCase())) ||
        (mission.store?.name &&
          mission.store.name
            .toLowerCase()
            .includes(filters.location.toLowerCase())) ||
        (mission.store?.city &&
          mission.store.city
            .toLowerCase()
            .includes(filters.location.toLowerCase()));

      const categoryMatch =
        !filters.category || mission.category === filters.category;

      const dateMatch =
        !filters.date ||
        (mission.deadline &&
          new Date(mission.deadline) <= new Date(filters.date));

      const applicationStatusMatch =
        filters.status === "all" ||
        (filters.status === "applied" && mission.has_applied) ||
        (filters.status === "available" && !mission.has_applied) ||
        (filters.status === "pending" &&
          mission.report_status === "submitted") ||
        (filters.status === "approved" &&
          mission.report_status === "approved") ||
        (filters.status === "refused" && mission.report_status === "refused");

      return (
        locationMatch && categoryMatch && dateMatch && applicationStatusMatch
      );
    });

    // Tri prioritaire :
    // 1. Missions actives disponibles ou missions déjà postulées en haut
    // 2. Missions expirées non postulées reléguées en fin de catalogue
    const now = new Date();
    return list.sort((a, b) => {
      const aExpired = a.deadline && new Date(a.deadline) < now && !a.has_applied;
      const bExpired = b.deadline && new Date(b.deadline) < now && !b.has_applied;
      if (aExpired && !bExpired) return 1;
      if (!aExpired && bExpired) return -1;
      return 0;
    });
  }, [missions, filters]);

  // Réinitialiser la page si les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const paginatedMissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMissions.slice(start, start + pageSize);
  }, [filteredMissions, currentPage, pageSize]);

  const handleApply = async (missionId) => {
    console.log("Applying to mission ID:", missionId, "User ID:", userId);

    try {
      setMissions((prevMissions) =>
        prevMissions.map((m) =>
          m.id === missionId
            ? {
                ...m,
                has_applied: true,
                application_status: "pending",
                report_status: "submitted",
                count: m.count + 1,
              }
            : m,
        ),
      );

      const baseUrlApplication = API_BASE_URL + "applications";
      await postMissions(
        baseUrlApplication,
        {
          user_id: userId,
          mission_id: missionId,
          status: "pending",
        },
        "applications",
        baseUrlApplication,
      );

      setStats((prev) => ({
        ...prev,
        applied: prev.applied + 1,
        pending: prev.pending + 1,
        available: prev.available - 1,
      }));

      toast({
        title: "✅ Candidature envoyée",
        description: "Votre candidature a été soumise avec succès !",
      });
    } catch (error) {
      console.log("error", error);
      setMissions((prevMissions) =>
        prevMissions.map((m) =>
          m.id === missionId
            ? {
                ...m,
                has_applied: false,
                application_status: "available",
                report_status: null,
                count: m.count - 1,
              }
            : m,
        ),
      );
      toast({
        title: "Erreur",
        description: error.message || "Impossible de postuler",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (missionId) => {
    router.push(`/missions/${missionId}/details`);
  };

  const getStatusBadge = (mission) => {
    if (!mission.has_applied) return null;

    switch (mission.report_status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            ✅ Approuvée
          </Badge>
        );
      case "submitted":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            ⏳ En attente
          </Badge>
        );
      case "refused":
        return <Badge variant="destructive">❌ Refusée</Badge>;
      default:
        return (
          <Badge className="bg-emerald-600/15 text-emerald-800 border-emerald-600/30 font-semibold">
            ✓ Déjà postulé
          </Badge>
        );
    }
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      date: "",
      category: "",
      status: "all",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin h-10 w-10 text-[#041F40]" />
          <span className="text-sm font-semibold text-slate-600">
            Chargement des missions disponibles...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/90 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Bandeau d'en-tête Emberton haute visibilité */}
        <div className="bg-gradient-to-r from-[#041F40] via-[#093568] to-[#041F40] rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-[#041F40]/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6C799]/15 border border-[#D6C799]/30 text-[#D6C799] text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Espace Auditeur Mystère
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
                <ListFilter className="w-6 h-6 text-[#D6C799]" /> Missions disponibles
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
                {stats.available} mission(s) disponible(s) • {stats.applied} candidature(s) en cours
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={() => router.push("/map")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#D6C799] hover:bg-[#c4b37f] text-[#041F40] font-bold text-xs sm:text-sm h-9 rounded-xl shadow-sm transition-all"
              >
                <Map className="w-4 h-4 text-[#041F40]" />
                Carte des Magasins
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/missions/completed")}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs sm:text-sm h-9 rounded-xl font-semibold transition-all"
              >
                <Eye className="w-4 h-4 text-[#D6C799]" />
                Historique
              </Button>
            </div>
          </div>
        </div>

        {/* Statistiques à fort contraste */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          <Card className="bg-white border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-3.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Missions</p>
              <p className="text-2xl font-black text-[#041F40]">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-amber-200/80 shadow-sm rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-3.5">
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Disponibles</p>
              <p className="text-2xl font-black text-amber-600">{stats.available}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-200/80 shadow-sm rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-3.5">
              <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Candidatures</p>
              <p className="text-2xl font-black text-blue-600">{stats.applied}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-amber-200/80 shadow-sm rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-3.5">
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">En attente</p>
              <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-emerald-200/80 shadow-sm rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-3.5">
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Approuvées</p>
              <p className="text-2xl font-black text-emerald-600">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-rose-200/80 shadow-sm rounded-xl hover:shadow-md transition-shadow">
            <CardContent className="p-3.5">
              <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Refusées</p>
              <p className="text-2xl font-black text-rose-600">{stats.refused}</p>
            </CardContent>
          </Card>
        </div>

        <MissionFilters
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
          stats={stats}
          onClearFilters={clearFilters}
        />

        {filteredMissions.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedMissions.map((mission, index) => (
                <MissionCard
                  key={`${mission.id}-${index}`}
                  mission={mission}
                  onApply={handleApply}
                  onViewDetails={handleViewDetails}
                  showApplyButton={true}
                  userId={userId}
                  isApplying={isApplying[mission.id]}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <DataPagination
                currentPage={currentPage}
                totalItems={filteredMissions.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[6, 9, 12, 24]}
              />
            </div>
          </div>
        ) : (
          <Alert className="mt-6 bg-white border border-slate-200 shadow-sm text-slate-800 rounded-xl p-6">
            <SearchX className="h-5 w-5 text-[#041F40]" />
            <AlertTitle className="text-base font-bold text-[#041F40]">Aucune mission trouvée</AlertTitle>
            <AlertDescription className="text-sm text-slate-600 mt-1">
              Aucune mission disponible ne correspond à vos critères de filtrage.
              <Button
                variant="link"
                onClick={clearFilters}
                className="p-0 h-auto font-bold ml-2 text-[#041F40] hover:underline"
              >
                Réinitialiser les filtres
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
