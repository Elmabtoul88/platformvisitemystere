'use server';

import { revalidatePath } from 'next/cache';
import { mockMissions, mockReports, mockApplications, mockAssignments, mockStores } from '@/lib/mock-data';
import { mockUsers } from '@/app/admin/users/users-mock.js';

/**
 * Update Payment Status
 */
export async function updatePaymentAction(reportId, status, details = {}) {
    const report = mockReports.find(r => String(r.id) === String(reportId));
    if (!report) return { success: false, message: "Rapport non trouvé." };

    report.paymentStatus = status;
    if (status === 'paid') {
        report.paymentDate = new Date().toISOString();
        report.transactionRef = details.transactionRef;
    }
    report.adminNotes = details.adminNotes;

    revalidatePath('/admin/payments');
    revalidatePath('/missions/completed');
    return { success: true, message: `Statut de paiement mis à jour: ${status}` };
}

/**
 * Update Banking Information
 */
export async function updateBankingInfoAction(userId, bankingData) {
    const user = mockUsers.find(u => String(u.id) === String(userId));
    if (!user) return { success: false, message: "Utilisateur non trouvé." };

    user.bankingInfo = bankingData;
    revalidatePath('/settings');
    revalidatePath('/admin/payments');
    return { success: true, message: "Informations bancaires mises à jour." };
}

/**
 * Create Mission
 */
export async function createMissionAction(missionData) {
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
 * Delete a mission
 */
export async function deleteMissionAction(missionId) {
    const index = mockMissions.findIndex(m => String(m.id) === String(missionId));
    if (index === -1) return { success: false, message: "Mission non trouvée." };
    mockMissions.splice(index, 1);
    revalidatePath('/admin/missions');
    revalidatePath('/');
    return { success: true, message: "Mission supprimée." };
}

/**
 * Assign mission directly
 */
export async function assignMissionAction(missionId, userIds, details) {
    const mission = mockMissions.find(m => String(m.id) === String(missionId));
    if (!mission) return { success: false, message: "Mission non trouvée." };

    mission.status = 'assigned';
    userIds.forEach(uid => {
        if (!mission.assignedTo.includes(uid)) mission.assignedTo.push(uid);
        mockAssignments.push({
            id: `asg-${Date.now()}-${uid}`,
            mission_id: missionId,
            user_id: uid,
            assigned_at: new Date().toISOString(),
            plannedDate: new Date().toISOString(),
            timeWindowMinutes: 60,
            ...details,
            status: 'assigned'
        });
    });

    revalidatePath('/admin/missions');
    return { success: true, message: "Mission attribuée." };
}

/**
 * Approve application
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
        });
    }

    revalidatePath('/admin/applications');
    revalidatePath('/admin/missions');
    return { success: true, message: "Candidature validée." };
}

/**
 * Refuse application
 */
export async function refuseApplicationAction(applicationId, reason) {
    const appIndex = mockApplications.findIndex(app => String(app.id) === String(applicationId));
    if (appIndex === -1) return { success: false, message: "Candidature non trouvée." };
    mockApplications[appIndex].status = 'refused';
    mockApplications[appIndex].refusal_reason = reason;
    revalidatePath('/admin/applications');
    return { success: true, message: "Candidature refusée." };
}

/**
 * Submit Application
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
 * Toggle User Status
 */
export async function toggleUserStatusAction(userId, currentStatus) {
    const user = mockUsers.find(u => String(u.id) === String(userId));
    if (!user) return { success: false, message: "Utilisateur non trouvé." };
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    user.status = newStatus;
    revalidatePath('/admin/users');
    return { success: true, newStatus, message: `Statut mi à jour: ${newStatus}` };
}

/**
 * Update User
 */
export async function updateUserAction(userId, userData) {
    const index = mockUsers.findIndex(u => String(u.id) === String(userId));
    if (index === -1) return { success: false, message: "Utilisateur non trouvé." };
    mockUsers[index] = { ...mockUsers[index], ...userData };
    revalidatePath('/admin/users');
    return { success: true, message: "Profil mis à jour." };
}

/**
 * Store Management
 */
export async function addStoreAction(storeData) {
    mockStores.push({ id: `store-${Date.now()}`, ...storeData });
    revalidatePath('/admin/stores');
    return { success: true, message: "Magasin ajouté." };
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
    return { success: true, message: "Statut magasin mi à jour." };
}

export async function batchAddStoresAction(storesData) {
    const newStores = storesData.map((data, index) => ({
        id: `store-batch-${Date.now()}-${index}`,
        ...data,
        active: data.active !== undefined ? data.active : true
    }));
    mockStores.push(...newStores);
    revalidatePath('/admin/stores');
    return { success: true, message: `${newStores.length} magasins importés avec succès.` };
}

/**
 * Report Approval
 */
export async function approveReportAction(reportId, missionId) {
    const report = mockReports.find(r => String(r.id) === String(reportId));
    if (!report) return { success: false, message: "Rapport non trouvé." };
    report.status = 'approved';
    report.paymentStatus = 'pending'; // Auto-set to pending payment
    const mission = mockMissions.find(m => String(m.id) === String(missionId));
    if (mission) mission.status = 'completed';
    revalidatePath(`/admin/missions/${missionId}/reports`);
    revalidatePath('/admin/payments');
    return { success: true, message: "Rapport approuvé. Paiement en attente." };
}

export async function refuseReportAction(reportId, missionId, reason) {
    const report = mockReports.find(r => String(r.id) === String(reportId));
    if (!report) return { success: false, message: "Rapport non trouvé." };
    report.status = 'refused';
    report.refusalReason = reason;
    revalidatePath(`/admin/missions/${missionId}/reports`);
    return { success: true, message: "Rapport refusé." };
}
