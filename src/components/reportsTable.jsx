"use client";

import React from "react";

export default function ReportsTable({ reports }) {
  //console.log("ReportsTable received reports:", reports);
  if (!reports || reports.length === 0) {
    return <p>No reports found.</p>;
  }

  // Get the headers dynamically from the first report’s answers
  const headers = reports[0]?.answers.map((a, i) => `${a.type}_${i + 1}`);

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full border border-gray-300 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">User ID</th>
            {headers.map((h, i) => (
              <th key={i} className="border p-2 capitalize">
                {h.replace("_", " ")}
              </th>
            ))}
            <th className="border p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td className="border p-2 text-center">{report.user_id}</td>

              {report.answers.map((answer, i) => (
                <td key={i} className="border p-2 text-center">
                  {renderAnswer(answer)}
                </td>
              ))}

              <td className="border p-2 text-center">{report.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 🧠 Helper function to render different answer types
function renderAnswer(answer) {
  switch (answer.type) {
    case "text":
    case "choice":
    case "rating":
      return answer.value;

    case "checkboxes":
      return Object.keys(answer.value)
        .filter((key) => answer.value[key])
        .join(", ");

    case "upload":
      return (
        <div className="flex flex-col items-center gap-1">
          {answer.value.map((url, i) => (
            <img
              key={i}
              src={url}
              alt="upload"
              className="w-16 h-16 object-cover rounded"
            />
          ))}
        </div>
      );

    case "capture":
      return `(${answer.value.lat}, ${answer.value.lng})`;

    case "recording":
      return (
        <audio controls>
          <source src={answer.value} type="audio/webm" />
        </audio>
      );

    default:
      return "-";
  }
}
