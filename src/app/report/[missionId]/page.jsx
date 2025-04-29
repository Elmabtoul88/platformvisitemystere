'use server'; // Mark functions within this file that need server context

import { ReportSubmissionForm } from '@/components/report-submission-form';
import { mockMissions, mockUser } from '@/lib/mock-data'; // Using mock data
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, FileWarning, Ban, Info } from "lucide-react"; // Added Ban icon
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Added Card components
import { Toaster } from '@/components/ui/toaster'; // Import Toaster
import { submitReport } from '@/app/actions/report-actions'; // Import the server action

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
            <Card className="max-w-md w-full shadow-lg">
                <CardHeader>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-secondary mb-4">
                     <Ban className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">Unable to Submit Report</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        This action isn't available for the mission "{mission.title}".
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                   <p>
                     This might be because the mission is not currently assigned to you, it's already been completed, or it's no longer active.
                   </p>
                   <p>
                     Please check your assigned missions list for tasks ready for reporting.
                   </p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-6">
                     <Button asChild variant="outline">
                        <Link href="/missions/assigned">
                          <ArrowLeft className="w-4 h-4 mr-1" /> View My Assigned Missions
                        </Link>
                     </Button>
                     <Button asChild variant="ghost">
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
               <Link href="/">
                 <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions
               </Link>
             </Button>
            {/* Pass the imported server action as the onSubmitAction prop */}
            <ReportSubmissionForm mission={mission} onSubmitAction={submitReport} />
        </div>
         <Toaster /> {/* Add Toaster here for this page's toasts */}
    </main>
  );
}
