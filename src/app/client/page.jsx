"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart2,
  Eye,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  Search,
  FileText,
  TrendingUp,
  MapPin,
  Store,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { fetchMissions } from "@/services/fetchData";
import { useToast } from "@/hooks/use-toast";
import DataPagination from "@/components/ui/data-pagination";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

const safeFormatDate = (dateVal, formatStr = "d MMMM yyyy", options = {}) => {
  if (!dateVal) return "Non définie";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "Non définie";
    return format(d, formatStr, options);
  } catch (e) {
    return "Non définie";
  }
};

export default function ClientDashboardPage() {
  const { toast } = useToast();
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    const getMissions = async () => {
      try {
        setIsLoading(true);
        const data = await fetchMissions(
          "client-missions",
          `${API_BASE_URL}clients/missions`,
        );
        setMissions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur chargement missions client:", error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de récupérer vos missions.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      getMissions();
    }
  }, [user, toast]);

  // KPIs synthétiques
  const stats = useMemo(() => {
    const total = missions.length;
    const ongoing = missions.filter(
      (m) => m.status === "available" || m.status === "assigned",
    ).length;
    const completed = missions.filter(
      (m) => m.status === "completed" || m.status === "approved",
    ).length;
    const totalReports = missions.reduce(
      (sum, m) => sum + (m._count?.reports || 0),
      0,
    );
    const totalStores = missions.reduce(
      (sum, m) => sum + (m.stores?.length || 0),
      0,
    );

    return {
      total,
      ongoing,
      completed,
      totalReports,
      totalStores,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [missions]);

  // Filtrage des missions
  const filteredMissions = useMemo(() => {
    return missions.filter((mission) => {
      const matchSearch =
        searchQuery === "" ||
        mission.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mission.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mission.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "ongoing" &&
          (mission.status === "available" || mission.status === "assigned")) ||
        (statusFilter === "completed" &&
          (mission.status === "completed" || mission.status === "approved"));

      return matchSearch && matchStatus;
    });
  }, [missions, searchQuery, statusFilter]);

  // Pagination des missions clientes
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const paginatedMissions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMissions.slice(start, start + itemsPerPage);
  }, [filteredMissions, currentPage, itemsPerPage]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-medium text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Disponible
          </Badge>
        );
      case "assigned":
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium text-xs">
            <Clock className="w-3 h-3 mr-1 animate-pulse" />
            En cours
          </Badge>
        );
      case "completed":
      case "approved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Terminée
          </Badge>
        );
      case "cancelled":
      case "refused":
        return (
          <Badge variant="destructive" className="text-xs">
            Annulée
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl space-y-8">
      {/* En-tête Espace Entreprise */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#041F40]/10">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#041F40] text-[#D6C799] shadow-md shadow-[#041F40]/20">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#041F40]">
                Portail Entreprise & Analytics
              </h1>
              <p className="text-sm text-[#041F40]/70 font-medium">
                Bienvenue, <span className="font-bold text-[#041F40]">{user?.name || "Client Partenaire"}</span>.
                Consultez la performance et les rapports de vos visites mystères.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-white border-[#041F40]/20 text-[#041F40] text-xs font-semibold">
            {missions.length} mission{missions.length > 1 ? "s" : ""} au total
          </Badge>
        </div>
      </div>

      {/* Cartes KPI Synthétiques (Sans répétition inutile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-[#041F40]/10 shadow-sm bg-gradient-to-br from-white to-slate-50/50 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#041F40]/60 uppercase tracking-wider">
                  Missions d'Audit
                </p>
                <h3 className="text-2xl font-bold text-[#041F40] mt-1">
                  {stats.total}
                </h3>
                <p className="text-[11px] text-[#041F40]/60 mt-0.5">
                  {stats.totalStores} point(s) de vente ciblés
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#041F40]/5 text-[#041F40]">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-[#041F40]/10 shadow-sm bg-gradient-to-br from-white to-amber-50/30 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#041F40]/60 uppercase tracking-wider">
                  Missions en cours
                </p>
                <h3 className="text-2xl font-bold text-amber-700 mt-1">
                  {stats.ongoing}
                </h3>
                <p className="text-[11px] text-[#041F40]/60 mt-0.5">
                  En phase terrain ou assignation
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-[#041F40]/10 shadow-sm bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#041F40]/60 uppercase tracking-wider">
                  Missions Validées
                </p>
                <h3 className="text-2xl font-bold text-emerald-700 mt-1">
                  {stats.completed}
                </h3>
                <p className="text-[11px] text-emerald-700/80 font-medium mt-0.5">
                  Taux de réalisation : {stats.completionRate}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-[#041F40]/10 shadow-sm bg-gradient-to-br from-white to-[#D6C799]/10 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#041F40]/60 uppercase tracking-wider">
                  Rapports d'Audit
                </p>
                <h3 className="text-2xl font-bold text-[#041F40] mt-1">
                  {stats.totalReports}
                </h3>
                <p className="text-[11px] text-[#041F40]/60 mt-0.5">
                  Visites mystères documentées
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#041F40] text-[#D6C799]">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre d'outils et recherche */}
      <Card className="rounded-2xl border border-[#041F40]/10 shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-[#041F40]">
                Missions d'Audit Qualité
              </CardTitle>
              <CardDescription className="text-xs text-[#041F40]/60">
                Sélectionnez une mission pour analyser les résultats détaillés, graphiques et rapports.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#041F40]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Rechercher par titre ou enseigne..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl border-[#041F40]/15"
                />
              </div>

              <div className="flex gap-1 bg-[#041F40]/5 p-1 rounded-xl">
                <Button
                  size="sm"
                  variant={statusFilter === "all" ? "default" : "ghost"}
                  onClick={() => setStatusFilter("all")}
                  className={`h-7 px-2.5 text-xs rounded-lg ${
                    statusFilter === "all"
                      ? "bg-[#041F40] text-white hover:bg-[#041F40]/90"
                      : "text-[#041F40]/70 hover:text-[#041F40]"
                  }`}
                >
                  Toutes
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "ongoing" ? "default" : "ghost"}
                  onClick={() => setStatusFilter("ongoing")}
                  className={`h-7 px-2.5 text-xs rounded-lg ${
                    statusFilter === "ongoing"
                      ? "bg-[#041F40] text-white hover:bg-[#041F40]/90"
                      : "text-[#041F40]/70 hover:text-[#041F40]"
                  }`}
                >
                  En cours
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "completed" ? "default" : "ghost"}
                  onClick={() => setStatusFilter("completed")}
                  className={`h-7 px-2.5 text-xs rounded-lg ${
                    statusFilter === "completed"
                      ? "bg-[#041F40] text-white hover:bg-[#041F40]/90"
                      : "text-[#041F40]/70 hover:text-[#041F40]"
                  }`}
                >
                  Terminées
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#041F40]" />
            </div>
          ) : filteredMissions.length === 0 ? (
            <div className="text-center py-16 text-[#041F40]/60 text-sm">
              <FileText className="w-10 h-10 mx-auto text-[#041F40]/20 mb-3" />
              <p className="font-medium text-[#041F40]">Aucune mission ne correspond à vos critères.</p>
              <p className="text-xs text-[#041F40]/50 mt-1">Modifiez vos filtres ou contactez votre responsable d'audit.</p>
            </div>
          ) : (
            <>
              {/* Vue Tableau pour Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/70 border-b border-[#041F40]/10">
                      <TableHead className="font-bold text-[#041F40] text-xs">Titre de la mission</TableHead>
                      <TableHead className="font-bold text-[#041F40] text-xs">Enseigne / Magasins</TableHead>
                      <TableHead className="font-bold text-[#041F40] text-xs">Statut</TableHead>
                      <TableHead className="font-bold text-[#041F40] text-xs">Date d'échéance</TableHead>
                      <TableHead className="font-bold text-[#041F40] text-xs text-center">Rapports reçus</TableHead>
                      <TableHead className="text-right font-bold text-[#041F40] text-xs pr-6">Analyse</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMissions.map((mission) => {
                      const reportCount = mission._count?.reports || 0;
                      const storeCount = mission.stores?.length || 0;

                      return (
                        <TableRow
                          key={mission.id}
                          className="hover:bg-[#041F40]/5 transition-colors border-b border-[#041F40]/5"
                        >
                          <TableCell className="font-semibold text-[#041F40] py-3.5">
                            <div className="flex flex-col">
                              <span>{mission.title}</span>
                              {mission.category && (
                                <span className="text-[11px] text-[#041F40]/50 font-normal">
                                  Catégorie : {mission.category}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-xs text-[#041F40]/80">
                            <div className="flex items-center gap-1.5 font-medium">
                              <Store className="w-3.5 h-3.5 text-[#041F40]/50 flex-shrink-0" />
                              <span>{mission.businessName || "Enseigne principale"}</span>
                            </div>
                            <span className="text-[11px] text-[#041F40]/50">
                              {storeCount} point(s) de vente
                            </span>
                          </TableCell>

                          <TableCell>{getStatusBadge(mission.status)}</TableCell>

                          <TableCell className="text-xs text-[#041F40]/80">
                            {mission.deadline ? (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#041F40]/40 flex-shrink-0" />
                                <span>
                                  {safeFormatDate(mission.deadline, "d MMMM yyyy", { locale: fr })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#041F40]/40 italic">Non définie</span>
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`px-2.5 py-0.5 text-xs font-semibold ${
                                reportCount > 0
                                  ? "bg-emerald-500/10 text-emerald-800 border-emerald-500/30"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}
                            >
                              {reportCount} rapport{reportCount > 1 ? "s" : ""}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right pr-6">
                            <Button
                              asChild
                              size="sm"
                              className="h-8 px-3 text-xs font-semibold rounded-xl bg-[#041F40] hover:bg-[#041F40]/90 text-[#D6C799] shadow-sm shadow-[#041F40]/20 transition-all gap-1.5"
                            >
                              <Link href={`/client/missions/${mission.id}`}>
                                <Eye className="w-3.5 h-3.5" />
                                Tableau de bord
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Vue Cartes Responsive pour Mobile */}
              <div className="block md:hidden divide-y divide-[#041F40]/10 px-4">
                {paginatedMissions.map((mission) => {
                  const reportCount = mission._count?.reports || 0;
                  return (
                    <div key={mission.id} className="py-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-[#041F40] text-sm leading-snug">
                            {mission.title}
                          </h3>
                          <p className="text-xs text-[#041F40]/60 mt-0.5">
                            {mission.businessName || "Enseigne"}
                          </p>
                        </div>
                        {getStatusBadge(mission.status)}
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#041F40]/70 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#041F40]/40" />
                          <span>
                            {mission.deadline
                              ? safeFormatDate(mission.deadline, "dd/MM/yyyy")
                              : "Délai libre"}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[11px]">
                          {reportCount} rapport(s)
                        </Badge>
                      </div>

                      <Button
                        asChild
                        size="sm"
                        className="w-full h-8 text-xs font-semibold rounded-xl bg-[#041F40] text-[#D6C799] justify-center"
                      >
                        <Link href={`/client/missions/${mission.id}`}>
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          Consulter les résultats & rapports
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Contrôleur de Pagination */}
              <DataPagination
                currentPage={currentPage}
                totalItems={filteredMissions.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemLabel="mission(s)"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
