
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
        id: String(newMissionId),
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
    const index = mockMissions.findIndex(m => String(m.id) === String(missionId));
    if (index === -1) return { success: false, message: "Mission non trouvée." };

    mockMissions.splice(index, 1);
    
    // Cleanup related data
    const appIndices = mockApplications.filter(a => String(a.mission_id) === String(missionId)).map(a => a.id);
    appIndices.forEach(id => {
        const idx = mockApplications.findIndex(a => a.id === id);
        if (idx !== -1) mockApplications.splice(idx, 1);
    });

    revalidatePath('/admin/missions');
    revalidatePath('/');
    return { success: true, message: "Mission supprimée avec succès." };
}

/**
 * Assign mission to specific shoppers (Direct assignment)
 */
export async function assignMissionAction(missionId, userIds, details) {
    const mission = mockMissions.find(m => String(m.id) === String(missionId));
    if (!mission) return { success: false, message: "Mission non trouvée." };

    mission.status = 'assigned';
    
    // Add unique users to assignedTo list
    userIds.forEach(uid => {
        if (!mission.assignedTo.includes(uid)) {
            mission.assignedTo.push(uid);
        }
    });

    // Create assignments
    userIds.forEach(uid => {
        const existing = mockAssignments.find(a => String(a.mission_id) === String(missionId) && String(a.user_id) === String(uid));
        if (!existing) {
            mockAssignments.push({
                id: `asg-${Date.now()}-${uid}`,
                mission_id: missionId,
                user_id: uid,
                assigned_at: new Date().toISOString(),
                timeWindowMinutes: 60,
                ...details
            });
        }
    });

    revalidatePath('/admin/missions');
    return { success: true, message: "Mission attribuée aux shoppers sélectionnés." };
}

/**
 * Approve application with support for validation of multiple stores
 */
export async function approveApplicationAction(applicationId, assignmentData) {
    const appIndex = mockApplications.findIndex(app => String(app.id) === String(applicationId));
    if (appIndex === -1) return { success: false, message: "Candidature non trouvée." };

    const application = mockApplications[appIndex];
    application.status = 'approved';

    const mission = mockMissions.find(m => String(m.id) === String(application.mission_id));
    if (mission) {
        mission.status = 'assigned';
        if (!mission.assignedTo.includes(application.user_id)) {
            mission.assignedTo.push(application.user_id);
        }

        assignmentData.storeIds.forEach((storeId, index) => {
            const existing = mockAssignments.find(a => 
                String(a.mission_id) === String(mission.id) && 
                String(a.user_id) === String(application.user_id) &&
                String(a.store_id) === String(storeId)
            );

            if (!existing) {
                mockAssignments.push({
                    id: `asg-v-${Date.now()}-${index}`,
                    mission_id: mission.id,
                    user_id: application.user_id,
                    store_id: storeId,
                    assigned_at: new Date().toISOString(),
                    plannedDate: assignmentData.plannedDate,
                    timeWindowMinutes: assignmentData.timeWindowMinutes || 60,
                    status: 'assigned'
                });
            }
        });
        
        mission.assignedStoreId = assignmentData.storeIds[0];
        mission.plannedDate = new Date(assignmentData.plannedDate);
        mission.timeWindowMinutes = assignmentData.timeWindowMinutes || 60;
    }

    revalidatePath('/admin/applications');
    revalidatePath('/admin/missions');
    revalidatePath('/missions/assigned');
    return { success: true, message: "Candidature validée." };
}

/**
 * Refuse a shopper application with reason
 */
export async function refuseApplicationAction(applicationId, reason) {
    console.log(`Server Action: Refusing application ${applicationId} with reason: ${reason}`);
    await new Promise(resolve => setTimeout(resolve, 500));

    const appIndex = mockApplications.findIndex(app => String(app.id) === String(applicationId));
    if (appIndex === -1) return { success: false, message: "Candidature non trouvée." };

    mockApplications[appIndex].status = 'refused';
    mockApplications[appIndex].refusal_reason = reason;

    revalidatePath('/admin/applications');
    revalidatePath('/missions/assigned');
    return { success: true, message: "Candidature refusée." };
}

/**
 * Submit Positioning Application with multiple stores
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
    const user = mockUsers.find(u => String(u.id) === String(userId));
    if (!user) return { success: false, message: "Utilisateur non trouvé." };
    
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    user.status = newStatus;
    
    revalidatePath('/admin/users');
    return { success: true, newStatus, message: `Statut utilisateur mis à jour: ${newStatus}` };
}

export async function updateUserAction(userId, userData) {
    const index = mockUsers.findIndex(u => String(u.id) === String(userId));
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
    return { success: true, message: `${added.length} magasins importés.` };
}

export async function updateStoreAction(storeId, storeData) {
    const index = mockStores.findIndex(s => String(s.id) === String(storeId));
    if (index === -1) return { success: false, message: "Magasin non trouvé." };
    mockStores[index] = { ...mockStores[index], ...storeData };
    revalidatePath('/admin/stores');
    return { success: true, message: "Magasin mis à jour." };
}

export async function toggleStoreStatusAction(storeId) {
    const store = mockStores.find(s => String(s.id) === String(storeId));
    if (!store) return { success: false, message: "Magasin non trouvé." };
    store.active = !store.active;
    revalidatePath('/admin/stores');
    return { success: true, message: `Magasin ${store.active ? 'activé' : 'désactivé'}.` };
}

/**
 * Report Review Actions
 */
export async function approveReportAction(reportId, missionId) {
    const report = mockReports.find(r => String(r.id) === String(reportId));
    if (!report) return { success: false, message: "Rapport non trouvé." };
    
    report.status = 'approved';
    
    const mission = mockMissions.find(m => String(m.id) === String(missionId));
    if (mission) {
        mission.status = 'completed';
    }
    
    revalidatePath(`/admin/missions/${missionId}/reports`);
    revalidatePath('/missions/completed');
    return { success: true, message: "Rapport approuvé." };
}

export async function refuseReportAction(reportId, missionId, reason) {
    const report = mockReports.find(r => String(r.id) === String(reportId));
    if (!report) return { success: false, message: "Rapport non trouvé." };
    
    report.status = 'refused';
    report.refusalReason = reason;
    
    revalidatePath(`/admin/missions/${missionId}/reports`);
    return { success: true, message: "Rapport refusé." };
}
