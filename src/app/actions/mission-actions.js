"use server";

import { revalidatePath } from "next/cache";
// Base URL for the backend API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

// Helper function to make authenticated API requests (similar to admin-actions)
async function fetchWithAuth(url, options = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn(`fetchWithAuth called without token for URL: ${url}`);
    // Shopper actions strictly require authentication
    throw {
      success: false,
      message: "Authentication token is missing.",
      status: 401,
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (response.status === 204) {
      data = { success: true, message: "Operation successful (No Content)" };
    } else if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else if (response.ok) {
      data = { message: await response.text() };
    } else {
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
    if (data && data.success === undefined && response.ok) {
      data.success = true;
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
 * Server Action for a shopper to apply for a mission.
 *
 * @param {string} missionId - The ID of the mission to apply for.
 * @param {string} token - The shopper's authentication token.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the application operation.
 */
export async function applyForMissionAction(missionId, token) {
  console.log(
    `Server Action: Shopper applying for mission ${missionId} via API`
  );
  try {
    const data = await fetchWithAuth(
      `/missions/${missionId}/apply`,
      {
        method: "POST",
        // No body needed for apply action
      },
      token
    ); // Pass token

    console.log("API Response (Apply for Mission):", data);

    // Revalidate relevant paths
    revalidatePath("/"); // Available missions list
    revalidatePath("/missions/assigned"); // Assigned missions list
    revalidatePath(`/missions/${missionId}/details`); // The details page itself

    return {
      success: true,
      message: data.message || "Successfully applied for the mission.",
    };
  } catch (error) {
    console.error("Server Action Error (Apply for Mission):", error);
    let userMessage = "Failed to apply for mission.";
    if (error.status === 401)
      userMessage = "Authentication failed. Please log in again.";
    if (error.status === 403)
      userMessage = "Authorization failed. You might not be a shopper.";
    if (error.status === 400)
      userMessage =
        error.message ||
        "Cannot apply for this mission (already applied, not available, etc.).";
    if (error.status === 404) userMessage = "Mission not found.";
    return { success: false, message: userMessage, status: error.status };
  }
}
