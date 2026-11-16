const { describe, it } = require("node:test");
const assert = require("node:assert");
const prisma = require("../prismaClient");

describe("Prisma ORM Database Connectivity & Query Tests", () => {
  it("should successfully query users table via Prisma without raw SQL errors", async () => {
    try {
      const userCount = await prisma.users.count();
      assert.ok(typeof userCount === "number", "User count should be a number");
      assert.ok(userCount >= 0, "User count should be non-negative");
    } catch (error) {
      assert.fail(`Prisma database query failed: ${error.message}`);
    }
  });

  it("should successfully query missions table with relations and limits", async () => {
    try {
      const sampleMissions = await prisma.missions.findMany({
        take: 5,
        orderBy: { id: "desc" },
      });
      assert.ok(Array.isArray(sampleMissions), "Missions should be returned as an array");
    } catch (error) {
      assert.fail(`Prisma missions query failed: ${error.message}`);
    }
  });

  it("should successfully query stores table via Prisma", async () => {
    try {
      const sampleStores = await prisma.stores.findMany({
        take: 5,
      });
      assert.ok(Array.isArray(sampleStores), "Stores should be returned as an array");
    } catch (error) {
      assert.fail(`Prisma stores query failed: ${error.message}`);
    }
  });
});
