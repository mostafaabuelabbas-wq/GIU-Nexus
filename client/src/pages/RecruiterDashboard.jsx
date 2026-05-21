import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CategoryBadge from '../components/CategoryBadge'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'

const unwrap = (data) =>
  Array.isArray(data) ? data : data?.jobs ?? data?.data ?? data?.results ?? []

const TYPE_LABEL = { 'full-time': 'Full-time', 'part-time': 'Part-time', 'internship': 'Internship' }

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const isPending = user?.status === 'pending'

  const load = () => {
    setLoading(true)
    setError('')
    api.get('/jobs/my-jobs')
      .then(({ data }) => { setJobs(unwrap(data)); setLoading(false) })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load your jobs.')
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])

  const totalApplicants = jobs.reduce(
    (s, j) => s + (j.applicantCount ?? j.applications?.length ?? 0), 0
  )
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

      {/* Header */}
      <div className="max-w-[1360px] w-full mx-auto px-10 pt-10 pb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="font-['Space_Grotesk'] font-bold text-[48px] text-[#161310] leading-tight tracking-tight m-0">
                Recruiter hub.
              </h1>
              <span className="font-['Cairo'] font-black text-[40px] text-[#3B342B]/25">لوحتك</span>
            </div>
            <p className="text-[#3B342B] text-[17px] mt-2">Manage your job posts and review applicants.</p>
          </div>
          {!isPending && (
            <Link
              to="/recruiter/jobs/create"
              className="bg-[#EE5688] text-white font-bold px-6 py-3.5 rounded-full hover:bg-[#e9437a] transition-colors no-underline flex items-center gap-2 flex-shrink-0"
            >
              + Post a new role
            </Link>
          )}
        </div>
      </div>

      {/* Pending approval banner */}
      {isPending && (
        <div className="max-w-[1360px] w-full mx-auto px-10 mb-4">
          <div className="bg-[#FDE9DC] border border-[#E96A3A]/30 rounded-[24px] px-6 py-5 flex items-start gap-4">
            <span className="w-3 h-3 rounded-full bg-[#E96A3A] flex-shrink-0 mt-1 shadow-[0_0_0_4px_rgba(233,106,58,0.2)] animate-pulse" />
            <div>
              <p className="font-['Space_Grotesk'] font-bold text-[#7A3E1C] text-[17px]">
                Your account is pending admin approval.
              </p>
              <p className="text-[#7A3E1C]/80 text-sm mt-1 leading-relaxed">
                You can browse the platform, but posting jobs is locked until an admin approves your account.
                You'll receive an email once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-[1360px] w-full mx-auto px-10 pb-16">

        {/* Stats row */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total posts',      value: jobs.length,      color: '#161310', bg: '#161310',  tc: '#F1EAD9', ar: 'إعلاناتك' },
              { label: 'Open roles',       value: openJobs,         color: '#2F4A2E', bg: '#2F4A2E',  tc: '#F1EAD9', ar: 'مفتوح'   },
              { label: 'Total applicants', value: totalApplicants,  color: '#EE5688', bg: 'white',    tc: '#161310', ar: 'متقدم'   },
              { label: 'Closed roles',     value: closedJobs,       color: '#3B342B', bg: 'white',    tc: '#161310', ar: 'مغلق'    },
            ].map(stat => (
              <div
                key={stat.label}
                className="rounded-[24px] p-6 border border-[#16131010] flex flex-col justify-between min-h-[130px]"
                style={{ background: stat.bg }}
              >
                <p
                  className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider"
                  style={{ color: stat.bg === 'white' ? '#3B342B' : 'rgba(241,234,217,0.5)' }}
                >
                  {stat.label}
                </p>
                <div>
                  <div
                    className="font-['Space_Grotesk'] font-bold text-[42px] leading-none mt-1"
                    style={{ color: stat.bg === 'white' ? stat.color : stat.tc }}
                  >
                    {stat.value}
                  </div>
                  <p
                    className="font-['Cairo'] font-bold text-sm mt-0.5"
                    style={{ color: stat.bg === 'white' ? '#3B342B' : 'rgba(241,234,217,0.35)' }}
                    dir="rtl"
                  >
                    {stat.ar}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16">
            <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">
              Failed to load your jobs.
            </h3>
            <p className="text-[#3B342B] mb-6">{error}</p>
            <button
              onClick={load}
              className="bg-[#161310] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-black transition-colors"
            >
              Try again →
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-20 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#F7F1E3] border border-[#16131010] flex items-center justify-center text-3xl mx-auto mb-5">
              💼
            </div>
            <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40 mb-3">
              // no posts yet
            </p>
            <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">
              No job posts yet.
            </h3>
            <p className="text-[#3B342B] mb-6 leading-relaxed">
              {isPending
                ? 'Once your account is approved, you can start posting roles.'
                : 'Post your first role and start receiving applications from GIU students.'}
            </p>
            {!isPending && (
              <Link
                to="/recruiter/jobs/create"
                className="bg-[#EE5688] text-white font-bold px-6 py-3 rounded-full hover:bg-[#e9437a] transition-colors no-underline inline-block"
              >
                Post a role →
              </Link>
            )}
          </div>
        )}

        {/* Job list */}
        {!loading && !error && jobs.length > 0 && (
          <>
            <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/45 mb-4">
              {jobs.length} post{jobs.length !== 1 ? 's' : ''} · sorted by newest
            </p>

            <div className="flex flex-col gap-3">
              {jobs.map(job => {
                const appCount = job.applicantCount ?? job.applications?.length ?? 0
                return (
                  <article
                    key={job._id}
                    className="bg-white rounded-[24px] p-5 border border-[#16131010] flex items-center gap-4 hover:-translate-y-px transition-transform"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-['Space_Grotesk'] font-bold text-[16px] text-[#161310] truncate">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <CategoryBadge category={job.category} size="sm" />
                            <span className="text-[#3B342B] text-xs">{job.location}</span>
                            {job.type && (
                              <span className="text-[#3B342B] text-xs">
                                · {TYPE_LABEL[job.type] ?? job.type}
                              </span>
                            )}
                            <span
                              className={`font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded-full capitalize ${
                                job.status === 'open'
                                  ? 'bg-[#DCFCE7] text-[#15803D]'
                                  : 'bg-[#F3F4F6] text-[#6B7280]'
                              }`}
                            >
                              {job.status}
                            </span>
                          </div>
                        </div>

                        {/* Applicant count */}
                        <div className="text-right flex-shrink-0">
                          <div className="font-['Space_Grotesk'] font-bold text-[26px] text-[#161310] leading-none">
                            {appCount}
                          </div>
                          <div className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/45 mt-0.5">
                            applicant{appCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        to={`/recruiter/applicants/${job._id}`}
                        className="text-xs font-bold text-white bg-[#2F4A2E] px-3 py-2 rounded-full hover:bg-[#243b23] transition-colors no-underline"
                      >
                        Applicants →
                      </Link>
                      <Link
                        to={`/recruiter/jobs/${job._id}/edit`}
                        className="text-xs font-bold text-[#161310] bg-[#F1EAD9] px-3 py-2 rounded-full hover:bg-[#E9E0CB] transition-colors no-underline border border-[#16131010]"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteId(job._id)}
                        className="text-xs font-bold text-[#DC2626] bg-[#FEE2E2] px-3 py-2 rounded-full hover:bg-[#FECACA] transition-colors border-0 cursor-pointer"
                      >
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
