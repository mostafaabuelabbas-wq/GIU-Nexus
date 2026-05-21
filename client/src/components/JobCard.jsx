import { Link } from 'react-router-dom'
import SaveJobButton from './SaveJobButton'

const TYPE_LABEL = { 'full-time': 'Full-time', 'part-time': 'Part-time', 'internship': 'Internship' }
const MODE_LABEL = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' }

// Avatar tile palette — saturated, blocky colours like the reference
const AVATAR_PALETTE = ['#E5A93A', '#EE5688', '#7C4DBE', '#E96A3A', '#2F4A2E', '#2A6FDB', '#4A7873']

// Category badge palette — soft pastel background + bold dot
const CATEGORY_STYLES = {
  Frontend:           { bg: '#DCEDDA', dot: '#2F4A2E', text: '#2F4A2E' },
  Backend:            { bg: '#DCE8F5', dot: '#2A6FDB', text: '#1E4A8A' },
  'AI/ML':            { bg: '#E8DAF5', dot: '#7C4DBE', text: '#5A2D9B' },
  DevOps:             { bg: '#DCFCE7', dot: '#16A34A', text: '#15803D' },
  'Data Engineering': { bg: '#FDE9DC', dot: '#E96A3A', text: '#7A3E1C' },
  Other:              { bg: '#F1EAD9', dot: '#3B342B', text: '#3B342B' },
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

// ── Avatar tile ────────────────────────────────────────────────────
function CompanyTile({ name = '' }) {
  const letters = name.slice(0, 2)
  return (
    <div
      className="w-12 h-12 rounded-[10px] flex items-center justify-center text-white font-['Space_Grotesk'] font-bold text-lg flex-shrink-0"
      style={{ background: colorFor(name) }}
    >
      <span className="lowercase first-letter:uppercase">{letters}</span>
    </div>
  )
}

// ── Match pill (big yellow) ────────────────────────────────────────
function ScorePill({ score }) {
  return (
    <span className="inline-flex items-baseline gap-1 bg-[#E5A93A] text-[#161310] font-['Space_Grotesk'] font-bold px-3.5 py-1.5 rounded-full">
      <span className="text-[15px] leading-none">{score}</span>
      <span className="text-[9px] leading-none">%</span>
      <span className="text-[10px] leading-none font-['JetBrains_Mono'] uppercase tracking-[0.12em] ml-0.5">MATCH</span>
    </span>
  )
}

// ── Bookmark button (outline / filled pink) ────────────────────────
function BookmarkBtn({ saved, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? 'Unsave job' : 'Save job'}
      className="text-[#161310] hover:scale-110 transition-transform bg-transparent border-0 cursor-pointer p-1"
    >
      <svg width="20" height="20" viewBox="0 0 24 24"
        fill={saved ? '#EE5688' : 'none'}
        stroke={saved ? '#EE5688' : '#161310'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  )
}

// ── Category badge ─────────────────────────────────────────────────
function CatBadge({ category }) {
  if (!category || category === 'Classifying...') return null
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.Other
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-['JetBrains_Mono'] font-bold px-3 py-1 text-[10px] uppercase tracking-[0.12em]"
      style={{ background: style.bg, color: style.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: style.dot }} />
      {category}
    </span>
  )
}

// ── Main card ──────────────────────────────────────────────────────
export default function JobCard({ job, score, showSaveButton, variant = 'grid' }) {
  if (!job) return null

  const matchPct = typeof score === 'number' ? Math.round(score * 100) : null
  const showSave = showSaveButton !== false
  const meta     = [
    job.company,
    job.location,
    TYPE_LABEL[job.type] ?? job.type,
    MODE_LABEL[job.workMode] ?? job.workMode,
  ].filter(Boolean)
  const snippet  = job.description
    ? job.description.slice(0, 110).trimEnd() + (job.description.length > 110 ? '…' : '')
    : null
  const posted   = timeAgo(job.createdAt)

  return (
    <article className="bg-[#F5EFE0] rounded-[18px] border border-[#16131035] p-5 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(22,19,16,0.35)] transition-all duration-200 ease-out relative overflow-hidden">

      {/* ── Top: avatar + match + bookmark ── */}
      <header className="flex items-start justify-between gap-3">
        <CompanyTile name={job.company} />
        <div className="flex items-center gap-2.5">
          {matchPct !== null && <ScorePill score={matchPct} />}
          {showSave && (
            <SaveJobButton
              jobId={job._id}
              initialSaved={job.saved}
              jobStatus={job.status}
              render={({ saved, toggle }) => <BookmarkBtn saved={saved} onClick={toggle} />}
            />
          )}
        </div>
      </header>

      {/* ── Body: title + meta + snippet ── */}
      <div className="flex flex-col gap-1.5">
        <Link
          to={`/jobs/${job._id}`}
          className="font-['Space_Grotesk'] font-bold text-[19px] text-[#2F4A2E] leading-tight hover:underline line-clamp-2 no-underline"
        >
          {job.title}
        </Link>

        <p className="text-[13px] text-[#2F4A2E] leading-relaxed">
          {meta.map((item, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-1.5 text-[#2F4A2E]/35">·</span>}
              <span className={i === 0 ? 'font-semibold' : 'text-[#2F4A2E]/70'}>{item}</span>
            </span>
          ))}
        </p>

        {variant === 'grid' && snippet && (
          <p className="text-[#2F4A2E]/75 text-[13px] leading-relaxed line-clamp-2 mt-1">
            {snippet}
          </p>
        )}
      </div>

      {/* ── Footer: category + posted ── */}
      <footer className="flex items-center justify-between gap-2 pt-3 mt-auto border-t border-dashed border-[#16131020]">
        <CatBadge category={job.category} />
        {posted && (
          <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.12em] text-[#3B342B]/45">
            // {posted}
          </span>
        )}
      </footer>

      {/* ── Closed overlay ── */}
      {job.status !== 'open' && (
        <div className="absolute inset-0 rounded-[18px] bg-[#161310]/5 flex items-center justify-center pointer-events-none">
          <span className="bg-[#161310] text-[#F1EAD9] text-xs font-['JetBrains_Mono'] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full">
            Closed
          </span>
        </div>
      )}
    </article>
  )
}
