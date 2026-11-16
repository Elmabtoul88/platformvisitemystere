"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Search,
  Download,
  CreditCard,
  Banknote,
  XCircle,
  Info,
  Loader2,
  AlertCircle,
  CalendarDays,
  BarChart3,
  PieChart as PieIcon,
  History,
  TrendingUp,
  FilterX,
  Copy,
  Check,
  Building,
  User,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import * as XLSX from "xlsx";
import {
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  BarChart as ReBarChart,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#64748b"];

// Helper pour récupérer le token de session
function getAuthToken() {
  if (typeof document === "undefined") return null;

  // 1. Lire depuis le cookie
  const match = document.cookie.match(/(^| )missionViewAuth=([^;]+)/);
  if (match) {
    try {
      const parsed = JSON.parse(decodeURIComponent(match[2]));
      if (parsed?.token) return parsed.token;
    } catch (e) {
      // ignore
    }
  }

  // 2. Fallback localStorage
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("missionViewAuth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.token) return parsed.token;
      } catch (e) {
        // ignore
      }
    }
    const token = localStorage.getItem("token");
    if (token) return token;
  }

  return null;
}

// Formatage sécurisé des dates
function safeFormatDate(dateStr, formatStr = "dd/MM/yyyy") {
  if (!dateStr) return "N/A";
  try {
    const d = typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
    if (!isValid(d)) return "N/A";
    return format(d, formatStr, { locale: fr });
  } catch (e) {
    return "N/A";
  }
}

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/";
const cleanApiBase = API_BASE_URL.endsWith("/")
  ? API_BASE_URL
  : `${API_BASE_URL}/`;

export default function AdminPaymentsPage() {
  const { toast } = useToast();

  // État des filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // État des données
  const [paymentsData, setPaymentsData] = useState([]);
  const [statsData, setStatsData] = useState({
    totalMissions: 0,
    pendingPayment: 0,
    paidMissions: 0,
    refusedPayment: 0,
    totalAmountPaid: 0,
    totalAmountPending: 0,
    shoppersWithBankingInfo: 0,
    shoppersWithoutBankingInfo: 0,
  });

  // État de chargement
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);
  const [copiedRib, setCopiedRib] = useState(false);

  // État du dialogue
  const [selectedReport, setSelectedReport] = useState(null);
  const [transactionRef, setTransactionRef] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [paymentAction, setPaymentAction] = useState(null);

  // Fonction pour récupérer les données avec authentification
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["x-auth-token"] = token;
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${cleanApiBase}paiyments/payment_missions`,
        { headers }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        const rawPayments = result.data.payments || [];
        setPaymentsData(rawPayments);

        if (result.data.stats) {
          setStatsData(result.data.stats);
        }
      } else {
        throw new Error(
          result.message || "Erreur lors du chargement des paiements."
        );
      }
    } catch (error) {
      console.error("Error fetching payments data:", error);
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description:
          error.message ||
          "Impossible de charger les données de paiement. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fonction pour mettre à jour un paiement
  const updatePaymentAction = async (reportId, action, data) => {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["x-auth-token"] = token;
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${cleanApiBase}paiyments/payment_missions/${reportId}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          action: action,
          transactionRef: data.transactionRef || null,
          adminNotes: data.adminNotes || null,
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.message || `Erreur serveur lors de la mise à jour (${response.status})`
      );
    }

    return await response.json();
  };

  // Charger les données au montage
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Données enrichies des paiements
  const payments = useMemo(() => {
    return paymentsData.map((p) => {
      const reward = parseFloat(p.reward || p.missionReward || p.mission?.reward || 0);
      const status = p.paymentStatus || (p.reportStatus === "paid" ? "paid" : p.reportStatus === "refused" ? "refused" : "pending");
      const user = p.user || {
        name: p.shopperName,
        email: p.shopperEmail,
        telephone: p.shopperPhone,
        city: p.shopperCity,
        bankingInfo: p.bankingInfo,
      };
      const mission = p.mission || {
        id: p.missionId,
        title: p.missionTitle,
        reward: reward,
        category: p.missionCategory,
      };

      return {
        ...p,
        user,
        mission,
        reward,
        paymentStatus: status,
      };
    });
  }, [paymentsData]);

  // Filtrage des paiements
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        p.user?.name?.toLowerCase().includes(term) ||
        p.shopperName?.toLowerCase().includes(term) ||
        p.user?.email?.toLowerCase().includes(term) ||
        p.mission?.title?.toLowerCase().includes(term) ||
        p.nomMagazin?.toLowerCase().includes(term) ||
        p.ville?.toLowerCase().includes(term) ||
        p.referencePaiement?.toLowerCase().includes(term) ||
        p.reference_paiement?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || p.paymentStatus === statusFilter;

      let matchesDate = true;
      if (startDate || endDate) {
        const d = p.submittedAt || p.submitted_at;
        if (d) {
          const dateVal = new Date(d);
          if (startDate && dateVal < new Date(`${startDate}T00:00:00`)) matchesDate = false;
          if (endDate && dateVal > new Date(`${endDate}T23:59:59`)) matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [payments, searchTerm, statusFilter, startDate, endDate]);

  // Statistiques pour les graphiques
  const chartStatsData = useMemo(() => {
    const statusMap = filteredPayments.reduce((acc, p) => {
      const status = p.paymentStatus || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const pieData = [
      { name: "Payés", value: statusMap["paid"] || 0 },
      { name: "En attente", value: statusMap["pending"] || 0 },
      { name: "Refusés", value: statusMap["refused"] || 0 },
    ].filter((item) => item.value > 0);

    const amountMap = filteredPayments.reduce((acc, p) => {
      const d = p.submittedAt || p.submitted_at;
      if (d) {
        const dateKey = safeFormatDate(d, "MMM yyyy");
        if (dateKey !== "N/A" && p.paymentStatus === "paid") {
          acc[dateKey] = (acc[dateKey] || 0) + (p.reward || 0);
        }
      }
      return acc;
    }, {});

    const barData = Object.entries(amountMap).map(([name, total]) => ({
      name,
      total: Math.round(total),
    }));

    return { pieData, barData };
  }, [filteredPayments]);

  // Gestion de la mise à jour du paiement
  const handleUpdatePayment = async () => {
    if (!selectedReport || paymentAction === "view_info") return;

    setIsProcessing(selectedReport.id);
    try {
      const result = await updatePaymentAction(
        selectedReport.id,
        paymentAction,
        {
          transactionRef,
          adminNotes,
        }
      );

      toast({
        title: "Paiement mis à jour !",
        description:
          result.message ||
          `Statut passé à "${paymentAction === "paid" ? "Payé" : "Refusé"}" avec succès.`,
      });

      // Recharger les données fraîches
      await fetchData();

      // Fermer le dialogue
      setSelectedReport(null);
      setTransactionRef("");
      setAdminNotes("");
      setPaymentAction(null);
    } catch (error) {
      console.error("Error updating payment:", error);
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: error.message || "Une erreur est survenue lors de la mise à jour.",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  // Copier le RIB dans le presse-papiers
  const copyRibToClipboard = (rib) => {
    if (!rib) return;
    navigator.clipboard.writeText(rib);
    setCopiedRib(true);
    toast({
      title: "Copié !",
      description: "Le RIB a été copié dans le presse-papiers.",
    });
    setTimeout(() => setCopiedRib(false), 2000);
  };

  // Export vers Excel
  const exportToExcel = () => {
    const data = filteredPayments.map((p) => {
      const bank = p.user?.bankingInfo || p.bankingInfo;
      return {
        ID_Rapport: p.id,
        Shopper: p.user?.name || p.shopperName || "N/A",
        Email: p.user?.email || p.shopperEmail || "N/A",
        Téléphone: p.user?.telephone || p.shopperPhone || "N/A",
        Mission: p.mission?.title || p.missionTitle || "N/A",
        Magasin: p.nomMagazin || "N/A",
        Ville: p.ville || "N/A",
        Montant_MAD: p.reward || 0,
        Statut_Paiement:
          p.paymentStatus === "paid"
            ? "Payée"
            : p.paymentStatus === "refused"
            ? "Refusée"
            : "En attente",
        Date_Visite: safeFormatDate(p.submittedAt || p.submitted_at, "dd/MM/yyyy HH:mm"),
        Ref_Transaction: p.referencePaiement || p.reference_paiement || "N/A",
        Titulaire_Compte: bank?.accountHolder || "N/A",
        Banque: bank?.bankName || "N/A",
        RIB_IBAN: bank?.rib || "N/A",
        SWIFT_BIC: bank?.swift || "N/A",
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Virements");
    XLSX.writeFile(
      wb,
      `virements_missionview_${safeFormatDate(new Date(), "yyyy-MM-dd")}.xlsx`
    );
  };

  // Réinitialiser les filtres
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  // Rendu du badge de statut
  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
            Payée
          </Badge>
        );
      case "refused":
        return (
          <Badge variant="destructive">
            Refusée
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-800 border-amber-300 font-medium"
          >
            En attente
          </Badge>
        );
    }
  };

  // Affichage du chargement
  if (isLoading && paymentsData.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-7xl">
        <div className="flex flex-col items-center justify-center h-80 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#041F40]" />
          <p className="text-sm font-medium text-muted-foreground">
            Chargement des états de paiement et des virements...
          </p>
        </div>
      </div>
    );
  }

  // Calculs dynamiques basés sur le filtrage courant
  const pendingCount = filteredPayments.filter((p) => p.paymentStatus === "pending").length;
  const paidCount = filteredPayments.filter((p) => p.paymentStatus === "paid").length;
  const totalPaidAmount = filteredPayments
    .filter((p) => p.paymentStatus === "paid")
    .reduce((sum, p) => sum + (p.reward || 0), 0);
  const totalPendingAmount = filteredPayments
    .filter((p) => p.paymentStatus === "pending")
    .reduce((sum, p) => sum + (p.reward || 0), 0);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#041F40] flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-[#041F40]" />
            Gestion des Paiements & Virements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Supervisez les rémunérations des shoppers, consultez leurs RIB et validez les virements bancaires.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={exportToExcel}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none border-[#041F40]/20 hover:bg-[#041F40]/5"
            disabled={filteredPayments.length === 0}
          >
            <Download className="w-4 h-4 mr-2 text-[#041F40]" />
            Exporter Excel
          </Button>
          <Button
            onClick={fetchData}
            variant="default"
            size="sm"
            className="flex-1 sm:flex-none bg-[#041F40] hover:bg-[#041F40]/90 text-white"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Cartes métriques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-amber-200 bg-amber-50/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-amber-800">
              En attente de virement
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-amber-900">
              {pendingCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-semibold text-amber-700">
              Montant : {totalPendingAmount.toLocaleString()} MAD
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-green-800">
              Paiements effectués
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-green-900">
              {paidCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-semibold text-green-700">
              Total viré : {totalPaidAmount.toLocaleString()} MAD
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-blue-800">
              Rapports Évalués
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-blue-900">
              {filteredPayments.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-semibold text-blue-700">
              Sur {paymentsData.length} missions au total
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-50/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-slate-700">
              Volume Financier Total
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-900">
              {(totalPaidAmount + totalPendingAmount).toLocaleString()} MAD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-semibold text-slate-600">
              Toutes missions confondues
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets Liste et Statistiques */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
          <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-[#041F40] data-[state=active]:text-white">
            <History className="w-4 h-4" />
            Liste des Virements & Filtres
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2 data-[state=active]:bg-[#041F40] data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4" />
            Analyses & Statistiques
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Liste des virements */}
        <TabsContent value="list" className="space-y-6">
          {/* Filtres de recherche */}
          <Card className="bg-white shadow-sm border">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-[#041F40]" />
                    Rechercher
                  </Label>
                  <Input
                    placeholder="Shopper, mission, magasin, réf..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-[#041F40]" />
                    Date de début
                  </Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-[#041F40]" />
                    Date de fin
                  </Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 flex-1"
                    onClick={clearFilters}
                  >
                    <FilterX className="w-4 h-4 mr-1.5" />
                    Effacer
                  </Button>
                  <div className="flex bg-slate-100 rounded-lg p-1 border">
                    {[
                      { key: "all", label: "Tous" },
                      { key: "pending", label: "Attente" },
                      { key: "paid", label: "Payés" },
                      { key: "refused", label: "Refusés" },
                    ].map((s) => (
                      <Button
                        key={s.key}
                        variant={statusFilter === s.key ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setStatusFilter(s.key)}
                        className={`h-7 text-xs px-2.5 rounded-md ${
                          statusFilter === s.key
                            ? "bg-[#041F40] text-white shadow-sm"
                            : "text-muted-foreground hover:text-black"
                        }`}
                      >
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau */}
          <Card className="bg-white shadow-sm border overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader className="bg-slate-50 border-b">
                    <TableRow>
                      <TableHead className="font-bold text-[#041F40]">Shopper</TableHead>
                      <TableHead className="font-bold text-[#041F40]">Mission & Lieu</TableHead>
                      <TableHead className="font-bold text-[#041F40]">Rémunération</TableHead>
                      <TableHead className="font-bold text-[#041F40]">Date Visite</TableHead>
                      <TableHead className="font-bold text-[#041F40]">Coordonnées RIB</TableHead>
                      <TableHead className="font-bold text-[#041F40]">Statut</TableHead>
                      <TableHead className="text-right font-bold text-[#041F40]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => {
                        const bank = payment.user?.bankingInfo || payment.bankingInfo;
                        const hasBank = !!(bank && bank.rib);

                        return (
                          <TableRow key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Shopper info */}
                            <TableCell>
                              <div className="font-bold text-sm text-[#041F40] flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                                {payment.user?.name || payment.shopperName || "Shopper non renseigné"}
                              </div>
                              <div className="text-xs text-muted-foreground pl-5">
                                {payment.user?.email || payment.shopperEmail || "Email N/A"}
                              </div>
                              {(payment.user?.telephone || payment.shopperPhone) && (
                                <div className="text-xs text-muted-foreground pl-5">
                                  {payment.user?.telephone || payment.shopperPhone}
                                </div>
                              )}
                            </TableCell>

                            {/* Mission & Store info */}
                            <TableCell>
                              <div className="text-sm font-semibold text-slate-800 max-w-[240px] truncate">
                                {payment.mission?.title || payment.missionTitle || "Mission non renseignée"}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3" />
                                <span>{payment.nomMagazin || payment.mission?.businessName || "Magasin N/A"}</span>
                                {payment.ville && (
                                  <>
                                    <span>•</span>
                                    <MapPin className="w-3 h-3" />
                                    <span>{payment.ville}</span>
                                  </>
                                )}
                              </div>
                            </TableCell>

                            {/* Montant */}
                            <TableCell>
                              <span className="font-extrabold text-base text-[#041F40]">
                                {payment.reward} MAD
                              </span>
                            </TableCell>

                            {/* Date de réalisation */}
                            <TableCell className="text-xs font-medium text-slate-600">
                              {safeFormatDate(payment.submittedAt || payment.submitted_at, "dd/MM/yyyy HH:mm")}
                            </TableCell>

                            {/* Statut RIB */}
                            <TableCell>
                              {hasBank ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedReport(payment);
                                    setPaymentAction("view_info");
                                  }}
                                  className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-medium hover:bg-emerald-100 transition-colors"
                                >
                                  <Building className="w-3 h-3 text-emerald-600" />
                                  <span>{bank.bankName || "RIB disponible"}</span>
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                  <AlertCircle className="w-3 h-3" />
                                  Non renseigné
                                </span>
                              )}
                            </TableCell>

                            {/* Statut paiement */}
                            <TableCell>
                              {getStatusBadge(payment.paymentStatus)}
                              {payment.referencePaiement && (
                                <div className="text-[10px] text-muted-foreground font-mono mt-1">
                                  Réf: {payment.referencePaiement}
                                </div>
                              )}
                            </TableCell>

                            {/* Menu d'actions */}
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-slate-200"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Actions de Paiement</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedReport(payment);
                                      setPaymentAction("view_info");
                                    }}
                                  >
                                    <Info className="mr-2 h-4 w-4 text-[#041F40]" />
                                    Consulter RIB
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedReport(payment);
                                      setPaymentAction("paid");
                                      setTransactionRef(payment.referencePaiement || "");
                                    }}
                                    disabled={payment.paymentStatus === "paid"}
                                  >
                                    <Banknote className="mr-2 h-4 w-4 text-emerald-600" />
                                    Marquer comme payée
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedReport(payment);
                                      setPaymentAction("refused");
                                      setAdminNotes(payment.refusalReason || "");
                                    }}
                                    disabled={payment.paymentStatus === "refused"}
                                  >
                                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                    Refuser le virement
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-16 text-muted-foreground italic"
                        >
                          {searchTerm || statusFilter !== "all" || startDate || endDate
                            ? "Aucun virement ne correspond aux filtres appliqués."
                            : "Aucun paiement en attente de traitement pour le moment."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Statistiques & Analyses */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Répartition des statuts */}
            <Card className="bg-white shadow-sm border">
              <CardHeader>
                <CardTitle className="text-base font-bold text-[#041F40] flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-[#041F40]" />
                  Répartition des Statuts de Paiement
                </CardTitle>
                <CardDescription>
                  Pourcentage de missions payées, en attente ou refusées.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                {chartStatsData.pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={chartStatsData.pieData}
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartStatsData.pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.name === "Payés"
                                ? "#10b981"
                                : entry.name === "En attente"
                                ? "#f59e0b"
                                : "#ef4444"
                            }
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Aucune donnée disponible pour le graphique.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Volume des paiements mensuels */}
            <Card className="bg-white shadow-sm border">
              <CardHeader>
                <CardTitle className="text-base font-bold text-[#041F40] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#041F40]" />
                  Volume des Paiements Payés (MAD)
                </CardTitle>
                <CardDescription>
                  Montant total versé par période mensuelle.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                {chartStatsData.barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={chartStatsData.barData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v} DH`}
                      />
                      <RechartsTooltip
                        formatter={(val) => [`${val.toLocaleString()} MAD`, "Total Versé"]}
                      />
                      <Bar
                        dataKey="total"
                        fill="#041F40"
                        radius={[6, 6, 0, 0]}
                      />
                    </ReBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Aucun paiement complété pour le moment.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Dialog : Consultation RIB & Validation du Paiement */}
      <Dialog
        open={!!selectedReport}
        onOpenChange={(open) => {
          if (!open && !isProcessing) {
            setSelectedReport(null);
            setPaymentAction(null);
            setTransactionRef("");
            setAdminNotes("");
          }
        }}
      >
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#041F40] flex items-center gap-2">
              {paymentAction === "paid" && (
                <>
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  Valider le Virement Bancaire
                </>
              )}
              {paymentAction === "refused" && (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  Refuser le Paiement de la Mission
                </>
              )}
              {paymentAction === "view_info" && (
                <>
                  <CreditCard className="w-5 h-5 text-[#041F40]" />
                  Coordonnées Bancaires du Shopper
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-600">
              Shopper : <span className="font-bold text-slate-900">{selectedReport?.user?.name || selectedReport?.shopperName || "N/A"}</span>
              {" • "}
              Montant : <span className="font-bold text-[#041F40]">{selectedReport?.reward || 0} MAD</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Détails Bancaires du Shopper */}
            {selectedReport?.user?.bankingInfo || selectedReport?.bankingInfo ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#041F40] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    Informations du Compte
                  </p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    RIB Vérifié
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">Titulaire du compte</span>
                    <span className="font-bold text-slate-800">
                      {selectedReport.user?.bankingInfo?.accountHolder ||
                        selectedReport.bankingInfo?.accountHolder ||
                        "Non renseigné"}
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">Établissement bancaire</span>
                    <span className="font-bold text-slate-800">
                      {selectedReport.user?.bankingInfo?.bankName ||
                        selectedReport.bankingInfo?.bankName ||
                        "Non renseigné"}
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Numéro de RIB (24 chiffres)</span>
                      <button
                        type="button"
                        onClick={() =>
                          copyRibToClipboard(
                            selectedReport.user?.bankingInfo?.rib ||
                              selectedReport.bankingInfo?.rib
                          )
                        }
                        className="text-[11px] text-[#041F40] hover:underline flex items-center gap-1 font-semibold"
                      >
                        {copiedRib ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            Copié !
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copier
                          </>
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-xs font-bold bg-white px-3 py-2 rounded-lg border border-slate-300 text-[#041F40] select-all tracking-wider">
                      {selectedReport.user?.bankingInfo?.rib ||
                        selectedReport.bankingInfo?.rib ||
                        "Non renseigné"}
                    </div>
                  </div>

                  {(selectedReport.user?.bankingInfo?.swift ||
                    selectedReport.bankingInfo?.swift) && (
                    <div className="flex justify-between pt-1">
                      <span className="text-muted-foreground">Code SWIFT / BIC</span>
                      <span className="font-mono font-bold text-slate-800">
                        {selectedReport.user?.bankingInfo?.swift ||
                          selectedReport.bankingInfo?.swift}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-2">
                <AlertCircle className="w-7 h-7 text-amber-600 mx-auto" />
                <p className="text-xs font-bold text-amber-800">
                  Coordonnées bancaires non renseignées
                </p>
                <p className="text-[11px] text-amber-700">
                  Le shopper n'a pas encore saisi son RIB dans son espace profil. Vous pouvez tout de même enregistrer une référence manuelle si un autre moyen de paiement a été utilisé.
                </p>
              </div>
            )}

            {/* Saisie de la référence de transaction si Payé */}
            {paymentAction === "paid" && (
              <div className="space-y-2">
                <Label htmlFor="txRef" className="text-xs font-bold text-slate-800">
                  Référence du virement / Transaction ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="txRef"
                  placeholder="Ex: VIR-2026-08942"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="h-10 font-mono text-xs"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Cette référence sera visible par le shopper comme preuve de paiement bancaire.
                </p>
              </div>
            )}

            {/* Notes internes si Refusé ou Payé */}
            {(paymentAction === "paid" || paymentAction === "refused") && (
              <div className="space-y-2">
                <Label htmlFor="adminNotes" className="text-xs font-bold text-slate-800">
                  {paymentAction === "refused"
                    ? "Motif du refus de paiement"
                    : "Notes administratives (optionnel)"}
                </Label>
                <Textarea
                  id="adminNotes"
                  placeholder={
                    paymentAction === "refused"
                      ? "Précisez la raison du refus (ex: non-respect du protocole)..."
                      : "Remarques ou détails comptables..."
                  }
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="text-xs"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedReport(null);
                setPaymentAction(null);
                setTransactionRef("");
                setAdminNotes("");
              }}
              disabled={!!isProcessing}
            >
              {paymentAction === "view_info" ? "Fermer" : "Annuler"}
            </Button>

            {paymentAction !== "view_info" && (
              <Button
                className={
                  paymentAction === "paid"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    : "bg-red-600 hover:bg-red-700 text-white font-semibold"
                }
                onClick={handleUpdatePayment}
                disabled={!!isProcessing || (paymentAction === "paid" && !transactionRef.trim())}
              >
                {isProcessing === selectedReport?.id && (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                )}
                {paymentAction === "paid" ? "Confirmer le Virement" : "Confirmer le Refus"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
