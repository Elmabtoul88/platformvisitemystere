const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { utilisateurValidation } = require("../models/users");
const { auth, adminAuth } = require("../middleware/auth");
const prisma = require("../prismaClient");

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  registration_date: true,
  profile_pic_url: true,
  city: true,
  telephone: true,
  motivation: true,
  cv_url: true,
  birth_year: true,
  gender: true,
  completed_missions_count: true,
};

// Route d'inscription
router.post("/", async (req, res) => {
  const { error } = utilisateurValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, password, telephone, city, motivation, cv_url, birth_year, gender } = req.body;

  try {
    const existing = await prisma.users.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      return res.status(400).json({ message: "Un compte avec cet email existe déjà." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Sécurité : l'inscription publique crée toujours un rôle 'shopper'
    const newUser = await prisma.users.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: "shopper",
        status: "active",
        telephone: telephone || null,
        city: city || null,
        motivation: motivation || null,
        cv_url: cv_url || null,
        birth_year: birth_year ? parseInt(birth_year) : null,
        gender: gender || "prefer_not_say",
      },
    });

    return res.status(201).json({
      utilisateur_id: newUser.id,
      id: newUser.id,
      message: "Utilisateur créé avec succès",
    });
  } catch (err) {
    console.error("Erreur création utilisateur:", err);
    return res.status(500).json({ error: "Erreur serveur interne lors de l'inscription." });
  }
});

// Liste de tous les utilisateurs (Admin uniquement, hashs masqués)
router.get("/", adminAuth, async (req, res) => {
  try {
    const usersList = await prisma.users.findMany({
      select: safeUserSelect,
      orderBy: { id: "desc" },
    });
    return res.status(200).json(usersList);
  } catch (err) {
    console.error("Erreur récupération utilisateurs:", err);
    return res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
  }
});

// Liste rapide des comptes clients pour assignation aux missions (Admin uniquement)
router.get("/role/clients", adminAuth, async (req, res) => {
  try {
    const clients = await prisma.users.findMany({
      where: { role: "client" },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        telephone: true,
        status: true,
      },
      orderBy: { name: "asc" },
    });
    return res.status(200).json(clients);
  } catch (err) {
    console.error("Erreur récupération clients:", err);
    return res.status(500).json({ error: "Erreur lors de la récupération des clients." });
  }
});

// Profil d'un utilisateur par ID
router.get("/:id", auth, async (req, res) => {
  const targetId = parseInt(req.params.id);
  if (isNaN(targetId)) return res.status(400).json({ message: "ID invalide." });

  // Contrôle d'accès : seulement l'utilisateur lui-même ou un administrateur
  if (req.user.role !== "admin" && req.user.id !== targetId) {
    return res.status(403).json({ message: "Accès refusé aux données d'un autre utilisateur." });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: targetId },
      select: safeUserSelect,
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    return res.status(200).json([user]);
  } catch (err) {
    console.error("Erreur profil utilisateur:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// Mise à jour complète ou partielle d'un utilisateur
const handleUserUpdate = async (req, res) => {
  const targetId = parseInt(req.params.id);
  if (isNaN(targetId)) return res.status(400).json({ message: "ID invalide." });

  const isAdmin = req.user.role === "admin";
  const isSelf = req.user.id === targetId;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ message: "Accès refusé pour modifier cet utilisateur." });
  }

  const allowedFields = [
    "name",
    "telephone",
    "city",
    "profile_pic_url",
    "motivation",
    "cv_url",
    "birth_year",
    "gender",
  ];

  // Seul l'administrateur a le droit de modifier le rôle, le statut ou le compte de missions
  if (isAdmin) {
    allowedFields.push("role", "status", "completed_missions_count");
  }

  const updateData = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === "birth_year" || field === "completed_missions_count") {
        updateData[field] = req.body[field] ? parseInt(req.body[field]) : null;
      } else {
        updateData[field] = req.body[field];
      }
    }
  }

  // Support camelCase depuis le frontend
  if (req.body.profilePicUrl !== undefined) updateData.profile_pic_url = req.body.profilePicUrl;
  if (req.body.birthYear !== undefined) updateData.birth_year = req.body.birthYear ? parseInt(req.body.birthYear) : null;
  if (req.body.cvUrl !== undefined) updateData.cv_url = req.body.cvUrl;

  try {
    const updated = await prisma.users.update({
      where: { id: targetId },
      data: updateData,
      select: safeUserSelect,
    });

    return res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      success: true,
      user: updated,
    });
  } catch (err) {
    console.error("Erreur mise à jour utilisateur:", err);
    return res.status(500).json({ error: "Erreur lors de la mise à jour." });
  }
};

router.put("/:id", auth, handleUserUpdate);
router.patch("/:id", auth, handleUserUpdate);

// Suppression d'un utilisateur (Admin uniquement)
router.delete("/:id", adminAuth, async (req, res) => {
  const targetId = parseInt(req.params.id);
  if (isNaN(targetId)) return res.status(400).json({ message: "ID invalide." });

  try {
    await prisma.users.delete({ where: { id: targetId } });
    return res.status(200).json({ message: "Utilisateur supprimé avec succès." });
  } catch (err) {
    console.error("Erreur suppression utilisateur:", err);
    return res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

// Réinitialisation de mot de passe sécurisée
router.patch("/reset-password/:id", auth, async (req, res) => {
  const targetId = parseInt(req.params.id);
  const { newPassword, currentPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Le mot de passe doit comporter au moins 6 caractères." });
  }

  const isAdmin = req.user.role === "admin";
  const isSelf = req.user.id === targetId;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ error: "Action non autorisée." });
  }

  try {
    const user = await prisma.users.findUnique({ where: { id: targetId } });
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    // Si ce n'est pas un admin qui force la réinitialisation, vérifier le mot de passe actuel
    if (!isAdmin) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Le mot de passe actuel est requis." });
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(400).json({ error: "Mot de passe actuel incorrect." });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.users.update({
      where: { id: targetId },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      message: "Mot de passe modifié avec succès.",
      success: true,
    });
  } catch (err) {
    console.error("Erreur reset password:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// Rapports d'un utilisateur
router.get("/user/:userId", auth, async (req, res) => {
  const targetId = parseInt(req.params.userId);
  if (isNaN(targetId)) return res.status(400).json({ error: "ID utilisateur requis." });

  if (req.user.role !== "admin" && req.user.id !== targetId) {
    return res.status(403).json({ error: "Accès refusé." });
  }

  try {
    const userReports = await prisma.reports.findMany({
      where: { user_id: targetId },
      include: {
        missions: true,
      },
      orderBy: { submitted_at: "desc" },
    });

    const formatted = userReports.map((r) => {
      let parsedAnswers = [];
      try {
        parsedAnswers = JSON.parse(r.answers || "[]");
      } catch (e) {
        parsedAnswers = [];
      }

      return {
        id: r.id,
        missionId: r.mission_id,
        userId: r.user_id,
        answers: parsedAnswers,
        submittedAt: r.submitted_at,
        status: r.status,
        refusalReason: r.refusal_reason,
        nomMagazin: r.nomMagazin,
        specificStoreAddress: r.specificStoreAddress,
        scenario: r.scenario,
        dateTimeMission: r.dateTimeMission,
        ville: r.ville,
        store_id: r.store_id,
        store: {
          id: r.store_id,
          name: r.nomMagazin || "Magasin non spécifié",
          city: r.ville || "Ville non spécifiée",
          address: r.specificStoreAddress || "Adresse non spécifiée",
        },
        mission: {
          title: r.missions?.title,
          businessName: r.missions?.businessName,
          reward: r.missions?.reward ? parseFloat(r.missions.reward) : 0,
          deadline: r.missions?.deadline,
        },
        reportStatus: r.status,
        paymentStatus:
          r.status === "paid"
            ? "paid"
            : r.status === "refused"
            ? "refused"
            : "pending",
        referencePaiement: r.reference_paiement,
        reward: r.missions?.reward ? parseFloat(r.missions.reward) : 0,
      };
    });

    return res.status(200).json({
      message: "Rapports récupérés avec succès",
      data: formatted,
    });
  } catch (err) {
    console.error("Erreur récupération user reports:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// Statistiques de paiement d'un utilisateur
router.get("/stats/:userId", auth, async (req, res) => {
  const targetId = parseInt(req.params.userId);
  if (isNaN(targetId)) return res.status(400).json({ error: "ID requis." });

  if (req.user.role !== "admin" && req.user.id !== targetId) {
    return res.status(403).json({ error: "Accès refusé." });
  }

  try {
    const userReports = await prisma.reports.findMany({
      where: { user_id: targetId },
      include: { missions: true },
    });

    let paidCount = 0;
    let pendingCount = 0;
    let refusedCount = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalEarned = 0;

    userReports.forEach((r) => {
      const reward = r.missions?.reward ? parseFloat(r.missions.reward) : 0;
      totalEarned += reward;

      if (r.status === "paid") {
        paidCount++;
        totalPaid += reward;
      } else if (r.status === "approved" || r.status === "submitted") {
        pendingCount++;
        totalPending += reward;
      } else if (r.status === "refused") {
        refusedCount++;
      }
    });

    return res.status(200).json({
      message: "Statistiques récupérées avec succès",
      data: {
        total: userReports.length,
        paidCount,
        pendingCount,
        refusedCount,
        totalPaid,
        totalPending,
        totalEarned,
      },
    });
  } catch (err) {
    console.error("Erreur stats user:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
