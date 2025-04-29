
"use client";

import React, { useMemo } from 'react';
import { MissionCard } from '@/components/mission-card';
import { mockMissions, mockReports, mockUser } from '@/lib/mock-data'; // Using mock data
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, SearchX, ArrowLeft, DollarSign, Wallet } from 'lucide-react'; // Added Wallet icon
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added CardHeader, CardTitle
import { format } from 'date-fns';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';


// Helper to find the report for a completed mission
const findReportForMission = (missionId) => {
    // Ensure the report belongs to the current mock user and is approved
    return mockReports.find(report =>
        report.missionId === missionId &&
        report.userId === mockUser.id &&
        report.status === 'approved' // Only find approved reports for completed list
    );
}

export default function CompletedMissionsPage() {
  // Filter missions completed and approved for the mock user
  const completedMissions = useMemo(() => {
    return mockMissions.filter(mission =>
        (mission.status === 'completed' || mission.status === 'approved') // Show completed/approved
        && (Array.isArray(mission.assignedTo) ? mission.assignedTo.includes(mockUser.id) : mission.assignedTo === mockUser.id) // Check assignment
        && findReportForMission(mission.id) // Ensure an approved report exists for this user
    );
  }, []); // Dependency array ensures this runs once based on mock data

  // Calculate total payment
  const totalPayment = useMemo(() => {
    return completedMissions.reduce((sum, mission) => sum + mission.reward, 0);
  }, [completedMissions]);

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

      {/* Total Payment Card */}
      <Card className="mb-6 shadow-sm bg-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Total Earnings
          </CardTitle>
          {/* Optional icon or detail */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">${totalPayment.toFixed(2)}</div>
          <p className="text-xs text-primary/80">
            Total earnings from all approved missions.
          </p>
        </CardContent>
      </Card>


      {completedMissions.length > 0 ? (
        <div className="space-y-6">
          {completedMissions.map(mission => {
            const report = findReportForMission(mission.id); // Report will always be approved here due to filter
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

                         {/* Report Summary & Payment Column */}
                         <div className="md:col-span-1 p-4 bg-secondary/50">
                            {report ? (
                                <div className="space-y-4"> {/* Increased spacing */}
                                    <div>
                                        <h3 className="text-md font-semibold text-foreground flex items-center justify-between mb-1">
                                            Submitted Report
                                            <Badge variant='default' className="capitalize bg-green-100 text-green-800 border-green-300">
                                                <CheckCircle className="w-3 h-3 mr-1"/> Approved
                                            </Badge>
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Submitted on: {format(new Date(report.submittedAt), 'PPp')}
                                        </p>
                                    </div>

                                    {/* Payment Information Section */}
                                    <div className="p-3 border rounded-md bg-background shadow-sm">
                                        <h4 className="text-sm font-semibold text-primary flex items-center gap-1 mb-1">
                                            <DollarSign className="w-4 h-4"/> Payment Status
                                        </h4>
                                        <p className="text-sm text-green-700 font-medium">
                                            Paid: ${mission.reward.toFixed(2)} {/* Ensure 2 decimal places */}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Payment processed upon report approval (simulated).
                                        </p>
                                    </div>

                                    {/* Optional Report Details (rating, comment, photo) */}
                                    {(report.rating || report.comments || report.photoUrl) && (
                                    <div className="space-y-2 pt-2 border-t mt-4">
                                        {report.rating && (
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <CheckCircle /* Using CheckCircle as placeholder for Star */
                                                        key={i}
                                                        className={`w-4 h-4 ${i < report.rating ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`}
                                                    />
                                                ))}
                                                <span className="text-sm font-medium ml-1">({report.rating}/5)</span>
                                            </div>
                                        )}
                                        {report.comments && (
                                            <p className="text-sm text-foreground bg-card p-2 rounded border italic line-clamp-3">
                                                "{report.comments}"
                                            </p>
                                        )}
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
            You haven't completed any missions yet. Finish your assigned missions and wait for approval to see them here.
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
