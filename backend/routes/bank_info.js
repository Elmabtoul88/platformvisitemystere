// routes/bankInfoRoutes.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const prisma = require("../prismaClient");

// GET - Récupérer les infos bancaires par user_id
router.get("/:userId", auth, async (req, res) => {
  const targetId = parseInt(req.params.userId);

  if (isNaN(targetId)) {
    return res.status(400).json({ error: "ID utilisateur invalide", data: null });
  }

  // Contrôle d'accès strict (IDOR protection)
  if (req.user.role !== "admin" && req.user.id !== targetId) {
    return res.status(403).json({ error: "Accès refusé aux informations bancaires.", data: null });
  }

  try {
    const bankInfo = await prisma.bank_info.findFirst({
      where: { user_id: targetId },
    });

    if (!bankInfo) {
      return res.status(200).json({
        message: "Aucune information bancaire trouvée",
        data: null,
      });
    }

    return res.status(200).json({
      message: "Informations bancaires récupérées avec succès",
      data: bankInfo,
    });
  } catch (err) {
    console.error("Erreur récupération bank_info:", err);
    return res.status(500).json({ error: "Erreur serveur.", data: null });
  }
});

// POST - Créer des informations bancaires
router.post("/", auth, async (req, res) => {
  const { user_id, account_holder, rib, bank_name, swift, country, currency } = req.body;
  const targetId = parseInt(user_id);

  if (isNaN(targetId) || !account_holder || !rib || !bank_name) {
    return res.status(400).json({
      error: "user_id, account_holder, rib et bank_name sont requis",
    });
  }

  // Contrôle d'accès strict
  if (req.user.role !== "admin" && req.user.id !== targetId) {
    return res.status(403).json({ error: "Vous ne pouvez enregistrer que vos propres coordonnées bancaires." });
  }

  try {
    const existing = await prisma.bank_info.findFirst({
      where: { user_id: targetId },
    });

    if (existing) {
      return res.status(409).json({
        error: "Des informations bancaires existent déjà pour cet utilisateur. Utilisez PUT pour mettre à jour.",
      });
    }

    const created = await prisma.bank_info.create({
      data: {
        user_id: targetId,
        account_holder: account_holder.trim(),
        rib: rib.trim(),
        bank_name: bank_name.trim(),
        swift: swift ? swift.trim() : null,
        country: country ? country.trim() : "Maroc",
        currency: currency ? currency.trim() : "MAD",
      },
    });

    return res.status(201).json({
      id: created.id,
      message: "Informations bancaires créées avec succès",
      data: created,
    });
  } catch (err) {
    console.error("Erreur création bank_info:", err);
    return res.status(500).json({ error: "Erreur lors de l'enregistrement bancaire." });
  }
});

// PUT - Mettre à jour les informations bancaires
router.put("/:userId", auth, async (req, res) => {
  const targetId = parseInt(req.params.userId);
  const { account_holder, rib, bank_name, swift, country, currency } = req.body;

  if (isNaN(targetId) || !account_holder || !rib || !bank_name) {
    return res.status(400).json({
      error: "Données bancaires incomplètes.",
    });
  }

  if (req.user.role !== "admin" && req.user.id !== targetId) {
    return res.status(403).json({ error: "Action non autorisée." });
  }

  try {
    const existing = await prisma.bank_info.findFirst({
      where: { user_id: targetId },
    });

    let updated;
    if (existing) {
      updated = await prisma.bank_info.update({
        where: { id: existing.id },
        data: {
          account_holder: account_holder.trim(),
          rib: rib.trim(),
          bank_name: bank_name.trim(),
          swift: swift ? swift.trim() : null,
          country: country ? country.trim() : "Maroc",
          currency: currency ? currency.trim() : "MAD",
        },
      });
    } else {
      updated = await prisma.bank_info.create({
        data: {
          user_id: targetId,
          account_holder: account_holder.trim(),
          rib: rib.trim(),
          bank_name: bank_name.trim(),
          swift: swift ? swift.trim() : null,
          country: country ? country.trim() : "Maroc",
          currency: currency ? currency.trim() : "MAD",
        },
      });
    }

    return res.status(200).json({
      message: "Informations bancaires mises à jour avec succès",
      data: updated,
    });
  } catch (err) {
    console.error("Erreur mise à jour bank_info:", err);
    return res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
  }
});

// DELETE - Supprimer les informations bancaires
router.delete("/:userId", auth, async (req, res) => {
  const targetId = parseInt(req.params.userId);
  if (isNaN(targetId)) return res.status(400).json({ error: "ID invalide." });

  if (req.user.role !== "admin" && req.user.id !== targetId) {
    return res.status(403).json({ error: "Action non autorisée." });
  }

  try {
    const existing = await prisma.bank_info.findFirst({
      where: { user_id: targetId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Aucune information bancaire trouvée." });
    }

    await prisma.bank_info.delete({ where: { id: existing.id } });

    return res.status(200).json({ message: "Informations bancaires supprimées avec succès." });
  } catch (err) {
    console.error("Erreur suppression bank_info:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
