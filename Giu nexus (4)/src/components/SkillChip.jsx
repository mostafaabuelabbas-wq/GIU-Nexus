/** Small rounded tag for a single skill string. */
export default function SkillChip({ skill, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#FDE9DC] text-[#E96A3A] text-sm font-medium px-3 py-1.5 rounded-full border border-[#E96A3A]/20 whitespace-nowrap">
      {skill}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(skill)}
          className="text-[#E96A3A]/50 hover:text-[#E96A3A] transition-colors leading-none text-base"
          aria-label={`Remove ${skill}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
