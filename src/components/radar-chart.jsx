"use client";

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Store, TrendingUp, Layers } from "lucide-react";

// Palette de couleurs harmonieuse (Navy, Gold, et nuances professionnelles)
const STORE_COLORS = [
  "#041F40", // Navy principal
  "#D6C799", // Gold emblématique
  "#2563EB", // Bleu roi
  "#10B981", // Émeraude
  "#F59E0B", // Ambre
  "#8B5CF6", // Violet
  "#EC4899", // Rose
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#6366F1", // Indigo
];

// Helper pour nettoyer et raccourcir les libellés de section
export const cleanSectionName = (name) => {
  if (!name) return "";
  let cleaned = String(name);
  cleaned = cleaned.replace(/^\d+[\.\s\-]+/, "").trim();
  cleaned = cleaned.replace(/\s*\(.*?\)\s*/g, " ").trim();
  cleaned = cleaned.replace(/&amp;/g, "&");
  if (cleaned.length > 25) {
    cleaned = cleaned.slice(0, 23) + "...";
  }
  return cleaned;
};

// ===========================================================================
// 1. RADAR GLOBAL DE LA MISSION (MOYENNE CONSOLIDÉE DE TOUTE LA MISSION)
// ===========================================================================
export function MissionAverageRadarChart({ sectionScoresSummary = [] }) {
  const chartData = useMemo(() => {
    if (!Array.isArray(sectionScoresSummary) || sectionScoresSummary.length === 0) {
      return [];
    }

    return sectionScoresSummary.map((sec) => ({
      subject: cleanSectionName(sec.name),
      rawSubject: sec.name,
      fullMark: 100,
      score: typeof sec.score === "number" && !isNaN(sec.score) ? sec.score : 0,
      benchmark: 100,
    }));
  }, [sectionScoresSummary]);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-[#041F40]/50 italic h-[340px]">
        Aucune donnée de section disponible pour afficher la moyenne globale.
      </div>
    );
  }

  return (
    <div className="w-full h-[340px] sm:h-[380px] flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#041F40" strokeOpacity={0.12} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#041F40", fontSize: 10, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#041F40", fontSize: 9 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "benchmark") return ["100%", "Standard Idéal"];
              return [`${value}%`, "Moyenne Consolidée"];
            }}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              borderRadius: "12px",
              borderColor: "rgba(4, 31, 64, 0.15)",
              boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
              fontSize: "12px",
              padding: "8px 12px",
            }}
          />
          <Legend
            formatter={(value) => {
              if (value === "score") {
                return (
                  <span className="text-xs font-bold text-[#041F40]">
                    Moyenne Consolidée de la Mission
                  </span>
                );
              }
              if (value === "benchmark") {
                return (
                  <span className="text-xs font-medium text-[#D6C799]">
                    Objectif de Référence (100%)
                  </span>
                );
              }
              return value;
            }}
            wrapperStyle={{ paddingTop: "8px" }}
          />
          {/* Ligne pointillée de l'objectif 100% */}
          <Radar
            name="benchmark"
            dataKey="benchmark"
            stroke="#D6C799"
            strokeDasharray="4 4"
            fill="none"
            strokeWidth={1.5}
          />
          {/* Polygone de la moyenne mission */}
          <Radar
            name="score"
            dataKey="score"
            stroke="#041F40"
            fill="#041F40"
            fillOpacity={0.28}
            strokeWidth={2.5}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}

// ===========================================================================
// 2. RADAR COMPARATIF : MAGASIN PAR MAGASIN OU TOUS ENSEMBLE (PAR DÉFAUT)
// ===========================================================================
export function MultiStoreRadarChart({
  normalizedSections = [],
  sectionScoresSummary = [],
}) {
  const [selectedStoreKey, setSelectedStoreKey] = useState("all");
  const [showAverageComparison, setShowAverageComparison] = useState(true);

  // Consolidation des données par magasin unique (agrège si plusieurs visites par magasin)
  const { chartData, storeList, uniqueSectionsList } = useMemo(() => {
    if (!Array.isArray(normalizedSections) || normalizedSections.length === 0) {
      return { chartData: [], storeList: [], uniqueSectionsList: [] };
    }

    // 1. Recenser toutes les sections uniques
    const sectionKeysMap = new Map();
    normalizedSections.forEach((item) => {
      if (item && item.sections && typeof item.sections === "object") {
        Object.keys(item.sections).forEach((k) => {
          if (!sectionKeysMap.has(k)) {
            sectionKeysMap.set(k, cleanSectionName(k));
          }
        });
      }
    });

    if (sectionKeysMap.size === 0) {
      return { chartData: [], storeList: [], uniqueSectionsList: [] };
    }

    // 2. Agréger par nom de magasin unique
    const storeMap = new Map();
    normalizedSections.forEach((rep) => {
      const name = rep.nomMagazin || "Point de vente";
      if (!storeMap.has(name)) {
        storeMap.set(name, {
          name,
          city: rep.ville || "",
          sectionSums: {},
          sectionCounts: {},
        });
      }
      const entry = storeMap.get(name);
      if (rep.sections && typeof rep.sections === "object") {
        Object.entries(rep.sections).forEach(([secKey, val]) => {
          if (typeof val === "number" && !isNaN(val)) {
            entry.sectionSums[secKey] = (entry.sectionSums[secKey] || 0) + val;
            entry.sectionCounts[secKey] = (entry.sectionCounts[secKey] || 0) + 1;
          }
        });
      }
    });

    // 3. Liste des magasins avec leurs clés uniques et couleurs
    const stores = Array.from(storeMap.values()).map((s, idx) => ({
      key: `store_${idx}`,
      name: s.name,
      city: s.city,
      color: STORE_COLORS[idx % STORE_COLORS.length],
      averages: Object.fromEntries(
        Object.entries(s.sectionSums).map(([secKey, sum]) => [
          secKey,
          Number((sum / Math.max(1, s.sectionCounts[secKey])).toFixed(1)),
        ]),
      ),
    }));

    // 4. Map des moyennes globales par section
    const globalAvgMap = {};
    if (Array.isArray(sectionScoresSummary)) {
      sectionScoresSummary.forEach((s) => {
        globalAvgMap[s.name] = s.score;
      });
    }

    // 5. Construction des données du Radar
    const data = Array.from(sectionKeysMap.entries()).map(([rawKey, cleanKey]) => {
      const row = {
        subject: cleanKey,
        rawSubject: rawKey,
        fullMark: 100,
        mission_avg: globalAvgMap[rawKey] || 0,
      };

      stores.forEach((store) => {
        const val = store.averages[rawKey];
        row[store.key] = typeof val === "number" && !isNaN(val) ? val : 0;
      });

      return row;
    });

    return {
      chartData: data,
      storeList: stores,
      uniqueSectionsList: Array.from(sectionKeysMap.values()),
    };
  }, [normalizedSections, sectionScoresSummary]);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-[#041F40]/50 italic h-[340px]">
        Aucune donnée de section disponible pour afficher le comparatif des magasins.
      </div>
    );
  }

  // Magasins à afficher dans le radar selon la sélection
  const displayedStores =
    selectedStoreKey === "all"
      ? storeList
      : storeList.filter((s) => s.key === selectedStoreKey);

  const activeStoreObj = storeList.find((s) => s.key === selectedStoreKey);

  return (
    <div className="space-y-3">
      {/* Barre de contrôle : Sélecteur de magasin & Option moyenne */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-[#041F40]/10">
        <div className="flex items-center gap-2">
          <Store className="w-3.5 h-3.5 text-[#041F40]/60 flex-shrink-0" />
          <span className="text-xs font-semibold text-[#041F40]">Vue :</span>
          <select
            value={selectedStoreKey}
            onChange={(e) => setSelectedStoreKey(e.target.value)}
            className="bg-white border border-[#041F40]/20 text-[#041F40] text-xs font-medium rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#041F40]"
          >
            <option value="all">
              Tous les magasins ensemble ({storeList.length}) [Par défaut]
            </option>
            {storeList.map((s) => (
              <option key={s.key} value={s.key}>
                {s.name} {s.city ? `(${s.city})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Option comparatif avec la moyenne globale */}
        {selectedStoreKey !== "all" && (
          <label className="flex items-center gap-1.5 text-xs text-[#041F40]/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showAverageComparison}
              onChange={(e) => setShowAverageComparison(e.target.checked)}
              className="rounded border-[#041F40]/30 text-[#041F40] focus:ring-0"
            />
            <span className="text-[11px] font-medium">
              Superposer la moyenne mission
            </span>
          </label>
        )}
      </div>

      {/* Graphique Radar */}
      <div className="w-full h-[320px] sm:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#041F40" strokeOpacity={0.12} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#041F40", fontSize: 10, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "#041F40", fontSize: 9 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "mission_avg") {
                  return [`${value}%`, "Moyenne Mission (Repère)"];
                }
                const store = storeList.find((s) => s.key === name);
                const displayName = store ? store.name : name;
                return [`${value}%`, displayName];
              }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.96)",
                borderRadius: "12px",
                borderColor: "rgba(4, 31, 64, 0.15)",
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
            />
            <Legend
              formatter={(value) => {
                if (value === "mission_avg") {
                  return (
                    <span className="text-xs font-semibold text-[#041F40]/60 italic">
                      --- Moyenne Mission
                    </span>
                  );
                }
                const store = storeList.find((s) => s.key === value);
                return (
                  <span className="text-xs font-semibold text-[#041F40]">
                    {store ? store.name : value}
                  </span>
                );
              }}
              wrapperStyle={{ paddingTop: "8px" }}
              iconType="circle"
            />

            {/* Repère optionnel de la moyenne mission lorsqu'un magasin individuel est sélectionné */}
            {selectedStoreKey !== "all" && showAverageComparison && (
              <Radar
                name="mission_avg"
                dataKey="mission_avg"
                stroke="#041F40"
                strokeDasharray="4 4"
                fill="#041F40"
                fillOpacity={0.08}
                strokeWidth={1.5}
              />
            )}

            {/* Radars des magasins affichés */}
            {displayedStores.map((store) => (
              <Radar
                key={store.key}
                name={store.key}
                dataKey={store.key}
                stroke={store.color}
                fill={store.color}
                fillOpacity={selectedStoreKey === "all" ? 0.2 : 0.35}
                strokeWidth={selectedStoreKey === "all" ? 2 : 2.5}
              />
            ))}
          </RechartsRadar>
        </ResponsiveContainer>
      </div>

      {/* Résumé textuel si un seul magasin est sélectionné */}
      {activeStoreObj && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs">
          <span className="font-semibold text-[#041F40]">
            Point de vente : {activeStoreObj.name} {activeStoreObj.city ? `(${activeStoreObj.city})` : ""}
          </span>
          <span className="text-[#041F40]/70 text-[11px]">
            Comparé aux {storeList.length} points de vente du réseau
          </span>
        </div>
      )}
    </div>
  );
}

// Export par défaut pour compatibilité
export default MultiStoreRadarChart;
