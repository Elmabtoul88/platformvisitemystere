"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle,
  SearchX,
  ArrowLeft,
  DollarSign,
  Wallet,
  Clock,
  XCircle,
  CreditCard,
  History,
  TrendingUp,
  Filter,
  ListFilter,
  Calendar as CalendarIcon,
  Search,
  CalendarDays,
  Loader2,
  MapPin,
  Store,
  Building2,
  Navigation,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/services/fetchData";
import DataPagination from "@/components/ui/data-pagination";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CompletedMissionsPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    paidCount: 0,
    pendingCount: 0,
    refusedCount: 0,
    totalPaid: 0,
    totalPending: 0,
    totalEarned: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("missionViewAuth"));
    if (currentUser?.user) {
      setUser(currentUser.user);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reportsResponse = await api.get(`users/user/${user.id}`);
        if (reportsResponse.data?.data) {
          setReports(reportsResponse.data.data);
        }

        try {
          const statsResponse = await api.get(`users/stats/${user.id}`);
          if (statsResponse.data?.data) {
            setStats(statsResponse.data.data);
          }
        } catch (sErr) {
          console.warn("Erreur chargement stats:", sErr);
        }
      } catch (error) {
        console.error("❌ Erreur:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger vos données.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id, toast]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus =
        statusFilter === "all" || report.paymentStatus === statusFilter;

      const searchLower = searchTerm.toLowerCase().trim();
      const missionTitle = (report.mission?.title || "").toLowerCase();
      const businessName = (report.mission?.businessName || "").toLowerCase();
      const storeName = (report.store?.name || "").toLowerCase();
      const storeCity = (report.store?.city || "").toLowerCase();
      const matchesSearch =
        !searchLower ||
        missionTitle.includes(searchLower) ||
        businessName.includes(searchLower) ||
        storeName.includes(searchLower) ||
        storeCity.includes(searchLower);

      let matchesDate = true;
      if (startDate || endDate) {
        const reportDate = new Date(report.submittedAt);
        if (startDate && reportDate < startOfDay(new Date(startDate))) {
          matchesDate = false;
        }
        if (endDate && reportDate > endOfDay(new Date(endDate))) {
          matchesDate = false;
        }
      }

      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [reports, statusFilter, searchTerm, startDate, endDate]);

  // Pagination des missions terminées
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, startDate, endDate]);

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage, itemsPerPage]);

  const getPaymentStatusBadge = (reportOrStatus) => {
    const report =
      typeof reportOrStatus === "object" && reportOrStatus !== null
        ? reportOrStatus
        : { paymentStatus: reportOrStatus };
    const status = report.status || report.reportStatus;
    const paymentStatus = report.paymentStatus;
    const isPaid = status === "paid" || paymentStatus === "paid";
    const isApproved = status === "approved" || (!isPaid && paymentStatus === "approved");
    const isRefused = status === "refused" || paymentStatus === "refused";

    if (isPaid) {
      return (
        <div className="flex flex-col items-end gap-1">
          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold px-2.5 py-1">
            ✓ Payée
          </Badge>
          {report.referencePaiement && (
            <span className="text-[11px] text-slate-500 font-mono">
              Réf: {report.referencePaiement}
            </span>
          )}
        </div>
      );
    }

    if (isApproved) {
      return (
        <div className="flex flex-col items-end gap-1">
          <Badge className="bg-sky-50 text-sky-800 border-sky-300 font-bold px-2.5 py-1">
            Questionnaire Approuvé
          </Badge>
          <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> En attente de paiement
          </span>
        </div>
      );
    }

    if (isRefused) {
      return (
        <div className="flex flex-col items-end gap-1">
          <Badge className="bg-rose-50 text-rose-800 border-rose-300 font-bold px-2.5 py-1">
            Rapport Refusé
          </Badge>
          {report.refusalReason && (
            <span className="text-[11px] text-rose-700 max-w-[180px] truncate font-medium">
              {report.refusalReason}
            </span>
          )}
        </div>
      );
    }

    return (
      <Badge className="bg-amber-50 text-amber-800 border-amber-300 font-bold px-2.5 py-1">
        En attente de validation
      </Badge>
    );
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/90 text-slate-900 py-12 px-4 flex justify-center items-center">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <Loader2 className="animate-spin h-7 w-7 text-[#041F40]" />
          <span className="text-slate-700 font-semibold">
            Chargement de vos missions...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 py-4 sm:py-8 px-3 sm:px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium text-xs sm:text-sm shadow-xs"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-1 text-[#041F40]" /> Retour aux missions
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-slate-500 font-medium text-xs sm:text-sm">
            <CalendarIcon className="w-4 h-4 text-[#041F40]" />
            Dernière mise à jour: {format(new Date(), "PP")}
          </div>
        </div>

        {/* En-tête exécutif Emberton */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#041F40] via-[#093568] to-[#041F40] text-white p-5 sm:p-7 shadow-lg mb-6">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#D6C799] text-xs font-semibold mb-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#D6C799]" />
                Historique & Rémunérations
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                Mes Missions Terminées & Gains
              </h1>
              <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-xl">
                Suivez l'état de validation de vos questionnaires soumis et le versement de vos dédommagements.
              </p>
            </div>
          </div>
        </div>

        {/* Financial Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-1 pt-4 px-4 sm:px-5">
              <CardTitle className="text-xs uppercase font-bold text-slate-500 flex justify-between items-center">
                Total Missions <History className="w-4 h-4 text-[#041F40]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</div>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  {stats.paidCount} payées
                </span>
                <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                  {stats.pendingCount} attente
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-emerald-200 border-l-4 border-l-emerald-600 shadow-sm rounded-2xl">
            <CardHeader className="pb-1 pt-4 px-4 sm:px-5">
              <CardTitle className="text-xs uppercase font-bold text-emerald-800 flex justify-between items-center">
                Total Payé <CheckCircle className="w-4 h-4 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4">
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {stats.totalPaid.toFixed(2)} MAD
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Reçu sur votre compte bancaire</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-amber-200 border-l-4 border-l-amber-500 shadow-sm rounded-2xl">
            <CardHeader className="pb-1 pt-4 px-4 sm:px-5">
              <CardTitle className="text-xs uppercase font-bold text-amber-800 flex justify-between items-center">
                En attente <Clock className="w-4 h-4 text-amber-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4">
              <div className="text-2xl sm:text-3xl font-black text-amber-700">
                {stats.totalPending.toFixed(2)} MAD
              </div>
              <p className="text-[11px] text-amber-800/80 mt-1 font-medium">Traitement en cours</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-rose-200 border-l-4 border-l-rose-500 shadow-sm rounded-2xl">
            <CardHeader className="pb-1 pt-4 px-4 sm:px-5">
              <CardTitle className="text-xs uppercase font-bold text-rose-800 flex justify-between items-center">
                Refusées <XCircle className="w-4 h-4 text-rose-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4">
              <div className="text-2xl sm:text-3xl font-black text-rose-700">
                {stats.refusedCount}
              </div>
              <p className="text-[11px] text-rose-800/80 mt-1 font-medium">Paiements non validés</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <TabsList className="bg-slate-200/90 border border-slate-300 rounded-xl p-1">
                <TabsTrigger
                  value="all"
                  className="text-slate-600 font-semibold data-[state=active]:bg-white data-[state=active]:text-[#041F40] data-[state=active]:shadow-sm"
                >
                  <History className="w-4 h-4 mr-2 text-[#041F40]" /> Historique
                </TabsTrigger>
                <TabsTrigger
                  value="summary"
                  className="text-slate-600 font-semibold data-[state=active]:bg-white data-[state=active]:text-[#041F40] data-[state=active]:shadow-sm"
                >
                  <TrendingUp className="w-4 h-4 mr-2 text-emerald-600" /> Analyse
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-grow md:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher mission, enseigne ou magasin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#041F40] shadow-xs"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-9 border-slate-300 bg-white text-slate-900 focus:border-[#041F40] shadow-xs font-medium">
                    <ListFilter className="w-4 h-4 mr-2 text-slate-500" />
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900">
                    <SelectItem
                      value="all"
                      className="hover:bg-slate-100 focus:bg-slate-100"
                    >
                      Tous les statuts
                    </SelectItem>
                    <SelectItem
                      value="paid"
                      className="hover:bg-slate-100 focus:bg-slate-100 text-emerald-700 font-medium"
                    >
                      Payées
                    </SelectItem>
                    <SelectItem
                      value="pending"
                      className="hover:bg-slate-100 focus:bg-slate-100 text-amber-700 font-medium"
                    >
                      En attente
                    </SelectItem>
                    <SelectItem
                      value="refused"
                      className="hover:bg-slate-100 focus:bg-slate-100 text-rose-700 font-medium"
                    >
                      Refusées
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="p-3.5 border-slate-200 bg-white shadow-sm rounded-xl">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1.5 flex-1 min-w-[140px]">
                  <Label className="text-[11px] uppercase font-bold text-slate-600 flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-[#041F40]" /> Du
                  </Label>
                  <Input
                    type="date"
                    className="h-8 text-xs border-slate-300 bg-slate-50 text-slate-900 focus:border-[#041F40] focus:bg-white"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 flex-1 min-w-[140px]">
                  <Label className="text-[11px] uppercase font-bold text-slate-600 flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-[#041F40]" /> Au
                  </Label>
                  <Input
                    type="date"
                    className="h-8 text-xs border-slate-300 bg-slate-50 text-slate-900 focus:border-[#041F40] focus:bg-white"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold"
                  onClick={clearFilters}
                >
                  Effacer les filtres
                </Button>
              </div>
            </Card>
          </div>

        <TabsContent value="all" className="space-y-4">
          <div className="flex justify-between items-center mb-2 px-1">
            <p className="text-xs text-slate-600 font-medium">
              Résultats :{" "}
              <span className="font-bold text-[#041F40]">
                {filteredReports.length}
              </span>{" "}
              mission(s) trouvée(s)
            </p>
          </div>
          {paginatedReports.length > 0 ? (
            <>
              {paginatedReports.map((report) => (
              <Card
                key={report.id}
                className="overflow-hidden border border-slate-200 border-l-4 border-l-[#041F40] bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div className="space-y-1 flex-1">
                        <h3 className="font-bold text-lg text-[#041F40]">
                          {report.mission?.title || "Mission archivée"}
                        </h3>
                        <p className="text-sm font-semibold text-slate-700">
                          {report.mission?.businessName || "Enseigne inconnue"}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className="text-xl font-black text-emerald-700">
                          {report.reward?.toFixed(2) || "0.00"} MAD
                        </span>
                        {getPaymentStatusBadge(report)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-xs">
                            <Store className="w-4 h-4 text-[#041F40]" />
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-500 font-semibold uppercase">
                              Magasin
                            </p>
                            <p className="font-bold text-sm text-slate-900">
                              {report.store?.name || "Non spécifié"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-xs">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-500 font-semibold uppercase">
                              Ville
                            </p>
                            <p className="font-bold text-sm text-slate-900">
                              {report.store?.city || "Non spécifiée"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-xs mt-0.5">
                            <Navigation className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] text-slate-500 font-semibold uppercase">
                              Adresse
                            </p>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="font-bold text-sm text-slate-900 truncate cursor-help max-w-[200px] md:max-w-[250px]">
                                    {report.store?.address || "Non spécifiée"}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm bg-white border border-slate-200 text-slate-900 shadow-md">
                                  <p>
                                    {report.store?.address || "Non spécifiée"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-xs">
                            <Clock className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-500 font-semibold uppercase">
                              Date de visite
                            </p>
                            <p className="font-bold text-sm text-slate-900">
                              {format(
                                new Date(report.submittedAt),
                                "dd/MM/yyyy HH:mm",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className="border-slate-300 text-slate-700 bg-white flex items-center gap-1 font-medium"
                      >
                        <Store className="w-3 h-3 text-slate-500" />
                        {report.store?.name || "N/A"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-slate-300 text-slate-700 bg-white flex items-center gap-1 font-medium"
                      >
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {report.store?.city || "N/A"}
                      </Badge>
                      {report.status === "approved" && (
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center gap-1 font-bold">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Questionnaire Approuvé
                        </Badge>
                      )}
                    </div>

                    {report.paymentStatus === "paid" && (
                      <div className="mt-4 bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="text-xs text-emerald-900">
                          <p className="font-bold">Virement bancaire effectué</p>
                          <p className="text-emerald-700">Votre paiement a été validé et viré avec succès.</p>
                        </div>
                      </div>
                    )}

                    {report.paymentStatus === "refused" && (
                      <div className="mt-4 bg-rose-50 p-3.5 rounded-xl border border-rose-200">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <p className="text-xs text-rose-800 font-bold uppercase">
                            Motif du refus :
                          </p>
                        </div>
                        <p className="text-xs text-rose-900 font-medium ml-6">
                          {report.refusalReason ||
                            "Contactez le support pour plus d'informations."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
            }

            {/* Pagination des missions terminées */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mt-4">
              <DataPagination
                currentPage={currentPage}
                totalItems={filteredReports.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemLabel="mission(s)"
              />
            </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm p-6">
              <SearchX className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">
                Aucun résultat ne correspond à vos filtres.
              </p>
              <Button
                variant="link"
                onClick={clearFilters}
                className="text-[#041F40] font-bold hover:text-[#093568] mt-1"
              >
                Réinitialiser tous les filtres
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="summary">
          <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-[#041F40]">
                Performance & Gains Cumulés
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-5 flex items-center justify-between bg-slate-50">
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-slate-500 font-bold tracking-wider">
                      Gains Totaux Approuvés
                    </p>
                    <p className="text-3xl sm:text-4xl font-black text-slate-900">
                      {stats.totalEarned.toFixed(2)} MAD
                    </p>
                  </div>
                  <Wallet className="w-10 h-10 text-slate-400" />
                </div>
                <div className="border border-emerald-200 rounded-xl p-5 flex items-center justify-between bg-emerald-50/60">
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-emerald-800 font-bold tracking-wider">
                      Gains Déjà Perçus
                    </p>
                    <p className="text-3xl sm:text-4xl font-black text-emerald-700">
                      {stats.totalPaid.toFixed(2)} MAD
                    </p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-emerald-600/60" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-2 text-slate-900">
                  <TrendingUp className="w-4 h-4 text-[#041F40]" /> Répartition
                  des missions
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700">
                      <span>Payées ({stats.paidCount})</span>
                      <span>
                        {stats.total > 0
                          ? Math.round((stats.paidCount / stats.total) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stats.total > 0 ? (stats.paidCount / stats.total) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700">
                      <span>En attente ({stats.pendingCount})</span>
                      <span>
                        {stats.total > 0
                          ? Math.round((stats.pendingCount / stats.total) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stats.total > 0 ? (stats.pendingCount / stats.total) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700">
                      <span>Refusées ({stats.refusedCount})</span>
                      <span>
                        {stats.total > 0
                          ? Math.round((stats.refusedCount / stats.total) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stats.total > 0 ? (stats.refusedCount / stats.total) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
  );
}
