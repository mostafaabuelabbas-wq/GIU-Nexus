import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CategoryBadge from '../components/CategoryBadge'
import ApplicationStatusBadge from '../components/ApplicationStatusBadge'
import SaveJobButton from '../components/SaveJobButton'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'

const TYPE_LABEL = { 'full-time':'Full-time','part-time':'Part-time','internship':'Internship' }
const PALETTE = ['#2F4A2E','#EE5688','#E96A3A','#E5A93A','#5A3A6B','#2A6FDB']
const colorFor = (s = '') => { let h = 0; for (let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return PALETTE[h%PALETTE.length] }

export default function JobDetailPage() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const [job, setJob]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [applyModal, setApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [application, setApplication] = useState(null)

  useEffect(() => {
    let cancelled = false
    api.get(`/jobs/${id}`)
      .then(({ data }) => {
        if (cancelled) return
        setJob(data.job ?? data)
        setLoading(false)
      })
      .catch(err => { if (!cancelled) { setError(err.response?.data?.message || 'Job not found.'); setLoading(false) } })
    return () => { cancelled = true }
  }, [id])

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

  const isJobSeeker = user?.role === 'jobSeeker'

  if (loading) return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
    </div>
  )

  if (error || !job) return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <h2 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310]">Job not found.</h2>
        <p className="text-[#3B342B]">{error}</p>
        <Link to="/jobs" className="bg-[#161310] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-black transition-colors no-underline">Browse all jobs →</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-10 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/45 mb-8">
          <Link to="/jobs" className="hover:text-[#161310] transition-colors no-underline">Jobs</Link>
          <span>›</span><span>{job.category}</span>
          <span>›</span><span className="text-[#161310]">{job.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

          {/* ── Main ── */}
          <div className="flex flex-col gap-6">

            {/* Header card */}
            <div className="bg-white rounded-[32px] p-8 border border-[#16131010]">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-['Space_Grotesk'] font-bold text-2xl flex-shrink-0"
                  style={{ background: colorFor(job.company) }}>
                  {(job.company || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="font-['Space_Grotesk'] font-bold text-[28px] text-[#161310] leading-tight m-0">{job.title}</h1>
                      <p className="text-[#3B342B] text-lg mt-1">{job.company}</p>
                    </div>
                    <SaveJobButton jobId={job._id} initialSaved={job.saved} jobStatus={job.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <CategoryBadge category={job.category} />
                    <span className="text-[#3B342B] text-sm">📍 {job.location}</span>
                    {job.type && <span className="bg-[#F1EAD9] text-[#161310] text-xs font-medium px-3 py-1 rounded-full">{TYPE_LABEL[job.type] ?? job.type}</span>}
                    {job.workMode && <span className="bg-[#F1EAD9] text-[#161310] text-xs font-medium px-3 py-1 rounded-full capitalize">{job.workMode}</span>}
                    {job.salary && <span className="text-[#E96A3A] font-semibold text-sm">EGP {Number(job.salary).toLocaleString()}</span>}
                  </div>
                </div>
              </div>

              {/* CTA row */}
              {isJobSeeker && (
                <div className="mt-6 pt-6 border-t border-[#16131010] flex items-center gap-4 flex-wrap">
                  {application ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#3B342B]">Your application:</span>
                      <ApplicationStatusBadge status={application.status} />
                    </div>
                  ) : job.status === 'open' ? (
                    <>
                      <button onClick={() => setApplyModal(true)}
                        className="bg-[#EE5688] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#e9437a] transition-colors">
                        Apply now →
                      </button>
                      <span className="text-xs text-[#3B342B]/50">Cover letter optional · quick apply</span>
                    </>
                  ) : (
                    <span className="bg-[#F1EAD9] text-[#3B342B] font-semibold text-sm px-5 py-2.5 rounded-full">This role is closed</span>
                  )}
                </div>
              )}
              {!isAuthenticated && job.status === 'open' && (
                <div className="mt-6 pt-6 border-t border-[#16131010]">
                  <Link to="/login" className="bg-[#EE5688] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#e9437a] transition-colors no-underline inline-block">
                    Sign in to apply →
                  </Link>
                </div>
              )}
            </div>

            {/* Description */}
            {job.description && (
              <div className="bg-white rounded-[28px] p-8 border border-[#16131010]">
                <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#161310] mb-4">About this role</h2>
                <p className="text-[#3B342B] text-[15px] leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            )}

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="bg-white rounded-[28px] p-8 border border-[#16131010]">
                <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#161310] mb-4">Requirements</h2>
                <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#3B342B] text-[15px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EE5688] flex-shrink-0 mt-[9px]" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div>
            <div className="bg-white rounded-[28px] p-6 border border-[#16131010] sticky top-[96px]">
              <h3 className="font-['Space_Grotesk'] font-bold text-base text-[#161310] mb-4">Job details</h3>
              <dl className="flex flex-col gap-3 m-0">
                {[
                  { label:'Company',  value: job.company },
                  { label:'Location', value: job.location },
                  { label:'Type',     value: TYPE_LABEL[job.type] ?? job.type },
                  { label:'Status',   value: job.status },
                  job.totalSlots ? { label:'Slots', value: `${job.totalSlots} position${job.totalSlots>1?'s':''}` } : null,
                ].filter(Boolean).map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-2">
                    <dt className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/50">{label}</dt>
                    <dd className="text-sm font-semibold text-[#161310] text-right capitalize m-0">{value}</dd>
                  </div>
                ))}
              </dl>
              {isJobSeeker && !application && job.status === 'open' && (
                <button onClick={() => setApplyModal(true)}
                  className="w-full mt-6 bg-[#EE5688] text-white font-bold py-3.5 rounded-full hover:bg-[#e9437a] transition-colors">
                  Apply now →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Apply modal */}
      <Modal
        isOpen={applyModal}
        title={`Apply for ${job.title}`}
        confirmLabel={applying ? 'Applying…' : 'Submit application'}
        loading={applying}
        onConfirm={handleApply}
        onCancel={() => { setApplyModal(false); setApplyError(''); setCoverLetter('') }}
      >
        <p className="text-sm text-[#3B342B] mb-3 leading-relaxed">
          Applying to <strong>{job.title}</strong> at <strong>{job.company}</strong>.
          Cover letter is optional but recommended.
        </p>
        {applyError && (
          <div className="mb-3 p-3 bg-[#FEE2E2] border border-red-200 rounded-xl text-red-700 text-sm">{applyError}</div>
        )}
        <textarea
          value={coverLetter}
          onChange={e => setCoverLetter(e.target.value)}
          rows={5}
          placeholder="Optional: why you're a great fit, relevant experience, anything the recruiter should know…"
          className="w-full bg-[#F1EAD9] border border-[#16131010] rounded-xl px-4 py-3 text-[#161310] text-[14px] focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 transition-all resize-none"
        />
      </Modal>

      <Footer />
    </div>
  )
}
