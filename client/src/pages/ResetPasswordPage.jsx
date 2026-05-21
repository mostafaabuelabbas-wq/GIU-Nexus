import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ newPassword: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const onChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const { data } = await api.patch(`/auth/reset-password/${token}`, { password: form.newPassword })
      login(data.token, data.user)
      setSuccess(true)
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset token.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'newPassword', label: 'New password',         ph: 'Min. 8 characters', showToggle: true },
    { name: 'confirm',     label: 'Confirm new password', ph: '••••••••' },
  ]

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <div className="p-6">
        <Link to="/" className="font-['Space_Grotesk'] font-bold text-lg text-[#161310] no-underline">GIU Nexus</Link>
      </div>
      <main className="flex-1 max-w-lg w-full mx-auto px-6 py-12">
        <h1 className="font-['Space_Grotesk'] font-bold text-[30px] text-[#161310] leading-tight mb-2">Reset your password.</h1>
        <p className="text-[#3B342B] text-sm mb-8">Choose a strong password you haven't used before.</p>

        <div className="bg-white rounded-[28px] p-8 border border-[#16131010]">
          {success && (
            <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-2xl text-green-800 font-semibold text-sm flex items-center gap-2">
              ✓ Password reset! Signing you in…
            </div>
          )}
          {error && (
            <div className="mb-5 p-3.5 bg-[#FEE2E2] border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {fields.map(f => (
              <div key={f.name}>
                <label className="block text-sm font-semibold text-[#161310] mb-1.5">{f.label}</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    name={f.name}
                    value={form[f.name]}
                    onChange={onChange}
                    placeholder={f.ph}
                    required
                    className="w-full bg-[#F1EAD9] border border-[#16131010] rounded-xl px-4 py-3 pr-20 text-[#161310] text-[15px] focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 focus:bg-white transition-all"
                  />
                  {f.showToggle && (
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/50 hover:text-[#161310] px-2 py-1">
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading || success}
                className="flex-1 bg-[#161310] text-[#F1EAD9] font-bold py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-60">
                {loading ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" /> Resetting…</> : 'Reset password →'}
              </button>
              <Link to="/login"
                className="bg-[#F1EAD9] text-[#161310] font-semibold px-5 py-3.5 rounded-full hover:bg-[#E9E0CB] transition-colors border border-[#16131015] no-underline">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
