import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'

const BIO_MAX   = 500
const PALETTE   = ['#2F4A2E', '#EE5688', '#E96A3A', '#E5A93A']
const avatarColor = (name = '') => PALETTE[name.charCodeAt(0) % PALETTE.length]

export default function EditProfilePage() {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const fileRef   = useRef(null)

  const [form,        setForm]        = useState({ name: '', bio: '' })
  const [previewUrl,  setPreviewUrl]  = useState(null)
  const [file,        setFile]        = useState(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [email,       setEmail]       = useState('')
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [saved,       setSaved]       = useState(false)

  useEffect(() => {
    api.get('/profile')
      .then(({ data }) => {
        const u = data.user ?? data
        setForm({ name: u.name || '', bio: u.bio || '' })
        setPreviewUrl(u.profilePicture || null)
        setEmail(u.email || '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setRemovePhoto(false)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('bio',  form.bio)
      if (file)        fd.append('profilePicture', file)
      else if (removePhoto) fd.append('profilePicture', '')
      await api.patch('/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSaved(true)
      setTimeout(() => navigate('/profile'), 1400)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const initial = (form.name || user?.name || '?')[0].toUpperCase()

  const inputCls = 'w-full bg-[#F1EAD9] border border-[#16131012] rounded-xl px-4 py-3 text-[#161310] text-[15px] placeholder-[#3B342B]/35 focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 focus:bg-[#F7F1E3] transition-all'

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      {/* ── Paper header ── */}
      <div className="bg-[#F7F1E3] border-b border-[#16131010] relative overflow-hidden">
        <div className="absolute right-0 top-0 font-['Cairo'] font-black select-none pointer-events-none leading-none text-[#161310] opacity-[0.04]"
          style={{ fontSize: 'clamp(120px,16vw,220px)' }} aria-hidden="true">
          تعديل
        </div>
        <div className="max-w-4xl mx-auto px-6 py-10 relative z-10">
          <Link to="/profile"
            className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B]/45 hover:text-[#161310] transition-colors inline-flex items-center gap-1.5 mb-6 no-underline">
            ← Back to profile
          </Link>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-['Space_Grotesk'] font-bold text-[#161310] leading-tight tracking-tight m-0"
              style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
              Edit your profile.
            </h1>
            <span className="font-['Cairo'] font-black text-[#3B342B]/20"
              style={{ fontSize: 'clamp(24px,3.5vw,38px)' }}>
              تعديل الملف
            </span>
          </div>
          <p className="text-[#3B342B] text-[15px] mt-2">Update your name, photo and bio.</p>
        </div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-32"><Spinner size="lg" /></div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">

            {/* banners */}
            {saved && (
              <div className="p-4 bg-[#DCFCE7] border border-green-200 rounded-2xl text-green-800 font-semibold text-sm flex items-center gap-2">
                ✓ Saved! Redirecting to your profile…
              </div>
            )}
            {error && (
              <div className="p-4 bg-[#FEE2E2] border border-red-200 rounded-2xl text-red-700 text-sm">{error}</div>
            )}

            {/* ══════════════════════════════════════════════
                CARD 1 — Identity
            ══════════════════════════════════════════════ */}
            <div className="bg-[#EDE4D0] rounded-[32px] p-8 border border-[#16131012]">
              <div className="flex items-baseline gap-2 mb-6">
                <h2 className="font-['Space_Grotesk'] font-bold text-[22px] text-[#161310] m-0">Your identity</h2>
                <span className="font-['Cairo'] text-lg text-[#3B342B]/35">· هويتك</span>
              </div>

              <div className="flex items-start gap-6 flex-wrap">
                {/* avatar */}
                <div className="flex flex-col items-center gap-3 flex-shrink-0">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-['Space_Grotesk'] font-bold text-4xl overflow-hidden cursor-pointer transition-opacity hover:opacity-85"
                    style={{ background: previewUrl ? 'transparent' : avatarColor(form.name) }}
                    onClick={() => fileRef.current?.click()}
                    title="Click to change photo"
                  >
                    {previewUrl
                      ? <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                      : initial}
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="bg-[#F1EAD9] text-[#161310] font-semibold text-xs px-4 py-2 rounded-full hover:bg-[#E9E0CB] transition-colors border border-[#16131015]">
                      Change photo
                    </button>
                    {previewUrl && (
                      <button type="button"
                        onClick={() => { setPreviewUrl(null); setFile(null); setRemovePhoto(true) }}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors px-2 py-2">
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wide text-[#3B342B]/35 text-center leading-relaxed">
                    JPG · PNG · WebP<br />max 5 MB
                  </p>
                  <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                </div>

                {/* fields */}
                <div className="flex-1 min-w-[220px] flex flex-col gap-4">
                  <div>
                    <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">
                      Full name
                    </label>
                    <input type="text" value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      required placeholder="Your full name" className={inputCls} />
                  </div>

                  <div>
                    <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">
                      Email address
                    </label>
                    <div className="w-full bg-[#F1EAD9] border border-[#16131010] rounded-xl px-4 py-3 text-[#3B342B] text-[15px] flex items-center justify-between">
                      <span>{email}</span>
                      <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wide text-[#3B342B]/35 bg-[#E9E0CB] px-2 py-1 rounded-full flex-shrink-0">
                        Cannot change
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider bg-[#F1EAD9] text-[#3B342B] px-3 py-1 rounded-full border border-[#16131015]">
                      {user?.role === 'jobSeeker' ? 'Student' : user?.role ?? 'Student'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════
                CARD 2 — Bio
            ══════════════════════════════════════════════ */}
            <div className="bg-[#EDE4D0] rounded-[32px] p-8 border border-[#16131012]">
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <h2 className="font-['Space_Grotesk'] font-bold text-[22px] text-[#161310] m-0">Your bio</h2>
                    <span className="font-['Cairo'] text-lg text-[#3B342B]/35">· نبذتك</span>
                  </div>
                  <p className="text-[#3B342B] text-sm">Used by AI to extract your skills and match you to jobs. Write naturally.</p>
                </div>
                <span className="font-['JetBrains_Mono'] text-xs text-[#3B342B]/35 flex-shrink-0 self-start mt-1">
                  {form.bio.length} / {BIO_MAX}
                </span>
              </div>

              <textarea
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value.slice(0, BIO_MAX) }))}
                rows={6}
                placeholder="Tell recruiters about your skills, projects, side work, and what you're looking for. The more detail, the better your AI matches."
                className={`${inputCls} resize-none`}
              />

              {/* AI tip */}
              <div className="mt-4 py-4 px-5 border border-dashed border-[#16131015] rounded-2xl flex items-start gap-3">
                <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#EE5688] bg-[#EE5688]/10 px-2 py-1 rounded flex-shrink-0 mt-0.5">AI</span>
                <p className="text-[#3B342B] text-sm leading-relaxed m-0">
                  After saving, go to your profile and hit{' '}
                  <strong className="text-[#161310]">Extract Skills from Bio</strong>
                  {' '}— we'll auto-detect your skills and rank every open role by how well it fits you.
                </p>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex gap-3 pb-4">
              <button type="submit" disabled={saving || saved}
                className="bg-[#2F4A2E] text-[#F1EAD9] font-['Space_Grotesk'] font-bold px-8 py-3.5 rounded-full flex items-center gap-2 hover:bg-[#243b23] transition-colors disabled:opacity-60">
                {saving ? <><Spinner white size="sm" />Saving…</> : 'Save changes →'}
              </button>
              <Link to="/profile"
                className="bg-[#E9E0CB] text-[#161310] font-semibold px-6 py-3.5 rounded-full hover:bg-[#D8CEBA] transition-colors border border-[#16131015] no-underline">
                Cancel
              </Link>
            </div>

          </form>
        )}
      </main>

      <Footer />
    </div>
  )
}
