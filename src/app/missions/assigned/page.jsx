
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { mockMissions, mockUser, mockStores } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { ClipboardList, SearchX, ArrowLeft, Loader2, MapPin, LocateFixed, ServerCrash, Info, CircleHelp, Navigation } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// --- Helper Functions ---

// Haversine formula to calculate distance between two lat/lng points in KM
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

const getStatusVariant = (status) => {
    switch (status) {
      case 'assigned': return 'default';
      case 'submitted': return 'outline';
      default: return 'secondary';
    }
};

// --- Main Component ---

export default function AssignedMissionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State for location, stores, and UI interactions
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [storesData, setStoresData] = useState({ missionId: null, stores: [], isLoading: false });
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [missionForDetails, setMissionForDetails] = useState(null);

  // Memoized list of assigned missions
  const assignedMissions = useMemo(() => {
    return mockMissions.filter(mission =>
      (mission.status === 'assigned' || mission.status === 'submitted') &&
      (Array.isArray(mission.assignedTo) ? mission.assignedTo.includes(mockUser.id) : mission.assignedTo === mockUser.id)
    );
  }, []);

  // Function to find and display nearby stores for a mission, filtered by city first
  const handleFindStores = (mission) => {
    if (storesData.missionId === mission.id) {
        setStoresData({ missionId: null, stores: [], isLoading: false });
        return;
    }

    setStoresData({ missionId: mission.id, stores: [], isLoading: true });

    setTimeout(() => {
        // Filter by mission ID first, then by user's city
        let storesForMission = mockStores.filter(store => 
            store.mission_id === mission.id && 
            store.active &&
            store.city === mockUser.city // Automatic city filter
        );

        setStoresData({ missionId: mission.id, stores: storesForMission, isLoading: false });
    }, 500);
  };
  
  // New function to sort by closest on demand
  const handleSortByClosest = (missionId) => {
      if (isFetchingLocation) return;
      
      setIsFetchingLocation(true);
      setLocationError(null);

      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const { latitude, longitude } = position.coords;
                  const currentUserLocation = { lat: latitude, lng: longitude };
                  setUserLocation(currentUserLocation);
                  
                  // Sort the currently displayed stores (already filtered by city)
                  setStoresData(prev => {
                      const sortedStores = [...prev.stores]
                          .map(store => ({
                              ...store,
                              distance: calculateDistance(currentUserLocation.lat, currentUserLocation.lng, store.latitude, store.longitude)
                          }))
                          .sort((a, b) => a.distance - b.distance);
                      
                      return { ...prev, stores: sortedStores };
                  });
                  
                  setIsFetchingLocation(false);
                  toast({ title: "Stores sorted by distance." });
              },
              (error) => {
                  console.error("Geolocation error:", error);
                  setLocationError(error.message);
                  setIsFetchingLocation(false);
                  toast({ variant: "destructive", title: "Location Error", description: "Could not get your location to sort stores." });
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
      } else {
          setIsFetchingLocation(false);
          setLocationError("Geolocation is not supported by this browser.");
          toast({ variant: "destructive", title: "Geolocation Not Supported" });
      }
  };

  // Navigate to the report page with store info
  const handleStartReport = (missionId, store) => {
    router.push(`/report/${missionId}?storeId=${store.id}&storeName=${encodeURIComponent(store.name)}`);
  };

  // Open the details dialog
  const handleViewDetails = (mission) => {
    setMissionForDetails(mission);
    setDetailsDialogOpen(true);
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <ClipboardList className="w-6 h-6" /> My Assigned Missions
      </h1>

      {assignedMissions.length > 0 ? (
        <div className="space-y-6">
          {assignedMissions.map(mission => (
            <Card key={mission.id} className="shadow-md overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle>{mission.title}</CardTitle>
                    <Badge variant={getStatusVariant(mission.status)} className="capitalize whitespace-nowrap">
                        {mission.status}
                    </Badge>
                </div>
                <CardDescription>{mission.businessName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-sm text-muted-foreground line-clamp-3">{mission.description}</p>
                 <Button onClick={() => handleFindStores(mission)}>
                    {storesData.missionId === mission.id ? 'Hide Stores' : `View Stores in ${mockUser.city}`}
                 </Button>
                 
                {/* --- Display Stores List --- */}
                {storesData.missionId === mission.id && (
                    <div className="pt-4 border-t mt-4 space-y-4">
                        {storesData.isLoading ? (
                            <div className="flex items-center text-muted-foreground"><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading stores...</div>
                        ) : (
                          <>
                            {storesData.stores.length > 0 && (
                              <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-lg">Stores in {mockUser.city}</h3>
                                <Button variant="outline" size="sm" onClick={() => handleSortByClosest(mission.id)} disabled={isFetchingLocation}>
                                  {isFetchingLocation ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
                                  Sort by Closest
                                </Button>
                              </div>
                            )}

                            {storesData.stores.length > 0 ? (
                                <div className="space-y-3">
                                    {storesData.stores.map(store => (
                                        <div key={store.id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-secondary/50">
                                            <div>
                                                <p className="font-semibold">{store.name}</p>
                                                <p className="text-sm text-muted-foreground">{store.address}, {store.city}</p>
                                                {/* Conditionally render distance */}
                                                {store.distance !== undefined && (
                                                    <p className="text-xs font-medium text-primary flex items-center gap-1 mt-1">
                                                        <LocateFixed className="w-3 h-3" />
                                                        {store.distance.toFixed(1)} km away
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2 self-end sm:self-center shrink-0">
                                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(mission)}>
                                                    <Info className="w-4 h-4 mr-1"/> Details
                                                </Button>
                                                <Button size="sm" onClick={() => handleStartReport(mission.id, store)} disabled={mission.status === 'submitted'}>
                                                    {mission.status === 'submitted' ? 'Report Submitted' : 'Start Report'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                               <p className="text-sm text-muted-foreground">No active stores found for this mission in your city ({mockUser.city}).</p>
                            )}
                          </>
                        )}
                    </div>
                 )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Alert className="mt-6 bg-secondary border-secondary-foreground/10">
          <SearchX className="h-4 w-4" />
          <AlertTitle>No Assigned Missions</AlertTitle>
          <AlertDescription>
            You currently have no missions assigned. Go to the <Link href="/" className="text-primary underline">Available Missions</Link> page to apply!
          </AlertDescription>
        </Alert>
      )}

      {/* --- Details Dialog --- */}
       <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
         <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><CircleHelp className="w-5 h-5 text-primary" /> Mission Scenario & Details</DialogTitle>
                 <DialogDescription className="pt-2">
                    These are the specific instructions for completing the mission at your chosen store.
                 </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div>
                    <h3 className="font-semibold text-foreground">Mission Title</h3>
                    <p className="text-sm text-muted-foreground">{missionForDetails?.title}</p>
                </div>
                 <div>
                    <h3 className="font-semibold text-foreground">Scenario / Instructions</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{missionForDetails?.description}</p>
                </div>
            </div>
         </DialogContent>
       </Dialog>

    </div>
  );
}
