"use client";
import { ReportSubmissionForm } from "@/components/report-submission-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, FileWarning, Ban } from "lucide-react"; // Added Ban icon
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"; // Added Card components
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { submitReport } from "../../actions/report-actions.js"; // Import the server action using relative path
import { use, useEffect, useState } from "react";
import { fetchMissions } from "@/services/fetchData.js";
import { useSearchParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ReportSubmissionPage({ params }) {
  const [mission, setMission] = useState([]);
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  const { missionId } = use(params);
  const searchParams = useSearchParams();
  const nomMagazin = searchParams.get("nomMagazin");
  const specificStoreAddress = searchParams.get("specificStoreAddress");
  const scenario = searchParams.get("scenario");
  const dateTimeMission = searchParams.get("dateTimeMission");

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("missionViewAuth"));
    if (!currentUser) {
      console.error("no user found");
      return;
    }
    setUserId(currentUser.user.id);
    setToken(currentUser.token || null);
    console.log("current user", currentUser);
    const loadAllData = async () => {
      try {
        const [m, s] = await Promise.all([
          fetchMissions(
            "mission" + missionId,
            `${API_BASE_URL}missions/${missionId}`,
          ),
          fetchMissions(
            "surveyQuestions" + missionId,
            `${API_BASE_URL}reports/surveyQuestions/${missionId}`,
          ),
        ]);
        if (m) {
          const parsedMission = {
            ...m,
            nomMagazin: nomMagazin,
            specificStoreAddress: specificStoreAddress,
            scenario: scenario,
            dateTimeMission: dateTimeMission,
          };
          console.log("fetched mission:", parsedMission);
          setMission(parsedMission);
        }

        setSurveyQuestions(s);
      } catch (error) {
        console.error(
          "Error fetching one of the endpoints:",
          error.response?.data || "error from reports id ",
        );
      }
    };

    loadAllData();
  }, [missionId]);

  if (!mission) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center">
        <Alert variant="destructive" className="max-w-lg">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Mission Not Found</AlertTitle>
          <AlertDescription>
            The mission you are trying to report on could not be found or is no
            longer available.
          </AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">
            {" "}
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions
          </Link>
        </Button>
      </div>
    );
  }

  // Check if the mission is assigned to the current user and allows submission
  // Handles both single string and array for assignedTo
  const isAssignedToUser = Array.isArray(mission.assignedTo)
    ? mission.assignedTo.includes(userId) // Use the imported mockUser's ID
    : mission.assignedTo === userId; // Use the imported mockUser's ID

  // Corrected logic: canSubmit should be true if status is 'assigned' or 'submitted' AND assigned to the current user
  // Allow submission even if 'submitted' to enable potential re-submission/editing if allowed by logic later
  const canSubmit =
    mission.status === "completed" || mission.status === "cancelled";
  console.log("Can Submit:", canSubmit);
  // If the user *cannot* submit, show the error message.
  if (canSubmit) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center text-center">
        <Card className="max-w-md w-full shadow-lg bg-secondary border-border">
          <CardHeader>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-background mb-4 border border-border shadow-sm">
              <Ban className="h-6 w-6 text-destructive" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl font-semibold text-foreground">
              Cannot Submit Report
            </CardTitle>
            <CardDescription className="text-muted-foreground pt-1">
              This mission ({mission.title}) isn't ready for your report just
              yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground/80">
            {/* Changed p containing ul to div */}
            <div className="text-left">
              <p className="mb-1">This could be because:</p>
              <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                <li>The mission isn't assigned to you.</li>
                <li>The mission has already been completed or cancelled.</li>
                <li>The submission deadline has passed.</li>
              </ul>
            </div>
            <p className="pt-2">
              Please check your{" "}
              <Link
                href="/missions/assigned"
                className="text-primary underline hover:text-primary/80"
              >
                Assigned Missions
              </Link>{" "}
              list for tasks ready for reporting.
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

  // If canSubmit is true, render the form
  // Pass the server action AND survey questions to the client component
  return (
    <main className="min-h-screen bg-background py-10 px-4">
      <div className="container mx-auto max-w-3xl">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/missions/assigned">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Assigned Missions
          </Link>
        </Button>
        {/* Pass the imported server action and fetched questions */}
        <ReportSubmissionForm
          mission={mission}
          surveyQuestions={surveyQuestions} // Pass questions here
          onSubmitAction={submitReport}
          ///
          userId={userId}
          token={token}
        />
      </div>
      <Toaster /> {/* Add Toaster here for this page's toasts */}
    </main>
  );
}
