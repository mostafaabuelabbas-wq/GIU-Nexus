import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const TYPE_LABEL = { 'full-time': 'Full-time', 'part-time': 'Part-time', 'internship': 'Internship' }
const MODE_LABEL = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' }

// ── Company avatar palette ─────────────────────────────────────────
const AVATAR_PALETTE = ['#E5A93A', '#EE5688', '#7C4DBE', '#E96A3A', '#2F4A2E', '#2A6FDB', '#4A7873']

// ── Category badge styles — outlined pill ─────────────────────────
const CATEGORY_STYLES = {
  'Frontend':           { bg: '#DCEDDA', border: '#2F4A2E40', dot: '#2F4A2E', text: '#2F4A2E' },
  'Backend':            { bg: '#DCE8F5', border: '#2A6FDB40', dot: '#2A6FDB', text: '#1E4A8A' },
  'AI/ML':              { bg: '#E8DAF5', border: '#7C4DBE40', dot: '#7C4DBE', text: '#5A2D9B' },
  'DevOps':             { bg: '#DCFCE7', border: '#16A34A40', dot: '#16A34A', text: '#15803D' },
  'Data Engineering':   { bg: '#FDE9DC', border: '#E96A3A40', dot: '#E96A3A', text: '#7A3E1C' },
  'Other':              { bg: '#F1EAD9', border: '#3B342B30', dot: '#3B342B', text: '#3B342B' },
}

const colorFor = (s = '') => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length]
}

const timeAgo = (date) => {
  if (!date) return null
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800)  return `${Math.floor(diff / 86400)}d ago`
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`
  return `${Math.floor(diff / 2592000)}mo ago`
}

// ── Company avatar tile ────────────────────────────────────────────
function CompanyTile({ name = '' }) {
  const letters = name.slice(0, 2)
  return (
    <div
      className="w-14 h-14 rounded-[14px] flex items-center justify-center text-white font-['Space_Grotesk'] font-bold text-[18px] flex-shrink-0 shadow-sm"
      style={{ background: colorFor(name) }}
    >
      {letters}
    </div>
  )
}

// ── Match score pill ───────────────────────────────────────────────
function ScorePill({ score }) {
  return (
    <span className="inline-flex items-baseline gap-0.5 bg-[#E5A93A] text-[#161310] font-['Space_Grotesk'] font-bold px-3 py-1.5 rounded-full flex-shrink-0">
      <span className="text-[14px] leading-none">{score}</span>
      <span className="text-[9px] leading-none">%</span>
      <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-[0.12em] ml-0.5 leading-none">match</span>
    </span>
  )
}

// ── Bookmark SVG button ────────────────────────────────────────────
function BookmarkBtn({ saved, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={saved ? 'Unsave job' : 'Save job'}
      className="p-1 hover:scale-110 transition-transform disabled:opacity-40 bg-transparent border-0 cursor-pointer flex-shrink-0"
    >
      <svg width="20" height="20" viewBox="0 0 24 24"
        fill={saved ? '#EE5688' : 'none'}
        stroke={saved ? '#EE5688' : '#2F4A2E'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  )
}

// ── Category badge — outlined pill ────────────────────────────────
function CatBadge({ category }) {
  if (!category || category === 'Classifying...') return null
  const s = CATEGORY_STYLES[category] || CATEGORY_STYLES['Other']
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-['JetBrains_Mono'] font-bold px-3 py-1 text-[10px] uppercase tracking-[0.12em] border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {category}
    </span>
  )
}

// ── Internal save hook (replaces SaveJobButton dependency) ─────────
function useSave(jobId, initialSaved, jobStatus) {
  const [saved, setSaved] = useState(initialSaved ?? false)
  const [loading, setLoading] = useState(false)

  const toggle = async (e) => {
    e?.stopPropagation()
    if (loading || jobStatus !== 'open') return
    const prev = saved
    setSaved(!prev)
    setLoading(true)
    try {
      const { data } = await api.post(`/jobs/${jobId}/save`)
      setSaved(data.saved ?? !prev)
    } catch {
      setSaved(prev)
    } finally {
      setLoading(false)
    }
  }

  return { saved, toggle, loading }
}

// ── Main JobCard ───────────────────────────────────────────────────
export default function JobCard({ job, score, showSaveButton, variant = 'grid' }) {
  const navigate = useNavigate()
  const { saved, toggle, loading } = useSave(job?._id, job?.saved, job?.status)

  if (!job) return null
  const matchPct = typeof score === 'number' ? Math.round(score * 100) : null
  const showSave = showSaveButton !== false

  const meta = [
    job.company,
    job.location,
    TYPE_LABEL[job.type] ?? job.type,
    MODE_LABEL[job.workMode] ?? job.workMode,
  ].filter(Boolean)

  const snippet = job.description
    ? job.description.slice(0, 110).trimEnd() + (job.description.length > 110 ? '…' : '')
    : null

  const posted = timeAgo(job.createdAt)

  return (
    <article
      onClick={() => navigate(`/jobs/${job._id}`)}
      className="bg-[#EEE7D3] rounded-[22px] border-[1.5px] border-[#2F4A2E] p-5 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(47,74,46,0.35)] transition-all duration-200 ease-out relative overflow-hidden cursor-pointer"
    >

      {/* ── Top row: avatar + match + bookmark ── */}
      <header className="flex items-start justify-between gap-3">
        <CompanyTile name={job.company} />
        <div className="flex items-center gap-2">
          {matchPct !== null && <ScorePill score={matchPct} />}
          {showSave && (
            <BookmarkBtn
              saved={saved}
              onClick={toggle}
              disabled={loading || job.status !== 'open'}
            />
          )}
        </div>
      </header>

      {/* ── Body: title + meta + snippet ── */}
      <div className="flex flex-col gap-1.5">
        <span className="font-['Space_Grotesk'] font-bold text-[20px] text-[#2F4A2E] leading-[1.15] line-clamp-2">
          {job.title}
        </span>

        <p className="text-[13px] text-[#2F4A2E] leading-relaxed">
          {meta.map((item, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-1.5 opacity-30">·</span>}
              <span className={i === 0 ? 'font-semibold' : 'opacity-60'}>{item}</span>
            </span>
          ))}
        </p>

        {variant === 'grid' && snippet && (
          <p className="text-[#2F4A2E]/60 text-[13px] leading-relaxed line-clamp-2 mt-0.5">
            {snippet}
          </p>
        )}
      </div>

      {/* ── Footer: category badge + timestamp ── */}
      <footer className="flex items-center justify-between gap-2 pt-3 mt-auto border-t border-dashed border-[#2F4A2E]/20">
        <CatBadge category={job.category} />
        {posted && (
          <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.12em] text-[#2F4A2E]/40">
            // {posted}
          </span>
        )}
        {!posted && job.salary && (
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#E96A3A] font-semibold">
            EGP {Number(job.salary).toLocaleString()}
          </span>
        )}
      </footer>

      {/* ── Closed overlay ── */}
      {job.status !== 'open' && (
        <div className="absolute inset-0 rounded-[22px] bg-[#2F4A2E]/5 flex items-center justify-center pointer-events-none">
          <span className="bg-[#2F4A2E] text-[#F1EAD9] text-xs font-['JetBrains_Mono'] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full">
            Closed
          </span>
        </div>
      )}
    </article>
  )
}

/** Skeleton loading card */
export function JobCardSkeleton() {
  return (
    <article className="bg-[#EEE7D3] rounded-[22px] border-[1.5px] border-[#2F4A2E]/20 p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-14 h-14 bg-[#2F4A2E]/10 rounded-[14px]" />
        <div className="w-8 h-8 bg-[#2F4A2E]/10 rounded-lg" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-5 bg-[#2F4A2E]/10 rounded-lg w-3/4" />
        <div className="h-4 bg-[#2F4A2E]/08 rounded-lg w-1/2" />
        <div className="h-3 bg-[#2F4A2E]/08 rounded-lg w-full mt-1" />
        <div className="h-3 bg-[#2F4A2E]/08 rounded-lg w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-dashed border-[#2F4A2E]/15">
        <div className="h-6 bg-[#2F4A2E]/10 rounded-full w-24" />
        <div className="h-3 bg-[#2F4A2E]/08 rounded w-16" />
      </div>
    </article>
  )
}
