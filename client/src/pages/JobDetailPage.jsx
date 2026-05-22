import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getCategoryColor } from '../utils/categoryColors'
import ApplicationStatusBadge from '../components/ApplicationStatusBadge'
import SaveJobButton from '../components/SaveJobButton'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'

const TYPE_LABEL    = { 'full-time':'Full-time', 'part-time':'Part-time', 'internship':'Internship' }
const WORKMODE_LABEL = { remote:'Remote', hybrid:'Hybrid', onsite:'On-site' }

/* deterministic accent hue from company name — used only for the monogram ring */
const PALETTE = ['#EE5688','#E96A3A','#E5A93A','#2A6FDB','#7C3AED','#0D9488']
const accentFor = (s = '') => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

/* ─── tiny sub-components ─────────────────────────────────────────────────── */
function MetaPill({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#E9E0CB] text-[#3B342B] text-[13px] font-medium px-3.5 py-1.5 rounded-full border border-[#16131012]">
      {children}
    </span>
  )
}

function SectionCard({ title, eyebrow, children }) {
  return (
    <div className="bg-[#EDE4D0] rounded-[28px] p-8 border border-[#16131012]">
      {eyebrow && (
        <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/45 block mb-2">
          {eyebrow}
        </span>
      )}
      {title && (
        <h2 className="font-['Space_Grotesk'] font-bold text-[20px] text-[#161310] mb-5 mt-0">
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}

/* ─── main component ──────────────────────────────────────────────────────── */
export default function JobDetailPage() {
  const { id }   = useParams()
  const { isAuthenticated, user } = useAuth()
  const isJobSeeker = user?.role === 'jobSeeker'

  const [job,         setJob]         = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [applyModal,  setApplyModal]  = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying,    setApplying]    = useState(false)
  const [applyError,  setApplyError]  = useState('')
  const [application, setApplication] = useState(null)

  useEffect(() => {
    let cancelled = false
    const jobReq = api.get(`/jobs/${id}`)
    const appReq = isJobSeeker
      ? api.get('/applications/my').catch(() => ({ data: { applications: [] } }))
      : Promise.resolve({ data: { applications: [] } })

    Promise.all([jobReq, appReq])
      .then(([jobRes, appRes]) => {
        if (cancelled) return
        const j = jobRes.data.job ?? jobRes.data
        setJob(j)
        const existing = (appRes.data.applications ?? []).find(a =>
          String(a.job?._id ?? a.job) === String(id)
        )
        if (existing) setApplication(existing)
        setLoading(false)
      })
      .catch(err => {
        if (!cancelled) { setError(err.response?.data?.message || 'Job not found.'); setLoading(false) }
      })
    return () => { cancelled = true }
  }, [id, isJobSeeker])

  const handleApply = async () => {
    setApplying(true); setApplyError('')
    try {
      const { data } = await api.post(`/jobs/${id}/apply`, { coverLetter })
      setApplication(data.application ?? data)
      setApplyModal(false); setCoverLetter('')
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to apply.')
    } finally {
      setApplying(false)
    }
  }

  /* ── loading ── */
  if (loading) return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
    </div>
  )

  /* ── error ── */
  if (error || !job) return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B]/40">// 404 not found</span>
        <h2 className="font-['Space_Grotesk'] font-bold text-[32px] text-[#161310]">Job not found.</h2>
        <p className="text-[#3B342B] max-w-sm">{error}</p>
        <Link to="/jobs" className="bg-[#161310] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-black transition-colors no-underline">
          Browse all jobs →
        </Link>
      </div>
    </div>
  )

  const catColor  = getCategoryColor(job.category)
  const accent    = accentFor(job.company)
  const initial   = (job.company || '?')[0].toUpperCase()
  const typePill  = TYPE_LABEL[job.type]    ?? job.type
  const modePill  = WORKMODE_LABEL[job.workMode] ?? job.workMode
  const hasApplied = !!application
  const canApply  = isJobSeeker && !hasApplied && job.status === 'open'

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO HEADER — warm paper background
      ════════════════════════════════════════════════════════════ */}
      <div className="bg-[#F7F1E3] border-b border-[#16131010] relative overflow-hidden">
        {/* decorative watermark */}
        <div
          className="absolute right-0 top-0 font-['Cairo'] font-black select-none pointer-events-none leading-none text-[#161310] opacity-[0.04]"
          style={{ fontSize: 'clamp(180px,22vw,320px)' }}
          aria-hidden="true"
        >
          {initial}
        </div>

        <div className="max-w-[1360px] mx-auto px-10 pt-10 pb-12 relative z-10">
          {/* breadcrumb */}
          <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/40 mb-10">
            <Link to="/jobs" className="hover:text-[#161310] transition-colors no-underline">Jobs</Link>
            <span>/</span>
            <span className="text-[#3B342B]/60">{job.category ?? 'All'}</span>
            <span>/</span>
            <span className="text-[#161310]">{job.title}</span>
          </div>

          <div className="flex items-end justify-between gap-8 flex-wrap">
            <div className="flex items-start gap-6">
              {/* company monogram — white card, accent colored initial */}
              <div
                className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center flex-shrink-0 font-['Space_Grotesk'] font-bold text-[28px] bg-[#E9E0CB] shadow-sm border border-[#16131012]"
                style={{ color: accent }}
              >
                {initial}
              </div>

              <div>
                <h1 className="font-['Space_Grotesk'] font-bold text-[#161310] leading-tight m-0"
                  style={{ fontSize: 'clamp(28px,4vw,48px)' }}>
                  {job.title}
                </h1>
                <p className="text-[#3B342B] text-[18px] mt-1 font-medium">{job.company}</p>

                {/* meta pills row */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {job.category && job.category !== 'Classifying...' && (
                    <span
                      className="inline-flex items-center gap-1.5 text-[12px] font-['JetBrains_Mono'] font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: catColor.bg, color: catColor.text }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: catColor.dot }} />
                      {job.category}
                    </span>
                  )}
                  {job.category === 'Classifying...' && (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-['JetBrains_Mono'] font-semibold px-3 py-1.5 rounded-full bg-[#F1EAD9] text-[#3B342B]/60">
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-[#3B342B]/30 border-t-[#EE5688] animate-spin" />
                      AI classifying...
                    </span>
                  )}
                  {job.location  && <MetaPill>📍 {job.location}</MetaPill>}
                  {typePill       && <MetaPill>{typePill}</MetaPill>}
                  {modePill       && <MetaPill>{modePill}</MetaPill>}
                  {job.salary && (
                    <span className="inline-flex items-center gap-1.5 bg-[#E96A3A]/10 text-[#E96A3A] text-[13px] font-semibold px-3.5 py-1.5 rounded-full">
                      EGP {Number(job.salary).toLocaleString()}
                    </span>
                  )}
                  {job.status !== 'open' && (
                    <span className="inline-flex items-center bg-red-50 text-red-500 text-[12px] font-['JetBrains_Mono'] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border border-red-100">
                      Closed
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* right: save + apply (desktop) */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <SaveJobButton jobId={job._id} initialSaved={job.saved} jobStatus={job.status} />

              {canApply && (
                <button
                  onClick={() => setApplyModal(true)}
                  className="bg-[#EE5688] text-white font-['Space_Grotesk'] font-bold text-[15px] px-7 py-3.5 rounded-full hover:bg-[#e9437a] transition-colors inline-flex items-center gap-2"
                >
                  Apply now <span className="opacity-80">→</span>
                </button>
              )}
              {hasApplied && (
                <div className="flex items-center gap-2.5">
                  <span className="text-[#3B342B] text-sm">Your application:</span>
                  <ApplicationStatusBadge status={application.status} />
                </div>
              )}
              {!isAuthenticated && job.status === 'open' && (
                <Link
                  to="/login"
                  className="bg-[#EE5688] text-white font-['Space_Grotesk'] font-bold text-[15px] px-7 py-3.5 rounded-full hover:bg-[#e9437a] transition-colors no-underline inline-flex items-center gap-2"
                >
                  Sign in to apply →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          BODY — two-column layout
      ════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-5">

            {/* mobile apply CTA */}
            {(canApply || hasApplied) && (
              <div className="lg:hidden bg-[#EDE4D0] rounded-[24px] p-5 border border-[#16131012] flex items-center justify-between gap-4 flex-wrap">
                {canApply && (
                  <button onClick={() => setApplyModal(true)}
                    className="flex-1 bg-[#EE5688] text-white font-bold py-3.5 rounded-full hover:bg-[#e9437a] transition-colors">
                    Apply now →
                  </button>
                )}
                {hasApplied && (
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[#3B342B] text-sm">Your application:</span>
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                )}
              </div>
            )}

            {/* About this role */}
            {job.description && (
              <SectionCard eyebrow="// about this role" title="What you'll be doing">
                <p className="text-[#3B342B] text-[15px] leading-[1.8] whitespace-pre-wrap">
                  {job.description}
                </p>
              </SectionCard>
            )}

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <SectionCard eyebrow="// requirements" title="What we're looking for">
                <ul className="list-none p-0 m-0 flex flex-col gap-3">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#3B342B] text-[15px]">
                      <span
                        className="w-5 h-5 rounded-full bg-[#EE5688]/10 text-[#EE5688] flex items-center justify-center flex-shrink-0 font-['JetBrains_Mono'] font-bold text-[10px] mt-0.5"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {req}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Empty description fallback */}
            {!job.description && !job.requirements?.length && (
              <SectionCard>
                <div className="py-8 text-center">
                  <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B]/35">
                    // no description provided
                  </p>
                  <p className="text-[#3B342B] text-sm mt-2">
                    The recruiter hasn't added details yet. Apply and ask directly.
                  </p>
                </div>
              </SectionCard>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="flex flex-col gap-5 sticky top-[96px]">

            {/* Apply card */}
            {(canApply || hasApplied || (!isAuthenticated && job.status === 'open')) && (
              <div className="bg-[#E9E0CB] rounded-[28px] p-6 text-[#161310] border border-[#16131012]">
                <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/45 block mb-3">
                  {hasApplied ? '// applied' : '// ready to apply?'}
                </span>
                {canApply && (
                  <>
                    <p className="text-[#3B342B] text-[13px] leading-relaxed mb-5">
                      One click. A human reads every application at {job.company}.
                    </p>
                    <button
                      onClick={() => setApplyModal(true)}
                      className="w-full bg-[#EE5688] text-white font-['Space_Grotesk'] font-bold text-[15px] py-3.5 rounded-full hover:bg-[#e9437a] transition-colors"
                    >
                      Apply now →
                    </button>
                    <p className="text-[#3B342B]/40 text-[12px] text-center mt-3">
                      Cover letter optional · 60-second apply
                    </p>
                  </>
                )}
                {hasApplied && (
                  <div className="flex flex-col gap-2">
                    <ApplicationStatusBadge status={application.status} />
                    <p className="text-[#3B342B]/50 text-[12px] mt-1">
                      Applied successfully. You'll hear back by email.
                    </p>
                  </div>
                )}
                {!isAuthenticated && job.status === 'open' && (
                  <>
                    <p className="text-[#3B342B] text-[13px] leading-relaxed mb-4">Sign in to apply in 60 seconds.</p>
                    <Link
                      to="/login"
                      className="block w-full text-center bg-[#EE5688] text-white font-['Space_Grotesk'] font-bold text-[15px] py-3.5 rounded-full hover:bg-[#e9437a] transition-colors no-underline"
                    >
                      Sign in to apply →
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Details card */}
            <div className="bg-[#EDE4D0] rounded-[28px] p-6 border border-[#16131012]">
              <h3 className="font-['Space_Grotesk'] font-bold text-[15px] text-[#161310] mb-5">Job details</h3>
              <dl className="flex flex-col gap-0 m-0 divide-y divide-[#16131015]">
                {[
                  { label: 'Company',  value: job.company },
                  { label: 'Location', value: job.location },
                  { label: 'Type',     value: TYPE_LABEL[job.type] ?? job.type },
                  { label: 'Work mode',value: WORKMODE_LABEL[job.workMode] ?? job.workMode },
                  { label: 'Status',   value: job.status,    highlight: job.status === 'open' },
                  job.totalSlots
                    ? { label: 'Open slots', value: `${job.totalSlots} position${job.totalSlots > 1 ? 's' : ''}` }
                    : null,
                  job.salary
                    ? { label: 'Salary', value: `EGP ${Number(job.salary).toLocaleString()}` }
                    : null,
                ].filter(Boolean).map(({ label, value, highlight }) => value && (
                  <div key={label} className="flex justify-between items-center py-3 gap-3">
                    <dt className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.1em] text-[#3B342B]/45 flex-shrink-0">
                      {label}
                    </dt>
                    <dd className={`text-sm font-semibold text-right capitalize m-0 ${highlight ? 'text-[#15803D]' : 'text-[#161310]'}`}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Category badge card */}
            {job.category && job.category !== 'Classifying...' && (
              <div
                className="rounded-[24px] p-5 flex items-center gap-3"
                style={{ background: catColor.bg }}
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: catColor.dot + '25' }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: catColor.dot }} />
                </span>
                <div>
                  <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.12em] mb-0.5" style={{ color: catColor.text + '80' }}>
                    AI-assigned category
                  </div>
                  <div className="font-['Space_Grotesk'] font-bold text-[15px]" style={{ color: catColor.text }}>
                    {job.category}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════
          APPLY MODAL
      ════════════════════════════════════════════════════════════ */}
      <Modal
        open={applyModal}
        title={`Apply for ${job.title}`}
        confirmLabel={applying ? 'Submitting…' : 'Submit application'}
        loading={applying}
        onConfirm={handleApply}
        onCancel={() => { setApplyModal(false); setApplyError(''); setCoverLetter('') }}
      >
        {/* company + role summary */}
        <div className="flex items-center gap-3 mb-5 p-3 bg-[#E9E0CB] rounded-2xl">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-['Space_Grotesk'] font-bold text-base flex-shrink-0"
            style={{ background: accent + '20', color: accent }}
          >
            {initial}
          </div>
          <div>
            <div className="font-semibold text-sm text-[#161310]">{job.title}</div>
            <div className="text-xs text-[#3B342B]">{job.company} · {job.location}</div>
          </div>
        </div>

        {applyError && (
          <div className="mb-4 p-3 bg-[#FEE2E2] border border-red-200 rounded-xl text-red-700 text-sm">
            {applyError}
          </div>
        )}

        <label className="block text-sm font-semibold text-[#161310] mb-2">Cover letter</label>
        <textarea
          value={coverLetter}
          onChange={e => setCoverLetter(e.target.value)}
          rows={5}
          placeholder="Optional: why you're a great fit, relevant experience, anything the recruiter should know…"
          className="w-full bg-[#E9E0CB] border border-[#16131012] rounded-xl px-4 py-3 text-[#161310] text-[14px] leading-relaxed focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 transition-all resize-none"
        />
        <p className="text-xs text-[#3B342B]/40 mt-2">
          Cover letter is optional — but a good one triples your reply rate.
        </p>
      </Modal>

      <Footer />
    </div>
  )
}
