import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner'

const BIO_MAX = 500
const PALETTE = ['#2F4A2E', '#EE5688', '#E96A3A', '#E5A93A']
const avatarColor = (name = '') => PALETTE[name.charCodeAt(0) % PALETTE.length]

export default function EditProfilePage() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [form, setForm] = useState({ name: '', bio: '' })
  const [previewUrl, setPreviewUrl] = useState(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/profile')
      .then(({ data }) => {
        const user = data.user || data
        setForm({ name: user.name || '', bio: user.bio || '' })
        setPreviewUrl(user.profilePicture || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('bio', form.bio)
      if (file) fd.append('profilePicture', file)
      await api.patch('/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSaved(true)
      setTimeout(() => navigate('/profile'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const initial = (form.name || '?')[0].toUpperCase()

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12">
        <Link to="/profile" className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/50 hover:text-[#161310] transition-colors inline-flex items-center gap-1.5 mb-6 no-underline">
          ← Back to profile
        </Link>
        <h1 className="font-['Space_Grotesk'] font-bold text-[32px] text-[#161310] leading-tight mb-8">Edit your profile.</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-white rounded-[32px] p-8 border border-[#16131010]">
            {saved && (
              <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-2xl text-green-800 font-semibold text-sm flex items-center gap-2">
                ✓ Saved! Redirecting to your profile…
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-[#FEE2E2] border border-red-200 rounded-2xl text-red-700 text-sm">{error}</div>
            )}

            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              {/* Avatar upload */}
              <div>
                <label className="block text-sm font-semibold text-[#161310] mb-3">Profile picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-['Space_Grotesk'] font-bold text-3xl flex-shrink-0 overflow-hidden"
                    style={{ background: previewUrl ? 'transparent' : avatarColor(form.name) }}>
                    {previewUrl
                      ? <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                      : initial}
                  </div>
                  <div>
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="bg-[#F1EAD9] text-[#161310] font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-[#E9E0CB] transition-colors border border-[#16131015]">
                      Upload photo
                    </button>
                    <p className="text-xs text-[#3B342B]/50 mt-2">JPG, PNG or WebP · max 5 MB</p>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-[#161310] mb-1.5">Full name</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                  className="w-full bg-[#F1EAD9] border border-[#16131010] rounded-xl px-4 py-3 text-[#161310] text-[15px] focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 focus:bg-white transition-all" />
              </div>

              {/* Bio */}
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="text-sm font-semibold text-[#161310]">Bio</label>
                  <span className="font-['JetBrains_Mono'] text-xs text-[#3B342B]/35">{form.bio.length}/{BIO_MAX}</span>
                </div>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value.slice(0, BIO_MAX) }))}
                  rows={5}
                  placeholder="Tell recruiters about your skills, projects, and what you're looking for…"
                  className="w-full bg-[#F1EAD9] border border-[#16131010] rounded-xl px-4 py-3 text-[#161310] text-[15px] focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 focus:bg-white transition-all resize-none"
                />
                <p className="text-xs text-[#3B342B]/50 mt-1.5">
                  Your bio is used by AI to extract skills and match you to jobs.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || saved}
                  className="bg-[#161310] text-[#F1EAD9] font-bold px-8 py-3.5 rounded-full flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-60">
                  {saving ? <><Spinner white size="sm" />Saving…</> : 'Save changes →'}
                </button>
                <Link to="/profile"
                  className="bg-[#F1EAD9] text-[#161310] font-semibold px-6 py-3.5 rounded-full hover:bg-[#E9E0CB] transition-colors border border-[#16131015] no-underline">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
