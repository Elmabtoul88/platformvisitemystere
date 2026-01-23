"use server";

import base_url from "@/services/baseUrl";
import {
  fetchMissions,
  postMissions,
  updateMissions,
} from "@/services/fetchData";
import { revalidatePath } from "next/cache";
// Base URL for the backend API (should be in environment variables)
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
const API_BASE_URL = API_BASE + "reports";

// Helper function (can be shared or duplicated for simplicity here)
async function fetchWithAuth(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    // 'Authorization': `Bearer ${getToken()}`, // Add token retrieval logic here
    ...options.headers,
  };
  try {
    // Assuming getToken() retrieves the stored JWT token
    const token = /* await getToken() */ null; // Replace with actual token retrieval
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });
    // VÉRIFIER response.ok
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = {
          message: `Request failed with status ${response.status}`,
        };
      }

      const error = new Error(
        errorData?.message || `HTTP error! status: ${response.status}`
      );
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    if (response.status === 409) {
      return {
        success: false,
        message: "you already submitted a report for this mission.",
      };
    }

    // Puis traiter la réponse réussie
    if (response.status === 204) {
      return { success: true, message: "Operation successful" };
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return await response.json();
    }

    return { message: await response.text() };
  } catch (error) {
    console.error(
      `API Request Error (${options.method || "GET"} ${url}):`,
      error
    );
    throw {
      success: false,
      message: error.message || "Network or server error occurred.",
      status: error.status || 500,
      data: error.data || {},
    };
  }
}

/**
 * Server Action to handle report submission via API.
 *
 * @param {object} submittedData - Data from the ReportSubmissionForm, containing { answers: { q_id_type: { type: '...', value: '...' } } }
 * @param {string} missionId - The ID of the mission being reported on.
 * @param {string} userId - The ID of the user submitting the report (passed for validation, but API uses authenticated user).
 * @param {string} token - The authentication token.
 */
export async function submitReport(submittedData, missionId, userId, token) {
  console.log(`Soumission rapport - Mission: ${missionId}, User: ${userId}`);

  // ✅ Transform answers correctly based on structure (array or object)
  const transformAnswers = (data) => {
    const answers = data.answers;

    if (Array.isArray(answers)) {
      // Already formatted correctly (just ensure no empty values)
      return answers.filter((a) => {
        if (Array.isArray(a.value)) return a.value.length > 0;
        if (typeof a.value === "object" && a.value !== null)
          return Object.keys(a.value).length > 0;
        return a.value !== null && a.value !== undefined && a.value !== "";
      });
    }

    // 🧩 If answers is an object, fallback to your previous logic
    if (typeof answers === "object" && answers !== null) {
      return Object.entries(answers)
        .filter(([_, value]) => {
          if (Array.isArray(value))
            return value.some((v) => v !== null && v !== undefined);
          if (typeof value === "object" && value !== null)
            return Object.keys(value).length > 0;
          return value !== null && value !== undefined && value !== "";
        })
        .map(([key, value]) => ({
          type: key.includes("_") ? key.split("_").pop() : key,
          value,
        }));
    }

    console.warn("⚠️ Unexpected answers structure:", answers);
    return [];
  };

  // ✅ Transform data safely
  const output = transformAnswers(submittedData);
  console.log(`✅ ${output.length} réponses à soumettre`);
  console.log(output);

  if (!submittedData || typeof submittedData !== "object") {
    console.error("Server Action: Invalid submittedData structure.");
    return { success: false, message: "Invalid report data format." };
  }

  try {
    // ✅ Send clean data to API
    const responseData = await fetchWithAuth(`/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mission_id: parseInt(missionId),
        nomMagazin: submittedData.nomMagazin,
        specificStoreAddress: submittedData.specificStoreAddress,
        scenario: submittedData.scenario,
        dateTimeMission: submittedData.dateTimeMission,
        user_id: parseInt(userId),
        answers: output,
        status: "submitted",
      }),
    });

    await updateMissions(
      base_url + "missions/patch/" + missionId,
      { status: "submitted" },
      "missions",
      base_url + "missions"
    );

    console.log("✅ Rapport soumis avec succès");

    // Revalidate related paths
    revalidatePath("/");
    revalidatePath("/missions/assigned");
    revalidatePath("/missions/completed");
    revalidatePath(`/report/${missionId}`);
    revalidatePath("/admin/missions");
    revalidatePath(`/admin/missions/${missionId}/reports`);

    return {
      success: true,
      message: responseData.message || "Report submitted successfully.",
    };
  } catch (error) {
    console.error("❌ Erreur soumission rapport:", error.message);

    let userMessage = "Failed to submit report via API.";
    if (error.status === 400)
      userMessage = error.message || "Invalid data or mission not submittable.";
    if (error.status === 403)
      userMessage = error.message || "You are not assigned to this mission.";
    if (error.status === 404)
      userMessage = error.message || "Mission not found.";
    if (error.status === 401)
      userMessage = "Authentication failed. Please log in again.";

    return { success: false, message: userMessage, status: error.status };
  }
}
