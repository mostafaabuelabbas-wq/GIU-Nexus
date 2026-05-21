import { useState, useEffect } from 'react'
import JobCard from '../components/JobCard'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
const TYPES    = [{ v:'', l:'All types' },{ v:'full-time', l:'Full-time' },{ v:'part-time', l:'Part-time' },{ v:'internship', l:'Internship' }]
const STATUSES = [{ v:'open', l:'Open' },{ v:'', l:'All statuses' },{ v:'closed', l:'Closed' }]
const EXP_LEVELS = [{ v:'', l:'All levels' },{ v:'entry', l:'Entry' },{ v:'mid', l:'Mid' },{ v:'senior', l:'Senior' }]
const WORK_MODES = [{ v:'', l:'All modes' },{ v:'remote', l:'Remote' },{ v:'hybrid', l:'Hybrid' },{ v:'onsite', l:'On-site' }]
const LIMIT = 9

const unwrap = (data) => Array.isArray(data) ? data : data?.jobs ?? data?.data ?? data?.results ?? []

export default function JobListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs]     = useState([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  const [filters, setFilters] = useState({
    keyword:        searchParams.get('keyword')        || '',
    location:       searchParams.get('location')       || '',
    type:           searchParams.get('type')           || '',
    status:         searchParams.get('status')         || 'open',
    experienceLevel: searchParams.get('experienceLevel') || '',
    workMode:        searchParams.get('workMode')        || '',
  })
  const [draft, setDraft] = useState(filters)

  const [retryKey, setRetryKey] = useState(0)

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
      .catch(err => {
        if (!active) return
        setError(err.response?.data?.message || 'Failed to load jobs.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [filters, page, retryKey])

  const applyFilters = (e) => {
    e.preventDefault()
    setFilters(draft); setPage(1)
    const sp = {}
    if (draft.keyword)         sp.keyword         = draft.keyword
    if (draft.location)        sp.location        = draft.location
    if (draft.type)            sp.type            = draft.type
    if (draft.status)          sp.status          = draft.status
    if (draft.experienceLevel) sp.experienceLevel = draft.experienceLevel
    if (draft.workMode)        sp.workMode        = draft.workMode
    setSearchParams(sp)
  }

  const clearFilters = () => {
    const blank = { keyword:'', location:'', type:'', status:'open', experienceLevel:'', workMode:'' }
    setDraft(blank); setFilters(blank); setPage(1)
    setSearchParams({})
  }

  const hasActiveFilters = filters.keyword || filters.location || filters.type || filters.experienceLevel || filters.workMode
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const inputCls = 'w-full bg-[#F1EAD9] border-0 rounded-xl px-4 py-2.5 text-[#161310] text-sm focus:outline-none focus:ring-2 focus:ring-[#EE5688]/20 placeholder-[#3B342B]/35 transition-all'

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      {/* Page header */}
      <div className="max-w-[1360px] w-full mx-auto px-10 pt-10 pb-6">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="font-['Space_Grotesk'] font-bold text-[48px] text-[#161310] leading-tight tracking-tight m-0">Open roles.</h1>
          <span className="font-['Cairo'] font-black text-[40px] text-[#3B342B]/25">وظائف</span>
        </div>
        <p className="text-[#3B342B] text-[17px] mt-2">Fresh listings from verified Egyptian companies.</p>
      </div>

      {/* Filter bar */}
      <div className="max-w-[1360px] w-full mx-auto px-10 mb-8">
        <form onSubmit={applyFilters}
          className="bg-white rounded-2xl p-4 flex flex-wrap gap-3 items-end border border-[#16131010] shadow-sm">
          <div className="flex-[2] min-w-[160px]">
            <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/50 mb-1.5">Keyword</label>
            <input type="text" value={draft.keyword} onChange={e => setDraft(p => ({...p, keyword: e.target.value}))}
              placeholder="React, Node.js, ML…" className={inputCls} />
          </div>
          <div className="flex-[1.5] min-w-[130px]">
            <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/50 mb-1.5">Location</label>
            <input type="text" value={draft.location} onChange={e => setDraft(p => ({...p, location: e.target.value}))}
              placeholder="Cairo, Remote…" className={inputCls} />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/50 mb-1.5">Type</label>
            <select value={draft.type} onChange={e => setDraft(p => ({...p, type: e.target.value}))} className={inputCls}>
              {TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/50 mb-1.5">Status</label>
            <select value={draft.status} onChange={e => setDraft(p => ({...p, status: e.target.value}))} className={inputCls}>
              {STATUSES.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/50 mb-1.5">Level</label>
            <select value={draft.experienceLevel} onChange={e => setDraft(p => ({...p, experienceLevel: e.target.value}))} className={inputCls}>
              {EXP_LEVELS.map(e => <option key={e.v} value={e.v}>{e.l}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/50 mb-1.5">Mode</label>
            <select value={draft.workMode} onChange={e => setDraft(p => ({...p, workMode: e.target.value}))} className={inputCls}>
              {WORK_MODES.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
          </div>
          <button type="submit"
            className="bg-[#161310] text-[#F1EAD9] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-black transition-colors flex-shrink-0">
            Search →
          </button>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters}
              className="text-sm text-[#3B342B]/50 hover:text-[#161310] transition-colors px-2 py-2.5 flex-shrink-0">
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 max-w-[1360px] w-full mx-auto px-10 pb-16">
        {!loading && !error && (
          <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/45 mb-5">
            {total} role{total !== 1 ? 's' : ''} found
          </p>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[20px] p-5 border border-[#16131010] animate-pulse">
                <div className="h-5 bg-[#F1EAD9] rounded-lg w-3/4 mb-2" />
                <div className="h-4 bg-[#F1EAD9] rounded-lg w-1/2 mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 bg-[#F1EAD9] rounded-full w-20" />
                  <div className="h-6 bg-[#F1EAD9] rounded-full w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40 mb-3">// something broke</p>
            <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">Couldn't load jobs.</h3>
            <p className="text-[#3B342B] mb-6">{error}</p>
            <button onClick={() => setRetryKey(k => k + 1)}
              className="bg-[#161310] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-black transition-colors">
              Try again →
            </button>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-20 max-w-sm mx-auto">
            <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40 mb-3">// no results</p>
            <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">No jobs found.</h3>
            <p className="text-[#3B342B] mb-6 leading-relaxed">Try adjusting your filters — new roles drop every morning at 6am.</p>
            <button onClick={clearFilters}
              className="bg-[#161310] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-black transition-colors">
              Clear filters →
            </button>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map(j => (
                <JobCard key={j._id} job={j} showSaveButton={true} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-10 h-10 rounded-full bg-white border border-[#16131010] flex items-center justify-center hover:bg-[#F1EAD9] transition-colors disabled:opacity-30">←</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${page === p ? 'bg-[#161310] text-[#F1EAD9]' : 'bg-white border border-[#16131010] text-[#161310] hover:bg-[#F1EAD9]'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-10 h-10 rounded-full bg-white border border-[#16131010] flex items-center justify-center hover:bg-[#F1EAD9] transition-colors disabled:opacity-30">→</button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
