jest.mock("../services/hfService", () => ({
    zeroShotClassification: jest.fn().mockResolvedValue([
        { labels: ["Backend", "Frontend", "Other"], scores: [0.9, 0.05, 0.05] },
    ]),
    classifyJobZeroShot: jest.fn().mockResolvedValue("Backend"),
    featureExtraction: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
    tokenClassification: jest.fn().mockResolvedValue([]),
}));

const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const JobPost = require("../models/JobPost");
const db = require("./helpers/db");

// Awaits any in-flight background classification/embedding promises that
// createJob fires after sending its response. Keeps the test deterministic.
async function flushBackgroundJobs() {
    const pending = app.locals.pendingJobs || [];
    app.locals.pendingJobs = [];
    await Promise.allSettled(pending);
}

beforeAll(() => db.connect());
afterAll(() => db.disconnect());
afterEach(() => db.clearCollections());

async function registerUser(payload) {
    const res = await request(app).post("/api/v1/auth/register").send(payload);
    return res.body.user;
}

async function loginUser(email, password) {
    const res = await request(app).post("/api/v1/auth/login").send({ email, password });
    return res.body.token;
}

const jobPayload = {
    title: "Backend Intern",
    company: "TechCo",
    description: "Node.js and MongoDB development role",
    requirements: ["Node.js", "MongoDB"],
    location: "Cairo",
    type: "internship",
};

describe("POST /api/v1/jobs", () => {
    it("creates a job with AI-assigned category for an approved recruiter", async () => {
        const user = await registerUser({
            name: "Recruiter One",
            email: "rec@test.com",
            password: "secret123",
            role: "recruiter",
        });
        await User.findByIdAndUpdate(user._id, { status: "approved" });
        const token = await loginUser("rec@test.com", "secret123");

        const res = await request(app)
            .post("/api/v1/jobs")
            .set("Authorization", `Bearer ${token}`)
            .send(jobPayload);

        // Job is created immediately with a placeholder category, then
        // the background classifier patches it with the real label.
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.job.category).toBe("Classifying...");
        expect(res.body.job.title).toBe("Backend Intern");

        // Wait for the background classification to complete, then re-fetch.
        await flushBackgroundJobs();
        const updated = await JobPost.findById(res.body.job._id);
        expect(updated.category).toBe("Backend");
    });

    it("returns 403 for a pending recruiter", async () => {
        await registerUser({
            name: "Pending Rec",
            email: "pending@test.com",
            password: "secret123",
            role: "recruiter",
        });
        const token = await loginUser("pending@test.com", "secret123");

        const res = await request(app)
            .post("/api/v1/jobs")
            .set("Authorization", `Bearer ${token}`)
            .send(jobPayload);

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it("returns 403 when a job seeker tries to create a job", async () => {
        await registerUser({
            name: "Sara Seeker",
            email: "sara@test.com",
            password: "secret123",
            role: "jobSeeker",
        });
        const token = await loginUser("sara@test.com", "secret123");

        const res = await request(app)
            .post("/api/v1/jobs")
            .set("Authorization", `Bearer ${token}`)
            .send(jobPayload);

        expect(res.statusCode).toBe(403);
    });
});

describe("POST /api/v1/jobs/:jobId/apply", () => {
    let seekerToken, jobId;

    beforeEach(async () => {
        // Create and approve recruiter, post a job
        const recruiter = await registerUser({
            name: "Recruiter",
            email: "rec@test.com",
            password: "secret123",
            role: "recruiter",
        });
        await User.findByIdAndUpdate(recruiter._id, { status: "approved" });
        const recruiterToken = await loginUser("rec@test.com", "secret123");

        const jobRes = await request(app)
            .post("/api/v1/jobs")
            .set("Authorization", `Bearer ${recruiterToken}`)
            .send(jobPayload);
        jobId = jobRes.body.job._id;
        await flushBackgroundJobs();

        // Create job seeker and get their token
        await registerUser({
            name: "Sara Ahmed",
            email: "sara@test.com",
            password: "secret123",
            role: "jobSeeker",
        });
        seekerToken = await loginUser("sara@test.com", "secret123");
    });

    it("submits an application successfully", async () => {
        const res = await request(app)
            .post(`/api/v1/jobs/${jobId}/apply`)
            .set("Authorization", `Bearer ${seekerToken}`)
            .send({ coverLetter: "I am very interested in this role." });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.application.status).toBe("pending");
    });

    it("rejects a duplicate application with 400", async () => {
        // First application
        await request(app)
            .post(`/api/v1/jobs/${jobId}/apply`)
            .set("Authorization", `Bearer ${seekerToken}`)
            .send({});

        // Duplicate
        const res = await request(app)
            .post(`/api/v1/jobs/${jobId}/apply`)
            .set("Authorization", `Bearer ${seekerToken}`)
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("returns 401 when applying without a token", async () => {
        const res = await request(app)
            .post(`/api/v1/jobs/${jobId}/apply`)
            .send({});

        expect(res.statusCode).toBe(401);
    });
});
