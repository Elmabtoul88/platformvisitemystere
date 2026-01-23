"use server";

import { patchMissions, postMissions } from "@/services/fetchData";
import { revalidatePath } from "next/cache";

// Base URL for the backend API (should be in environment variables)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

// Helper function to make authenticated API requests
async function fetchWithAuth(url, options = {}, token) {
  // Accept token as argument
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add Authorization header if token is provided
  if (token) {
    headers["x-auth-token"] = `${token}`;
  } else {
    // Handle cases where token is missing - maybe throw an error or proceed cautiously
    console.warn(`fetchWithAuth called without token for URL: ${url}`);
    // Depending on the endpoint, you might want to return an error immediately:
    // throw { success: false, message: 'Authentication token is missing.', status: 401 };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    // Attempt to parse JSON response, handle non-JSON or empty responses gracefully
    let data;
    const contentType = response.headers.get("content-type");
    if (response.status === 204) {
      // Handle No Content first
      data = { success: true, message: "Operation successful (No Content)" };
    } else if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else if (response.ok) {
      // Handle non-JSON success like plain text
      data = { message: await response.text() };
    } else {
      // Error cases or unexpected content types
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
      // Throw an error object that includes the status and parsed message
      const error = new Error(
        data?.message || `HTTP error! status: ${response.status}`
      );
      error.status = response.status;
      error.data = data; // Attach parsed data if available
      throw error;
    }
    // Ensure success flag is present for consistency, if not added by API
    if (data && data.success === undefined && response.ok) {
      data.success = true;
    }
    return data; // Return the parsed JSON data or the created success message
  } catch (error) {
    console.error(
      `API Request Error (${options.method || "GET"} ${url}):`,
      error
    );
    // Rethrow a consistent error structure
    throw {
      success: false,
      message: error.message || "Network or server error occurred.",
      status: error.status || 500,
      data: error.data || {}, // Include data if available
    };
  }
}

// --- Report Review Actions ---

/**
 * Server Action to approve a submitted report via API.
 *
 * @param {string} reportId - The ID of the report to approve.
 * @param {string} token - The authentication token.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the approval operation.
 */
export async function approveReportAction(reportId, token) {
  // Add token parameter
  console.log(`Server Action: Approving report ${reportId} via API`);
  try {
    const data = await fetchWithAuth(
      `/admin/reports/${reportId}/approve`,
      {
        method: "PATCH", // Use PATCH for status updates
        // No body needed for simple approval
      },
      token
    ); // Pass token

    console.log("API Response (Approve Report):", data);

    // Revalidate paths after successful API call
    revalidatePath(`/admin/missions`); // Revalidate list where status might change
    revalidatePath(`/admin/missions/.*/reports`, "page"); // Revalidate all report pages
    revalidatePath("/missions/completed"); // Shopper's completed list
    revalidatePath("/missions/assigned"); // Shopper's assigned list

    return {
      success: true,
      message: data.message || "Report approved successfully.",
    };
  } catch (error) {
    console.error("Server Action Error (Approve Report):", error);
    let userMessage = "Failed to approve report via API.";
    if (error.status === 401)
      userMessage = "Authentication failed. Please log in again.";
    if (error.status === 403)
      userMessage = "Authorization failed. You do not have permission.";
    if (error.status === 400)
      userMessage =
        error.message || "Cannot approve report in its current state.";
    if (error.status === 404) userMessage = "Report not found.";
    return { success: false, message: userMessage, status: error.status };
  }
}

/**
 * Server Action to refuse a submitted report via API.
 *
 * @param {string} reportId - The ID of the report to refuse.
 * @param {string} reason - The reason for refusing the report.
 * @param {string} token - The authentication token.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the refusal operation.
 */
export async function refuseReportAction(reportId, reason, token) {
  // Add token parameter
  console.log(
    `Server Action: Refusing report ${reportId} via API. Reason: ${reason}`
  );
  if (!reason || reason.trim().length === 0) {
    return {
      success: false,
      message: "Refusal reason cannot be empty.",
      status: 400,
    };
  }
  try {
    const data = await fetchWithAuth(
      `/admin/reports/${reportId}/refuse`,
      {
        method: "PATCH", // Use PATCH for status updates
        body: JSON.stringify({ reason }),
      },
      token
    ); // Pass token

    console.log("API Response (Refuse Report):", data);

    revalidatePath(`/admin/missions`);
    revalidatePath(`/admin/missions/.*/reports`, "page");
    revalidatePath("/missions/completed");
    revalidatePath("/missions/assigned");

    return {
      success: true,
      message: data.message || "Report refused successfully.",
    };
  } catch (error) {
    console.error("Server Action Error (Refuse Report):", error);
    let userMessage = "Failed to refuse report via API.";
    if (error.status === 401)
      userMessage = "Authentication failed. Please log in again.";
    if (error.status === 403)
      userMessage = "Authorization failed. You do not have permission.";
    if (error.status === 400)
      userMessage =
        error.message ||
        "Cannot refuse report in its current state or reason missing.";
    if (error.status === 404) userMessage = "Report not found.";
    return { success: false, message: userMessage, status: error.status };
  }
}

// --- Mission Management Actions ---

/**
 * Server Action to delete a mission via API.
 *
 * @param {string} missionId - The ID of the mission to delete.
 * @param {string} token - The authentication token.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the deletion operation.
 */
export async function deleteMissionAction(missionId, token) {
  // Add token parameter
  console.log(`Server Action: Deleting mission ${missionId} via API`);
  try {
    const data = await fetchWithAuth(
      `/admin/missions/${missionId}`,
      {
        method: "DELETE",
      },
      token
    ); // Pass token

    console.log("API Response (Delete Mission):", data);

    revalidatePath("/admin/missions");
    // Revalidate other potentially affected paths
    revalidatePath("/"); // Shopper available list
    revalidatePath("/missions/assigned");
    revalidatePath("/missions/completed");

    return {
      success: true,
      message: data.message || `Mission ${missionId} deleted successfully.`,
    };
  } catch (error) {
    console.error("Server Action Error (Delete Mission):", error);
    let userMessage = "Failed to delete mission via API.";
    if (error.status === 401)
      userMessage = "Authentication failed. Please log in again.";
    if (error.status === 403)
      userMessage = "Authorization failed. You do not have permission.";
    if (error.status === 400)
      userMessage =
        error.message || "Cannot delete mission in its current state.";
    if (error.status === 404) userMessage = "Mission not found.";
    return { success: false, message: userMessage, status: error.status };
  }
}

/**
 * Server Action to assign a mission to a specific user via API.
 *
 * @param {string} missionId - The ID of the mission to assign.
 * @param {string} userId - The ID of the user to assign the mission to.
 * @param {string} token - The authentication token.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the assignment operation.
 */
export async function assignMissionAction(missionId, userIds) {
  console.log(
    `Server Action: Assigning mission ${missionId} to users:`,
    userIds
  );

  try {
    const assignmentUrl = API_BASE_URL + "assignements/multi";
    const assignmentData = await postMissions(
      assignmentUrl,
      { user_id: userIds, mission_id: missionId },
      "assignements",
      API_BASE_URL + "assignements"
    );
    const missionUrl = API_BASE_URL + `missions/${missionId}`;
    const missionResponse = await fetch(missionUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo: userIds, status: "assigned" }),
    });

    const missionResult = await missionResponse.json();
    const assignmentSuccess = assignmentData.success === true;
    const missionSuccess =
      missionResponse.ok && missionResult.success !== false;

    console.log("Assignment success check:", assignmentSuccess);
    console.log("Mission success check:", missionSuccess);

    if (assignmentSuccess && missionSuccess) {
      revalidatePath("/admin/missions");
      revalidatePath("/");
      revalidatePath("/missions/assigned");

      return {
        success: true,
        message: `Mission assignée à ${userIds.length} utilisateur(s) avec succès.`,
      };
    } else {
      const failureReasons = [];
      if (!assignmentSuccess) failureReasons.push("Assignment failed");
      if (!missionSuccess) failureReasons.push("Mission update failed");

      throw new Error(`Échec: ${failureReasons.join(", ")}`);
    }
  } catch (error) {
    console.error("❌ Server Action Error (Assign Mission):", error);
    return {
      success: false,
      message: error.message || "Échec de l'assignation de la mission.",
    };
  }
}

// --- User Management Actions ---

/**
 * Server Action to toggle a user's status (active/inactive) via API.
 *
 * @param {string} userId - The ID of the user to update.
 * @param {string} currentStatus - The current status ('active' or 'inactive').
 * @param {string} token - The authentication token.
 * @returns {Promise<{success: boolean, message: string, newStatus?: string}>} - Result of the toggle operation.
 */
export async function toggleUserStatusAction(userId, currentStatus) {
  // Add token parameter
  console.log(
    `Server Action: Toggling status for user ${userId} from ${currentStatus} via API`
  );
  try {
    // Send the *current* status, backend will determine the new status
    const baseUrl = API_BASE_URL + "users";
    const data = await patchMissions(
      baseUrl + "/" + userId,
      { status: currentStatus === "active" ? "inactive" : "active" },
      "user" + userId,
      baseUrl + "/" + userId
    );
    if (data.success === true) {
      console.log("API Response (Toggle User Status):", data);

      revalidatePath("/admin/users");

      // The API should return the newStatus in the response body
      return {
        success: true,
        message: data.message || `User status updated to ${data.newStatus}.`,
        newStatus: currentStatus === "active" ? "inactive" : "active",
      };
    }
  } catch (error) {
    console.error("Server Action Error (Toggle User Status):", error);
    let userMessage = "Failed to toggle user status via API.";
    if (error.status === 401)
      userMessage = "Authentication failed. Please log in again.";
    if (error.status === 403)
      userMessage = "Authorization failed. You do not have permission.";
    if (error.status === 400)
      userMessage = error.message || "Invalid status provided.";
    if (error.status === 404) userMessage = "User not found.";
    return { success: false, message: userMessage, status: error.status };
  }
}

/**
 * Server Action to update user details via API.
 *
 * @param {string} userId - The ID of the user to update.
 * @param {object} userData - The updated user data (e.g., { name, city, motivation, role, status, birthYear, gender }).
 * @param {string} token - The authentication token.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the update operation.
 */
export async function updateUserAction(userId, userData, token) {
  // Add token parameter
  console.log(
    `Server Action: Updating user ${userId} via API with data:`,
    userData
  );
  try {
    // The API expects snake_case for birth_year
    const apiData = { ...userData };
    if (apiData.birthYear !== undefined) {
      apiData.birth_year = apiData.birthYear;
      delete apiData.birthYear;
    }
    // Remove fields admin shouldn't typically update directly here if needed
    // delete apiData.email;
    // delete apiData.cvUrl;

    const data = await fetchWithAuth(
      `/admin/users/${userId}`,
      {
        method: "PUT",
        body: JSON.stringify(apiData),
      },
      token
    ); // Pass token

    console.log("API Response (Update User):", data);

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath(`/admin/users/${userId}/edit`);

    return {
      success: true,
      message: data.message || `User ${userId} updated successfully.`,
    };
  } catch (error) {
    console.error("Server Action Error (Update User):", error);
    let userMessage = "Failed to update user via API.";
    if (error.status === 401)
      userMessage = "Authentication failed. Please log in again.";
    if (error.status === 403)
      userMessage = "Authorization failed. You do not have permission.";
    if (error.status === 400)
      userMessage = error.message || "Invalid data provided for update.";
    if (error.status === 404) userMessage = "User not found.";
    return { success: false, message: userMessage, status: error.status };
  }
}

// --- Application Management Actions ---

export async function approveApplicationAction(
  applicationId,
  missionId,
  userId,
  assignmentInfo
) {
  console.log(`Server Action: Approving application ${assignmentInfo}`);

  if (userId && missionId && applicationId) {
    // Simulate network delay
    //await new Promise((resolve) => setTimeout(resolve, 500));
    const appUrl = API_BASE_URL + "applications/";
    const missionUrl = API_BASE_URL + "missions/";
    const assUrl = API_BASE_URL + "assignements";
    const [app, missions, ass] = await Promise.all([
      await patchMissions(
        appUrl + "patch/" + applicationId,
        { status: "approved" },
        "applications",
        appUrl
      ),
      await patchMissions(
        missionUrl + "patch/" + missionId,
        { status: "assigned" },
        "missions",
        missionUrl
      ),
      await postMissions(
        assUrl,
        {
          mission_id: missionId,
          user_id: userId,
          nomMagazin: assignmentInfo.nomMagazin,
          specificStoreAddress: assignmentInfo.specificStoreAddress,
          dateTimeMission: assignmentInfo.dateTimeMission,
          scenario: assignmentInfo.scenario,
        },
        "assignements",
        assUrl
      ),
    ]);
    if (
      app.status === "success" &&
      missions.status === "success" &&
      ///
      //ass.status === "success"
      ass.message === "success"
    ) {
      // Revalidate paths
      revalidatePath("/admin/applications");
      revalidatePath("/admin/missions");
      revalidatePath("/"); // Shopper available list
      revalidatePath("/missions/assigned"); // Shopper's assigned list

      return {
        success: true,
        message: `Application for ${userId} approved. Mission ${missionId} assigned.`,
      };
    } else {
      return {
        success: false,
        message: `Failed`,
      };
    }
  } else {
    console.log("errrrooorrrrrr");
  }
}

export async function refuseApplicationAction(applicationId, reason) {
  console.log(
    `Server Action: Refusing application ${applicationId}. Reason: ${reason}`
  );

  if (!reason || reason.trim().length === 0) {
    console.error("Server Action: Refusal reason cannot be empty.");
    return { success: false, message: "Refusal reason cannot be empty." };
  }

  try {
    // Use your existing API pattern like the other functions
    const appUrl = API_BASE_URL + "applications/";

    const result = await patchMissions(
      appUrl + "patch/" + applicationId,
      { status: "refused", refusal_reason: reason },
      "applications",
      appUrl
    );

    if (result.status === "success") {
      // Revalidate paths
      revalidatePath("/admin/applications");
      revalidatePath("/admin/missions");
      revalidatePath("/"); // Shopper available list

      return {
        success: true,
        message: `Application refused successfully.`,
      };
    } else {
      return {
        success: false,
        message: result.message || "Failed to refuse application.",
      };
    }
  } catch (error) {
    console.error("Server Action Error (Refuse Application):", error);
    return {
      success: false,
      message: error.message || "Failed to refuse application.",
    };
  }
}

// --- Mission Creation and Update Actions ---

/**
 * Server Action to create a new mission via API.
 *
 * @param {object} missionData - Data for the new mission (title, description, etc.).
 * @param {string} token - The authentication token.
 * @returns {Promise<{success: boolean, message: string, missionId?: number}>} - Result of the creation operation.
 */
export async function createMissionAction(missionData, token) {
  // Add token parameter
  console.log(
    `Server Action: Creating new mission via API with data:`,
    missionData
  );
  try {
    const data = await fetchWithAuth(
      `/admin/missions`,
      {
        method: "POST",
        body: JSON.stringify(missionData),
      },
      token
    ); // Pass token

    console.log("API Response (Create Mission):", data);

    revalidatePath("/admin/missions");
    revalidatePath("/"); // Available missions list for shoppers

    return {
      success: true,
      message: data.message || "Mission created successfully.",
      missionId: data.missionId, // Ensure API returns the new ID
    };
  } catch (error) {
    console.error("Server Action Error (Create Mission):", error);
    let userMessage = "Failed to create mission via API.";
    if (error.status === 401)
      userMessage = "Authentication failed. Please log in again.";
    if (error.status === 403)
      userMessage = "Authorization failed. You do not have permission.";
    if (error.status === 400)
      userMessage = error.message || "Invalid mission data provided.";
    return { success: false, message: userMessage, status: error.status };
  }
}

/**
 * Server Action to update mission details via API.
 *
 * @param {string} missionId - The ID of the mission to update.
 * @param {object} missionData - The updated mission data.
 * @param {string} token - The authentication token.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the update operation.
 */
export async function updateMissionAction(missionId, missionData, token) {
  // Add token parameter
  console.log(
    `Server Action: Updating mission ${missionId} via API with data:`,
    missionData
  );
  try {
    const data = await fetchWithAuth(
      `/admin/missions/${missionId}`,
      {
        method: "PUT",
        body: JSON.stringify(missionData),
      },
      token
    ); // Pass token

    console.log("API Response (Update Mission):", data);

    revalidatePath("/admin/missions");
    revalidatePath(`/admin/missions/${missionId}/edit`);
    // Also revalidate lists where mission might appear
    revalidatePath("/");
    revalidatePath("/missions/assigned");
    revalidatePath("/missions/completed");

    return {
      success: true,
      message: data.message || `Mission ${missionId} updated successfully.`,
    };
  } catch (error) {
    console.error("Server Action Error (Update Mission):", error);
    let userMessage = "Failed to update mission via API.";
    if (error.status === 401)
      userMessage = "Authentication failed. Please log in again.";
    if (error.status === 403)
      userMessage = "Authorization failed. You do not have permission.";
    if (error.status === 400)
      userMessage = error.message || "Invalid data provided for update.";
    if (error.status === 404) userMessage = "Mission not found.";
    return { success: false, message: userMessage, status: error.status };
  }
}
