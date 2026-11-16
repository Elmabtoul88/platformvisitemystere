const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert");
const {
  authRateLimiter,
  recordFailedAttempt,
  resetLoginAttempts,
} = require("../middleware/rateLimiter");

describe("Rate Limiter Middleware Unit Tests", () => {
  const testIp = "192.168.1.100";

  beforeEach(() => {
    // Reset test IP state before each test
    resetLoginAttempts({ ip: testIp });
  });

  it("should allow request when no failed attempts are recorded", () => {
    let nextCalled = false;
    const req = { ip: testIp, headers: {} };
    const res = {};

    authRateLimiter(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true, "next() should be called when under limit");
  });

  it("should allow requests up to the maximum failed attempt threshold", () => {
    const req = { ip: testIp, headers: {} };

    // Record 9 failed attempts (< 10)
    for (let i = 0; i < 9; i++) {
      recordFailedAttempt(req);
    }

    let nextCalled = false;
    authRateLimiter(req, {}, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true, "9 attempts should still be allowed");
  });

  it("should return HTTP 429 when failed attempts reach or exceed 10", () => {
    const req = { ip: testIp, headers: {} };

    // Record 10 failed attempts
    for (let i = 0; i < 10; i++) {
      recordFailedAttempt(req);
    }

    let statusCode = null;
    let jsonResponse = null;
    const headers = {};

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      },
      set(key, val) {
        headers[key] = val;
      },
    };

    let nextCalled = false;
    authRateLimiter(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false, "next() should NOT be called after 10 attempts");
    assert.strictEqual(statusCode, 429, "Status should be 429 Too Many Requests");
    assert.strictEqual(jsonResponse.status, 429);
    assert.strictEqual(jsonResponse.success, false);
    assert.ok(headers["Retry-After"], "Retry-After header should be set");
    assert.strictEqual(headers["X-RateLimit-Limit"], "10");
    assert.strictEqual(headers["X-RateLimit-Remaining"], "0");
  });

  it("should reset failed attempts when resetLoginAttempts is called", () => {
    const req = { ip: testIp, headers: {} };

    // Record 10 failed attempts (blocked)
    for (let i = 0; i < 10; i++) {
      recordFailedAttempt(req);
    }

    // Reset attempts (e.g. successful login)
    resetLoginAttempts(req);

    let nextCalled = false;
    authRateLimiter(req, {}, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true, "next() should be called after resetLoginAttempts");
  });

  it("should identify client IP from x-forwarded-for header (cPanel reverse proxy)", () => {
    const proxyIp = "203.0.113.195";
    const req = {
      ip: "127.0.0.1",
      headers: { "x-forwarded-for": `${proxyIp}, 10.0.0.1` },
    };

    resetLoginAttempts(req);

    for (let i = 0; i < 10; i++) {
      recordFailedAttempt(req);
    }

    let statusCode = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json() {
        return this;
      },
      set() {},
    };

    authRateLimiter(req, res, () => {});
    assert.strictEqual(statusCode, 429, "Should block based on x-forwarded-for IP");

    // Clean up
    resetLoginAttempts(req);
  });
});
