# GIU Nexus — AI-Powered Career & Talent Platform

GIU Nexus is a full-stack AI-powered career and talent platform designed to connect university students with recruiters through intelligent job matching and automated skill extraction. Unlike traditional job boards, the system leverages natural language processing models from the Hugging Face API to analyze student profiles, identify relevant technical skills, classify job postings into appropriate categories, and recommend the most suitable opportunities to each user.

The platform supports three main user roles: job seekers, recruiters, and system administrators. Students can create profiles, receive AI-generated skill insights, browse personalized job recommendations, and track their applications. Recruiters can post and manage job listings while reviewing applicants efficiently. Administrators oversee recruiter approvals, monitor listings, and maintain overall platform integrity.

This project is being developed using the MERN stack (MongoDB, Express.js, React, Node.js) following collaborative Git workflows and modular schema design as part of the Software Engineering course milestone deliverables.

---

## Team Members

| Name | Role |
|------|------|
| Mostafa Abuelabbas | Team Lead |
| Hasan Mahmoud | Auth Middleware |
| Ziad Moharam | Profile Routes |
| Mohamed Amr | Auth + Admin Routes |
| Ismail Samir | HuggingFace + Email Services |
| Yassin Elazab | Auth Logout + Password Reset |
| Mohamed Hafez | Job Save + Apply |
| Abdelrahman Ihab | Job CRUD |
| Sarah Ibrahim | AI Integrations |
| Nour Galal | Application Routes |

---

## Milestones

### Milestone 1 — Schema Design
- User Schema (jobSeeker, recruiter, admin roles)
- JobPost Schema (with AI category field)
- Application Schema (with unique compound index)

### Milestone 2 — Backend Development ✅
Complete Node.js/Express REST API with JWT authentication, role-based access control, and three HuggingFace AI integrations.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Database | MongoDB (via Mongoose) |
| Backend | Express.js on Node.js |
| Frontend | React.js (Milestone 3) |
| AI | Hugging Face Inference API |
| Auth | JSON Web Tokens (JWT) + bcryptjs |
| Email | Nodemailer |
| File Upload | Multer + Cloudinary |
| Testing | Jest + Supertest + mongodb-memory-server |
| CI/CD | GitHub Actions |
| Containerisation | Docker + Docker Compose |

---

## Getting Started

### Prerequisites
- Node.js v20+
- MongoDB Atlas account (or Docker for local)
- Hugging Face account (free token)
- Cloudinary account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/mostafaabuelabbas-wq/GIU-Nexus.git
cd GIU-Nexus/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your values in .env

# Start development server
npm run dev
```

### Using Docker (recommended)

```bash
# From the root of the repository
docker compose up --build
```

This starts both the Express server (port 5000) and a MongoDB container. No local Node.js or MongoDB installation required.

### Running Tests

```bash
cd backend
npm test
```

16/16 tests pass. No real database or Hugging Face API needed.

---

## API Overview

Base URL: `http://localhost:5000/api/v1`

Interactive documentation: `http://localhost:5000/api-docs`

| Route | Method | Access |
|-------|--------|--------|
| /auth/register | POST | Public |
| /auth/login | POST | Public |
| /auth/logout | POST | Private |
| /auth/forgot-password | POST | Public |
| /auth/verify-otp | POST | Public |
| /auth/reset-password/:token | PATCH | Public |
| /users | GET | Admin |
| /users/:id/status | PATCH | Admin |
| /admin/stats | GET | Admin |
| /profile | GET / PATCH | Private |
| /profile/change-password | PATCH | Private |
| /profile/extract-skills | POST | Job Seeker |
| /jobs | GET | Public |
| /jobs | POST | Recruiter (approved) |
| /jobs/recommended | GET | Job Seeker |
| /jobs/my-jobs | GET | Recruiter |
| /jobs/saved | GET | Job Seeker |
| /jobs/:id/save | POST | Job Seeker |
| /jobs/:jobId/apply | POST | Job Seeker |
| /jobs/:jobId/applicants | GET | Recruiter (owner) |
| /applications/my | GET | Job Seeker |
| /applications/:id/status | PATCH | Recruiter |
| /applications | GET | Admin |

---

## AI Features

| Feature | Model | Endpoint |
|---------|-------|----------|
| Skill Extraction (NER) | dslim/bert-base-NER | POST /profile/extract-skills |
| Job Classification | facebook/bart-large-mnli | POST /jobs (automatic) |
| Job Recommendations | sentence-transformers/all-MiniLM-L6-v2 | GET /jobs/recommended |

---

## Bonus Features

- ✅ Rate Limiting — 10 req/15 min on auth routes, 5 req/10 min on OTP
- ✅ Token Blacklist Logout — jti claim + in-memory Set
- ✅ OTP-based MFA — 6-digit OTP via email for password reset
- ✅ Swagger / OpenAPI Docs — Interactive docs at /api-docs
- ✅ Profile Picture Upload — multer + Cloudinary
- ✅ Extended Admin Stats — applicationsPerWeek time-series
- ✅ Jest + Supertest Tests — 16/16 passing
- ✅ CI/CD GitHub Actions — runs on every push to main
- ✅ Docker Containerisation — docker compose up --build

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-random-secret
JWT_EXPIRE=7d
HF_TOKEN=hf_xxxxxxxxxxxx
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_SECRET=your-secret
```

⚠️ Never commit your .env file. It is in .gitignore.
```
backend/
├── config/
│   ├── db.js
│   ├── cloudinary.js
│   └── swagger.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── jobController.js
│   ├── applicationController.js
│   └── profileController.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   ├── tokenBlacklist.js
│   └── upload.js
├── models/
│   ├── User.js
│   ├── JobPost.js
│   └── Application.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── jobRoutes.js
│   ├── applicationRoutes.js
│   └── profileRoutes.js
├── services/
│   ├── hfService.js
│   └── emailService.js
├── tests/
│   ├── auth.test.js
│   ├── jobs.test.js
│   ├── profile.test.js
│   ├── env-setup.js
│   └── helpers/db.js
├── app.js
├── server.js
├── jest.config.js
├── .env.example
└── package.json
```

*Software Engineering — Spring 2026 — German International University — Dr. John Zaki*
