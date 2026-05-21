import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import SkillChip from '../components/SkillChip'
import ApplicationStatusBadge from '../components/ApplicationStatusBadge'

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

const unwrap = (data) =>
  Array.isArray(data) ? data : data?.applications ?? data?.data ?? []

export default function ApplicantsPage() {
  const { jobId } = useParams()
  const [job, setJob]                   = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [updating, setUpdating]         = useState({})       // { [id]: true }
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

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="max-w-[1360px] w-full mx-auto px-10 pt-10 pb-6">
        <Link
          to="/recruiter/dashboard"
          className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/50 hover:text-[#161310] transition-colors inline-flex items-center gap-1.5 mb-4 no-underline"
        >
          ← Back to dashboard
        </Link>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="font-['Space_Grotesk'] font-bold text-[42px] text-[#161310] leading-tight tracking-tight m-0">
            Applicants.
          </h1>
          <span className="font-['Cairo'] font-black text-[34px] text-[#3B342B]/25">المتقدّمون</span>
        </div>
        {job && (
          <p className="text-[#3B342B] text-[16px] mt-2">
            For <strong className="text-[#161310]">{job.title}</strong>
            {job.company && <span className="text-[#3B342B]/70"> · {job.company}</span>}
          </p>
        )}
      </div>

      <div className="flex-1 max-w-[1360px] w-full mx-auto px-10 pb-16">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16">
            <h3 className="font-['Space_Grotesk'] font-bold text-xl text-[#161310] mb-2">Couldn't load applicants.</h3>
            <p className="text-[#3B342B] mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#161310] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-black transition-colors"
            >
              Try again →
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && applications.length === 0 && (
          <div className="text-center py-24 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#F7F1E3] border border-[#16131010] flex items-center justify-center text-3xl mx-auto mb-5">
              📭
            </div>
            <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40 mb-3">
              // nothing here yet
            </p>
            <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">
              No applicants yet for this job.
            </h3>
            <p className="text-[#3B342B] leading-relaxed">
              They'll show up here the moment someone applies.
            </p>
          </div>
        )}

        {/* List */}
        {!loading && !error && applications.length > 0 && (
          <>
            <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/45 mb-5">
              {applications.length} applicant{applications.length !== 1 ? 's' : ''}
            </p>

            <div className="flex flex-col gap-4">
              {applications.map(app => {
                const u = app.user || {}
                return (
                  <article
                    key={app._id}
                    className="bg-white rounded-[24px] p-6 border border-[#16131010] flex items-start gap-4 flex-wrap"
                  >
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-['Space_Grotesk'] font-bold text-lg flex-shrink-0"
                      style={{ background: colorFor(u.name) }}
                    >
                      {(u.name || '?')[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-['Space_Grotesk'] font-bold text-[17px] text-[#161310]">
                          {u.name || 'Unknown applicant'}
                        </h3>
                        <ApplicationStatusBadge status={app.status} />
                      </div>
                      <p className="text-[#3B342B] text-sm mt-0.5">{u.email}</p>

                      {/* Skills */}
                      {u.skills && u.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {u.skills.slice(0, 8).map((s, i) => (
                            <SkillChip key={i} skill={s} />
                          ))}
                          {u.skills.length > 8 && (
                            <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/50 self-center">
                              +{u.skills.length - 8} more
                            </span>
                          )}
                        </div>
                      )}

                      {actionErrors[app._id] && (
                        <p className="text-sm text-red-600 mt-2">{actionErrors[app._id]}</p>
                      )}
                    </div>

                    {/* Status dropdown */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        disabled={!!updating[app._id]}
                        className="bg-[#F1EAD9] border border-[#16131010] rounded-full px-4 py-2 text-sm font-semibold text-[#161310] focus:outline-none focus:ring-2 focus:ring-[#EE5688]/15 disabled:opacity-50 cursor-pointer"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.v} value={s.v}>{s.l}</option>
                        ))}
                      </select>
                      {updating[app._id] && <Spinner size="sm" />}
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}