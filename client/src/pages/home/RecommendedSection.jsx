import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import JobCard from '../../components/JobCard'
import { JobCardSkeleton } from '../../components/Skeleton'

const unwrap = (data) =>
  Array.isArray(data) ? data : data?.jobs ?? data?.data ?? data?.results ?? []

/**
 * Self-contained section — drop inside your authenticated HomePage.
 * Fetches /jobs/recommended, handles all 3 states internally.
 * Shows top 6 results with match scores.
 */
export default function RecommendedSection() {
  const { user } = useAuth()
  const [jobs, setJobs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [noSkills, setNoSkills] = useState(false)

  useEffect(() => {
    let cancelled = false
    api.get('/jobs/recommended')
      .then(({ data }) => {
        if (cancelled) return
        setJobs(unwrap(data).slice(0, 6))
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        const status = err.response?.status
        const msg    = (err.response?.data?.message || '').toLowerCase()
        if (status === 400 && (msg.includes('skill') || msg.includes('bio'))) {
          setNoSkills(true)
        } else {
          setError(err.response?.data?.message || 'Could not load recommendations.')
        }
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const firstName = (user?.name || '').split(' ')[0]

  return (
    <section className="max-w-[1360px] mx-auto px-10 py-16">

      {/* Section header */}
      <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
        <div>
          <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B]/50 block mb-2">
            // AI · recommended for {firstName || 'you'} · نظام المطابقة
          </span>
          <h2 className="font-['Space_Grotesk'] font-bold text-[42px] text-[#161310] leading-none tracking-tight m-0">
            Picked for{' '}
            {firstName
              ? <span className="text-[#EE5688]">{firstName}.</span>
              : 'you.'}
          </h2>
          <span
            className="font-['Cairo'] font-black text-[32px] text-[#3B342B]/20 mt-1 block"
            dir="rtl"
          >
            مختار على مقاسك
          </span>
        </div>
        <Link
          to="/jobs/recommended"
          className="font-['Space_Grotesk'] font-bold text-sm text-[#161310] bg-white border border-[#16131010] px-5 py-2.5 rounded-full hover:bg-[#F1EAD9] transition-colors no-underline flex-shrink-0 shadow-sm"
        >
          See all recommendations →
        </Link>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      )}

      {/* No skills extracted yet */}
      {!loading && noSkills && (
        <div className="bg-[#2F4A2E] text-white rounded-[32px] px-10 py-10 flex items-center justify-between gap-8 flex-wrap">
          <div>
            <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-white/40 mb-2">
              // no skills extracted yet
            </p>
            <h3 className="font-['Space_Grotesk'] font-bold text-[28px] leading-tight m-0">
              Let the AI read you first.
            </h3>
            <p className="text-white/65 text-[15px] mt-2 max-w-[42ch] leading-relaxed">
              Add a bio to your profile, then run{' '}
              <strong className="text-white">Extract Skills from Bio</strong> — we'll rank
              every open role by how well it fits you.
            </p>
          </div>
          <Link
            to="/profile"
            className="bg-[#E5A93A] text-[#161310] font-bold px-6 py-3.5 rounded-full hover:bg-yellow-400 transition-colors no-underline flex-shrink-0 whitespace-nowrap"
          >
            Set up my profile →
          </Link>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-[#F7F1E3] border border-[#16131010] rounded-[28px] px-8 py-8 text-center">
          <p className="text-[#3B342B] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#161310] text-[#F1EAD9] font-bold px-5 py-2.5 rounded-full hover:bg-black transition-colors text-sm"
          >
            Try again →
          </button>
        </div>
      )}

      {/* Empty (has skills but no matches yet) */}
      {!loading && !error && !noSkills && jobs.length === 0 && (
        <div className="bg-[#F7F1E3] border border-[#16131010] rounded-[28px] px-8 py-10 text-center">
          <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40 mb-3">
            // no matches yet
          </p>
          <h3 className="font-['Space_Grotesk'] font-bold text-xl text-[#161310] mb-2">
            No matches yet.
          </h3>
          <p className="text-[#3B342B] text-[15px] leading-relaxed">
            Fresh roles drop every morning at 6am. Check back soon — or browse everything now.
          </p>
          <Link
            to="/jobs"
            className="inline-block mt-5 bg-[#161310] text-[#F1EAD9] font-bold px-5 py-2.5 rounded-full hover:bg-black transition-colors no-underline text-sm"
          >
            Browse all jobs →
          </Link>
        </div>
      )}

      {/* Jobs grid */}
      {!loading && !error && jobs.length > 0 && (
        <>
          <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/45 mb-5">
            {jobs.length} role{jobs.length !== 1 ? 's' : ''} · ranked by AI match score
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(j => (
              <JobCard
                key={j._id}
                job={j}
                score={typeof j.score === 'number' ? j.score : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
