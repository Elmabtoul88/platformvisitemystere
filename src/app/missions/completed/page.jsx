"use client";

import React, { useMemo } from 'react';
import { MissionCard } from '@/components/mission-card';
import { mockMissions, mockReports, mockUser } from '@/lib/mock-data'; // Using mock data
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, SearchX, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card'; // Removed unused components
import { format } from 'date-fns';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';


// Helper to find the report for a completed mission
const findReportForMission = (missionId) => {
    return mockReports.find(report => report.missionId === missionId && report.userId === mockUser.id);
}

export default function CompletedMissionsPage() {
  // Filter missions completed and approved for the mock user
  const completedMissions = useMemo(() => {
    return mockMissions.filter(mission =>
        (mission.status === 'completed' || mission.status === 'approved') // Show completed/approved
        && mission.assignedTo === mockUser.id
    );
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
       <Button asChild variant="outline" size="sm" className="mb-6">
         <Link href="/">
           <ArrowLeft className="w-4 h-4 mr-1" /> Back to Available Missions
         </Link>
       </Button>
      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <CheckCircle className="w-6 h-6" /> My Completed Missions
      </h1>

      {completedMissions.length > 0 ? (
        <div className="space-y-6">
          {completedMissions.map(mission => {
            const report = findReportForMission(mission.id);
            return (
                <Card key={mission.id} className="shadow-sm overflow-hidden">
                    <div className="grid md:grid-cols-3">
                         {/* Mission Details Column */}
                         <div className="md:col-span-2 border-b md:border-b-0 md:border-r">
                             <MissionCard
                                mission={mission}
                                showApplyButton={false} // No apply button needed
                                // Optionally add a handler to view report details if needed
                              />
                         </div>

                         {/* Report Summary Column */}
                         <div className="md:col-span-1 p-4 bg-secondary/50">
                            {report ? (
                                <div className="space-y-3">
                                    <h3 className="text-md font-semibold text-foreground flex items-center justify-between">
                                      Submitted Report
                                      <Badge variant={report.status === 'approved' ? 'default' : 'outline'} className="capitalize bg-green-100 text-green-800 border-green-300">
                                        {report.status}
                                      </Badge>
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {/* Format date without time to avoid hydration mismatch */}
                                        Submitted on: {format(report.submittedAt, 'PPP')}
                                    </p>
                                    <div className="flex items-center gap-1">
                                         {Array.from({ length: 5 }).map((_, i) => (
                                          <CheckCircle /* Using CheckCircle as placeholder for Star */
                                            key={i}
                                            className={`w-4 h-4 ${i < report.rating ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`}
                                          />
                                        ))}
                                        <span className="text-sm font-medium ml-1">({report.rating}/5)</span>
                                    </div>
                                    <p className="text-sm text-foreground bg-card p-2 rounded border italic line-clamp-3">
                                        "{report.comments}"
                                    </p>
                                    {report.photoUrl && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Submitted Photo:</p>
                                        <Image
                                        src={report.photoUrl}
                                        alt="Submitted photo"
                                        width={100}
                                        height={75}
                                        className="rounded border object-cover"
                                        />
                                    </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                    Report details not found.
                                </div>
                            )}
                         </div>
                    </div>
                </Card>
            );
          })}
        </div>
      ) : (
        <Alert className="mt-6 bg-secondary border-secondary-foreground/10">
          <SearchX className="h-4 w-4" />
          <AlertTitle>No Completed Missions</AlertTitle>
          <AlertDescription>
            You haven't completed any missions yet. Finish your assigned missions to see them here.
          </AlertDescription>
        </Alert>
      )}
       {/* Link to Assigned Missions */}
        <div className="mt-6 text-center">
             <Button asChild variant="link">
                 <Link href="/missions/assigned">View Assigned Missions</Link>
             </Button>
         </div>
    </div>
  );
}
