

'use server';

import { revalidatePath } from 'next/cache';
import { mockMissions, mockReports, mockApplications, mockAssignments } from '@/lib/mock-data'; // Import all mock data
import { mockUsers } from '@/app/admin/users/users-mock.js'; // Use mockUsers from the consolidated file

/**
 * Server Action to approve a shopper's application for a mission with specific details.
 * Creates a new assignment in mockAssignments.
 *
 * @param {string} applicationId - The ID of the application to approve.
 * @param {object} assignmentDetails - The specific details for this assignment.
 * @param {string} assignmentDetails.specificStoreAddress - The specific store address.
 * @param {string} assignmentDetails.specificScenario - The specific scenario/description.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the approval operation.
 */
export async function approveApplicationAction(applicationId, assignmentDetails) {
    console.log(`Server Action: Approving application ${applicationId} with details:`, assignmentDetails);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const applicationIndex = mockApplications.findIndex(app => app.id === applicationId);
    if (applicationIndex === -1) {
        console.error("Server Action: Application not found for approval.");
        return { success: false, message: "Application not found." };
    }

    const application = mockApplications[applicationIndex];
    if (application.status !== 'pending') {
        console.warn(`Server Action: Application ${applicationId} is not in 'pending' status.`);
        return { success: false, message: `Application is already ${application.status}.` };
    }

    const { mission_id: missionId, user_id: userId } = application;

    const missionIndex = mockMissions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) {
        console.error("Server Action: Mission not found for application approval.");
        return { success: false, message: "Mission not found." };
    }

    // Create a new assignment with the specific details
    const newAssignment = {
        id: `asg-${Date.now()}-${userId}`,
        mission_id: missionId,
        user_id: userId,
        assigned_at: new Date(),
        specificStoreAddress: assignmentDetails.specificStoreAddress,
        specificScenario: assignmentDetails.specificScenario
    };
    mockAssignments.push(newAssignment);
    console.log("Server Action: Created new assignment:", newAssignment);

    const mission = mockMissions[missionIndex];

    // Update mission: remove from appliedBy, add to assignedTo, set status to 'assigned'
    if (Array.isArray(mission.appliedBy)) {
        mission.appliedBy = mission.appliedBy.filter(id => id !== userId);
    }

    if (!Array.isArray(mission.assignedTo)) {
        mission.assignedTo = mission.assignedTo ? [mission.assignedTo] : [];
    }
    if (!mission.assignedTo.includes(userId)) {
        mission.assignedTo.push(userId);
    }
    
    // Mission status becomes 'assigned' as soon as one person is assigned.
    // If it was 'pending_approval' because of other applications, it should now be 'assigned'.
    mission.status = 'assigned';

    // Update application status
    mockApplications[applicationIndex].status = 'approved';

    console.log(`Server Action: Application ${applicationId} approved. New assignment created for user ${userId} on mission ${missionId}.`);

    // Revalidate paths
    revalidatePath('/admin/applications');
    revalidatePath('/admin/missions');
    revalidatePath('/'); // Shopper available list
    revalidatePath('/missions/assigned'); // Shopper's assigned list

    return { success: true, message: `Application for ${userId} approved. Mission ${missionId} assigned.` };
}


/**
 * Server Action to refuse a shopper's application for a mission.
 * Updates mission status if needed and application status.
 *
 * @param {string} applicationId - The ID of the application to refuse.
 * @param {string} reason - The reason for refusing the application.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the refusal operation.
 */
export async function refuseApplicationAction(applicationId, reason) {
    console.log(`Server Action: Refusing application ${applicationId}. Reason: ${reason}`);

    if (!reason || reason.trim().length === 0) {
        console.error("Server Action: Refusal reason cannot be empty.");
        return { success: false, message: "Refusal reason cannot be empty." };
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const applicationIndex = mockApplications.findIndex(app => app.id === applicationId);
    if (applicationIndex === -1) {
        console.error("Server Action: Application not found for refusal.");
        return { success: false, message: "Application not found." };
    }
    
    const application = mockApplications[applicationIndex];
    if (application.status !== 'pending') {
        console.warn(`Server Action: Application ${applicationId} is not in 'pending' status.`);
        return { success: false, message: `Application is already ${application.status}.` };
    }

    const { mission_id: missionId, user_id: userId } = application;

    const missionIndex = mockMissions.findIndex(m => m.id === missionId);
    if (missionIndex !== -1) {
        const mission = mockMissions[missionIndex];
        // Update mission: remove from appliedBy
        if (Array.isArray(mission.appliedBy)) {
            mission.appliedBy = mission.appliedBy.filter(id => id !== userId);
        }

        // If no one else has applied and no one is assigned, set status back to 'available'
        const otherPendingApplications = mockApplications.some(app => app.mission_id === missionId && app.id !== applicationId && app.status === 'pending');
        if (!otherPendingApplications && (!mission.assignedTo || mission.assignedTo.length === 0)) {
            mission.status = 'available';
        }
        console.log(`Server Action: Mission ${missionId} status updated to ${mission.status}.`);
    } else {
        console.warn(`Server Action: Mission ${missionId} not found during application refusal, but proceeding to update application status.`);
    }

    // Update application status
    mockApplications[applicationIndex].status = 'refused';
    mockApplications[applicationIndex].refusal_reason = reason;


    console.log(`Server Action: Application ${applicationId} refused for user ${userId}.`);

    // Revalidate paths
    revalidatePath('/admin/applications');
    revalidatePath('/admin/missions');
    revalidatePath('/'); // Shopper available list

    return { success: true, message: `Application for ${userId} refused.` };
}


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
      // Check if other assignees still have 'submitted' or 'assigned' status for this mission
      const otherAssigneesActive = mockMissions[missionIndex].assignedTo?.some(assigneeId => {
          if (assigneeId === mockReports[reportIndex].userId) return false; // Skip the current user
          const theirReport = mockReports.find(r => r.missionId === missionId && r.userId === assigneeId);
          return !theirReport || theirReport.status === 'submitted' || mockMissions[missionIndex].status === 'assigned';
      });

      if (!otherAssigneesActive) {
        mockMissions[missionIndex].status = 'refused';
      }
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
  revalidatePath('/missions/completed'); // So refused missions also disappear from completed if they were there by mistake
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
    if (missionToDelete.status === 'assigned' || missionToDelete.status === 'submitted' || missionToDelete.status === 'pending_approval') {
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
     // Remove associated applications
    let j = mockApplications.length;
    while (j--) {
        if (mockApplications[j].mission_id === missionId) {
            mockApplications.splice(j, 1);
        }
    }
    // --- End Mock Data Update ---

    console.log(`Server Action: Mission ${missionId} and associated reports/applications deleted successfully (simulated).`);

    // Revalidate paths for both admin and relevant shopper views
    revalidatePath('/admin/missions');
    revalidatePath('/admin/applications'); // Also revalidate applications page
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
  revalidatePath('/admin/missions'); // If user status affects assignability in mission dialogs

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
 * Server Action to assign a mission to specific users.
 * Handles multiple assignees by ensuring `assignedTo` is an array.
 *
 * @param {string} missionId - The ID of the mission to assign.
 * @param {string[]} userIds - An array of user IDs to assign the mission to.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the assignment operation.
 */
export async function assignMissionAction(missionId, userIds) {
  console.log(`Server Action: Assigning mission ${missionId} to users: ${userIds.join(', ')}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // --- Validate Input and Mission Status ---
  const missionIndex = mockMissions.findIndex(m => m.id === missionId);
  if (missionIndex === -1) {
    console.error("Server Action: Mission not found.");
    return { success: false, message: "Mission not found." };
  }

  const mission = mockMissions[missionIndex];

   if (!['available', 'assigned', 'pending_approval'].includes(mission.status)) {
        console.error(`Server Action: Mission ${missionId} is not in a state that allows assignment (status: ${mission.status}).`);
        return { success: false, message: `Mission status (${mission.status}) prevents assignment.` };
   }

  // Validate Users
   const validUserIds = [];
   const invalidUserIds = [];
   userIds.forEach(userId => {
       const userExists = mockUsers.some(u => u.id === userId && u.role === 'shopper' && u.status === 'active');
       if (userExists) {
           validUserIds.push(userId);
       } else {
           invalidUserIds.push(userId);
       }
   });

   if (invalidUserIds.length > 0) {
       console.warn(`Server Action: Some users cannot be assigned: ${invalidUserIds.join(', ')}`);
       // Decide if this is a partial success or full failure. For now, proceed with valid users.
   }

   if (validUserIds.length === 0) {
        console.error(`Server Action: No valid users to assign for mission ${missionId}.`);
        return { success: false, message: `No valid users provided for assignment.` };
   }
  // --- End Validation ---

  // --- Update Mock Data ---
   // Ensure assignedTo is an array
   if (!Array.isArray(mission.assignedTo)) {
       mission.assignedTo = mission.assignedTo ? [mission.assignedTo] : [];
   }

   let newAssignmentsCount = 0;
   validUserIds.forEach(userId => {
       if (!mission.assignedTo.includes(userId)) {
           mission.assignedTo.push(userId);
           newAssignmentsCount++;

            // Create a default assignment if assigning directly without an application
            const newAssignment = {
                id: `asg-${Date.now()}-${userId}`,
                mission_id: missionId,
                user_id: userId,
                assigned_at: new Date(),
                specificStoreAddress: mission.location, // Default to mission location
                specificScenario: mission.description, // Default to mission description
            };
            mockAssignments.push(newAssignment);

            // If user was in appliedBy and their application was pending, mark it as approved
            const appIndex = mockApplications.findIndex(app => app.mission_id === missionId && app.user_id === userId && app.status === 'pending');
            if (appIndex > -1) {
                mockApplications[appIndex].status = 'approved';
            }
       }
        // If user was in appliedBy (even if not pending, e.g., admin directly assigning over a refused app), remove them
        if (mission.appliedBy && mission.appliedBy.includes(userId)) {
            mission.appliedBy = mission.appliedBy.filter(id => id !== userId);
        }
   });


  // Update mission status to 'assigned' if it wasn't already and there are assignees
  if (mission.assignedTo.length > 0 && mission.status !== 'assigned') {
       mission.status = 'assigned';
  }
  // If all applications were processed and no one ended up assigned, and it's not available, make it available.
  const anyPendingApps = mockApplications.some(app => app.mission_id === missionId && app.status === 'pending');
  if (!anyPendingApps && mission.assignedTo.length === 0 && mission.status !== 'available') {
      mission.status = 'available';
  }


  console.log(`Server Action: Mission ${missionId} assigned to ${newAssignmentsCount} new users. Current assignees: ${mission.assignedTo.join(', ')}. Status: ${mission.status} (simulated).`);

  // Revalidate paths
  revalidatePath('/admin/missions');
  revalidatePath('/admin/applications');
  revalidatePath('/');
  revalidatePath('/missions/assigned');

  return { success: true, message: `Mission assigned to ${newAssignmentsCount} users successfully. ${invalidUserIds.length > 0 ? `Could not assign to: ${invalidUserIds.join(', ')}.` : ''}`.trim() };
}

/**
 * Server Action to create a new mission.
 * This action initializes a mission and adds it to the mockMissions array.
 * The survey creation is a separate step.
 *
 * @param {object} missionData - The data for the new mission (title, description, etc.).
 * @returns {Promise<{success: boolean, message: string, missionId?: string}>} - Result of the creation operation.
 */
export async function createMissionAction(missionData) {
    console.log("Server Action: Creating new mission with data:", missionData);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Basic validation (can be expanded)
    if (!missionData.title || !missionData.description || !missionData.deadline || !missionData.reward || !missionData.location || !missionData.category || !missionData.businessName) {
        return { success: false, message: "Missing required mission information." };
    }

    const newMissionId = `mission-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const newMission = {
        id: newMissionId,
        ...missionData,
        reward: parseFloat(missionData.reward), // Ensure reward is a number
        deadline: new Date(missionData.deadline), // Ensure deadline is a Date object
        status: 'available', // Initial status
        assignedTo: [], // Initialize as empty array for potential multiple assignees
        appliedBy: [], // Initialize as empty array for applications
        // Add any other default fields if necessary
    };

    // Add to mock data
    mockMissions.unshift(newMission); // Add to the beginning of the array for visibility
    console.log("Server Action: New mission created and added to mock data:", newMission);

    // Revalidate relevant paths
    revalidatePath('/admin/missions');
    revalidatePath('/'); // Shopper available list

    return { success: true, message: "Mission created. Proceed to create survey.", missionId: newMissionId };
}
