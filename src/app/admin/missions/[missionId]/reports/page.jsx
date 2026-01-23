"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  approveReportAction,
  refuseReportAction,
} from "../../../../actions/admin-actions.js";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  FileWarning,
  User,
  Calendar,
  Star,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  MapPin,
  ListOrdered,
  CheckSquare as CheckSquareIcon,
  TextCursorInput as TextCursorInputIcon,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchMissions, patchMissions } from "@/services/fetchData.js";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
export default function AdminReviewReportsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const missionId = params.missionId;

  const [mission, setMission] = useState(null);
  const [reports, setReports] = useState([]);
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingReportId, setProcessingReportId] = useState(null);
  const [refusal_reason, setRefusalReason] = useState("");
  const [reportToRefuse, setReportToRefuse] = useState(null);
  const [isTransitioning, startTransition] = useTransition();
  const [allmissions, setAllMissions] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [allsurveyquestions, setAllSurveyQuestions] = useState([]);
  const [mockUsers, setMockUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      console.log(`Admin: Fetching data for mission ${missionId}`);

      try {
        const [m, r, sq, u] = await Promise.all([
          fetchMissions("admin-missions", API_BASE_URL + "missions/admin/all"),
          fetchMissions("admin-reports", API_BASE_URL + "reports"),
          fetchMissions("surveyQuestions", API_BASE_URL + "surveyQuestions"),
          fetchMissions("admin-users", API_BASE_URL + "users"),
        ]);

        if (!m || !r || !sq || !u) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch data. Please try again later",
          });
          return;
        }

        setAllMissions(m);
        setAllReports(r);
        setAllSurveyQuestions(sq);
        setMockUsers(u);

        const foundMission = m.find(
          (mission) => mission.id === parseInt(missionId)
        );
        const foundReports = r
          .filter((report) => report.mission_id === parseInt(missionId))
          .map((report) => ({
            ...report,
            answers: JSON.parse(report.answers || "[]"),
          }));

        const foundQuestions = sq.filter(
          (question) => question.mission_id === parseInt(missionId)
        );

        console.log("Found mission:", foundMission);
        console.log("Found reports:", foundReports);
        console.log("Found questions:", foundQuestions);

        if (foundMission) {
          startTransition(() => {
            setMission(foundMission);
            setReports(foundReports);
            setSurveyQuestions(foundQuestions);
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Mission not found.",
          });
          router.push("/admin/missions");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data. Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [missionId, router, toast]);

  const getIconForType = (type) => {
    switch (type) {
      case "text":
        return (
          <TextCursorInputIcon className="w-4 h-4 mr-1 text-muted-foreground" />
        );
      case "multiple_choice":
      case "choice":
        return <ListOrdered className="w-4 h-4 mr-1 text-muted-foreground" />;
      case "checkboxes":
        return (
          <CheckSquareIcon className="w-4 h-4 mr-1 text-muted-foreground" />
        );
      case "rating":
        return <Star className="w-4 h-4 mr-1 text-muted-foreground" />;
      case "image_upload":
      case "upload":
        return <ImageIcon className="w-4 h-4 mr-1 text-muted-foreground" />;
      case "gps_capture":
      case "capture":
        return <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />;
      case "audio_recording":
        return <Mic className="w-4 h-4 mr-1 text-muted-foreground" />;
      default:
        return null;
    }
  };

  // Fonction pour formater l'affichage des réponses selon leur type
  const formatAnswerValue = (answer, question) => {
    if (!answer || answer.value === null || answer.value === undefined) {
      return <span className="text-muted-foreground italic">Not answered</span>;
    }

    const answerType = answer.type || question?.type;

    switch (answerType) {
      case "text":
        return <p className="whitespace-pre-wrap">{answer.value}</p>;

      case "rating":
        const ratingValue = Number(answer.value);
        const maxRating = question?.maxRating || 5;

        if (isNaN(ratingValue)) {
          return (
            <span className="text-muted-foreground italic">Invalid rating</span>
          );
        }

        return (
          <div className="flex items-center gap-1">
            {Array.from({ length: maxRating }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < ratingValue
                    ? "text-accent fill-accent"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
            <span className="text-sm font-medium ml-1">
              ({ratingValue}/{maxRating})
            </span>
          </div>
        );

      case "multiple_choice":
      case "choice":
        return <span>{answer.value}</span>;

      case "checkboxes":
        let options = question?.options;
        if (!options && question?.options_json) {
          try {
            options = JSON.parse(question.options_json);
          } catch (e) {
            console.error("Error parsing options_json:", e);
            options = [];
          }
        }

        const selectedOptions = Object.entries(answer.value || {})
          .filter(([_, isSelected]) => isSelected)
          .map(([optionId]) => {
            if (options?.length > 0) {
              const cleanOptionId = optionId.replace(/^option_/, "");

              const option = options.find(
                (opt) => String(opt.id) === cleanOptionId
              );
              return option?.text || `Unknown option (${cleanOptionId})`;
            }
            return optionId.replace(/^option_/, "");
          })
          .filter(Boolean);

        return selectedOptions.length > 0 ? (
          <ul className="list-disc list-inside">
            {selectedOptions.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
        ) : (
          <span className="text-muted-foreground italic">
            No options selected
          </span>
        );

      case "image_upload":
      case "upload":
        const urls = Array.isArray(answer.value)
          ? answer.value
          : [answer.value].filter(Boolean);

        return urls.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {urls.map((url, index) => (
              <Link
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={url}
                  alt={`Submitted image ${index + 1}`}
                  width={100}
                  height={75}
                  className="rounded border object-cover hover:opacity-80 transition-opacity cursor-pointer"
                />
              </Link>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground italic">
            No images submitted
          </span>
        );

      case "gps_capture":
      case "capture":
        const coords = answer.value;

        if (
          coords &&
          typeof coords.lat === "number" &&
          typeof coords.lng === "number"
        ) {
          const mapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
          return (
            <Link
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80 flex items-center gap-1"
            >
              <MapPin className="w-4 h-4" />
              Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
            </Link>
          );
        }

        return (
          <span className="text-muted-foreground italic">
            Location not captured
          </span>
        );

      case "audio_recording":
      case "recording":
        const audioUrl = answer.value;

        if (!audioUrl || typeof audioUrl !== "string") {
          return (
            <span className="text-muted-foreground italic">
              Audio not recorded
            </span>
          );
        }

        // Audio simulé
        if (audioUrl.startsWith("/audio/simulated_")) {
          return (
            <div className="flex items-center gap-2 text-muted-foreground text-sm italic">
              <Mic className="w-4 h-4" />
              <span>
                Audio recorded (simulation: {audioUrl.split("/").pop()})
              </span>
            </div>
          );
        }

        return (
          <audio controls src={audioUrl} className="w-full max-w-xs h-10">
            Your browser does not support the audio element.
          </audio>
        );

      default:
        return <span>{String(answer.value)}</span>;
    }
  };

  // Helper to get user details from mock data
  const getUserById = (userId) => {
    return mockUsers.find((u) => u.id === userId);
  };

  // Helper function for status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case "available":
        return "secondary";
      case "assigned":
        return "default";
      case "submitted":
        return "outline";
      case "approved":
        return "default";
      case "refused":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getQuestionById = (questionId) => {
    return surveyQuestions.find((q) => q.id === questionId);
  };

  const handleApprove = async (reportId) => {
    setProcessingReportId(reportId);
    console.log(`Admin: Approving report ${reportId}`);

    try {
      const response = await fetch(
        API_BASE_URL + `reports/admin/${reportId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "approved" }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to approve report");
      }

      if (result.success) {
        const missionResponse = await fetch(
          API_BASE_URL + `missions/patch/${missionId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "approved" }),
          }
        );

        const missionResult = await missionResponse.json();

        if (missionResponse.ok) {
          toast({
            title: "Report Approved",
            description:
              "Report approved and mission status updated successfully",
          });

          startTransition(() => {
            setReports((prev) =>
              prev.map((r) =>
                r.id === reportId ? { ...r, status: "approved" } : r
              )
            );

            const reportIndex = allReports.findIndex((r) => r.id === reportId);
            if (reportIndex !== -1) allReports[reportIndex].status = "approved";

            setMission((prev) =>
              prev ? { ...prev, status: "approved" } : null
            );

            const missionIndex = allmissions.findIndex(
              (m) => m.id === parseInt(missionId)
            );
            if (missionIndex !== -1) {
              allmissions[missionIndex].status = "approved";
            }
          });
        } else {
          throw new Error(
            missionResult.message || "Failed to update mission status"
          );
        }
      } else {
        throw new Error(result.message || "Failed to approve report");
      }
    } catch (error) {
      console.error("Approval error:", error);
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description:
          error.message || "Failed to approve report and update mission status",
      });
    } finally {
      setProcessingReportId(null);
    }
  };
  const handleRefuse = async (reportId) => {
    if (!reportToRefuse || !refusal_reason.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Reason",
        description: "Please provide a reason for refusal.",
      });
      return;
    }

    setProcessingReportId(reportId);
    console.log(
      `Admin: Refusing report ${reportId} with reason: ${refusal_reason}`
    );

    try {
      const result = await patchMissions(
        API_BASE_URL + `reports/admin/${reportId}/status`,
        { status: "refused", refusal_reason: refusal_reason },
        "admin-reports",
        API_BASE_URL + "reports"
      );

      if (result.status === 200) {
        toast({ title: "Report Refused", description: result.message });

        startTransition(() => {
          setReports((prev) =>
            prev.map((r) =>
              r.id === reportId
                ? { ...r, status: "refused", refusal_reason: refusal_reason }
                : r
            )
          );

          const reportIndex = allReports.findIndex((r) => r.id === reportId);
          if (reportIndex !== -1) {
            allReports[reportIndex].status = "refused";
            allReports[reportIndex].refusal_reason = refusal_reason;
          }

          const missionIndex = allmissions.findIndex(
            (m) => m.id === parseInt(missionId)
          );
          if (missionIndex !== -1) {
            allmissions[missionIndex].status = "refused";
            setMission((prev) =>
              prev ? { ...prev, status: "refused" } : null
            );
          }
        });

        setReportToRefuse(null);
        setRefusalReason("");
      } else {
        throw new Error(result.message || "Failed to refuse report.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Refusal Failed",
        description: error.message,
      });
    } finally {
      setProcessingReportId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Mission Not Found</AlertTitle>
          <AlertDescription>
            The requested mission could not be found.
          </AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
          <Link href="/admin/missions">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions
          </Link>
        </Button>
      </div>
    );
  }

  const missionStatusVariant = getStatusVariant(mission.status);
  const missionStatusBg =
    mission.status === "approved"
      ? "bg-green-100 text-green-800 border-green-300"
      : mission.status === "refused"
      ? "bg-red-100 text-red-800 border-red-300"
      : "";

  return (
    <div className="container mx-auto py-8 px-4">
      <Button asChild variant="outline" size="sm" className="mb-4">
        <Link href="/admin/missions">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions List
        </Link>
      </Button>

      <Card className="mb-6 shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="text-xl font-semibold text-primary">
                Review Reports: {mission.title}
              </CardTitle>
              <CardDescription>Mission ID: {mission.id}</CardDescription>
            </div>
            <Badge
              variant={missionStatusVariant}
              className={`capitalize text-sm px-3 py-1 w-fit ${missionStatusBg}`}
            >
              Mission Status: {mission.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 text-sm">
          <p>
            <strong className="font-medium text-muted-foreground">
              Business:
            </strong>{" "}
            {mission.businessName}
          </p>
          <p>
            <strong className="font-medium text-muted-foreground">
              Deadline:
            </strong>{" "}
            {format(new Date(mission?.deadline), "PPP")}
          </p>
          <p>
            <strong className="font-medium text-muted-foreground">
              Reward:
            </strong>{" "}
            ${mission.reward}
          </p>
        </CardContent>
      </Card>

      {reports.length === 0 ? (
        <Alert className="mt-6 bg-secondary border-secondary-foreground/10">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>No Reports Submitted Yet</AlertTitle>
          <AlertDescription>
            There are currently no reports submitted for this mission.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => {
            const shopper = getUserById(report.user_id);
            const shopperName = shopper
              ? shopper.name
              : `User ID: ${report.user_id}`;
            const shopperAvatarUrl = shopper?.profile_pic_url;
            const shopperAvatarFallback =
              shopperName?.charAt(0)?.toUpperCase() || "U";
            const isProcessing = processingReportId === report.id;

            const reportStatusVariant =
              report.status === "approved"
                ? "default"
                : report.status === "refused"
                ? "destructive"
                : report.status === "submitted"
                ? "outline"
                : "secondary";
            const reportStatusBg =
              report.status === "approved"
                ? "bg-green-100 text-green-800 border-green-300"
                : report.status === "refused"
                ? "bg-red-100 text-red-800 border-red-300"
                : report.status === "submitted"
                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                : "";

            return (
              <Card
                key={report.id}
                className={`shadow-md transition-opacity ${
                  isProcessing ? "opacity-70" : ""
                } overflow-hidden`}
              >
                <CardHeader className="bg-secondary/30 border-b p-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={shopperAvatarUrl} alt={shopperName} />
                        <AvatarFallback>{shopperAvatarFallback}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                          Report from {shopperName}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          {shopper && <span>User ID: {report.user_id}</span>}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Submitted:{" "}
                            {format(new Date(report.submitted_at), "PPp")}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={reportStatusVariant}
                      className={`capitalize text-sm px-3 py-1.5 w-fit mt-2 sm:mt-0 ${reportStatusBg}`}
                    >
                      {report.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Survey Responses
                    </h3>

                    {surveyQuestions.length > 0 && report.answers.length > 0 ? (
                      report.answers.map((answer, index) => {
                        // Trouver la question correspondante par ID ou index
                        const question =
                          getQuestionById(answer.question_id) ||
                          surveyQuestions[index];

                        if (!question) {
                          return (
                            <div
                              key={index}
                              className="p-4 bg-muted/30 rounded-lg border-l-4 border-l-muted-foreground/20"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-muted-foreground/10 rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-muted-foreground mb-2">
                                    Question {index + 1}: Question not found
                                  </p>
                                  <div className="text-sm text-foreground">
                                    {formatAnswerValue(answer, null)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        const questionTypeColor =
                          {
                            text: "border-l-blue-400 bg-blue-50/50",
                            rating: "border-l-yellow-400 bg-yellow-50/50",
                            choice: "border-l-green-400 bg-green-50/50",
                            multiple_choice:
                              "border-l-green-400 bg-green-50/50",
                            checkboxes: "border-l-purple-400 bg-purple-50/50",
                            upload: "border-l-pink-400 bg-pink-50/50",
                            image_upload: "border-l-pink-400 bg-pink-50/50",
                            capture: "border-l-indigo-400 bg-indigo-50/50",
                            gps_capture: "border-l-indigo-400 bg-indigo-50/50",
                            recording: "border-l-orange-400 bg-orange-50/50",
                            audio_recording:
                              "border-l-orange-400 bg-orange-50/50",
                          }[question.type] || "border-l-gray-400 bg-gray-50/50";

                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-l-4 ${questionTypeColor} transition-all hover:shadow-sm`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-7 h-7 bg-white rounded-full flex items-center justify-center text-sm font-semibold text-primary shadow-sm border">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2 mb-3">
                                  {getIconForType(question.type)}
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-foreground leading-tight">
                                      {question.text}
                                      {question.is_required ? (
                                        <span
                                          className="text-destructive text-xs ml-1"
                                          title="Required"
                                        >
                                          *
                                        </span>
                                      ) : null}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-muted-foreground capitalize bg-white px-2 py-0.5 rounded-full border">
                                        {question.type.replace("_", " ")}
                                      </span>
                                      {question.is_required ? (
                                        <span className="text-xs text-destructive bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                          Required
                                        </span>
                                      ) : (
                                        <span className="text-xs text-muted-foreground bg-gray-50 px-2 py-0.5 rounded-full border">
                                          Optional
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-md p-3 border shadow-sm">
                                  <div className="text-sm text-foreground">
                                    {formatAnswerValue(answer, question)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileWarning className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-sm">
                          {surveyQuestions.length === 0
                            ? "No survey questions were configured for this mission."
                            : "No answers provided for this report."}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 p-4 border-t bg-secondary/30">
                  {report.status === "submitted" && (
                    <>
                      <AlertDialog
                        open={reportToRefuse?.id === report.id}
                        onOpenChange={(isOpen) => {
                          if (!isOpen) {
                            setReportToRefuse(null);
                            setRefusalReason("");
                          }
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setReportToRefuse(report)}
                            disabled={isProcessing}
                            className="w-full sm:w-auto"
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Refuse
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Refuse Report from {shopperName}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Please provide a clear reason for refusing this
                              report. This reason will be shared with the
                              shopper.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Textarea
                            placeholder="Enter reason for refusal..."
                            value={refusal_reason}
                            onChange={(e) => setRefusalReason(e.target.value)}
                            rows={3}
                            className="my-4"
                          />
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => {
                                setReportToRefuse(null);
                                setRefusalReason("");
                              }}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRefuse(report.id)}
                              disabled={isProcessing || !refusal_reason.trim()}
                              className={buttonVariants({
                                variant: "destructive",
                              })}
                            >
                              {isProcessing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Confirm Refusal
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(report.id)}
                        disabled={isProcessing}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        Approve & Pay ${mission.reward}
                      </Button>
                    </>
                  )}
                  {report.status === "approved" && (
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Approved & Paid $
                      {mission.reward}
                    </span>
                  )}
                  {report.status === "refused" && (
                    <span className="text-sm text-destructive font-medium flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Report Refused
                    </span>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
