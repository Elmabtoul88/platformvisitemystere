
'use server';

import { revalidatePath } from 'next/cache';
import { mockMissions, mockReports, mockUsers } from '@/lib/mock-data'; // Import all necessary mock data

/**
 * Server Action to approve a submitted report.
 * Updates mock data for simulation. Ensures mission status reflects approval.
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

  // Update report status
  mockReports[reportIndex].status = 'approved';

  // Update mission status - mark mission as 'approved' if ANY report is approved.
  // Adjust this logic based on requirements (e.g., all reports must be approved).
  const missionIndex = mockMissions.findIndex(m => m.id === missionId);
  if (missionIndex !== -1) {
      mockMissions[missionIndex].status = 'approved';
      // Optionally: Clear assignedTo or manage completed users if needed.
      // For simplicity, we keep assignedTo intact for now.
  } else {
      console.warn(`Server Action: Mission ${missionId} not found during report approval.`);
  }
  // --- End Mock Data Update ---

  console.log("Server Action: Report approved successfully (simulated).");

  // Revalidate paths for both admin and shopper views
  revalidatePath(`/admin/missions/${missionId}/reports`); // Admin report review page
  revalidatePath('/admin/missions'); // Admin mission list
  revalidatePath('/missions/completed'); // Shopper's completed list
  revalidatePath('/missions/assigned'); // Shopper's assigned list (mission should disappear)
  revalidatePath('/'); // Shopper available list (should not show approved missions)

  return { success: true, message: "Report approved and payment processed (simulated)." };
}

/**
 * Server Action to refuse a submitted report.
 * Updates mock data for simulation. Marks mission as refused if this report is refused.
 *
 * @param {string} reportId - The ID of the report to refuse.
 * @param {string} missionId - The ID of the associated mission.
 * @param {string} reason - The reason for refusing the report.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the refusal operation.
 */
export async function refuseReportAction(reportId, missionId, reason) {
  console.log(`Server Action: Refusing report ${reportId} for mission ${missionId}. Reason: ${reason}`);

  if (!reason || reason.trim().length === 0) {
      console.error("Server Action: Refusal reason cannot be empty.");
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

  // Update report status and reason
  mockReports[reportIndex].status = 'refused';
  mockReports[reportIndex].refusalReason = reason;

  // Update mission status to 'refused'.
  // This logic assumes refusing one report refuses the mission for that user.
  // More complex logic might be needed if multiple assignees can retry.
  const missionIndex = mockMissions.findIndex(m => m.id === missionId);
  if (missionIndex !== -1) {
      mockMissions[missionIndex].status = 'refused';
      // Keep assignedTo so the shopper knows which mission was refused.
  } else {
      console.warn(`Server Action: Mission ${missionId} not found during report refusal.`);
  }
  // --- End Mock Data Update ---

  console.log("Server Action: Report refused successfully (simulated).");

  // Revalidate paths for both admin and shopper views
  revalidatePath(`/admin/missions/${missionId}/reports`); // Admin report review page
  revalidatePath('/admin/missions'); // Admin mission list
  revalidatePath('/missions/assigned'); // Shopper assigned list (mission might remain or change status)
  // Consider revalidating a potential "Refused Missions" page for shoppers if it exists

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

    const missionIndex = mockMissions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) {
        console.error(`Server Action: Mission ${missionId} not found.`);
        return { success: false, message: "Mission not found." };
    }

    const missionToDelete = mockMissions[missionIndex];

    // Prevent deletion if assigned/submitted (can be adjusted based on rules)
    if (missionToDelete.status === 'assigned' || missionToDelete.status === 'submitted') {
        console.error(`Server Action: Cannot delete mission ${missionId} because it is currently ${missionToDelete.status}.`);
        return { success: false, message: `Cannot delete mission while it is ${missionToDelete.status}. Consider refusing or completing first.` };
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // --- Update Mock Data ---
    // Remove the mission
    mockMissions.splice(missionIndex, 1);

    // Remove associated reports (more efficient than filter+reassign)
    let i = mockReports.length;
    while (i--) {
        if (mockReports[i].missionId === missionId) {
            mockReports.splice(i, 1);
        }
    }
    // --- End Mock Data Update ---

    console.log(`Server Action: Mission ${missionId} and associated reports deleted successfully (simulated).`);

    // Revalidate paths for both admin and relevant shopper views
    revalidatePath('/admin/missions');
    revalidatePath(`/admin/missions/${missionId}/reports`); // Revalidate specific admin report page
    revalidatePath('/'); // Shopper available list
    revalidatePath('/missions/assigned'); // Shopper assigned list
    revalidatePath('/missions/completed'); // Shopper completed list

    return { success: true, message: `Mission ${missionId} deleted successfully.` };
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
   mockUsers[userIndex].status = newStatus;
   // --- End Mock Data Update ---

  console.log(`Server Action: User ${userId} status updated to ${newStatus} (simulated).`);

  // Revalidate only the admin user list page
  revalidatePath('/admin/users');
  // Revalidate mission assignment dialog's user list implicitly via mission page revalidation if needed

  return { success: true, message: `User ${userId} status updated to ${newStatus}.`, newStatus };
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

    // Update the user object, preserving read-only fields like email
    mockUsers[userIndex] = {
        ...mockUsers[userIndex], // Start with existing data
        ...userData, // Apply updates from form
        email: mockUsers[userIndex].email, // Ensure email is not changed
    };
    // --- End Mock Data Update ---

    console.log(`Server Action: User ${userId} updated successfully (simulated).`);

    // Revalidate relevant admin user pages
    revalidatePath('/admin/users'); // User list
    revalidatePath(`/admin/users/${userId}`); // User detail page
    revalidatePath(`/admin/users/${userId}/edit`); // Edit page itself

    return { success: true, message: `User ${userId} updated successfully.` };
}

/**
 * Server Action to assign a mission to a specific user.
 * Handles multiple assignees by ensuring `assignedTo` is an array.
 *
 * @param {string} missionId - The ID of the mission to assign.
 * @param {string} userId - The ID of the user to assign the mission to.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the assignment operation.
 */
export async function assignMissionAction(missionId, userId) {
  console.log(`Server Action: Assigning mission ${missionId} to user ${userId}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // --- Validate Input and Mission Status ---
  const missionIndex = mockMissions.findIndex(m => m.id === missionId);
  if (missionIndex === -1) {
    console.error("Server Action: Mission not found.");
    return { success: false, message: "Mission not found." };
  }

  const mission = mockMissions[missionIndex];

  // Allow assignment only if mission is 'available' OR 'assigned' (to add more users)
   if (mission.status !== 'available' && mission.status !== 'assigned') {
        console.error(`Server Action: Mission ${missionId} is not available or assigned (status: ${mission.status}). Cannot assign.`);
        return { success: false, message: `Mission status (${mission.status}) prevents assignment.` };
   }

  // Validate User
   const userExists = mockUsers.some(u => u.id === userId && u.role === 'shopper' && u.status === 'active');
   if (!userExists) {
       console.error(`Server Action: User ${userId} not found, not active, or not a shopper.`);
       return { success: false, message: `User ${userId} cannot be assigned.` };
   }
  // --- End Validation ---

  // --- Update Mock Data ---
   // Ensure assignedTo is an array
   if (!Array.isArray(mission.assignedTo)) {
       mission.assignedTo = mission.assignedTo ? [mission.assignedTo] : []; // Initialize if not array or doesn't exist
   }

   // Check if user is already assigned
   if (mission.assignedTo.includes(userId)) {
        console.log(`Server Action: User ${userId} is already assigned to mission ${missionId}.`);
       return { success: true, message: `User ${userId} is already assigned.` }; // Treat as success
   }

   // Update mission status to 'assigned' if it was 'available'
  if (mission.status === 'available') {
       mission.status = 'assigned';
  }

   // Add user to the assignedTo array
  mission.assignedTo.push(userId);

  // Update the mission in the mock array (optional, as we mutated directly)
  // mockMissions[missionIndex] = mission; // This line is technically redundant if mutating directly
  // --- End Mock Data Update ---

  console.log(`Server Action: Mission ${missionId} assigned to user ${userId}. Current assignees: ${mission.assignedTo.join(', ')} (simulated).`);

  // Revalidate paths for both admin and shopper views
  revalidatePath('/admin/missions'); // Admin mission list
  revalidatePath('/'); // Shopper available list (mission should disappear)
  revalidatePath('/missions/assigned'); // Shopper assigned list (mission should appear)

  return { success: true, message: `Mission assigned to user ${userId} successfully.` };
}
