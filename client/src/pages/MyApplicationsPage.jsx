import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Spinner from '../components/Spinner'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// ── helpers ───────────────────────────────────────────────────────────────────
const PALETTE     = ['#2F4A2E', '#EE5688', '#E96A3A', '#E5A93A']
const avatarColor = (name = '') => PALETTE[name.charCodeAt(0) % PALETTE.length]

const TYPE_LABEL = { 'full-time': 'Full-time', 'part-time': 'Part-time', internship: 'Internship' }

const STATUS = {
  pending:     { bg: 'rgba(229,169,58,.18)',  color: '#7A6210',  label: 'Pending'     },
  shortlisted: { bg: 'rgba(47,74,46,.14)',    color: '#2F4A2E',  label: 'Shortlisted' },
  rejected:    { bg: 'rgba(233,106,58,.15)',  color: '#8A3A10',  label: 'Rejected'    },
}
const st = s => STATUS[s] ?? STATUS.pending

function timeAgo(date) {
  if (!date) return '—'
  const d = Math.floor((Date.now() - new Date(date)) / 1000)
  if (d < 3600)    return `${Math.floor(d / 60)}m ago`
  if (d < 86400)   return `${Math.floor(d / 3600)}h ago`
  if (d < 604800)  return `${Math.floor(d / 86400)}d ago`
  return `${Math.floor(d / 604800)}w ago`
}

// ── count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target, delay = 0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    const t = setTimeout(() => {
      const start = performance.now()
      const step = now => {
        const p = Math.min((now - start) / 700, 1)
        setVal(Math.round(p * target))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(t)
  }, [target, delay])
  return val
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.get('/applications/my')
      .then(res => setApplications(res.data.applications || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load applications.'))
      .finally(() => setLoading(false))
  }, [])

  const total       = applications.length
  const shortlisted = applications.filter(a => a.status === 'shortlisted').length
  const pending     = applications.filter(a => a.status === 'pending').length

  const animTotal       = useCountUp(total,       200)
  const animShortlisted = useCountUp(shortlisted, 350)
  const animPending     = useCountUp(pending,     450)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F1EAD9' }}>
      <Navbar />

      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 py-8 flex flex-col gap-[18px]">

        {/* ── HERO ── */}
        <div className="rounded-[28px] overflow-hidden relative" style={{ background: '#2F4A2E' }}>
          {/* noise */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          }} />
          {/* deco */}
          <span className="absolute right-8 top-4 font-['Cairo'] font-black leading-none select-none pointer-events-none"
            style={{ fontSize: 160, color: 'rgba(241,234,217,.04)' }} aria-hidden="true">١٢</span>

          <div className="relative z-10 px-9 pt-9 pb-0">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[.12em] px-3 py-[5px] rounded-full"
                style={{ border: '1.5px solid rgba(241,234,217,.25)', color: 'rgba(241,234,217,.65)' }}>
                // My applications
              </span>
            </div>
            <h1 className="font-['Space_Grotesk'] font-bold text-[#F1EAD9] tracking-[-0.04em] leading-[.92]"
              style={{ fontSize: 'clamp(40px, 7vw, 72px)' }}>
              Your<br />Applications
            </h1>
            <p className="mt-3 text-[13.5px] tracking-[-0.01em]"
              style={{ color: 'rgba(241,234,217,.45)' }}>
              Track every role you've applied to, all in one place.
            </p>
            <div className="mt-6 mb-0" />
          </div>

          {/* stats strip */}
          <div className="relative z-10 grid grid-cols-3 mt-7"
            style={{ borderTop: '1.5px solid rgba(241,234,217,.1)' }}>
            {[
              { val: animTotal,       label: 'Total applied',  color: '#F1EAD9' },
              { val: animShortlisted, label: 'Shortlisted',    color: '#E5A93A' },
              { val: animPending,     label: 'Awaiting reply', color: '#EE5688' },
            ].map((s, i) => (
              <div key={i} className="px-7 py-5"
                style={{ borderRight: i < 2 ? '1.5px solid rgba(241,234,217,.1)' : 'none' }}>
                <div className="font-['Space_Grotesk'] font-bold text-[32px] leading-none tracking-[-0.04em]"
                  style={{ color: s.color }}>
                  {s.val}
                </div>
                <div className="font-['JetBrains_Mono'] text-[9.5px] uppercase tracking-[.1em] mt-1"
                  style={{ color: 'rgba(241,234,217,.35)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="rounded-[24px] px-6 py-5 text-sm font-semibold"
            style={{ background: 'rgba(233,106,58,.1)', color: '#8A3A10', border: '1.5px solid rgba(233,106,58,.2)' }}>
            {error}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && applications.length === 0 && (
          <div className="rounded-[24px] py-20 flex flex-col items-center gap-4 text-center"
            style={{ background: '#EDE4CE', border: '1.5px solid rgba(59,52,43,.08)' }}>
            <div className="font-['Space_Grotesk'] font-bold text-[18px]" style={{ color: '#2F4A2E' }}>
              No applications yet
            </div>
            <p className="text-[14px] max-w-[32ch]" style={{ color: '#5C5247' }}>
              Start applying to jobs and track your progress here.
            </p>
            <Link to="/jobs"
              className="mt-2 font-['Space_Grotesk'] font-semibold text-[14px] px-6 py-2.5 rounded-full no-underline transition-colors"
              style={{ background: '#EE5688', color: '#F1EAD9' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e9437a'}
              onMouseLeave={e => e.currentTarget.style.background = '#EE5688'}>
              Browse jobs →
            </Link>
          </div>
        )}

        {/* ── List ── */}
        {!loading && !error && applications.length > 0 && (
          <div className="rounded-[24px] p-7"
            style={{ background: '#E5D9C0', border: '1.5px solid rgba(59,52,43,.07)' }}>

            {/* list header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-baseline gap-2">
                <h2 className="font-['Space_Grotesk'] font-bold text-[18px] m-0" style={{ color: '#2F4A2E' }}>
                  All applications
                </h2>
                <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[.1em] px-2.5 py-1 rounded-full"
                  style={{ background: '#2F4A2E', color: '#F1EAD9' }}>
                  {total}
                </span>
              </div>
              <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[.1em]"
                style={{ color: 'rgba(59,52,43,.4)' }}>
                // sorted by recent
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {applications.map((app, i) => {
                const job    = app.job || {}
                const co     = job.company || 'Company'
                const title  = job.title   || 'Unknown Position'
                const status = st(app.status)
                const col    = avatarColor(co)
                return (
                  <div key={app._id || i}
                    className="flex items-center gap-3.5 rounded-[14px] px-4 py-3.5 transition-all"
                    style={{ background: '#F1EAD9', border: '1.5px solid rgba(59,52,43,.07)', cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '4px 0 0 0 #2F4A2E inset'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

                    {/* company avatar */}
                    <div className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center font-['Space_Grotesk'] font-bold text-[15px] flex-shrink-0"
                      style={{ background: col, color: '#F1EAD9' }}>
                      {co.slice(0, 2)}
                    </div>

                    {/* job info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/jobs/${job._id}`}
                        className="font-['Space_Grotesk'] font-semibold text-[15px] no-underline truncate block transition-colors"
                        style={{ color: '#2F4A2E' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#EE5688'}
                        onMouseLeave={e => e.currentTarget.style.color = '#2F4A2E'}>
                        {title}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[13px]" style={{ color: '#5C5247' }}>{co}</span>
                        {job.type && (
                          <>
                            <span style={{ color: 'rgba(59,52,43,.3)' }}>·</span>
                            <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[.08em]"
                              style={{ color: 'rgba(59,52,43,.45)' }}>
                              {TYPE_LABEL[job.type] ?? job.type}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* date */}
                    <span className="font-['JetBrains_Mono'] text-[9.5px] uppercase tracking-[.09em] hidden sm:block flex-shrink-0"
                      style={{ color: 'rgba(59,52,43,.4)' }}>
                      // {timeAgo(app.appliedAt || app.createdAt)}
                    </span>

                    {/* status */}
                    <span className="font-['JetBrains_Mono'] text-[9.5px] uppercase tracking-[.1em] px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                      style={{ background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  )
}
