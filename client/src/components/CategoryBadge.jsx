const PALETTE = {
  Frontend:       { bg: '#DBEAFE', text: '#1D4ED8' },
  Backend:        { bg: '#DCFCE7', text: '#15803D' },
  'Data Science': { bg: '#FEF3C7', text: '#B45309' },
  DevOps:         { bg: '#F3E8FF', text: '#7E22CE' },
  Design:         { bg: '#FCE7F3', text: '#BE185D' },
  Mobile:         { bg: '#FFEDD5', text: '#C2410C' },
  Marketing:      { bg: '#FEF9C3', text: '#854D0E' },
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
