/* eslint-disable no-console */
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
const mongoose = require('mongoose')

const User        = require('./models/User')
const JobPost     = require('./models/JobPost')
const Application = require('./models/Application')

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing from .env')
  process.exit(1)
}

/* ───────────────────────── hardcoded test accounts ───────────────────────── */
const ACCOUNTS = [
  { name: 'Site Admin',         email: 'admin@giu.edu',              password: 'Admin123!',     role: 'admin' },

  { name: 'Hany — TechCo',      email: 'recruiter1@techco.com',      password: 'Recruiter123!', role: 'recruiter', status: 'approved' },
  { name: 'Salma — SmartVision',email: 'recruiter2@smartvision.com', password: 'Recruiter123!', role: 'recruiter', status: 'approved' },
  { name: 'Karim — UITech',     email: 'recruiter3@uitech.com',      password: 'Recruiter123!', role: 'recruiter', status: 'approved' },
  { name: 'Pending Startup',    email: 'pending@startup.com',        password: 'Recruiter123!', role: 'recruiter', status: 'pending'  },

  { name: 'Mariam Khaled',  email: 'seeker1@giu.edu', password: 'Seeker123!', role: 'jobSeeker', bio: 'CS senior at GIU, love React and TypeScript.',         skills: ['React','TypeScript','Node.js'] },
  { name: 'Omar Hassan',    email: 'seeker2@giu.edu', password: 'Seeker123!', role: 'jobSeeker', bio: 'Backend-focused, comfortable in Node and Python.',     skills: ['Node.js','Python','MongoDB'] },
  { name: 'Yara Adel',      email: 'seeker3@giu.edu', password: 'Seeker123!', role: 'jobSeeker', bio: 'Curious about ML, did a CV project last semester.',   skills: ['Python','PyTorch','OpenCV'] },
  { name: 'Adam Sherif',    email: 'seeker4@giu.edu', password: 'Seeker123!', role: 'jobSeeker', bio: 'DevOps enthusiast, ran CI/CD for my graduation project.', skills: ['AWS','Docker','Linux'] },
  { name: 'Hana Mostafa',   email: 'seeker5@giu.edu', password: 'Seeker123!', role: 'jobSeeker', bio: 'Aspiring data engineer, fluent in SQL.',              skills: ['SQL','Python','Airflow'] },
]

/* ──────────────────────────── job seed templates ─────────────────────────── */
const buildJobs = (r1, r2, r3) => ([
  // ── Frontend (3)
  { title: 'React Frontend Engineer',   company: 'TechCo',      category: 'Frontend',         type: 'full-time',  location: 'Cairo',      workMode: 'hybrid', salary: 25000, experienceLevel: 'mid',    createdBy: r1, totalSlots: 2, requirements: ['React','TypeScript','Tailwind'],   description: 'Build user-facing features for our flagship analytics dashboard.' },
  { title: 'Frontend Intern',           company: 'SmartVision', category: 'Frontend',         type: 'internship', location: 'Alexandria', workMode: 'onsite', salary: 6000,  experienceLevel: 'entry',  createdBy: r2, totalSlots: 4, requirements: ['HTML','CSS','React basics'],       description: 'Three-month summer internship — learn the modern web stack with a mentor.' },
  { title: 'Senior UI Engineer',        company: 'UITech',      category: 'Frontend',         type: 'full-time',  location: 'Remote',     workMode: 'remote', salary: 45000, experienceLevel: 'senior', createdBy: r3, totalSlots: 1, requirements: ['React','Design systems','Accessibility'], description: 'Lead our design-system overhaul. Senior IC role, full remote.' },

  // ── Backend (3)
  { title: 'Node.js Backend Developer', company: 'TechCo',      category: 'Backend',          type: 'full-time',  location: 'Cairo',      workMode: 'hybrid', salary: 28000, experienceLevel: 'mid',    createdBy: r1, totalSlots: 2, requirements: ['Node.js','Express','MongoDB'],     description: 'Build and scale our REST APIs across the platform.' },
  { title: 'Backend Engineering Intern',company: 'SmartVision', category: 'Backend',          type: 'internship', location: 'Cairo',      workMode: 'onsite', salary: 7000,  experienceLevel: 'entry',  createdBy: r2, totalSlots: 3, requirements: ['Python','SQL','Git'],              description: 'Paid internship inside our core API team.' },
  { title: 'Go Backend Engineer',       company: 'UITech',      category: 'Backend',          type: 'part-time',  location: 'Remote',     workMode: 'remote', salary: 18000, experienceLevel: 'mid',    createdBy: r3, totalSlots: 1, requirements: ['Go','PostgreSQL','gRPC'],          description: 'Part-time contract on our payments microservice.' },

  // ── AI/ML (3)
  { title: 'Machine Learning Engineer', company: 'TechCo',      category: 'AI/ML',            type: 'full-time',  location: 'Remote',     workMode: 'remote', salary: 40000, experienceLevel: 'senior', createdBy: r1, totalSlots: 1, requirements: ['PyTorch','NLP','Python'],          description: 'Own our recommendation and ranking models end-to-end.' },
  { title: 'ML Research Intern',        company: 'SmartVision', category: 'AI/ML',            type: 'internship', location: 'Cairo',      workMode: 'hybrid', salary: 8000,  experienceLevel: 'entry',  createdBy: r2, totalSlots: 2, requirements: ['Python','Statistics','Curiosity'], description: 'Six-month research internship alongside our applied ML team.' },
  { title: 'Computer Vision Engineer',  company: 'UITech',      category: 'AI/ML',            type: 'full-time',  location: 'Alexandria', workMode: 'onsite', salary: 35000, experienceLevel: 'mid',    createdBy: r3, totalSlots: 1, requirements: ['OpenCV','PyTorch','C++'],          description: 'Computer vision for industrial automation on the factory floor.' },

  // ── DevOps (2)
  { title: 'DevOps Engineer',           company: 'TechCo',      category: 'DevOps',           type: 'full-time',  location: 'Cairo',      workMode: 'hybrid', salary: 32000, experienceLevel: 'mid',    createdBy: r1, totalSlots: 1, requirements: ['AWS','Kubernetes','Terraform'],    description: 'Own our cloud infrastructure across staging and production.' },
  { title: 'Site Reliability Engineer', company: 'UITech',      category: 'DevOps',           type: 'full-time',  location: 'Remote',     workMode: 'remote', salary: 38000, experienceLevel: 'senior', createdBy: r3, totalSlots: 1, requirements: ['Linux','Prometheus','Ansible'],    description: 'Keep production humming. On-call rotation with healthy boundaries.' },

  // ── Data Engineering (2)
  { title: 'Data Engineer',             company: 'SmartVision', category: 'Data Engineering', type: 'full-time',  location: 'Cairo',      workMode: 'hybrid', salary: 30000, experienceLevel: 'mid',    createdBy: r2, totalSlots: 2, requirements: ['Airflow','Spark','SQL'],           description: 'Design and operate our batch + streaming data pipelines.' },
  { title: 'Junior Data Engineer',      company: 'TechCo',      category: 'Data Engineering', type: 'part-time',  location: 'Remote',     workMode: 'remote', salary: 15000, experienceLevel: 'entry',  createdBy: r1, totalSlots: 1, requirements: ['SQL','Python','dbt'],              description: 'Part-time pipeline work — flexible hours, perfect for students.' },

  // ── Other (2)
  { title: 'Technical Project Manager', company: 'UITech',      category: 'Other',            type: 'full-time',  location: 'Cairo',      workMode: 'onsite', salary: 35000, experienceLevel: 'senior', createdBy: r3, totalSlots: 1, requirements: ['Agile','Jira','Communication'],    description: 'PM for our enterprise integrations team.' },
  { title: 'QA Engineer',               company: 'SmartVision', category: 'Other',            type: 'full-time',  location: 'Alexandria', workMode: 'onsite', salary: 22000, experienceLevel: 'mid',    createdBy: r2, totalSlots: 2, requirements: ['Cypress','Playwright','Manual testing'], description: 'Own our QA strategy across web and mobile.' },
])

/* ─────────────────────────────────── run ─────────────────────────────────── */
async function seed() {
  console.log('\n🌱  Connecting to MongoDB…')
  await mongoose.connect(MONGO_URI)
  console.log(`   ✓ connected to ${mongoose.connection.name}\n`)

  // ── Wipe ────────────────────────────────────────────────────────────────
  console.log('🧹  Wiping existing data…')
  const deletedUsers = await User.deleteMany({})
  const deletedJobs  = await JobPost.deleteMany({})
  const deletedApps  = await Application.deleteMany({})
  console.log(`   ✓ users:        ${deletedUsers.deletedCount} deleted`)
  console.log(`   ✓ jobs:         ${deletedJobs.deletedCount} deleted`)
  console.log(`   ✓ applications: ${deletedApps.deletedCount} deleted\n`)

  // ── Users ───────────────────────────────────────────────────────────────
  // Use .create() (NOT insertMany) so the pre('save') bcrypt hook runs.
  console.log('👤  Creating users…')
  const users = []
  for (const acc of ACCOUNTS) {
    const u = await User.create(acc)
    users.push(u)
  }
  console.log(`   ✓ ${users.length} users created\n`)

  const admin       = users.find(u => u.role === 'admin')
  const recruiter1  = users.find(u => u.email === 'recruiter1@techco.com')
  const recruiter2  = users.find(u => u.email === 'recruiter2@smartvision.com')
  const recruiter3  = users.find(u => u.email === 'recruiter3@uitech.com')
  const seekers     = users.filter(u => u.role === 'jobSeeker')

  // ── Jobs ────────────────────────────────────────────────────────────────
  console.log('💼  Creating jobs…')
  const jobs = await JobPost.insertMany(buildJobs(recruiter1._id, recruiter2._id, recruiter3._id))
  console.log(`   ✓ ${jobs.length} jobs created across 6 categories\n`)

  // ── Applications ────────────────────────────────────────────────────────
  console.log('📨  Creating applications…')
  const findJob = (title) => jobs.find(j => j.title === title)

  const apps = [
    // seeker1 (frontend-leaning)
    { user: seekers[0]._id, job: findJob('React Frontend Engineer')._id,    status: 'shortlisted', coverLetter: 'Excited to bring my React experience to your team.' },
    { user: seekers[0]._id, job: findJob('Senior UI Engineer')._id,         status: 'pending',     coverLetter: 'Senior IC role aligns with my goals.' },
    { user: seekers[0]._id, job: findJob('Frontend Intern')._id,            status: 'rejected',    coverLetter: 'Open to internship roles for hands-on learning.' },

    // seeker2 (backend)
    { user: seekers[1]._id, job: findJob('Node.js Backend Developer')._id,  status: 'pending',     coverLetter: 'Strong Node/Express background.' },
    { user: seekers[1]._id, job: findJob('Backend Engineering Intern')._id, status: 'shortlisted', coverLetter: 'Internship ready — happy to start immediately.' },

    // seeker3 (ML)
    { user: seekers[2]._id, job: findJob('ML Research Intern')._id,         status: 'pending',     coverLetter: 'Did a CV final project last semester.' },
    { user: seekers[2]._id, job: findJob('Computer Vision Engineer')._id,   status: 'rejected',    coverLetter: 'CV is my main interest area.' },

    // seeker4 (devops)
    { user: seekers[3]._id, job: findJob('DevOps Engineer')._id,            status: 'pending',     coverLetter: 'Owned CI/CD for my graduation project.' },

    // seeker5 (data)
    { user: seekers[4]._id, job: findJob('Junior Data Engineer')._id,       status: 'shortlisted', coverLetter: 'Comfortable in SQL and Python pipelines.' },
  ]
  await Application.insertMany(apps)
  console.log(`   ✓ ${apps.length} applications created`)

  // ── Sync cached applicantCount on each JobPost ──────────────────────────
  // The dashboard reads job.applicantCount (cached counter). Bumping it here
  // so the seed data is internally consistent.
  const countsByJob = apps.reduce((acc, a) => {
    const id = String(a.job)
    acc[id] = (acc[id] || 0) + 1
    return acc
  }, {})
  const updateResults = await Promise.all(
    Object.entries(countsByJob).map(([jobId, count]) =>
      JobPost.updateOne({ _id: jobId }, { $set: { applicantCount: count } })
    )
  )
  const totalMatched  = updateResults.reduce((s, r) => s + (r.matchedCount  || 0), 0)
  const totalModified = updateResults.reduce((s, r) => s + (r.modifiedCount || 0), 0)
  console.log(`   ✓ applicantCount sync: ${totalMatched} matched, ${totalModified} modified`)

  // Readback — prove the DB actually has the new counts
  const verifyIds = Object.keys(countsByJob)
  const verifyJobs = await JobPost.find({ _id: { $in: verifyIds } }).select('title applicantCount')
  console.log('   ▸ DB readback:')
  verifyJobs.forEach(j => {
    const expected = countsByJob[String(j._id)]
    const ok = j.applicantCount === expected ? '✓' : '✗'
    console.log(`      ${ok} ${j.title.padEnd(38)} expected=${expected}  actual=${j.applicantCount}`)
  })
  console.log()

  void admin // silence unused (kept for clarity in summary)

  // ── Summary table ───────────────────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  TEST ACCOUNTS — use these to log in')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.table(
    ACCOUNTS.map(a => ({
      Email:    a.email,
      Password: a.password,
      Role:     a.status ? `${a.role} (${a.status})` : a.role,
    }))
  )

  console.log('\n✅  Seed complete.\n')
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(async (err) => {
  console.error('\n❌  Seed failed:')
  console.error(err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
