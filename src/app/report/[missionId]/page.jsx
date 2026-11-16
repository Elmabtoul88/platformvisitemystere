"use client";

import { ReportSubmissionForm } from "@/components/report-submission-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  FileWarning,
  Ban,
  Store,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Building,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { submitReport } from "../../actions/report-actions.js";
import { use, useEffect, useState } from "react";
import { fetchMissions } from "@/services/fetchData.js";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { format, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

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

export default function ReportSubmissionPage({ params }) {
  const { user: authUser, token: authToken } = useAuth();
  const [mission, setMission] = useState(null);
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [hasSubmittedReport, setHasSubmittedReport] = useState(false);

  const { missionId } = use(params);
  const searchParams = useSearchParams();

  const rawStoreId = searchParams.get("storeId");
  const paramStoreId = rawStoreId ? parseInt(rawStoreId, 10) : null;
  const paramStoreName = searchParams.get("storeName");
  const paramStoreAddress = searchParams.get("specificStoreAddress");
  const paramScenario = searchParams.get("scenario");
  const paramDateTime = searchParams.get("dateTimeMission");
  const paramVille = searchParams.get("ville");

  useEffect(() => {
    let resolvedId = authUser?.id;
    let resolvedToken = authToken;

    if (!resolvedId && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("missionViewAuth");
        if (raw) {
          const parsed = JSON.parse(raw);
          resolvedId = parsed?.user?.id || parsed?.id;
          resolvedToken = parsed?.token;
        }
      } catch (e) {
        console.error("Erreur lecture auth:", e);
      }
    }

    if (resolvedId) setUserId(resolvedId);
    if (resolvedToken) setToken(resolvedToken);

    const loadAllData = async () => {
      try {
        const fetchPromises = [
          fetchMissions("mission" + missionId, `${cleanApiBase}missions/${missionId}`),
          fetchMissions(
            "surveyQuestions" + missionId,
            `${cleanApiBase}reports/surveyQuestions/${missionId}`
          ),
        ];

        if (resolvedId) {
          const checkUrl = `${cleanApiBase}applications/check/${missionId}/${resolvedId}${paramStoreId ? `?storeId=${paramStoreId}` : ""}`;
          fetchPromises.push(
            fetchMissions(
              `appCheck-${missionId}-${resolvedId}${paramStoreId ? `-${paramStoreId}` : ""}`,
              checkUrl,
            ).catch(() => null),
          );
        }

        const [m, s, appData] = await Promise.all(fetchPromises);

        if (appData?.has_submitted_report) {
          setHasSubmittedReport(true);
        }

        if (m) {
          // Résolution intelligente du magasin assigné
          let matchedStore = null;

          if (paramStoreId && m.stores?.length) {
            matchedStore = m.stores.find((st) => st.id === paramStoreId);
          }

          if (!matchedStore && appData?.has_applied && appData?.application?.stores) {
            try {
              const appStoreIds =
                typeof appData.application.stores === "string"
                  ? JSON.parse(appData.application.stores)
                  : appData.application.stores;
              if (Array.isArray(appStoreIds) && appStoreIds.length > 0 && m.stores?.length) {
                matchedStore = m.stores.find((st) => st.id === appStoreIds[0]);
              }
            } catch (e) {}
          }

          if (!matchedStore && m.stores && m.stores.length > 0) {
            matchedStore = m.stores[0];
          }

          // Construction des métadonnées de la visite
          const resolvedStoreName =
            paramStoreName ||
            matchedStore?.name ||
            m.businessName ||
            m.title ||
            "Point de vente";

          const resolvedStoreId =
            paramStoreId ||
            matchedStore?.id ||
            (m.stores?.[0]?.id) ||
            1;

          const resolvedAddress =
            paramStoreAddress ||
            matchedStore?.address ||
            m.location ||
            "Adresse non spécifiée";

          const resolvedVille =
            paramVille ||
            matchedStore?.city ||
            m.ville ||
            m.location ||
            "Maroc";

          const resolvedScenario =
            paramScenario ||
            m.scenario ||
            "Évaluation standard de la qualité de service et accueil client.";

          const resolvedDateTime =
            paramDateTime ||
            appData?.application?.mission_date ||
            m.date ||
            new Date().toISOString();

          const parsedMission = {
            ...m,
            nomMagazin: resolvedStoreName,
            storeId: resolvedStoreId,
            scenario: resolvedScenario,
            specificStoreAddress: resolvedAddress,
            dateTimeMission: resolvedDateTime,
            ville: resolvedVille,
          };

          setMission(parsedMission);
        }

        setSurveyQuestions(Array.isArray(s) ? s : []);
      } catch (error) {
        console.error("Erreur chargement données de la mission:", error);
      }
    };

    loadAllData();
  }, [missionId, authUser?.id, authToken, paramStoreId, paramStoreName, paramStoreAddress, paramScenario, paramDateTime, paramVille]);

  if (!mission) {
    return (
      <div className="container mx-auto py-12 px-4 flex flex-col items-center">
        <Alert variant="destructive" className="max-w-lg">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Mission Introuvable</AlertTitle>
          <AlertDescription>
            La mission pour laquelle vous souhaitez soumettre un rapport n'a pas été trouvée ou n'est plus accessible.
          </AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4 text-[#041F40]">
          <Link href="/missions/assigned">
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour à mes missions
          </Link>
        </Button>
      </div>
    );
  }

  // Vérifier si la mission est clôturée ou annulée
  const isClosed =
    mission.status === "completed" || mission.status === "cancelled";

  if (isClosed) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center text-center">
        <Card className="max-w-md w-full shadow-lg bg-white border">
          <CardHeader>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4 border border-red-200">
              <Ban className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl font-bold text-[#041F40]">
              Soumission Impossible
            </CardTitle>
            <CardDescription className="text-muted-foreground pt-1">
              Cette mission ({mission.title}) a déjà été clôturée ou n'est plus ouverte aux rapports.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <Button asChild className="bg-[#041F40] text-[#D6C799]">
              <Link href="/missions/assigned">
                <ArrowLeft className="w-4 h-4 mr-1" /> Mes missions assignées
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (hasSubmittedReport) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center text-center">
        <Card className="max-w-md w-full shadow-lg bg-white border">
          <CardHeader>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4 border border-emerald-200">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl font-bold text-[#041F40]">
              Rapport Déjà Soumis
            </CardTitle>
            <CardDescription className="text-muted-foreground pt-1">
              Vous avez déjà soumis votre rapport pour{" "}
              {mission.nomMagazin ? (
                <span className="font-semibold text-slate-800">
                  {mission.nomMagazin}
                </span>
              ) : (
                `la mission (${mission.title})`
              )}
              . S'il vous reste d'autres magasins à évaluer pour cette mission,
              vous pouvez continuer depuis la page de vos missions assignées.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <Button
              asChild
              className="bg-[#041F40] text-[#D6C799] hover:bg-[#041F40]/90"
            >
              <Link href="/missions/assigned">
                <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux missions assignées
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/missions/completed">
                Voir mes missions complétées
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="container mx-auto max-w-3xl space-y-4 sm:space-y-6">
        <Button asChild variant="outline" size="sm" className="bg-white">
          <Link href="/missions/assigned">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour à mes missions
          </Link>
        </Button>

        {/* ============================================================== */}
        {/* CARTOUCHE DES INFORMATIONS DE LA VISITE MYSTÈRE                */}
        {/* ============================================================== */}
        <Card className="bg-white border-2 border-[#041F40]/10 shadow-md overflow-hidden rounded-2xl">
          <div className="bg-[#041F40] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6C799]">
                Rapport de Visite Mystère
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-white">
                {mission.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#D6C799] text-[#041F40] font-bold text-xs">
                Rémunération : {mission.reward || 0} MAD
              </span>
            </div>
          </div>

          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border">
                <Store className="w-5 h-5 text-[#041F40] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground font-semibold">Magasin audité</p>
                  <p className="text-sm font-bold text-slate-900">{mission.nomMagazin}</p>
                  {mission.businessName && (
                    <p className="text-[11px] text-slate-500 font-medium">{mission.businessName}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border">
                <MapPin className="w-5 h-5 text-[#041F40] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground font-semibold">Ville & Emplacement</p>
                  <p className="text-sm font-bold text-slate-900">{mission.ville}</p>
                  <p className="text-[11px] text-slate-500 truncate max-w-[220px]">
                    {mission.specificStoreAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border">
                <Calendar className="w-5 h-5 text-[#041F40] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground font-semibold">Date de visite enregistrée</p>
                  <p className="text-sm font-bold text-slate-900">
                    {safeFormatDate(mission.dateTimeMission)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border">
                <FileText className="w-5 h-5 text-[#041F40] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground font-semibold">Protocole & Scénario</p>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                    {mission.scenario || "Évaluation complète en magasin"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-xs text-amber-900">
              <CheckCircle2 className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                Ces informations seront <strong>automatiquement incluses</strong> dans votre rapport pour validation par l'équipe d'audit.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire de rapport */}
        <ReportSubmissionForm
          mission={mission}
          surveyQuestions={surveyQuestions}
          onSubmitAction={submitReport}
          userId={userId}
          token={token}
        />
      </div>
      <Toaster />
    </main>
  );
}
