const STATUS_MAP = {
  pending:     { bg: '#FEF3C7', text: '#B45309', label: '⏳ Pending' },
  shortlisted: { bg: '#DCFCE7', text: '#15803D', label: '⭐ Shortlisted' },
  rejected:    { bg: '#FEE2E2', text: '#B91C1C', label: '✕ Rejected' },
}

/** Coloured badge for the three application statuses the backend returns. */
export default function ApplicationStatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pending
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  )
}
