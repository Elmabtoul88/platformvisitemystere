const { describe, it } = require("node:test");
const assert = require("node:assert");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { auth, adminAuth, requireRole } = require("../middleware/auth");

describe("Role-Based Access Control (RBAC) Middleware Tests", () => {
  const secret = process.env.PRIVATEKEY || "secret";

  const createMockReqRes = (headers = {}, user = null) => {
    const normalizedHeaders = {};
    for (const [k, v] of Object.entries(headers)) {
      normalizedHeaders[k.toLowerCase()] = v;
    }

    const req = {
      header: (name) => normalizedHeaders[name.toLowerCase()] || null,
      headers: normalizedHeaders,
      user: user,
    };
    const res = {
      statusCode: null,
      data: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      send: function (msg) {
        this.data = msg;
        return this;
      },
      json: function (obj) {
        this.data = obj;
        return this;
      },
    };
    return { req, res };
  };

  it("auth middleware should reject requests without a token (401)", () => {
    const { req, res } = createMockReqRes({});
    let nextCalled = false;

    auth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
  });

  it("auth middleware should accept a valid token via x-auth-token", () => {
    const token = jwt.sign({ id: 10, role: "shopper" }, secret);
    const { req, res } = createMockReqRes({ "x-auth-token": token });
    let nextCalled = false;

    auth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.ok(req.user);
    assert.strictEqual(req.user.id, 10);
    assert.strictEqual(req.user.role, "shopper");
  });

  it("auth middleware should accept a valid Bearer token via authorization header", () => {
    const token = jwt.sign({ id: 25, role: "client" }, secret);
    const { req, res } = createMockReqRes({
      authorization: `Bearer ${token}`,
    });
    let nextCalled = false;

    auth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user.id, 25);
    assert.strictEqual(req.user.role, "client");
  });

  it("adminAuth should allow admin role and proceed", () => {
    const adminToken = jwt.sign({ id: 1, role: "admin" }, secret);
    const { req, res } = createMockReqRes(
      { "x-auth-token": adminToken },
      { id: 1, role: "admin" },
    );
    let nextCalled = false;

    adminAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
  });

  it("adminAuth should reject non-admin roles (shopper, client) with 403 Forbidden", () => {
    const shopperToken = jwt.sign({ id: 2, role: "shopper" }, secret);
    const { req, res } = createMockReqRes(
      { "x-auth-token": shopperToken },
      { id: 2, role: "shopper" },
    );
    let nextCalled = false;

    adminAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 403);
  });

  it("requireRole should enforce role hierarchy correctly", () => {
    // Case 1: Client accessing client-only route
    const clientReqRes = createMockReqRes({}, { id: 3, role: "client" });
    let clientNext = false;
    requireRole("client")(clientReqRes.req, clientReqRes.res, () => {
      clientNext = true;
    });
    assert.strictEqual(clientNext, true, "Client should be allowed for role 'client'");

    // Case 2: Shopper attempting to access client-only route
    const shopperReqRes = createMockReqRes({}, { id: 4, role: "shopper" });
    let shopperNext = false;
    requireRole("client")(shopperReqRes.req, shopperReqRes.res, () => {
      shopperNext = true;
    });
    assert.strictEqual(shopperNext, false, "Shopper should NOT be allowed for role 'client'");
    assert.strictEqual(shopperReqRes.res.statusCode, 403);
  });
});
