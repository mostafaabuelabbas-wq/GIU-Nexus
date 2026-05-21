import { useState, useEffect, useMemo } from 'react'
import JobCard from '../components/JobCard'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const TYPES    = [{ v:'', l:'Any type' }, { v:'full-time', l:'Full-time' }, { v:'part-time', l:'Part-time' }, { v:'internship', l:'Internship' }]
const STATUSES = [{ v:'open', l:'Open' }, { v:'', l:'All statuses' }, { v:'closed', l:'Closed' }]
const CATEGORIES = [
  { v:'',                  l:'All',              dot: null },
  { v:'Frontend',          l:'Frontend',         dot: '#2F4A2E' },
  { v:'Backend',           l:'Backend',          dot: '#2A6FDB' },
  { v:'AI/ML',             l:'AI/ML',            dot: '#7C4DBE' },
  { v:'DevOps',            l:'DevOps',           dot: '#4A7873' },
  { v:'Data Engineering',  l:'Data Engineering', dot: '#E96A3A' },
  { v:'Other',             l:'Other',            dot: '#3B342B' },
]
const SORTS = [
  { v:'newest',  l:'Newest' },
  { v:'match',   l:'Match %' },
  { v:'salary',  l:'Salary' },
]
const LIMIT = 9

const unwrap = (data) => Array.isArray(data) ? data : data?.jobs ?? data?.data ?? data?.results ?? []

export default function JobListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [sort, setSort]       = useState('newest')
  const [retryKey, setRetryKey] = useState(0)

  const [filters, setFilters] = useState({
    keyword:  searchParams.get('keyword')  || '',
    location: searchParams.get('location') || '',
    type:     searchParams.get('type')     || '',
    status:   searchParams.get('status')   || 'open',
    category: searchParams.get('category') || '',
  })
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    let active = true
    const params = { ...filters, page, limit: LIMIT }
    Object.keys(params).forEach(k => !params[k] && delete params[k])
    Promise.resolve()
      .then(() => { if (active) { setLoading(true); setError('') } })
      .then(() => api.get('/jobs', { params }))
      .then(({ data }) => {
        if (!active) return
        setJobs(unwrap(data))
        setTotal(data?.total ?? unwrap(data).length)
      })
      .catch(err => { if (active) setError(err.response?.data?.message || 'Failed to load jobs.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [filters, page, retryKey])

  const sortedJobs = useMemo(() => {
    const copy = [...jobs]
    if (sort === 'salary') copy.sort((a, b) => (b.salary || 0) - (a.salary || 0))
    if (sort === 'newest') copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return copy
  }, [jobs, sort])

  const applyDraft = (next) => {
    setDraft(next); setFilters(next); setPage(1)
    const sp = {}
    Object.entries(next).forEach(([k, v]) => { if (v) sp[k] = v })
    setSearchParams(sp)
  }

  const handleSearchSubmit = (e) => { e.preventDefault(); applyDraft(draft) }
  const setCategory = (cat) => applyDraft({ ...draft, category: cat })
  const clearFilters = () => applyDraft({ keyword:'', location:'', type:'', status:'open', category:'' })

  const hasActiveFilters = filters.keyword || filters.location || filters.type || filters.category || filters.status !== 'open'
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  const showingStart = jobs.length === 0 ? 0 : (page - 1) * LIMIT + 1
  const showingEnd   = (page - 1) * LIMIT + jobs.length

  // Shared styles
  const monoLbl = "font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.14em] text-[#2F4A2E]/65"
  const selectCls = "w-full bg-[#F1EAD9] border border-[#2F4A2E]/35 rounded-xl px-4 py-3 pr-9 text-[15px] text-[#1B2F1A] font-medium appearance-none cursor-pointer focus:outline-none focus:border-[#2F4A2E] transition-colors"
  const selectArrow = `bg-no-repeat bg-[length:14px] bg-[right_14px_center] bg-[url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231B2F1A' stroke-width='2.5' stroke-linecap='round'><polyline points='6 9 12 15 18 9'/></svg>")]`

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-10 pt-10 pb-16">

        {/* ── Page header ── */}
        <p className={monoLbl + " mb-5"}>
          // {total} open {total === 1 ? 'role' : 'roles'} · updated moments ago
        </p>
        <h1 className="font-['Space_Grotesk'] font-bold text-[64px] md:text-[88px] leading-[0.95] tracking-[-0.02em] text-[#1B2F1A] m-0 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span>Find your fit<em className="not-italic font-serif italic font-normal">,</em></span>
          <span className="font-['Cairo'] text-[#1B2F1A]" lang="ar">لاقي شغلك<em className="not-italic font-serif italic font-normal">.</em></span>
        </h1>
        <p className="text-[#2F4A2E] text-[17px] mt-6 max-w-[680px] leading-relaxed">
          Every job posted by an actual recruiter, AI-tagged by category, sortable by match score once you've filled out your profile. No agencies. No reposts. No <em className="font-serif italic">"ASAP"</em>.
        </p>

        {/* ── Filter card ── */}
        <div className="bg-[#F1EAD9] border-2 border-[#2F4A2E]/40 rounded-[24px] p-6 mt-10">
          <form onSubmit={handleSearchSubmit}>

            {/* Top row: search + selects + clear */}
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-end">

              {/* Search */}
              <div className="md:col-span-1">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2F4A2E]/60" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input type="text" value={draft.keyword}
                    onChange={e => setDraft(p => ({ ...p, keyword: e.target.value }))}
                    placeholder="Search roles, companies, stacks…"
                    className="w-full bg-[#F1EAD9] border border-[#2F4A2E]/35 rounded-xl pl-11 pr-4 py-3 text-[15px] text-[#1B2F1A] placeholder-[#2F4A2E]/45 focus:outline-none focus:border-[#2F4A2E] transition-colors" />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={monoLbl + " block mb-2"}>// Location</label>
                <input type="text" value={draft.location}
                  onChange={e => setDraft(p => ({ ...p, location: e.target.value }))}
                  placeholder="Any location"
                  className="w-full bg-[#F1EAD9] border border-[#2F4A2E]/35 rounded-xl px-4 py-3 text-[15px] text-[#1B2F1A] placeholder-[#2F4A2E]/45 focus:outline-none focus:border-[#2F4A2E] transition-colors" />
              </div>

              {/* Type */}
              <div>
                <label className={monoLbl + " block mb-2"}>// Type</label>
                <select value={draft.type} onChange={e => applyDraft({ ...draft, type: e.target.value })}
                  className={selectCls + " " + selectArrow}>
                  {TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className={monoLbl + " block mb-2"}>// Status</label>
                <select value={draft.status} onChange={e => applyDraft({ ...draft, status: e.target.value })}
                  className={selectCls + " " + selectArrow}>
                  {STATUSES.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
              </div>

              {/* Clear */}
              <button type="button" onClick={clearFilters} disabled={!hasActiveFilters}
                className="px-5 py-3 rounded-xl border border-[#2F4A2E]/35 text-[#1B2F1A] font-semibold text-[14px] hover:bg-[#2F4A2E]/8 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
                Clear filters
              </button>
            </div>

            {/* Category row */}
            <div className="mt-5 pt-5 border-t border-dashed border-[#2F4A2E]/25 flex items-center gap-3 flex-wrap">
              <span className={monoLbl}>// Category</span>
              {CATEGORIES.map(c => {
                const active = filters.category === c.v
                return (
                  <button
                    key={c.v || 'all'}
                    type="button"
                    onClick={() => setCategory(c.v)}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-['Space_Grotesk'] font-semibold text-[14px] transition-all ${
                      active
                        ? 'bg-[#1B2F1A] text-[#F1EAD9] border-2 border-[#1B2F1A]'
                        : 'bg-transparent text-[#1B2F1A] border-2 border-[#2F4A2E]/30 hover:border-[#2F4A2E]'
                    }`}
                  >
                    {c.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />}
                    {c.l}
                  </button>
                )
              })}
            </div>
          </form>
        </div>

        {/* ── Showing + sort ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap mt-8 mb-6">
          <p className={monoLbl}>
            // showing {showingStart}-{showingEnd} of {total}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={monoLbl + " mr-1"}>// sort by</span>
            {SORTS.map(s => {
              const active = sort === s.v
              return (
                <button
                  key={s.v}
                  type="button"
                  onClick={() => setSort(s.v)}
                  className={`px-4 py-1.5 rounded-full font-['Space_Grotesk'] font-semibold text-[14px] transition-all ${
                    active
                      ? 'bg-[#E5A93A] text-[#1B2F1A] border-2 border-[#E5A93A]'
                      : 'bg-transparent text-[#1B2F1A] border-2 border-[#2F4A2E]/30 hover:border-[#2F4A2E]'
                  }`}
                >
                  {s.l}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Results ── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#F5EFE0] rounded-[18px] p-5 border border-[#16131035] animate-pulse h-[260px]">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-[10px] bg-[#2F4A2E]/15" />
                  <div className="h-7 w-24 rounded-full bg-[#2F4A2E]/15" />
                </div>
                <div className="h-6 bg-[#2F4A2E]/15 rounded-lg w-3/4 mb-2" />
                <div className="h-4 bg-[#2F4A2E]/15 rounded-lg w-1/2 mb-4" />
                <div className="h-12 bg-[#2F4A2E]/15 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <p className={monoLbl + " mb-3"}>// something broke</p>
            <h3 className="font-['Space_Grotesk'] font-bold text-3xl text-[#1B2F1A] mb-2">Couldn't load jobs.</h3>
            <p className="text-[#2F4A2E] mb-6">{error}</p>
            <button onClick={() => setRetryKey(k => k + 1)}
              className="bg-[#1B2F1A] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-[#0e1a0d] transition-colors">
              Try again →
            </button>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-20 max-w-sm mx-auto">
            <p className={monoLbl + " mb-3"}>// no results</p>
            <h3 className="font-['Space_Grotesk'] font-bold text-3xl text-[#1B2F1A] mb-2">No jobs found.</h3>
            <p className="text-[#2F4A2E] mb-6 leading-relaxed">Try adjusting your filters — new roles drop every morning at 6am.</p>
            <button onClick={clearFilters}
              className="bg-[#1B2F1A] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-[#0e1a0d] transition-colors">
              Clear filters →
            </button>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedJobs.map(j => <JobCard key={j._id} job={j} showSaveButton={true} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-10 h-10 rounded-full border-2 border-[#2F4A2E]/30 text-[#1B2F1A] flex items-center justify-center hover:border-[#2F4A2E] transition-colors disabled:opacity-30">←</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${page === p ? 'bg-[#1B2F1A] text-[#F1EAD9] border-2 border-[#1B2F1A]' : 'border-2 border-[#2F4A2E]/30 text-[#1B2F1A] hover:border-[#2F4A2E]'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-10 h-10 rounded-full border-2 border-[#2F4A2E]/30 text-[#1B2F1A] flex items-center justify-center hover:border-[#2F4A2E] transition-colors disabled:opacity-30">→</button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
