import { useEffect } from 'react'

/**
 * Reusable confirmation dialog.
 * Props: { isOpen, title, message, onConfirm, onCancel, confirmLabel, loading, children }
 */
export default function Modal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', loading = false, children }) {
  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#161310]/40 backdrop-blur-[4px]"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-[28px] w-full max-w-md shadow-[0_32px_64px_-16px_rgba(0,0,0,0.25)] flex flex-col">

        {/* Header */}
        <div className="px-7 pt-7 pb-4 border-b border-[#16131010]">
          <h2
            id="modal-title"
            className="font-['Space_Grotesk'] font-bold text-[20px] text-[#161310] leading-snug m-0"
          >
            {title}
          </h2>
          {message && (
            <p className="text-[#3B342B] text-sm mt-2 leading-relaxed">{message}</p>
          )}
        </div>

        {/* Body (optional children — e.g. cover-letter textarea) */}
        {children && (
          <div className="px-7 py-5">
            {children}
          </div>
        )}

        {/* Footer actions */}
        <div className="px-7 pb-7 pt-4 flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="bg-[#F1EAD9] text-[#161310] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#E9E0CB] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-[#EE5688] text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-[#D94478] transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
