"use client";

import React, { useState, useMemo, useEffect } from "react";
import { MissionCard } from "@/components/mission-card-assigned";
import { fetchMissions } from "@/services/fetchData";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClipboardList, SearchX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

export default function AssignedMissionsPage() {
  const [missions, setMissions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const getMissions = async () => {
      try {
        setIsLoading(true);
        //const currentUser = localStorage.getItem("missionViewAuth");
        //const parsedUser = JSON.parse(currentUser);
        const currentUser = user.id;
        //currentUser ? setUserId(currentUser) : null;

        if (currentUser) {
          const [assignedMissions] = await Promise.all([
            fetchMissions(
              "assigned_user" + currentUser,
              API_BASE_URL + "assignements/ass/" + currentUser,
            ),
          ]);

          const assigned = assignedMissions.filter(
            (report) =>
              report.user_id === currentUser &&
              !["submitted", "approved", "refused"].includes(report.status),
          );
          console.log("Active Missions:", assigned);
          setMissions(assigned);
        }
      } catch (err) {
        console.log("Error fetching missions", err);
      } finally {
        setIsLoading(false);
      }
    };
    getMissions();
  }, []);

  const handleStartOrViewReport = (
    missionId,
    nomMagazin,
    specificStoreAddress,
    scenario,
    dateTimeMission,
  ) => {
    router.push(
      `/report/${missionId}?nomMagazin=${encodeURIComponent(
        nomMagazin,
      )}&specificStoreAddress=${encodeURIComponent(
        specificStoreAddress,
      )}&scenario=${encodeURIComponent(
        scenario,
      )}&dateTimeMission=${encodeURIComponent(dateTimeMission)}`,
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

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

      {missions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((mission, index) => (
            <MissionCard
              key={index}
              mission={mission}
              onViewDetails={handleStartOrViewReport}
              showApplyButton={false}
              detailsButtonText={
                mission.status === "submitted" ? "View Report" : "Start Report"
              }
            />
          ))}
        </div>
      ) : (
        <Alert className="mt-6 bg-secondary border-secondary-foreground/10">
          <SearchX className="h-4 w-4" />
          <AlertTitle>No Assigned Missions</AlertTitle>
          <AlertDescription>
            You currently have no missions assigned to you. Browse available
            missions and apply!
          </AlertDescription>
        </Alert>
      )}

      {/* Link to Completed Missions */}
      <div className="mt-6 text-center">
        <Button asChild variant="link">
          <Link href="/missions/completed">View Completed Missions</Link>
        </Button>
      </div>
    </div>
  );
}
