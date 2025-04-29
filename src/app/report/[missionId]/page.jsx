'use server'; // Mark functions within this file that need server context

import { ReportSubmissionForm } from '@/components/report-submission-form';
import { mockMissions, mockUser } from '@/lib/mock-data'; // Using mock data
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, FileWarning } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster
import { submitReport } from '../../actions/report-actions'; // Import the server action using relative path

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
        <div className="container mx-auto py-8 px-4 flex flex-col items-center">
             <Alert variant="default" className="max-w-lg bg-secondary border-secondary-foreground/10">
               <FileWarning className="h-4 w-4" />
               <AlertTitle>Cannot Submit Report</AlertTitle>
               <AlertDescription>
                 You cannot submit a report for this mission. It might not be assigned to you or is already completed. Check 'My Missions'.
               </AlertDescription>
            </Alert>
             <Button asChild variant="link" className="mt-4">
                <Link href="/"> <ArrowLeft className="w-4 h-4 mr-1" /> Back to Available Missions</Link>
             </Button>
             {/* Add link to 'My Missions' page if it exists */}
             {/* <Button asChild variant="link" className="mt-2"><Link href="/my-missions">View My Missions</Link></Button> */}
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
            {/* Pass the imported server action as the onSubmit prop */}
            <ReportSubmissionForm mission={mission} onSubmitAction={submitReport} />
        </div>
         <Toaster /> {/* Add Toaster here for this page's toasts */}
    </main>
  );
}
