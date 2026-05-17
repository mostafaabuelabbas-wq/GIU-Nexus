// Matches the six labels the backend assigns via HuggingFace zero-shot classification
const PALETTE = {
  Frontend:           { bg: '#DBEAFE', text: '#1D4ED8' },
  Backend:            { bg: '#DCFCE7', text: '#15803D' },
  'AI/ML':            { bg: '#F3E8FF', text: '#7E22CE' },
  DevOps:             { bg: '#CCFBF1', text: '#0F766E' },
  'Data Engineering': { bg: '#FEF3C7', text: '#B45309' },
  Other:              { bg: '#F1F5F9', text: '#475569' },
}

export default function CategoryBadge({ category, size = 'md' }) {
  if (!category) return null
  const style = PALETTE[category] ?? { bg: '#F1F5F9', text: '#475569' }
  const cls = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${cls}`}
      style={{ background: style.bg, color: style.text }}
    >
      {category}
    </span>
  )
}
