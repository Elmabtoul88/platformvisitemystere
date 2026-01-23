"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MissionCard } from "@/components/mission-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle,
  SearchX,
  ArrowLeft,
  DollarSign,
  Wallet,
} from "lucide-react"; // Added Wallet icon
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardHeader, CardTitle
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { fetchMissions } from "@/services/fetchData";
import { useToast } from "@/hooks/use-toast";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
export default function CompletedMissionsPage() {
  const [reports, setReports] = useState([]);
  const [userId, setUserId] = useState(null);
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const currentUser = localStorage.getItem("missionViewAuth");
        if (!currentUser) {
          setIsLoading(false);
          return;
        }

        const parsed = JSON.parse(currentUser);
        const currentUserId = parsed?.user?.id;
        setUserId(currentUserId);

        if (currentUserId) {
          const [allReports, allMissions] = await Promise.all([
            fetchMissions("reports", API_BASE_URL + "reports"),
            fetchMissions("missions", API_BASE_URL + "missions/admin/all"),
            /*fetch(API_BASE_URL + "reports", { cache: "no-cache" }).then((r) =>
              r.json()
            ),*/
            /*fetch(API_BASE_URL + "missions/admin/all", {
              cache: "no-cache",
            }).then((r) => r.json()), // Utilisez la route admin*/
          ]);

          const userReports = allReports.filter(
            (report) => report.user_id === currentUserId
          );
          const approvedReports = userReports.filter(
            (report) => report.status === "approved"
          );

          setReports(approvedReports);
          setMissions(allMissions || []);
        }
      } catch (err) {
        console.error(
          "Erreur lors du chargement des missions complétées:",
          err
        );
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les missions complétées",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedMissions = useMemo(() => {
    if (!reports.length || !missions.length) {
      return [];
    }

    const result = reports
      .map((report) => {
        const mission = missions.find((m) => m.id === report.mission_id);

        if (!mission) {
          return null;
        }
        return {
          ...mission,
          reportId: report.id,
          submitted_at: report.submitted_at,
          report_status: report.status,
          status: "approved",
        };
      })
      .filter(Boolean);

    return result;
  }, [reports, missions]);

  const totalPayment = useMemo(() => {
    return completedMissions.reduce(
      (sum, mission) => sum + parseFloat(mission.reward || 0),
      0
    );
  }, [completedMissions]);

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
        <CheckCircle className="w-6 h-6" /> My Completed Missions
      </h1>

      {/* Total Payment Card */}
      <Card className="mb-6 shadow-sm bg-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Total Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            ${totalPayment.toFixed(2)}
          </div>
          <p className="text-xs text-primary/80">
            Total earnings from all approved missions.
          </p>
        </CardContent>
      </Card>

      {completedMissions.length > 0 ? (
        <div className="space-y-6">
          {completedMissions.map((mission) => {
            return (
              <Card
                key={`${mission.id}-${mission.reportId}`}
                className="shadow-sm overflow-hidden"
              >
                <div className="grid md:grid-cols-3">
                  {/* Mission Details Column */}
                  <div className="md:col-span-2 border-b md:border-b-0 md:border-r">
                    <MissionCard mission={mission} showApplyButton={false} />
                  </div>

                  <div className="md:col-span-1 p-4 bg-secondary/50">
                    {mission ? (
                      <div className="space-y-4">
                        {" "}
                        <div>
                          <h3 className="text-md font-semibold text-foreground flex items-center justify-between mb-1">
                            Submitted Report
                            <Badge
                              variant="default"
                              className="capitalize bg-green-100 text-green-800 border-green-300"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" /> Approved
                            </Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted on:{" "}
                            {format(new Date(mission.submitted_at), "PPp")}
                          </p>
                        </div>
                        {/* Payment Information Section */}
                        <div className="p-3 border rounded-md bg-background shadow-sm">
                          <h4 className="text-sm font-semibold text-primary flex items-center gap-1 mb-1">
                            <DollarSign className="w-4 h-4" /> Payment Status
                          </h4>
                          <p className="text-sm text-green-700 font-medium">
                            Paid: ${parseFloat(mission.reward).toFixed(2)}{" "}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Payment processed upon report approval.
                          </p>
                        </div>
                        {(mission.rating ||
                          mission.comments ||
                          mission.photoUrl) && (
                          <div className="space-y-2 pt-2 border-t mt-4">
                            {mission.rating && (
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <CheckCircle
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < mission.rating
                                        ? "text-accent fill-accent"
                                        : "text-muted-foreground/50"
                                    }`}
                                  />
                                ))}
                                <span className="text-sm font-medium ml-1">
                                  ({mission.rating}/5)
                                </span>
                              </div>
                            )}
                            {mission.comments && (
                              <p className="text-sm text-foreground bg-card p-2 rounded border italic line-clamp-3">
                                "{mission.comments}"
                              </p>
                            )}
                            {mission.photoUrl && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Submitted Photo:
                                </p>
                                <Image
                                  src={mission.photoUrl}
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
            You haven't completed any missions yet. Finish your assigned
            missions and wait for approval to see them here.
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
