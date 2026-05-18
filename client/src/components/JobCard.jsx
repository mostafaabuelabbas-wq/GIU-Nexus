import { Link } from 'react-router-dom'
import { getCategoryColor } from '../utils/categoryColors'
import SaveJobButton from './SaveJobButton'

const TYPE_LABEL = { 'full-time': 'Full-time', 'part-time': 'Part-time', 'internship': 'Internship' }
const MODE_LABEL = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' }
const PALETTE = ['#2F4A2E', '#EE5688', '#E96A3A', '#E5A93A', '#5A3A6B', '#2A6FDB', '#4A7873']

const colorFor = (str = '') => {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

const fmtSalary = (n) => (n == null ? null : `EGP ${Number(n).toLocaleString()}`)


export default function JobCard({ job, score, showSaveButton }) {
  if (!job) return null
  const initial = (job.company || '?')[0].toUpperCase()
  const matchPct = typeof score === 'number' ? Math.round(score * 100) : null
  const showSave = showSaveButton !== false && matchPct === null

  return (
    <article className="bg-white rounded-[28px] p-5 flex flex-col gap-3 border border-[#16131010] hover:-translate-y-0.5 transition-transform group relative overflow-hidden">

      {/* Match score chip */}
      {matchPct !== null && (
        <span className="absolute top-4 right-4 bg-[#DCFCE7] text-[#15803D] text-xs font-['JetBrains_Mono'] font-semibold px-2.5 py-1 rounded-full">
          {matchPct}% match
        </span>
      )}

      {/* Header row */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-['Space_Grotesk'] font-bold text-base flex-shrink-0"
          style={{ background: colorFor(job.company) }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/jobs/${job._id}`}
            className="font-['Space_Grotesk'] font-bold text-[15px] text-[#161310] leading-tight group-hover:text-[#EE5688] transition-colors line-clamp-2 no-underline"
          >
            {job.title}
          </Link>
          <p className="text-[#3B342B] text-sm mt-0.5">{job.company}</p>
        </div>
        {showSave && (
          <SaveJobButton jobId={job._id} initialSaved={job.saved} jobStatus={job.status} />
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2">
        {job.category && (() => { const { bg, text, dot } = getCategoryColor(job.category); return (
          <span className="inline-flex items-center gap-1.5 rounded-full font-['JetBrains_Mono'] font-medium px-2.5 py-0.5 text-[11px]" style={{ background: bg, color: text }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />{job.category}
          </span>
        )})()}
        <span className="text-[#3B342B]/40 text-xs">·</span>
        <span className="text-[#3B342B] text-xs">{job.location}</span>
        {job.type && (
          <>
            <span className="text-[#3B342B]/40 text-xs">·</span>
            <span className="text-[#3B342B] text-xs">{TYPE_LABEL[job.type] ?? job.type}</span>
          </>
        )}
        {job.workMode && (
          <>
            <span className="text-[#3B342B]/40 text-xs">·</span>
            <span className="text-[#3B342B] text-xs">{MODE_LABEL[job.workMode] ?? job.workMode}</span>
          </>
        )}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-2 mt-auto border-t border-[#16131008]">
        <span className="text-sm font-semibold text-[#161310]">
          {fmtSalary(job.salary) ?? (
            <span className="text-[#3B342B]/40 font-normal text-sm">Salary on request</span>
          )}
        </span>
        <Link
          to={`/jobs/${job._id}`}
          className="text-xs font-bold text-[#161310] bg-[#F1EAD9] px-3 py-1.5 rounded-full hover:bg-[#E9E0CB] transition-colors no-underline inline-flex items-center gap-1"
        >
          View role <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Closed overlay */}
      {job.status !== 'open' && (
        <div className="absolute inset-0 rounded-[28px] bg-[#161310]/5 flex items-center justify-center pointer-events-none">
          <span className="bg-[#161310] text-[#F1EAD9] text-xs font-['JetBrains_Mono'] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full">
            Closed
          </span>
        </div>
      )}
    </article>
  )
}
