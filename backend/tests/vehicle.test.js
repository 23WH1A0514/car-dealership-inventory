require("dotenv").config();

const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../src/app");
const connectDB = require("../src/config/db");

let token;

beforeAll(async () => {
  await connectDB();

  const email = `vehicle${Date.now()}@example.com`;

  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Vehicle User",
      email,
      password: "Test@123456"
    });

  token = response.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("POST /api/vehicles", () => {
  test("should add a new vehicle for an authenticated user", async () => {
    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 28000,
        quantity: 5
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body.vehicle).toHaveProperty("make", "Toyota");
    expect(response.body.vehicle).toHaveProperty("model", "Camry");
    expect(response.body.vehicle).toHaveProperty("quantity", 5);
  });
});