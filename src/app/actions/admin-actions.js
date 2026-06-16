
'use server';

import { revalidatePath } from 'next/cache';
import { mockMissions, mockReports, mockApplications, mockAssignments, mockStores } from '@/lib/mock-data';
import { mockUsers } from '@/app/admin/users/users-mock.js';

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
        status: 'available',
    };

    mockMissions.unshift(newMission);
    revalidatePath('/admin/missions');
    revalidatePath('/');

    return { success: true, missionId: newMissionId };
}

/**
 * Delete a mission and its related data
 */
export async function deleteMissionAction(missionId) {
    const index = mockMissions.findIndex(m => m.id === missionId);
    if (index === -1) return { success: false, message: "Mission non trouvée." };

    mockMissions.splice(index, 1);
    
    // Cleanup related data
    const appIndices = mockApplications.filter(a => a.mission_id === missionId).map(a => a.id);
    appIndices.forEach(id => {
        const idx = mockApplications.findIndex(a => a.id === id);
        if (idx !== -1) mockApplications.splice(idx, 1);
    });

    revalidatePath('/admin/missions');
    revalidatePath('/');
    return { success: true, message: "Mission supprimée avec succès." };
}

/**
 * Assign mission to specific shoppers
 */
export async function assignMissionAction(missionId, userIds, details) {
    const mission = mockMissions.find(m => m.id === missionId);
    if (!mission) return { success: false, message: "Mission non trouvée." };

    mission.status = 'assigned';
    mission.assignedTo = userIds;

    // Create assignments
    userIds.forEach(uid => {
        const existing = mockAssignments.find(a => a.mission_id === missionId && a.user_id === uid);
        if (!existing) {
            mockAssignments.push({
                id: `asg-${Date.now()}-${uid}`,
                mission_id: missionId,
                user_id: uid,
                assigned_at: new Date().toISOString(),
                ...details
            });
        }
    });

    revalidatePath('/admin/missions');
    return { success: true, message: "Mission attribuée aux shoppers sélectionnés." };
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
        if (!mission.assignedTo.includes(application.user_id)) {
            mission.assignedTo.push(application.user_id);
        }
    }

    revalidatePath('/admin/applications');
    revalidatePath('/missions/assigned');
    return { success: true, message: "Mission attribuée. Le shopper a été notifié." };
}

/**
 * Refuse a shopper application
 */
export async function refuseApplicationAction(applicationId, reason) {
    const app = mockApplications.find(a => a.id === applicationId);
    if (!app) return { success: false, message: "Candidature non trouvée." };

    app.status = 'refused';
    app.refusal_reason = reason;

    revalidatePath('/admin/applications');
    return { success: true, message: "Candidature refusée." };
}

/**
 * Approve a submitted report
 */
export async function approveReportAction(reportId, missionId) {
    const report = mockReports.find(r => r.id === reportId);
    if (!report) return { success: false, message: "Rapport non trouvé." };

    report.status = 'approved';
    
    // If all reports for this mission are handled, update mission status? 
    // Usually one approved report is enough to mark as completed in simple flows
    const mission = mockMissions.find(m => m.id === missionId);
    if (mission) {
        mission.status = 'approved';
    }

    revalidatePath(`/admin/missions/${missionId}/reports`);
    revalidatePath('/missions/completed');
    return { success: true, message: "Rapport validé et dédommagement débloqué." };
}

/**
 * Refuse a submitted report
 */
export async function refuseReportAction(reportId, missionId, reason) {
    const report = mockReports.find(r => r.id === reportId);
    if (!report) return { success: false, message: "Rapport non trouvé." };

    report.status = 'refused';
    report.refusalReason = reason;

    revalidatePath(`/admin/missions/${missionId}/reports`);
    return { success: true, message: "Rapport refusé. Le shopper en a été informé." };
}

/**
 * Store Management Actions
 */
export async function addStoreAction(storeData) {
    const newStore = {
        id: `store-${Date.now()}`,
        ...storeData,
    };
    mockStores.push(newStore);
    revalidatePath('/admin/stores');
    return { success: true, message: "Magasin ajouté avec succès." };
}

export async function updateStoreAction(storeId, storeData) {
    const index = mockStores.findIndex(s => s.id === storeId);
    if (index === -1) return { success: false, message: "Magasin non trouvé." };
    mockStores[index] = { ...mockStores[index], ...storeData };
    revalidatePath('/admin/stores');
    return { success: true, message: "Magasin mis à jour." };
}

export async function toggleStoreStatusAction(storeId) {
    const store = mockStores.find(s => s.id === storeId);
    if (!store) return { success: false, message: "Magasin non trouvé." };
    store.active = !store.active;
    revalidatePath('/admin/stores');
    return { success: true, message: `Magasin ${store.active ? 'activé' : 'désactivé'}.` };
}

export async function batchAddStoresAction(stores) {
    stores.forEach(s => {
        mockStores.push({
            id: `store-batch-${Date.now()}-${Math.random()}`,
            ...s,
            active: s.active ?? true
        });
    });
    revalidatePath('/admin/stores');
    return { success: true, message: `${stores.length} magasins importés.` };
}

/**
 * User Management Actions
 */
export async function updateUserAction(userId, userData) {
    const index = mockUsers.findIndex(u => u.id === userId);
    if (index === -1) return { success: false, message: "Utilisateur non trouvé." };
    mockUsers[index] = { ...mockUsers[index], ...userData };
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, message: "Profil utilisateur mis à jour." };
}

export async function toggleUserStatusAction(userId, currentStatus) {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return { success: false, message: "Utilisateur non trouvé." };
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    user.status = newStatus;
    revalidatePath('/admin/users');
    return { success: true, newStatus, message: `Utilisateur ${newStatus === 'active' ? 'réactivé' : 'désactivé'}.` };
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
