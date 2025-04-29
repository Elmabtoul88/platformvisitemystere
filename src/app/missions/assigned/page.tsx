"use client";

import React, { useState, useMemo } from 'react';
import type { Mission } from '@/types/mission';
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
        (mission.status === 'assigned' || mission.status === 'submitted') // Show assigned and submitted but not yet approved
         && mission.assignedTo === mockUser.id
    );
  }, []); // Dependency array is empty as mock data doesn't change

  const handleStartReport = (missionId: string) => {
    // Navigate to the report submission page
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
              // Use onViewDetails handler to navigate to report submission
              onViewDetails={handleStartReport}
              showApplyButton={false} // Don't show apply button for assigned missions
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
