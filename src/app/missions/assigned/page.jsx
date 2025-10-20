
"use client";

import React, { useMemo } from 'react';
import { MissionCard } from '@/components/mission-card';
import { mockMissions, mockUser, mockAssignments } from '@/lib/mock-data'; // Import mockAssignments
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClipboardList, SearchX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AssignedMissionsPage() {
  const router = useRouter();

  // Filter missions assigned to the mock user
  const assignedMissions = useMemo(() => {
    return mockMissions
      .filter(mission =>
        (mission.status === 'assigned' || mission.status === 'submitted') &&
        (Array.isArray(mission.assignedTo) ? mission.assignedTo.includes(mockUser.id) : mission.assignedTo === mockUser.id)
      )
      .map(mission => {
        // Find the specific assignment details for this user and mission
        const assignment = mockAssignments.find(a => a.mission_id === mission.id && a.user_id === mockUser.id);
        if (assignment) {
          // If a specific assignment exists, override the mission's location and description
          return {
            ...mission,
            location: assignment.specificStoreAddress || mission.location,
            description: assignment.specificScenario || mission.description,
            assignmentId: assignment.id // Pass assignment ID for reference
          };
        }
        return mission; // Return the original mission if no specific assignment is found
      });
  }, []);

  const handleStartOrViewReport = (missionId) => {
    // Navigate to the report submission/view page
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
              onViewDetails={handleStartOrViewReport}
              showApplyButton={false}
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
