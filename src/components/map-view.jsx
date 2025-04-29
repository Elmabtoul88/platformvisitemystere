
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react'; // Import useMemo
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const greenIcon = createMarkerIcon('hsl(var(--chart-1))'); // Green for assigned (using chart colors)
const yellowIcon = createMarkerIcon('hsl(var(--accent))'); // Yellow for available
const blueIcon = createMarkerIcon('hsl(var(--primary))'); // Blue for current location (using primary color)


// Helper to parse location strings (simple example, adjust as needed)
const parseLocation = (locationString) => {
    // Basic check for comma-separated lat,lng - VERY naive implementation
    if (typeof locationString === 'string' && locationString.includes(',')) {
        const parts = locationString.split(',');
        const lat = parseFloat(parts[0]?.trim());
        const lng = parseFloat(parts[1]?.trim());
        if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
        }
    }
    // Add more robust parsing or geocoding if locations are addresses
    // Fallback for demonstration (replace with proper geocoding or better data)
    console.warn(`Could not parse location: "${locationString}". Using fallback.`);
    // Example fallback - place markers near a central point with random offsets
    return { lat: 34.05 + (Math.random() - 0.5) * 0.1, lng: -118.24 + (Math.random() - 0.5) * 0.1 };
};

// Component to handle centering the map
function CenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom() || 13); // Keep current zoom or default to 13
    }
  }, [center, map]);
  return null;
}

export function MapView({ availableMissions = [], assignedMissions = [] }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [mapCenter, setMapCenter] = useState(null); // State to control map center
  const [initialCenter, setInitialCenter] = useState([34.0522, -118.2437]); // Default center
  const [isMapReady, setIsMapReady] = useState(false); // Track if initial center is set
  const mapRef = useRef(); // Ref for the map instance

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(loc);
          setMapCenter(loc); // Update mapCenter state
          setInitialCenter(loc); // Set initial center based on current location
          setLocationError(null);
          setIsLoadingLocation(false);
          setIsMapReady(true); // Map is ready once we have a center
          console.log('Current location:', loc);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(`Error getting location: ${error.message}`);
          // Keep the default initial center if location fails
          setMapCenter(initialCenter); // Update mapCenter to default
          setIsLoadingLocation(false);
          setIsMapReady(true); // Map is ready even with default center
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setMapCenter(initialCenter); // Update mapCenter to default
      setIsLoadingLocation(false);
      setIsMapReady(true); // Map is ready even with default center
    }
  }, []); // Empty dependency array to run once on mount

  const handleRecenter = () => {
    if (currentLocation) {
       setMapCenter(currentLocation); // Trigger map recentering by updating the state
    } else if (!isLoadingLocation) {
      // Try getting location again if it failed initially
      setIsLoadingLocation(true);
      setLocationError(null);
       if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
              setCurrentLocation(loc);
              setMapCenter(loc); // Update mapCenter state
              setIsLoadingLocation(false);
            },
            (error) => {
               console.error("Error getting location on recenter:", error);
               setLocationError(`Error getting location: ${error.message}`);
               setIsLoadingLocation(false);
            }
          );
       }
    }
  };


  // Memoize markers to prevent unnecessary re-renders
  const availableMarkers = useMemo(() => {
    return availableMissions.map((mission) => {
      const position = parseLocation(mission.location);
      if (!position) return null;
      return (
        <Marker key={`avail-${mission.id}`} position={[position.lat, position.lng]} icon={yellowIcon}>
          <Popup>
            <strong>{mission.title}</strong> (Available) <br />
            {mission.businessName} <br />
            Reward: ${mission.reward} <br/>
             {/* Add link to details page */}
             <a href={`/missions/${mission.id}/details`} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 text-xs">
                View Details
             </a>
          </Popup>
        </Marker>
      );
    }).filter(Boolean);
  }, [availableMissions]);

  const assignedMarkers = useMemo(() => {
    return assignedMissions.map((mission) => {
      const position = parseLocation(mission.location);
      if (!position) return null;
      return (
        <Marker key={`assigned-${mission.id}`} position={[position.lat, position.lng]} icon={greenIcon}>
          <Popup>
            <strong>{mission.title}</strong> (Assigned) <br />
             {mission.businessName} <br />
             Status: {mission.status} <br/>
             {/* Add link to report page */}
             <a href={`/report/${mission.id}`} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 text-xs">
                {mission.status === 'submitted' ? 'View Report' : 'Start Report'}
             </a>
          </Popup>
        </Marker>
      );
    }).filter(Boolean);
  }, [assignedMissions]);

  return (
    <div className="relative h-[calc(100vh-10rem)] w-full rounded-lg overflow-hidden shadow-lg border">
      {isLoadingLocation || !isMapReady ? (
        // Loading State
        <div className="flex justify-center items-center h-full bg-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading Map & Location...</span>
        </div>
      ) : (
        // Map Container (renders only when ready)
        <MapContainer
          center={initialCenter} // Use the center determined on load
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenCreated={instance => { mapRef.current = instance; }} // Store map instance if needed
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* Use CenterMap component to handle centering */}
          {mapCenter && <CenterMap center={mapCenter} />}

          {/* Render Markers */}
          {availableMarkers}
          {assignedMarkers}

          {/* Current Location Marker */}
          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={blueIcon}>
              <Popup>Your current location</Popup>
            </Marker>
          )}
        </MapContainer>
      )}
      {/* Recenter Button (visible after map is ready) */}
      {isMapReady && (
        <Button
          variant="secondary"
          size="icon"
          onClick={handleRecenter}
          className="absolute bottom-4 right-4 z-[1000] shadow-lg" // Ensure button is above map layers
          aria-label="Recenter Map"
          title="Recenter Map on Your Location"
          disabled={isLoadingLocation} // Disable if currently trying to load location
        >
          {isLoadingLocation ? <Loader2 className="w-5 h-5 animate-spin"/> : <MapPin className="w-5 h-5" />}
        </Button>
      )}
       {locationError && (
           <div className="absolute bottom-14 right-4 z-[1000] bg-destructive/90 text-destructive-foreground text-xs p-2 rounded shadow-lg max-w-xs">
               {locationError}
           </div>
        )}
    </div>
  );
}
