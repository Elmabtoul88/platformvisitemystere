"use client";

import React, { useState, useMemo } from 'react';
import { MissionCard } from './mission-card';
import { MissionFilters } from './mission-filters';
import { mockMissions } from '@/lib/mock-data'; // Using mock data for now
import { Button } from './ui/button';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListFilter, SearchX } from 'lucide-react';


export function MissionList() {
  const router = useRouter();
  const [missions, setMissions] = useState(mockMissions); // Simulating fetched data
  const [filters, setFilters] = useState({ location: '', date: '', category: '' });

  const availableCategories = useMemo(() => {
    // Filter out null or empty categories before creating the Set
    return [...new Set(mockMissions.map(m => m.category).filter(Boolean))];
  }, []); // Calculate once based on mock data


  const filteredMissions = useMemo(() => {
    return missions.filter(mission => {
      const locationMatch = !filters.location || mission.location.toLowerCase().includes(filters.location.toLowerCase());
      const categoryMatch = !filters.category || mission.category === filters.category;
      const dateMatch = !filters.date || new Date(mission.deadline) <= new Date(filters.date);
      // Only show available missions in this list by default
      const statusMatch = mission.status === 'available';

      return locationMatch && categoryMatch && dateMatch && statusMatch;
    });
  }, [missions, filters]);

  const handleApply = (missionId) => {
    console.log(`Applying for mission: ${missionId}`);
    // Add actual apply logic here (e.g., API call)
    // For now, navigate to a placeholder "apply success" or mission details page
     alert(`Applied for mission ${missionId}! (Placeholder)`);
     // Example navigation (adjust route as needed):
     // router.push(`/missions/${missionId}/apply`);
  };

   const handleViewDetails = (missionId) => {
    // Navigate to a dedicated mission details page for available missions
    router.push(`/missions/${missionId}/details`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <ListFilter className="w-6 h-6" /> Available Missions
      </h1>

      <MissionFilters
        filters={filters}
        onFilterChange={setFilters}
        categories={availableCategories}
      />

      {filteredMissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMissions.map(mission => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onApply={handleApply} // For the "Apply Now" button
              onViewDetails={handleViewDetails} // Changed to navigate to details page
              showApplyButton={true}
            />
          ))}
        </div>
      ) : (
         <Alert className="mt-6 bg-secondary border-secondary-foreground/10">
             <SearchX className="h-4 w-4" />
             <AlertTitle>No Missions Found</AlertTitle>
             <AlertDescription>
               No available missions match your current filter criteria. Try adjusting your filters or check back later.
             </AlertDescription>
           </Alert>
      )}
    </div>
  );
}
