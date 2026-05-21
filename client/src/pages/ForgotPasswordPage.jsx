import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Spinner from '../components/Spinner'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep]       = useState(1) // 1 = email, 2 = otp
  const [email, setEmail]     = useState('')
  const [otp, setOtp]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const inputCls = "w-full bg-white border border-[#16131018] rounded-xl px-4 py-3 text-[#161310] placeholder-[#3B342B]/30 text-[15px] focus:outline-none focus:border-[#E96A3A] focus:ring-2 focus:ring-[#E96A3A]/15 transition-all"

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
    } catch {
      // Always advance — backend never reveals if email exists
    } finally {
      setLoading(false)
      setStep(2)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp })
      navigate(`/reset-password/${data.resetToken}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.')
    } finally {
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

          {step === 1 && (
            <>
              <p className="font-['Cairo'] text-2xl text-[#E96A3A] mb-1">نسيت كلمة السر</p>
              <h1 className="font-['Space_Grotesk'] font-bold text-[32px] text-[#161310] leading-tight mb-3">
                Forgot your password?
              </h1>
              <p className="text-[#3B342B] text-[15px] leading-relaxed mb-8">
                Enter your email and we'll send you a 6-digit code to reset your password.
              </p>
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#161310] mb-1.5">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@student.giu-uni.de" required className={inputCls} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#161310] text-[#F1EAD9] font-['Space_Grotesk'] font-bold text-[15px] py-4 rounded-full flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-60">
                  {loading ? <><Spinner white size="sm" />Sending…</> : 'Send code →'}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-[#3B342B]">
                Remembered it?{' '}
                <Link to="/login" className="font-bold text-[#161310] hover:text-[#EE5688] transition-colors no-underline">Back to sign in →</Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center text-4xl mx-auto mb-6">✉️</div>
              <h1 className="font-['Space_Grotesk'] font-bold text-[32px] text-[#161310] leading-tight mb-3 text-center">
                Check your inbox.
              </h1>
              <p className="text-[#3B342B] text-[15px] leading-relaxed mb-8 text-center">
                We sent a 6-digit code to <strong className="text-[#161310]">{email}</strong>. Enter it below. It expires in 10 minutes.
              </p>
              <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#161310] mb-1.5">6-digit code</label>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456" required maxLength={6} className={`${inputCls} text-center tracking-[0.4em] text-xl font-bold`} />
                </div>
                {error && (
                  <div className="p-3 bg-[#FEE2E2] border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                )}
                <button type="submit" disabled={loading || otp.length < 6}
                  className="w-full bg-[#161310] text-[#F1EAD9] font-['Space_Grotesk'] font-bold text-[15px] py-4 rounded-full flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-60">
                  {loading ? <><Spinner white size="sm" />Verifying…</> : 'Verify code →'}
                </button>
                <button type="button" onClick={() => { setStep(1); setOtp(''); setError('') }}
                  className="text-sm text-center text-[#3B342B] hover:text-[#161310] transition-colors">
                  ← Use a different email
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
