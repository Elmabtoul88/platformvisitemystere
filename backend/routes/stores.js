const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const prisma = require("../prismaClient");

// GET /api/stores/missions - tous les magasins
router.get("/missions", async (req, res) => {
  try {
    const dbClient = req.prisma || prisma;
    const results = await dbClient.stores.findMany({
      orderBy: { created_at: "desc" },
    });
    return res.json(results);
  } catch (error) {
    if (req.db) {
      req.db.query("SELECT * FROM stores ORDER BY created_at DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(results);
      });
      return;
    }
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/map - magasins actifs avec métadonnées de mission
router.get("/map", async (req, res) => {
  try {
    const dbClient = req.prisma || prisma;
    const results = await dbClient.$queryRawUnsafe(`
      SELECT 
        s.*,
        m.title as mission_title,
        m.reward as mission_reward,
        m.status as mission_status,
        m.description as mission_description
      FROM stores s
      LEFT JOIN missions m ON s.mission_id = m.id
      WHERE s.active = 1
      ORDER BY s.created_at DESC
    `);
    return res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    if (req.db) {
      req.db.query(
        `SELECT 
          s.*,
          m.title as mission_title,
          m.reward as mission_reward,
          m.status as mission_status,
          m.description as mission_description
        FROM stores s
        LEFT JOIN missions m ON s.mission_id = m.id
        WHERE s.active = 1
        ORDER BY s.created_at DESC`,
        (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          return res.json({ success: true, data: results, count: results.length });
        }
      );
      return;
    }
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/:mission_id - magasins pour une mission
router.get("/:mission_id", async (req, res) => {
  const missionId = parseInt(req.params.mission_id, 10);
  if (isNaN(missionId)) {
    return res.status(400).json({ message: "Invalid mission ID" });
  }
  try {
    const dbClient = req.prisma || prisma;
    const results = await dbClient.stores.findMany({
      where: { mission_id: missionId },
    });
    return res.json(results);
  } catch (error) {
    if (req.db) {
      req.db.query("SELECT * FROM stores WHERE mission_id = ?", [missionId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(results);
      });
      return;
    }
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/:id/stores - détail d'un magasin
router.get("/:id/stores", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid store ID" });
  }
  try {
    const dbClient = req.prisma || prisma;
    const store = await dbClient.stores.findUnique({
      where: { id },
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    return res.json(store);
  } catch (error) {
    if (req.db) {
      req.db.query("SELECT * FROM stores WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Store not found" });
        return res.json(results[0]);
      });
      return;
    }
    return res.status(500).json({ error: error.message });
  }
});

// Helper pour parser les coordonnées GPS (Optionnelles)
const parseCoord = (val) => {
  if (val === null || val === undefined || val === "" || String(val).trim() === "") {
    return null;
  }
  const num = parseFloat(String(val).replace(",", "."));
  return isNaN(num) ? null : num;
};

// POST /api/stores - Créer un magasin (Admin only)
router.post("/", [auth, adminAuth], async (req, res) => {
  const {
    mission_id,
    name,
    city,
    address,
    latitude,
    longitude,
    category,
    active,
  } = req.body;

  if (!mission_id || !name || !city || !address) {
    return res.status(400).json({
      success: false,
      message: "La mission, le nom, la ville et l'adresse sont obligatoires.",
    });
  }

  const parsedMissionId = parseInt(mission_id, 10);
  if (isNaN(parsedMissionId)) {
    return res.status(400).json({
      success: false,
      message: "L'identifiant de mission est invalide.",
    });
  }

  try {
    const dbClient = req.prisma || prisma;
    const newStore = await dbClient.stores.create({
      data: {
        mission_id: parsedMissionId,
        name: String(name).trim(),
        city: String(city).trim(),
        address: String(address).trim(),
        latitude: parseCoord(latitude),
        longitude: parseCoord(longitude),
        category: category ? String(category).trim() : null,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return res.json({
      success: true,
      message: "Magasin créé avec succès",
      id: newStore.id,
      store: newStore,
    });
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: `La mission sélectionnée (ID ${parsedMissionId}) n'existe pas ou a été supprimée.`,
      });
    }
    console.error("Erreur création magasin avec Prisma:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création du magasin : " + (error.message || ""),
    });
  }
});

// PUT /api/stores/:id - Mettre à jour un magasin (Admin only)
router.put("/:id", [auth, adminAuth], async (req, res) => {
  const storeId = parseInt(req.params.id, 10);
  if (isNaN(storeId)) {
    return res.status(400).json({ success: false, message: "ID de magasin invalide." });
  }

  const {
    mission_id,
    name,
    city,
    address,
    latitude,
    longitude,
    category,
    active,
  } = req.body;

  try {
    const dbClient = req.prisma || prisma;
    await dbClient.stores.update({
      where: { id: storeId },
      data: {
        ...(mission_id !== undefined && { mission_id: parseInt(mission_id, 10) }),
        ...(name !== undefined && { name: String(name).trim() }),
        ...(city !== undefined && { city: String(city).trim() }),
        ...(address !== undefined && { address: String(address).trim() }),
        ...(latitude !== undefined && { latitude: parseCoord(latitude) }),
        ...(longitude !== undefined && { longitude: parseCoord(longitude) }),
        ...(category !== undefined && { category: category ? String(category).trim() : null }),
        ...(active !== undefined && { active: Boolean(active) }),
        updated_at: new Date(),
      },
    });

    return res.json({ success: true, message: "Magasin mis à jour avec succès." });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Magasin non trouvé." });
    }
    console.error("Erreur mise à jour magasin avec Prisma:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour." });
  }
});

// PATCH /api/stores/:id/toggle-status - Activer/Désactiver (Admin only)
router.patch("/:id/toggle-status", [auth, adminAuth], async (req, res) => {
  const storeId = parseInt(req.params.id, 10);
  if (isNaN(storeId)) {
    return res.status(400).json({ success: false, message: "ID de magasin invalide." });
  }

  try {
    const dbClient = req.prisma || prisma;
    const store = await dbClient.stores.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ success: false, message: "Magasin non trouvé." });
    }

    const updated = await dbClient.stores.update({
      where: { id: storeId },
      data: {
        active: !store.active,
        updated_at: new Date(),
      },
    });

    return res.json({
      success: true,
      message: `Magasin ${updated.active ? "activé" : "désactivé"} avec succès.`,
    });
  } catch (error) {
    console.error("Erreur toggle statut magasin:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// POST /api/stores/batch - Import en masse (Admin only)
router.post("/batch", [auth, adminAuth], async (req, res) => {
  const stores = req.body;
  if (!Array.isArray(stores) || stores.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Aucun magasin fourni pour l'import.",
    });
  }

  const validStores = [];
  const errors = [];

  for (let idx = 0; idx < stores.length; idx++) {
    const s = stores[idx];
    const rowNum = idx + 2; // Première ligne = en-tête

    const name = s.name || s.nom || s.magasin;
    const city = s.city || s.ville;
    const address = s.address || s.adresse;
    const missionIdRaw = s.mission_id || s.id_mission || s.mission;

    if (!name || !city || !address || missionIdRaw === undefined || missionIdRaw === null) {
      errors.push(`Ligne ${rowNum} ignorée : Nom, ville, adresse ou mission manquants.`);
      continue;
    }

    const missionId = parseInt(missionIdRaw, 10);
    if (isNaN(missionId)) {
      errors.push(`Ligne ${rowNum} ignorée : ID de mission "${missionIdRaw}" invalide.`);
      continue;
    }

    const latRaw = s.latitude !== undefined ? s.latitude : s.lat;
    const lngRaw = s.longitude !== undefined ? s.longitude : (s.lng !== undefined ? s.lng : s.lon);
    const catRaw = s.category || s.categorie;
    const actRaw = s.active !== undefined ? s.active : s.actif;

    validStores.push({
      mission_id: missionId,
      name: String(name).trim(),
      city: String(city).trim(),
      address: String(address).trim(),
      latitude: parseCoord(latRaw),
      longitude: parseCoord(lngRaw),
      category: catRaw ? String(catRaw).trim() : null,
      active: actRaw !== undefined ? (actRaw === true || actRaw === 1 || String(actRaw).toLowerCase() === "oui" || String(actRaw).toLowerCase() === "true") : true,
    });
  }

  if (validStores.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Aucun magasin valide n'a pu être extrait. Vérifiez les colonnes obligatoires (nom, ville, adresse, mission_id).",
      errors,
    });
  }

  try {
    const dbClient = req.prisma || prisma;
    const result = await dbClient.stores.createMany({
      data: validStores,
    });

    return res.json({
      success: true,
      message: `${result.count} magasin(s) importé(s) avec succès${errors.length ? ` (${errors.length} ligne(s) ignorée(s))` : ""}.`,
      count: result.count,
      warnings: errors,
    });
  } catch (error) {
    console.error("Erreur import batch magasins avec Prisma:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'import des magasins : " + (error.message || ""),
    });
  }
});

module.exports = router;
