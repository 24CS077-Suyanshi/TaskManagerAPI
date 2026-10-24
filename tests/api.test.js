const request = require("supertest");
const app = require("../app");

describe("API CI/CD Automated Tests", () => {
  // Test 1: DELIBERATELY BROKEN TEST for CI failure demonstration
  test("GET /api/unknown-endpoint returns 404 Not Found", async () => {
    const res = await request(app).get("/api/unknown-endpoint");
    // Deliberately expecting 200 instead of 404 to trigger CI Pipeline failure (Red X)
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Route not found");
  });

  // Test 2: Testing protected tasks route without token returns 401
  test("GET /api/tasks returns 401 when token is missing", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Access denied. Token required.");
  });

  // Test 3: Testing POST login validation returns error when missing credentials
  test("POST /api/auth/login returns 400 when body is empty", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});
    expect(res.statusCode).toBe(400);
  });
});
