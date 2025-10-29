import request from "supertest";
import app from "../app.js";
import { describe, it, expect } from "@jest/globals";

describe("Vacation Request API", () => {
  let testUserEmail = "john.doe@example.com"; // Using seeded user

  describe("POST /requests", () => {
    it("should create a new vacation request", async () => {
      const requestData = {
        userEmail: testUserEmail,
        startDate: "2025-09-01",
        endDate: "2025-09-05",
        reason: "Family vacation",
      };

      const response = await request(app).post("/requests").send(requestData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Vacation request created successfully"
      );
      expect(response.body.data).toHaveProperty("startDate");
      expect(response.body.data).toHaveProperty("status");
      expect(response.body.data.status).toBe("Pending");
    });

    it("should reject invalid dates (end before start)", async () => {
      const requestData = {
        userEmail: testUserEmail,
        startDate: "2025-09-05",
        endDate: "2025-09-01",
        reason: "Test",
      };

      const response = await request(app).post("/requests").send(requestData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty("error");
    });

    it("should reject request with non-existent user", async () => {
      const requestData = {
        userEmail: "nonexistent@example.com",
        startDate: "2025-09-01",
        endDate: "2025-09-05",
        reason: "Test",
      };

      const response = await request(app).post("/requests").send(requestData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("User not found");
    });

    it("should reject request with invalid email format", async () => {
      const requestData = {
        userEmail: "invalid-email",
        startDate: "2025-09-01",
        endDate: "2025-09-05",
        reason: "Test",
      };

      const response = await request(app).post("/requests").send(requestData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /requests", () => {
    it("should retrieve all vacation requests", async () => {
      const response = await request(app).get("/requests");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter by status", async () => {
      const response = await request(app)
        .get("/requests")
        .query({ status: "Pending" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter by userEmail", async () => {
      const response = await request(app)
        .get("/requests")
        .query({ userEmail: testUserEmail });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter by both userEmail and status", async () => {
      const response = await request(app)
        .get("/requests")
        .query({ userEmail: testUserEmail, status: "Pending" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("POST /requests/handle-request", () => {
    it("should approve a vacation request", async () => {
      // First create a request
      const createData = {
        userEmail: testUserEmail,
        startDate: "2025-10-01",
        endDate: "2025-10-05",
        reason: "Test approval",
      };

      await request(app).post("/requests").send(createData);

      // Then approve it
      const updateData = {
        userEmail: testUserEmail,
        startDate: "2025-10-01",
        endDate: "2025-10-05",
        status: "Approved",
        comments: "Looks good",
      };

      const response = await request(app)
        .post("/requests/handle-request")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("Approved");
      expect(response.body.data.comments).toBe("Looks good");
    });

    it("should reject a vacation request", async () => {
      // First create a request
      const createData = {
        userEmail: testUserEmail,
        startDate: "2025-11-01",
        endDate: "2025-11-05",
        reason: "Test rejection",
      };

      await request(app).post("/requests").send(createData);

      // Then reject it
      const updateData = {
        userEmail: testUserEmail,
        startDate: "2025-11-01",
        endDate: "2025-11-05",
        status: "Rejected",
        comments: "Not approved",
      };

      const response = await request(app)
        .post("/requests/handle-request")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("Rejected");
    });

    it("should fail to update non-existent request", async () => {
      const updateData = {
        userEmail: testUserEmail,
        startDate: "2099-12-01",
        endDate: "2099-12-05",
        status: "Approved",
        comments: "Test",
      };

      const response = await request(app)
        .post("/requests/handle-request")
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
