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
        errorData?.message || `HTTP error! status: ${response.status}`,
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
      error,
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
    const sections = data.answers;

    if (!Array.isArray(sections)) {
      console.warn("⚠️ answers is not an array");
      return [];
    }

    return sections
      .map((section) => ({
        section_id: section.section_id,
        section_header: section.section_header,
        responses: (section.responses || []).filter((r) => {
          if (Array.isArray(r.value)) return r.value.length > 0;
          if (typeof r.value === "object" && r.value !== null)
            return Object.keys(r.value).length > 0;
          return r.value !== null && r.value !== undefined && r.value !== "";
        }),
      }))
      .filter((section) => section.responses.length > 0);
  };

  // ✅ Transform data safely
  const output = transformAnswers(submittedData);

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
