'use server';

import { revalidatePath } from 'next/cache';
import { mockMissions, mockReports } from '@/lib/mock-data'; // Import mock data to manipulate
import { mockUsers } from '../users/users-mock.js'; // Import mock users

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

  // Check if all reports for this mission (assuming multiple assignees) are approved
  // For simplicity, we'll just update mission status if THIS report is approved for now.
  // A real implementation might need more complex logic based on all assignees' reports.
  const missionIndex = mockMissions.findIndex(m => m.id === missionId);
  if (missionIndex !== -1) {
      // We mark mission as approved once one report is approved.
      // Adjust this logic based on actual requirements (e.g., all reports must be approved)
      mockMissions[missionIndex].status = 'approved';
       // Optionally clear assignedTo or move to a 'completedBy' array on approval.
       // For now, we leave assignedTo intact.
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

  // Update mission status to 'refused' if this report is refused.
  // This might need refinement if multiple users can have reports for the same mission.
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

  // --- Update Mock Data ---
   const userIndex = mockUsers.findIndex(u => u.id === userId);
   if (userIndex === -1) {
       console.error("Server Action: User not found.");
       return { success: false, message: "User not found." };
   }
   // Simple update for simulation
   mockUsers[userIndex].status = newStatus;
  // --- End Mock Data Update ---

  console.log(`Server Action: User ${userId} status updated to ${newStatus} (simulated).`);
  revalidatePath('/admin/users'); // Revalidate the user list page
  return { success: true, message: `User ${userId} status updated to ${newStatus} (simulated).`, newStatus };

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

    // --- Update Mock Data ---
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        console.error("Server Action: User not found for update.");
        return { success: false, message: "User not found." };
    }

    // Update the user object in the mock array
    // Be careful about which fields are allowed to be updated (e.g., don't overwrite email from form if it's read-only)
    const updatedUser = {
        ...mockUsers[userIndex], // Start with existing data
        ...userData, // Apply updates from form
        email: mockUsers[userIndex].email, // Ensure email is not changed by admin form
    };
     mockUsers[userIndex] = updatedUser;
    // --- End Mock Data Update ---


    console.log(`Server Action: User ${userId} updated successfully (simulated).`);
    // Revalidate relevant paths
    revalidatePath('/admin/users'); // Revalidate the user list
    revalidatePath(`/admin/users/${userId}`); // Revalidate the user detail page
    revalidatePath(`/admin/users/${userId}/edit`); // Revalidate the edit page itself

    return { success: true, message: `User ${userId} updated successfully (simulated).` };

}

/**
 * Server Action to assign a mission to a specific user.
 * This action is designed to be called for *each* user being assigned.
 * Updates mock data for simulation, handling multiple assignees.
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
  const userExists = mockUsers.some(u => u.id === userId && u.role === 'shopper' && u.status === 'active');

  if (missionIndex === -1) {
    console.error("Server Action: Mission not found.");
    return { success: false, message: "Mission not found." };
  }

  const mission = mockMissions[missionIndex];

  if (!userExists) {
       console.error(`Server Action: User ${userId} not found, not active, or not a shopper.`);
       return { success: false, message: `User ${userId} cannot be assigned.` };
   }

   // Ensure assignedTo is an array before pushing
   if (!Array.isArray(mission.assignedTo)) {
       // If it exists but is not an array, initialize it. If it doesn't exist, initialize it.
       mission.assignedTo = mission.assignedTo ? [mission.assignedTo] : [];
   }

   // Check if user is already assigned
   if (mission.assignedTo.includes(userId)) {
        console.log(`Server Action: User ${userId} is already assigned to mission ${missionId}.`);
       // Consider this a success, or return a specific message
       return { success: true, message: `User ${userId} is already assigned.` };
   }

   // Allow assignment only if mission is 'available' OR 'assigned' (to add more users)
   if (mission.status !== 'available' && mission.status !== 'assigned') {
        console.error(`Server Action: Mission ${missionId} is not available or assigned (status: ${mission.status}). Cannot assign.`);
        return { success: false, message: `Mission status (${mission.status}) prevents assignment.` };
   }


  // Update mission status to 'assigned' if it was 'available'
  if (mission.status === 'available') {
       mission.status = 'assigned';
  }

   // Add user to the assignedTo array
  mission.assignedTo.push(userId);

  // Update the mission in the mock array
   mockMissions[missionIndex] = mission;
  // --- End Mock Data Update ---

  console.log(`Server Action: Mission ${missionId} assigned to user ${userId} successfully. Current assignees: ${mission.assignedTo.join(', ')} (simulated).`);

  // Revalidate relevant paths
  revalidatePath('/admin/missions'); // Admin list
  revalidatePath('/'); // Shopper available list (mission should disappear or show 'assigned')
  revalidatePath('/missions/assigned'); // Shopper assigned list (mission should appear)

  return { success: true, message: `Mission assigned to user ${userId} successfully (simulated).` };
}

    