import { ReportSubmissionForm } from '@/components/report-submission-form';
import { mockMissions, mockUser } from '@/lib/mock-data'; // Using mock data
import type { Mission, ReportInput } from '@/types/mission';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, FileWarning } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster


// Simulate fetching mission data based on ID
async function getMissionData(missionId: string): Promise<Mission | null> {
  // In a real app, fetch from your backend API
  console.log(`Fetching data for mission: ${missionId}`);
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  const mission = mockMissions.find(m => m.id === missionId);
  return mission || null;
}

// Simulate submitting report data
async function submitReport(data: ReportInput, missionId: string, userId: string): Promise<void> {
   // In a real app, send this data to your backend API
  console.log(`Submitting report for mission ${missionId} by user ${userId}:`, data);
  // Simulate network delay for submission
  await new Promise(resolve => setTimeout(resolve, 1000));

   // Simulate potential error
   // if (Math.random() > 0.8) { // 20% chance of error
   //   throw new Error("Simulated submission error");
   // }

  console.log("Report submission successful (simulated)");
  // Add the submitted report to mock data (or update backend)
   // Note: In a real app, the backend would handle report creation/update.
}


export default async function ReportSubmissionPage({ params }: { params: { missionId: string } }) {
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


  // Pass the submitReport function, binding the necessary IDs
  const handleActualSubmit = async (data: ReportInput) => {
     await submitReport(data, mission.id, mockUser.id); // Using mock user ID
  };

  return (
    <main className="min-h-screen bg-background py-10 px-4">
       <div className="container mx-auto max-w-3xl">
             <Button asChild variant="outline" size="sm" className="mb-4">
               <Link href="/">
                 <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions
               </Link>
             </Button>
            <ReportSubmissionForm mission={mission} onSubmit={handleActualSubmit} />
        </div>
         <Toaster /> {/* Add Toaster here for this page's toasts */}
    </main>
  );
}
