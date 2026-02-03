"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Star, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { fetchMissions } from "@/services/fetchData";
import RadarChart from "@/components/radar-chart";
const COLORS = ["#22c55e", "#ef4444"];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ClientMissionDashboard({ params }) {
  const missionId = React.use(params).missionId;
  const [mission, setMission] = useState([]);

  useEffect(() => {
    fetchMissions(
      "client-reports" + missionId,
      `${API_BASE_URL}clients/reports/${missionId}`,
    ).then(setMission);
  }, [missionId]);

  // =================== Normalisation des réponses ===================
  const answers = useMemo(
    () =>
      mission.flatMap((m) => {
        try {
          const parsed = JSON.parse(m.answers);
          return parsed.flatMap((section) =>
            (section.responses || []).map((r) => ({
              ...r,
              section_header: section.section_header,
            })),
          );
        } catch (e) {
          console.error("Error parsing mission answers:", e);
          return [];
        }
      }),
    [mission],
  );

  // =================== KPI / RATINGS ===================
  const ratingsByQuestion = useMemo(() => {
    const map = {};
    answers
      .filter((a) => a.type === "rating")
      .forEach((a) => {
        if (!map[a.question]) map[a.question] = [];
        map[a.question].push(Number(a.value));
      });
    return Object.entries(map).map(([q, v]) => ({
      question: q,
      avg: v.length
        ? +(v.reduce((s, x) => s + x, 0) / v.length).toFixed(2)
        : "-",
    }));
  }, [answers]);

  const globalRating = ratingsByQuestion.length
    ? (
        ratingsByQuestion.reduce((s, r) => s + (r.avg !== "-" ? r.avg : 0), 0) /
        ratingsByQuestion.filter((r) => r.avg !== "-").length
      ).toFixed(2)
    : "-";

  const yesNoByQuestion = useMemo(() => {
    const map = {};
    answers
      .filter((a) => a.type === "checkboxes" && (a.value?.oui || a.value?.non))
      .forEach((a) => {
        if (!map[a.question]) map[a.question] = { oui: 0, non: 0 };
        if (a.value.oui) map[a.question].oui++;
        if (a.value.non) map[a.question].non++;
      });
    return map;
  }, [answers]);

  const conformity = Object.values(yesNoByQuestion).length
    ? (
        (Object.values(yesNoByQuestion).reduce((s, v) => s + v.oui, 0) /
          Object.values(yesNoByQuestion).reduce(
            (s, v) => s + v.oui + v.non,
            0,
          )) *
        100
      ).toFixed(0)
    : "-";

  const scoreByCity = useMemo(() => {
    const map = {};
    mission.forEach((m) => {
      try {
        const parsed = JSON.parse(m.answers);
        const allResponses = parsed.flatMap(
          (section) => section.responses || [],
        );
        const city =
          allResponses.find(
            (a) => a.question === "Ville" || a.question === "Ville du magasin",
          )?.value || "N/A";
        allResponses
          .filter((a) => a.type === "rating")
          .forEach((a) => {
            if (!map[city]) map[city] = { total: 0, count: 0 };
            map[city].total += Number(a.value);
            map[city].count++;
          });
      } catch (e) {
        console.error(e);
      }
    });
    return Object.entries(map).map(([c, v]) => ({
      city: c,
      score: v.count ? +(v.total / v.count).toFixed(2) : "-",
    }));
  }, [mission]);

  // =================== Texte libre ===================
  const pointsForts = answers.filter(
    (a) => a.type === "text" && a.question.toUpperCase().includes("POINTS"),
  );
  const improvements = answers.filter(
    (a) =>
      a.type === "text" &&
      (a.question.toUpperCase().includes("AMÉLIORATION") ||
        a.question.toUpperCase().includes("FINAL")),
  );

  // =================== Summary ===================
  const summaryGlobal = useMemo(() => {
    const totalQuestions = Object.values(yesNoByQuestion).reduce(
      (s, v) => s + v.oui + v.non,
      0,
    );
    const totalOui = Object.values(yesNoByQuestion).reduce(
      (s, v) => s + v.oui,
      0,
    );
    return {
      totalQuestions,
      totalOui,
      conformity: totalQuestions ? (totalOui / totalQuestions) * 100 : 0,
      averageRating: ratingsByQuestion.length
        ? (
            ratingsByQuestion.reduce(
              (s, r) => s + (r.avg !== "-" ? r.avg : 0),
              0,
            ) / ratingsByQuestion.filter((r) => r.avg !== "-").length
          ).toFixed(2)
        : "-",
    };
  }, [yesNoByQuestion, ratingsByQuestion]);

  // =================== Moyenne par question ===================
  const averageByQuestion = useMemo(() => {
    if (!mission || mission.length === 0) return [];

    const questionStats = {};
    const totalReports = mission.length;

    mission.forEach((r) => {
      try {
        const parsed = JSON.parse(r.answers);
        parsed
          .flatMap((section) => section.responses || [])
          .forEach((a) => {
            if (a.type !== "checkboxes" && a.type !== "rating") return;

            if (!questionStats[a.question]) {
              questionStats[a.question] = {
                type: a.type,
                options: {},
                ratings: [],
              };
            }

            if (a.type === "checkboxes") {
              Object.entries(a.value).forEach(([option, selected]) => {
                if (!questionStats[a.question].options[option]) {
                  questionStats[a.question].options[option] = 0;
                }
                if (selected) questionStats[a.question].options[option] += 1;
              });
            } else if (a.type === "rating") {
              questionStats[a.question].ratings.push(Number(a.value));
            }
          });
      } catch (e) {
        console.error(e);
      }
    });

    const result = [];
    Object.entries(questionStats).forEach(([question, data]) => {
      if (data.type === "rating" && data.ratings.length > 0) {
        const sum = data.ratings.reduce((a, b) => a + b, 0);
        result.push({
          question,
          option: "-",
          average: (sum / data.ratings.length).toFixed(2),
        });
      } else if (data.type === "checkboxes") {
        Object.entries(data.options).forEach(([option, count]) => {
          result.push({
            question,
            option,
            average: ((count / totalReports) * 100).toFixed(2) + "%",
          });
        });
      }
    });
    return result;
  }, [mission]);

  // =================== Exports ===================
  const exportExcel = () => {
    const exportData = mission.map((r) => {
      try {
        const parsed = JSON.parse(r.answers);
        const row = { "Report ID": r.id, "Business Name": r.businessName };
        parsed
          .flatMap((section) => section.responses || [])
          .forEach((a) => {
            row[a.question] =
              a.type === "checkboxes"
                ? Object.entries(a.value)
                    .filter(([, val]) => val)
                    .map(([k]) => k)
                    .join(", ")
                : a.value;
          });
        return row;
      } catch (e) {
        console.error(e);
        return {};
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, "reports.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Rapport Visite Mystère", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [["Question", "Valeur"]],
      body: answers.map((a) => [
        a.question,
        typeof a.value === "object" ? JSON.stringify(a.value) : a.value,
      ]),
      styles: { fontSize: 8 },
    });

    doc.save("reports.pdf");
  };

  // Normalize sections for calculation
  const normalizedSections = mission.map((mission) => {
    const answers = JSON.parse(mission.answers); // transforme la string en array
    const sections = {};

    answers.forEach((section) => {
      const { section_header, responses } = section;

      let scoreSum = 0; // somme des scores
      let maxScoreSum = 0; // somme des scores max pour normalisation

      responses.forEach((q) => {
        if (q.type === "checkboxes") {
          const yes = q.value?.oui === true ? 1 : 0; // uniquement compter "oui"
          scoreSum += yes;
          maxScoreSum += 1; // chaque question “checkbox” compte pour 1
        } else if (q.type === "rating") {
          scoreSum += q.value || 0;
          maxScoreSum += 5; // max rating possible
        }
      });

      // Score en % pour cette section
      sections[section_header] =
        maxScoreSum > 0 ? +((scoreSum / maxScoreSum) * 100).toFixed(2) : 0;
    });

    return {
      nomMagazin: mission.nomMagazin,
      sections,
    };
  });

  // Calcul des moyennes par section pour le tableau Total / Moyenne
  const sectionTotals = useMemo(() => {
    if (!normalizedSections.length) return {};

    const sectionHeaders = [
      ...new Set(normalizedSections.flatMap((m) => Object.keys(m.sections))),
    ];

    const totals = {};

    sectionHeaders.forEach((header) => {
      const scores = normalizedSections.map((m) => m.sections[header] || 0);
      totals[header] = +(
        scores.reduce((a, b) => a + b, 0) / scores.length
      ).toFixed(2);
    });

    return totals;
  }, [normalizedSections]);

  // =================== UI ===================
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-4">
        <KPI title="Visites" value={mission.length} />
        <KPI
          title="Note globale"
          value={`${globalRating} /5`}
          icon={<Star />}
        />
        <KPI title="Conformité" value={`${conformity}%`} />
        <KPI title="Villes auditées" value={scoreByCity.length} />
      </div>

      {/* RATINGS */}
      <Card>
        <CardHeader>
          <CardTitle>Notes moyennes par critère</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer>
            <BarChart data={ratingsByQuestion}>
              <XAxis dataKey="question" hide />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="avg" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* YES / NO DETAIL */}
      <Card>
        <CardHeader>
          <CardTitle>Détail Oui / Non par question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(yesNoByQuestion).map(([q, v], i) => (
            <div key={i}>
              <p className="font-semibold mb-2">{q}</p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart
                  data={[
                    { name: "Oui", value: v.oui },
                    { name: "Non", value: v.non },
                  ]}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    <Cell fill={COLORS[0]} />
                    <Cell fill={COLORS[1]} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SCORE BY CITY */}
      <Card>
        <CardHeader>
          <CardTitle>Score moyen par ville</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer>
            <BarChart data={scoreByCity}>
              <XAxis dataKey="city" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="score" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* TEXT */}
      <div className="grid md:grid-cols-2 gap-4">
        <TextCard title="Points forts" data={pointsForts} />
        <TextCard title="Axes d’amélioration" data={improvements} />
      </div>

      {/* TABLE BRUTE */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Données brutes</CardTitle>
          <div className="flex gap-2">
            <button onClick={exportExcel}>
              <FileDown /> Excel
            </button>
            <button onClick={exportPDF}>
              <FileDown /> PDF
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {mission.length > 0 &&
                  mission[0] &&
                  JSON.parse(mission[0].answers)
                    .flatMap((s) => s.responses || [])
                    .map((a, i) => (
                      <TableHead key={i}>{a.question.slice(0, 20)}</TableHead>
                    ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {mission.map((r) => {
                let answers = [];
                try {
                  const parsed = JSON.parse(r.answers);
                  answers = parsed.flatMap((s) => s.responses || []);
                } catch (e) {
                  console.error(e);
                }

                return (
                  <TableRow key={r.id}>
                    {answers.map((a, i) => (
                      <TableCell key={i}>
                        {a.type === "text" && a.value}
                        {a.type === "choice" && <span>{a.value}</span>}
                        {a.type === "rating" && <span>{a.value} ⭐</span>}
                        {a.type === "upload" &&
                          Array.isArray(a.value) &&
                          a.value.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt="Uploaded"
                              style={{ width: "60px", height: "60px" }}
                            />
                          ))}
                        {a.type === "recording" && (
                          <audio controls src={a.value} />
                        )}
                        {a.type === "capture" && a.value?.lat && (
                          <a
                            href={`https://www.google.com/maps?q=${a.value.lat},${a.value.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
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
        </CardContent>
      </Card>

      {/* TABLEAU RÉSUMÉ */}
      <Card>
        <CardHeader>
          <CardTitle>Exemple final (Résumé)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Total Questions Oui/Non</TableHead>
                <TableHead>Conformité (%)</TableHead>
                <TableHead>Note Moyenne (Rating)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{summaryGlobal.totalQuestions || 0}</TableCell>
                <TableCell>
                  {summaryGlobal.conformity !== undefined
                    ? summaryGlobal.conformity.toFixed(2) + "%"
                    : "-"}
                </TableCell>
                <TableCell>
                  {summaryGlobal.averageRating !== undefined
                    ? summaryGlobal.averageRating
                    : "-"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MOYENNE PAR QUESTION */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Moyenne par question</CardTitle>
          <CardDescription>
            Moyenne des réponses pour type checkboxes et rating
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Option</TableHead>
                <TableHead>% / Moyenne</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {averageByQuestion.map((q, i) => (
                <TableRow key={i}>
                  <TableCell>{q.question}</TableCell>
                  <TableCell>{q.option}</TableCell>
                  <TableCell>{q.average}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Résultat par magasin et section</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du magasin</TableHead>
                {normalizedSections.length > 0 &&
                  Object.keys(normalizedSections[0].sections).map((s, i) => (
                    <TableHead key={i}>{s}</TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {normalizedSections.map((m, i) => (
                <TableRow
                  key={i}
                  className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <TableCell className="font-semibold">
                    {m.nomMagazin}
                  </TableCell>
                  {Object.values(m.sections).map((score, j) => (
                    <TableCell
                      key={j}
                      className={`
                  font-bold
                  ${score >= 80 ? "bg-green-100 text-green-800" : ""}
                  ${score >= 50 && score < 80 ? "bg-yellow-100 text-yellow-800" : ""}
                  ${score < 50 ? "bg-red-100 text-red-800" : ""}
                  text-center
                `}
                    >
                      {score}%
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {/* Ligne Totaux / Moyennes */}
              <TableRow className="font-bold bg-blue-100">
                <TableCell>Total / Moyenne</TableCell>
                {Object.values(sectionTotals).map((avg, i) => (
                  <TableCell
                    key={i}
                    className="text-center text-blue-800 font-semibold"
                  >
                    {avg}%
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <RadarChart normalizedSections={normalizedSections} />
    </div>
  );
}

// =================== Petits composants ===================
const KPI = ({ title, value, icon }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="text-3xl font-bold flex gap-2 items-center">
      {value}
      {icon}
    </CardContent>
  </Card>
);

const TextCard = ({ title, data }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {data.map((d, i) => (
        <p key={i}>• {d.value}</p>
      ))}
    </CardContent>
  </Card>
);
