
'use server';

import { revalidatePath } from 'next/cache';
import { mockMissions, mockReports } from '@/lib/mock-data'; // Import mock data

/**
 * Server Action to handle report submission with dynamic survey answers.
 * This function runs only on the server.
 *
 * @param {object} submittedData - Data from the ReportSubmissionForm, including structured answers. Expected format: { answers: { q_id_type: { type: '...', value: '...' } } }
 * @param {string} missionId - The ID of the mission being reported on.
 * @param {string} userId - The ID of the user submitting the report.
 */
export async function submitReport(submittedData, missionId, userId) {
  console.log(`Server Action: Submitting report for mission ${missionId} by user ${userId}`);
  console.log("Submitted Data:", JSON.stringify(submittedData, null, 2));

  // Simulate network delay for submission
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate potential submission error
  const simulateError = false; // Set to true to test error path
  if (simulateError) {
    console.error("Server Action: Simulated submission error");
    throw new Error("Simulated submission error from server action.");
  }

  // --- Update Mock Data ---
  // 1. Find the mission
  const missionIndex = mockMissions.findIndex(m => m.id === missionId);
  if (missionIndex === -1) {
    console.error("Server Action: Mission not found.");
    throw new Error("Mission not found during report submission.");
  }

  // 2. Check if user is assigned (handle array or single ID)
  const mission = mockMissions[missionIndex];
  const isAssigned = Array.isArray(mission.assignedTo) ? mission.assignedTo.includes(userId) : mission.assignedTo === userId;
  if (!isAssigned) {
      console.error(`Server Action: User ${userId} is not assigned to mission ${missionId}.`);
      throw new Error("You are not assigned to this mission.");
  }

  // 3. Update Mission Status to 'submitted'
  // This assumes submitting a report marks the mission as submitted (awaiting review)
  mockMissions[missionIndex].status = 'submitted';

  // 4. Create or Update the Report in mockReports
   const reportIndex = mockReports.findIndex(r => r.missionId === missionId && r.userId === userId);
   const newReportData = {
        id: reportIndex > -1 ? mockReports[reportIndex].id : `report-${Date.now()}-${Math.random().toString(16).slice(2)}`, // Generate new ID if needed
        missionId: missionId,
        userId: userId,
        answers: submittedData.answers || {},
        submittedAt: new Date(),
        status: 'submitted', // Report status is submitted
        refusalReason: null,
   };

   if (reportIndex > -1) {
       // Update existing report (e.g., if re-submitting)
       mockReports[reportIndex] = newReportData;
       console.log(`Server Action: Updated existing report ${newReportData.id}`);
   } else {
       // Add new report
       mockReports.push(newReportData);
       console.log(`Server Action: Created new report ${newReportData.id}`);
   }
  // --- End Mock Data Update ---

  console.log("Server Action: Report submission successful (simulated)");

  // Revalidate relevant paths for both shopper and admin
  revalidatePath('/'); // Shopper available list
  revalidatePath('/missions/assigned'); // Shopper assigned list (mission status changes)
  revalidatePath('/missions/completed'); // Shopper completed list
  revalidatePath(`/report/${missionId}`); // Report page itself (though user is redirected)
  revalidatePath('/admin/missions'); // Admin mission list (status changes)
  revalidatePath(`/admin/missions/${missionId}/reports`); // Admin report review page

  return { success: true, message: "Report submitted successfully (simulated)." };
}
