const request = require("supertest");
const app = require("../app");
const db = require("./helpers/db");

beforeAll(() => db.connect());
afterAll(() => db.disconnect());
afterEach(() => db.clearCollections());

describe("POST /api/v1/auth/register", () => {
    it("registers a job seeker and returns a token", async () => {
        const res = await request(app).post("/api/v1/auth/register").send({
            name: "Sara Ahmed",
            email: "sara@test.com",
            password: "secret123",
            role: "jobSeeker",
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.role).toBe("jobSeeker");
        expect(res.body.user.status).toBe("approved");
    });

    it("registers a recruiter with status pending", async () => {
        const res = await request(app).post("/api/v1/auth/register").send({
            name: "Ali Recruiter",
            email: "ali@test.com",
            password: "secret123",
            role: "recruiter",
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.user.role).toBe("recruiter");
        expect(res.body.user.status).toBe("pending");
    });

    it("rejects duplicate email with 400", async () => {
        const payload = {
            name: "Sara Ahmed",
            email: "sara@test.com",
            password: "secret123",
            role: "jobSeeker",
        };
        await request(app).post("/api/v1/auth/register").send(payload);

        const res = await request(app).post("/api/v1/auth/register").send(payload);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("rejects missing fields with 400", async () => {
        const res = await request(app).post("/api/v1/auth/register").send({
            email: "nopw@test.com",
            role: "jobSeeker",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
        await request(app).post("/api/v1/auth/register").send({
            name: "Sara Ahmed",
            email: "sara@test.com",
            password: "secret123",
            role: "jobSeeker",
        });
    });

    it("logs in with valid credentials and returns a token", async () => {
        const res = await request(app).post("/api/v1/auth/login").send({
            email: "sara@test.com",
            password: "secret123",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe("sara@test.com");
    });

    it("returns 401 for wrong password", async () => {
        const res = await request(app).post("/api/v1/auth/login").send({
            email: "sara@test.com",
            password: "wrongpassword",
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("returns 401 for non-existent email", async () => {
        const res = await request(app).post("/api/v1/auth/login").send({
            email: "ghost@test.com",
            password: "secret123",
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
