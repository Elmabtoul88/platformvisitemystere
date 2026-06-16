
'use server';

import { revalidatePath } from 'next/cache';
import { mockMissions, mockReports, mockApplications, mockAssignments } from '@/lib/mock-data';

/**
 * Step 1: Create Mission with process fields
 */
export async function createMissionAction(missionData) {
    console.log("Server Action: Creating new process-based mission", missionData);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newMissionId = `mission-${Date.now()}`;
    const newMission = {
        id: newMissionId,
        ...missionData,
        reward: parseFloat(missionData.reward),
        deadline: new Date(missionData.deadline),
        appliedBy: [],
        assignedTo: [],
    };

    mockMissions.unshift(newMission);
    revalidatePath('/admin/missions');
    revalidatePath('/');

    return { success: true, missionId: newMissionId };
}

/**
 * Step 4: Approve positioning based on quiz answers
 */
export async function approveApplicationAction(applicationId, assignmentDetails) {
    const appIndex = mockApplications.findIndex(app => app.id === applicationId);
    if (appIndex === -1) return { success: false, message: "Candidature non trouvée." };

    const application = mockApplications[appIndex];
    application.status = 'approved';

    const mission = mockMissions.find(m => m.id === application.mission_id);
    if (mission) {
        mission.status = 'assigned'; // MISSION ATTRIBUÉE
        mission.assignedTo.push(application.user_id);
    }

    revalidatePath('/admin/applications');
    revalidatePath('/missions/assigned');
    return { success: true, message: "Mission attribuée. Le shopper a été notifié." };
}

/**
 * Step 11: Final closure
 */
export async function finalizeMissionAction(missionId) {
    const mission = mockMissions.find(m => m.id === missionId);
    if (mission) {
        mission.status = 'completed'; // TERMINÉE
    }
    revalidatePath('/admin/missions');
    return { success: true, message: "Mission terminée et archivée." };
}
