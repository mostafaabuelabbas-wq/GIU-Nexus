import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'

const STATUS_CONFIG = {
  pending:     { bg:'#FEF3C7', border:'rgba(180,83,9,0.2)',  text:'#B45309', dot:'#D97706', label:'Pending'     },
  shortlisted: { bg:'#DCE8F5', border:'rgba(42,111,219,0.2)', text:'#1D4ED8', dot:'#2A6FDB', label:'Shortlisted' },
  rejected:    { bg:'#FEE2E2', border:'rgba(185,28,28,0.2)',  text:'#B91C1C', dot:'#DC2626', label:'Rejected'    },
}
const STATUSES = ['pending','shortlisted','rejected']

const SKILL_COLORS = ['#DCEDDA','#DCE8F5','#E8DAF5','#FDE9DC','#FEF3C7','#CCFBF1']
const skillBg = (s='') => { let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return SKILL_COLORS[h%SKILL_COLORS.length] }

const AVATAR_PALETTE = ['#E5A93A','#EE5688','#7C4DBE','#E96A3A','#2F4A2E','#2A6FDB']
const avatarColor = (s='') => { let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return AVATAR_PALETTE[h%AVATAR_PALETTE.length] }

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full font-['JetBrains_Mono'] font-bold px-3 py-1 text-[11px] uppercase tracking-[0.1em] border flex-shrink-0"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  )
}

function StatusDropdown({ appId, current, onChange }) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSelect = async (status) => {
    if (status === current) { setOpen(false); return }
    setLoading(true); setOpen(false)
    try {
      await api.patch(`/applications/${appId}/status`, { status })
      onChange(appId, status)
    } catch { /* keep current */ }
    finally { setLoading(false) }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className="flex items-center gap-2 bg-[#E9E0CB] text-[#161310] font-['JetBrains_Mono'] font-bold text-[11px] uppercase tracking-[0.1em] px-3 py-2 rounded-full border border-[#16131012] hover:bg-[#D8CEBA] transition-colors disabled:opacity-50"
      >
        {loading ? <Spinner size="sm" /> : <StatusBadge status={current} />}
        <span className="text-[#3B342B]/50 text-[10px]">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] bg-[#EDE4D0] rounded-2xl border border-[#16131012] p-1.5 z-20 min-w-[160px] shadow-[0_12px_32px_-12px_rgba(22,19,16,0.2)]">
          {STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s]
            return (
              <button key={s} onClick={() => handleSelect(s)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#D8CEBA] transition-colors text-left">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                <span className="font-['JetBrains_Mono'] font-bold text-[11px] uppercase tracking-[0.1em]" style={{ color: cfg.text }}>
                  {cfg.label}
                </span>
                {s === current && <span className="ml-auto text-[#3B342B]/30 text-xs">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ApplicantsPage() {
  const { jobId } = useParams()
  const [job,          setJob]          = useState(null)
  const [applicants,   setApplicants]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [filter,       setFilter]       = useState('all')
  const [expandedId,   setExpandedId]   = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.get(`/jobs/${jobId}`),
      api.get(`/jobs/${jobId}/applicants`),
    ])
      .then(([jobRes, appRes]) => {
        if (cancelled) return
        setJob(jobRes.data.job ?? jobRes.data)
        const raw = appRes.data.applicants ?? appRes.data.applications ?? appRes.data ?? []
        setApplicants(raw)
        setLoading(false)
      })
      .catch(err => {
        if (!cancelled) { setError(err.response?.data?.message || 'Failed to load applicants.'); setLoading(false) }
      })
    return () => { cancelled = true }
  }, [jobId])

  const handleStatusChange = (appId, newStatus) => {
    setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a))
  }

  const counts = {
    all:         applicants.length,
    pending:     applicants.filter(a => a.status === 'pending').length,
    shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
    rejected:    applicants.filter(a => a.status === 'rejected').length,
  }

  const visible = filter === 'all' ? applicants : applicants.filter(a => a.status === filter)

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      {/* ── Paper header ── */}
      <div className="bg-[#F7F1E3] border-b border-[#16131010] relative overflow-hidden">
        <div className="absolute right-0 top-0 font-['Cairo'] font-black select-none pointer-events-none leading-none text-[#161310] opacity-[0.04]"
          style={{ fontSize: 'clamp(120px,16vw,240px)' }} aria-hidden="true">
          متقدمون
        </div>
        <div className="max-w-[1200px] mx-auto px-10 py-10 relative z-10">
          <Link to="/recruiter/dashboard"
            className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B]/45 hover:text-[#161310] transition-colors inline-flex items-center gap-1.5 mb-6 no-underline">
            ← Back to dashboard
          </Link>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="font-['Space_Grotesk'] font-bold text-[#161310] leading-tight tracking-tight m-0"
                  style={{ fontSize: 'clamp(26px,4vw,44px)' }}>
                  {job ? `Applicants — ${job.title}` : 'Applicants'}
                </h1>
                <span className="font-['Cairo'] font-black text-[#3B342B]/20" style={{ fontSize: 'clamp(22px,3vw,36px)' }}>
                  متقدمون
                </span>
              </div>
              {job && <p className="text-[#3B342B] text-[15px] mt-2">{job.company} · {job.location}</p>}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="font-['Space_Grotesk'] font-bold text-[36px] text-[#161310] leading-none">{applicants.length}</div>
              <div>
                <div className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/45">Total</div>
                <div className="font-['Cairo'] font-bold text-sm text-[#3B342B]/40">متقدم</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1200px] w-full mx-auto px-10 py-8 pb-16">

        {loading && <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>}

        {!loading && error && (
          <div className="text-center py-16">
            <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">Couldn't load applicants.</h3>
            <p className="text-[#3B342B] mb-6">{error}</p>
            <button onClick={() => window.location.reload()}
              className="bg-[#2F4A2E] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-[#243b23] transition-colors">
              Try again →
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── Filter tabs + counts ── */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {[
                { key:'all',         label:'All' },
                { key:'pending',     label:'Pending' },
                { key:'shortlisted', label:'Shortlisted' },
                { key:'rejected',    label:'Rejected' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setFilter(tab.key)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-['JetBrains_Mono'] font-bold text-[11px] uppercase tracking-[0.1em] border transition-all"
                  style={{
                    background: filter === tab.key ? '#2F4A2E' : '#EDE4D0',
                    color:      filter === tab.key ? '#F1EAD9' : '#3B342B',
                    borderColor: filter === tab.key ? '#2F4A2E' : 'rgba(22,19,16,0.1)',
                  }}>
                  {tab.label}
                  <span className="px-1.5 py-0.5 rounded-full text-[10px]"
                    style={{
                      background: filter === tab.key ? 'rgba(241,234,217,0.2)' : 'rgba(22,19,16,0.08)',
                      color:      filter === tab.key ? '#F1EAD9' : '#3B342B',
                    }}>
                    {counts[tab.key]}
                  </span>
                </button>
              ))}
            </div>

            {/* ── Empty state ── */}
            {visible.length === 0 && (
              <div className="text-center py-20 max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#EDE4D0] border border-[#16131012] flex items-center justify-center text-3xl mx-auto mb-5">👥</div>
                <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40 block mb-3">// no applicants</span>
                <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">
                  {filter === 'all' ? 'No applicants yet.' : `No ${filter} applicants.`}
                </h3>
                <p className="text-[#3B342B] leading-relaxed">
                  {filter === 'all'
                    ? 'Share the listing to start getting applications.'
                    : 'Try a different filter.'}
                </p>
              </div>
            )}

            {/* ── Applicant rows ── */}
            {visible.length > 0 && (
              <div className="flex flex-col gap-3">
                {visible.map(app => {
                  const applicant  = app.applicant ?? app.user ?? {}
                  const skills     = applicant.skills ?? []
                  const initial    = (applicant.name || '?')[0].toUpperCase()
                  const isExpanded = expandedId === app._id

                  return (
                    <article key={app._id}
                      className="bg-[#EDE4D0] rounded-[20px] border border-[#2F4A2E]/15 overflow-hidden transition-all hover:border-[#2F4A2E]/30">

                      {/* main row */}
                      <div className="flex items-center gap-4 px-5 py-4">
                        {/* avatar */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-['Space_Grotesk'] font-bold text-base flex-shrink-0"
                          style={{ background: avatarColor(applicant.name || '') }}>
                          {initial}
                        </div>

                        {/* name + email */}
                        <div className="flex-1 min-w-0">
                          <div className="font-['Space_Grotesk'] font-bold text-[15px] text-[#161310] truncate">{applicant.name || '—'}</div>
                          <div className="text-[#3B342B]/55 text-[13px] truncate font-['JetBrains_Mono']">{applicant.email || '—'}</div>
                        </div>

                        {/* skills preview */}
                        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0 max-w-[280px]">
                          {skills.slice(0, 4).map(sk => (
                            <span key={sk}
                              className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-[#16131012] truncate max-w-[90px]"
                              style={{ background: skillBg(sk), color: '#161310' }}>
                              {sk}
                            </span>
                          ))}
                          {skills.length > 4 && (
                            <span className="text-[11px] text-[#3B342B]/40 font-['JetBrains_Mono']">+{skills.length - 4}</span>
                          )}
                        </div>

                        {/* status dropdown */}
                        <StatusDropdown appId={app._id} current={app.status} onChange={handleStatusChange} />

                        {/* expand toggle */}
                        <button
                          onClick={() => setExpandedId(id => id === app._id ? null : app._id)}
                          className="text-[#3B342B]/35 hover:text-[#161310] transition-colors text-sm font-['JetBrains_Mono'] uppercase tracking-wider ml-1 bg-transparent border-0 cursor-pointer px-2"
                        >
                          {isExpanded ? '▴' : '▾'}
                        </button>
                      </div>

                      {/* expanded: cover letter + all skills */}
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-dashed border-[#2F4A2E]/15 pt-4 flex flex-col gap-4">
                          {skills.length > 0 && (
                            <div>
                              <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.14em] text-[#3B342B]/40 block mb-2">Skills</span>
                              <div className="flex flex-wrap gap-2">
                                {skills.map(sk => (
                                  <span key={sk} className="text-[12px] font-medium px-3 py-1 rounded-full border border-[#16131012]"
                                    style={{ background: skillBg(sk), color: '#161310' }}>
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {app.coverLetter && (
                            <div>
                              <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.14em] text-[#3B342B]/40 block mb-2">Cover letter</span>
                              <p className="text-[#3B342B] text-[14px] leading-relaxed bg-[#E4D9C4] rounded-xl px-4 py-3 border border-[#16131010]">
                                {app.coverLetter}
                              </p>
                            </div>
                          )}
                          {!app.coverLetter && (
                            <p className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/30">
                              // no cover letter submitted
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
