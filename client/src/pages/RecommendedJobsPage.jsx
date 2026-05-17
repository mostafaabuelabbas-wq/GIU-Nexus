import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import JobCard from '../components/JobCard'
import Skeleton from '../components/Skeleton'

export default function RecommendedJobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/jobs/recommended')
      .then(res => setJobs(res.data.jobs || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load recommendations'))
      .finally(() => setLoading(false))
  }, [])

  const hasNoSkills = !user?.skills || user.skills.length === 0

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-['Space_Grotesk'] font-bold text-3xl text-[#161310]">
            Recommended for You
          </h1>
          <p className="text-[#3B342B] mt-2 text-sm">
            Jobs ranked by AI similarity to your skills
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-[#FEE2E2] text-[#B91C1C] rounded-2xl px-5 py-4 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Loading state — Skeleton per spec */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        )}

        {/* Empty state — no skills */}
        {!loading && !error && hasNoSkills && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-5xl">🤖</span>
            <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#161310]">
              No recommendations yet
            </h2>
            <p className="text-[#3B342B] text-sm max-w-xs">
              Add skills to your profile so we can match you with the right jobs.
            </p>
            <Link
              to="/profile"
              className="mt-2 bg-[#EE5688] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#D94478] transition-colors no-underline"
            >
              Go to Profile → Extract Skills
            </Link>
          </div>
        )}

        {/* Empty state — has skills but no matches */}
        {!loading && !error && !hasNoSkills && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <span className="text-5xl">🔍</span>
            <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#161310]">
              No matching jobs found
            </h2>
            <p className="text-[#3B342B] text-sm">
              Check back soon as new jobs are posted.
            </p>
          </div>
        )}

        {/* Jobs grid */}
        {!loading && !error && jobs.length > 0 && (
          <>
            <p className="text-[#3B342B] text-xs mb-5 font-['JetBrains_Mono']">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} ranked by match score
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map(job => (
                <JobCard
                  key={job._id}
                  job={job}
                  score={job.score}
                  showSaveButton={false}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
