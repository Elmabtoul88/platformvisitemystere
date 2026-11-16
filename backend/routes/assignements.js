const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const prisma = require("../prismaClient");

// GET /api/assignements - Récupérer toutes les missions assignées (basé sur applications.status = 'approved')
router.get("/", auth, async (req, res) => {
  try {
    const dbClient = req.prisma || prisma;
    const results = await dbClient.applications.findMany({
      where: { status: "approved" },
      include: {
        missions: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            profile_pic_url: true,
            completed_missions_count: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    const mapped = results.map((app) => ({
      id: app.id,
      application_id: app.id,
      mission_id: app.mission_id,
      user_id: app.user_id,
      assigned_at: app.applied_at,
      status: app.status,
      missions: app.missions,
      users: app.users,
    }));

    return res.status(200).json(mapped);
  } catch (error) {
    console.error("Erreur récupération assignements depuis applications:", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/assignements/:id - Missions assignées à un utilisateur (applications.status = 'approved')
router.get("/:id", auth, async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const dbClient = req.prisma || prisma;
    const approvedApps = await dbClient.applications.findMany({
      where: {
        user_id: userId,
        status: "approved",
      },
      include: {
        missions: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            profile_pic_url: true,
            completed_missions_count: true,
          },
        },
      },
    });

    if (approvedApps.length === 0) {
      return res.status(404).json({ message: "No assignments found for this user." });
    }

    const formatted = approvedApps.map((a) => ({
      assignment_id: a.id,
      application_id: a.id,
      user_id: a.users?.id,
      name: a.users?.name,
      email: a.users?.email,
      role: a.users?.role,
      user_status: a.users?.status,
      profile_pic_url: a.users?.profile_pic_url,
      completed_missions_count: a.users?.completed_missions_count,
      mission_id: a.missions?.id,
      title: a.missions?.title,
      description: a.missions?.description,
      deadline: a.missions?.deadline,
      reward: a.missions?.reward,
      latitude: a.missions?.latitude,
      longitude: a.missions?.longitude,
      category: a.missions?.category,
      mission_status: a.missions?.status,
      businessName: a.missions?.businessName,
      location: a.missions?.location,
      status: a.status,
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/assignements - Assigner via création/approbation d'application
router.post("/", auth, async (req, res) => {
  const { mission_id, user_id, store_id, scenario } = req.body;
  const missionId = parseInt(mission_id, 10);
  const userId = parseInt(user_id, 10);

  if (!missionId || !userId) {
    return res.status(400).json({ error: "mission_id and user_id are required" });
  }

  const dbClient = req.prisma || prisma;

  try {
    const existing = await dbClient.applications.findFirst({
      where: { mission_id: missionId, user_id: userId },
    });

    const storeIdsJson = store_id ? JSON.stringify([parseInt(store_id, 10)]) : JSON.stringify([]);

    let app;
    if (existing) {
      app = await dbClient.applications.update({
        where: { id: existing.id },
        data: {
          status: "approved",
          stores: storeIdsJson,
        },
      });
    } else {
      app = await dbClient.applications.create({
        data: {
          mission_id: missionId,
          user_id: userId,
          status: "approved",
          stores: storeIdsJson,
          quiz: "[]",
          applied_at: new Date(),
        },
      });
    }

    return res.status(200).json({
      message: "success",
      assignmentId: app.id,
      applicationId: app.id,
      success: true,
    });
  } catch (error) {
    console.error("Error assigning mission in applications:", error);
    return res.status(500).json({ error: "Database error", message: error.message });
  }
});

// GET /api/assignements/ass/:userId - Missions assignées au shopper (basé sur applications.status = 'approved')
router.get("/ass/:userId", auth, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "user_id is required" });
  }

  const dbClient = req.prisma || prisma;

  try {
    const rawSql = `
      SELECT  
        m.id,  
        m.title AS mission_title,  
        m.description,  
        m.deadline,  
        m.reward,  
        m.category,  
        m.location,  
        m.businessName,  
        a.id AS application_id,
        a.stores AS store_ids,
        u.id AS user_id,  
        u.city,
        COALESCE(r.status, 'assigned') AS status,
        s.id AS store_id,
        s.name AS store_name,
        s.city AS store_city,
        s.address AS store_address,
        s.latitude,
        s.longitude,
        s.category AS store_category,
        s.active
      FROM missions m  
      JOIN applications a ON m.id = a.mission_id AND a.status = 'approved'
      JOIN users u ON a.user_id = u.id  
      LEFT JOIN reports r ON r.mission_id = m.id AND r.user_id = u.id
      LEFT JOIN stores s ON s.mission_id = m.id
      WHERE u.id = ?  
      ORDER BY m.id
    `;

    const results = await dbClient.$queryRawUnsafe(rawSql, userId);

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "No assignment found" });
    }

    const missionsMap = {};

    results.forEach((row) => {
      if (!missionsMap[row.id]) {
        missionsMap[row.id] = {
          id: row.id,
          title: row.mission_title,
          description: row.description,
          deadline: row.deadline,
          reward: row.reward,
          category: row.category,
          location: row.location,
          businessName: row.businessName,
          user: {
            id: row.user_id,
            city: row.city,
          },
          status: row.status,
          stores: [],
        };
      }

      if (row.store_id) {
        missionsMap[row.id].stores.push({
          id: row.store_id,
          name: row.store_name,
          city: row.store_city,
          address: row.store_address,
          latitude: row.latitude,
          longitude: row.longitude,
          category: row.store_category,
          active: row.active,
        });
      }
    });

    return res.json(Object.values(missionsMap));
  } catch (error) {
    console.error("Database error in /ass/:userId:", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/assignements/multi - Assigner plusieurs utilisateurs (basé sur applications.status = 'approved')
router.post("/multi", [auth, adminAuth], async (req, res) => {
  const { mission_id, user_id, store_id } = req.body;
  const missionId = parseInt(mission_id, 10);

  if (!missionId || !Array.isArray(user_id) || user_id.length === 0) {
    return res.status(400).json({ error: "Format invalide. mission_id et user_id (tableau) requis." });
  }

  const dbClient = req.prisma || prisma;

  try {
    let resolvedStoreId = store_id ? parseInt(store_id, 10) : null;
    if (!resolvedStoreId) {
      const defaultStore = await dbClient.stores.findFirst({
        where: { mission_id: missionId },
      });
      resolvedStoreId = defaultStore ? defaultStore.id : null;
    }

    const storesJson = resolvedStoreId ? JSON.stringify([resolvedStoreId]) : JSON.stringify([]);

    const parsedUserIds = user_id
      .map((u) => parseInt(u, 10))
      .filter((u) => !isNaN(u) && u > 0);

    if (parsedUserIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Aucun utilisateur valide fourni." });
    }

    for (const parsedUid of parsedUserIds) {
      const userExists = await dbClient.users.findUnique({
        where: { id: parsedUid },
      });
      if (!userExists) {
        continue;
      }

      const existing = await dbClient.applications.findFirst({
        where: { mission_id: missionId, user_id: parsedUid },
      });

      if (existing) {
        await dbClient.applications.update({
          where: { id: existing.id },
          data: {
            status: "approved",
            ...(resolvedStoreId && { stores: storesJson }),
          },
        });
      } else {
        await dbClient.applications.create({
          data: {
            mission_id: missionId,
            user_id: parsedUid,
            status: "approved",
            stores: storesJson,
            quiz: "[]",
            applied_at: new Date(),
          },
        });
      }
    }

    // Mettre à jour la mission : assignedTo
    const currentMission = await dbClient.missions.findUnique({
      where: { id: missionId },
      select: { assignedTo: true },
    });

    let existingAssigned = [];
    if (currentMission?.assignedTo) {
      try {
        existingAssigned = JSON.parse(currentMission.assignedTo);
        if (!Array.isArray(existingAssigned)) existingAssigned = [];
      } catch (e) {
        existingAssigned = [];
      }
    }

    const mergedAssigned = Array.from(
      new Set([...existingAssigned, ...parsedUserIds]),
    );

    await dbClient.missions.update({
      where: { id: missionId },
      data: {
        assignedTo: JSON.stringify(mergedAssigned),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Users assigned successfully via applications",
      inserted: parsedUserIds.length,
    });
  } catch (error) {
    console.error("Erreur assignation multi dans applications:", error);
    return res.status(500).json({ error: "Database error", message: error.message, success: false });
  }
});

module.exports = router;
