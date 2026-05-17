import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import JobCard from '../components/JobCard'
import Spinner from '../components/Spinner'

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/jobs/saved')
      .then(res => setJobs(res.data.jobs || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load saved jobs'))
      .finally(() => setLoading(false))
  }, [])

  const handleUnsave = async (jobId) => {
    // Optimistic removal
    setJobs(prev => prev.filter(j => j._id !== jobId))
    try {
      await api.post(`/jobs/${jobId}/save`)
    } catch {
      // On failure re-fetch to restore correct state
      api.get('/jobs/saved')
        .then(res => setJobs(res.data.jobs || []))
        .catch(() => {})
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-['Space_Grotesk'] font-bold text-3xl text-[#161310]">
            Saved Jobs
          </h1>
          <p className="text-[#3B342B] mt-2 text-sm">
            Jobs you've bookmarked for later
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
        {!loading && !error && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-5xl">🔖</span>
            <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#161310]">
              No saved jobs yet
            </h2>
            <p className="text-[#3B342B] text-sm">
              Bookmark jobs you're interested in to find them here.
            </p>
            <Link
              to="/jobs"
              className="mt-2 bg-[#EE5688] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#D94478] transition-colors no-underline"
            >
              Browse Jobs
            </Link>
          </div>
        )}

        {/* Jobs grid */}
        {!loading && !error && jobs.length > 0 && (
          <>
            <p className="text-[#3B342B] text-xs mb-5 font-['JetBrains_Mono']">
              {jobs.length} saved job{jobs.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map(job => (
                <div key={job._id} className="relative group/card">
                  <JobCard job={job} showSaveButton={false} />
                  {/* Unsave button overlay */}
                  <button
                    onClick={() => handleUnsave(job._id)}
                    className="absolute top-4 right-4 bg-[#FEE2E2] text-[#B91C1C] text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#FECACA] transition-colors opacity-0 group-hover/card:opacity-100"
                  >
                    Unsave
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
