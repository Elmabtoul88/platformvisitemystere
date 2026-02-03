"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  FileWarning,
  Calendar,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { fetchMissions } from "@/services/fetchData";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Component pour un seul rapport avec toggle des détails
function ReportCard({
  report,
  shopper,
  missionReward,
  onApprove,
  onRefuse,
  isProcessing,
  formatAnswerValue,
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card
      className={`shadow-md transition-opacity ${isProcessing ? "opacity-70" : ""}`}
    >
      <CardHeader className="bg-secondary/30 border-b p-4 flex justify-between items-start">
        <div>
          <CardTitle className="text-lg font-medium">
            Report from {shopper?.name || report.user_id}
          </CardTitle>
          <CardDescription className="text-xs flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3" />{" "}
            {format(new Date(report.submitted_at), "PPp")}
          </CardDescription>
        </div>
        <Badge
          className={`capitalize text-sm px-3 py-1.5 ${
            report.status === "approved"
              ? "bg-green-100 text-green-800 border-green-300"
              : report.status === "refused"
                ? "bg-red-100 text-red-800 border-red-300"
                : "bg-yellow-100 text-yellow-800 border-yellow-300"
          }`}
        >
          {report.status}
        </Badge>
      </CardHeader>

      <CardContent className="p-4">
        {showDetails ? (
          <>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Survey Responses
            </h3>
            {report.answers && report.answers.length > 0 ? (
              report.answers.map((section, sIndex) => (
                <div
                  key={section.section_id ?? `section-${sIndex}`}
                  className="mb-4"
                >
                  <h4 className="font-bold text-primary mb-2">
                    {section.section_header}
                  </h4>
                  {section.responses.map((q, idx) => (
                    <div key={`${section.section_id}-${q.question_id}-${idx}`}>
                      <strong>
                        {idx + 1}. {q.question}
                      </strong>
                      {/* <-- ici on utilise la fonction pour formater la réponse */}
                      <div className="mt-1">{formatAnswerValue(q, q)}</div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <FileWarning className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                No answers provided.
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(false)}
              className="mt-2"
            >
              Hide Details
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(true)}
            className="mt-2"
          >
            Show Details
          </Button>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 justify-end p-4 bg-secondary/30">
        {report.status === "submitted" && (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={() => onApprove(report.id)}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1" />
              )}
              Approve & Pay ${missionReward}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRefuse(report)}
              disabled={isProcessing}
            >
              <XCircle className="w-4 h-4 mr-1" /> Refuse
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
export default function AdminReviewReportsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const missionId = params.missionId;

  const [mission, setMission] = useState(null);
  const [reports, setReports] = useState([]);
  const [mockUsers, setMockUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingReportId, setProcessingReportId] = useState(null);
  const [refusalReason, setRefusalReason] = useState("");
  const [reportToRefuse, setReportToRefuse] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [m, r, sq, u] = await Promise.all([
          fetchMissions("admin-missions", API_BASE_URL + "missions/admin/all"),
          fetchMissions("admin-reports", API_BASE_URL + "reports"),
          fetchMissions("surveyQuestions", API_BASE_URL + "surveyQuestions"),
          fetchMissions("admin-users", API_BASE_URL + "users"),
        ]);

        setMockUsers(u || []);
        const foundMission = m.find(
          (mission) => mission.id === parseInt(missionId),
        );
        const foundReports = (r || [])
          .filter((report) => report.mission_id === parseInt(missionId))
          .map((report) => ({
            ...report,
            answers: JSON.parse(report.answers || "[]"),
          }));

        if (!foundMission) {
          toast({ variant: "destructive", title: "Mission not found" });
          router.push("/admin/missions");
          return;
        }

        setMission(foundMission);
        setReports(foundReports);
      } catch (error) {
        toast({ variant: "destructive", title: "Failed to fetch data" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [missionId, router, toast]);

  function formatAnswerValue(answer, question) {
    if (!answer || answer.value === null || answer.value === undefined) {
      return <span className="text-muted-foreground italic">Not answered</span>;
    }

    const answerType = answer.type || question?.type;

    switch (answerType) {
      case "text":
      case "text_info":
        return <p className="whitespace-pre-wrap">{answer.value}</p>;

      case "rating":
        const ratingValue = Number(answer.value) || 0;
        const maxRating = question?.maxRating || 5;
        return (
          <div className="flex items-center gap-1">
            {Array.from({ length: maxRating }).map((_, i) => (
              <span
                key={i}
                className={`text-yellow-400 ${i < ratingValue ? "fill-current" : "text-muted-foreground/30"}`}
              >
                ★
              </span>
            ))}
            <span className="text-sm ml-1">
              ({ratingValue}/{maxRating})
            </span>
          </div>
        );

      case "choice":
      case "radio":
      case "multiple_choice":
        return <span>{answer.value}</span>;

      case "checkboxes":
        if (typeof answer.value === "object") {
          const selected = Object.entries(answer.value)
            .filter(([_, v]) => v)
            .map(([k]) => k.replace(/^option_/, ""));
          return selected.length ? (
            <ul className="list-disc list-inside">
              {selected.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <span className="text-muted-foreground italic">
              No options selected
            </span>
          );
        }
        return <span>{answer.value}</span>;

      case "gps_capture":
      case "capture":
        if (answer.value?.lat && answer.value?.lng) {
          return (
            <a
              href={`https://www.google.com/maps?q=${answer.value.lat},${answer.value.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Lat: {answer.value.lat.toFixed(4)}, Lng:{" "}
              {answer.value.lng.toFixed(4)}
            </a>
          );
        }
        return (
          <span className="text-muted-foreground italic">
            Location not captured
          </span>
        );

      case "image_upload":
      case "upload":
        const urls = Array.isArray(answer.value)
          ? answer.value
          : [answer.value].filter(Boolean);
        return urls.length ? (
          <div className="flex gap-2 flex-wrap">
            {urls.map((url, i) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                <img
                  src={url}
                  alt={`Uploaded ${i}`}
                  width={100}
                  className="rounded"
                />
              </a>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground italic">
            No images uploaded
          </span>
        );

      case "audio_recording":
      case "recording":
        if (!answer.value)
          return (
            <span className="text-muted-foreground italic">
              No audio recorded
            </span>
          );
        return (
          <audio controls src={answer.value} className="w-full max-w-xs h-10" />
        );

      default:
        return <pre>{JSON.stringify(answer.value, null, 2)}</pre>;
    }
  }

  const handleApprove = async (reportId) => {
    setProcessingReportId(reportId);

    try {
      const res = await fetch(
        API_BASE_URL + `reports/admin/${reportId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" }),
        },
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast({ title: "Report approved" });

      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: "approved" } : r)),
      );
    } catch (e) {
      toast({ variant: "destructive", title: e.message });
    } finally {
      setProcessingReportId(null);
    }
  };

  const handleRefuse = async () => {
    if (!refusalReason.trim()) return;

    setProcessingReportId(reportToRefuse.id);

    try {
      const res = await fetch(
        API_BASE_URL + `reports/admin/${reportToRefuse.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "refused",
            refusal_reason: refusalReason,
          }),
        },
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast({ title: "Report refused" });

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportToRefuse.id
            ? { ...r, status: "refused", refusal_reason: refusalReason }
            : r,
        ),
      );
    } catch (e) {
      toast({ variant: "destructive", title: e.message });
    } finally {
      setProcessingReportId(null);
      setReportToRefuse(null);
      setRefusalReason("");
    }
  };

  if (isLoading)
    return <Loader2 className="animate-spin w-8 h-8 mx-auto mt-10" />;

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold text-primary">
        Review Reports: {mission.title}
      </h1>

      {currentReports.map((report) => {
        const shopper = mockUsers.find((u) => u.id === report.user_id);
        return (
          <ReportCard
            key={report.id}
            report={report}
            shopper={shopper}
            missionReward={mission.reward}
            onApprove={handleApprove}
            onRefuse={(r) => setReportToRefuse(r)}
            isProcessing={processingReportId === report.id}
            formatAnswerValue={formatAnswerValue}
          />
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
      <AlertDialog
        open={!!reportToRefuse}
        onOpenChange={() => {
          setReportToRefuse(null);
          setRefusalReason("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refuse report?</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Textarea
            value={refusalReason}
            onChange={(e) => setRefusalReason(e.target.value)}
            placeholder="Reason for refusal..."
          />

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!refusalReason.trim()}
              onClick={handleRefuse}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
