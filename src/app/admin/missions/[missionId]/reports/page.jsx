"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  FileWarning,
  Calendar,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Store,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  DollarSign,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  FilterX,
  CreditCard,
  AlertCircle,
  Eye,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  FileDown,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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
import { Textarea } from "@/components/ui/textarea";
import { fetchMissions, patchMissions } from "@/services/fetchData";
import { format, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import DataPagination from "@/components/ui/data-pagination";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/";
const cleanApiBase = API_BASE_URL.endsWith("/")
  ? API_BASE_URL
  : `${API_BASE_URL}/`;

function safeFormatDate(dateStr, formatStr = "dd MMMM yyyy à HH:mm") {
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

// Composant pour rendre la valeur d'une réponse de question
function FormattedAnswer({ answer }) {
  if (!answer || answer.value === null || answer.value === undefined) {
    return <span className="text-muted-foreground italic text-xs">Non répondu</span>;
  }

  const { type, value } = answer;

  switch (type) {
    case "text":
    case "text_info":
      return (
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-medium">
          "{String(value)}"
        </div>
      );

    case "rating": {
      const ratingValue = Number(value) || 0;
      return (
        <div className="flex items-center gap-1.5 bg-amber-50/80 px-3 py-1.5 rounded-lg border border-amber-200 w-fit">
          <div className="flex text-amber-500 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < ratingValue ? "text-amber-500" : "text-slate-300"}>
                ★
              </span>
            ))}
          </div>
          <span className="text-xs font-bold text-amber-900 ml-1">
            {ratingValue} / 5
          </span>
        </div>
      );
    }

    case "choice":
    case "radio":
    case "multiple_choice":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-[#041F40]/10 text-[#041F40] border border-[#041F40]/20">
          {String(value)}
        </span>
      );

    case "checkboxes": {
      let selectedItems = [];
      if (typeof value === "object" && value !== null) {
        selectedItems = Object.entries(value)
          .filter(([_, v]) => v)
          .map(([k]) => k.replace(/^option_/, ""));
      } else if (Array.isArray(value)) {
        selectedItems = value;
      } else if (typeof value === "string") {
        selectedItems = [value];
      }

      return selectedItems.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedItems.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
            >
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic text-xs">Aucune option sélectionnée</span>
      );
    }

    case "gps_capture":
    case "capture": {
      if (value?.lat && value?.lng) {
        return (
          <a
            href={`https://www.google.com/maps?q=${value.lat},${value.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:underline font-semibold"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            Position GPS : Lat {Number(value.lat).toFixed(4)}, Lng {Number(value.lng).toFixed(4)}
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        );
      }
      return <span className="text-muted-foreground italic text-xs">Coordonnées non capturées</span>;
    }

    case "image_upload":
    case "upload": {
      const urls = Array.isArray(value) ? value : [value].filter(Boolean);
      return urls.length ? (
        <div className="flex gap-3 flex-wrap pt-1">
          {urls.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={url}
                alt={`Preuve photo ${i + 1}`}
                className="w-24 h-24 object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                Agrandir
              </div>
            </a>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic text-xs">Aucune image fournie</span>
      );
    }

    case "audio_recording":
    case "recording":
      return value ? (
        <audio controls src={value} className="w-full max-w-sm h-10 mt-1" />
      ) : (
        <span className="text-muted-foreground italic text-xs">Aucun enregistrement audio</span>
      );

    default:
      return (
        <div className="bg-slate-50 p-2.5 rounded text-xs font-mono">
          {typeof value === "object" ? JSON.stringify(value) : String(value)}
        </div>
      );
  }
}

// Carte détaillée d'un rapport individuel
function ReportCard({
  report,
  shopper,
  mission,
  onApprove,
  onRefuse,
  isProcessing,
}) {
  const [showFullSurvey, setShowFullSurvey] = useState(false);

  // Déterminer le statut et les styles associés
  const statusInfo = useMemo(() => {
    switch (report.status) {
      case "approved":
        return {
          label: "Rapport Validé",
          badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold",
          headerBg: "bg-emerald-50/50 border-emerald-200",
        };
      case "paid":
        return {
          label: "Rapport Payé",
          badgeClass: "bg-green-100 text-green-800 border-green-300 font-semibold",
          headerBg: "bg-green-50/50 border-green-200",
        };
      case "refused":
        return {
          label: "Rapport Refusé",
          badgeClass: "bg-red-100 text-red-800 border-red-300 font-semibold",
          headerBg: "bg-red-50/50 border-red-200",
        };
      case "submitted":
      default:
        return {
          label: "En attente d'évaluation",
          badgeClass: "bg-amber-100 text-amber-900 border-amber-300 font-semibold animate-pulse",
          headerBg: "bg-amber-50/40 border-amber-200",
        };
    }
  }, [report.status]);

  // Nombre de sections et questions
  const totalQuestionsCount = useMemo(() => {
    if (!Array.isArray(report.answers)) return 0;
    return report.answers.reduce(
      (sum, s) => sum + (Array.isArray(s.responses) ? s.responses.length : 0),
      0
    );
  }, [report.answers]);

  const reward = report.reward || mission?.reward || 0;

  return (
    <Card className="bg-white border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* En-tête de la carte rapport */}
      <div className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${statusInfo.headerBg}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#041F40] text-[#D6C799] font-extrabold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
            {shopper?.name ? shopper.name.charAt(0).toUpperCase() : "S"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-[#041F40]">
                {shopper?.name || report.user_name || `Shopper #${report.user_id}`}
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                (Rapport #{report.id})
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
              {(shopper?.email || report.user_email) && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {shopper?.email || report.user_email}
                </span>
              )}
              {(shopper?.telephone || report.user_telephone) && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {shopper?.telephone || report.user_telephone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground block">
              Soumis le {safeFormatDate(report.submitted_at, "dd/MM/yyyy HH:mm")}
            </span>
          </div>
          <Badge className={`text-xs px-3 py-1 border ${statusInfo.badgeClass}`}>
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* ============================================================== */}
        {/* CARTOUCHE DÉTAILLÉ DES INFOS DE LA MISSION / VISITE            */}
        {/* ============================================================== */}
        <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 border-b pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#041F40] flex items-center gap-1.5">
              <Store className="w-4 h-4 text-[#041F40]" />
              Informations sur la Visite Réalisée
            </h4>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#041F40] text-[#D6C799]">
              Rémunération : {reward} MAD
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* 1. Magasin */}
            <div className="space-y-1">
              <span className="text-muted-foreground font-semibold flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-slate-500" />
                Magasin / Point de vente
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {report.nomMagazin || mission?.businessName || "Magasin"}
              </p>
              {mission?.businessName && report.nomMagazin !== mission.businessName && (
                <p className="text-[11px] text-slate-500 font-medium">
                  Enseigne : {mission.businessName}
                </p>
              )}
            </div>

            {/* 2. Emplacement & Ville */}
            <div className="space-y-1">
              <span className="text-muted-foreground font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Ville & Emplacement
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {report.ville || mission?.ville || mission?.location || "Maroc"}
              </p>
              {report.specificStoreAddress && (
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {report.specificStoreAddress}
                </p>
              )}
            </div>

            {/* 3. Date & heure de la visite */}
            <div className="space-y-1">
              <span className="text-muted-foreground font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Date de la Visite Mystère
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {safeFormatDate(report.dateTimeMission || report.submitted_at)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Enregistrée par le shopper
              </p>
            </div>

            {/* 4. Scénario testé */}
            <div className="space-y-1">
              <span className="text-muted-foreground font-semibold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Scénario / Protocole
              </span>
              {report.scenario && report.scenario.startsWith("http") ? (
                <a
                  href={report.scenario}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#041F40] font-bold underline hover:text-blue-700"
                >
                  <Download className="w-3 h-3" />
                  Consulter le PDF scénario
                </a>
              ) : (
                <p className="font-semibold text-slate-800 line-clamp-2">
                  {report.scenario || mission?.scenario || "Scénario standard"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Motif du refus (si refusé) */}
        {report.status === "refused" && report.refusal_reason && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-red-900">Motif du refus notifié au shopper :</p>
              <p className="text-red-800 mt-1">{report.refusal_reason}</p>
            </div>
          </div>
        )}

        {/* Référence de virement (si payé) */}
        {report.status === "paid" && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="font-bold text-emerald-900">Paiement effectué avec succès</span>
                {report.reference_paiement && (
                  <p className="text-emerald-700 font-mono mt-0.5">
                    Réf de transaction : {report.reference_paiement}
                  </p>
                )}
              </div>
            </div>
            <Link href="/admin/payments">
              <Button size="sm" variant="outline" className="h-8 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100">
                Voir dans Paiements
              </Button>
            </Link>
          </div>
        )}

        {/* ============================================================== */}
        {/* DÉPLIANT DU QUESTIONNAIRE COMPLET                              */}
        {/* ============================================================== */}
        <div className="border rounded-2xl overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setShowFullSurvey(!showFullSurvey)}
            className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100 border-b flex items-center justify-between text-xs font-bold text-[#041F40] transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#041F40]" />
              <span>
                {showFullSurvey
                  ? "Masquer le questionnaire d'évaluation"
                  : `Consulter les réponses du questionnaire (${totalQuestionsCount} questions)`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="text-[11px] font-normal">
                {showFullSurvey ? "Replier" : "Déplier"}
              </span>
              {showFullSurvey ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {showFullSurvey && (
            <div className="p-5 sm:p-6 space-y-8 bg-slate-50/40">
              {Array.isArray(report.answers) && report.answers.length > 0 ? (
                report.answers.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-4">
                    {/* Titre de la section */}
                    <div className="flex items-center gap-2.5 border-b pb-2">
                      <div className="w-6 h-6 rounded-lg bg-[#041F40] text-[#D6C799] font-bold text-xs flex items-center justify-center">
                        {sIdx + 1}
                      </div>
                      <h5 className="font-extrabold text-sm text-[#041F40]">
                        {section.section_header || `Section ${sIdx + 1}`}
                      </h5>
                    </div>

                    {/* Liste des questions / réponses */}
                    <div className="grid gap-3.5 pl-2">
                      {Array.isArray(section.responses) && section.responses.length > 0 ? (
                        section.responses.map((q, qIdx) => (
                          <div
                            key={qIdx}
                            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-2 hover:border-[#D6C799]/80 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-xs font-bold text-slate-900 leading-snug">
                                {qIdx + 1}. {q.question}
                              </p>
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0">
                                {q.type || "Réponse"}
                              </span>
                            </div>

                            <div className="pt-1">
                              <FormattedAnswer answer={q} />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic pl-2">
                          Aucune réponse dans cette section.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground italic">
                  Aucune donnée de questionnaire enregistrée dans ce rapport.
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* ============================================================== */}
      {/* BARRE D'ACTIONS DU RAPPORT (APPROUVER / REFUSER)               */}
      {/* ============================================================== */}
      <CardFooter className="p-4 bg-slate-50 border-t flex flex-wrap justify-between items-center gap-3">
        <div className="text-xs text-muted-foreground font-medium">
          {report.status === "submitted" ? (
            <span className="text-amber-800 font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Ce rapport requiert votre validation pour déclencher le virement.
            </span>
          ) : report.status === "approved" ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Rapport validé • Virement en attente dans la gestion des paiements.
            </span>
          ) : report.status === "refused" ? (
            <span className="text-red-700 font-semibold flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              Rapport rejeté.
            </span>
          ) : (
            <span className="text-green-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Rapport payé.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {report.status === "submitted" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRefuse(report)}
                disabled={isProcessing}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Refuser le rapport
              </Button>

              <Button
                size="sm"
                onClick={() => onApprove(report.id)}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                )}
                Valider & Débloquer {reward} MAD
              </Button>
            </>
          )}

          {report.status === "approved" && (
            <Link href="/admin/payments">
              <Button
                size="sm"
                className="bg-[#041F40] hover:bg-[#041F40]/90 text-[#D6C799] font-bold"
              >
                <CreditCard className="w-4 h-4 mr-1.5" />
                Payer {reward} MAD
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// Page principale de revue des rapports d'une mission
export default function AdminReviewReportsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const missionId = params.missionId;

  const [mission, setMission] = useState(null);
  const [reports, setReports] = useState([]);
  const [mockUsers, setMockUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingReportId, setProcessingReportId] = useState(null);
  const [refusalReason, setRefusalReason] = useState("");
  const [reportToRefuse, setReportToRefuse] = useState(null);

  // Filtres
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const results = await Promise.allSettled([
        fetchMissions("admin-missions", `${cleanApiBase}missions/admin/all`),
        fetchMissions("admin-reports", `${cleanApiBase}reports`),
        fetchMissions("admin-users", `${cleanApiBase}users`),
      ]);

      const m =
        results[0].status === "fulfilled" && Array.isArray(results[0].value)
          ? results[0].value
          : [];
      const r =
        results[1].status === "fulfilled" && Array.isArray(results[1].value)
          ? results[1].value
          : [];
      const u =
        results[2].status === "fulfilled" && Array.isArray(results[2].value)
          ? results[2].value
          : [];

      setMockUsers(u || []);

      let foundMission = m.find((item) => item.id === parseInt(missionId, 10));

      if (!foundMission) {
        try {
          const singleMission = await fetchMissions(
            "mission-" + missionId,
            `${cleanApiBase}missions/${missionId}`
          );
          foundMission = Array.isArray(singleMission)
            ? singleMission[0]
            : singleMission;
        } catch (e) {}
      }

      const foundReports = (r || [])
        .filter((report) => report.mission_id === parseInt(missionId, 10))
        .map((report) => {
          let parsedAnswers = [];
          try {
            parsedAnswers =
              typeof report.answers === "string"
                ? JSON.parse(report.answers)
                : report.answers || [];
          } catch (e) {}
          return {
            ...report,
            answers: parsedAnswers,
          };
        });

      if (foundMission) {
        setMission(foundMission);
      }
      setReports(foundReports);
    } catch (error) {
      console.error("Échec du chargement des rapports:", error);
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Impossible de charger les données des rapports.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [missionId, toast]);

  useEffect(() => {
    if (missionId) {
      fetchData();
    }
  }, [missionId, fetchData]);

  // Validation d'un rapport
  const handleApprove = async (reportId) => {
    setProcessingReportId(reportId);

    try {
      const result = await patchMissions(
        `${cleanApiBase}reports/admin/${reportId}/status`,
        { status: "approved" },
        "admin-reports"
      );

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: "approved" } : r
        )
      );

      toast({
        title: "Rapport approuvé avec succès !",
        description:
          "Le rapport a été validé. La mission est désormais prête pour le paiement dans la section Paiements.",
      });
    } catch (e) {
      console.error("Erreur approbation rapport:", e);
      toast({
        variant: "destructive",
        title: "Erreur lors de la validation",
        description: e.message || "Une erreur est survenue.",
      });
    } finally {
      setProcessingReportId(null);
    }
  };

  // Refus d'un rapport
  const handleRefuse = async () => {
    if (!refusalReason.trim() || !reportToRefuse) return;

    setProcessingReportId(reportToRefuse.id);

    try {
      const res = await fetch(
        `${cleanApiBase}reports/admin/${reportToRefuse.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "refused",
            refusal_reason: refusalReason,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Erreur: ${res.status}`);
      }

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportToRefuse.id
            ? { ...r, status: "refused", refusal_reason: refusalReason }
            : r
        )
      );

      toast({
        title: "Rapport refusé",
        description: "Le shopper a été notifié du motif du refus.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Erreur lors du refus",
        description: e.message || "Impossible de refuser le rapport.",
      });
    } finally {
      setProcessingReportId(null);
      setReportToRefuse(null);
      setRefusalReason("");
    }
  };

  // Filtrage des rapports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "submitted" && r.status === "submitted") ||
        (statusFilter === "approved" && (r.status === "approved" || r.status === "paid")) ||
        (statusFilter === "refused" && r.status === "refused");

      const term = searchQuery.trim().toLowerCase();
      const shopper = mockUsers.find((u) => u.id === r.user_id);
      const matchesSearch =
        !term ||
        shopper?.name?.toLowerCase().includes(term) ||
        r.user_name?.toLowerCase().includes(term) ||
        r.nomMagazin?.toLowerCase().includes(term) ||
        r.ville?.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [reports, statusFilter, searchQuery, mockUsers]);

  // Pagination des rapports d'audit
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const sanitizePdfText = (str) => {
    if (str === null || str === undefined) return "";
    return String(str)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, " ");
  };

  const exportPDF = () => {
    if (!reports.length) {
      toast({
        title: "Export impossible",
        description: "Aucun rapport à exporter pour cette mission.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExportingPDF(true);
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = 210;
      const marginX = 14;

      // Bannière supérieure Emberton Navy
      doc.setFillColor(4, 31, 64);
      doc.rect(0, 0, pageWidth, 26, "F");
      // Filet d'accent Or
      doc.setFillColor(214, 199, 153);
      doc.rect(0, 26, pageWidth, 2.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(214, 199, 153);
      doc.text("RAPPORT D'AUDIT QUALITE & VISITE MYSTERE - EMBERTON GROUP", marginX, 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(
        "Synthese Executive des Visites Mysteres et Audits de Conformite Realises",
        marginX,
        19
      );

      // Fiche de synthèse
      autoTable(doc, {
        startY: 33,
        theme: "plain",
        body: [
          [
            "Enseigne Client :",
            sanitizePdfText(mission?.businessName || "Non specifiee"),
            "Date d'Export :",
            new Date().toLocaleDateString("fr-FR"),
          ],
          [
            "Mission :",
            sanitizePdfText(mission?.title || "Audit Mystere"),
            "Rapports valides :",
            `${approvedCount} / ${reports.length}`,
          ],
          [
            "Categorie :",
            sanitizePdfText(mission?.category || "Standard"),
            "Statut Mission :",
            sanitizePdfText(mission?.status || "Active"),
          ],
        ],
        styles: { fontSize: 8.5, cellPadding: 2, textColor: [4, 31, 64] },
        columnStyles: {
          0: { fontStyle: "bold", width: 35 },
          1: { width: 65 },
          2: { fontStyle: "bold", width: 35 },
          3: { width: 50 },
        },
      });

      // Tableau détaillé des rapports
      const tableRows = filteredReports.map((r) => {
        const u = mockUsers.find((user) => String(user.id) === String(r.user_id));
        return [
          `#${r.id}`,
          sanitizePdfText(r.nomMagazin || "Point de vente"),
          sanitizePdfText(r.ville || "Maroc"),
          safeFormatDate(r.dateTimeMission || r.submitted_at, "dd/MM/yyyy"),
          sanitizePdfText(u?.name || `Shopper #${r.user_id}`),
          r.status === "approved"
            ? "Valide"
            : r.status === "paid"
              ? "Paye"
              : r.status === "refused"
                ? "Refuse"
                : "En attente",
          `${r.reward || mission?.reward || 0} MAD`,
        ];
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [
          [
            "ID",
            "Magasin",
            "Ville",
            "Date Visite",
            "Auditeur",
            "Statut",
            "Remuneration",
          ],
        ],
        body: tableRows,
        theme: "striped",
        headStyles: {
          fillColor: [4, 31, 64],
          textColor: [214, 199, 153],
          fontStyle: "bold",
          fontSize: 8,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 7.5,
          cellPadding: 2.5,
          halign: "center",
        },
        columnStyles: {
          1: { halign: "left", fontStyle: "bold" },
          4: { halign: "left" },
        },
      });

      // Pagination pied de page
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7.5);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Emberton Group - Document Confidentiel - Page ${p} / ${totalPages}`,
          pageWidth / 2,
          290,
          { align: "center" }
        );
      }

      const cleanTitle = sanitizePdfText(mission?.title || "Mission").replace(/\s+/g, "_");
      doc.save(`Rapport_Audit_Admin_${cleanTitle}_${new Date().toISOString().slice(0, 10)}.pdf`);

      toast({
        title: "Rapport PDF téléchargé avec succès",
        description: `Le document exécutif (${totalPages} page(s)) a été généré.`,
      });
    } catch (err) {
      console.error("Erreur PDF:", err);
      toast({
        variant: "destructive",
        title: "Erreur PDF",
        description: "Impossible de générer le rapport PDF.",
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage, itemsPerPage]);

  // Métriques
  const pendingCount = reports.filter((r) => r.status === "submitted").length;
  const approvedCount = reports.filter((r) => r.status === "approved" || r.status === "paid").length;
  const refusedCount = reports.filter((r) => r.status === "refused").length;

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 flex flex-col justify-center items-center space-y-4">
        <Loader2 className="animate-spin w-10 h-10 text-[#041F40]" />
        <span className="text-sm font-semibold text-slate-600">
          Chargement des rapports de la mission...
        </span>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="container mx-auto py-16 text-center text-muted-foreground space-y-4 max-w-md">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-[#041F40]">
          <FileWarning className="w-6 h-6" />
        </div>
        <p className="text-lg font-bold text-[#041F40]">Mission introuvable</p>
        <p className="text-xs">Impossible de charger les données associées à cette mission.</p>
        <Button
          variant="default"
          size="sm"
          onClick={() => router.push("/admin/missions")}
          className="bg-[#041F40] text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Retour au catalogue des missions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ============================================================== */}
      {/* 1. HEADER MISSION & FIL D'ARIANE                              */}
      {/* ============================================================== */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/admin/missions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#041F40] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à toutes les missions
          </Link>

          <Button
            onClick={() => fetchData(true)}
            variant="ghost"
            size="sm"
            disabled={isRefreshing}
            className="text-xs text-[#041F40] hover:bg-slate-100 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualiser les rapports
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-t pt-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6C799] bg-[#041F40] px-3 py-1 rounded-full">
                {mission.category || "Visite Mystère"}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">
                {mission.businessName || "Enseigne partenaire"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#041F40]">
              Rapports d'évaluation : {mission.title}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
              <span>{mission.location || "Maroc"}</span>
              <span>•</span>
              <span>Rémunération par visite : <strong>{mission.reward || 0} MAD</strong></span>
              {mission.deadline && (
                <>
                  <span>•</span>
                  <span>Date limite : {safeFormatDate(mission.deadline, "dd/MM/yyyy")}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={exportPDF}
              disabled={reports.length === 0 || isExportingPDF}
              className="bg-[#041F40] hover:bg-[#0c2b54] text-[#D6C799] font-bold text-xs h-10 px-4 rounded-xl gap-2 shadow-sm transition-all"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération PDF...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  Exporter Rapport PDF Exécutif
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. STATISTIQUES DES RAPPORTS DE CETTE MISSION                  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-slate-500">
              Total Rapports Reçus
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-[#041F40]">
              {reports.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Visites enregistrées</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/70 border-amber-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-amber-800">
              En Attente d'Évaluation
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-amber-900">
              {pendingCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-amber-700 font-semibold">
              Nécessitent une validation
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/70 border-emerald-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-emerald-800">
              Rapports Approuvés
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-emerald-900">
              {approvedCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-700 font-semibold">
              Validés et/ou payés
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-50/70 border-red-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-red-800">
              Rapports Refusés
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-red-900">
              {refusedCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-700 font-semibold">Non conformes</p>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* 3. BARRE DE FILTRAGE & RECHERCHE                               */}
      {/* ============================================================== */}
      <Card className="bg-white p-4 border shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Boutons filtres statut */}
          <div className="flex bg-slate-100 p-1 rounded-xl border w-full md:w-auto">
            {[
              { key: "all", label: `Tous (${reports.length})` },
              { key: "submitted", label: `À Auditer (${pendingCount})` },
              { key: "approved", label: `Validés (${approvedCount})` },
              { key: "refused", label: `Refusés (${refusedCount})` },
            ].map((tab) => (
              <Button
                key={tab.key}
                size="sm"
                variant={statusFilter === tab.key ? "default" : "ghost"}
                onClick={() => setStatusFilter(tab.key)}
                className={`text-xs h-8 px-3 rounded-lg font-bold flex-1 md:flex-none ${
                  statusFilter === tab.key
                    ? "bg-[#041F40] text-white shadow-sm"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Recherche */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher shopper, magasin, ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* ============================================================== */}
      {/* 4. LISTE DES RAPPORTS                                          */}
      {/* ============================================================== */}
      <div className="space-y-6">
        {paginatedReports.length > 0 ? (
          <>
            {paginatedReports.map((report) => {
              const shopper = mockUsers.find((u) => u.id === report.user_id);
              return (
                <ReportCard
                  key={report.id}
                  report={report}
                  shopper={shopper}
                  mission={mission}
                  onApprove={handleApprove}
                  onRefuse={(r) => setReportToRefuse(r)}
                  isProcessing={processingReportId === report.id}
                />
              );
            })}

            {/* Pagination des rapports */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <DataPagination
                currentPage={currentPage}
                totalItems={filteredReports.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemLabel="rapport(s)"
              />
            </div>
          </>
        ) : (
          <Card className="bg-white border p-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">
              Aucun rapport trouvé
            </p>
            <p className="text-xs mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Aucun rapport ne correspond à vos filtres actuels."
                : "Les shoppers n'ont pas encore soumis de rapport pour cette mission."}
            </p>
            {(searchQuery || statusFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
                className="mt-4 text-xs"
              >
                <FilterX className="w-3.5 h-3.5 mr-1.5" />
                Réinitialiser les filtres
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* ============================================================== */}
      {/* 5. MODAL DE REFUS DE RAPPORT                                   */}
      {/* ============================================================== */}
      <AlertDialog
        open={!!reportToRefuse}
        onOpenChange={(open) => {
          if (!open) {
            setReportToRefuse(null);
            setRefusalReason("");
          }
        }}
      >
        <AlertDialogContent className="bg-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Refuser le rapport de visite ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              Veuillez préciser la raison exacte du refus. Ce motif sera directement transmis au shopper par notification pour lui expliquer pourquoi la visite n'est pas validée.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <Textarea
              value={refusalReason}
              onChange={(e) => setRefusalReason(e.target.value)}
              placeholder="Ex: Photos non conformes au protocole, visite effectuée hors du créneau horaire imparti..."
              rows={4}
              className="text-xs"
              required
            />
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={!!processingReportId}
              onClick={() => {
                setReportToRefuse(null);
                setRefusalReason("");
              }}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!refusalReason.trim() || !!processingReportId}
              onClick={handleRefuse}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {processingReportId ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : null}
              Confirmer le refus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
