const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const { getUserEmailTemplate, checkActiveSlotReminders } = require("../routes/userNotifications");
const prisma = require("../prismaClient");

describe("Email Notification System Tests", () => {
  test("getUserEmailTemplate generates valid slotReminderEmail with mission details", () => {
    const template = getUserEmailTemplate("slotReminderEmail", {
      userName: "Youssef Test",
      missionTitle: "Visite Mystère Zara Mall",
      businessName: "Inditex Zara",
      storeName: "Zara Casablanca Marina",
      dateFormatted: "mardi 27 octobre 2026",
      slotFormatted: "14:00 → 16:00 (± 60 min)",
      reward: 150,
      actionUrl: "http://localhost:9002/missions/assigned",
    });

    assert.ok(template, "Template should be defined");
    assert.ok(template.subject.includes("Visite Mystère Zara Mall"), "Subject should include mission title");
    assert.ok(template.html.includes("Youssef Test"), "Body should contain user name");
    assert.ok(template.html.includes("Inditex Zara"), "Body should contain business name");
    assert.ok(template.html.includes("Zara Casablanca Marina"), "Body should contain store name");
    assert.ok(template.html.includes("14:00 → 16:00"), "Body should contain time slot");
    assert.ok(template.html.includes("150 MAD"), "Body should contain reward");
    assert.ok(template.html.includes("/missions/assigned"), "Body should contain action link");
  });

  test("getUserEmailTemplate handles other notification types correctly", () => {
    const newMissionTpl = getUserEmailTemplate("newMissionEmail", {
      userName: "Shopper",
      missionTitle: "Audit Café",
    });
    assert.ok(newMissionTpl.subject.includes("Nouvelle mission"), "Should handle newMissionEmail");

    const reportApprovedTpl = getUserEmailTemplate("reportStatusPush", {
      userName: "Shopper",
      status: "approved",
      reward: 100,
    });
    assert.ok(reportApprovedTpl.subject.includes("Approuvé"), "Should handle report approved");

    const reportRefusedTpl = getUserEmailTemplate("reportStatusPush", {
      userName: "Shopper",
      status: "refused",
      refusalReason: "Photos floues",
    });
    assert.ok(reportRefusedTpl.subject.includes("Refusé"), "Should handle report refused");
    assert.ok(reportRefusedTpl.html.includes("Photos floues"), "Should include refusal reason");
  });

  test("checkActiveSlotReminders executes without uncaught exceptions and returns status", async () => {
    const result = await checkActiveSlotReminders(prisma);
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.success, true);
    assert.strictEqual(typeof result.count, "number");
  });
});
