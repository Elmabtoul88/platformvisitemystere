'use server';

import { revalidatePath } from 'next/cache';
import { mockMissions, mockReports } from '@/lib/mock-data'; // Import mock data to manipulate

/**
 * Server Action to approve a submitted report.
 * Updates mock data for simulation.
 *
 * @param {string} reportId - The ID of the report to approve.
 * @param {string} missionId - The ID of the associated mission.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the approval operation.
 */
export async function approveReportAction(reportId, missionId) {
  console.log(`Server Action: Approving report ${reportId} for mission ${missionId}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // --- Update Mock Data ---
  const reportIndex = mockReports.findIndex(r => r.id === reportId && r.missionId === missionId && r.status === 'submitted');

  if (reportIndex === -1) {
      console.error("Server Action: Report not found or not in 'submitted' status.");
      return { success: false, message: "Report not found or cannot be approved." };
  }

  mockReports[reportIndex].status = 'approved';
  // For simplicity, assume approving the report also marks the mission as approved.
  // In a real scenario, you might check if all assigned reports are approved.
  const missionIndex = mockMissions.findIndex(m => m.id === missionId);
  if (missionIndex !== -1) {
      mockMissions[missionIndex].status = 'approved';
      // Optionally remove assignedTo if needed after approval? Depends on flow.
      // mockMissions[missionIndex].assignedTo = null;
  }
  // --- End Mock Data Update ---

  console.log("Server Action: Report approved successfully (simulated).");

  // Revalidate relevant paths
  revalidatePath(`/admin/missions/${missionId}/reports`);
  revalidatePath('/admin/missions');
  revalidatePath('/missions/completed'); // Shopper's completed list
  revalidatePath('/'); // Main mission list for shopper

  return { success: true, message: "Report approved and payment processed (simulated)." };

}

/**
 * Server Action to refuse a submitted report.
 * Updates mock data for simulation.
 *
 * @param {string} reportId - The ID of the report to refuse.
 * @param {string} missionId - The ID of the associated mission.
 * @param {string} reason - The reason for refusing the report.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the refusal operation.
 */
export async function refuseReportAction(reportId, missionId, reason) {
  console.log(`Server Action: Refusing report ${reportId} for mission ${missionId}. Reason: ${reason}`);

  if (!reason || reason.trim().length === 0) {
      return { success: false, message: "Refusal reason cannot be empty." };
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // --- Update Mock Data ---
  const reportIndex = mockReports.findIndex(r => r.id === reportId && r.missionId === missionId && r.status === 'submitted');

  if (reportIndex === -1) {
      console.error("Server Action: Report not found or not in 'submitted' status.");
      return { success: false, message: "Report not found or cannot be refused." };
  }

  mockReports[reportIndex].status = 'refused';
  mockReports[reportIndex].refusalReason = reason;

  // Update mission status to 'refused' as well.
  const missionIndex = mockMissions.findIndex(m => m.id === missionId);
  if (missionIndex !== -1) {
      mockMissions[missionIndex].status = 'refused';
      // Keep assignedTo so the shopper knows which mission was refused.
  }
  // --- End Mock Data Update ---

  console.log("Server Action: Report refused successfully (simulated).");

  // Revalidate relevant paths
  revalidatePath(`/admin/missions/${missionId}/reports`);
  revalidatePath('/admin/missions');
  // Revalidate shopper's assigned missions if they need to resubmit or view refusal
  revalidatePath('/missions/assigned'); // Also revalidate assigned list

  return { success: true, message: "Report refused and shopper notified (simulated)." };

}


/**
 * Server Action to delete a mission.
 * Updates mock data for simulation.
 *
 * @param {string} missionId - The ID of the mission to delete.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the deletion operation.
 */
export async function deleteMissionAction(missionId) {
    console.log(`Server Action: Deleting mission ${missionId}`);

    // --- Prevent deletion if assigned/submitted (optional server-side check) ---
    const missionToDelete = mockMissions.find(m => m.id === missionId);
    if (missionToDelete && (missionToDelete.status === 'assigned' || missionToDelete.status === 'submitted')) {
        console.error(`Server Action: Cannot delete mission ${missionId} because it is currently ${missionToDelete.status}.`);
        return { success: false, message: `Cannot delete mission while it is ${missionToDelete.status}.` };
    }
    // ---

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // --- Update Mock Data ---
    const initialMissionLength = mockMissions.length;
    const initialReportLength = mockReports.length;

    // Filter out the mission
    const updatedMissions = mockMissions.filter(m => m.id !== missionId);
    // Filter out associated reports
    const updatedReports = mockReports.filter(r => r.missionId !== missionId);

    // Check if anything was actually deleted
    const missionDeleted = updatedMissions.length < initialMissionLength;

    // Update the original arrays (note: this direct mutation is for simulation only)
    mockMissions.length = 0;
    mockMissions.push(...updatedMissions);
    mockReports.length = 0;
    mockReports.push(...updatedReports);
    // --- End Mock Data Update ---


    if (missionDeleted) {
        console.log(`Server Action: Mission ${missionId} and associated reports deleted successfully (simulated).`);
        // Revalidate the main admin missions list
        revalidatePath('/admin/missions');
        // Revalidate relevant report review pages just in case
        revalidatePath(`/admin/missions/${missionId}/reports`);

        return { success: true, message: `Mission ${missionId} deleted successfully (simulated).` };
    } else {
        console.error(`Server Action: Failed to delete mission ${missionId} (simulated, not found).`);
        return { success: false, message: `Failed to delete mission ${missionId} (Mission not found).` };
    }
}


/**
 * Server Action to toggle a user's status (active/inactive).
 *
 * @param {string} userId - The ID of the user to update.
 * @param {string} currentStatus - The current status ('active' or 'inactive').
 * @returns {Promise<{success: boolean, message: string, newStatus?: string}>} - Result of the toggle operation.
 */
export async function toggleUserStatusAction(userId, currentStatus) {
  console.log(`Server Action: Toggling status for user ${userId} from ${currentStatus}`);

  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // --- TODO: Replace simulation with actual backend logic ---
  // 1. Validate userId.
  // 2. Check permissions (ensure current user is admin).
  // 3. Fetch the user from the database.
  // 4. Update the user's status field in the database to `newStatus`.
  // 5. Handle potential errors during database operations.
  // ---

  // Simulate success
  const success = true;

  if (success) {
    console.log(`Server Action: User ${userId} status updated to ${newStatus} (simulated).`);
    revalidatePath('/admin/users'); // Revalidate the user list page
    return { success: true, message: `User ${userId} status updated to ${newStatus} (simulated).`, newStatus };
  } else {
    console.error(`Server Action: Failed to toggle status for user ${userId} (simulated).`);
    return { success: false, message: `Failed to toggle status for user ${userId} (simulated server error).` };
  }
}

/**
 * Server Action to update user details.
 *
 * @param {string} userId - The ID of the user to update.
 * @param {object} userData - The updated user data (e.g., { name, email, city, motivation, role, status }).
 * @returns {Promise<{success: boolean, message: string}>} - Result of the update operation.
 */
export async function updateUserAction(userId, userData) {
    console.log(`Server Action: Updating user ${userId} with data:`, userData);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // --- TODO: Replace simulation with actual backend logic ---
    // 1. Validate userId and userData.
    // 2. Check permissions (ensure current user is admin).
    // 3. Fetch the user from the database.
    // 4. Update the user's fields in the database with the provided `userData`.
    //    - Be careful about which fields are allowed to be updated (e.g., updating email might require verification).
    //    - Handle role and status changes appropriately.
    // 5. Handle potential errors during database operations.
    // ---

    // Simulate success
    const success = true;

    if (success) {
        console.log(`Server Action: User ${userId} updated successfully (simulated).`);
        // Revalidate relevant paths
        revalidatePath('/admin/users'); // Revalidate the user list
        revalidatePath(`/admin/users/${userId}`); // Revalidate the user detail page
        revalidatePath(`/admin/users/${userId}/edit`); // Revalidate the edit page itself

        return { success: true, message: `User ${userId} updated successfully (simulated).` };
    } else {
        console.error(`Server Action: Failed to update user ${userId} (simulated).`);
        return { success: false, message: `Failed to update user ${userId} (simulated server error).` };
    }
}

/**
 * Server Action to assign a mission to a specific user.
 * Updates mock data for simulation.
 *
 * @param {string} missionId - The ID of the mission to assign.
 * @param {string} userId - The ID of the user to assign the mission to.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the assignment operation.
 */
export async function assignMissionAction(missionId, userId) {
  console.log(`Server Action: Assigning mission ${missionId} to user ${userId}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // --- Update Mock Data ---
  const missionIndex = mockMissions.findIndex(m => m.id === missionId);

  if (missionIndex === -1) {
    console.error("Server Action: Mission not found.");
    return { success: false, message: "Mission not found." };
  }

  if (mockMissions[missionIndex].status !== 'available') {
    console.error(`Server Action: Mission ${missionId} is not available for assignment (status: ${mockMissions[missionIndex].status}).`);
    return { success: false, message: `Mission is not available for assignment.` };
  }

  // TODO: Add check if user exists and is active/shopper

  mockMissions[missionIndex].status = 'assigned';
  mockMissions[missionIndex].assignedTo = userId;
  // --- End Mock Data Update ---

  console.log(`Server Action: Mission ${missionId} assigned to user ${userId} successfully (simulated).`);

  // Revalidate relevant paths
  revalidatePath('/admin/missions'); // Admin list
  revalidatePath('/'); // Shopper available list (mission should disappear)
  revalidatePath('/missions/assigned'); // Shopper assigned list (mission should appear)

  return { success: true, message: `Mission assigned to user ${userId} successfully (simulated).` };
}
