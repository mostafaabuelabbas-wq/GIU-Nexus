import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'

const unwrap  = (d) => Array.isArray(d) ? d : d?.users ?? d?.data ?? d?.results ?? []
const PALETTE = ['#2F4A2E','#EE5688','#E96A3A','#E5A93A','#5A3A6B','#2A6FDB']
const colorFor = (s = '') => { let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return PALETTE[h%PALETTE.length] }
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-EG',{day:'numeric',month:'short',year:'numeric'}) : '—'

export default function PendingRecruitersPage() {
  const [recruiters,   setRecruiters]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [updating,     setUpdating]     = useState({})
  const [actionErrors, setActionErrors] = useState({})

  const load = () => {
    setLoading(true); setError('')
    api.get('/users', { params: { role:'recruiter', status:'pending' } })
      .then(({ data }) => { setRecruiters(unwrap(data)); setLoading(false) })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load.'); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    setUpdating(p => ({ ...p, [id]: status }))
    setActionErrors(p => ({ ...p, [id]: '' }))
    try {
      await api.patch(`/users/${id}/status`, { status })
      setRecruiters(prev => prev.filter(r => r._id !== id))
    } catch (err) {
      setActionErrors(p => ({ ...p, [id]: err.response?.data?.message || 'Action failed.' }))
      setUpdating(p => ({ ...p, [id]: null }))
    }
  }

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      {/* ── Paper header ── */}
      <div className="bg-[#F7F1E3] border-b border-[#16131010] relative overflow-hidden">
        <div className="absolute right-0 top-0 font-['Cairo'] font-black select-none pointer-events-none leading-none text-[#161310] opacity-[0.04]"
          style={{ fontSize: 'clamp(120px,16vw,240px)' }} aria-hidden="true">
          انتظار
        </div>
        <div className="max-w-[1360px] mx-auto px-10 py-10 relative z-10">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-['Space_Grotesk'] font-bold text-[#161310] leading-tight tracking-tight m-0"
              style={{ fontSize: 'clamp(32px,5vw,52px)' }}>
              Pending recruiters.
            </h1>
            <span className="font-['Cairo'] font-black text-[#3B342B]/20" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>انتظار</span>
          </div>
          <p className="text-[#3B342B] text-[16px] mt-2">Approve or reject recruiter accounts awaiting verification.</p>
        </div>
      </div>

      <div className="flex-1 max-w-[1360px] w-full mx-auto px-10 pb-16 pt-8">

        {loading && <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>}

        {!loading && error && (
          <div className="text-center py-16">
            <h3 className="font-['Space_Grotesk'] font-bold text-xl text-[#161310] mb-2">Failed to load.</h3>
            <p className="text-[#3B342B] mb-4">{error}</p>
            <button onClick={load}
              className="bg-[#2F4A2E] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-[#243b23] transition-colors">
              Try again →
            </button>
          </div>
        )}

        {!loading && !error && recruiters.length === 0 && (
          <div className="text-center py-24 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] border border-green-200 flex items-center justify-center text-3xl mx-auto mb-5">✓</div>
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40 block mb-3">// all clear</span>
            <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">No pending recruiters.</h3>
            <p className="text-[#3B342B] leading-relaxed">All recruiter accounts have been reviewed. New sign-ups will appear here automatically.</p>
          </div>
        )}

        {!loading && !error && recruiters.length > 0 && (
          <>
            <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/45 mb-5">
              {recruiters.length} recruiter{recruiters.length !== 1 ? 's' : ''} awaiting approval
            </p>

            <div className="flex flex-col gap-4">
              {recruiters.map(r => (
                <article key={r._id}
                  className="bg-[#EDE4D0] rounded-[24px] p-6 border border-[#2F4A2E]/15 flex items-center gap-5 flex-wrap hover:border-[#2F4A2E]/30 transition-colors">

                  {/* pending dot */}
                  <span className="w-3 h-3 rounded-full bg-[#E96A3A] flex-shrink-0 shadow-[0_0_0_4px_rgba(233,106,58,0.2)] animate-pulse" />

                  {/* avatar */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-['Space_Grotesk'] font-bold text-lg flex-shrink-0"
                    style={{ background: colorFor(r.name) }}>
                    {(r.name || '?')[0].toUpperCase()}
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-['Space_Grotesk'] font-bold text-[16px] text-[#161310]">{r.name}</h3>
                      <span className="font-['JetBrains_Mono'] font-bold text-[10px] uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#D97706]/25">
                        Pending
                      </span>
                    </div>
                    <p className="text-[#3B342B] text-sm">{r.email}</p>
                    <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#3B342B]/35 mt-0.5">
                      Joined {fmtDate(r.createdAt)}
                    </p>
                    {r.bio && (
                      <p className="text-[#3B342B]/70 text-sm mt-2 leading-relaxed max-w-[60ch] line-clamp-2">{r.bio}</p>
                    )}
                    {actionErrors[r._id] && (
                      <p className="text-sm text-red-600 mt-1">{actionErrors[r._id]}</p>
                    )}
                  </div>

                  {/* actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {updating[r._id] ? (
                      <div className="flex items-center gap-2 px-4 py-2">
                        <Spinner size="sm" />
                        <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/50">
                          {updating[r._id] === 'approved' ? 'Approving…' : 'Rejecting…'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => handleStatus(r._id, 'approved')}
                          className="bg-[#2F4A2E] text-[#F1EAD9] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#243b23] transition-colors border-0 cursor-pointer">
                          Approve ✓
                        </button>
                        <button onClick={() => handleStatus(r._id, 'rejected')}
                          className="bg-[#FEE2E2] text-[#DC2626] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#FECACA] transition-colors border-0 cursor-pointer">
                          Reject ✕
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
