"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { fetchMissions } from "@/services/fetchData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import {
  MapPin,
  Navigation,
  Loader2,
  Sparkles,
  Globe,
  Store,
  Filter,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const MapView = dynamic(
  () => import("@/components/map-view").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[580px] rounded-2xl bg-[#0c223c]/80 backdrop-blur-md border border-[#D6C799]/20 flex flex-col items-center justify-center gap-4 shadow-2xl">
        <div className="relative">
          <div className="absolute inset-0 bg-[#D6C799]/20 rounded-full blur-2xl animate-pulse"></div>
          <Loader2 className="h-12 w-12 animate-spin text-[#D6C799] relative z-10" />
        </div>
        <p className="text-slate-300 text-sm font-medium">
          Chargement de la carte et des points de vente...
        </p>
      </div>
    ),
  },
);

export default function MapPage() {
  const { user } = useAuth();
  const [allMissions, setAllMissions] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setIsLoading(true);

      try {
        let missionsData = [];
        try {
          const appRes = await fetchMissions(
            `missions_app_${user.id}`,
            `missions/missionsApp/${user.id}`,
          );
          missionsData = appRes?.data || appRes || [];
        } catch (e) {
          console.warn("Fallback missions fetch:", e);
          const fallbackRes = await fetchMissions(
            "missions_all",
            "missions/admin/all",
          );
          missionsData = Array.isArray(fallbackRes)
            ? fallbackRes
            : fallbackRes?.data || [];
        }

        let assignedData = [];
        try {
          const assRes = await fetchMissions(
            `mission_assigned_${user.id}`,
            `applications/assigned/${user.id}`,
          );
          assignedData = Array.isArray(assRes) ? assRes : [];
        } catch (e) {
          console.warn("Could not load assigned missions:", e);
        }

        const safeMissions = Array.isArray(missionsData) ? missionsData : [];
        const safeAssignments = Array.isArray(assignedData) ? assignedData : [];

        // Filtre de coordonnées : garder si le store OU la mission a des coordonnées valides
        const hasCoords = (item) => {
          const mLat = parseFloat(item.latitude);
          const mLng = parseFloat(item.longitude);
          if (!isNaN(mLat) && !isNaN(mLng) && mLat !== 0 && mLng !== 0) {
            return true;
          }

          const stores =
            Array.isArray(item.stores) && item.stores.length > 0
              ? item.stores
              : Array.isArray(item.all_stores)
                ? item.all_stores
                : item.store
                  ? [item.store]
                  : [];

          return stores.some((s) => {
            const sLat = parseFloat(s?.latitude);
            const sLng = parseFloat(s?.longitude);
            return !isNaN(sLat) && !isNaN(sLng) && sLat !== 0 && sLng !== 0;
          });
        };

        setAllMissions(safeMissions.filter(hasCoords));
        setAssigned(safeAssignments.filter(hasCoords));
      } catch (error) {
        console.error("Map fetch error:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les données de la carte.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Filtrer les missions disponibles (non encore postulées ou statut available)
  const availableMissions = useMemo(() => {
    return allMissions.filter(
      (m) => m.status === "available" || !m.has_applied,
    );
  }, [allMissions]);

  // Filtrer les missions assignées actives
  const assignedMissions = useMemo(() => {
    return assigned.filter(
      (m) =>
        m.mission_status === "assigned" ||
        m.mission_status === "submitted" ||
        m.status === "assigned" ||
        m.status === "approved" ||
        m.status === "submitted",
    );
  }, [assigned]);

  // Calculer le total exact des magasins physiques avec coordonnées
  const stats = useMemo(() => {
    const isValidCoord = (lat, lng) => {
      const pLat = parseFloat(lat);
      const pLng = parseFloat(lng);
      return !isNaN(pLat) && !isNaN(pLng) && pLat !== 0 && pLng !== 0;
    };

    let availStoresCount = 0;
    const citiesSet = new Set();

    availableMissions.forEach((m) => {
      const stores = Array.isArray(m.stores)
        ? m.stores
        : m.store
          ? [m.store]
          : [];
      const validStores = stores.filter((s) =>
        isValidCoord(s?.latitude, s?.longitude),
      );

      if (validStores.length > 0) {
        availStoresCount += validStores.length;
        validStores.forEach((s) => s.city && citiesSet.add(s.city.trim()));
      } else if (isValidCoord(m.latitude, m.longitude)) {
        availStoresCount += 1;
        if (m.ville) citiesSet.add(m.ville.trim());
      }
    });

    let assignedStoresCount = 0;
    assignedMissions.forEach((m) => {
      const stores =
        Array.isArray(m.stores) && m.stores.length > 0
          ? m.stores
          : Array.isArray(m.all_stores)
            ? m.all_stores
            : m.store
              ? [m.store]
              : [];
      const validStores = stores.filter((s) =>
        isValidCoord(s?.latitude, s?.longitude),
      );

      if (validStores.length > 0) {
        assignedStoresCount += validStores.length;
        validStores.forEach((s) => s.city && citiesSet.add(s.city.trim()));
      } else if (isValidCoord(m.latitude, m.longitude)) {
        assignedStoresCount += 1;
        if (m.ville) citiesSet.add(m.ville.trim());
      }
    });

    return {
      availableStores: availStoresCount,
      assignedStores: assignedStoresCount,
      totalLocations: availStoresCount + assignedStoresCount,
      cities: Array.from(citiesSet).sort(),
    };
  }, [availableMissions, assignedMissions]);

  const activeCityFilter = selectedCity === "all" ? null : selectedCity;

  return (
    <div className="min-h-screen bg-slate-50/90 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête avec statistiques */}
        <div className="bg-gradient-to-r from-[#041F40] via-[#093568] to-[#041F40] rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-[#041F40]/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#D6C799]/20 border border-[#D6C799]/30 shadow-sm shrink-0">
                <Globe className="w-6 h-6 text-[#D6C799]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                  Carte des Magasins & Missions
                  <Sparkles className="w-4 h-4 text-[#D6C799] shrink-0" />
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 mt-0.5 font-medium">
                  Localisez les magasins à auditer et suivez vos affectations géographiques
                </p>
              </div>
            </div>

            {/* Badges de comptage */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/15 text-white border-white/20 px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm">
                <Store className="w-3.5 h-3.5 text-[#D6C799]" />
                {stats.availableStores} Disponibles
              </Badge>
              <Badge className="bg-emerald-500/25 text-emerald-200 border-emerald-400/40 px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                {stats.assignedStores} Assignés
              </Badge>
              <Badge className="bg-[#D6C799] text-[#041F40] border-[#D6C799] px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold">
                <Navigation className="w-3.5 h-3.5 text-[#041F40]" />
                {stats.totalLocations} Points GPS
              </Badge>
            </div>
          </div>
        </div>

        {/* Barre de filtre par ville */}
        {stats.cities.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Filter className="w-4 h-4 text-[#041F40]" />
              <span className="font-bold text-[#041F40]">Filtrer par ville :</span>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-[200px] h-9 text-xs bg-slate-50 border-slate-300 text-slate-900 font-medium rounded-lg">
                  <SelectValue placeholder="Toutes les villes" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-900 shadow-lg rounded-lg">
                  <SelectItem value="all" className="font-semibold">Toutes les villes ({stats.cities.length})</SelectItem>
                  {stats.cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCity !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCity("all")}
                  className="h-9 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold"
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Carte Leaflet */}
        <Card className="border border-slate-200 bg-white shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="w-full h-[580px] flex flex-col items-center justify-center gap-4 bg-slate-50">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#041F40]/10 rounded-full blur-2xl animate-pulse"></div>
                  <Loader2 className="h-12 w-12 animate-spin text-[#041F40] relative z-10" />
                </div>
                <p className="text-slate-600 text-sm font-semibold">
                  Chargement des points de vente...
                </p>
              </div>
            ) : (
              <MapView
                availableMissions={availableMissions}
                assignedMissions={assignedMissions}
                selectedCity={activeCityFilter}
              />
            )}
          </CardContent>
        </Card>

        {/* Légende haute visibilité */}
        <div className="flex flex-wrap items-center justify-center gap-6 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#F59E0B] shadow-sm border-2 border-white"></div>
            <span className="text-xs text-slate-800 font-bold">
              Magasins Disponibles
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#059669] shadow-sm border-2 border-white"></div>
            <span className="text-xs text-slate-800 font-bold">
              Missions Assignées
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#0284C7] shadow-sm border-2 border-white animate-pulse"></div>
            <span className="text-xs text-slate-800 font-bold">
              Votre Position
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 border-l border-slate-200 pl-4 hidden sm:flex font-medium">
            <Navigation className="w-3.5 h-3.5 text-[#041F40]" />
            <span>Cliquez sur un marqueur pour consulter la boutique et postuler</span>
          </div>
        </div>
      </div>
    </div>
  );
}
