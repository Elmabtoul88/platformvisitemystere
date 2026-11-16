const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const prisma = require("../prismaClient");

// GET /api/clients/missions - Liste des missions appartenant au client connecté
router.get("/missions", auth, async (req, res) => {
  try {
    const isClient = req.user.role === "client";
    const isAdmin = req.user.role === "admin";

    if (!isClient && !isAdmin) {
      return res.status(403).json({ message: "Accès réservé aux clients et administrateurs." });
    }

    const whereClause = isClient ? { clientId: req.user.id } : {};

    const missions = await prisma.missions.findMany({
      where: whereClause,
      include: {
        stores: true,
        _count: {
          select: {
            reports: true,
            applications: true,
          },
        },
      },
      orderBy: { deadline: "desc" },
    });

    return res.status(200).json(missions);
  } catch (err) {
    console.error("Erreur récupération missions client:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// GET /api/clients/mission/:id - Détail d'une mission avec vérification de propriété
router.get("/mission/:id", auth, async (req, res) => {
  const missionId = parseInt(req.params.id);
  if (isNaN(missionId)) return res.status(400).json({ error: "ID invalide" });

  try {
    const isClient = req.user.role === "client";
    const isAdmin = req.user.role === "admin";

    if (!isClient && !isAdmin) {
      return res.status(403).json({ message: "Accès réservé aux clients et administrateurs." });
    }

    const mission = await prisma.missions.findUnique({
      where: { id: missionId },
      include: { stores: true },
    });

    if (!mission) {
      return res.status(404).json({ message: "Mission non trouvée" });
    }

    // Sécurité BOLA : Le client ne peut voir QUE ses propres missions
    if (isClient && Number(mission.clientId) !== Number(req.user.id)) {
      return res.status(403).json({ message: "Accès interdit à cette mission." });
    }

    return res.status(200).json([mission]);
  } catch (err) {
    console.error("Erreur mission client:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// GET /api/clients/reports/:id - Rapports approuvés et payés d'une mission du client
router.get("/reports/:id", auth, async (req, res) => {
  const missionId = parseInt(req.params.id);
  if (isNaN(missionId)) return res.status(400).json({ error: "ID invalide" });

  try {
    const isClient = req.user.role === "client";
    const isAdmin = req.user.role === "admin";

    if (!isClient && !isAdmin) {
      return res.status(403).json({ message: "Accès réservé aux clients et administrateurs." });
    }

    const mission = await prisma.missions.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return res.status(404).json({ message: "Mission non trouvée" });
    }

    if (isClient && Number(mission.clientId) !== Number(req.user.id)) {
      return res.status(403).json({ message: "Accès refusé aux rapports de cette mission." });
    }

    const reports = await prisma.reports.findMany({
      where: {
        mission_id: missionId,
        status: { in: ["approved", "paid"] },
      },
      include: {
        missions: true,
      },
      orderBy: { submitted_at: "desc" },
    });

    return res.status(200).json(reports);
  } catch (err) {
    console.error("Erreur rapports client:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
