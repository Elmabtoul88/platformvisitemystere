"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  UserCheck,
  Search,
  Filter,
  Users as UsersIcon,
  Info,
} from "lucide-react";
import {
  approveApplicationAction,
  refuseApplicationAction,
} from "../../actions/admin-actions.js";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { fetchMissions } from "@/services/fetchData.js";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

export default function AdminApplicationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);
  const [refusalReason, setRefusalReason] = useState("");
  const [applicationToRefuse, setApplicationToRefuse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTransitioning, startTransition] = useTransition();
  const [applicationToApprove, setApplicationToApprove] = useState(null);
  const [assignmentDetails, setAssignmentDetails] = useState({
    nomMagazin: "",
    specificStoreAddress: "",
    dateTimeMission: "",
    scenario: "",
  });

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const response = await fetchMissions(
          "applications",
          API_BASE_URL + "applications"
        );
        console.log(response);
        const apps = Array.isArray(response) ? response : [];
        setApplications(apps.filter((app) => app.status === "pending"));
        setIsLoading(false);
      } catch (error) {
        console.log(error.message);
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const term = searchTerm.toLowerCase();
      return (
        app.mission_title?.toLowerCase().includes(term) ||
        app.user_name?.toLowerCase().includes(term) ||
        app.email?.toLowerCase().includes(term) ||
        app.id.toString().includes(term)
      );
    });
  }, [applications, searchTerm]);

  const handleApprove = async (
    applicationId,
    missionId,
    userId,
    assignmentDetails
  ) => {
    console.log(
      "Approve clicked",
      applicationId,
      missionId,
      userId,
      assignmentDetails
    );
    setIsProcessing(applicationId);
    try {
      const result = await approveApplicationAction(
        applicationId,
        missionId,
        userId,
        assignmentDetails
      );

      if (result.success) {
        toast({ title: "Application Approved", description: result.message });
        startTransition(() => {
          setApplications((prev) =>
            prev.filter((app) => app.id !== applicationId)
          );
        });
      } else {
        throw new Error(result.message || "Failed to approve application.");
      }
    } catch (error) {
      console.error("Error approving application:", error.message);
      toast({
        variant: "destructive",
        title: "Error Approving",
        description: error.message,
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRefuse = async () => {
    if (!applicationToRefuse || !refusalReason.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Reason",
        description: "Please provide a reason for refusal.",
      });
      return;
    }

    const applicationId = applicationToRefuse.id;
    setIsProcessing(applicationId);

    try {
      const result = await refuseApplicationAction(
        applicationId,
        refusalReason
      );

      if (result.success) {
        toast({ title: "Application Refused", description: result.message });
        startTransition(() => {
          setApplications((prev) =>
            prev.filter((app) => app.id !== applicationId)
          );
        });
        setApplicationToRefuse(null);
        setRefusalReason("");
      } else {
        throw new Error(result.message || "Failed to refuse application.");
      }
    } catch (error) {
      console.error("Error refusing application:", error.message);
      toast({
        variant: "destructive",
        title: "Error Refusing",
        description: error.message,
      });
    } finally {
      setIsProcessing(null);
    }
  };

  // When opening the approval modal, populate the assignment details
  const openApproveModal = (app) => {
    //const mission = getMissionDetails(app.mission_id);
    setApplicationToApprove(app);
    /*setAssignmentDetails({
            specificStoreAddress: mission.location,
            specificScenario: mission.description
        });*/
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading applications...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <UserCheck className="w-6 h-6" /> Pending Mission Applications
      </h1>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Review Applications</CardTitle>
          <CardDescription>
            Approve or refuse shopper applications for missions.
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by mission, shopper name, email, or app ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full md:w-2/3 lg:w-1/2"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Shopper</TableHead>
                  <TableHead className="min-w-[180px]">
                    Mission Applied For
                  </TableHead>
                  <TableHead className="min-w-[120px]">Applied On</TableHead>
                  <TableHead className="min-w-[100px]">App ID</TableHead>
                  <TableHead className="text-right min-w-[200px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => {
                    const isCurrentProcessing = isProcessing === app.id;

                    return (
                      <TableRow
                        key={app.id}
                        className={
                          isCurrentProcessing
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage
                                src={app.profile_pic_url}
                                alt={app.user_name}
                              />
                              <AvatarFallback>
                                {app.user_name?.charAt(0)?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{app.user_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {app.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/missions/${app.mission_id}/edit`}
                            className="hover:underline text-primary font-medium"
                          >
                            {app.mission_title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {format(new Date(app.applied_at), "PPp")}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {app.id}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <AlertDialog
                            open={applicationToRefuse?.id === app.id}
                            onOpenChange={(isOpen) => {
                              if (!isOpen) {
                                setApplicationToRefuse(null);
                                setRefusalReason("");
                              }
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setApplicationToRefuse(app)}
                                disabled={isCurrentProcessing}
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Refuse
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Refuse Application for {app.mission_title}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Shopper: {app.user_name}. Please provide a
                                  reason for refusal. This may be shared with
                                  the shopper.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <Textarea
                                placeholder="Enter reason for refusal..."
                                value={refusalReason}
                                onChange={(e) =>
                                  setRefusalReason(e.target.value)
                                }
                                rows={3}
                                className="my-4"
                              />
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => {
                                    setApplicationToRefuse(null);
                                    setRefusalReason("");
                                  }}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleRefuse}
                                  disabled={
                                    isCurrentProcessing || !refusalReason.trim()
                                  }
                                  className={buttonVariants({
                                    variant: "destructive",
                                  })}
                                >
                                  {isProcessing === app.id &&
                                  applicationToRefuse?.id === app.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : null}
                                  Confirm Refusal
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          {/* Approve Dialog */}
                          <AlertDialog
                            open={applicationToApprove?.id === app.id}
                            onOpenChange={(isOpen) => {
                              if (!isOpen) setApplicationToApprove(null);
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => openApproveModal(app)}
                                disabled={isCurrentProcessing}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" /> Approve
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Approve & Assign Mission
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Review and edit the specific details for this
                                  assignment to <strong>{app.user_name}</strong>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="my-4 text-sm space-y-4 p-3 border rounded-md bg-secondary/50">
                                <div className="font-semibold text-primary">
                                  Mission: {app.mission_title}
                                </div>
                                <div className="space-y-1">
                                  <Label
                                    htmlFor="nomMagazin"
                                    className="flex items-center gap-2"
                                  >
                                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />{" "}
                                    Specific Le Nom du magazin
                                  </Label>
                                  <Input
                                    id="nomMagazin"
                                    value={assignmentDetails.nomMagazin}
                                    onChange={(e) =>
                                      setAssignmentDetails((prev) => ({
                                        ...prev,
                                        nomMagazin: e.target.value,
                                      }))
                                    }
                                    className="bg-background"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label
                                    htmlFor="specificStoreAddress"
                                    className="flex items-center gap-2"
                                  >
                                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />{" "}
                                    Specific Store Address
                                  </Label>
                                  <Input
                                    id="specificStoreAddress"
                                    value={
                                      assignmentDetails.specificStoreAddress
                                    }
                                    onChange={(e) =>
                                      setAssignmentDetails((prev) => ({
                                        ...prev,
                                        specificStoreAddress: e.target.value,
                                      }))
                                    }
                                    className="bg-background"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label
                                    htmlFor="dateTimeMission"
                                    className="flex items-center gap-2"
                                  >
                                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />{" "}
                                    Specifier La date et l'heure de la mission
                                  </Label>
                                  <Input
                                    id="dateTimeMission"
                                    type="datetime-local"
                                    value={assignmentDetails.dateTimeMission}
                                    onChange={(e) =>
                                      setAssignmentDetails((prev) => ({
                                        ...prev,
                                        dateTimeMission: e.target.value,
                                      }))
                                    }
                                    className="bg-background"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label
                                    htmlFor="specificScenario"
                                    className="flex items-center gap-2"
                                  >
                                    <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />{" "}
                                    Specific Scenario / Description
                                  </Label>
                                  <Textarea
                                    id="specificScenario"
                                    value={assignmentDetails.scenario}
                                    onChange={(e) =>
                                      setAssignmentDetails((prev) => ({
                                        ...prev,
                                        scenario: e.target.value,
                                      }))
                                    }
                                    className="bg-background min-h-[100px]"
                                  />
                                </div>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  disabled={isCurrentProcessing}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleApprove(
                                      app.id,
                                      app.mission_id,
                                      app.user_id,
                                      assignmentDetails
                                    )
                                  }
                                  /*disabled={
                                    isCurrentProcessing ||
                                    "!assignmentDetails.specificStoreAddress.trim()"
                                  }*/
                                  className={buttonVariants({
                                    variant: "default",
                                    className:
                                      "bg-green-600 hover:bg-green-700 text-white",
                                  })}
                                >
                                  {isCurrentProcessing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                  )}
                                  Confirm Approval & Assign
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          {/* <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() =>
                              handleApprove(app.id, app.mission_id, app.user_id)
                            }
                            disabled={isCurrentProcessing}
                          >
                            {isProcessing === app.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            Approve
                          </Button>*/}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No pending applications found matching your search
                      criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {filteredApplications.length > 0 && (
          <CardFooter className="text-xs text-muted-foreground">
            Showing {filteredApplications.length} of {applications.length}{" "}
            pending applications.
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
