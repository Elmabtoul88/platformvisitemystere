
'use server';

import { revalidatePath } from 'next/cache';
import { mockSurveyQuestions } from '@/lib/mock-data'; // Import mock data to update

/**
 * Server Action to save survey questions for a specific mission.
 *
 * @param {string} missionId - The ID of the mission the survey belongs to.
 * @param {Array<object>} questions - An array of question objects, potentially including new types.
 * @returns {Promise<{success: boolean, message: string}>} - Result of the save operation.
 */
export async function saveSurvey(missionId, questions) {
  console.log(`Server Action: Saving survey for mission ${missionId}`);
  console.log("Survey Questions:", JSON.stringify(questions, null, 2));

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // --- Update Mock Data ---
  // Validate missionId (though in mock, we just use it as a key)
  if (!missionId) {
      return { success: false, message: "Invalid mission ID." };
  }

  // Validate questions structure (basic check)
  if (!Array.isArray(questions)) {
       return { success: false, message: "Invalid questions format." };
   }

   // Save the questions to the mock data structure
   mockSurveyQuestions[missionId] = questions;
   console.log("Mock survey questions updated for mission:", missionId);
  // --- End Mock Data Update ---

  const success = true; // Simulate success

  if (success) {
    console.log("Server Action: Survey saved successfully (simulated).");

    // Revalidate paths relevant to both admin and shoppers
    revalidatePath(`/admin/missions/${missionId}`); // Admin mission detail page
    revalidatePath('/admin/missions'); // Admin mission list (in case status indicator changes)
    revalidatePath(`/report/${missionId}`); // Revalidate the shopper's report submission page
    // Revalidating assigned list might be useful if survey availability affects the mission card
    revalidatePath('/missions/assigned');

    return { success: true, message: "Survey saved successfully." };
  } else {
    console.error("Server Action: Failed to save survey (simulated).");
    return { success: false, message: "Failed to save the survey due to a simulated server error." };
  }
}
