'use server'; // Mark functions within this file that need server context

import { ReportSubmissionForm } from '@/components/report-submission-form';
import { mockMissions, mockUser } from '@/lib/mock-data'; // Using mock data
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, FileWarning, Ban, Info } from "lucide-react"; // Added Ban icon
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Added Card components
import { Toaster } from '@/components/ui/toaster'; // Import Toaster
import { submitReport } from '../../actions/report-actions.js'; // Import the server action using relative path

// Simulate fetching mission data based on ID
// This remains a server-side function
async function getMissionData(missionId) {
  // In a real app, fetch from your backend API
  console.log(`Fetching data for mission: ${missionId}`);
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  const mission = mockMissions.find(m => m.id === missionId);
  return mission || null;
}


export default async function ReportSubmissionPage({ params }) {
  const missionId = params.missionId;
  const mission = await getMissionData(missionId);

  if (!mission) {
    return (
        <div className="container mx-auto py-8 px-4 flex flex-col items-center">
             <Alert variant="destructive" className="max-w-lg">
               <FileWarning className="h-4 w-4" />
               <AlertTitle>Mission Not Found</AlertTitle>
               <AlertDescription>
                 The mission you are trying to report on could not be found or is no longer available.
               </AlertDescription>
            </Alert>
             <Button asChild variant="link" className="mt-4">
                <Link href="/"> <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions</Link>
             </Button>
        </div>
    );
  }

   // Check if the mission is actually assigned to the current user (using mock user for now)
   // or if it's in a state allowing report submission (e.g., 'assigned')
   const canSubmit = mission.status === 'assigned' && mission.assignedTo === mockUser.id;

   if (!canSubmit) {
     return (
        <div className="container mx-auto py-16 px-4 flex flex-col items-center text-center">
            <Card className="max-w-md w-full shadow-lg bg-secondary border-border">
                <CardHeader>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-background mb-4 border border-border shadow-sm">
                     <Ban className="h-6 w-6 text-destructive" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">Cannot Submit Report</CardTitle>
                    <CardDescription className="text-muted-foreground pt-1">
                         This mission ({mission.title}) isn't ready for your report just yet.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-foreground/80">
                    {/* Removed invalid <p> wrapping <ul> */}
                   <div className="text-left"> {/* Added a div for structure */}
                     <p className="mb-1">This could be because:</p> {/* Put text in its own <p> */}
                     <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                        <li>The mission isn't assigned to you.</li>
                        <li>The mission has already been completed or cancelled.</li>
                        <li>The submission deadline has passed.</li>
                     </ul>
                   </div>
                   <p className="pt-2">
                     Please check your <Link href="/missions/assigned" className="text-primary underline hover:text-primary/80">Assigned Missions</Link> list for tasks ready for reporting.
                   </p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-6">
                     <Button asChild>
                        <Link href="/missions/assigned">
                          <ArrowLeft className="w-4 h-4 mr-1" /> View My Assigned Missions
                        </Link>
                     </Button>
                     <Button asChild variant="outline">
                         <Link href="/">Back to Available Missions</Link>
                     </Button>
                </CardFooter>
            </Card>
        </div>
     );
   }

  // Pass the server action directly to the client component
  return (
    <main className="min-h-screen bg-background py-10 px-4">
       <div className="container mx-auto max-w-3xl">
             <Button asChild variant="outline" size="sm" className="mb-4">
               <Link href="/missions/assigned">
                 <ArrowLeft className="w-4 h-4 mr-1" /> Back to Assigned Missions
               </Link>
             </Button>
            {/* Pass the imported server action as the onSubmitAction prop */}
            <ReportSubmissionForm mission={mission} onSubmitAction={submitReport} />
        </div>
         <Toaster /> {/* Add Toaster here for this page's toasts */}
    </main>
  );
}
