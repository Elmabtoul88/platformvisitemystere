const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const prisma = require("../prismaClient");

// GET /api/chat_messages - Liste de tous les messages (Admin uniquement)
router.get("/", adminAuth, async (req, res) => {
  try {
    const messages = await prisma.chat_messages.findMany({
      orderBy: { created_at: "desc" },
      take: 100,
    });
    return res.status(200).json(messages);
  } catch (err) {
    console.error("Erreur chat_messages:", err);
    return res.status(500).json({ message: "Erreur base de données" });
  }
});

// GET /api/chat_messages/:adminId - Conversations de l'admin avec compteurs non-lus
router.get("/:adminId", auth, async (req, res) => {
  const adminId = parseInt(req.params.adminId);
  if (isNaN(adminId)) return res.status(400).json({ error: "ID invalide" });

  if (req.user.role !== "admin" && req.user.id !== adminId) {
    return res.status(403).json({ error: "Accès refusé." });
  }

  try {
    // Récupérer les auditeurs ayant conversé
    const shoppers = await prisma.users.findMany({
      where: {
        role: "shopper",
        OR: [
          { chat_messages_chat_messages_sender_idTousers: { some: { receiver_id: adminId } } },
          { chat_messages_chat_messages_receiver_idTousers: { some: { sender_id: adminId } } },
        ],
      },
      select: {
        id: true,
        name: true,
        status: true,
        email: true,
        profile_pic_url: true,
        chat_messages_chat_messages_sender_idTousers: {
          where: {
            receiver_id: adminId,
            is_read: false,
          },
          select: { id: true },
        },
      },
    });

    const result = shoppers.map((s) => ({
      id: s.id,
      name: s.name,
      status: s.status,
      email: s.email,
      profile_pic_url: s.profile_pic_url,
      is_read: s.chat_messages_chat_messages_sender_idTousers.length, // nombre de messages non lus
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error("Erreur chat admin conversations:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// GET /api/chat_messages/message/:adminId/:userId - Messages entre deux participants
router.get("/message/:adminId/:userId", auth, async (req, res) => {
  const adminId = parseInt(req.params.adminId);
  const userId = parseInt(req.params.userId);

  if (isNaN(adminId) || isNaN(userId)) {
    return res.status(400).json({ error: "Identifiants invalides." });
  }

  // Contrôle d'accès strict (Empêche l'espionnage inter-utilisateurs)
  const isParticipant = req.user.id === adminId || req.user.id === userId;
  const isAdmin = req.user.role === "admin";

  if (!isParticipant && !isAdmin) {
    return res.status(403).json({ message: "Accès interdit à cette conversation." });
  }

  try {
    const messages = await prisma.chat_messages.findMany({
      where: {
        OR: [
          { sender_id: adminId, receiver_id: userId },
          { sender_id: userId, receiver_id: adminId },
        ],
      },
      include: {
        users_chat_messages_sender_idTousers: { select: { name: true } },
        users_chat_messages_receiver_idTousers: { select: { name: true } },
      },
      orderBy: { created_at: "asc" },
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      sender_id: m.sender_id,
      sender_name: m.users_chat_messages_sender_idTousers?.name,
      receiver_id: m.receiver_id,
      receiver_name: m.users_chat_messages_receiver_idTousers?.name,
      message_text: m.message_text,
      created_at: m.created_at,
      is_read: m.is_read ? 1 : 0,
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.error("Erreur récupération messages chat:", err);
    return res.status(500).json({ servererror: "Erreur base de données" });
  }
});

// POST /api/chat_messages - Envoi d'un message avec anti-usurpation d'identité
router.post("/", auth, async (req, res) => {
  const { receiver_id, message_text, is_read } = req.body;
  const targetReceiver = parseInt(receiver_id);

  if (!targetReceiver || !message_text || !message_text.trim()) {
    return res.status(400).json({
      success: false,
      message: "receiver_id et message_text sont requis",
    });
  }

  // Sécurité anti-spoofing : L'émetteur réel est TOUJOURS l'utilisateur connecté dans le JWT
  const senderId = req.user.id;

  try {
    const created = await prisma.chat_messages.create({
      data: {
        sender_id: senderId,
        receiver_id: targetReceiver,
        message_text: message_text.trim(),
        is_read: Boolean(is_read),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Message envoyé avec succès",
      messageId: created.id,
      data: created,
    });
  } catch (err) {
    console.error("Erreur envoi message:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur base de données",
      error: err.message,
    });
  }
});

// PATCH /api/chat_messages - Marquer des messages comme lus
router.patch("/", auth, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Liste d'identifiants requise" });
  }

  const validIds = ids.map((id) => parseInt(id)).filter((id) => !isNaN(id));

  try {
    // Seul le destinataire des messages peut les marquer comme lus
    const result = await prisma.chat_messages.updateMany({
      where: {
        id: { in: validIds },
        receiver_id: req.user.id,
      },
      data: { is_read: true },
    });

    return res.status(200).json({
      message: "Messages marqués comme lus",
      affectedRows: result.count,
    });
  } catch (err) {
    console.error("Erreur lecture messages:", err);
    return res.status(500).json({ message: "Erreur base de données" });
  }
});

module.exports = router;
