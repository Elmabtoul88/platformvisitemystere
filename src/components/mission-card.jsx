"use client";

import React from "react";
import {
  Card,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  MapPin,
  Calendar,
  Building2,
  Clock,
  Store,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Coins,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";

export function MissionCard({
  mission,
  onApply,
  onViewDetails,
  showApplyButton,
  userId,
  isApplying,
  getStatusBadge,
}) {
  const router = router_or_fallback();
  function router_or_fallback() {
    try {
      return useRouter();
    } catch (e) {
      return {
        push: (url) => {
          if (typeof window !== "undefined") window.location.href = url;
        },
      };
    }
  }

  const hasApplied = Boolean(mission.has_applied);
  const appStatus = mission.application_status || (hasApplied ? "pending" : null);
  const repStatus = mission.report_status || null;

  // Récupérer le store principal et la liste de stores
  const storesList = Array.isArray(mission.stores)
    ? mission.stores
    : mission.store
      ? [mission.store]
      : [];
  const store = storesList[0] || mission.store || {};
  const storesCount = storesList.length;

  const rewardAmount =
    typeof mission.reward === "string"
      ? parseFloat(mission.reward)
      : mission.reward || 0;

  // Vérifier si la date limite est dépassée
  const isExpired = Boolean(
    mission.deadline && new Date(mission.deadline) < new Date(),
  );

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(mission.id);
    } else {
      router.push(`/missions/${mission.id}/details`);
    }
  };

  const handleOpenReport = () => {
    router.push(`/report/${mission.id}`);
  };

  const handleOpenHistory = () => {
    router.push(`/missions/completed`);
  };

  // Formatage propre de la date limite
  const formattedDeadline = (() => {
    if (!mission.deadline) return null;
    try {
      const d = new Date(mission.deadline);
      return isValid(d) ? format(d, "dd MMM yyyy", { locale: fr }) : null;
    } catch (e) {
      return null;
    }
  })();

  // =========================================================================
  // DÉFINITION UNIQUE ET NON AMBIGUË DU STATUT (ÉVITE "POSTULÉ APPROUVÉ")
  // =========================================================================
  const getShopperStatusInfo = () => {
    // 1. Statuts liés au Rapport / Questionnaire
    if (repStatus === "paid") {
      return {
        type: "paid",
        badge: (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] px-2 py-0.5 flex items-center gap-1 font-bold">
            <Coins className="w-3 h-3 text-emerald-600" /> Payée
          </Badge>
        ),
        button: (
          <Button
            size="sm"
            onClick={handleOpenHistory}
            className="w-full h-9 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>Rémunération versée • Historique</span>
          </Button>
        ),
      };
    }

    if (repStatus === "approved") {
      return {
        type: "report_approved",
        badge: (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] px-2 py-0.5 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Rapport Validé
          </Badge>
        ),
        button: (
          <Button
            size="sm"
            onClick={handleViewDetails}
            className="w-full h-9 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Rapport approuvé • Paiement en cours</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
          </Button>
        ),
      };
    }

    if (repStatus === "submitted") {
      return {
        type: "report_submitted",
        badge: (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] px-2 py-0.5 flex items-center gap-1 font-bold">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> Questionnaire Soumis
          </Badge>
        ),
        button: (
          <Button
            size="sm"
            onClick={handleViewDetails}
            className="w-full h-9 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>En cours d'audit par l'équipe</span>
          </Button>
        ),
      };
    }

    if (repStatus === "refused") {
      return {
        type: "report_refused",
        badge: (
          <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px] px-2 py-0.5 flex items-center gap-1 font-bold">
            <XCircle className="w-3 h-3 text-rose-600" /> Rapport Refusé
          </Badge>
        ),
        button: (
          <Button
            size="sm"
            variant="outline"
            onClick={handleViewDetails}
            className="w-full h-9 text-xs font-bold rounded-xl border-rose-300 text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Consulter le motif de refus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        ),
      };
    }

    // 2. Statuts liés à la Candidature (si le rapport n'a pas encore été fait)
    if (hasApplied) {
      if (appStatus === "approved" || appStatus === "assigned") {
        return {
          type: "assigned",
          badge: (
            <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[10px] px-2 py-0.5 flex items-center gap-1 font-bold">
              <Store className="w-3 h-3 text-blue-600" /> Mission Assignée
            </Badge>
          ),
          button: (
            <Button
              size="sm"
              onClick={handleOpenReport}
              className="w-full h-9 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Remplir le questionnaire</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ),
        };
      }

      if (appStatus === "refused") {
        return {
          type: "app_refused",
          badge: (
            <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px] px-2 py-0.5 flex items-center gap-1 font-bold">
              <XCircle className="w-3 h-3 text-rose-600" /> Candidature Refusée
            </Badge>
          ),
          button: (
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewDetails}
              className="w-full h-9 text-xs font-bold rounded-xl border-rose-300 text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Détails de la mission</span>
            </Button>
          ),
        };
      }

      // Candidature en attente de validation admin
      return {
        type: "app_pending",
        badge: (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] px-2 py-0.5 flex items-center gap-1 font-bold">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> Candidature Envoyée
          </Badge>
        ),
        button: (
          <Button
            size="sm"
            onClick={handleViewDetails}
            className="w-full h-9 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Candidature en cours de validation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        ),
      };
    }

    // 3. Statut non postulé : Expirée vs Disponible
    if (isExpired) {
      return {
        type: "expired",
        badge: (
          <Badge className="bg-slate-200 text-slate-700 border-slate-300 text-[10px] px-2 py-0.5 flex items-center gap-1 font-bold">
            <AlertTriangle className="w-3 h-3 text-slate-500" /> Expirée
          </Badge>
        ),
        button: (
          <Button
            size="sm"
            disabled
            className="w-full h-9 text-xs font-semibold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <span>Date limite dépassée</span>
          </Button>
        ),
      };
    }

    // Disponible pour postuler
    return {
      type: "available",
      badge: (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] px-2 py-0.5 font-bold">
          Disponible
        </Badge>
      ),
      button: (
        <Button
          size="sm"
          onClick={handleViewDetails}
          className="w-full h-9 text-xs font-bold rounded-xl bg-[#041F40] hover:bg-[#083363] text-white hover:text-[#D6C799] shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          <span>Voir détails & Postuler</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#D6C799]" />
        </Button>
      ),
    };
  };

  const statusInfo = getShopperStatusInfo();

  return (
    <Card
      className={`min-h-[300px] h-full flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg group relative p-4 ${
        isExpired && !hasApplied
          ? "border-slate-300 bg-slate-100/80 opacity-75"
          : "border-slate-200 hover:border-[#041F40]/30 bg-white shadow-sm hover:shadow-md"
      }`}
    >
      {/* Accent supérieur subtil */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 transition-all ${
          isExpired && !hasApplied
            ? "bg-slate-400"
            : "bg-gradient-to-r from-[#041F40] via-[#D6C799] to-[#041F40]"
        }`}
      />

      {/* EN-TÊTE : Enseigne, Statut et Titre */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#041F40] uppercase tracking-wider truncate">
            <Building2 className="w-3.5 h-3.5 text-[#041F40] flex-shrink-0" />
            <span className="truncate">
              {mission.businessName || store.name || "Emberton Group"}
            </span>
          </div>

          {/* Badge unique sans ambiguïté */}
          <div className="flex-shrink-0">{statusInfo.badge}</div>
        </div>

        <CardTitle
          onClick={handleViewDetails}
          className="text-base font-bold text-[#041F40] group-hover:text-blue-900 transition-colors line-clamp-1 cursor-pointer leading-snug"
          title={mission.title}
        >
          {mission.title}
        </CardTitle>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
          {mission.description ||
            "Participez à cette mission d'audit mystère pour évaluer la qualité de service."}
        </p>
      </div>

      {/* CORPS : Point de vente & Localisation */}
      <div className="my-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold truncate">
            <Store className="w-3.5 h-3.5 text-[#041F40] flex-shrink-0" />
            <span className="truncate">
              {store.name || "Magasin partenaire"}
            </span>
          </div>
          {storesCount > 1 && (
            <span className="text-[10px] font-bold text-[#041F40] bg-[#041F40]/10 border border-[#041F40]/20 px-1.5 py-0.5 rounded-md flex-shrink-0">
              +{storesCount - 1} mag.
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="truncate">
              {store.city || mission.ville || store.address || "Maroc"}
            </span>
          </div>

          {(store.category || mission.category) && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 flex-shrink-0">
              {store.category || mission.category}
            </span>
          )}
        </div>
      </div>

      {/* LIGNE FINALE : Rémunération & Délai */}
      <div className="flex items-center justify-between py-1 text-xs">
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
          <Coins className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-black text-emerald-700 text-sm">
            {rewardAmount > 0 ? `${rewardAmount.toFixed(0)} MAD` : "Gratuit"}
          </span>
        </div>

        {formattedDeadline && (
          <div
            className={`flex items-center gap-1.5 text-[11px] font-semibold ${
              isExpired ? "text-rose-600" : "text-slate-700"
            }`}
          >
            {isExpired ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>
              {isExpired ? `Expirée le ${formattedDeadline}` : formattedDeadline}
            </span>
          </div>
        )}
      </div>

      {/* PIED DE CARTE : Bouton d'action unique */}
      <div className="pt-2">{statusInfo.button}</div>
    </Card>
  );
}
