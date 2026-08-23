require("dotenv").config();

const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../src/app");
const connectDB = require("../src/config/db");

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("POST /api/auth/register", () => {
  test("should register a new user", async () => {
    const email = `test${Date.now()}@example.com`;

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email,
        password: "Test@123456"
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("email");
  });
});
describe("POST /api/auth/login", () => {
  test("should login an existing user", async () => {
    const email = `login${Date.now()}@example.com`;
    const password = "Test@123456";

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login User",
        email,
        password
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe(email);
  });
});
describe("POST /api/auth/login", () => {
  test("should login an existing user", async () => {
    const email = `login${Date.now()}@example.com`;
    const password = "Test@123456";

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login User",
        email,
        password
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe(email);
  });
});
describe("POST /api/auth/login", () => {
  test("should login an existing user", async () => {
    const email = `login${Date.now()}@example.com`;
    const password = "Test@123456";

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login User",
        email,
        password
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe(email);
  });

  test("should reject an incorrect password", async () => {
    const email = `wrong${Date.now()}@example.com`;

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Wrong Password User",
        email,
        password: "Correct@123"
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "Wrong@123"
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });
});