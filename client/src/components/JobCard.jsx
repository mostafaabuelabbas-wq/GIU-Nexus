import { Link } from 'react-router-dom'
import { CATEGORY_COLORS } from '../utils/categoryColors'

/**
 * Live job card.
 * @param {object} job   — MongoDB job document
 * @param {number} [score] — cosine similarity 0-1 (only for recommended jobs)
 */
export default function JobCard({ job, score }) {
  const cat = CATEGORY_COLORS[job?.category] ?? CATEGORY_COLORS['Other']
  // Convert 0-1 similarity to a readable percentage; hide if zero or absent
  const matchPct = typeof score === 'number' && score > 0
    ? Math.round(score * 100)
    : null

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="block no-underline group h-full"
    >
      <article className="
        bg-white rounded-[28px] p-5 flex flex-col gap-3 h-full
        border border-[#E9E0CB]
        hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(22,19,16,0.18)]
        transition-all duration-200 cursor-pointer
      ">
        {/* ── Top row: category badge + optional match score ── */}
        <div className="flex justify-between items-center gap-2">
          <span
            className="font-['JetBrains_Mono'] text-[11px] font-semibold px-2.5 py-1 rounded-full tracking-[0.06em] leading-none"
            style={{ background: cat.bg, color: cat.text }}
          >
            {job.category ?? 'Other'}
          </span>

          {matchPct !== null && (
            <span className="font-['JetBrains_Mono'] text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E5A93A] text-[#161310] whitespace-nowrap flex-shrink-0">
              {matchPct}% match
            </span>
          )}
        </div>

        {/* ── Title ── */}
        <h3 className="
          font-['Space_Grotesk'] font-bold text-[17px] leading-[1.2] tracking-[-0.02em]
          text-[#161310] m-0
          group-hover:text-[#EE5688] transition-colors duration-150
        ">
          {job.title}
        </h3>

        {/* ── Company ── */}
        <p className="text-[14px] text-[#3B342B] font-medium m-0 leading-none">
          {job.company}
        </p>

        {/* ── Meta chips ── */}
        <div className="flex gap-1.5 flex-wrap mt-auto pt-1">
          {job.location && (
            <span className="font-['JetBrains_Mono'] text-[12px] bg-[#F1EAD9] text-[#3B342B] rounded-full px-2.5 py-1 whitespace-nowrap">
              📍 {job.location}
            </span>
          )}
          {job.type && (
            <span className="font-['JetBrains_Mono'] text-[12px] bg-[#F1EAD9] text-[#3B342B] rounded-full px-2.5 py-1 whitespace-nowrap">
              {/* non-breaking hyphen so "full‑time" never wraps mid-word */}
              {job.type.replace(/-/g, '‑')}
            </span>
          )}
          {job.workMode && job.workMode !== 'onsite' && (
            <span className="font-['JetBrains_Mono'] text-[12px] bg-[#F1EAD9] text-[#3B342B] rounded-full px-2.5 py-1 whitespace-nowrap">
              {job.workMode}
            </span>
          )}
        </div>
      </article>
    </Link>
  )
}
