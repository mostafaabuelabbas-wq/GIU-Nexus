import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const unwrap = (data) =>
  Array.isArray(data) ? data : data?.users ?? data?.data ?? data?.results ?? []

const PALETTE = ['#2F4A2E','#EE5688','#E96A3A','#E5A93A','#5A3A6B','#2A6FDB']
const colorFor = (s = '') => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-EG', { day:'numeric', month:'short', year:'numeric' }) : '—'

export default function PendingRecruitersPage() {
  const [recruiters, setRecruiters] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [updating, setUpdating]     = useState({}) // { [id]: 'approved' | 'rejected' | null }
  const [actionErrors, setActionErrors] = useState({})

  const load = () => {
    setLoading(true)
    setError('')
    api.get('/users', { params: { role: 'recruiter', status: 'pending' } })
      .then(({ data }) => { setRecruiters(unwrap(data)); setLoading(false) })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load pending recruiters.')
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    setUpdating(p => ({ ...p, [id]: status }))
    setActionErrors(p => ({ ...p, [id]: '' }))
    try {
      await api.patch(`/users/${id}/status`, { status })
      // Remove from list immediately — they're no longer pending
      setRecruiters(prev => prev.filter(r => r._id !== id))
    } catch (err) {
      setActionErrors(p => ({ ...p, [id]: err.response?.data?.message || 'Action failed.' }))
      setUpdating(p => ({ ...p, [id]: null }))
    }
  }

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="max-w-[1360px] w-full mx-auto px-10 pt-10 pb-6">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="font-['Space_Grotesk'] font-bold text-[48px] text-[#161310] leading-tight tracking-tight m-0">
            Pending recruiters.
          </h1>
          <span className="font-['Cairo'] font-black text-[40px] text-[#3B342B]/25">انتظار</span>
        </div>
        <p className="text-[#3B342B] text-[17px] mt-2">
          Approve or reject recruiter accounts awaiting verification.
        </p>
      </div>

      <div className="flex-1 max-w-[1360px] w-full mx-auto px-10 pb-16">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <span className="w-10 h-10 rounded-full border-2 border-[#161310] border-t-transparent animate-spin inline-block" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16">
            <h3 className="font-['Space_Grotesk'] font-bold text-xl text-[#161310] mb-2">
              Failed to load.
            </h3>
            <p className="text-[#3B342B] mb-4">{error}</p>
            <button
              onClick={load}
              className="bg-[#161310] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-black transition-colors"
            >
              Try again →
            </button>
          </div>
        )}

        {/* All clear */}
        {!loading && !error && recruiters.length === 0 && (
          <div className="text-center py-24 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] border border-green-200 flex items-center justify-center text-3xl mx-auto mb-5">
              ✓
            </div>
            <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40 mb-3">
              // all clear
            </p>
            <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">
              No pending recruiters.
            </h3>
            <p className="text-[#3B342B] leading-relaxed">
              All recruiter accounts have been reviewed. New sign-ups will appear here automatically.
            </p>
          </div>
        )}

        {/* Recruiter list */}
        {!loading && !error && recruiters.length > 0 && (
          <>
            <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/45 mb-5">
              {recruiters.length} recruiter{recruiters.length !== 1 ? 's' : ''} awaiting approval
            </p>

            <div className="flex flex-col gap-4">
              {recruiters.map(rec => (
                <article
                  key={rec._id}
                  className="bg-white rounded-[24px] p-6 border border-[#16131010] flex items-center gap-4 flex-wrap"
                >
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-['Space_Grotesk'] font-bold text-lg flex-shrink-0"
                    style={{ background: colorFor(rec.name) }}
                  >
                    {(rec.name || '?')[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-['Space_Grotesk'] font-bold text-[17px] text-[#161310]">
                      {rec.name}
                    </h3>
                    <p className="text-[#3B342B] text-sm">{rec.email}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/40">
                        Registered {fmtDate(rec.createdAt)}
                      </span>
                      <span className="font-['JetBrains_Mono'] text-[11px] px-2.5 py-0.5 rounded-full bg-[#FDE9DC] text-[#E96A3A]">
                        pending
                      </span>
                    </div>
                    {actionErrors[rec._id] && (
                      <p className="text-sm text-red-600 mt-1.5">{actionErrors[rec._id]}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleStatus(rec._id, 'approved')}
                      disabled={!!updating[rec._id]}
                      className="bg-[#2F4A2E] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#243b23] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {updating[rec._id] === 'approved'
                        ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" /> Approving…</>
                        : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => handleStatus(rec._id, 'rejected')}
                      disabled={!!updating[rec._id]}
                      className="bg-[#FEE2E2] text-[#DC2626] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#FECACA] transition-colors disabled:opacity-50 border-0 cursor-pointer"
                    >
                      {updating[rec._id] === 'rejected' ? 'Rejecting…' : '✕ Reject'}
                    </button>
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
