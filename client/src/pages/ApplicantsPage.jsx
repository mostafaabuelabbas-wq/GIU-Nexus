import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import SkillChip from '../components/SkillChip'

const PALETTE = ['#2F4A2E', '#EE5688', '#E96A3A', '#E5A93A', '#5A3A6B', '#2A6FDB']
const colorFor = (s = '') => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

const STATUS_OPTIONS = [
  { v: 'pending',     l: 'Pending'     },
  { v: 'shortlisted', l: 'Shortlisted' },
  { v: 'rejected',    l: 'Rejected'    },
]

const STATUS_STYLE = {
  pending:     { bg: 'rgba(229,169,58,.18)',  color: '#7A6210'  },
  shortlisted: { bg: 'rgba(47,74,46,.14)',    color: '#2F4A2E'  },
  rejected:    { bg: 'rgba(233,106,58,.15)',  color: '#8A3A10'  },
}
const st = s => STATUS_STYLE[s] ?? STATUS_STYLE.pending

const unwrap = (data) =>
  Array.isArray(data) ? data : data?.applications ?? data?.data ?? []

function timeAgo(date) {
  if (!date) return '—'
  const d = Math.floor((Date.now() - new Date(date)) / 1000)
  if (d < 3600)   return `${Math.floor(d / 60)}m ago`
  if (d < 86400)  return `${Math.floor(d / 3600)}h ago`
  if (d < 604800) return `${Math.floor(d / 86400)}d ago`
  return `${Math.floor(d / 604800)}w ago`
}

function useCountUp(target, delay = 0) {
  const [val, setVal] = useState(0)
  const current = useRef(0)

  useEffect(() => {
    const from = current.current
    const t = setTimeout(() => {
      const start = performance.now()
      const step = now => {
        const p = Math.min((now - start) / 400, 1)
        const next = Math.round(from + (target - from) * p)
        current.current = next
        setVal(next)
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(t)
  }, [target, delay])
  return val
}

export default function ApplicantsPage() {
  const { jobId } = useParams()
  const [job, setJob]                   = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [updating, setUpdating]         = useState({})
  const [actionErrors, setActionErrors] = useState({})

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    Promise.all([
      api.get(`/jobs/${jobId}`).catch(() => null),
      api.get(`/jobs/${jobId}/applicants`),
    ])
      .then(([jobRes, appsRes]) => {
        if (!active) return
        setJob(jobRes?.data?.job ?? null)
        setApplications(unwrap(appsRes.data))
      })
      .catch(err => {
        if (!active) return
        setError(err.response?.data?.message || 'Failed to load applicants.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [jobId])

  const handleStatusChange = async (appId, status) => {
    setUpdating(p => ({ ...p, [appId]: true }))
    setActionErrors(p => ({ ...p, [appId]: '' }))
    try {
      await api.patch(`/applications/${appId}/status`, { status })
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a))
    } catch (err) {
      setActionErrors(p => ({ ...p, [appId]: err.response?.data?.message || 'Update failed.' }))
    } finally {
      setUpdating(p => ({ ...p, [appId]: false }))
    }
  }

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
            style={{ fontSize: 160, color: 'rgba(241,234,217,.04)' }} aria-hidden="true">م</span>

          <div className="relative z-10 px-9 pt-9 pb-0">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Link
                to="/recruiter/dashboard"
                className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[.12em] px-3 py-[5px] rounded-full no-underline transition-colors"
                style={{ border: '1.5px solid rgba(241,234,217,.25)', color: 'rgba(241,234,217,.65)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#F1EAD9'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(241,234,217,.65)'}
              >
                ← Dashboard
              </Link>
            </div>
            <h1 className="font-['Space_Grotesk'] font-bold text-[#F1EAD9] tracking-[-0.04em] leading-[.92]"
              style={{ fontSize: 'clamp(40px, 7vw, 72px)' }}>
              Applicants
            </h1>
            {job && (
              <p className="mt-3 text-[13.5px] tracking-[-0.01em]"
                style={{ color: 'rgba(241,234,217,.55)' }}>
                {job.title}
                {job.company && <span style={{ color: 'rgba(241,234,217,.35)' }}> · {job.company}</span>}
              </p>
            )}
            <div className="mt-6 mb-0" />
          </div>

          {/* stats strip */}
          <div className="relative z-10 grid grid-cols-3 mt-7"
            style={{ borderTop: '1.5px solid rgba(241,234,217,.1)' }}>
            {[
              { val: animTotal,       label: 'Total applicants', color: '#F1EAD9' },
              { val: animShortlisted, label: 'Shortlisted',      color: '#E5A93A' },
              { val: animPending,     label: 'Awaiting review',  color: '#EE5688' },
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

        {/* ── Empty ── */}
        {!loading && !error && applications.length === 0 && (
          <div className="rounded-[24px] py-20 flex flex-col items-center gap-4 text-center"
            style={{ background: '#EDE4CE', border: '1.5px solid rgba(59,52,43,.08)' }}>
            <div className="font-['Space_Grotesk'] font-bold text-[18px]" style={{ color: '#2F4A2E' }}>
              No applicants yet
            </div>
            <p className="text-[14px] max-w-[32ch]" style={{ color: '#5C5247' }}>
              They'll show up here the moment someone applies.
            </p>
          </div>
        )}

        {/* ── List ── */}
        {!loading && !error && applications.length > 0 && (
          <div className="rounded-[24px] p-7"
            style={{ background: '#E5D9C0', border: '1.5px solid rgba(59,52,43,.07)' }}>

            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-baseline gap-2">
                <h2 className="font-['Space_Grotesk'] font-bold text-[18px] m-0" style={{ color: '#2F4A2E' }}>
                  All applicants
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
                const u      = app.user || {}
                const status = st(app.status)
                return (
                  <div key={app._id || i}
                    className="flex items-center gap-3.5 rounded-[14px] px-4 py-3.5 transition-all flex-wrap"
                    style={{ background: '#F1EAD9', border: '1.5px solid rgba(59,52,43,.07)', cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '4px 0 0 0 #2F4A2E inset'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

                    {/* avatar */}
                    <div className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center font-['Space_Grotesk'] font-bold text-[15px] flex-shrink-0"
                      style={{ background: colorFor(u.name), color: '#F1EAD9' }}>
                      {(u.name || '?').slice(0, 2).toUpperCase()}
                    </div>

                    {/* info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-['Space_Grotesk'] font-semibold text-[15px] truncate"
                        style={{ color: '#2F4A2E' }}>
                        {u.name || 'Unknown applicant'}
                      </div>
                      <div className="text-[13px] mt-0.5 truncate" style={{ color: '#5C5247' }}>
                        {u.email}
                      </div>
                      {u.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {u.skills.slice(0, 5).map((s, idx) => (
                            <SkillChip key={idx} skill={s} />
                          ))}
                          {u.skills.length > 5 && (
                            <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider self-center"
                              style={{ color: 'rgba(59,52,43,.4)' }}>
                              +{u.skills.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                      {actionErrors[app._id] && (
                        <p className="text-[12px] mt-1" style={{ color: '#8A3A10' }}>
                          {actionErrors[app._id]}
                        </p>
                      )}
                    </div>

                    {/* time */}
                    <span className="font-['JetBrains_Mono'] text-[9.5px] uppercase tracking-[.09em] hidden sm:block flex-shrink-0"
                      style={{ color: 'rgba(59,52,43,.4)' }}>
                      // {timeAgo(app.appliedAt || app.createdAt)}
                    </span>

                    {/* status badge */}
                    <span className="font-['JetBrains_Mono'] text-[9.5px] uppercase tracking-[.1em] px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                      style={{ background: status.bg, color: status.color }}>
                      {STATUS_OPTIONS.find(o => o.v === app.status)?.l ?? app.status}
                    </span>

                    {/* status dropdown */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select
                        value={app.status}
                        onChange={e => handleStatusChange(app._id, e.target.value)}
                        disabled={!!updating[app._id]}
                        className="rounded-full px-4 py-1.5 text-[12px] font-semibold cursor-pointer focus:outline-none disabled:opacity-50"
                        style={{ background: '#EEE7D3', border: '1.5px solid rgba(47,74,46,.2)', color: '#2F4A2E' }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.v} value={s.v}>{s.l}</option>
                        ))}
                      </select>
                      {updating[app._id] && <Spinner size="sm" />}
                    </div>

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
