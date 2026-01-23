"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  mockMissions,
  mockReports,
  mockUsers,
  mockSurveyQuestions,
} from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Loader2,
  FileWarning,
  BarChartHorizontal,
  CheckCircle,
  Users,
  FileDown,
  FileText,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { fetchMissions } from "@/services/fetchData";
//import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

const getShopperName = (userId) => {
  const { user } = useAuth();

  return user.name;
};

// Helper to find the survey question text
const getQuestionText = (missionId, answerKey) => {
  const questions = mockSurveyQuestions[missionId] || [];
  // Handle potential malformed answerKey
  if (
    !answerKey ||
    typeof answerKey.split !== "function" ||
    answerKey.split("_").length < 2
  ) {
    return "Invalid Question Key";
  }
  const questionId = answerKey.split("_")[1];
  const question = questions.find((q) => String(q.id) === questionId);
  return question ? question.text : "Unknown Question";
};

// Helper to format answers for display
const formatAnswerValue = (answer) => {
  if (!answer || answer.value === null || answer.value === undefined)
    return "N/A";
  switch (answer.type) {
    case "text":
      return answer.value;
    case "rating":
      return `${answer.value} / 5 stars`;
    case "multiple_choice":
      return answer.value;
    case "checkboxes":
      return Object.entries(answer.value || {})
        .filter(([, isSelected]) => isSelected)
        .map(([optionId]) => optionId.replace("opt_", ""))
        .join(", ");
    case "image_upload":
      return Array.isArray(answer.value)
        ? `${answer.value.length} image(s)`
        : "1 image";
    case "gps_capture":
      if (
        answer.value &&
        typeof answer.value.lat === "number" &&
        typeof answer.value.lng === "number"
      ) {
        return `Lat: ${answer.value.lat.toFixed(
          4
        )}, Lng: ${answer.value.lng.toFixed(4)}`;
      }
      return "Invalid Coordinates";
    case "audio_recording":
      return "Audio submitted";
    default:
      return String(answer.value);
  }
};

export default function ClientMissionDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const missionId = params.missionId;
  const [isExporting, setIsExporting] = useState(false);
  const [mission, setMission] = useState([]);
  const [submittedReports, setSubmittedReports] = useState(0);
  const [approvedReports, setApprovedReports] = useState(0);
  const [approvalRate, setApprovalRate] = useState(0);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetchMissions(
          "client-reports" + missionId,
          API_BASE_URL + "clients/reports/" + missionId
        );

        setMission(response);
        setSubmittedReports(parseInt(response[0].submitted_count) || 0);
        setApprovedReports(parseInt(response[0].approved_count) || 0);

        const approved = parseInt(response[0].approved_count) || 0;
        const submitted = parseInt(response[0].submitted_count) || 0;
        const total = approved + submitted;

        const rate = total > 0 ? (approved / total) * 100 : 0;

        setApprovalRate(rate);
      } catch (error) {
        toast({ title: "Error fetching reports:", description: " error" });
      }
    };
    fetchReports();
  }, []);

  /*const { mission, submittedReports, approvedReports, approvalRate } =
    useMemo(() => {
      const foundMission = [...reports];

      const allReportsForMission = [...reports];
      const submitted = parseInt(foundMission.submitted_count) || 0;
      const approved = parseInt(foundMission.approved_count) || 0;

      const rate =
        foundMission?.length > 0 ? (approved / foundMission.length) * 100 : 0;
      console.log(foundMission, submitted, approved, rate);

      return {
        mission: foundMission,
        submittedReports: submitted,
        approvedReports: approved,
        approvalRate: rate,
      };
    }, [missionId, reports]);*/

  // Data for export table
  const exportData = useMemo(() => {
    if (!mission || mission.length === 0) return [];

    return mission.map((report) => {
      const answers = JSON.parse(report.answers);

      const formattedAnswers = answers.reduce((acc, a) => {
        let formattedValue = "";

        switch (a.type) {
          case "text":
          case "choice":
          case "rating":
            formattedValue = a.value;
            break;
          case "upload":
            formattedValue = Array.isArray(a.value)
              ? a.value.join(", ")
              : a.value;
            break;
          case "recording":
            formattedValue = a.value;
            break;
          case "capture":
            formattedValue = a.value?.lat
              ? `Lat: ${a.value.lat}, Lng: ${a.value.lng}`
              : "";
            break;
          case "checkboxes":
            formattedValue =
              typeof a.value === "object"
                ? Object.keys(a.value)
                    .filter((k) => a.value[k])
                    .join(", ")
                : "";
            break;
          default:
            formattedValue = "";
        }

        // Use the question text itself as the column name
        acc[a.question?.trim() || "Question"] = formattedValue;
        return acc;
      }, {});

      return {
        ID: report.id,
        "Business Name": report.businessName,
        Status: report.status,
        "Submitted At": format(
          new Date(report.submitted_at),
          "yyyy-MM-dd HH:mm"
        ),
        ...formattedAnswers,
      };
    });
  }, [mission]);

  const handleExport = (format) => {
    setIsExporting(true);
    try {
      if (format === "csv") {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Approved Reports");
        XLSX.writeFile(workbook, `${mission.title}_approved_reports.xlsx`);
      } else if (format === "pdf") {
        const doc = new jsPDF();
        doc.text(`Approved Reports for: ${mission.title}`, 14, 15);
        const tableColumn = Object.keys(exportData[0] || {});
        const tableRows = exportData.map((data) => Object.values(data));
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 20,
          theme: "striped",
          styles: { fontSize: 8 },
        });
        doc.save(`${mission.title}_approved_reports.pdf`);
      }
    } catch (e) {
      toast({ title: "Export failed:", description: "xport pdf" });
    } finally {
      setIsExporting(false);
    }
  };

  const monthlyComparison = useMemo(() => {
    if (!mission || mission.length === 0) {
      return { questions: [], result: [] }; // 👈 structure vide par défaut
    }

    // 1️⃣ Extraire toutes les questions de type rating/choice
    const questions = Array.from(
      new Set(
        mission
          .flatMap((m) => JSON.parse(m.answers))
          .filter((a) => a.type === "rating" || a.type === "choice")
          .map((a) => a.question)
      )
    );

    // 2️⃣ Regrouper les données par mois
    const monthlyData = {};

    mission.forEach((m) => {
      const month = format(new Date(m.submitted_at), "MMMM yyyy", {
        locale: fr,
      });
      const answers = JSON.parse(m.answers);

      answers
        .filter((a) => a.type === "rating" || a.type === "choice")
        .forEach((a) => {
          if (!monthlyData[month]) monthlyData[month] = {};
          if (!monthlyData[month][a.question])
            monthlyData[month][a.question] = [];

          let value = null;

          if (a.type === "rating") value = Number(a.value);
          else if (a.type === "choice") {
            // 🔹 Exemple : échelle 1-4 selon choix (à personnaliser)
            const choices = [
              "Not Helpful",
              "Somewhat Helpful",
              "Helpful",
              "Very Helpful",
            ];
            const index = choices.indexOf(a.value);
            value = index >= 0 ? index + 1 : null;
          }

          if (value !== null) monthlyData[month][a.question].push(value);
        });
    });

    // 3️⃣ Calculer les moyennes
    const result = Object.entries(monthlyData).map(([month, questionsData]) => {
      const row = { month };
      questions.forEach((q) => {
        const values = questionsData[q] || [];
        const avg =
          values.length > 0
            ? (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2)
            : "-";
        row[q] = avg;
      });
      return row;
    });

    return { questions, result };
  }, [mission]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Authorization Check: Ensure the logged-in client owns this mission
  /*if (!mission || mission.clientId !== user?.id) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center">
        <Alert variant="destructive" className="max-w-lg w-full">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Access Denied or Mission Not Found</AlertTitle>
          <AlertDescription>
            You do not have permission to view this mission, or it does not
            exist.
          </AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-6">
          <Link href="/client">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Missions
          </Link>
        </Button>
      </div>
    );
  }*/

  return (
    <div className="container mx-auto py-8 px-4">
      <Button asChild variant="outline" size="sm" className="mb-6">
        <Link href="/client">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Missions
        </Link>
      </Button>

      {/* Mission Header */}
      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">
            {mission[0]?.title}
          </CardTitle>
          <CardDescription>{mission[0]?.businessName}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {mission[0]?.description}
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Submitted Reports
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submittedReports}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Reports
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedReports}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <BarChartHorizontal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate.toFixed(0)}%</div>
            <Progress value={approvalRate} className="w-full h-2 mt-1" />
          </CardContent>
        </Card>
      </div>

      {/* Approved Reports Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Approved Reports</CardTitle>
            <CardDescription>
              Detailed view of all approved shopper submissions.
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              className="flex-1 sm:flex-initial"
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              disabled={isExporting || exportData.length === 0}
            >
              <FileDown className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button
              className="flex-1 sm:flex-initial"
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf")}
              disabled={isExporting || exportData.length === 0}
            >
              <FileText className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {mission.length > 0 &&
                  JSON.parse(mission[0].answers).map((a, i) => (
                    <TableHead key={i}>
                      {a.question
                        ? a.question.slice(0, 20)
                        : `Question_${i + 1}`}
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {mission.map((r) => {
                const answers = JSON.parse(r.answers);

                return (
                  <TableRow key={r.id}>
                    {answers.map((a, i) => (
                      <TableCell key={i}>
                        {a.type === "text" && a.value}

                        {a.type === "choice" && <span>{a.value}</span>}

                        {a.type === "rating" && <span>{a.value} ⭐</span>}

                        {a.type === "upload" && Array.isArray(a.value) && (
                          <div className="flex gap-2">
                            {a.value.map((img, index) => (
                              <img
                                key={index}
                                src={img}
                                alt="Uploaded"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  borderRadius: "8px",
                                }}
                              />
                            ))}
                          </div>
                        )}

                        {a.type === "recording" && (
                          <audio
                            controls
                            src={a.value}
                            style={{ width: "150px" }}
                          />
                        )}

                        {a.type === "capture" && a.value?.lat && (
                          <a
                            href={`https://www.google.com/maps?q=${a.value.lat},${a.value.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View Location
                          </a>
                        )}

                        {a.type === "checkboxes" &&
                          typeof a.value === "object" &&
                          Object.keys(a.value)
                            .filter((k) => a.value[k])
                            .join(", ")}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mois</TableHead>
                {monthlyComparison.questions?.map((q, i) => (
                  <TableHead key={i}>{q}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {monthlyComparison.result?.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.month}</TableCell>
                  {monthlyComparison.questions?.map((q, j) => (
                    <TableCell key={j}>{row[q]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
