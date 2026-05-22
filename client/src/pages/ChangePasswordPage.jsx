import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const [form,    setForm]    = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [showPw,      setShowPw]      = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success,     setSuccess]     = useState(false)

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
    setFieldErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const fe = {}
    if (!form.currentPassword)                         fe.currentPassword = 'Required.'
    if (form.newPassword.length < 8)                   fe.newPassword     = 'Must be at least 8 characters.'
    if (form.newPassword !== form.confirm)             fe.confirm         = 'Passwords do not match.'
    if (Object.keys(fe).length) { setFieldErrors(fe); return }
    setLoading(true)
    try {
      await api.patch('/profile/change-password', {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      })
      setSuccess(true)
      setTimeout(() => navigate('/profile'), 2000)
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Current password is incorrect.'
          : err.response?.data?.message || 'Failed to change password.'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-[#F1EAD9] border border-[#16131012] rounded-xl px-4 py-3 text-[#161310] text-[15px] focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 focus:bg-[#F7F1E3] transition-all'

  const fields = [
    { name: 'currentPassword', label: 'Current password',    ph: '••••••••',         showToggle: true, showForgot: true },
    { name: 'newPassword',     label: 'New password',        ph: 'Min. 8 characters' },
    { name: 'confirm',         label: 'Confirm new password', ph: '••••••••' },
  ]

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      {/* ── Paper header ── */}
      <div className="bg-[#F7F1E3] border-b border-[#16131010] relative overflow-hidden">
        <div className="absolute right-0 top-0 font-['Cairo'] font-black select-none pointer-events-none leading-none text-[#161310] opacity-[0.04]"
          style={{ fontSize: 'clamp(120px,16vw,220px)' }} aria-hidden="true">
          كلمة السر
        </div>
        <div className="max-w-[600px] mx-auto px-6 py-10 relative z-10">
          <Link to="/profile"
            className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B]/45 hover:text-[#161310] transition-colors inline-flex items-center gap-1.5 mb-6 no-underline">
            ← Back to profile
          </Link>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-['Space_Grotesk'] font-bold text-[#161310] leading-tight tracking-tight m-0"
              style={{ fontSize: 'clamp(26px,4vw,40px)' }}>
              Change your password.
            </h1>
            <span className="font-['Cairo'] font-black text-[#3B342B]/20" style={{ fontSize: 'clamp(22px,3vw,34px)' }}>
              كلمة السر
            </span>
          </div>
          <p className="text-[#3B342B] text-[15px] mt-2">Choose a strong password you haven't used before.</p>
        </div>
      </div>

      <main className="flex-1 max-w-[600px] w-full mx-auto px-6 py-10">

        {/* ── Card ── */}
        <div className="bg-[#EDE4D0] rounded-[28px] p-8 border border-[#16131012]">

          {success && (
            <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-2xl text-green-800 font-semibold text-sm flex items-center gap-2">
              ✓ Password updated! Redirecting to your profile…
            </div>
          )}

          {error && (
            <div className="mb-5 p-4 bg-[#FEE2E2] border border-red-200 rounded-2xl text-red-700 text-sm flex items-center justify-between gap-3 flex-wrap">
              <span>{error}</span>
              {error.includes('incorrect') && (
                <Link to="/forgot-password"
                  className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider font-bold text-red-800 hover:underline no-underline whitespace-nowrap">
                  Forgot it? →
                </Link>
              )}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            {fields.map(f => (
              <div key={f.name}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50">
                    {f.label}
                  </label>
                  {f.showForgot && (
                    <Link to="/forgot-password"
                      className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.1em] text-[#EE5688] hover:underline no-underline">
                      Forgot it?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    name={f.name}
                    value={form[f.name]}
                    onChange={onChange}
                    placeholder={f.ph}
                    required
                    className={`${inputCls} ${f.showToggle ? 'pr-20' : ''} ${fieldErrors[f.name] ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : ''}`}
                  />
                  {f.showToggle && (
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/45 hover:text-[#161310] transition-colors px-2 py-1 bg-transparent border-0 cursor-pointer">
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
                {fieldErrors[f.name] && (
                  <p className="mt-1.5 text-[12px] text-red-600 font-['JetBrains_Mono']">{fieldErrors[f.name]}</p>
                )}
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading || success}
                className="flex-1 bg-[#2F4A2E] text-[#F1EAD9] font-['Space_Grotesk'] font-bold py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-[#243b23] transition-colors disabled:opacity-60">
                {loading
                  ? <><Spinner white size="sm" />Updating…</>
                  : 'Update password →'}
              </button>
              <Link to="/profile"
                className="bg-[#E9E0CB] text-[#161310] font-semibold px-5 py-3.5 rounded-full hover:bg-[#D8CEBA] transition-colors border border-[#16131012] no-underline">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* ── Security tip ── */}
        <div className="flex items-start gap-3 px-1 mt-5">
          <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#EE5688] bg-[#EE5688]/10 px-2 py-1 rounded flex-shrink-0 mt-0.5">TIP</span>
          <p className="text-[#3B342B]/55 text-sm leading-relaxed">
            Use a mix of uppercase, lowercase, numbers and symbols. Don't reuse passwords from other sites.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
