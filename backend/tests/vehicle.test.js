require("dotenv").config();
jest.setTimeout(30000);
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
describe("GET /api/vehicles", () => {
  test("should return all available vehicles", async () => {
    const response = await request(app)
      .get("/api/vehicles");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("vehicles");
    expect(Array.isArray(response.body.vehicles)).toBe(true);
  });
});
describe("GET /api/vehicles/search", () => {
  test("should search vehicles by make", async () => {
    const response = await request(app)
      .get("/api/vehicles/search?make=Toyota");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("vehicles");
    expect(Array.isArray(response.body.vehicles)).toBe(true);
  });

  test("should search vehicles by price range", async () => {
    const response = await request(app)
      .get("/api/vehicles/search?minPrice=20000&maxPrice=50000");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("vehicles");
    expect(Array.isArray(response.body.vehicles)).toBe(true);
  });
});
describe("PUT /api/vehicles/:id", () => {
  test("should update a vehicle", async () => {
    const createResponse = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        make: "Honda",
        model: "Civic",
        category: "Sedan",
        price: 25000,
        quantity: 3
      });

    expect(createResponse.statusCode).toBe(201);

    const vehicleId = createResponse.body.vehicle._id;

    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        price: 27000,
        quantity: 5
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.vehicle.price).toBe(27000);
    expect(response.body.vehicle.quantity).toBe(5);
  });
});
describe("PUT /api/vehicles/:id", () => {
  test("should update a vehicle", async () => {
    const createResponse = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        make: "Honda",
        model: "Civic",
        category: "Sedan",
        price: 25000,
        quantity: 3
      });

    expect(createResponse.statusCode).toBe(201);

    const vehicleId = createResponse.body.vehicle._id;

    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        price: 27000,
        quantity: 5
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.vehicle.price).toBe(27000);
    expect(response.body.vehicle.quantity).toBe(5);
  });
});
describe("DELETE /api/vehicles/:id", () => {
  test("should reject deleting a vehicle for a non-admin user", async () => {
    const createResponse = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        make: "Honda",
        model: "Civic",
        category: "Sedan",
        price: 25000,
        quantity: 3
      });

    const vehicleId = createResponse.body.vehicle._id;

    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
  });
});
describe("DELETE /api/vehicles/:id - Admin", () => {
  test("should allow an admin to delete a vehicle", async () => {
    const adminEmail = `admin${Date.now()}@example.com`;

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Admin User",
        email: adminEmail,
        password: "Admin123!"
      });

    expect(registerResponse.statusCode).toBe(201);

    const adminUser = await require("../src/models/User").findOne({
      email: adminEmail
    });

    adminUser.role = "admin";
    await adminUser.save();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password: "Admin123!"
      });

    expect(loginResponse.statusCode).toBe(200);

    const adminToken = loginResponse.body.token;

    const createResponse = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "BMW",
        model: "X5",
        category: "SUV",
        price: 60000,
        quantity: 2
      });

    expect(createResponse.statusCode).toBe(201);

    const vehicleId = createResponse.body.vehicle._id;

    const deleteResponse = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.message).toBe(
      "Vehicle deleted successfully"
    );
  });
});
describe("POST /api/vehicles/:id/purchase", () => {
  test("should purchase a vehicle and decrease quantity", async () => {
    const createResponse = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        make: "Toyota",
        model: "Fortuner",
        category: "SUV",
        price: 45000,
        quantity: 3
      });

    expect(createResponse.statusCode).toBe(201);

    const vehicleId = createResponse.body.vehicle._id;

    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.vehicle.quantity).toBe(2);
  });

  test("should reject purchase when quantity is zero", async () => {
    const createResponse = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        make: "Tesla",
        model: "Model 3",
        category: "Sedan",
        price: 40000,
        quantity: 0
      });

    expect(createResponse.statusCode).toBe(201);

    const vehicleId = createResponse.body.vehicle._id;

    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Vehicle is out of stock"
    );
  });
});
describe("POST /api/vehicles/:id/restock", () => {
  test("should reject restocking for a non-admin user", async () => {
    const createResponse = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        make: "Ford",
        model: "Endeavour",
        category: "SUV",
        price: 50000,
        quantity: 2
      });

    expect(createResponse.statusCode).toBe(201);

    const vehicleId = createResponse.body.vehicle._id;

    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        quantity: 5
      });

    expect(response.statusCode).toBe(403);
  });
});