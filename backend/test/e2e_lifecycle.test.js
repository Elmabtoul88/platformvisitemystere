/**
 * Test E2E complet du cycle de vie :
 * 1. Créer une mission et son enquête
 * 2. Postuler à la mission (Shopper)
 * 3. Accepter la candidature (Admin)
 * 4. Remplir le questionnaire / rapport (Shopper)
 * 5. Accepter le rapport (Admin)
 * 6. Vérifier l'inscription et les détails dans les paiements (Admin)
 */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");

const BASE_URL = "http://localhost:5000/api";
const JWT_SECRET = process.env.PRIVATEKEY || "votre_cle_secrete_tres_longue_et_securisee_ici_minimum_32_caracteres";

describe("E2E Mission Lifecycle: Création -> Enquête -> Candidature -> Approbation -> Rapport -> Validation -> Paiement", () => {
  let adminToken;
  let shopperToken;
  let adminUser;
  let shopperUser;
  let createdMissionId;
  let createdStoreId;
  let createdApplicationId;
  let createdReportId;

  before(async () => {
    // 1. Récupérer un admin et un shopper
    adminUser = await prisma.users.findFirst({ where: { role: "admin" } });
    shopperUser = await prisma.users.findFirst({ where: { role: "shopper" } });

    assert.ok(adminUser, "Un utilisateur admin doit exister");
    assert.ok(shopperUser, "Un utilisateur shopper doit exister");

    // 2. Générer les tokens JWT sécurisés
    adminToken = jwt.sign(
      { id: adminUser.id, role: adminUser.role, email: adminUser.email, name: adminUser.name },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    shopperToken = jwt.sign(
      { id: shopperUser.id, role: shopperUser.role, email: shopperUser.email, name: shopperUser.name },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
  });

  after(async () => {
    // Nettoyage sécurisé des données de test
    if (createdReportId) {
      await prisma.reports.deleteMany({ where: { id: createdReportId } }).catch(() => {});
    }
    if (createdApplicationId) {
      await prisma.applications.deleteMany({ where: { id: createdApplicationId } }).catch(() => {});
    }
    if (createdMissionId) {
      await prisma.survey_questions.deleteMany({ where: { mission_id: createdMissionId } }).catch(() => {});
      await prisma.stores.deleteMany({ where: { mission_id: createdMissionId } }).catch(() => {});
      await prisma.missions.deleteMany({ where: { id: createdMissionId } }).catch(() => {});
    }
  });

  test("Étape 1: Création d'une mission avec magasin et questions d'enquête", async () => {
    // Créer la mission via Prisma
    const mission = await prisma.missions.create({
      data: {
        title: "Mission Audit Test " + Date.now(),
        description: "Test automatisé du flux complet",
        businessName: "Prestige Luxe Test",
        location: "Casablanca",
        reward: 450.00,
        status: "available",
        clientId: 5,
        deadline: new Date(Date.now() + 86400000 * 7),
      },
    });
    createdMissionId = mission.id;
    assert.ok(createdMissionId, "La mission doit avoir un ID");

    // Créer le store associé
    const store = await prisma.stores.create({
      data: {
        mission_id: createdMissionId,
        name: "Store Prestige Anfa",
        address: "Boulevard d'Anfa",
        city: "Casablanca",
        latitude: 33.589882,
        longitude: -7.632488,
        category: "Retail",
      },
    });
    createdStoreId = store.id;
    assert.ok(createdStoreId, "Le magasin doit avoir un ID");

    // Créer l'enquête via l'endpoint API POST /api/surveyQuestions
    const surveyRes = await fetch(`${BASE_URL}/surveyQuestions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        mission_id: createdMissionId,
        questions: [
          {
            type: "text",
            label: "Accueil et politesse",
            description: "Détaillez la prise en charge à l'entrée",
            required: true,
            order_num: 1,
            section_id: "sec_accueil",
            section_header: "Section Accueil",
          },
          {
            type: "rating",
            label: "Propreté générale",
            description: "Notez la propreté de 1 à 5",
            required: true,
            order_num: 2,
            options: ["1", "2", "3", "4", "5"],
            section_id: "sec_magasin",
            section_header: "Section Magasin",
          },
        ],
      }),
    });

    const surveyData = await surveyRes.json();
    assert.strictEqual(surveyRes.status, 200, "L'enquête doit être créée avec succès (200)");
    assert.strictEqual(surveyData.success, true);
    assert.strictEqual(surveyData.inserted, 2);
  });

  test("Étape 2: Le Shopper postule à la mission", async () => {
    // POST /api/applications
    const applyRes = await fetch(`${BASE_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${shopperToken}`,
      },
      body: JSON.stringify({
        user_id: shopperUser.id,
        mission_id: createdMissionId,
        status: "pending",
        stores: JSON.stringify([createdStoreId]),
        quiz: JSON.stringify([{ question: "Êtes-vous majeur ?", response: "Oui" }]),
      }),
    });

    assert.strictEqual(applyRes.status, 201, "La candidature doit être créée (201)");
    const applyData = await applyRes.json();
    createdApplicationId = applyData.application_id || applyData.applicationId;
    assert.ok(createdApplicationId, "L'application doit avoir un applicationId");

    // Vérifier dans la base
    const appDb = await prisma.applications.findUnique({
      where: { id: createdApplicationId },
    });
    assert.strictEqual(appDb.status, "pending");

    // Vérifier qu'une tentative de re-postuler est immédiatement bloquée (409)
    const duplicateRes = await fetch(`${BASE_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${shopperToken}`,
      },
      body: JSON.stringify({
        user_id: shopperUser.id,
        mission_id: createdMissionId,
        status: "pending",
        stores: JSON.stringify([createdStoreId]),
        quiz: JSON.stringify([{ question: "Êtes-vous majeur ?", response: "Oui" }]),
      }),
    });
    assert.strictEqual(duplicateRes.status, 409, "Une deuxième candidature doit être rejetée avec 409 Conflict");
    const duplicateData = await duplicateRes.json();
    assert.strictEqual(duplicateData.has_applied, true);
  });

  test("Étape 3: L'Admin accepte et valide la candidature avec créneau et magasin", async () => {
    // 1. Validation des magasins : PATCH /api/applications/validate/:id
    const validateRes = await fetch(`${BASE_URL}/applications/validate/${createdApplicationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        selectedStores: [createdStoreId],
        status: "approved",
      }),
    });

    assert.strictEqual(validateRes.status, 200, "Validation des stores doit réussir (200)");

    // 2. Attribution date et créneau : PATCH /api/applications/patch/:id
    const patchRes = await fetch(`${BASE_URL}/applications/patch/${createdApplicationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        mission_date: new Date().toISOString(),
        time_slot: "open",
      }),
    });

    assert.strictEqual(patchRes.status, 200, "Mise à jour du créneau doit réussir (200)");

    // 3. Vérifier que la mission apparaît bien dans les missions assignées du shopper
    const assignedRes = await fetch(`${BASE_URL}/applications/assigned/${shopperUser.id}`, {
      headers: {
        "Authorization": `Bearer ${shopperToken}`,
      },
    });

    assert.strictEqual(assignedRes.status, 200);
    const assignedList = await assignedRes.json();
    const found = assignedList.find((a) => a.mission_id === createdMissionId);
    assert.ok(found, "La mission doit apparaître dans la liste des missions assignées du shopper");
    assert.strictEqual(found.status, "approved");
  });

  test("Étape 4: Le Shopper remplit et soumet le questionnaire final (rapport)", async () => {
    const reportPayload = {
      mission_id: createdMissionId,
      user_id: shopperUser.id,
      store_id: createdStoreId,
      nomMagazin: "Store Prestige Anfa",
      specificStoreAddress: "Boulevard d'Anfa",
      ville: "Casablanca",
      status: "submitted",
      answers: [
        {
          section_id: "sec_accueil",
          section_header: "Section Accueil",
          responses: [
            { label: "Accueil et politesse", value: "Accueil exemplaire avec le sourire." },
          ],
        },
        {
          section_id: "sec_magasin",
          section_header: "Section Magasin",
          responses: [
            { label: "Propreté générale", value: "5" },
          ],
        },
      ],
    };

    const reportRes = await fetch(`${BASE_URL}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${shopperToken}`,
      },
      body: JSON.stringify(reportPayload),
    });

    assert.strictEqual(reportRes.status, 200, "Le rapport doit être soumis avec succès (200)");
    const reportData = await reportRes.json();
    assert.strictEqual(reportData.success, true);
    createdReportId = reportData.data?.reportId || reportData.reportId;
    assert.ok(createdReportId, "Un reportId doit être renvoyé");

    // Vérifier l'état dans la base
    const reportDb = await prisma.reports.findUnique({
      where: { id: createdReportId },
    });
    assert.strictEqual(reportDb.status, "submitted");
    assert.strictEqual(reportDb.store_id, createdStoreId);
  });

  test("Étape 5: L'Admin accepte et valide le rapport", async () => {
    const approveRes = await fetch(`${BASE_URL}/reports/${createdReportId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: "approved",
      }),
    });

    assert.strictEqual(approveRes.status, 200, "La validation du rapport doit réussir (200)");
    const approveData = await approveRes.json();
    assert.strictEqual(approveData.success, true);
    assert.strictEqual(approveData.data.status, "approved");

    // Vérification DB
    const reportDb = await prisma.reports.findUnique({
      where: { id: createdReportId },
    });
    assert.strictEqual(reportDb.status, "approved");
  });

  test("Étape 6: Vérification de l'inscription et des détails dans la gestion des paiements", async () => {
    const payRes = await fetch(`${BASE_URL}/paiyments/payment_missions`, {
      headers: {
        "Authorization": `Bearer ${adminToken}`,
      },
    });

    assert.strictEqual(payRes.status, 200, "L'endpoint des paiements doit répondre 200");
    const payData = await payRes.json();
    assert.strictEqual(payData.success, true);
    assert.ok(Array.isArray(payData.data.payments), "La réponse doit contenir un tableau de paiements");

    const paymentEntry = payData.data.payments.find((p) => p.reportId === createdReportId);
    assert.ok(paymentEntry, "Le rapport validé doit figurer dans le registre des paiements");
    assert.strictEqual(paymentEntry.paymentStatus, "pending", "Le statut de paiement initial doit être pending");
    assert.strictEqual(paymentEntry.reward, 450, "Le montant de la récompense doit être exactement 450 MAD");
    assert.strictEqual(paymentEntry.userId, shopperUser.id, "Le paiement doit être attribué au shopper");
    assert.strictEqual(paymentEntry.missionId, createdMissionId, "Le paiement doit correspondre à la mission créée");
    assert.strictEqual(paymentEntry.storeId, createdStoreId, "Le paiement doit inclure le store_id");
  });
});
