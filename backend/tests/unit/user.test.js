//ED
import { test } from "node:test";
import assert from "node:assert";
import { register, login, logout } from "../../controller/user.controller.js";
import User from "../../model/user.model.js";
import bcrypt from "bcryptjs";

// JWT_SECRET necessary for generateToken
process.env.JWT_SECRET = "test-secret";

// Suppress console logs during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
console.log = () => {};
console.error = () => {};

// ===================================
// FAKE RESPONSE
// ===================================
function createRes() {
  return {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
    }
  };
}

// ===================================
// TEST REGISTER ALREADY EXISTING USER
// ===================================
test("register → returns 400 if user already exists", async () => {
    User.findOne = async () => ({ email: "exists@test.com" });
    const req = {
      body: { username: "exists", email: "exists@test.com", password: "12345678" } };
    const res = createRes();
    await register(req, res);
    assert.equal(res.statusCode, 400);
});

// ===================================
// TEST REGISTER INVALID
// ===================================

test("register → returns 400 if input invalid", async () => {
  User.findOne = async () => null;

  const req = {
    body: { username: "ab", email: "wrong", password: "123" }
  };

  const res = createRes();
  await register(req, res);

  assert.equal(res.statusCode, 400);
});

// ===================================
// TEST REGISTER VALID
// ===================================

test("register → returns 201 when valid", async () => {
  User.findOne = async () => null; // no existing user
  User.prototype.save = async function () {
    return { username: this.username, email: this.email };
  };

  bcrypt.hash = async () => "hashedpwd";

  const req = {
    body: {
      username: "amine",
      email: "amine@test.com",
      password: "12345678"
    }
  };

  const res = createRes();
  await register(req, res);

  assert.equal(res.statusCode, 201);
});

// ===================================
// TEST LOGIN SUCCESS
// ===================================

test("login → returns 200 when credentials valid", async () => {
  User.findOne = () => ({
    select: async () => ({
      email: "amine@test.com",
      password: "hashedpwd"
    })
  });

  bcrypt.compare = async () => true;

  const req = {
    body: { email: "amine@test.com", password: "12345678" }
  };

  const res = createRes();
  await login(req, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.jsonData.token);
});

// ===================================
// TEST LOGIN WRONG PASSWORD
// ===================================

test("login → returns 400 incorrect password", async () => {
  User.findOne = () => ({
    select: async () => ({
      email: "amine@test.com",
      password: "hashedpwd"
    })
  });

  bcrypt.compare = async () => false;

  const req = {
    body: { email: "amine@test.com", password: "wrong" }
  };

  const res = createRes();
  await login(req, res);

  assert.equal(res.statusCode, 400);
});

// ===================================
// TEST LOGOUT
// ===================================

test("logout → returns 200", async () => {
  const res = createRes();
  await logout({}, res);
  assert.equal(res.statusCode, 200);
});
/*
// ===================================
// DEMO: INTENTIONAL FAILING TEST
// ===================================
test("DEMO → intentional failure for pipeline demo", async () => {
  // This test intentionally fails to demonstrate error detection
  assert.equal(1, 2, "This test fails on purpose for demo");
});*/