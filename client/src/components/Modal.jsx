import { useEffect } from 'react'

/**
 * Reusable confirmation / form dialog.
 * Pass `children` for custom body content (overrides `message`).
 */
export default function Modal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
  children,
}) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161310]/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-[#F7F1E3] rounded-[28px] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-['Space_Grotesk'] font-bold text-[20px] text-[#161310] mb-2">
          {title}
        </h3>

        {message && (
          <p className="text-sm text-[#3B342B] mb-5 leading-relaxed">{message}</p>
        )}

        {children && <div className="mb-2">{children}</div>}

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full text-sm font-semibold border border-[#16131020] text-[#161310] hover:bg-[#16131008] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 rounded-full text-sm font-bold text-white transition-colors disabled:opacity-60 ${
              danger
                ? 'bg-[#DC2626] hover:bg-red-700'
                : 'bg-[#161310] hover:bg-black'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
