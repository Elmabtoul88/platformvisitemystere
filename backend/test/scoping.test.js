const { describe, it } = require("node:test");
const assert = require("node:assert");

describe("API Scoping & IDOR Prevention Tests", () => {
  it("should prevent a client from accessing another client's missions", () => {
    const clientA = { id: 10, role: "client" };
    const clientB = { id: 20, role: "client" };

    const mockMissions = [
      { id: 101, clientId: 10, title: "Mission Client A" },
      { id: 102, clientId: 20, title: "Mission Client B" },
    ];

    // Simulating GET /api/clients/missions scoping
    const getClientMissions = (user) => {
      return mockMissions.filter((m) => m.clientId === user.id);
    };

    const clientAResults = getClientMissions(clientA);
    assert.strictEqual(clientAResults.length, 1);
    assert.strictEqual(clientAResults[0].id, 101);

    const clientBResults = getClientMissions(clientB);
    assert.strictEqual(clientBResults.length, 1);
    assert.strictEqual(clientBResults[0].id, 102);

    // Verify neither client can see the other's mission
    assert.ok(!clientAResults.some((m) => m.clientId === clientB.id));
    assert.ok(!clientBResults.some((m) => m.clientId === clientA.id));
  });

  it("should prevent IDOR in bank info retrieval", () => {
    const shopperUser = { id: 5, role: "shopper" };
    const attackerUser = { id: 99, role: "shopper" };

    const mockBankInfos = [
      { id: 1, user_id: 5, rib: "FR761234567890", bank_name: "BNP" },
      { id: 2, user_id: 99, rib: "FR769876543210", bank_name: "SG" },
    ];

    const getBankInfo = (requestUser, targetUserId) => {
      // Rule: users can only see their own bank info, unless they are admin
      if (requestUser.role !== "admin" && requestUser.id !== targetUserId) {
        return { status: 403, error: "Access denied: cannot access another user's banking info" };
      }
      const info = mockBankInfos.find((b) => b.user_id === targetUserId);
      return { status: 200, data: info };
    };

    // Shopper accessing own info
    const selfAccess = getBankInfo(shopperUser, 5);
    assert.strictEqual(selfAccess.status, 200);
    assert.strictEqual(selfAccess.data.bank_name, "BNP");

    // Attacker attempting IDOR to access shopper 5's info
    const idorAttempt = getBankInfo(attackerUser, 5);
    assert.strictEqual(idorAttempt.status, 403);
    assert.ok(idorAttempt.error.includes("Access denied"));
  });

  it("should prevent non-admin from accessing payments registry", () => {
    const isAllowedPaymentsAccess = (user) => {
      return user && user.role === "admin";
    };

    assert.strictEqual(isAllowedPaymentsAccess({ id: 1, role: "admin" }), true);
    assert.strictEqual(isAllowedPaymentsAccess({ id: 2, role: "shopper" }), false);
    assert.strictEqual(isAllowedPaymentsAccess({ id: 3, role: "client" }), false);
  });
});
