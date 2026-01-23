"use server";

import { revalidatePath } from "next/cache";
// Base URL for the backend API (should be in environment variables)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

// Helper function (can be shared or duplicated)
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

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else if (response.ok && response.status !== 204) {
      data = { message: await response.text() };
    } else if (response.status === 204) {
      data = { success: true, message: "Operation successful (No Content)" };
    } else {
      // Try to parse error message even if not JSON
      try {
        data = await response.json();
      } catch (e) {
        data = {
          message:
            (await response.text()) ||
            `Request failed with status ${response.status}`,
        };
      }
    }

    if (!response.ok) {
      const error = new Error(
        data?.message || `HTTP error! status: ${response.status}`
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
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
 * Server Action to save survey questions for a specific mission via API.
 *
 * @param {string} missionId - The ID of the mission the survey belongs to.
 * @param {Array<object>} questions - An array of question objects.
 * @param {string} token - The authentication token.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the save operation.
 */
export async function saveSurvey(missionId, questions, token) {
  // Add token parameter
  console.log(`Server Action: Saving survey for mission ${missionId} via API`);
  console.log("Survey Questions:", JSON.stringify(questions, null, 2));

  // Validate missionId (can be basic check here)
  if (!missionId) {
    return { success: false, message: "Invalid mission ID." };
  }
  // Validate questions structure (basic check)
  if (!Array.isArray(questions)) {
    return { success: false, message: "Invalid questions format." };
  }

  try {
    // API expects the questions array directly in the body
    const responseData = await fetchWithAuth(
      `/admin/missions/${missionId}/survey`,
      {
        method: "POST",
        body: JSON.stringify({ questions }), // Send as { questions: [...] }
        headers: {
          // Pass token in headers
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("API Response (Save Survey):", responseData);

    // Revalidate paths relevant to both admin and shoppers
    revalidatePath(`/admin/missions/${missionId}`); // Admin mission detail page
    revalidatePath("/admin/missions"); // Admin mission list
    revalidatePath(`/report/${missionId}`); // Revalidate the shopper's report submission page
    revalidatePath("/missions/assigned");

    return {
      success: true,
      message: responseData.message || "Survey saved successfully.",
    };
  } catch (error) {
    console.error("Server Action Error (Save Survey):", error);
    // Handle specific errors like unauthorized
    let userMessage = "Failed to save the survey via API.";
    if (error.status === 401)
      userMessage = "Authentication failed. Please log in again.";
    if (error.status === 403)
      userMessage = "Authorization failed. You do not have permission.";
    if (error.status === 404) userMessage = "Mission not found.";

    return { success: false, message: userMessage, status: error.status };
  }
}
