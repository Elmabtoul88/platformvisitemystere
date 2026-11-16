const { describe, it } = require("node:test");
const assert = require("node:assert");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { generateAuthToken, utilisateurValidation } = require("../models/users");

describe("Authentication & Token Security Unit Tests", () => {
  it("should generate a JWT token with safe payload (no password leak)", async () => {
    const user = {
      id: 42,
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      role: "shopper",
      password: "secret_password_hash_that_must_not_leak",
    };

    const token = await generateAuthToken(user);
    assert.ok(token, "Token should be generated");

    const decoded = jwt.decode(token);
    assert.strictEqual(decoded.id, 42);
    assert.strictEqual(decoded.name, "Jean Dupont");
    assert.strictEqual(decoded.email, "jean.dupont@example.com");
    assert.strictEqual(decoded.role, "shopper");

    // CRITICAL: Password hash must NEVER be present in the token payload
    assert.strictEqual(
      decoded.password,
      undefined,
      "Password hash must NOT be in token payload",
    );
  });

  it("should validate user input using Joi schema correctly", () => {
    const validUser = {
      name: "Alice Martin",
      email: "alice@example.com",
      password: "strongPassword123",
      role: "shopper",
    };
    const { error } = utilisateurValidation(validUser);
    assert.strictEqual(error, null, "Valid user should pass validation");

    const invalidUser = {
      name: "Alice",
      email: "invalid-email",
      password: "123", // too short (<6)
    };
    const result = utilisateurValidation(invalidUser);
    assert.ok(result.error, "Invalid user should fail validation");
  });

  it("should hash and verify passwords correctly with bcrypt", async () => {
    const plainPassword = "MySecurePassword2026!";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    assert.notStrictEqual(hashedPassword, plainPassword);

    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    assert.strictEqual(isMatch, true, "Correct password should match");

    const isWrongMatch = await bcrypt.compare("WrongPassword", hashedPassword);
    assert.strictEqual(isWrongMatch, false, "Incorrect password should not match");
  });

  it("should verify token signature using the secret key", () => {
    const secret = process.env.PRIVATEKEY || "secret";
    const payload = { id: 1, role: "admin" };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    const verified = jwt.verify(token, secret);
    assert.strictEqual(verified.id, 1);
    assert.strictEqual(verified.role, "admin");

    assert.throws(() => {
      jwt.verify(token, "wrongSecretKey");
    }, /invalid signature/);
  });
});
