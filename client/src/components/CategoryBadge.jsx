import { getCategoryColor } from '../utils/categoryColors'

export default function CategoryBadge({ category, size = 'sm' }) {
  if (!category) return null
  const { bg, text, dot } = getCategoryColor(category)
  const padding = size === 'lg' ? 'px-3 py-1 text-[12px]' : 'px-2.5 py-0.5 text-[11px]'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-['JetBrains_Mono'] font-medium ${padding}`}
      style={{ background: bg, color: text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
      {category}
    </span>
  )
}
