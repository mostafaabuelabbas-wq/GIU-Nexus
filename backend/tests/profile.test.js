jest.mock("../services/hfService", () => ({
    tokenClassification: jest.fn().mockResolvedValue([
        { word: "React", entity_group: "B-MISC", score: 0.99 },
        { word: "Node.js", entity_group: "B-ORG", score: 0.95 },
        { word: "MongoDB", entity_group: "B-ORG", score: 0.92 },
    ]),
    featureExtraction: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
    zeroShotClassification: jest.fn().mockResolvedValue([
        { labels: ["Backend"], scores: [0.9] },
    ]),
}));

const request = require("supertest");
const app = require("../app");
const db = require("./helpers/db");

beforeAll(() => db.connect());
afterAll(() => db.disconnect());
afterEach(() => db.clearCollections());

async function registerAndLogin() {
    await request(app).post("/api/v1/auth/register").send({
        name: "Sara Ahmed",
        email: "sara@test.com",
        password: "secret123",
        role: "jobSeeker",
    });
    const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "sara@test.com",
        password: "secret123",
    });
    return loginRes.body.token;
}

describe("POST /api/v1/profile/extract-skills", () => {
    it("returns 400 when bio is empty", async () => {
        const token = await registerAndLogin();

        const res = await request(app)
            .post("/api/v1/profile/extract-skills")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/bio is empty/i);
    });

    it("extracts skills from bio and saves them to the profile", async () => {
        const token = await registerAndLogin();

        // Update bio first
        await request(app)
            .patch("/api/v1/profile")
            .set("Authorization", `Bearer ${token}`)
            .send({ bio: "I work with React, Node.js, and MongoDB daily." });

        const res = await request(app)
            .post("/api/v1/profile/extract-skills")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.skills)).toBe(true);
        expect(res.body.skills).toContain("React");
        expect(res.body.skills).toContain("Node.js");
    });

    it("returns 401 when called without a token", async () => {
        const res = await request(app).post("/api/v1/profile/extract-skills");

        expect(res.statusCode).toBe(401);
    });
});
