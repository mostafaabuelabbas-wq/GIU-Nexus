import { getCategoryColor } from '../utils/categoryColors'

/**
 * Coloured pill badge for an AI-assigned job category.
 * size: 'sm' | 'md' (default)
 */
export default function CategoryBadge({ category, size = 'md' }) {
  const c = getCategoryColor(category)
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${pad} rounded-full font-['JetBrains_Mono'] font-medium tracking-wide`}
      style={{ background: c.bg, color: c.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: c.dot }}
      />
      {category ?? 'Other'}
    </span>
  )
}
