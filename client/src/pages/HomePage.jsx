import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import JobCard from '../components/JobCard'
import { JobCardSkeleton } from '../components/Skeleton'
import HeroSection from './Home/HeroSection'
import ManifestoHow from './Home/MainfestoHow'
import StoriesBottom from './Home/StoriesBottom'

const unwrap = (d) => Array.isArray(d) ? d : d?.jobs ?? d?.data ?? d?.results ?? []

function JobsSection({ eyebrow, heading, headingAr, sub, linkTo, linkLabel, data }) {
  return (
    <section className="max-w-[1360px] mx-auto px-10 py-[72px]">
      <div className="flex justify-between items-end gap-6 mb-8 flex-wrap">
        <div>
          <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B] block mb-3">
            {eyebrow} · <span dir="rtl" className="font-['Cairo'] font-bold">{headingAr}</span>
          </span>
          <h2 className="font-['Space_Grotesk'] font-bold text-[48px] tracking-[-0.03em] leading-none text-[#161310] m-0 max-w-[18ch]">{heading}</h2>
          {sub && <p className="text-[16px] text-[#3B342B] mt-2">{sub}</p>}
        </div>
        <Link to={linkTo} className="inline-flex items-center gap-2 text-[#161310] font-['Space_Grotesk'] font-semibold text-[15px] px-5 py-3 rounded-full hover:bg-[#161310] hover:text-[#F1EAD9] transition-colors no-underline">
          {linkLabel} <span aria-hidden="true">→</span>
        </Link>
      </div>
      {data.loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      )}
      {!data.loading && data.error && (
        <div className="bg-[#FDE9DC] border border-[#E96A3A]/30 rounded-[32px] p-10 text-center" role="alert">
          <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B] block mb-3">// something broke</span>
          <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">Couldn't load this section.</h3>
          <p className="text-[#3B342B] mb-6">{data.error}</p>
          <button onClick={() => window.location.reload()} className="bg-[#161310] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-black transition-colors">Try again →</button>
        </div>
      )}
      {!data.loading && !data.error && data.jobs.length === 0 && (
        <div className="bg-[#F7F1E3] border border-[#161310] rounded-[32px] p-10 text-center">
          <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B] block mb-3">// no matches yet</span>
          <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">No open jobs right now.</h3>
          <p className="text-[#3B342B] mb-6">New roles drop every morning at 6am.</p>
        </div>
      )}
      {!data.loading && !data.error && data.jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.jobs.map(j => <JobCard key={j._id} job={j} score={typeof j.score==='number'?j.score:undefined} />)}
        </div>
      )}
    </section>
  )
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()

  // Trending: initial loading:true is set in useState — never reset it synchronously in an effect
  const [trending, setTrending] = useState({ loading: true, error: null, jobs: [] })

  // Rec: use a `fetched` flag so loading is derived, never set synchronously inside an effect
  const [rec, setRec] = useState({ fetched: false, error: null, jobs: [], noSkills: false })

  const showRec   = isAuthenticated && user?.role === 'jobSeeker'
  const recLoading = showRec && !rec.fetched && !rec.error && !rec.noSkills

  useEffect(() => {
    let cancelled = false
    api.get('/jobs', { params: { limit: 6, status: 'open' } })
      .then(({ data }) => { if (!cancelled) setTrending({ loading: false, error: null, jobs: unwrap(data).slice(0, 6) }) })
      .catch(err  => { if (!cancelled) setTrending({ loading: false, error: err?.message || 'Failed to load jobs', jobs: [] }) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!showRec) return
    let cancelled = false
    api.get('/jobs/recommended')
      .then(({ data }) => { if (!cancelled) setRec({ fetched: true, error: null, jobs: unwrap(data).slice(0, 6), noSkills: false }) })
      .catch(err => {
        if (cancelled) return
        const status = err?.response?.status
        const msg    = (err?.response?.data?.message || '').toLowerCase()
        const noSk   = status === 400 && (msg.includes('skill') || msg.includes('bio'))
        setRec({ fetched: true, error: noSk ? null : (err?.message || 'Failed'), jobs: [], noSkills: noSk })
      })
    return () => { cancelled = true }
  }, [showRec])

  const primaryCta = !isAuthenticated
    ? { to: '/register',           label: 'Find my first job' }
    : user?.role === 'jobSeeker'
      ? { to: '/jobs/recommended', label: 'See my recommended jobs' }
      : user?.role === 'recruiter'
        ? { to: '/recruiter/jobs/create', label: 'Post a role' }
        : { to: '/admin/dashboard', label: 'Open admin' }

  return (
    <div className="bg-[#F1EAD9] text-[#161310] overflow-x-hidden">
      <Navbar />

      <HeroSection primaryCta={primaryCta} />

      {/* ── Recommended (authed job seekers) ── */}
      {showRec && !rec.noSkills && (
        <JobsSection
          eyebrow="/ For you"
          headingAr="مخصص ليك"
          heading={`Recommended for you, ${(user?.name||'').split(' ')[0]}.`}
          sub="Ranked by similarity to your extracted skills."
          linkTo="/jobs/recommended"
          linkLabel="See all matches"
          data={{ loading: recLoading, error: rec.error, jobs: rec.jobs }}
        />
      )}
      {showRec && !recLoading && rec.noSkills && (
        <section className="max-w-[1360px] mx-auto px-10 py-[72px]">
          <div className="bg-[#F7F1E3] border-[1.5px] border-[#161310] rounded-[32px] p-10 text-center">
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B] block mb-3">// no skills yet</span>
            <h3 className="font-['Space_Grotesk'] font-bold text-[28px] tracking-tight text-[#161310] mb-3">We need to read you first.</h3>
            <p className="text-[#3B342B] text-[15px] leading-relaxed mb-6 max-w-[44ch] mx-auto">
              Add a short bio to your profile and run <strong>Extract Skills</strong> — we'll rank every open role by how well it fits you.
            </p>
            <Link to="/profile" className="inline-flex items-center gap-2 bg-[#161310] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-black transition-colors no-underline">
              Set up my profile →
            </Link>
          </div>
        </section>
      )}

      {/* ── Trending ── */}
      <JobsSection
        eyebrow="/ Trending now"
        headingAr="الأكثر طلباً"
        heading="Roles open this week."
        sub="Fresh listings from verified Egyptian companies."
        linkTo="/jobs"
        linkLabel="Browse all jobs"
        data={trending}
      />

      <ManifestoHow />
      <StoriesBottom />

      <Footer />
    </div>
  )
}
