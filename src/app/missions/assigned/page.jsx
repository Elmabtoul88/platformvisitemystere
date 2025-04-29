"use client";

import React, { useState, useMemo } from 'react';
import { MissionCard } from '@/components/mission-card';
import { mockMissions, mockUser } from '@/lib/mock-data'; // Using mock data
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClipboardList, SearchX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AssignedMissionsPage() {
  const router = useRouter();
  // Filter missions assigned to the mock user
  const assignedMissions = useMemo(() => {
    return mockMissions.filter(mission =>
        (mission.status === 'assigned' || mission.status === 'submitted') // Show assigned and submitted but not yet approved/refused
         && (Array.isArray(mission.assignedTo) ? mission.assignedTo.includes(mockUser.id) : mission.assignedTo === mockUser.id) // Handle array or single ID
    );
  }, []); // Dependency array is empty as mock data doesn't change

  const handleStartOrViewReport = (missionId) => {
    // Navigate to the report submission/view page regardless of status (assigned or submitted)
    router.push(`/report/${missionId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
       <Button asChild variant="outline" size="sm" className="mb-6">
         <Link href="/">
           <ArrowLeft className="w-4 h-4 mr-1" /> Back to Available Missions
         </Link>
       </Button>

      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <ClipboardList className="w-6 h-6" /> My Assigned Missions
      </h1>

      {assignedMissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedMissions.map(mission => (
            <MissionCard
              key={mission.id}
              mission={mission}
              // Use onViewDetails to navigate to the report page
              onViewDetails={handleStartOrViewReport}
              showApplyButton={false} // Don't show apply button for assigned missions
              // Customize button text based on status
              detailsButtonText={mission.status === 'submitted' ? 'View Report' : 'Start Report'}
            />
          ))}
        </div>
      ) : (
        <Alert className="mt-6 bg-secondary border-secondary-foreground/10">
          <SearchX className="h-4 w-4" />
          <AlertTitle>No Assigned Missions</AlertTitle>
          <AlertDescription>
            You currently have no missions assigned to you. Browse available missions and apply!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
