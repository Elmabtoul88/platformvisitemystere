"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  ListChecks,
  Users,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Building,
  MapPin,
  TrendingUp,
  FileText,
  UserCheck,
  UserX,
  Search,
  CheckCircle,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ExternalLink,
  Shield,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  ChevronRight,
  Store,
  DollarSign,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { fetchMissions } from "@/services/fetchData";
import { format, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { toggleUserStatusAction } from "../actions/admin-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
const cleanApiBase = API_BASE_URL.endsWith("/")
  ? API_BASE_URL
  : `${API_BASE_URL}/`;

// Formatage sécurisé de date en français
function safeFormatDate(dateStr, formatStr = "dd MMM yyyy") {
  if (!dateStr) return "N/A";
  try {
    const d =
      typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
    if (!isValid(d)) return "N/A";
    return format(d, formatStr, { locale: fr });
  } catch (e) {
    return "N/A";
  }
}

// Couleurs professionnelles pour les graphiques
const AUDIT_COLORS = {
  approved: "#10b981", // Émeraude / Vert
  submitted: "#f59e0b", // Ambre / Orange
  refused: "#ef4444", // Rouge
  paid: "#059669", // Vert foncé
};

const CATEGORY_PALETTE = [
  "#041F40",
  "#2563eb",
  "#0d9488",
  "#d97706",
  "#7c3aed",
  "#db2777",
];

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [missions, setMissions] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [registrationData, setRegistrationData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [isTogglingUser, setIsTogglingUser] = useState(null);

  // Chargement global de toutes les données du dashboard
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    setLoadError(null);

    try {
      const results = await Promise.allSettled([
        fetchMissions("admin-missions", `${cleanApiBase}missions/admin/all`),
        fetchMissions("admin-reports", `${cleanApiBase}reports`),
        fetchMissions("admin-users", `${cleanApiBase}users`),
        fetchMissions("usersMonth", `${cleanApiBase}dashboardadmin/usersMonth`),
        fetchMissions("admin-applications", `${cleanApiBase}applications`),
        fetchMissions(
          "admin-payments-stats",
          `${cleanApiBase}paiyments/payment_missions`
        ),
      ]);

      const failedServices = [];

      if (results[0].status === "fulfilled" && Array.isArray(results[0].value)) {
        setMissions(results[0].value);
      } else if (results[0].status === "rejected") {
        failedServices.push("Missions");
      }

      if (results[1].status === "fulfilled" && Array.isArray(results[1].value)) {
        setReports(results[1].value);
      } else if (results[1].status === "rejected") {
        failedServices.push("Rapports d'audit");
      }

      if (results[2].status === "fulfilled" && Array.isArray(results[2].value)) {
        setUsers(results[2].value);
      } else if (results[2].status === "rejected") {
        failedServices.push("Utilisateurs");
      }

      if (results[3].status === "fulfilled" && Array.isArray(results[3].value)) {
        setRegistrationData(results[3].value);
      }

      if (results[4].status === "fulfilled" && Array.isArray(results[4].value)) {
        setApplications(results[4].value);
      } else if (results[4].status === "rejected") {
        failedServices.push("Candidatures");
      }

      if (
        results[5].status === "fulfilled" &&
        results[5].value?.data?.stats
      ) {
        setPaymentStats(results[5].value.data.stats);
      }

      if (failedServices.length > 0) {
        setLoadError(
          `Certaines données n'ont pas pu être synchronisées (${failedServices.join(", ")}).`
        );
        if (isSilent) {
          toast({
            variant: "destructive",
            title: "Synchronisation incomplète",
            description: `Impossible de charger : ${failedServices.join(", ")}`,
          });
        }
      }
    } catch (err) {
      setLoadError("Erreur serveur lors du chargement des indicateurs.");
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Impossible de joindre le serveur pour actualiser le tableau de bord.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Action pour activer / suspendre la connexion d'un utilisateur
  const handleToggleUserConnection = async (userId, currentStatus, userName) => {
    setIsTogglingUser(userId);
    try {
      const result = await toggleUserStatusAction(userId, currentStatus);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, status: result.newStatus } : u
          )
        );
        toast({
          title: result.newStatus === "active" ? "Connexion autorisée" : "Connexion suspendue",
          description:
            result.newStatus === "active"
              ? `L'accès au compte de ${userName || "l'utilisateur"} est désormais activé.`
              : `L'accès au compte de ${userName || "l'utilisateur"} a été suspendu.`,
        });
      } else {
        throw new Error(result.message || "Échec de modification du statut.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de modifier le statut de connexion.",
      });
    } finally {
      setIsTogglingUser(null);
    }
  };

  // =========================================================================
  // CALCULS MÉTIER & INDICATEURS STRATÉGIQUES
  // =========================================================================

  // 1. Rapports & Audits
  const pendingReports = useMemo(
    () => reports.filter((r) => r.status === "submitted"),
    [reports]
  );
  const approvedReports = useMemo(
    () => reports.filter((r) => r.status === "approved" || r.status === "paid"),
    [reports]
  );
  const refusedReports = useMemo(
    () => reports.filter((r) => r.status === "refused"),
    [reports]
  );
  const totalAuditedReports =
    approvedReports.length + refusedReports.length + pendingReports.length;

  const approvalRate =
    totalAuditedReports > 0
      ? Math.round((approvedReports.length / totalAuditedReports) * 100)
      : 0;

  // 2. Candidatures des Shoppers
  const pendingApplications = useMemo(
    () => applications.filter((a) => a.status === "pending"),
    [applications]
  );
  const approvedApplications = useMemo(
    () => applications.filter((a) => a.status === "approved"),
    [applications]
  );
  const submittedApplications = useMemo(
    () => applications.filter((a) => a.status === "submitted"),
    [applications]
  );

  // 3. Missions
  const activeMissions = useMemo(
    () =>
      missions.filter((m) => m.status === "available" || m.status === "assigned"),
    [missions]
  );
  const completedMissions = useMemo(
    () => missions.filter((m) => m.status === "completed"),
    [missions]
  );

  // Missions ayant atteint la date limite (expirées)
  const expiredMissions = useMemo(() => {
    const now = new Date();
    return missions.filter((m) => {
      if (!m.deadline) return false;
      try {
        const d = new Date(m.deadline);
        return (
          isValid(d) &&
          d < now &&
          m.status !== "completed" &&
          m.status !== "cancelled"
        );
      } catch (e) {
        return false;
      }
    });
  }, [missions]);

  // 4. Utilisateurs & Connexions
  const activeUsers = useMemo(
    () => users.filter((u) => u.status === "active"),
    [users]
  );
  const inactiveUsers = useMemo(
    () => users.filter((u) => u.status === "inactive"),
    [users]
  );
  const shoppersCount = useMemo(
    () => users.filter((u) => u.role === "shopper").length,
    [users]
  );
  const activeShoppersCount = useMemo(
    () => users.filter((u) => u.role === "shopper" && u.status === "active").length,
    [users]
  );
  const clientsCount = useMemo(
    () => users.filter((u) => u.role === "client").length,
    [users]
  );
  const activeClientsCount = useMemo(
    () => users.filter((u) => u.role === "client" && u.status === "active").length,
    [users]
  );

  // Filtrage des utilisateurs pour l'onglet de gestion des connexions
  const filteredUsersList = useMemo(() => {
    return users.filter((u) => {
      const term = userSearchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.city?.toLowerCase().includes(term) ||
        u.id?.toString().includes(term);

      const matchesStatus =
        userStatusFilter === "all" ||
        (userStatusFilter === "active" && u.status === "active") ||
        (userStatusFilter === "inactive" && u.status === "inactive") ||
        u.role === userStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, userSearchTerm, userStatusFilter]);

  // 5. Finances & Rémunérations (en MAD)
  const totalAmountPaid = paymentStats?.totalAmountPaid || 0;
  const totalAmountPending = paymentStats?.totalAmountPending || 0;
  const pendingPaymentsCount = paymentStats?.pendingPayment || 0;

  const hasPendingActions =
    pendingReports.length > 0 ||
    pendingApplications.length > 0 ||
    pendingPaymentsCount > 0 ||
    expiredMissions.length > 0;

  // 6. Données du Graphique de Répartition des Audits
  const auditStatusChartData = useMemo(() => {
    return [
      { name: "Approuvés", value: approvedReports.length, color: AUDIT_COLORS.approved },
      { name: "En attente", value: pendingReports.length, color: AUDIT_COLORS.submitted },
      { name: "Refusés", value: refusedReports.length, color: AUDIT_COLORS.refused },
    ].filter((item) => item.value > 0);
  }, [approvedReports, pendingReports, refusedReports]);

  // 7. Données du Graphique Missions par Catégorie
  const categoryChartData = useMemo(() => {
    const counts = missions.reduce((acc, m) => {
      const cat = m.category || "Autre";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [missions]);

  // 8. Données du Graphique Rémunérations par Catégorie
  const rewardByCategoryData = useMemo(() => {
    const map = missions.reduce((acc, m) => {
      const cat = m.category || "Autre";
      const reward = parseFloat(m.reward) || 0;
      if (!acc[cat]) acc[cat] = { total: 0, count: 0 };
      acc[cat].total += reward;
      acc[cat].count += 1;
      return acc;
    }, {});

    return Object.entries(map).map(([name, val]) => ({
      name,
      moyenne: val.count > 0 ? Math.round(val.total / val.count) : 0,
    }));
  }, [missions]);

  // 9. Dernières activités (5 récents de chaque)
  const recentReports = useMemo(() => reports.slice(0, 5), [reports]);
  const recentApplications = useMemo(
    () => applications.slice(0, 5),
    [applications]
  );

  // Date actuelle formatée
  const todayFormatted = useMemo(() => {
    const now = new Date();
    return (
      now.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }) || ""
    );
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#041F40]" />
        <p className="text-sm font-semibold text-slate-600">
          Chargement des indicateurs clés de performance...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ============================================================== */}
      {/* 1. EN-TÊTE DU TABLEAU DE BORD (BANNER EXECUTIVE)               */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-[#041F40] via-[#093568] to-[#041F40] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Motif décoratif en arrière-plan */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_80%_20%,rgba(214,199,153,0.15),transparent_70%)] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6C799]/15 border border-[#D6C799]/30 text-[#D6C799] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Pilotage Opérationnel & Analytique
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Tableau de Bord Administrateur
            </h1>
            <p className="text-slate-300 text-sm md:text-base capitalize">
              {todayFormatted} • Suivi en temps réel des audits, shoppers et finances.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => loadDashboardData(true)}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>
            <Link href="/admin/missions/new">
              <Button
                size="sm"
                className="bg-[#D6C799] hover:bg-[#D6C799]/90 text-[#041F40] font-bold shadow-lg shadow-black/20"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Nouvelle Mission
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Alerte Erreur / Synchronisation des données */}
      {loadError && (
        <Alert className="bg-red-50/90 border-red-200 text-red-900 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <AlertTitle className="font-bold text-red-950 text-sm">
                Problème de synchronisation des données
              </AlertTitle>
              <AlertDescription className="text-xs text-red-800">
                {loadError}
              </AlertDescription>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadDashboardData(true)}
            className="border-red-300 text-red-900 hover:bg-red-100 h-8 text-xs font-semibold shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Réessayer
          </Button>
        </Alert>
      )}

      {/* ============================================================== */}
      {/* 2. SECTION ACTIONS REQUISES / ALERTES DU JOUR                  */}
      {/* ============================================================== */}
      <Card
        className={`border-l-4 shadow-sm transition-all ${
          hasPendingActions
            ? "border-l-amber-500 bg-amber-50/40 border-amber-200/80"
            : "border-l-emerald-500 bg-emerald-50/20 border-emerald-200/80"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {hasPendingActions ? (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
              <CardTitle className="text-base font-bold text-[#041F40]">
                Actions Prioritaires & Suivi Opérationnel
              </CardTitle>
            </div>
            {hasPendingActions ? (
              <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-semibold text-xs">
                {pendingReports.length +
                  pendingApplications.length +
                  pendingPaymentsCount +
                  expiredMissions.length}{" "}
                point(s) d'attention
              </Badge>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold text-xs">
                ✓ Tous les flux sont à jour
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs text-slate-600">
            {hasPendingActions
              ? "Ces éléments nécessitent l'intervention ou la supervision d'un administrateur."
              : "Aucune action critique en souffrance. Vue synthétique des candidatures, audits et échéances."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Alerte 1: Rapports d'audit */}
            <div
              className={`flex items-center justify-between p-3 bg-white rounded-xl border shadow-xs transition-all ${
                pendingReports.length > 0
                  ? "border-amber-300 ring-2 ring-amber-100"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                    pendingReports.length > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {pendingReports.length > 0
                      ? `${pendingReports.length} Rapport${pendingReports.length > 1 ? "s" : ""} à auditer`
                      : "Rapports d'Audit"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate" title={`${reports.length} rapports au total (${approvedReports.length} validés, ${reports.filter((r) => r.status === "paid").length} payés)`}>
                    {pendingReports.length > 0
                      ? "Soumis par les shoppers"
                      : `${reports.length} reçus • ${approvedReports.length} validés`}
                  </p>
                </div>
              </div>
              <Link href="/admin/missions">
                <Button
                  size="sm"
                  variant="outline"
                  className={`h-8 text-xs font-medium shrink-0 ml-1.5 ${
                    pendingReports.length > 0
                      ? "border-amber-400 bg-amber-50/80 text-amber-950 hover:bg-amber-100 font-bold"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pendingReports.length > 0 ? "Auditer" : "Consulter"}
                </Button>
              </Link>
            </div>

            {/* Alerte 2: Candidatures Shoppers */}
            <div
              className={`flex items-center justify-between p-3 bg-white rounded-xl border shadow-xs transition-all ${
                pendingApplications.length > 0
                  ? "border-blue-400 ring-2 ring-blue-100"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                    pendingApplications.length > 0
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {pendingApplications.length > 0
                      ? `${pendingApplications.length} Candidature${pendingApplications.length > 1 ? "s" : ""} en attente`
                      : "Candidatures Shoppers"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate" title={`${applications.length} reçues • ${approvedApplications.length} approuvées, ${submittedApplications.length} traitées`}>
                    {pendingApplications.length > 0
                      ? "À qualifier & planifier"
                      : `${applications.length} reçues • ${approvedApplications.length} approuvées`}
                  </p>
                </div>
              </div>
              <Link href="/admin/applications">
                <Button
                  size="sm"
                  variant="outline"
                  className={`h-8 text-xs font-medium shrink-0 ml-1.5 ${
                    pendingApplications.length > 0
                      ? "border-blue-400 bg-blue-50/80 text-blue-950 hover:bg-blue-100 font-bold"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pendingApplications.length > 0 ? "Valider" : `Gérer (${applications.length})`}
                </Button>
              </Link>
            </div>

            {/* Alerte 3: Paiements Shoppers */}
            <div
              className={`flex items-center justify-between p-3 bg-white rounded-xl border shadow-xs transition-all ${
                pendingPaymentsCount > 0
                  ? "border-emerald-400 ring-2 ring-emerald-100"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                    pendingPaymentsCount > 0
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {pendingPaymentsCount > 0
                      ? `${pendingPaymentsCount} Virement${pendingPaymentsCount > 1 ? "s" : ""}`
                      : "Paiements Shoppers"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {pendingPaymentsCount > 0
                      ? `${totalAmountPending.toLocaleString()} MAD en attente`
                      : `${totalAmountPaid.toLocaleString()} MAD versés`}
                  </p>
                </div>
              </div>
              <Link href="/admin/payments">
                <Button
                  size="sm"
                  variant="outline"
                  className={`h-8 text-xs font-medium shrink-0 ml-1.5 ${
                    pendingPaymentsCount > 0
                      ? "border-emerald-400 bg-emerald-50/80 text-emerald-950 hover:bg-emerald-100 font-bold"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pendingPaymentsCount > 0 ? "Payer" : "Finances"}
                </Button>
              </Link>
            </div>

            {/* Alerte 4: Missions ayant atteint la date limite */}
            <div
              className={`flex items-center justify-between p-3 bg-white rounded-xl border shadow-xs transition-all ${
                expiredMissions.length > 0
                  ? "border-rose-400 bg-rose-50/50 ring-2 ring-rose-100"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                    expiredMissions.length > 0
                      ? "bg-rose-100 text-rose-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${
                    expiredMissions.length > 0 ? "text-rose-950" : "text-slate-900"
                  }`}>
                    {expiredMissions.length > 0
                      ? `${expiredMissions.length} Mission${expiredMissions.length > 1 ? "s" : ""} Expirée${expiredMissions.length > 1 ? "s" : ""}`
                      : "Échéances Missions"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {expiredMissions.length > 0
                      ? "Date limite atteinte • À traiter"
                      : "Toutes dans les délais"}
                  </p>
                </div>
              </div>
              <Link href="/admin/missions?filter=expired">
                <Button
                  size="sm"
                  variant="outline"
                  className={`h-8 text-xs font-medium shrink-0 ml-1.5 ${
                    expiredMissions.length > 0
                      ? "border-rose-400 bg-rose-50/80 text-rose-900 hover:bg-rose-100 font-bold"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {expiredMissions.length > 0 ? "Gérer" : "Catalogue"}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* 3. LES 4 GRANDS PILIERS DE KPIS EXÉCUTIFS                       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 : Qualité & Approbation */}
        <Card className="bg-white border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Taux de Validation Audits
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold text-[#041F40]">
              {approvalRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-emerald-700">
                {approvedReports.length} approuvé{approvedReports.length > 1 ? "s" : ""}
              </span>{" "}
              sur {totalAuditedReports} rapport{totalAuditedReports > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        {/* KPI 2 : Missions Actives */}
        <Card className="bg-white border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Missions au Catalogue
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ListChecks className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold text-[#041F40]">
              {missions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-blue-700">
                {activeMissions.length} en cours
              </span>{" "}
              • {completedMissions.length} clôturée{completedMissions.length > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        {/* KPI 3 : Rémunérations & Finances */}
        <Card className="bg-white border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Rémunérations Shoppers
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-[#D6C799]/20 text-[#041F40] flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#041F40]" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold text-[#041F40]">
              {totalAmountPaid.toLocaleString()}{" "}
              <span className="text-base font-semibold text-slate-500">MAD</span>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-amber-700">
                +{totalAmountPending.toLocaleString()} MAD
              </span>{" "}
              en attente de virement
            </p>
          </CardContent>
        </Card>

        {/* KPI 4 : Connexions & Utilisateurs */}
        <Card className="bg-white border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Connexions Utilisateurs
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold text-[#041F40] flex items-baseline gap-2">
              <span>{activeUsers.length}</span>
              <span className="text-sm font-semibold text-slate-500">
                / {users.length} autorisés
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {activeShoppersCount} shoppers
              </span>
              <span>•</span>
              <span className="font-semibold text-purple-700">{activeClientsCount} clients</span>
              {inactiveUsers.length > 0 && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {inactiveUsers.length} suspendu{inactiveUsers.length > 1 ? "s" : ""}
                  </span>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* 4. VISUALISATIONS GRAPHIQUES & STATISTIQUES AVANCÉES           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique 1 : Statuts des Audits (PieChart) */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#041F40] flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#041F40]" />
              État des Audits de Visite
            </CardTitle>
            <CardDescription className="text-xs">
              Répartition des rapports validés, en attente ou rejetés.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-center">
            {auditStatusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={auditStatusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {auditStatusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground text-sm italic py-12">
                Aucun rapport enregistré pour le moment.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graphique 2 : Missions par Secteur (BarChart) */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#041F40] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#041F40]" />
              Missions par Secteur
            </CardTitle>
            <CardDescription className="text-xs">
              Volume des missions déployées par catégorie d'activité.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#041F40" radius={[4, 4, 0, 0]} name="Missions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground text-sm italic py-12">
                Aucune mission par secteur.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graphique 3 : Évolution des Inscriptions de Shoppers (LineChart) */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#041F40] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#041F40]" />
              Acquisition de Shoppers
            </CardTitle>
            <CardDescription className="text-xs">
              Évolution des nouveaux inscrits par mois en {new Date().getFullYear()}.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {registrationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month_name"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="shoppers"
                    stroke="#D6C799"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#041F40" }}
                    name="Nouveaux Shoppers"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground text-sm italic py-12">
                Données mensuelles indisponibles.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* 5. FLUX D'ACTIVITÉ EN DIRECT : RAPPORTS & CANDIDATURES         */}
      {/* ============================================================== */}
      <Tabs defaultValue="reports" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
            <TabsTrigger
              value="reports"
              className="flex items-center gap-2 text-xs font-semibold data-[state=active]:bg-[#041F40] data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4" />
              Derniers Rapports Soumis ({reports.length})
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="flex items-center gap-2 text-xs font-semibold data-[state=active]:bg-[#041F40] data-[state=active]:text-white"
            >
              <UserCheck className="w-4 h-4" />
              Dernières Candidatures ({applications.length})
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center gap-2 text-xs font-semibold data-[state=active]:bg-[#041F40] data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              Connexions & Utilisateurs ({users.length})
            </TabsTrigger>
          </TabsList>

          <Link href="/admin/missions">
            <Button variant="ghost" size="sm" className="text-xs text-[#041F40] hover:bg-slate-200">
              Voir tout le catalogue <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Tab Content 1: Derniers Rapports */}
        <TabsContent value="reports">
          <Card className="bg-white shadow-sm border overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-700 font-bold">
                  <tr>
                    <th className="p-3.5 pl-4">Shopper</th>
                    <th className="p-3.5">Mission & Enseigne</th>
                    <th className="p-3.5">Magasin / Ville</th>
                    <th className="p-3.5">Rémunération</th>
                    <th className="p-3.5">Date de Visite</th>
                    <th className="p-3.5">Statut Audit</th>
                    <th className="p-3.5 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentReports.length > 0 ? (
                    recentReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 pl-4 font-semibold text-slate-900">
                          {report.users?.name || report.user_name || "Shopper"}
                          <div className="text-[10px] text-muted-foreground font-normal">
                            {report.users?.email || report.user_email || ""}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-[#041F40]">
                            {report.missions?.title || report.mission_title || "Mission"}
                          </span>
                          <div className="text-[10px] text-muted-foreground">
                            {report.missions?.businessName || report.businessName || "Client"}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <Store className="w-3 h-3 text-slate-400" />
                            {report.nomMagazin || "Magasin"}
                          </div>
                          {report.ville && (
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {report.ville}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {report.reward || report.missions?.reward || 0} MAD
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {safeFormatDate(report.submitted_at || report.dateTimeMission)}
                        </td>
                        <td className="p-3.5">
                          {report.status === "approved" || report.status === "paid" ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                              Validé
                            </Badge>
                          ) : report.status === "refused" ? (
                            <Badge variant="destructive">Refusé</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
                              À auditer
                            </Badge>
                          )}
                        </td>
                        <td className="p-3.5 pr-4 text-right">
                          <Link href={`/admin/missions/${report.mission_id}/reports`}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold text-[#041F40] hover:bg-[#041F40]/10">
                              Examiner
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground italic">
                        Aucun rapport soumis pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab Content 2: Dernières Candidatures */}
        <TabsContent value="applications">
          <Card className="bg-white shadow-sm border overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-700 font-bold">
                  <tr>
                    <th className="p-3.5 pl-4">Candidat</th>
                    <th className="p-3.5">Mission Ciblée</th>
                    <th className="p-3.5">Date de Postulation</th>
                    <th className="p-3.5">Statut Candidature</th>
                    <th className="p-3.5 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApplications.length > 0 ? (
                    recentApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 pl-4 font-semibold text-slate-900">
                          {app.user_name || "Shopper"}
                          <div className="text-[10px] text-muted-foreground font-normal">
                            {app.email || ""}
                          </div>
                        </td>
                        <td className="p-3.5 font-semibold text-[#041F40]">
                          {app.mission_title || "Mission"}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {safeFormatDate(app.applied_at)}
                        </td>
                        <td className="p-3.5">
                          {app.status === "approved" ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                              Approuvée
                            </Badge>
                          ) : app.status === "submitted" || app.status === "completed" ? (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              Mission terminée
                            </Badge>
                          ) : app.status === "rejected" || app.status === "refused" ? (
                            <Badge variant="destructive">Rejetée</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">
                              En attente
                            </Badge>
                          )}
                        </td>
                        <td className="p-3.5 pr-4 text-right">
                          <Link href="/admin/applications">
                            <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold text-[#041F40] hover:bg-[#041F40]/10">
                              Gérer
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                        Aucune candidature reçue pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab Content 3: Connexions & Comptes Utilisateurs */}
        <TabsContent value="users">
          <Card className="bg-white shadow-sm border overflow-hidden">
            {/* Barre de recherche et filtres de connexion */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom, email, ville..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-8 h-9 text-xs border-slate-200 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 font-medium">Filtrer:</span>
                {[
                  { id: "all", label: `Tous (${users.length})` },
                  { id: "active", label: `Connexion active (${activeUsers.length})` },
                  { id: "inactive", label: `Suspendus (${inactiveUsers.length})` },
                  { id: "shopper", label: `Shoppers (${shoppersCount})` },
                  { id: "client", label: `Clients (${clientsCount})` },
                ].map((f) => (
                  <Button
                    key={f.id}
                    variant={userStatusFilter === f.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUserStatusFilter(f.id)}
                    className={`h-7 text-xs px-2.5 ${
                      userStatusFilter === f.id
                        ? "bg-[#041F40] text-white"
                        : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-700 font-bold">
                  <tr>
                    <th className="p-3.5 pl-4">Utilisateur</th>
                    <th className="p-3.5">Rôle</th>
                    <th className="p-3.5">Statut Connexion</th>
                    <th className="p-3.5">Ville</th>
                    <th className="p-3.5">Date Inscription</th>
                    <th className="p-3.5">Missions</th>
                    <th className="p-3.5 pr-4 text-right">Contrôle Accès</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsersList.length > 0 ? (
                    filteredUsersList.map((user) => {
                      const isSelfOrAdmin = user.role === "admin";
                      const isPendingToggle = isTogglingUser === user.id;

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5 pl-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8 border border-slate-200">
                                <AvatarImage src={user.profile_pic_url} alt={user.name} />
                                <AvatarFallback className="bg-[#041F40] text-[#D6C799] text-xs font-bold">
                                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-semibold text-slate-900 block">
                                  {user.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <Badge
                              variant="secondary"
                              className={`capitalize text-[10px] ${
                                user.role === "admin"
                                  ? "bg-slate-900 text-white"
                                  : user.role === "client"
                                  ? "bg-purple-100 text-purple-800 border-purple-200"
                                  : "bg-blue-100 text-blue-800 border-blue-200"
                              }`}
                            >
                              {user.role}
                            </Badge>
                          </td>

                          <td className="p-3.5">
                            {user.status === "active" ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-medium flex items-center gap-1 w-fit">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                Connexion Autorisée
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 border-red-300 font-medium flex items-center gap-1 w-fit">
                                <UserX className="w-3 h-3 text-red-600" />
                                Connexion Suspendue
                              </Badge>
                            )}
                          </td>

                          <td className="p-3.5 text-slate-600">
                            {user.city || "—"}
                          </td>

                          <td className="p-3.5 text-slate-600">
                            {safeFormatDate(user.registration_date)}
                          </td>

                          <td className="p-3.5 font-medium text-slate-700">
                            {user.role === "shopper" ? user.completed_missions_count ?? 0 : "—"}
                          </td>

                          <td className="p-3.5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isSelfOrAdmin ? (
                                <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200">
                                  Admin Protégé
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isPendingToggle}
                                  onClick={() => handleToggleUserConnection(user.id, user.status, user.name)}
                                  className={`h-7 text-xs font-semibold px-2.5 transition-colors ${
                                    user.status === "active"
                                      ? "border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                                  }`}
                                >
                                  {isPendingToggle ? (
                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                  ) : user.status === "active" ? (
                                    <UserX className="w-3 h-3 mr-1 text-red-600" />
                                  ) : (
                                    <UserCheck className="w-3 h-3 mr-1 text-emerald-600" />
                                  )}
                                  {user.status === "active" ? "Suspendre" : "Autoriser"}
                                </Button>
                              )}

                              <Link href={`/admin/users/${user.id}`}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-slate-600 hover:bg-slate-100 px-2"
                                >
                                  Détails
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground italic">
                        Aucun utilisateur trouvé avec ces critères de recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============================================================== */}
      {/* 6. RACCOURCIS OPÉRATIONNELS RAPIDES                            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <Link href="/admin/missions/new">
          <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-[#D6C799] hover:shadow-md transition-all group flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#041F40]/5 group-hover:bg-[#041F40] text-[#041F40] group-hover:text-[#D6C799] flex items-center justify-center transition-colors">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Nouvelle Mission</p>
                <p className="text-[11px] text-muted-foreground">Créer et planifier</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#041F40]" />
          </div>
        </Link>

        <Link href="/admin/stores">
          <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-[#D6C799] hover:shadow-md transition-all group flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#041F40]/5 group-hover:bg-[#041F40] text-[#041F40] group-hover:text-[#D6C799] flex items-center justify-center transition-colors">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Réseau Magasins</p>
                <p className="text-[11px] text-muted-foreground">Points de vente & Villes</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#041F40]" />
          </div>
        </Link>

        <Link href="/admin/payments">
          <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-[#D6C799] hover:shadow-md transition-all group flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#041F40]/5 group-hover:bg-[#041F40] text-[#041F40] group-hover:text-[#D6C799] flex items-center justify-center transition-colors">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Paiements & RIB</p>
                <p className="text-[11px] text-muted-foreground">Valider les virements</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#041F40]" />
          </div>
        </Link>

        <Link href="/admin/chat">
          <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-[#D6C799] hover:shadow-md transition-all group flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#041F40]/5 group-hover:bg-[#041F40] text-[#041F40] group-hover:text-[#D6C799] flex items-center justify-center transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Messagerie Directe</p>
                <p className="text-[11px] text-muted-foreground">Échanger avec les shoppers</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#041F40]" />
          </div>
        </Link>
      </div>
    </div>
  );
}
