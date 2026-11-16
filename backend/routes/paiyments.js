// routes/paiyments.js
const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/auth");
const prisma = require("../prismaClient");

/**
 * Route pour la page de gestion des paiements (Admin uniquement)
 */
router.get("/payment_missions", adminAuth, async (req, res) => {
  try {
    const reportsList = await prisma.reports.findMany({
      where: {
        status: { in: ["approved", "paid", "refused"] },
      },
      include: {
        missions: true,
        users: {
          include: {
            bank_info: true,
          },
        },
      },
      orderBy: { submitted_at: "desc" },
    });

    const payments = reportsList.map((r) => {
      const userBank = r.users?.bank_info?.[0] || null;
      const bankingInfo = userBank
        ? {
            id: userBank.id,
            accountHolder: userBank.account_holder,
            rib: userBank.rib,
            bankName: userBank.bank_name,
            swift: userBank.swift || "Non renseigné",
            country: userBank.country || "Maroc",
            currency: userBank.currency || "MAD",
          }
        : null;

      const user = {
        id: r.users?.id,
        name: r.users?.name,
        email: r.users?.email,
        role: r.users?.role,
        status: r.users?.status,
        registrationDate: r.users?.registration_date,
        profilePicUrl: r.users?.profile_pic_url,
        city: r.users?.city,
        telephone: r.users?.telephone,
        motivation: r.users?.motivation,
        cvUrl: r.users?.cv_url,
        birthYear: r.users?.birth_year,
        gender: r.users?.gender,
        completedMissionsCount: r.users?.completed_missions_count,
        bankingInfo,
      };

      const rewardAmount = r.missions?.reward ? parseFloat(r.missions.reward) : 0;

      return {
        id: r.id,
        reportId: r.id,
        missionId: r.mission_id,
        userId: r.user_id,
        submittedAt: r.submitted_at,
        reportStatus: r.status,
        paymentStatus: r.status === "paid" ? "paid" : r.status === "approved" ? "pending" : "refused",
        refusalReason: r.refusal_reason,
        nomMagazin: r.nomMagazin,
        specificStoreAddress: r.specificStoreAddress,
        scenario: r.scenario,
        dateTimeMission: r.dateTimeMission,
        ville: r.ville,
        storeId: r.store_id,
        referencePaiement: r.reference_paiement,
        reward: rewardAmount,
        missionTitle: r.missions?.title,
        missionCategory: r.missions?.category,
        missionReward: rewardAmount,
        businessName: r.missions?.businessName,
        shopperName: r.users?.name,
        shopperEmail: r.users?.email,
        shopperPhone: r.users?.telephone,
        shopperCity: r.users?.city,
        hasBankingInfo: bankingInfo !== null,
        bankingInfo,
        user,
        mission: {
          id: r.missions?.id,
          title: r.missions?.title,
          description: r.missions?.description,
          deadline: r.missions?.deadline,
          reward: rewardAmount,
          category: r.missions?.category,
          status: r.missions?.status,
          businessName: r.missions?.businessName,
          location: r.missions?.location,
          clientId: r.missions?.clientId,
          pays: r.missions?.pays,
          ville: r.missions?.ville,
        },
      };
    });

    const stats = {
      totalMissions: payments.length,
      pendingPayment: payments.filter((p) => p.paymentStatus === "pending").length,
      paidMissions: payments.filter((p) => p.paymentStatus === "paid").length,
      refusedPayment: payments.filter((p) => p.paymentStatus === "refused").length,
      totalAmountPaid: payments
        .filter((p) => p.paymentStatus === "paid")
        .reduce((sum, p) => sum + (p.reward || 0), 0),
      totalAmountPending: payments
        .filter((p) => p.paymentStatus === "pending")
        .reduce((sum, p) => sum + (p.reward || 0), 0),
      shoppersWithBankingInfo: payments.filter((p) => p.hasBankingInfo).length,
      shoppersWithoutBankingInfo: payments.filter((p) => !p.hasBankingInfo).length,
    };

    return res.status(200).json({
      success: true,
      message: "Données de paiement récupérées avec succès",
      data: {
        payments,
        stats,
      },
    });
  } catch (err) {
    console.error("Erreur in /payment_missions:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des données",
      error: err.message,
    });
  }
});

/**
 * Détails d'un paiement spécifique
 */
router.get("/payment_missions/:reportId", adminAuth, async (req, res) => {
  const reportId = parseInt(req.params.reportId);
  if (isNaN(reportId)) {
    return res.status(400).json({ success: false, message: "ID invalide" });
  }

  try {
    const report = await prisma.reports.findUnique({
      where: { id: reportId },
      include: {
        missions: true,
        users: {
          include: { bank_info: true },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ success: false, message: "Rapport non trouvé" });
    }

    const userBank = report.users?.bank_info?.[0] || null;
    const bankingInfo = userBank
      ? {
          id: userBank.id,
          accountHolder: userBank.account_holder,
          rib: userBank.rib,
          bankName: userBank.bank_name,
          swift: userBank.swift || "Non renseigné",
          country: userBank.country || "Maroc",
          currency: userBank.currency || "MAD",
        }
      : null;

    return res.status(200).json({
      success: true,
      data: {
        report: {
          id: report.id,
          mission_id: report.mission_id,
          user_id: report.user_id,
          submitted_at: report.submitted_at,
          status: report.status,
          refusal_reason: report.refusal_reason,
          nomMagazin: report.nomMagazin,
          specificStoreAddress: report.specificStoreAddress,
          scenario: report.scenario,
          dateTimeMission: report.dateTimeMission,
          ville: report.ville,
          store_id: report.store_id,
          reference_paiement: report.reference_paiement,
          mission: {
            id: report.missions?.id,
            title: report.missions?.title,
            reward: report.missions?.reward ? parseFloat(report.missions.reward) : 0,
            category: report.missions?.category,
            status: report.missions?.status,
          },
          user: {
            id: report.users?.id,
            name: report.users?.name,
            email: report.users?.email,
            telephone: report.users?.telephone,
            city: report.users?.city,
            bankingInfo,
          },
        },
      },
    });
  } catch (err) {
    console.error("Error fetching payment details:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

/**
 * Mettre à jour le statut d'un paiement
 */
router.put("/payment_missions/:reportId", adminAuth, async (req, res) => {
  const reportId = parseInt(req.params.reportId);
  const { action, transactionRef, adminNotes } = req.body;

  if (isNaN(reportId) || !["paid", "refused"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: 'Action invalide. Utilisez "paid" ou "refused"',
    });
  }

  if (action === "paid" && !transactionRef) {
    return res.status(400).json({
      success: false,
      message: "La référence de transaction est requise pour marquer comme payée",
    });
  }

  try {
    const updateData = {
      status: action,
    };
    if (action === "paid") {
      updateData.reference_paiement = transactionRef;
    }
    if (adminNotes) {
      updateData.refusal_reason = adminNotes;
    }

    const updated = await prisma.reports.update({
      where: { id: reportId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: `Statut de paiement mis à jour vers "${action}" avec succès`,
      data: {
        reportId: updated.id,
        newStatus: action,
        transactionRef: updated.reference_paiement,
      },
    });
  } catch (err) {
    console.error("Error updating payment status:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

module.exports = router;
