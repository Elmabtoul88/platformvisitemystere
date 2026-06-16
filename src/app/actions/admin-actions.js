
'use server';

import { revalidatePath } from 'next/cache';
import { mockMissions, mockReports, mockApplications, mockAssignments, mockStores } from '@/lib/mock-data';
import { mockUsers } from '@/app/admin/users/users-mock.js';

/**
 * Create Mission with process fields
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
 * Approve positioning application
 */
export async function approveApplicationAction(applicationId, assignmentData) {
    const appIndex = mockApplications.findIndex(app => app.id === applicationId);
    if (appIndex === -1) return { success: false, message: "Candidature non trouvée." };

    const application = mockApplications[appIndex];
    application.status = 'approved';

    const mission = mockMissions.find(m => m.id === application.mission_id);
    if (mission) {
        mission.status = 'assigned';
        if (!mission.assignedTo.includes(application.user_id)) {
            mission.assignedTo.push(application.user_id);
        }
        // Update mission with specific store and date for the shopper
        mission.assignedStoreId = assignmentData.storeId;
        mission.plannedDate = new Date(assignmentData.plannedDate);
    }

    revalidatePath('/admin/applications');
    revalidatePath('/missions/assigned');
    return { success: true, message: "Mission validée et planifiée." };
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
 * Submit Positioning Application
 */
export async function submitApplicationAction(applicationData) {
    const newId = `app-${Date.now()}`;
    mockApplications.push({
        id: newId,
        ...applicationData,
        status: 'pending',
        applied_at: new Date().toISOString()
    });
    revalidatePath('/admin/applications');
    return { success: true, id: newId };
}

/**
 * User Management Actions
 */
export async function toggleUserStatusAction(userId, currentStatus) {
    console.log(`Server Action: Toggling user status for ${userId}`);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return { success: false, message: "Utilisateur non trouvé." };
    
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    user.status = newStatus;
    
    revalidatePath('/admin/users');
    return { success: true, newStatus, message: `Statut utilisateur mis à jour: ${newStatus}` };
}

export async function updateUserAction(userId, userData) {
    const index = mockUsers.findIndex(u => u.id === userId);
    if (index === -1) return { success: false, message: "Utilisateur non trouvé." };
    
    mockUsers[index] = { ...mockUsers[index], ...userData };
    
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, message: "Profil utilisateur mis à jour avec succès." };
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

export async function batchAddStoresAction(storesData) {
    const added = [];
    storesData.forEach(data => {
        const newStore = {
            id: `store-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            active: true,
            ...data
        };
        mockStores.push(newStore);
        added.push(newStore);
    });
    revalidatePath('/admin/stores');
    return { success: true, message: `${added.length} magasins importés avec succès.` };
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

/**
 * Report Review Actions
 */
export async function approveReportAction(reportId, missionId) {
    const report = mockReports.find(r => r.id === reportId);
    if (!report) return { success: false, message: "Rapport non trouvé." };
    
    report.status = 'approved';
    
    // Update mission status if needed
    const mission = mockMissions.find(m => m.id === missionId);
    if (mission) {
        mission.status = 'approved';
    }
    
    revalidatePath(`/admin/missions/${missionId}/reports`);
    revalidatePath('/missions/completed');
    return { success: true, message: "Rapport approuvé et paiement validé." };
}

export async function refuseReportAction(reportId, missionId, reason) {
    const report = mockReports.find(r => r.id === reportId);
    if (!report) return { success: false, message: "Rapport non trouvé." };
    
    report.status = 'refused';
    report.refusalReason = reason;
    
    revalidatePath(`/admin/missions/${missionId}/reports`);
    return { success: true, message: "Rapport refusé avec motif." };
}

/**
 * Final closure
 */
export async function finalizeMissionAction(missionId) {
    const mission = mockMissions.find(m => m.id === missionId);
    if (mission) {
        mission.status = 'completed';
    }
    revalidatePath('/admin/missions');
    return { success: true, message: "Mission terminée et archivée." };
}
