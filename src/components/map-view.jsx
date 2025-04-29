
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet'; // Import Leaflet directly
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import { Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link'; // Import Link for popups
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Custom Icon Creation using L.divIcon for colored markers
const createMarkerIcon = (color) => {
  return L.divIcon({
    html: `<svg viewBox="0 0 24 24" fill="${color}" class="w-6 h-6 drop-shadow-md"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    className: '', // Avoid default Leaflet styles conflicting
    iconSize: [24, 24],
    iconAnchor: [12, 24], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -24], // Point from which the popup should open relative to the iconAnchor
  });
};

// Define icons using CSS variables from the theme
const greenIcon = createMarkerIcon('hsl(var(--chart-1))'); // Green for assigned
const yellowIcon = createMarkerIcon('hsl(var(--accent))'); // Yellow for available
const blueIcon = createMarkerIcon('hsl(var(--primary))'); // Blue for current location


// Helper to parse location strings (simple example, adjust as needed)
const parseLocation = (locationString) => {
    // Basic validation for Lat,Lng format (adjust regex if needed)
    if (typeof locationString === 'string' && /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(locationString)) {
        const parts = locationString.split(',');
        const lat = parseFloat(parts[0]?.trim());
        const lng = parseFloat(parts[1]?.trim());
        // Further validation for valid ranges
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return { lat, lng };
        }
    }
    console.warn(`Could not parse location: "${locationString}". Using fallback.`);
    // Fallback near center with random offset for visual distinction if parsing fails
    return { lat: 34.05 + (Math.random() - 0.5) * 0.1, lng: -118.24 + (Math.random() - 0.5) * 0.1 };
};


export function MapView({ availableMissions = [], assignedMissions = [] }) {
  const mapContainerRef = useRef(null); // Ref for the map container div
  const mapRef = useRef(null); // Ref to store the Leaflet map instance
  const markersRef = useRef([]); // Ref to store marker instances for cleanup
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [initialCenter, setInitialCenter] = useState([34.0522, -118.2437]); // Default center (Los Angeles)
  const { toast } = useToast(); // Initialize toast

  // Effect for fetching current location
  useEffect(() => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(loc);
          setInitialCenter([loc.lat, loc.lng]); // Set center based on location
          setLocationError(null);
          setIsLoadingLocation(false);
          console.log('Current location:', loc);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(`Error getting location: ${error.message}. Displaying default map center.`);
          // Keep default LA center if location fails
          setIsLoadingLocation(false); // Still stop loading on error
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser. Displaying default map center.");
      // Keep default LA center if geolocation not supported
      setIsLoadingLocation(false);
    }
  }, []); // Run once on mount


  // Effect for initializing and updating the map
  useEffect(() => {
    // Ensure the container exists and Leaflet is loaded AND location attempt is finished
    if (mapContainerRef.current && !mapRef.current && !isLoadingLocation) {
        console.log("Initializing Leaflet map with center:", initialCenter);
        // Initialize map ONLY if it hasn't been initialized yet
        mapRef.current = L.map(mapContainerRef.current, {
            center: initialCenter,
            zoom: 13,
            // Consider adding zoom control options if needed: zoomControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19, // Standard max zoom for OSM
        }).addTo(mapRef.current);

        // Add zoom controls if they were disabled during init
        // L.control.zoom({ position: 'topright' }).addTo(mapRef.current);
    }

     // Add/Update markers when map is ready and data is available
     if (mapRef.current) {
        console.log("Updating markers...");
        // --- Clear existing markers ---
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = []; // Reset the markers array

        // --- Add Available Mission Markers ---
        availableMissions.forEach((mission) => {
            const position = parseLocation(mission.location);
            if (position) {
                const popupContent = `
                        <strong>${mission.title || 'Mission'}</strong> (Available)<br/>
                        ${mission.businessName || 'N/A'}<br/>
                        Reward: $${mission.reward || 0}<br/>
                        <a href="/missions/${mission.id}/details" class="text-primary underline hover:text-primary/80 text-xs font-semibold">
                           View Details & Apply
                        </a>
                    `;
                 try {
                    const marker = L.marker([position.lat, position.lng], { icon: yellowIcon })
                        .addTo(mapRef.current)
                        .bindPopup(popupContent);
                    markersRef.current.push(marker); // Store marker instance
                } catch (e) {
                     console.error("Error adding available mission marker:", e, "Position:", position);
                 }
            }
        });

         // --- Add Assigned Mission Markers ---
         assignedMissions.forEach((mission) => {
            const position = parseLocation(mission.location);
            if (position) {
                const popupContent = `
                        <strong>${mission.title || 'Mission'}</strong> (Assigned)<br/>
                        ${mission.businessName || 'N/A'}<br/>
                        Status: ${mission.status || 'N/A'}<br/>
                         <a href="/report/${mission.id}" class="text-primary underline hover:text-primary/80 text-xs font-semibold">
                            ${mission.status === 'submitted' ? 'View Submitted Report' : 'Start/Continue Report'}
                         </a>
                    `;
                 try {
                    const marker = L.marker([position.lat, position.lng], { icon: greenIcon })
                        .addTo(mapRef.current)
                        .bindPopup(popupContent);
                    markersRef.current.push(marker); // Store marker instance
                } catch(e) {
                    console.error("Error adding assigned mission marker:", e, "Position:", position);
                }
            }
        });

        // --- Add Current Location Marker ---
         if (currentLocation) {
             try {
                const marker = L.marker([currentLocation.lat, currentLocation.lng], { icon: blueIcon })
                     .addTo(mapRef.current)
                     .bindPopup("Your current location");
                markersRef.current.push(marker); // Store marker instance
             } catch (e) {
                 console.error("Error adding current location marker:", e, "Location:", currentLocation);
             }
         }

          // Optional: Fit map bounds to markers if needed
         // if (markersRef.current.length > 0) {
         //    const group = L.featureGroup(markersRef.current);
         //    mapRef.current.fitBounds(group.getBounds().pad(0.1)); // Add padding
         // } else if (currentLocation) {
         //    mapRef.current.setView([currentLocation.lat, currentLocation.lng], 13); // Center on user if no markers
         // } else {
         //     mapRef.current.setView(initialCenter, 13); // Fallback center
         // }

     }

    // --- Cleanup function ---
    // DO NOT remove the map instance here if the component might re-render without unmounting
    // We only want to remove markers on data updates.
    // The map instance should only be removed when the component truly unmounts.

    // Return a cleanup function specifically for component unmount
    return () => {
        // This runs ONLY when the component is unmounted
        if (mapRef.current) {
            console.log("Unmounting MapView: Cleaning up Leaflet map instance.");
            mapRef.current.remove(); // Destroy the map instance
            mapRef.current = null; // Nullify the ref
        }
    };
  }, [availableMissions, assignedMissions, currentLocation, initialCenter, isLoadingLocation]); // Re-run if data or location status changes


   const handleRecenter = () => {
    if (mapRef.current && currentLocation) {
      mapRef.current.setView([currentLocation.lat, currentLocation.lng], 14); // Recenter map with slightly more zoom
    } else if (!isLoadingLocation && !currentLocation) {
        // Optionally prompt to retry getting location if it failed initially
        toast({ variant: "destructive", title: "Location Unavailable", description: locationError || "Could not retrieve your current location." });
    }
   };


  return (
    <div className="relative h-[calc(100vh-10rem)] w-full rounded-lg overflow-hidden shadow-lg border">
      {/* The map container div - ensure it's always rendered */}
       <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}>
           {/* Loading indicator shown while waiting for location/map init */}
           {isLoadingLocation && (
                <div className="absolute inset-0 flex justify-center items-center bg-secondary/50 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading Map & Location...</span>
                </div>
            )}
        </div>

      {/* Recenter Button */}
      {!isLoadingLocation && ( // Show button only after initial location attempt
        <Button
          variant="secondary"
          size="icon"
          onClick={handleRecenter}
          className="absolute bottom-4 right-4 z-[1000] shadow-lg rounded-full" // Ensure button is above map layers, make round
          aria-label="Recenter Map"
          title="Recenter Map on Your Location"
          disabled={isLoadingLocation || !currentLocation} // Disable if loading or no location
        >
           <MapPin className="w-5 h-5" />
        </Button>
      )}

       {/* Location Error Message */}
       {locationError && !isLoadingLocation && (
           <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-destructive/90 text-destructive-foreground text-xs p-2 rounded shadow-lg max-w-xs text-center">
               {locationError}
           </div>
        )}
    </div>
  );
}
