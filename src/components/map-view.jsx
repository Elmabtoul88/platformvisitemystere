"use client";

import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPin, Navigation, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Coordonnées par défaut : Maroc (Casablanca / Rabat)
const DEFAULT_CENTER = [33.5731, -7.5898];

export function MapView({
  availableMissions = [],
  assignedMissions = [],
  selectedCity = null,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  // Création d'icônes Leaflet personnalisées via SVG haute visibilité
  const createCustomPinIcon = (type = "available") => {
    // Couleurs vives et contrastées
    const isAvailable = type === "available";
    const isAssigned = type === "assigned";
    const isUser = type === "user";

    const pinColor = isAvailable
      ? "#F59E0B" // Ambre / Doré vibrant
      : isAssigned
        ? "#059669" // Émeraude vif
        : "#0284C7"; // Bleu cyan ciel pour l'utilisateur

    const iconSvg = isUser
      ? `<circle cx="12" cy="12" r="5" fill="#0284C7"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3" stroke="#0284C7" stroke-width="2" stroke-linecap="round"/>`
      : isAssigned
        ? `<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#059669"/>`
        : `<path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z" fill="#D97706"/>`;

    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="position: relative; width: 36px; height: 44px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4)); cursor: pointer; transition: transform 0.2s ease;">
          <svg viewBox="0 0 36 44" width="36" height="44" fill="none">
            <path d="M18 0C8.06 0 0 8.06 0 18C0 29.5 18 44 18 44C18 44 36 29.5 36 18C36 8.06 27.94 0 18 0Z" fill="${pinColor}"/>
            <circle cx="18" cy="18" r="12" fill="#FFFFFF"/>
          </svg>
          <div style="position: absolute; top: 6px; left: 6px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              ${iconSvg}
            </svg>
          </div>
          ${
            isUser
              ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #0284C7; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.6; pointer-events: none;"></div>`
              : ""
          }
        </div>
      `,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -42],
    });
  };

  const availableStoreIcon = createCustomPinIcon("available");
  const assignedStoreIcon = createCustomPinIcon("assigned");
  const userLocationIcon = createCustomPinIcon("user");

  // Initialisation de la carte Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const mapInstance = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 11,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapInstance);

    mapRef.current = mapInstance;

    // Invalider la taille après le montage pour éviter un affichage partiel
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 250);

    return () => {
      mapInstance.remove();
      mapRef.current = null;
    };
  }, []);

  // Géolocalisation
  useEffect(() => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(loc);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  // Affichage de tous les magasins et missions
  useEffect(() => {
    if (!mapRef.current) return;

    // Nettoyer les anciens marqueurs
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const allBoundsCoords = [];

    // Helper pour valider les coordonnées
    const isValidCoord = (lat, lng) => {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      return (
        !isNaN(parsedLat) &&
        !isNaN(parsedLng) &&
        parsedLat !== 0 &&
        parsedLng !== 0 &&
        parsedLat >= -90 &&
        parsedLat <= 90 &&
        parsedLng >= -180 &&
        parsedLng <= 180
      );
    };

    // 1. MARQUEURS DES MAGASINS DISPONIBLES
    availableMissions.forEach((mission) => {
      const stores = Array.isArray(mission.stores)
        ? mission.stores
        : mission.store
          ? [mission.store]
          : [];

      // Filtrer les magasins avec coordonnées valides
      const storesWithCoords = stores.filter((s) =>
        isValidCoord(s?.latitude, s?.longitude),
      );

      if (storesWithCoords.length > 0) {
        // Placer un marqueur pour CHAQUE magasin possédant lat/lng
        storesWithCoords.forEach((store) => {
          if (
            selectedCity &&
            store.city &&
            !store.city.toLowerCase().includes(selectedCity.toLowerCase())
          ) {
            return;
          }

          const sLat = parseFloat(store.latitude);
          const sLng = parseFloat(store.longitude);

          const popupContent = `
            <div style="font-family: inherit; font-size: 13px; min-width: 240px; max-width: 300px; padding: 4px 2px; color: #041F40; line-height: 1.4;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 10px; font-weight: 700; background: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">
                  Point de vente
                </span>
                ${store.category ? `<span style="font-size: 10px; color: #64748B;">${store.category}</span>` : ""}
              </div>

              <h4 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 800; color: #041F40;">
                ${store.name || "Magasin partenaire"}
              </h4>

              <div style="font-size: 12px; color: #475569; margin-bottom: 6px; display: flex; align-items: flex-start; gap: 4px;">
                <span>📍</span>
                <span>${store.address ? store.address + ", " : ""}${store.city || mission.ville || ""}</span>
              </div>

              <div style="background: #F1F5F9; border-radius: 8px; padding: 6px 10px; margin-bottom: 10px;">
                <div style="font-size: 11px; color: #64748B;">Mission associée</div>
                <div style="font-weight: 700; color: #041F40; font-size: 13px;">${mission.title}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                  <span style="font-size: 11px; color: #64748B;">${mission.businessName || ""}</span>
                  <span style="font-size: 13px; font-weight: 800; color: #059669;">
                    ${mission.reward ? parseFloat(mission.reward).toFixed(0) + " MAD" : "Gratuit"}
                  </span>
                </div>
              </div>

              <div>
                <a href="/missions/${mission.id}/details" style="display: block; text-align: center; background: #041F40; color: #D6C799; padding: 8px 12px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 12px; transition: background 0.2s;">
                  Voir détails & Postuler →
                </a>
              </div>
            </div>
          `;

          const marker = L.marker([sLat, sLng], { icon: availableStoreIcon })
            .addTo(mapRef.current)
            .bindPopup(popupContent, { maxWidth: 320 });

          markersRef.current.push(marker);
          allBoundsCoords.push([sLat, sLng]);
        });
      } else if (isValidCoord(mission.latitude, mission.longitude)) {
        // Fallback : coordonnées au niveau de la mission
        const mLat = parseFloat(mission.latitude);
        const mLng = parseFloat(mission.longitude);

        if (
          selectedCity &&
          mission.ville &&
          !mission.ville.toLowerCase().includes(selectedCity.toLowerCase())
        ) {
          return;
        }

        const popupContent = `
          <div style="font-family: inherit; font-size: 13px; min-width: 230px; padding: 4px 2px; color: #041F40;">
            <span style="font-size: 10px; font-weight: 700; background: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 9999px;">
              Mission disponible
            </span>
            <h4 style="margin: 6px 0 4px 0; font-size: 15px; font-weight: 800; color: #041F40;">
              ${mission.title}
            </h4>
            <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">
              🏢 ${mission.businessName || "Enseigne"} • 📍 ${mission.ville || mission.location || "Maroc"}
            </div>
            <div style="font-weight: 800; color: #059669; font-size: 13px; margin-bottom: 8px;">
              Rémunération: ${mission.reward || 0} MAD
            </div>
            <a href="/missions/${mission.id}/details" style="display: block; text-align: center; background: #041F40; color: #D6C799; padding: 7px 10px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 12px;">
              Voir détails & Postuler →
            </a>
          </div>
        `;

        const marker = L.marker([mLat, mLng], { icon: availableStoreIcon })
          .addTo(mapRef.current)
          .bindPopup(popupContent);

        markersRef.current.push(marker);
        allBoundsCoords.push([mLat, mLng]);
      }
    });

    // 2. MARQUEURS DES MAGASINS ASSIGNÉS
    assignedMissions.forEach((mission) => {
      const stores =
        Array.isArray(mission.stores) && mission.stores.length > 0
          ? mission.stores
          : Array.isArray(mission.all_stores) && mission.all_stores.length > 0
            ? mission.all_stores
            : mission.store
              ? [mission.store]
              : [];

      const storesWithCoords = stores.filter((s) =>
        isValidCoord(s?.latitude, s?.longitude),
      );

      if (storesWithCoords.length > 0) {
        storesWithCoords.forEach((store) => {
          if (
            selectedCity &&
            store.city &&
            !store.city.toLowerCase().includes(selectedCity.toLowerCase())
          ) {
            return;
          }

          const sLat = parseFloat(store.latitude);
          const sLng = parseFloat(store.longitude);

          const popupContent = `
            <div style="font-family: inherit; font-size: 13px; min-width: 240px; padding: 4px 2px; color: #041F40;">
              <span style="font-size: 10px; font-weight: 700; background: #D1FAE5; color: #065F46; padding: 2px 8px; border-radius: 9999px;">
                ✅ Mission Assignée
              </span>
              <h4 style="margin: 6px 0 4px 0; font-size: 15px; font-weight: 800; color: #041F40;">
                ${store.name || mission.title}
              </h4>
              <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">
                📍 ${store.address ? store.address + ", " : ""}${store.city || ""}
              </div>
              <div style="background: #F8FAFC; border-radius: 6px; padding: 6px; margin-bottom: 8px;">
                <span style="font-size: 11px; color: #64748B;">Mission: </span>
                <strong style="color: #041F40;">${mission.title}</strong>
              </div>
              <a href="/report/${mission.id}?storeId=${store.id}" style="display: block; text-align: center; background: #059669; color: white; padding: 8px 12px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 12px;">
                Remplir le questionnaire →
              </a>
            </div>
          `;

          const marker = L.marker([sLat, sLng], { icon: assignedStoreIcon })
            .addTo(mapRef.current)
            .bindPopup(popupContent);

          markersRef.current.push(marker);
          allBoundsCoords.push([sLat, sLng]);
        });
      } else if (isValidCoord(mission.latitude, mission.longitude)) {
        const mLat = parseFloat(mission.latitude);
        const mLng = parseFloat(mission.longitude);

        if (
          selectedCity &&
          mission.ville &&
          !mission.ville.toLowerCase().includes(selectedCity.toLowerCase())
        ) {
          return;
        }

        const popupContent = `
          <div style="font-family: inherit; font-size: 13px; min-width: 230px; padding: 4px 2px; color: #041F40;">
            <span style="font-size: 10px; font-weight: 700; background: #D1FAE5; color: #065F46; padding: 2px 8px; border-radius: 9999px;">
              ✅ Mission Assignée
            </span>
            <h4 style="margin: 6px 0 4px 0; font-size: 15px; font-weight: 800; color: #041F40;">
              ${mission.title}
            </h4>
            <div style="font-size: 12px; color: #475569; margin-bottom: 8px;">
              🏢 ${mission.businessName || ""} • 📍 ${mission.location || ""}
            </div>
            <a href="/report/${mission.id}" style="display: block; text-align: center; background: #059669; color: white; padding: 7px 10px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 12px;">
              Remplir le questionnaire →
            </a>
          </div>
        `;

        const marker = L.marker([mLat, mLng], { icon: assignedStoreIcon })
          .addTo(mapRef.current)
          .bindPopup(popupContent);

        markersRef.current.push(marker);
        allBoundsCoords.push([mLat, mLng]);
      }
    });

    // 3. MARQUEUR DE LA POSITION DE L'UTILISATEUR
    if (currentLocation) {
      const userMarker = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: userLocationIcon,
      })
        .addTo(mapRef.current)
        .bindPopup(
          `<div style="text-align: center; padding: 4px; color: #041F40;">
            <strong style="color: #0284C7;">Votre position actuelle</strong>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748B;">Prêt pour les audits à proximité</p>
          </div>`,
        );
      markersRef.current.push(userMarker);
    }

    // Ajustement automatique du cadrage de la carte sur tous les magasins
    if (allBoundsCoords.length > 0) {
      try {
        if (allBoundsCoords.length === 1) {
          mapRef.current.setView(allBoundsCoords[0], 13);
        } else {
          const bounds = L.latLngBounds(allBoundsCoords);
          mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      } catch (e) {
        console.warn("Erreur fitBounds:", e);
      }
    }
  }, [availableMissions, assignedMissions, currentLocation, selectedCity]);

  const handleRecenter = () => {
    if (mapRef.current && currentLocation) {
      mapRef.current.flyTo([currentLocation.lat, currentLocation.lng], 14, {
        duration: 1.2,
      });
      toast({
        title: "Position centrée",
        description: "La carte a été recentrée sur votre position.",
      });
    } else {
      toast({
        title: "Position non disponible",
        description: "Veuillez autoriser la géolocalisation dans votre navigateur.",
      });
    }
  };

  return (
    <div className="relative h-[60vh] sm:h-[calc(100vh-14rem)] min-h-[380px] sm:min-h-[480px] w-full rounded-2xl overflow-hidden shadow-2xl border border-[#D6C799]/20">
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Bouton de recentrage flottant */}
      <Button
        variant="secondary"
        size="icon"
        onClick={handleRecenter}
        className="absolute bottom-5 right-5 z-[1000] shadow-xl rounded-full bg-[#041F40] text-[#D6C799] hover:bg-[#0c2b54] border border-[#D6C799]/40 h-11 w-11 transition-transform hover:scale-105"
        title="Centrer sur ma position"
      >
        {isLocating ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#D6C799]" />
        ) : (
          <Crosshair className="w-5 h-5 text-[#D6C799]" />
        )}
      </Button>

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 14px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25),
            0 8px 10px -6px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(214, 199, 153, 0.3);
          overflow: hidden;
        }
        .leaflet-popup-tip {
          background: white;
        }
        .leaflet-popup-content {
          margin: 14px 16px;
        }
      `}</style>
    </div>
  );
}
