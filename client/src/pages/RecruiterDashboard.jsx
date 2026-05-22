import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'

const unwrap = (data) =>
  Array.isArray(data) ? data : data?.jobs ?? data?.data ?? data?.results ?? []

const TYPE_LABEL = { 'full-time': 'Full-time', 'part-time': 'Part-time', 'internship': 'Internship' }

const CATEGORY_STYLES = {
  'Frontend':           { bg: '#DCEDDA', border: 'rgba(47,74,46,0.25)',  dot: '#2F4A2E', text: '#2F4A2E' },
  'Backend':            { bg: '#DCE8F5', border: 'rgba(42,111,219,0.25)', dot: '#2A6FDB', text: '#1E4A8A' },
  'AI/ML':              { bg: '#E8DAF5', border: 'rgba(124,77,190,0.25)', dot: '#7C4DBE', text: '#5A2D9B' },
  'DevOps':             { bg: '#DCFCE7', border: 'rgba(22,163,74,0.25)',  dot: '#16A34A', text: '#15803D' },
  'Data Engineering':   { bg: '#FDE9DC', border: 'rgba(233,106,58,0.25)', dot: '#E96A3A', text: '#7A3E1C' },
  'Other':              { bg: '#F1EAD9', border: 'rgba(59,52,43,0.2)',    dot: '#3B342B', text: '#3B342B' },
}

function InlineCatBadge({ category }) {
  if (!category) return null
  const s = CATEGORY_STYLES[category] || CATEGORY_STYLES['Other']
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-['JetBrains_Mono'] font-bold px-2.5 py-0.5 text-[10px] uppercase tracking-[0.1em] border flex-shrink-0"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {category}
    </span>
  )
}

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [jobs,      setJobs]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [deleteId,  setDeleteId]  = useState(null)
  const [deleting,  setDeleting]  = useState(false)

  const isPending = user?.status === 'pending'

  const load = () => {
    setLoading(true); setError('')
    api.get('/jobs/my-jobs')
      .then(({ data }) => { setJobs(unwrap(data)); setLoading(false) })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load your jobs.'); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const totalApplicants = jobs.reduce((s, j) => s + (j.applicantCount ?? j.applications?.length ?? 0), 0)
  const openJobs   = jobs.filter(j => j.status === 'open').length
  const closedJobs = jobs.length - openJobs

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/jobs/${deleteId}`)
      setJobs(prev => prev.filter(j => j._id !== deleteId))
      setDeleteId(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete job.')
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      {/* ── Hero header ── */}
      <div className="bg-[#F7F1E3] border-b border-[#16131010] relative overflow-hidden">
        <div className="absolute right-0 top-0 font-['Cairo'] font-black select-none pointer-events-none leading-none text-[#161310] opacity-[0.04]"
          style={{ fontSize: 'clamp(120px,16vw,240px)' }} aria-hidden="true">
          لوحة
        </div>
        <div className="max-w-[1360px] mx-auto px-10 py-10 relative z-10">
          <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B]/45 block mb-3">
            Welcome back, {user?.name?.split(' ')[0] || 'Recruiter'} 👋
          </span>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="font-['Space_Grotesk'] font-bold text-[#161310] leading-tight tracking-tight m-0"
                  style={{ fontSize: 'clamp(32px,5vw,52px)' }}>
                  Recruiter dashboard.
                </h1>
                <span className="font-['Cairo'] font-black text-[#3B342B]/20" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>لوحتك</span>
              </div>
              <p className="text-[#3B342B] text-[16px] mt-2">Manage your job posts and review applicants.</p>
            </div>
            {!isPending && (
              <Link to="/recruiter/jobs/create"
                className="bg-[#EE5688] text-white font-['Space_Grotesk'] font-bold px-6 py-3.5 rounded-full hover:bg-[#e9437a] transition-colors no-underline flex items-center gap-2 flex-shrink-0">
                + Post a new role
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1360px] w-full mx-auto px-10 pb-16 pt-8">

        {/* ── Pending banner ── */}
        {isPending && (
          <div className="bg-[#FDE9DC] border border-[#E96A3A]/30 rounded-[24px] px-6 py-5 flex items-start gap-4 mb-8">
            <span className="w-3 h-3 rounded-full bg-[#E96A3A] flex-shrink-0 mt-1 shadow-[0_0_0_4px_rgba(233,106,58,0.2)] animate-pulse" />
            <div>
              <p className="font-['Space_Grotesk'] font-bold text-[#7A3E1C] text-[17px]">
                Your account is pending admin approval.
              </p>
              <p className="text-[#7A3E1C]/75 text-sm mt-1 leading-relaxed">
                You can browse the platform, but posting jobs is locked until an admin approves your account. You'll receive an email once approved.
              </p>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        {!loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Total posts',      value: jobs.length,     ar: 'إعلاناتك', bg: '#161310',  tc: '#F1EAD9', sub: 'rgba(241,234,217,0.45)' },
              { label: 'Open roles',       value: openJobs,        ar: 'مفتوح',    bg: '#2F4A2E',  tc: '#F1EAD9', sub: 'rgba(241,234,217,0.45)' },
              { label: 'Total applicants', value: totalApplicants, ar: 'متقدم',    bg: '#EDE4D0',  tc: '#161310', sub: 'rgba(22,19,16,0.4)' },
              { label: 'Closed',           value: closedJobs,      ar: 'مغلق',     bg: '#E4D9C4',  tc: '#3B342B', sub: 'rgba(59,52,43,0.5)' },
            ].map(stat => (
              <div key={stat.label}
                className="rounded-[24px] p-6 border border-[#16131012] flex flex-col justify-between min-h-[130px]"
                style={{ background: stat.bg }}>
                <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider" style={{ color: stat.sub }}>
                  {stat.label}
                </span>
                <div>
                  <div className="font-['Space_Grotesk'] font-bold text-[46px] leading-none" style={{ color: stat.tc }}>
                    {stat.value}
                  </div>
                  <span className="font-['Cairo'] font-bold text-sm opacity-60" dir="rtl" style={{ color: stat.tc }}>
                    {stat.ar}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="text-center py-16">
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40 block mb-3">// error</span>
            <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">Couldn't load your jobs.</h3>
            <p className="text-[#3B342B] mb-6">{error}</p>
            <button onClick={load} className="bg-[#161310] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-black transition-colors">
              Try again →
            </button>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-20 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#EDE4D0] border border-[#16131012] flex items-center justify-center text-3xl mx-auto mb-5">💼</div>
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40 block mb-3">// no posts yet</span>
            <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">No job posts yet.</h3>
            <p className="text-[#3B342B] mb-6 leading-relaxed">
              {isPending
                ? 'Once your account is approved, you can start posting roles.'
                : 'Post your first role and start receiving applications from GIU students.'}
            </p>
            {!isPending && (
              <Link to="/recruiter/jobs/create"
                className="bg-[#EE5688] text-white font-bold px-6 py-3 rounded-full hover:bg-[#e9437a] transition-colors no-underline inline-block">
                Post a role →
              </Link>
            )}
          </div>
        )}

        {/* ── Job list ── */}
        {!loading && !error && jobs.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/45">
                {jobs.length} post{jobs.length !== 1 ? 's' : ''} · sorted by newest
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {jobs.map(job => {
                const appCount = job.applicantCount ?? job.applications?.length ?? 0
                const isOpen   = job.status === 'open'
                return (
                  <article key={job._id}
                    className="bg-[#EDE4D0] rounded-[20px] border border-[#2F4A2E]/20 px-5 py-4 flex items-center gap-5 hover:-translate-y-px hover:border-[#2F4A2E]/40 transition-all">

                    {/* status dot */}
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOpen ? 'bg-[#16A34A] shadow-[0_0_0_3px_rgba(22,163,74,0.2)]' : 'bg-[#3B342B]/25'}`} />

                    {/* main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-['Space_Grotesk'] font-bold text-[16px] text-[#161310] truncate">
                          {job.title}
                        </h3>
                        <InlineCatBadge category={job.category} />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[#3B342B] text-xs">{job.location}</span>
                        {job.type && <><span className="text-[#3B342B]/30 text-xs">·</span><span className="text-[#3B342B] text-xs">{TYPE_LABEL[job.type] ?? job.type}</span></>}
                        <span className={`font-['JetBrains_Mono'] text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${isOpen ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#E4D9C4] text-[#3B342B]/60'}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>

                    {/* applicant count */}
                    <div className="text-center flex-shrink-0 px-4 border-l border-r border-[#2F4A2E]/10">
                      <div className="font-['Space_Grotesk'] font-bold text-[28px] text-[#161310] leading-none">{appCount}</div>
                      <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wide text-[#3B342B]/40 mt-0.5">
                        applicant{appCount !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link to={`/recruiter/applicants/${job._id}`}
                        className="text-xs font-bold text-[#F1EAD9] bg-[#2F4A2E] px-4 py-2 rounded-full hover:bg-[#243b23] transition-colors no-underline">
                        Applicants →
                      </Link>
                      <Link to={`/recruiter/jobs/${job._id}/edit`}
                        className="text-xs font-bold text-[#161310] bg-[#E9E0CB] px-4 py-2 rounded-full hover:bg-[#D8CEBA] transition-colors no-underline border border-[#16131012]">
                        Edit
                      </Link>
                      <button onClick={() => setDeleteId(job._id)}
                        className="text-xs font-bold text-[#DC2626] bg-[#FEE2E2] px-4 py-2 rounded-full hover:bg-[#FECACA] transition-colors cursor-pointer border-0">
                        Delete
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </div>

      <Modal
        open={!!deleteId}
        title="Delete this job?"
        message="This will permanently remove the listing and all its applications. This action cannot be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Yes, delete it'}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <Footer />
    </div>
  )
}
