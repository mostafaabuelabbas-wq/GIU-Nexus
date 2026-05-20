import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Spinner from '../components/Spinner'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-['DM_Sans'] bg-[#F1EAD9]">
      {/* ── Left dark panel ── */}
      <div className="hidden lg:flex w-[45%] bg-[#161310] flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute right-0 top-0 font-['Cairo'] font-black text-[220px] leading-none text-white/[0.04] select-none pointer-events-none translate-x-8">
          نكسس
        </div>
        <Link to="/" className="relative z-10 font-['Space_Grotesk'] font-bold text-xl text-white no-underline">
          GIU Nexus
        </Link>
        <div className="relative z-10">
          <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.16em] text-white/40 mb-6">
            EST. 2026 · Cairo · GIU Students
          </p>
          <h2 className="font-['Space_Grotesk'] font-bold text-[42px] leading-[1.05] text-white">
            BUILT BY<br />GIU STUDENTS.<br />
            <span className="text-[#E96A3A]">POWERED BY AI.</span>
          </h2>
          <p className="mt-5 text-white/50 text-[17px] leading-[1.5] max-w-[34ch]">
            The career platform Egypt didn't have. So we built it. No wasta required.
          </p>
        </div>
        <div className="relative z-10 font-['JetBrains_Mono'] text-xs text-white/20">
          30.0444° N, 31.2357° E
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[420px]">
          <Link to="/" className="lg:hidden font-['Space_Grotesk'] font-bold text-lg text-[#161310] no-underline block mb-8">
            GIU Nexus
          </Link>

          <p className="font-['Cairo'] text-2xl text-[#E96A3A]">أهلاً بعودتك</p>
          <h1 className="font-['Space_Grotesk'] font-bold text-[36px] text-[#161310] mt-1 leading-tight">
            Welcome back.
          </h1>
          <p className="text-[#3B342B] mt-2 text-[15px] mb-8">Sign in to continue your job search.</p>

          {error && (
            <div className="mb-5 p-3.5 bg-[#FEE2E2] border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#161310] mb-1.5">Email address</label>
              <input type="email" name="email" value={form.email} onChange={onChange}
                placeholder="you@student.giu-uni.de" required
                className="w-full bg-white border border-[#16131018] rounded-xl px-4 py-3 text-[#161310] placeholder-[#3B342B]/30 text-[15px] focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#161310] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={onChange}
                  placeholder="••••••••" required
                  className="w-full bg-white border border-[#16131018] rounded-xl px-4 py-3 pr-20 text-[#161310] placeholder-[#3B342B]/30 text-[15px] focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 transition-all" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/50 hover:text-[#161310] transition-colors px-2 py-1">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#3B342B] cursor-pointer select-none">
                <input type="checkbox" className="accent-[#EE5688] rounded" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-semibold text-[#EE5688] hover:underline no-underline">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#161310] text-[#F1EAD9] font-['Space_Grotesk'] font-bold text-[15px] py-4 rounded-full flex items-center justify-center gap-2 hover:bg-black transition-colors mt-2 disabled:opacity-60">
              {loading ? <><Spinner white size="sm" />Signing in…</> : 'Sign in →'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#3B342B]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#161310] hover:text-[#EE5688] transition-colors no-underline">
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}