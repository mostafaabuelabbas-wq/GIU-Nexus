import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ApplicationStatusBadge from '../components/ApplicationStatusBadge'
import Spinner from '../components/Spinner'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const TYPE_LABEL = { 'full-time': 'Full-time', 'part-time': 'Part-time', 'internship': 'Internship' }

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/applications/my')
      .then(res => setApplications(res.data.applications || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load applications'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-[1360px] w-full mx-auto px-10 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-['Space_Grotesk'] font-bold text-3xl text-[#161310]">
            My Applications
          </h1>
          <p className="text-[#3B342B] mt-2 text-sm">
            Track the status of every job you've applied to
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[#FEE2E2] text-[#B91C1C] rounded-2xl px-5 py-4 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && <Spinner />}

        {/* Empty state */}
        {!loading && !error && applications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-5xl">📋</span>
            <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#161310]">
              No applications yet
            </h2>
            <p className="text-[#3B342B] text-sm">
              Start applying to jobs and track your progress here.
            </p>
            <Link
              to="/jobs"
              className="mt-2 bg-[#EE5688] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#D94478] transition-colors no-underline"
            >
              Browse Jobs
            </Link>
          </div>
        )}

        {/* Applications list */}
        {!loading && !error && applications.length > 0 && (
          <>
            <p className="text-[#3B342B] text-xs mb-5 font-['JetBrains_Mono']">
              {applications.length} application{applications.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-col gap-3">
              {applications.map(app => {
                const job = app.job || {}
                return (
                  <div
                    key={app._id}
                    className="bg-white rounded-[28px] px-5 py-4 border border-[#16131010] flex items-center gap-4 hover:-translate-y-0.5 transition-transform"
                  >
                    {/* Company initial */}
                    <div className="w-11 h-11 rounded-xl bg-[#F1EAD9] flex items-center justify-center font-['Space_Grotesk'] font-bold text-base text-[#161310] flex-shrink-0">
                      {(job.company || '?')[0].toUpperCase()}
                    </div>

                    {/* Job info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="font-['Space_Grotesk'] font-bold text-[15px] text-[#161310] hover:text-[#EE5688] transition-colors no-underline leading-tight line-clamp-1"
                      >
                        {job.title || 'Unknown Position'}
                      </Link>
                      <p className="text-[#3B342B] text-sm mt-0.5 truncate">
                        {job.company || '—'}
                        {job.type && (
                          <span className="text-[#3B342B]/50 ml-2">
                            · {TYPE_LABEL[job.type] ?? job.type}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Applied date */}
                    {app.appliedAt && (
                      <span className="text-[#3B342B]/50 text-xs font-['JetBrains_Mono'] hidden sm:block flex-shrink-0">
                        {new Date(app.appliedAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    )}

                    {/* Status badge */}
                    <div className="flex-shrink-0">
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                  </div>
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
