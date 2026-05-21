import { useState } from 'react'
import api from '../services/api'

/**
 * Bookmark toggle. Optimistically updates; reverts on error.
 * Disabled when jobStatus !== 'open' (backend returns 400 otherwise).
 */
export default function SaveJobButton({ jobId, initialSaved = false, jobStatus = 'open', render }) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (loading || jobStatus !== 'open') return
    const prev = saved
    setSaved(!saved)
    setLoading(true)
    try {
      const { data } = await api.post(`/jobs/${jobId}/save`)
      setSaved(data.saved ?? !prev)
    } catch {
      setSaved(prev)
    } finally {
      setLoading(false)
    }
  }

  if (typeof render === 'function') {
    return render({ saved, toggle: handleToggle, loading, disabled: loading || jobStatus !== 'open' })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading || jobStatus !== 'open'}
      title={saved ? 'Remove from saved' : 'Save job'}
      className={`p-2 rounded-xl transition-all hover:bg-[#16131008] disabled:opacity-40 text-lg leading-none ${
        saved ? 'text-[#EE5688]' : 'text-[#3B342B]/40 hover:text-[#161310]'
      }`}
    >
      {saved ? '♥' : '♡'}
    </button>
  )
}
