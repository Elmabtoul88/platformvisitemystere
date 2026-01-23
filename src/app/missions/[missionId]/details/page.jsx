"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  ArrowLeft,
  FileWarning,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Briefcase,
  CheckCircle,
  Info,
  Send,
  AlertCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export default function MissionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const missionId = params.missionId;
  const [mission, setMission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur a déjà postulé
  const hasApplied =
    mission?.assignedTo && Array.isArray(mission.assignedTo)
      ? mission.assignedTo.includes(user?.id)
      : false;

  // Fetch mission data from API
  useEffect(() => {
    const fetchMission = async () => {
      setIsLoading(true);
      setError(null);
      console.log(`Fetching details for mission ID: ${missionId}`);
      try {
        const response = await fetch(`${API_BASE_URL}missions/${missionId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Mission not found or not accessible.");
          }
          throw new Error(`Failed to fetch mission: ${response.statusText}`);
        }
        const foundMission = await response.json();
        if (
          foundMission.assignedTo &&
          typeof foundMission.assignedTo === "string"
        ) {
          try {
            foundMission.assignedTo = JSON.parse(foundMission.assignedTo);
          } catch (e) {
            console.error("Error parsing assignedTo:", e);
            foundMission.assignedTo = [];
          }
        }

        setMission(foundMission);
      } catch (err) {
        console.error("Error fetching mission:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (missionId) {
      fetchMission();
    } else {
      setError("Invalid mission ID provided.");
      setIsLoading(false);
    }
  }, [missionId]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to apply for missions.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    setIsApplying(true);
    try {
      const applicationResponse = await fetch(API_BASE_URL + "applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          mission_id: missionId,
          status: "pending",
        }),
      });

      if (!applicationResponse.ok) {
        const errorData = await applicationResponse.text();
        throw new Error(`Failed to create application: ${errorData}`);
      }

      const updatedAssignedTo = mission.assignedTo
        ? [...mission.assignedTo, user.id]
        : [user.id];

      const updateMissionResponse = await fetch(
        `${API_BASE_URL}missions/patch/${missionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "pending_approval",
            assignedTo: updatedAssignedTo,
          }),
        }
      );

      if (!updateMissionResponse.ok) {
        const errorData = await updateMissionResponse.text();
        throw new Error(`Failed to update mission: ${errorData}`);
      }
      setMission((prev) => ({
        ...prev,
        status: "pending_approval",
        assignedTo: updatedAssignedTo,
      }));

      toast({
        title: "Application Submitted",
        description:
          "Your application has been submitted successfully and is pending approval.",
      });
    } catch (error) {
      console.error("Error applying for mission:", error);
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit your application.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Mission Details...</span>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center">
        <Alert variant="destructive" className="max-w-lg w-full">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Error Loading Mission</AlertTitle>
          <AlertDescription>
            {error || "Mission data could not be loaded."}
          </AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-6">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Available Missions
          </Link>
        </Button>
      </div>
    );
  }

  const isMissionAvailable =
    mission.status === "available" || mission.status === "pending_approval";
  const isMissionPending = mission.status === "pending_approval";

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Button asChild variant="outline" size="sm" className="mb-6">
        <Link href="/">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Available Missions
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader className="border-b pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-bold text-primary">
              {mission.title}
            </CardTitle>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${
                mission.status === "available"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-orange-100 text-orange-800 border-orange-200"
              } flex items-center`}
            >
              {mission.status === "available" ? (
                <Clock className="w-3 h-3 mr-1" />
              ) : (
                <AlertCircle className="w-3 h-3 mr-1" />
              )}
              {mission.status === "available"
                ? "Available"
                : "Pending Approval"}
            </span>
          </div>
          <CardDescription className="text-sm pt-1 flex items-center gap-1 text-muted-foreground">
            <Briefcase className="w-4 h-4" /> {mission.businessName} -{" "}
            {mission.category}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h3 className="text-md font-semibold mb-1 flex items-center gap-1">
              <Info className="w-4 h-4" /> Description
            </h3>
            <p className="text-sm text-foreground/90">{mission.description}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />{" "}
              <strong className="text-muted-foreground">Location:</strong>{" "}
              {mission.location}
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />{" "}
              <strong className="text-muted-foreground">Deadline:</strong>{" "}
              {format(new Date(mission.deadline), "PPP")}
            </p>
            <p className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />{" "}
              <strong className="text-muted-foreground">Category:</strong>{" "}
              {mission.category}
            </p>
            <p className="flex items-center gap-2 font-medium">
              <DollarSign className="w-4 h-4 text-accent" />{" "}
              <strong className="text-muted-foreground font-normal">
                Reward:
              </strong>{" "}
              ${mission.reward}
            </p>
          </div>

          {/* Afficher des informations supplémentaires selon le statut */}
          {isMissionPending && (
            <Alert className="bg-orange-50 border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">
                Pending Approval
              </AlertTitle>
              <AlertDescription className="text-orange-700">
                This mission is currently under review.{" "}
                {hasApplied
                  ? "You have already applied to this mission."
                  : "Other users have applied and an admin will assign it soon."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-col gap-3">
          {isMissionAvailable ? (
            <Button
              onClick={handleApply}
              disabled={isApplying || !isAuthenticated || hasApplied}
              className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isApplying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Applying...
                </>
              ) : hasApplied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" /> Already Applied
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Apply for this Mission
                </>
              )}
            </Button>
          ) : isMissionPending ? (
            <div className="w-full">
              <p className="text-sm text-muted-foreground italic mb-2">
                This mission is currently "{mission.status}" and awaiting admin
                approval.
              </p>
              {hasApplied ? (
                <p className="text-sm text-green-600 font-medium">
                  ✓ You have applied to this mission
                </p>
              ) : (
                <p className="text-sm text-orange-600">
                  ℹ Other users have already applied to this mission
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              This mission is currently "{mission.status}" and not available for
              application.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
