"use client";

import { api } from "@/services/fetchData.js";
// Base URL for the backend API (should be in environment variables)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";

// =========================
// REPORTS
// =========================

export const approveReportAction = async (reportId) => {
  console.log(`Approving report ${reportId} via API`);

  try {
    const { data } = await api.patch(
      `${API_BASE_URL}admin/reports/${reportId}/approve`,
    );

    return {
      success: true,
      message: data.message || "Report approved successfully.",
    };
  } catch (error) {
    console.error("Error (Approve Report):", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to approve report via API.",
    };
  }
};

export const refuseReportAction = async (reportId, reason) => {
  console.log(`Refusing report ${reportId}. Reason: ${reason}`);

  if (!reason?.trim()) {
    return { success: false, message: "Refusal reason cannot be empty." };
  }

  try {
    const { data } = await api.patch(
      `${API_BASE_URL}admin/reports/${reportId}/refuse`,
      {
        reason,
      },
    );

    return {
      success: true,
      message: data.message || "Report refused successfully.",
    };
  } catch (error) {
    console.error("Error (Refuse Report):", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to refuse report via API.",
    };
  }
};

// =========================
// USERS
// =========================

export const toggleUserStatusAction = async (userId, currentStatus) => {
  const newStatus = currentStatus === "active" ? "inactive" : "active";

  try {
    const { data } = await api.patch(`${API_BASE_URL}users/${userId}`, {
      status: newStatus,
    });

    return {
      success: true,
      message: data.message || `User status updated to ${newStatus}.`,
      newStatus,
    };
  } catch (error) {
    console.error("Error (Toggle User Status):", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to toggle user status.",
    };
  }
};

export const updateUserAction = async (userId, userData) => {
  try {
    const apiData = { ...userData };
    if (apiData.birthYear !== undefined) {
      apiData.birth_year = apiData.birthYear;
      delete apiData.birthYear;
    }

    const { data } = await api.put(
      `${API_BASE_URL}admin/users/${userId}`,
      apiData,
    );

    return {
      success: true,
      message: data.message || `User ${userId} updated successfully.`,
    };
  } catch (error) {
    console.error("Error (Update User):", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update user.",
    };
  }
};

// =========================
// MISSIONS
// =========================

export const createMissionAction = async (missionData) => {
  try {
    const { data } = await api.post(
      `${API_BASE_URL}admin/missions`,
      missionData,
    );

    return {
      success: true,
      message: data.message || "Mission created successfully.",
      missionId: data.missionId,
    };
  } catch (error) {
    console.error("Error (Create Mission):", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create mission.",
    };
  }
};

export const updateMissionAction = async (missionId, missionData) => {
  try {
    const { data } = await api.put(
      `${API_BASE_URL}admin/missions/${missionId}`,
      missionData,
    );

    return {
      success: true,
      message: data.message || `Mission ${missionId} updated successfully.`,
    };
  } catch (error) {
    console.error("Error (Update Mission):", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update mission.",
    };
  }
};

export const deleteMissionAction = async (missionId) => {
  try {
    const { data } = await api.delete(
      `${API_BASE_URL}admin/missions/${missionId}`,
    );

    return {
      success: true,
      message: data.message || `Mission ${missionId} deleted successfully.`,
    };
  } catch (error) {
    console.error("Error (Delete Mission):", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete mission.",
    };
  }
};

export const assignMissionAction = async (missionId, userIds, storeId) => {
  try {
    const payload = {
      mission_id: parseInt(missionId, 10),
      user_id: (Array.isArray(userIds) ? userIds : [userIds])
        .map((u) => parseInt(u, 10))
        .filter((u) => !isNaN(u) && u > 0),
    };
    if (storeId) {
      payload.store_id = parseInt(storeId, 10);
    }

    const response = await api.post("assignements/multi", payload);

    const data = response?.data;
    if (data?.success || response?.status === 200 || response?.status === 201) {
      return {
        success: true,
        message: `Mission assignée avec succès.`,
      };
    } else {
      throw new Error(
        data?.message || data?.error || "Échec de l'assignation de la mission.",
      );
    }
  } catch (error) {
    console.error("Error (Assign Mission):", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Échec de l'assignation de la mission.",
    };
  }
};

// =========================
// APPLICATIONS
// =========================

export const approveApplicationAction = async (
  applicationId,
  missionId,
  userId,
  assignmentInfo = {},
) => {
  if (!applicationId || !missionId || !userId) {
    return {
      success: false,
      message: "Application ID, Mission ID, and User ID are required.",
    };
  }

  try {
    const patchBody = { status: "approved" };
    if (assignmentInfo?.store_id) {
      patchBody.stores = JSON.stringify([assignmentInfo.store_id]);
    }
    if (assignmentInfo?.time_slot) {
      patchBody.time_slot = assignmentInfo.time_slot;
    }
    if (assignmentInfo?.mission_date) {
      patchBody.mission_date = assignmentInfo.mission_date;
    }

    const { data: appData } = await api.patch(
      `${API_BASE_URL}applications/patch/${applicationId}`,
      patchBody,
    );

    if (appData?.status === "success" || appData?.success) {
      return {
        success: true,
        message: `Candidature approuvée avec succès. La mission est assignée au shopper.`,
      };
    } else {
      return {
        success: false,
        message: appData?.message || "Échec de l'approbation de la candidature.",
      };
    }
  } catch (error) {
    console.error("Error (Approve Application):", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Échec de l'approbation de la candidature.",
    };
  }
};

export const refuseApplicationAction = async (applicationId, reason) => {
  if (!reason?.trim()) {
    return { success: false, message: "Refusal reason cannot be empty." };
  }

  try {
    const { data } = await api.patch(
      `${API_BASE_URL}applications/patch/${applicationId}`,
      {
        status: "refused",
        refusal_reason: reason,
      },
    );

    if (data.status === "success") {
      return { success: true, message: "Application refused successfully." };
    } else {
      return {
        success: false,
        message: data.message || "Failed to refuse application.",
      };
    }
  } catch (error) {
    console.error("Error (Refuse Application):", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to refuse application.",
    };
  }
};

export async function addStoreAction(storeData) {
  try {
    const { data } = await api.post("stores", storeData);
    return { success: true, ...data };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Échec de l'ajout du magasin",
    };
  }
}

export async function updateStoreAction(id, storeData) {
  try {
    const { data } = await api.put(`stores/${id}`, storeData);
    return { success: true, ...data };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Échec de la modification du magasin",
    };
  }
}

export async function toggleStoreStatusAction(id) {
  try {
    const { data } = await api.patch(`stores/${id}/toggle-status`);
    return { success: true, ...data };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Échec de mise à jour du statut",
    };
  }
}

export async function batchAddStoresAction(stores) {
  try {
    const { data } = await api.post("stores/batch", stores);
    return { success: true, ...data };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Échec de l'import des magasins",
    };
  }
}
