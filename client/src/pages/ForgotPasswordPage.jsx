import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Spinner from '../components/Spinner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
    } catch {
      // Always show success to prevent email enumeration (backend returns 200 on unknown emails)
    } finally {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col font-['DM_Sans']">
      <div className="p-6">
        <Link to="/" className="font-['Space_Grotesk'] font-bold text-lg text-[#161310] no-underline">GIU Nexus</Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {!sent ? (
            <>
              <p className="font-['Cairo'] text-2xl text-[#E96A3A] mb-1">نسيت كلمة السر</p>
              <h1 className="font-['Space_Grotesk'] font-bold text-[32px] text-[#161310] leading-tight mb-3">
                Forgot your password?
              </h1>
              <p className="text-[#3B342B] text-[15px] leading-relaxed mb-8">
                No problem. Enter your email and we'll send a reset link. Check your spam folder if it doesn't show up within a few minutes.
              </p>

              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#161310] mb-1.5">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@student.giu-uni.de" required
                    className="w-full bg-white border border-[#16131018] rounded-xl px-4 py-3 text-[#161310] placeholder-[#3B342B]/30 text-[15px] focus:outline-none focus:border-[#E96A3A] focus:ring-2 focus:ring-[#E96A3A]/15 transition-all" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#161310] text-[#F1EAD9] font-['Space_Grotesk'] font-bold text-[15px] py-4 rounded-full flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-60">
                  {loading ? <><Spinner white size="sm" />Sending…</> : 'Send reset link →'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#3B342B]">
                Remembered it?{' '}
                <Link to="/login" className="font-bold text-[#161310] hover:text-[#EE5688] transition-colors no-underline">Back to sign in →</Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center text-4xl mx-auto mb-6">✉️</div>
              <h2 className="font-['Space_Grotesk'] font-bold text-[32px] text-[#161310] mb-3">Check your inbox.</h2>
              <p className="text-[#3B342B] text-[17px] leading-relaxed mb-8 max-w-sm mx-auto">
                If an account with <strong className="text-[#161310]">{email}</strong> exists, we've sent a password reset link. It expires in 1 hour.
              </p>
              <Link to="/login" className="bg-[#161310] text-[#F1EAD9] font-bold px-8 py-4 rounded-full hover:bg-black transition-colors no-underline inline-block">
                Back to sign in →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}