'use client'; // Map component requires client-side rendering

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic for client-side only component
import { mockMissions, mockUser } from '@/lib/mock-data'; // Use mock data
// Removed Loader2 as loading is handled inside MapView now

// Dynamically import the MapView component to ensure it's only loaded on the client
const MapView = dynamic(() => import('@/components/map-view').then(mod => mod.MapView), {
  ssr: false, // Disable server-side rendering for this component
  // Loading is now handled within the MapView component itself
});

export default function MapPage() {
  // Filter missions based on status and assignment for the current mock user
  const availableMissions = useMemo(() => {
    return mockMissions.filter(mission => mission.status === 'available');
  }, []); // Dependency array can be empty if mockMissions is static

  const assignedMissions = useMemo(() => {
    return mockMissions.filter(mission =>
      (mission.status === 'assigned' || mission.status === 'submitted') && // Include submitted
      (Array.isArray(mission.assignedTo) ? mission.assignedTo.includes(mockUser.id) : mission.assignedTo === mockUser.id)
    );
  }, []); // Dependency array can be empty if mockMissions is static

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-primary">Mission Map</h1>
      {/* Render the dynamically imported MapView */}
      {/* Ensure MapView itself handles its loading state */}
      <MapView availableMissions={availableMissions} assignedMissions={assignedMissions} />
    </div>
  );
}