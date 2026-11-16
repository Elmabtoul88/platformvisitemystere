"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import {
  Star,
  FileDown,
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Store,
  Search,
  AlertTriangle,
  TrendingUp,
  Award,
  Camera,
  ExternalLink,
  MessageSquare,
  BarChart3,
  ListChecks,
  Calendar,
  Layers,
  Loader2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { fetchMissions } from "@/services/fetchData";
import RadarChart, {
  MissionAverageRadarChart,
  MultiStoreRadarChart,
} from "@/components/radar-chart";
import DataPagination from "@/components/ui/data-pagination";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/";

// Formateur de date sécurisé anti-crash
const safeFormatDate = (dateVal, formatStr = "dd/MM/yyyy", options = {}) => {
  if (!dateVal) return "N/A";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "N/A";
    return format(d, formatStr, options);
  } catch (e) {
    return "N/A";
  }
};

export default function ClientMissionDashboard() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const missionId = params?.missionId;

  const [missionInfo, setMissionInfo] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Filtres
  const [selectedVille, setSelectedVille] = useState("all");
  const [selectedStore, setSelectedStore] = useState("all");
  const [searchQuestion, setSearchQuestion] = useState("");

  // Pagination des listes & tableaux
  const [pageQuestions, setPageQuestions] = useState(1);
  const [questionsPerPage, setQuestionsPerPage] = useState(10);

  const [pageVerbatims, setPageVerbatims] = useState(1);
  const [verbatimsPerPage, setVerbatimsPerPage] = useState(6);

  const [pageReports, setPageReports] = useState(1);
  const [reportsPerPage, setReportsPerPage] = useState(10);

  const [pageStores, setPageStores] = useState(1);
  const [storesPerPage, setStoresPerPage] = useState(8);

  // Réinitialisation des pages lors d'un changement de filtre
  useEffect(() => {
    setPageQuestions(1);
    setPageVerbatims(1);
    setPageReports(1);
    setPageStores(1);
  }, [selectedVille, selectedStore, searchQuestion]);

  useEffect(() => {
    if (!missionId) return;

    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // Chargement parallèle : Mission info + Rapports approuvés/payés
        const [missionRes, reportsRes] = await Promise.allSettled([
          fetchMissions(
            "client-mission-" + missionId,
            `${API_BASE_URL}clients/mission/${missionId}`,
          ),
          fetchMissions(
            "client-reports-" + missionId,
            `${API_BASE_URL}clients/reports/${missionId}`,
          ),
        ]);

        if (!isMounted) return;

        let foundMission = null;
        if (missionRes.status === "fulfilled" && missionRes.value) {
          const m = Array.isArray(missionRes.value)
            ? missionRes.value[0]
            : missionRes.value;
          foundMission = m || null;
          setMissionInfo(foundMission);
        } else {
          console.warn("Échec récupération mission client:", missionRes.reason);
          setErrorMessage(
            "Accès refusé ou mission introuvable. Veuillez vérifier vos autorisations.",
          );
        }

        if (reportsRes.status === "fulfilled" && reportsRes.value) {
          setReports(Array.isArray(reportsRes.value) ? reportsRes.value : []);
        } else {
          setReports([]);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Erreur chargement dashboard client:", err);
        setErrorMessage("Une erreur est survenue lors de la récupération des données.");
        toast({
          title: "Erreur",
          description: "Impossible de charger les données d'analyse.",
          variant: "destructive",
        });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [missionId, toast]);

  // Rapports filtrés par ville et par magasin
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchVille = selectedVille === "all" || r.ville === selectedVille;
      const matchStore =
        selectedStore === "all" || r.nomMagazin === selectedStore;
      return matchVille && matchStore;
    });
  }, [reports, selectedVille, selectedStore]);

  // Liste des villes et magasins disponibles pour les sélecteurs
  const availableVilles = useMemo(() => {
    const set = new Set();
    reports.forEach((r) => {
      if (r.ville) set.add(r.ville);
    });
    return Array.from(set).sort();
  }, [reports]);

  const availableStores = useMemo(() => {
    const set = new Set();
    reports.forEach((r) => {
      if (selectedVille === "all" || r.ville === selectedVille) {
        if (r.nomMagazin) set.add(r.nomMagazin);
      }
    });
    return Array.from(set).sort();
  }, [reports, selectedVille]);

  // =========================================================================
  // NORMALISATION STRUCTURÉE DES RÉPONSES
  // =========================================================================
  const parsedReportsData = useMemo(() => {
    return filteredReports.map((report) => {
      let rawSections = [];
      try {
        rawSections =
          typeof report.answers === "string"
            ? JSON.parse(report.answers)
            : report.answers || [];
      } catch (e) {
        rawSections = [];
      }

      let sections = [];
      if (
        Array.isArray(rawSections) &&
        rawSections.length > 0 &&
        rawSections[0]?.responses
      ) {
        sections = rawSections.map((sec) => ({
          header: sec.section_header || sec.section_title || "Général",
          responses: sec.responses || [],
        }));
      } else if (Array.isArray(rawSections)) {
        sections = [{ header: "Évaluation globale", responses: rawSections }];
      }

      return {
        id: report.id,
        date: report.dateTimeMission || report.submitted_at,
        nomMagazin: report.nomMagazin || "Point de vente",
        ville: report.ville || "N/A",
        sections,
      };
    });
  }, [filteredReports]);

  // =========================================================================
  // CALCUL DES SCORES PAR SECTION (RADAR & BARRES)
  // =========================================================================
  const { normalizedSections, sectionScoresSummary } = useMemo(() => {
    if (!parsedReportsData.length) {
      return { normalizedSections: [], sectionScoresSummary: [] };
    }

    const sectionTotals = {};

    const byStoreAndSection = parsedReportsData.map((report) => {
      const storeSections = {};

      report.sections.forEach((sec) => {
        let obtained = 0;
        let max = 0;

        sec.responses.forEach((q) => {
          if (q.type === "rating") {
            const val = Number(q.value);
            if (!isNaN(val) && val > 0) {
              obtained += Math.min(Math.max(val, 1), 5);
              max += 5;
            }
          } else if (q.type === "checkboxes") {
            const valObj = q.value || {};
            const keys = Object.keys(valObj).filter((k) => valObj[k] === true);
            if (keys.length > 0) {
              max += 1;
              const normalized = keys[0].toLowerCase().trim();
              if (
                normalized.includes("oui") ||
                normalized.includes("yes") ||
                normalized.includes("conforme") ||
                normalized.includes("satisfaisant") ||
                normalized.includes("très bon") ||
                normalized.includes("bon")
              ) {
                obtained += 1;
              } else if (
                normalized.includes("non") ||
                normalized.includes("no") ||
                normalized.includes("insatisfaisant") ||
                normalized.includes("mauvais")
              ) {
                obtained += 0;
              } else {
                obtained += 1;
              }
            }
          } else if (q.type === "multiple_choice") {
            if (q.value !== null && q.value !== undefined && q.value !== "") {
              max += 1;
              const valStr = String(q.value).toLowerCase().trim();
              if (
                valStr.includes("oui") ||
                valStr.includes("conforme") ||
                valStr.includes("très") ||
                valStr.includes("bon")
              ) {
                obtained += 1;
              } else if (
                valStr.includes("non") ||
                valStr.includes("mauvais") ||
                valStr.includes("insatisfaisant")
              ) {
                obtained += 0;
              } else {
                obtained += 1;
              }
            }
          } else if (q.type === "yes_no") {
            if (q.value !== null && q.value !== undefined && q.value !== "") {
              max += 1;
              const valStr = String(q.value).toLowerCase().trim();
              if (valStr === "oui" || valStr === "yes" || q.value === true) {
                obtained += 1;
              }
            }
          }
        });

        const scorePercent =
          max > 0 ? Number(((obtained / max) * 100).toFixed(1)) : 100;
        storeSections[sec.header] = scorePercent;

        if (!sectionTotals[sec.header]) {
          sectionTotals[sec.header] = { obtained: 0, max: 0 };
        }
        sectionTotals[sec.header].obtained += obtained;
        sectionTotals[sec.header].max += max;
      });

      return {
        nomMagazin: report.nomMagazin,
        ville: report.ville,
        sections: storeSections,
      };
    });

    const summary = Object.entries(sectionTotals).map(([name, data]) => {
      const score =
        data.max > 0 ? Number(((data.obtained / data.max) * 100).toFixed(1)) : 100;
      return {
        name,
        score,
      };
    });

    return {
      normalizedSections: byStoreAndSection,
      sectionScoresSummary: summary,
    };
  }, [parsedReportsData]);

  // =========================================================================
  // INDICATEURS CLÉS (KPIS) CORRIGÉS
  // =========================================================================
  const kpis = useMemo(() => {
    const totalReports = filteredReports.length;
    const targetStoresCount =
      missionInfo?.stores?.length || (totalReports > 0 ? totalReports : 0);

    if (totalReports === 0) {
      return {
        totalReports: 0,
        targetStoresCount,
        globalScorePercent: 0,
        ratingOutOfFive: 0,
        conformityRate: 0,
        storesAudited: 0,
        citiesAudited: 0,
      };
    }

    let totalObtained = 0;
    let totalMax = 0;
    let totalYes = 0;
    let totalEvaluatedYesNo = 0;

    parsedReportsData.forEach((rep) => {
      rep.sections.forEach((sec) => {
        sec.responses.forEach((q) => {
          if (q.type === "rating") {
            const val = Number(q.value);
            if (!isNaN(val) && val > 0) {
              totalObtained += Math.min(Math.max(val, 1), 5);
              totalMax += 5;
            }
          } else if (q.type === "checkboxes" || q.type === "multiple_choice") {
            let str = "";
            if (q.type === "checkboxes") {
              const keys = Object.keys(q.value || {}).filter(
                (k) => q.value[k] === true,
              );
              if (keys.length) str = keys[0];
            } else {
              str = String(q.value || "");
            }

            if (str) {
              const normalized = str.toLowerCase().trim();
              const isPositive =
                normalized.includes("oui") ||
                normalized.includes("yes") ||
                normalized.includes("conforme");
              const isNegative =
                normalized.includes("non") ||
                normalized.includes("no") ||
                normalized.includes("pas");

              if (isPositive || isNegative) {
                totalEvaluatedYesNo++;
                if (isPositive) {
                  totalYes++;
                  totalObtained += 1;
                }
                totalMax += 1;
              } else {
                totalObtained += 1;
                totalMax += 1;
              }
            }
          } else if (q.type === "yes_no") {
            if (q.value !== null && q.value !== undefined && q.value !== "") {
              const valStr = String(q.value).toLowerCase().trim();
              const isPositive = valStr === "oui" || valStr === "yes" || q.value === true;
              const isNegative = valStr === "non" || valStr === "no" || q.value === false;

              if (isPositive || isNegative) {
                totalEvaluatedYesNo++;
                if (isPositive) {
                  totalYes++;
                  totalObtained += 1;
                }
                totalMax += 1;
              } else {
                totalObtained += 1;
                totalMax += 1;
              }
            }
          }
        });
      });
    });

    const globalScorePercent =
      totalMax > 0
        ? Number(((totalObtained / totalMax) * 100).toFixed(1))
        : 100;

    const ratingOutOfFive = Number(
      ((globalScorePercent / 100) * 5).toFixed(1),
    );

    const conformityRate =
      totalEvaluatedYesNo > 0
        ? Number(((totalYes / totalEvaluatedYesNo) * 100).toFixed(1))
        : globalScorePercent;

    const storesAudited = new Set(filteredReports.map((r) => r.nomMagazin)).size;
    const citiesAudited = new Set(filteredReports.map((r) => r.ville)).size;

    return {
      totalReports,
      targetStoresCount,
      globalScorePercent,
      ratingOutOfFive,
      conformityRate,
      storesAudited,
      citiesAudited,
    };
  }, [filteredReports, parsedReportsData, missionInfo]);

  // =========================================================================
  // ANALYSE DÉTAILLÉE PAR QUESTION (MATRICE)
  // =========================================================================
  const questionsAnalysis = useMemo(() => {
    const map = {};

    parsedReportsData.forEach((rep) => {
      rep.sections.forEach((sec) => {
        sec.responses.forEach((q) => {
          if (
            !q.question ||
            q.type === "text" ||
            q.type === "textarea" ||
            q.type === "date" ||
            q.type === "time" ||
            q.type === "number" ||
            q.type === "image_upload" ||
            q.type === "gps_capture" ||
            q.type === "audio_recording" ||
            q.type === "section_header" ||
            q.type === "info_text"
          )
            return;

          if (!map[q.question]) {
            map[q.question] = {
              question: q.question,
              section: sec.header,
              type: q.type,
              ratings: [],
              positiveCount: 0,
              totalCount: 0,
            };
          }

          if (q.type === "rating") {
            const v = Number(q.value);
            if (!isNaN(v) && v > 0) {
              map[q.question].ratings.push(v);
            }
          } else if (q.type === "yes_no") {
            if (q.value !== null && q.value !== undefined && q.value !== "") {
              map[q.question].totalCount++;
              const valStr = String(q.value).toLowerCase().trim();
              if (valStr === "oui" || valStr === "yes" || q.value === true) {
                map[q.question].positiveCount++;
              }
            }
          } else if (q.type === "checkboxes" || q.type === "multiple_choice") {
            let str = "";
            if (q.type === "checkboxes") {
              const keys = Object.keys(q.value || {}).filter(
                (k) => q.value[k] === true,
              );
              if (keys.length) str = keys[0];
            } else {
              str = String(q.value || "");
            }

            if (str) {
              map[q.question].totalCount++;
              const normalized = str.toLowerCase().trim();
              if (
                normalized.includes("oui") ||
                normalized.includes("yes") ||
                normalized.includes("conforme")
              ) {
                map[q.question].positiveCount++;
              }
            }
          }
        });
      });
    });

    return Object.values(map)
      .map((item) => {
        let scorePercent = 0;
        let formattedValue = "";

        if (item.type === "rating") {
          const avg =
            item.ratings.length > 0
              ? item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length
              : 0;
          scorePercent = Number(((avg / 5) * 100).toFixed(1));
          formattedValue = `${avg.toFixed(1)} / 5 (${scorePercent}%)`;
        } else {
          scorePercent =
            item.totalCount > 0
              ? Number(
                  ((item.positiveCount / item.totalCount) * 100).toFixed(1),
                )
              : 100;
          formattedValue = `${scorePercent}% conforme`;
        }

        return {
          ...item,
          scorePercent,
          formattedValue,
        };
      })
      .sort((a, b) => b.scorePercent - a.scorePercent);
  }, [parsedReportsData]);

  const filteredQuestions = useMemo(() => {
    if (!searchQuestion) return questionsAnalysis;
    return questionsAnalysis.filter(
      (q) =>
        q.question.toLowerCase().includes(searchQuestion.toLowerCase()) ||
        q.section.toLowerCase().includes(searchQuestion.toLowerCase()),
    );
  }, [questionsAnalysis, searchQuestion]);

  // =========================================================================
  // PERFORMANCE PAR MAGASIN ET PAR VILLE
  // =========================================================================
  const storePerformance = useMemo(() => {
    const storeMap = {};

    normalizedSections.forEach((item) => {
      if (!storeMap[item.nomMagazin]) {
        storeMap[item.nomMagazin] = {
          name: item.nomMagazin,
          city: item.ville,
          scores: [],
        };
      }
      const vals = Object.values(item.sections || {});
      if (vals.length) {
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        storeMap[item.nomMagazin].scores.push(avg);
      }
    });

    return Object.values(storeMap)
      .map((s) => ({
        name: s.name,
        city: s.city,
        score: Number(
          (s.scores.reduce((a, b) => a + b, 0) / Math.max(s.scores.length, 1)).toFixed(1),
        ),
      }))
      .sort((a, b) => b.score - a.score);
  }, [normalizedSections]);

  const cityPerformance = useMemo(() => {
    const cityMap = {};
    storePerformance.forEach((s) => {
      if (!cityMap[s.city]) cityMap[s.city] = [];
      cityMap[s.city].push(s.score);
    });

    return Object.entries(cityMap)
      .map(([city, scores]) => ({
        city,
        score: Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)),
      }))
      .sort((a, b) => b.score - a.score);
  }, [storePerformance]);

  // =========================================================================
  // VERBATIMS TERRAIN
  // =========================================================================
  const verbatims = useMemo(() => {
    const list = [];
    filteredReports.forEach((report) => {
      let rawSections = [];
      try {
        rawSections =
          typeof report.answers === "string"
            ? JSON.parse(report.answers)
            : report.answers || [];
      } catch (e) {}

      const responses =
        Array.isArray(rawSections) && rawSections[0]?.responses
          ? rawSections.flatMap((s) => s.responses || [])
          : Array.isArray(rawSections)
            ? rawSections
            : [];

      responses
        .filter(
          (q) =>
            (q.type === "text" || q.type === "textarea") &&
            q.value &&
            String(q.value).trim().length > 2,
        )
        .forEach((q) => {
          list.push({
            store: report.nomMagazin || "Point de vente",
            city: report.ville || "N/A",
            date: report.dateTimeMission || report.submitted_at,
            question: q.question,
            comment: String(q.value),
          });
        });
    });
    return list;
  }, [filteredReports]);

  // =========================================================================
  // DONNÉES PAGINÉES (CHARGE ÉLEVÉE DE DONNÉES)
  // =========================================================================
  const paginatedQuestions = useMemo(() => {
    const start = (pageQuestions - 1) * questionsPerPage;
    return filteredQuestions.slice(start, start + questionsPerPage);
  }, [filteredQuestions, pageQuestions, questionsPerPage]);

  const paginatedVerbatims = useMemo(() => {
    const start = (pageVerbatims - 1) * verbatimsPerPage;
    return verbatims.slice(start, start + verbatimsPerPage);
  }, [verbatims, pageVerbatims, verbatimsPerPage]);

  const paginatedReports = useMemo(() => {
    const start = (pageReports - 1) * reportsPerPage;
    return filteredReports.slice(start, start + reportsPerPage);
  }, [filteredReports, pageReports, reportsPerPage]);

  const paginatedStores = useMemo(() => {
    const start = (pageStores - 1) * storesPerPage;
    return storePerformance.slice(start, start + storesPerPage);
  }, [storePerformance, pageStores, storesPerPage]);

  // =========================================================================
  // EXPORT EXCEL & PDF
  // =========================================================================
  const exportExcel = () => {
    if (!filteredReports.length) {
      toast({
        title: "Export impossible",
        description: "Aucun rapport à exporter pour le moment.",
        variant: "destructive",
      });
      return;
    }

    const exportRows = filteredReports.map((r) => {
      let answersList = [];
      try {
        const parsed =
          typeof r.answers === "string" ? JSON.parse(r.answers) : r.answers || [];
        answersList = Array.isArray(parsed)
          ? parsed.flatMap((s) => s.responses || [])
          : [];
      } catch (e) {}

      const row = {
        "N° Visite": r.id,
        "Enseigne": missionInfo?.businessName || "Enseigne",
        "Magasin": r.nomMagazin || "Non spécifié",
        "Ville": r.ville || "N/A",
        "Date": safeFormatDate(r.dateTimeMission || r.submitted_at, "dd/MM/yyyy HH:mm"),
      };

      answersList.forEach((a) => {
        if (!a?.question) return;
        if (a.type === "checkboxes") {
          row[a.question] = Object.entries(a.value || {})
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(", ");
        } else if (a.type === "image_upload") {
          row[a.question] = Array.isArray(a.value) ? a.value.join("; ") : "";
        } else if (a.type === "gps_capture") {
          row[a.question] = a.value ? `${a.value.lat}, ${a.value.lng}` : "";
        } else if (a.type === "yes_no") {
          row[a.question] = a.value ? String(a.value) : "Non renseigné";
        } else if (a.type === "date" || a.type === "time") {
          row[a.question] = a.value ? String(a.value) : "";
        } else if (a.type === "number") {
          row[a.question] = a.value !== undefined && a.value !== null ? a.value : "";
        } else {
          row[a.question] = a.value || "";
        }
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapports");
    XLSX.writeFile(
      workbook,
      `Audit_${missionInfo?.title || "Mission"}_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );

    toast({
      title: "Export Excel réussi",
      description: "Le fichier Excel a été téléchargé.",
    });
  };

  // Helper pour nettoyer les textes envoyés au PDF (compatibilité stricte Latin-1)
  const sanitizePdfText = (str) => {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/[«»]/g, '"')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[—–]/g, "-")
      .trim();
  };

  // Générateur de visuel Canvas pour le Radar de Conformité par Section
  const generateRadarChartCanvas = (sections) => {
    if (typeof document === "undefined" || !sections || sections.length === 0) {
      return null;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 700;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Fond blanc uni
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const total = sections.length;

      // Si moins de 3 sections, dessiner des barres horizontales comparatives
      if (total < 3) {
        const barHeight = 28;
        const startY = 80;
        const marginX = 80;
        const maxBarWidth = canvas.width - marginX * 2 - 120;

        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#041F40";
        ctx.textAlign = "center";
        ctx.fillText("Performance par Section d'Audit", canvas.width / 2, 45);

        sections.forEach((sec, idx) => {
          const y = startY + idx * 70;
          ctx.font = "bold 13px sans-serif";
          ctx.fillStyle = "#041F40";
          ctx.textAlign = "left";
          ctx.fillText(sanitizePdfText(sec.name), marginX, y);

          // Track fond
          ctx.fillStyle = "#f1f5f9";
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(marginX, y + 10, maxBarWidth, barHeight, 6);
          } else {
            ctx.rect(marginX, y + 10, maxBarWidth, barHeight);
          }
          ctx.fill();

          // Barre de score
          const scoreWidth = (Math.min(Math.max(sec.score, 0), 100) / 100) * maxBarWidth;
          ctx.fillStyle = sec.score >= 80 ? "#059669" : sec.score >= 60 ? "#d97706" : "#e11d48";
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(marginX, y + 10, scoreWidth, barHeight, 6);
          } else {
            ctx.rect(marginX, y + 10, scoreWidth, barHeight);
          }
          ctx.fill();

          // Texte du score
          ctx.font = "bold 14px sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(`${sec.score}%`, marginX + maxBarWidth + 15, y + 29);
        });

        return canvas.toDataURL("image/png");
      }

      // Graphique Radar multidimensionnel (total >= 3)
      const centerX = 350;
      const centerY = 240;
      const radius = 150;

      // Niveaux concentriques (20%, 40%, 60%, 80%, 100%)
      const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
      levels.forEach((lvl) => {
        ctx.beginPath();
        for (let i = 0; i < total; i++) {
          const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
          const x = centerX + Math.cos(angle) * (radius * lvl);
          const y = centerY + Math.sin(angle) * (radius * lvl);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(4, 31, 64, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "rgba(4, 31, 64, 0.02)";
        ctx.fill();

        // Pourcentage affiché sur l'axe vertical haut
        ctx.font = "9px sans-serif";
        ctx.fillStyle = "rgba(4, 31, 64, 0.45)";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.round(lvl * 100)}%`, centerX, centerY - radius * lvl - 3);
      });

      // Rayons / Axes
      for (let i = 0; i < total; i++) {
        const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
        const endX = centerX + Math.cos(angle) * radius;
        const endY = centerY + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.strokeStyle = "rgba(4, 31, 64, 0.15)";
        ctx.lineWidth = 1;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Libellé de section autour du radar
        const labelDistance = radius + 32;
        const labelX = centerX + Math.cos(angle) * labelDistance;
        const labelY = centerY + Math.sin(angle) * labelDistance;

        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = "#041F40";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let rawName = sanitizePdfText(sections[i].name || `Section ${i + 1}`);
        if (rawName.length > 24) rawName = rawName.slice(0, 22) + "...";
        ctx.fillText(rawName, labelX, labelY - 7);

        // Pastille de score
        ctx.font = "bold 10px sans-serif";
        ctx.fillStyle = sections[i].score >= 80 ? "#059669" : sections[i].score >= 60 ? "#d97706" : "#e11d48";
        ctx.fillText(`${sections[i].score}%`, labelX, labelY + 8);
      }

      // Polygone de données
      ctx.beginPath();
      for (let i = 0; i < total; i++) {
        const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
        const val = Math.min(Math.max(sections[i].score, 0), 100) / 100;
        const x = centerX + Math.cos(angle) * (radius * val);
        const y = centerY + Math.sin(angle) * (radius * val);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(4, 31, 64, 0.22)";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#041F40";
      ctx.stroke();

      // Points de données (dorés)
      for (let i = 0; i < total; i++) {
        const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
        const val = Math.min(Math.max(sections[i].score, 0), 100) / 100;
        const x = centerX + Math.cos(angle) * (radius * val);
        const y = centerY + Math.sin(angle) * (radius * val);

        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "#D6C799";
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#041F40";
        ctx.stroke();
      }

      return canvas.toDataURL("image/png");
    } catch (err) {
      console.warn("Erreur génération canvas Radar:", err);
      return null;
    }
  };

  // Générateur d'image Canvas pour le Bar Chart Territorial par Ville
  const generateBarChartCanvas = (cityData) => {
    if (typeof document === "undefined" || !cityData || cityData.length === 0) {
      return null;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 650;
      canvas.height = 250;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Fond blanc
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const leftMargin = 55;
      const rightMargin = 25;
      const topMargin = 30;
      const bottomMargin = 45;
      const chartWidth = canvas.width - leftMargin - rightMargin;
      const chartHeight = canvas.height - topMargin - bottomMargin;

      // Titre graphique
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#041F40";
      ctx.textAlign = "left";
      ctx.fillText("Score Moyen de Conformité par Territoire / Ville", leftMargin, 18);

      // Lignes de quadrillage Y
      [0, 25, 50, 75, 100].forEach((pct) => {
        const y = topMargin + chartHeight - (pct / 100) * chartHeight;
        ctx.strokeStyle = "rgba(4, 31, 64, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftMargin, y);
        ctx.lineTo(leftMargin + chartWidth, y);
        ctx.stroke();

        ctx.font = "9px sans-serif";
        ctx.fillStyle = "rgba(4, 31, 64, 0.5)";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(`${pct}%`, leftMargin - 8, y);
      });

      const barCount = cityData.length;
      const totalSlot = chartWidth / barCount;
      const barWidth = Math.min(45, totalSlot * 0.55);

      cityData.forEach((item, idx) => {
        const centerX = leftMargin + idx * totalSlot + totalSlot / 2;
        const x = centerX - barWidth / 2;
        const h = (Math.min(Math.max(item.score, 0), 100) / 100) * chartHeight;
        const y = topMargin + chartHeight - h;

        // Barre
        ctx.fillStyle = "#041F40";
        ctx.beginPath();
        ctx.rect(x, y, barWidth, h);
        ctx.fill();

        // Ligne dorée en haut de chaque barre
        ctx.fillStyle = "#D6C799";
        ctx.fillRect(x, y, barWidth, 3);

        // Score en haut de la barre
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = item.score >= 80 ? "#059669" : item.score >= 60 ? "#d97706" : "#e11d48";
        ctx.fillText(`${item.score}%`, centerX, y - 5);

        // Libellé de la ville sous la barre
        ctx.font = "bold 10px sans-serif";
        ctx.fillStyle = "#041F40";
        ctx.textBaseline = "top";
        let cityName = sanitizePdfText(item.city || "Ville");
        if (cityName.length > 14) cityName = cityName.slice(0, 12) + "...";
        ctx.fillText(cityName, centerX, topMargin + chartHeight + 10);
      });

      return canvas.toDataURL("image/png");
    } catch (err) {
      console.warn("Erreur génération canvas BarChart:", err);
      return null;
    }
  };

  // =========================================================================
  // EXPORT PDF EXÉCUTIF COMPLET (MULTI-PAGES, GRAPHIQUES, TOUS LES TABLEAUX)
  // =========================================================================
  const exportPDF = async () => {
    if (!filteredReports.length) {
      toast({
        title: "Export impossible",
        description: "Aucun rapport à exporter pour le moment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExportingPDF(true);

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = 210;
      const pageHeight = 297;
      const marginX = 14;

      // =====================================================================
      // PAGE 1 : BANNIÈRE DE COUVERTURE & SYNTHÈSE STRATÉGIQUE
      // =====================================================================
      // Bannière supérieure Emberton Navy
      doc.setFillColor(4, 31, 64);
      doc.rect(0, 0, pageWidth, 26, "F");
      // Filet d'accent Or
      doc.setFillColor(214, 199, 153);
      doc.rect(0, 26, pageWidth, 2.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(214, 199, 153);
      doc.text("RAPPORT D'AUDIT QUALITÉ & VISITE MYSTÈRE", marginX, 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(
        "Emberton Client Intelligence — Évaluation de la Performance & Expérience Client",
        marginX,
        19,
      );

      // Fiche de synthèse / Métadonnées de la Mission
      const activeFilterVille = selectedVille === "all" ? "Toutes les villes" : selectedVille;
      const activeFilterStore = selectedStore === "all" ? "Tous les magasins" : selectedStore;

      autoTable(doc, {
        startY: 33,
        theme: "plain",
        body: [
          [
            "Enseigne Client :",
            sanitizePdfText(missionInfo?.businessName || "Non spécifiée"),
            "Date d'Export :",
            new Date().toLocaleDateString("fr-FR"),
          ],
          [
            "Mission :",
            sanitizePdfText(missionInfo?.title || "Audit Mystère"),
            "Période / Échéance :",
            missionInfo?.deadline
              ? safeFormatDate(missionInfo.deadline, "d MMMM yyyy", { locale: fr })
              : "En cours",
          ],
          [
            "Catégorie :",
            sanitizePdfText(missionInfo?.category || "Standard"),
            "Périmètre Actif :",
            `${sanitizePdfText(activeFilterVille)} | ${sanitizePdfText(activeFilterStore)}`,
          ],
        ],
        styles: { fontSize: 8, cellPadding: 2, textColor: [4, 31, 64] },
        columnStyles: {
          0: { fontStyle: "bold", width: 32 },
          1: { width: 68 },
          2: { fontStyle: "bold", width: 34 },
          3: { width: 48 },
        },
      });

      // Grille des 6 KPIs Stratégiques
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 4,
        head: [
          [
            "Indice Qualité Globale",
            "Note de Service",
            "Taux de Conformité",
            "Visites Réalisées",
            "Magasins Audités",
            "Villes Couvertes",
          ],
        ],
        body: [
          [
            `${kpis.globalScorePercent}%`,
            `${kpis.ratingOutOfFive} / 5`,
            `${kpis.conformityRate}%`,
            `${kpis.totalReports} / ${kpis.targetStoresCount}`,
            `${kpis.storesAudited} magasin(s)`,
            `${kpis.citiesAudited} ville(s)`,
          ],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [4, 31, 64],
          textColor: [214, 199, 153],
          fontStyle: "bold",
          halign: "center",
          fontSize: 7.5,
          cellPadding: 3,
        },
        bodyStyles: {
          fontStyle: "bold",
          halign: "center",
          fontSize: 9.5,
          textColor: [4, 31, 64],
          fillColor: [248, 250, 252],
          cellPadding: 3.5,
        },
      });

      // Graphique Radar de Conformité par Section
      const radarImg = generateRadarChartCanvas(sectionScoresSummary);
      let currentY = doc.lastAutoTable.finalY + 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(4, 31, 64);
      doc.text("Cartographie Multidimensionnelle des Domaines d'Audit", marginX, currentY);

      if (radarImg) {
        doc.addImage(radarImg, "PNG", 38, currentY + 3, 134, 92);
        currentY += 98;
      } else {
        currentY += 6;
      }

      // Tableau Récapitulatif des Sections (Page 1)
      if (sectionScoresSummary.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [["#", "Domaine / Section d'Audit", "Score de Conformité", "Niveau de Performance"]],
          body: sectionScoresSummary.map((s, idx) => {
            const appreciation =
              s.score >= 80
                ? "Conforme aux standards (Excellent)"
                : s.score >= 60
                  ? "Point de vigilance (Acceptable)"
                  : "Non-conforme (Action requise)";
            return [String(idx + 1), sanitizePdfText(s.name), `${s.score}%`, appreciation];
          }),
          theme: "striped",
          headStyles: {
            fillColor: [4, 31, 64],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 7.5,
          },
          styles: { fontSize: 7.5, cellPadding: 2 },
          columnStyles: {
            0: { halign: "center", width: 10 },
            2: { halign: "center", fontStyle: "bold", width: 35 },
            3: { halign: "center", width: 55 },
          },
        });
      }

      // =====================================================================
      // PAGE 2 : PERFORMANCE PAR POINT DE VENTE & RÉPARTITION TERRITORIALE
      // =====================================================================
      doc.addPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(4, 31, 64);
      doc.text("1. Performance Territoriale & Classement des Points de Vente", marginX, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Indice de conformité de chaque établissement audité et moyennes territoriales.",
        marginX,
        27,
      );

      // Graphique Barres Territoires
      const barImg = generateBarChartCanvas(cityPerformance);
      let page2Y = 32;
      if (barImg && cityPerformance.length > 0) {
        doc.addImage(barImg, "PNG", 30, page2Y, 150, 58);
        page2Y += 64;
      }

      // Tableau 1: Classement des Magasins
      autoTable(doc, {
        startY: page2Y,
        head: [["Rang", "Point de Vente", "Ville", "Score Qualité", "Évaluation"]],
        body: storePerformance.map((s, idx) => {
          const evalText =
            s.score >= 80
              ? "Excellente conformité"
              : s.score >= 60
                ? "Conforme avec réserves"
                : "Plan de redressement requis";
          return [String(idx + 1), sanitizePdfText(s.name), sanitizePdfText(s.city), `${s.score}%`, evalText];
        }),
        theme: "striped",
        headStyles: {
          fillColor: [4, 31, 64],
          textColor: [214, 199, 153],
          fontStyle: "bold",
          fontSize: 7.5,
        },
        styles: { fontSize: 7.5, cellPadding: 2.2 },
        columnStyles: {
          0: { halign: "center", width: 12 },
          3: { halign: "center", fontStyle: "bold", width: 28 },
          4: { halign: "center", width: 45 },
        },
      });

      // Tableau 2: Moyennes par Ville
      if (cityPerformance.length > 0) {
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 6,
          head: [["#", "Territoire / Ville", "Score Moyen de Conformité", "Appréciation Territoriale"]],
          body: cityPerformance.map((c, idx) => {
            const appreciation =
              c.score >= 80 ? "Territoire performant" : c.score >= 60 ? "Niveau intermédiaire" : "Axe prioritaire";
            return [String(idx + 1), sanitizePdfText(c.city), `${c.score}%`, appreciation];
          }),
          theme: "grid",
          headStyles: {
            fillColor: [4, 31, 64],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 7.5,
          },
          styles: { fontSize: 7.5, cellPadding: 2 },
          columnStyles: {
            0: { halign: "center", width: 12 },
            2: { halign: "center", fontStyle: "bold", width: 45 },
            3: { halign: "center", width: 50 },
          },
        });
      }

      // =====================================================================
      // PAGE 3+ : MATRICE EXHAUSTIVE DE TOUS LES CRITÈRES D'ÉVALUATION
      // =====================================================================
      doc.addPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(4, 31, 64);
      doc.text("2. Matrice d'Évaluation Exhaustive des Critères", marginX, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Résultats détaillés pour l'ensemble des questions et standards contrôlés lors des visites terrain.",
        marginX,
        27,
      );

      autoTable(doc, {
        startY: 32,
        head: [["N°", "Standard / Critère Évalué", "Section d'Audit", "Type", "Résultat Obtenu", "Statut"]],
        body: questionsAnalysis.map((q, idx) => {
          const statusText =
            q.scorePercent >= 80 ? "Conforme" : q.scorePercent >= 60 ? "Vigilance" : "Non-conforme";
          return [
            String(idx + 1),
            sanitizePdfText(q.question),
            sanitizePdfText(q.section),
            q.type === "rating" ? "Note (1-5)" : "Conformité",
            sanitizePdfText(q.formattedValue),
            statusText,
          ];
        }),
        theme: "striped",
        headStyles: {
          fillColor: [4, 31, 64],
          textColor: [214, 199, 153],
          fontStyle: "bold",
          fontSize: 7.5,
        },
        styles: { fontSize: 7.2, cellPadding: 2 },
        columnStyles: {
          0: { halign: "center", width: 10 },
          1: { width: 78 },
          2: { width: 34 },
          3: { width: 20, halign: "center" },
          4: { width: 25, halign: "center", fontStyle: "bold" },
          5: { width: 15, halign: "center" },
        },
      });

      // =====================================================================
      // PAGE RETOURS QUALITATIFS (VERBATIMS)
      // =====================================================================
      doc.addPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(4, 31, 64);
      doc.text("3. Retours Qualitatifs & Remarques Terrain (Verbatims)", marginX, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Commentaires et observations textuelles brutes formulés par les enquêteurs mystères.",
        marginX,
        27,
      );

      if (verbatims.length > 0) {
        autoTable(doc, {
          startY: 32,
          head: [["N°", "Point de Vente", "Ville", "Date Visite", "Critère Évalué", "Remarque de l'Enquêteur"]],
          body: verbatims.map((v, idx) => [
            String(idx + 1),
            sanitizePdfText(v.store),
            sanitizePdfText(v.city),
            safeFormatDate(v.date, "dd/MM/yyyy HH:mm"),
            sanitizePdfText(v.question),
            `"${sanitizePdfText(v.comment)}"`,
          ]),
          theme: "grid",
          headStyles: {
            fillColor: [4, 31, 64],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 7.5,
          },
          styles: { fontSize: 7.2, cellPadding: 2.5 },
          columnStyles: {
            0: { halign: "center", width: 10 },
            1: { width: 30 },
            2: { width: 20 },
            3: { width: 22, halign: "center" },
            4: { width: 32 },
            5: { fontStyle: "italic" },
          },
        });
      } else {
        autoTable(doc, {
          startY: 32,
          body: [["Aucun commentaire textuel ou verbatim n'a été renseigné pour les visites de cette sélection."]],
          theme: "plain",
          styles: { fontStyle: "italic", textColor: [120, 120, 120], fontSize: 9 },
        });
      }

      // =====================================================================
      // PAGE REGISTRE DES VISITES RÉALISÉES & PREUVES
      // =====================================================================
      doc.addPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(4, 31, 64);
      doc.text("4. Registre Officiel des Visites Validées & Preuves", marginX, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Journal d'audit de chaque visite terrain avec horodatage, preuves photos et coordonnées GPS.",
        marginX,
        27,
      );

      autoTable(doc, {
        startY: 32,
        head: [["Visite #", "Date & Heure", "Point de Vente", "Ville", "Preuves Photos", "Position GPS"]],
        body: filteredReports.map((report) => {
          let answersList = [];
          try {
            const parsed =
              typeof report.answers === "string" ? JSON.parse(report.answers) : report.answers || [];
            answersList = Array.isArray(parsed) ? parsed.flatMap((s) => s.responses || []) : [];
          } catch (e) {}

          const photos = answersList
            .filter((a) => a.type === "image_upload" && Array.isArray(a.value))
            .flatMap((a) => a.value);

          const gps = answersList.find((a) => a.type === "gps_capture" && a.value?.lat)?.value;

          return [
            `#${report.id}`,
            safeFormatDate(report.dateTimeMission || report.submitted_at, "dd/MM/yyyy HH:mm"),
            sanitizePdfText(report.nomMagazin || "Point de vente"),
            sanitizePdfText(report.ville || "N/A"),
            photos.length > 0 ? `${photos.length} photo(s)` : "Aucune",
            gps ? `${Number(gps.lat).toFixed(4)}, ${Number(gps.lng).toFixed(4)}` : "Non enregistrée",
          ];
        }),
        theme: "striped",
        headStyles: {
          fillColor: [4, 31, 64],
          textColor: [214, 199, 153],
          fontStyle: "bold",
          fontSize: 7.5,
        },
        styles: { fontSize: 7.2, cellPadding: 2.2 },
        columnStyles: {
          0: { halign: "center", width: 16, fontStyle: "bold" },
          1: { halign: "center", width: 30 },
          2: { width: 45 },
          3: { width: 25 },
          4: { halign: "center", width: 28 },
          5: { halign: "center", width: 38 },
        },
      });

      // =====================================================================
      // PIEDS DE PAGE & EN-TÊTES DE PAGES DE CONTINUATION (POST-PROCESSING)
      // =====================================================================
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // En-tête sur les pages 2+
        if (i > 1) {
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(4, 31, 64);
          doc.text("EMBERTON GROUP", marginX, 10);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(120, 120, 120);
          const headerTitle = `Rapport d'Audit Qualité : ${sanitizePdfText(missionInfo?.title || "Visite Mystère")}`;
          doc.text(
            headerTitle.length > 60 ? headerTitle.slice(0, 57) + "..." : headerTitle,
            48,
            10,
          );

          doc.setDrawColor(214, 199, 153);
          doc.setLineWidth(0.4);
          doc.line(marginX, 13, pageWidth - marginX, 13);
        }

        // Pied de page sur toutes les pages
        doc.setDrawColor(220, 220, 225);
        doc.setLineWidth(0.3);
        doc.line(marginX, pageHeight - 10, pageWidth - marginX, pageHeight - 10);

        doc.setFontSize(7.2);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(130, 130, 130);
        doc.text(
          "CONFIDENTIEL — Usage Exclusif Client | Emberton Quality Intelligence",
          marginX,
          pageHeight - 5,
        );

        doc.setFont("helvetica", "bold");
        doc.setTextColor(4, 31, 64);
        doc.text(`Page ${i} / ${totalPages}`, pageWidth - marginX, pageHeight - 5, {
          align: "right",
        });
      }

      // Téléchargement du fichier
      const cleanBusiness = sanitizePdfText(missionInfo?.businessName || "Client").replace(/\s+/g, "_");
      const cleanTitle = sanitizePdfText(missionInfo?.title || "Mission").replace(/\s+/g, "_");
      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`Rapport_Audit_${cleanBusiness}_${cleanTitle}_${dateStr}.pdf`);

      toast({
        title: "Rapport PDF téléchargé avec succès",
        description: `Le document complet de ${totalPages} page(s) a été généré.`,
      });
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      toast({
        title: "Erreur lors de l'export PDF",
        description: "Une anomalie s'est produite lors de la génération du document.",
        variant: "destructive",
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30";
    if (score >= 60) return "bg-amber-500/10 text-amber-700 border-amber-500/30";
    return "bg-rose-500/10 text-rose-700 border-rose-500/30";
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto py-24 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#041F40]" />
        <p className="text-sm font-medium text-[#041F40]/70 animate-pulse">
          Calcul et analyse des indicateurs de visite en cours...
        </p>
      </div>
    );
  }

  // État d'erreur / Accès non autorisé
  if (errorMessage || !missionInfo) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-xl text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#041F40]">
            Tableau de bord indisponible
          </h2>
          <p className="text-sm text-[#041F40]/70 mt-2 leading-relaxed">
            {errorMessage ||
              "Cette mission n'existe pas ou vous n'avez pas l'autorisation d'accéder à ses rapports d'audit."}
          </p>
        </div>
        <Button
          asChild
          className="bg-[#041F40] hover:bg-[#041F40]/90 text-[#D6C799] rounded-xl px-5 h-10 font-semibold"
        >
          <Link href="/client">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'espace entreprise
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl space-y-6">
      {/* Navigation et Actions rapides */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-[#041F40]/70 hover:text-[#041F40] hover:bg-[#041F40]/5 -ml-2 rounded-xl"
        >
          <Link href="/client">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Retour à l'espace entreprise
          </Link>
        </Button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={exportExcel}
            variant="outline"
            size="sm"
            disabled={filteredReports.length === 0}
            className="flex-1 sm:flex-none border-[#041F40]/20 text-[#041F40] hover:bg-[#041F40]/5 rounded-xl h-9 text-xs font-semibold gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Exporter Excel (.xlsx)
          </Button>

          <Button
            onClick={exportPDF}
            size="sm"
            disabled={filteredReports.length === 0 || isExportingPDF}
            className="flex-1 sm:flex-none bg-[#041F40] hover:bg-[#041F40]/90 text-[#D6C799] rounded-xl h-9 text-xs font-semibold gap-1.5 shadow-sm shadow-[#041F40]/20"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération PDF...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Télécharger Rapport PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* En-tête Mission et Filtres */}
      <Card className="rounded-3xl border border-[#041F40]/10 shadow-sm bg-gradient-to-br from-white via-slate-50/50 to-amber-50/20 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#041F40]">
                  {missionInfo?.title || "Tableau de Bord d'Audit"}
                </h1>
                <Badge className="bg-[#D6C799]/20 text-[#041F40] border-[#D6C799]/40 font-semibold text-xs">
                  {missionInfo?.category || "Audit Mystère"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#041F40]/70">
                <span className="flex items-center gap-1.5 font-semibold text-[#041F40]">
                  <Building2 className="w-3.5 h-3.5 text-[#041F40]/60" />
                  {missionInfo?.businessName || "Enseigne"}
                </span>

                {missionInfo?.deadline && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#041F40]/50" />
                    Échéance :{" "}
                    {safeFormatDate(missionInfo.deadline, "d MMMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                )}

                <span className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-[#041F40]/50" />
                  {missionInfo?.stores?.length || 0} point(s) de vente ciblé(s)
                </span>
              </div>
            </div>

            {/* Sélecteurs de filtrage Ville / Magasin */}
            {reports.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <select
                  value={selectedVille}
                  onChange={(e) => {
                    setSelectedVille(e.target.value);
                    setSelectedStore("all");
                  }}
                  className="bg-white border border-[#041F40]/15 text-[#041F40] text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#041F40]"
                >
                  <option value="all">Toutes les villes ({availableVilles.length})</option>
                  {availableVilles.map((v, i) => (
                    <option key={i} value={v}>
                      {v}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="bg-white border border-[#041F40]/15 text-[#041F40] text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#041F40]"
                >
                  <option value="all">Tous les magasins ({availableStores.length})</option>
                  {availableStores.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {(selectedVille !== "all" || selectedStore !== "all") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedVille("all");
                      setSelectedStore("all");
                    }}
                    className="h-8 text-[11px] text-[#041F40]/70 hover:text-[#041F40] rounded-xl"
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerte si aucun rapport validé */}
      {reports.length === 0 && (
        <Card className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-xs text-[#041F40]/80">
              <span className="font-bold text-[#041F40]">En attente de visites : </span>
              Aucun rapport de visite n'a encore été validé pour cette mission. Dès validation terrain par l'équipe d'audit, les indicateurs et graphiques apparaîtront automatiquement.
            </div>
          </div>
        </Card>
      )}

      {/* 4 KPIs Clés Essentiels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Indice de Qualité Global */}
        <Card className="rounded-2xl border border-[#041F40]/10 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#041F40]/60 uppercase tracking-wider">
                  Indice de Qualité Global
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-[#041F40]">
                    {kpis.totalReports > 0 ? `${kpis.globalScorePercent}%` : "—"}
                  </span>
                  {kpis.totalReports > 0 && (
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 inline" />
                      {kpis.ratingOutOfFive} / 5
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#041F40] text-[#D6C799]">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${kpis.globalScorePercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 : Visites Réalisées */}
        <Card className="rounded-2xl border border-[#041F40]/10 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#041F40]/60 uppercase tracking-wider">
                  Visites Réalisées
                </p>
                <h3 className="text-3xl font-extrabold text-[#041F40] mt-1">
                  {kpis.totalReports}
                </h3>
                <p className="text-[11px] text-[#041F40]/60 mt-0.5">
                  Sur {kpis.targetStoresCount} point(s) de vente ciblé(s)
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[#041F40]/5 text-[#041F40]">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-3">
              {kpis.totalReports > 0
                ? "✓ 100% des rapports audités et validés"
                : "En cours de réalisation terrain"}
            </p>
          </CardContent>
        </Card>

        {/* KPI 3 : Taux de Conformité */}
        <Card className="rounded-2xl border border-[#041F40]/10 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#041F40]/60 uppercase tracking-wider">
                  Taux de Conformité
                </p>
                <h3 className="text-3xl font-extrabold text-emerald-700 mt-1">
                  {kpis.totalReports > 0 ? `${kpis.conformityRate}%` : "—"}
                </h3>
                <p className="text-[11px] text-[#041F40]/60 mt-0.5">
                  Respect des critères et standards
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-[#041F40] h-2 rounded-full transition-all duration-500"
                style={{ width: `${kpis.conformityRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 : Couverture Géographique */}
        <Card className="rounded-2xl border border-[#041F40]/10 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#041F40]/60 uppercase tracking-wider">
                  Couverture Terrain
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-[#041F40]">
                    {kpis.storesAudited}
                  </span>
                  <span className="text-xs text-[#041F40]/60 font-medium">
                    magasin(s) dans {kpis.citiesAudited} ville(s)
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#041F40]/5 text-[#041F40]">
                <MapPin className="w-6 h-6 text-[#041F40]" />
              </div>
            </div>
            <p className="text-[11px] text-[#041F40]/60 mt-3 truncate">
              {availableVilles.length > 0
                ? availableVilles.slice(0, 3).join(", ") +
                  (availableVilles.length > 3 ? "..." : "")
                : "Aucune ville enregistrée"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets Principaux */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border border-[#041F40]/10 p-1 rounded-2xl shadow-sm flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="overview"
            className="rounded-xl px-4 py-2 text-xs font-bold text-[#041F40]/70 data-[state=active]:bg-[#041F40] data-[state=active]:text-[#D6C799] data-[state=active]:shadow-sm transition-all gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Synthèse & Performance
          </TabsTrigger>

          <TabsTrigger
            value="criteria"
            className="rounded-xl px-4 py-2 text-xs font-bold text-[#041F40]/70 data-[state=active]:bg-[#041F40] data-[state=active]:text-[#D6C799] data-[state=active]:shadow-sm transition-all gap-2"
          >
            <ListChecks className="w-4 h-4" />
            Matrice des Critères ({questionsAnalysis.length})
          </TabsTrigger>

          <TabsTrigger
            value="verbatims"
            className="rounded-xl px-4 py-2 text-xs font-bold text-[#041F40]/70 data-[state=active]:bg-[#041F40] data-[state=active]:text-[#D6C799] data-[state=active]:shadow-sm transition-all gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Commentaires & Remarques ({verbatims.length})
          </TabsTrigger>

          <TabsTrigger
            value="raw"
            className="rounded-xl px-4 py-2 text-xs font-bold text-[#041F40]/70 data-[state=active]:bg-[#041F40] data-[state=active]:text-[#D6C799] data-[state=active]:shadow-sm transition-all gap-2"
          >
            <Camera className="w-4 h-4" />
            Visites Terrain & Preuves ({filteredReports.length})
          </TabsTrigger>
        </TabsList>

        {/* ================================================================= */}
        {/* ONGLET 1 : SYNTHÈSE & PERFORMANCE                                 */}
        {/* ================================================================= */}
        <TabsContent value="overview" className="space-y-6">
          {/* GRAPHIQUES RADAR : MOYENNE GLOBALE & COMPARATIF MAGASINS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique Radar 1 : Moyenne Globale Consolidée de la Mission */}
            <Card className="rounded-3xl border border-[#041F40]/10 shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-2 border-b border-[#041F40]/5 bg-gradient-to-r from-slate-50/50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-[#041F40] flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#D6C799]" />
                      Radar Global de la Mission (Moyenne Consolidée)
                    </CardTitle>
                    <CardDescription className="text-xs text-[#041F40]/60">
                      Moyenne générale de conformité calculée sur l'ensemble de la mission.
                    </CardDescription>
                  </div>
                  <Badge className="bg-[#041F40] text-[#D6C799] border-none text-xs font-bold">
                    {kpis.globalScorePercent}% Global
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2 flex items-center justify-center min-h-[380px]">
                {sectionScoresSummary.length > 0 ? (
                  <MissionAverageRadarChart sectionScoresSummary={sectionScoresSummary} />
                ) : (
                  <p className="text-sm text-[#041F40]/50 italic text-center py-12">
                    Aucune donnée de section disponible pour le radar moyen.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Graphique Radar 2 : Magasin par Magasin / Tous Ensemble (Par Défaut) */}
            <Card className="rounded-3xl border border-[#041F40]/10 shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-2 border-b border-[#041F40]/5 bg-gradient-to-r from-slate-50/50 to-white">
                <div>
                  <CardTitle className="text-base font-bold text-[#041F40] flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#041F40]/70" />
                    Radar Comparatif des Points de Vente
                  </CardTitle>
                  <CardDescription className="text-xs text-[#041F40]/60">
                    Visualisation magasin par magasin ou tous ensemble par défaut.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-2 min-h-[380px]">
                {normalizedSections.length > 0 ? (
                  <MultiStoreRadarChart
                    normalizedSections={normalizedSections}
                    sectionScoresSummary={sectionScoresSummary}
                  />
                ) : (
                  <p className="text-sm text-[#041F40]/50 italic text-center py-12">
                    Aucune donnée de magasin disponible pour le radar comparatif.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance par Section d'Audit */}
          <Card className="rounded-3xl border border-[#041F40]/10 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#041F40]">
                Performance par Section d'Audit
              </CardTitle>
              <CardDescription className="text-xs text-[#041F40]/60">
                Moyenne des points obtenus sur chaque domaine audité.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {sectionScoresSummary.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sectionScoresSummary.map((sec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-slate-50/70 border border-[#041F40]/5 space-y-1.5"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-[#041F40] truncate max-w-[220px]">
                          {sec.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`font-bold ${getScoreBadgeColor(sec.score)}`}
                        >
                          {sec.score}%
                        </Badge>
                      </div>
                      <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            sec.score >= 80
                              ? "bg-emerald-500"
                              : sec.score >= 60
                                ? "bg-amber-500"
                                : "bg-rose-500"
                          }`}
                          style={{ width: `${sec.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#041F40]/50 italic text-center py-12">
                  Aucune section calculée pour cette sélection.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Classement Comparatif par Point de Vente et par Ville */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-3xl border border-[#041F40]/10 shadow-sm bg-white overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-[#041F40]">
                    Classement par Point de Vente
                  </CardTitle>
                  <CardDescription className="text-xs text-[#041F40]/60">
                    Performance globale de chaque magasin audité ({storePerformance.length} point(s)).
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {storePerformance.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-[#041F40]/10 bg-slate-50/50">
                          <TableHead className="text-xs font-bold text-[#041F40]">Magasin</TableHead>
                          <TableHead className="text-xs font-bold text-[#041F40]">Ville</TableHead>
                          <TableHead className="text-xs font-bold text-[#041F40] text-right pr-6">Indice Qualité</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedStores.map((store, i) => (
                          <TableRow key={i} className="hover:bg-[#041F40]/5 border-b border-[#041F40]/5">
                            <TableCell className="text-xs font-semibold text-[#041F40] py-3">
                              {store.name}
                            </TableCell>
                            <TableCell className="text-xs text-[#041F40]/70">
                              {store.city}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Badge variant="outline" className={`font-bold ${getScoreBadgeColor(store.score)}`}>
                                {store.score}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-[#041F40]/50 italic text-center py-8">
                      Aucun magasin audité pour l'instant.
                    </p>
                  )}
                </CardContent>
              </div>

              {storePerformance.length > storesPerPage && (
                <DataPagination
                  currentPage={pageStores}
                  totalItems={storePerformance.length}
                  itemsPerPage={storesPerPage}
                  onPageChange={setPageStores}
                  onItemsPerPageChange={setStoresPerPage}
                  itemLabel="magasin(s)"
                />
              )}
            </Card>

            <Card className="rounded-3xl border border-[#041F40]/10 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-[#041F40]">
                  Score Moyen par Ville
                </CardTitle>
                <CardDescription className="text-xs text-[#041F40]/60">
                  Comparaison territoriale des résultats d'audit.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72 pt-4">
                {cityPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cityPerformance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#041F40" strokeOpacity={0.06} />
                      <XAxis dataKey="city" tick={{ fontSize: 11, fill: "#041F40" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#041F40" }} />
                      <RechartsTooltip formatter={(value) => [`${value}%`, "Score moyen"]} />
                      <Bar dataKey="score" fill="#041F40" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-[#041F40]/50 italic">
                    Aucune donnée territoriale disponible.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================= */}
        {/* ONGLET 2 : ANALYSE DÉTAILLÉE DES CRITÈRES                          */}
        {/* ================================================================= */}
        <TabsContent value="criteria" className="space-y-4">
          <Card className="rounded-3xl border border-[#041F40]/10 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-5 pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-[#041F40]">
                    Matrice d'Évaluation des Critères
                  </CardTitle>
                  <CardDescription className="text-xs text-[#041F40]/60">
                    Taux de conformité précis calculé pour chaque question de l'audit ({filteredQuestions.length} critère(s)).
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#041F40]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Filtrer une question ou section..."
                    value={searchQuestion}
                    onChange={(e) => setSearchQuestion(e.target.value)}
                    className="pl-8 h-8 text-xs rounded-xl border-[#041F40]/15"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#041F40]/10 bg-slate-50/50">
                    <TableHead className="text-xs font-bold text-[#041F40] w-1/2">Critère / Question</TableHead>
                    <TableHead className="text-xs font-bold text-[#041F40]">Section</TableHead>
                    <TableHead className="text-xs font-bold text-[#041F40]">Type</TableHead>
                    <TableHead className="text-xs font-bold text-[#041F40] text-right pr-6">Résultat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedQuestions.length > 0 ? (
                    paginatedQuestions.map((q, i) => (
                      <TableRow key={i} className="hover:bg-[#041F40]/5 border-b border-[#041F40]/5">
                        <TableCell className="text-xs font-medium text-[#041F40] py-3">
                          {q.question}
                        </TableCell>
                        <TableCell className="text-xs text-[#041F40]/70">
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {q.section}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-[#041F40]/60">
                          {q.type === "rating" ? "Note (1-5)" : "Conformité"}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Badge variant="outline" className={`font-bold ${getScoreBadgeColor(q.scorePercent)}`}>
                            {q.formattedValue}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-xs text-[#041F40]/50 italic">
                        Aucun critère ne correspond à la recherche.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>

            <DataPagination
              currentPage={pageQuestions}
              totalItems={filteredQuestions.length}
              itemsPerPage={questionsPerPage}
              onPageChange={setPageQuestions}
              onItemsPerPageChange={setQuestionsPerPage}
              itemLabel="critère(s)"
            />
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* ONGLET 3 : VERBATIMS & COMMENTAIRES                                */}
        {/* ================================================================= */}
        <TabsContent value="verbatims" className="space-y-4">
          <Card className="rounded-3xl border border-[#041F40]/10 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold text-[#041F40]">
                Retours Qualitatifs & Verbatims Terrain
              </CardTitle>
              <CardDescription className="text-xs text-[#041F40]/60">
                Commentaires et observations formulées par les enquêteurs mystères ({verbatims.length} retour(s)).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {paginatedVerbatims.length > 0 ? (
                paginatedVerbatims.map((v, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border border-[#041F40]/10 bg-gradient-to-r from-slate-50/50 to-white hover:border-[#041F40]/20 transition-all space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-semibold text-[#041F40] bg-white">
                          <Store className="w-3 h-3 mr-1 text-[#041F40]/60" />
                          {v.store} ({v.city})
                        </Badge>
                        <span className="text-[11px] text-[#041F40]/50">
                          {safeFormatDate(v.date, "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#041F40]/60 font-medium">
                        {v.question}
                      </span>
                    </div>
                    <p className="text-xs text-[#041F40]/90 leading-relaxed pl-2 border-l-2 border-[#D6C799]">
                      « {v.comment} »
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-[#041F40]/50 text-xs italic">
                  Aucun commentaire textuel renseigné pour cette sélection.
                </div>
              )}
            </CardContent>

            <DataPagination
              currentPage={pageVerbatims}
              totalItems={verbatims.length}
              itemsPerPage={verbatimsPerPage}
              onPageChange={setPageVerbatims}
              onItemsPerPageChange={setVerbatimsPerPage}
              itemLabel="commentaire(s)"
            />
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* ONGLET 4 : VISITES INDIVIDUELLES & PREUVES TERRAIN                */}
        {/* ================================================================= */}
        <TabsContent value="raw" className="space-y-4">
          <Card className="rounded-3xl border border-[#041F40]/10 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-5 pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-[#041F40]">
                    Rapports Individuels des Visites
                  </CardTitle>
                  <CardDescription className="text-xs text-[#041F40]/60">
                    Registre complet de chaque audit terrain validé avec preuves photos et coordonnées.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-semibold">
                  {filteredReports.length} visite(s) documentée(s)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {paginatedReports.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#041F40]/10 bg-slate-50/50">
                      <TableHead className="text-xs font-bold text-[#041F40]">Rapport N°</TableHead>
                      <TableHead className="text-xs font-bold text-[#041F40]">Date</TableHead>
                      <TableHead className="text-xs font-bold text-[#041F40]">Magasin</TableHead>
                      <TableHead className="text-xs font-bold text-[#041F40]">Ville</TableHead>
                      <TableHead className="text-xs font-bold text-[#041F40]">Preuves Photos</TableHead>
                      <TableHead className="text-xs font-bold text-[#041F40] text-right pr-6">Position GPS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReports.map((report) => {
                      let answersList = [];
                      try {
                        const parsed =
                          typeof report.answers === "string"
                            ? JSON.parse(report.answers)
                            : report.answers || [];
                        answersList = Array.isArray(parsed)
                          ? parsed.flatMap((s) => s.responses || [])
                          : [];
                      } catch (e) {}

                      const photos = answersList
                        .filter((a) => a.type === "image_upload" && Array.isArray(a.value))
                        .flatMap((a) => a.value);

                      const gps = answersList.find(
                        (a) => a.type === "gps_capture" && a.value?.lat,
                      )?.value;

                      return (
                        <TableRow key={report.id} className="hover:bg-[#041F40]/5 border-b border-[#041F40]/5">
                          <TableCell className="text-xs font-bold text-[#041F40]">
                            #{report.id}
                          </TableCell>
                          <TableCell className="text-xs text-[#041F40]/80">
                            {safeFormatDate(
                              report.dateTimeMission || report.submitted_at,
                              "dd/MM/yyyy HH:mm",
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-[#041F40]">
                            {report.nomMagazin || "Point de vente"}
                          </TableCell>
                          <TableCell className="text-xs text-[#041F40]/70">
                            {report.ville || "N/A"}
                          </TableCell>
                          <TableCell>
                            {photos.length > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {photos.slice(0, 3).map((photoUrl, pIdx) => (
                                  <a
                                    key={pIdx}
                                    href={photoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative group"
                                  >
                                    <img
                                      src={photoUrl}
                                      alt="Preuve"
                                      className="w-8 h-8 rounded-lg object-cover border border-[#041F40]/15 hover:scale-110 transition-transform"
                                    />
                                  </a>
                                ))}
                                {photos.length > 3 && (
                                  <span className="text-[10px] text-[#041F40]/60 font-semibold">
                                    +{photos.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#041F40]/40 italic">Aucune</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            {gps ? (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px] rounded-lg gap-1 border-[#041F40]/15 text-[#041F40] hover:bg-[#041F40]/5"
                              >
                                <a
                                  href={`https://www.google.com/maps?q=${gps.lat},${gps.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <MapPin className="w-3 h-3 text-emerald-600" />
                                  Carte
                                  <ExternalLink className="w-2.5 h-2.5 text-[#041F40]/40" />
                                </a>
                              </Button>
                            ) : (
                              <span className="text-[11px] text-[#041F40]/40 italic">N/A</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-[#041F40]/50 italic text-center py-8">
                  Aucune visite documentée pour l'instant.
                </p>
              )}
            </CardContent>

            <DataPagination
              currentPage={pageReports}
              totalItems={filteredReports.length}
              itemsPerPage={reportsPerPage}
              onPageChange={setPageReports}
              onItemsPerPageChange={setReportsPerPage}
              itemLabel="visite(s)"
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
