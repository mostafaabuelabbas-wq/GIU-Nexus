import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Spinner from '../components/Spinner'

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const initRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'jobSeeker'
  const initEmail = searchParams.get('email') || ''

  const [form, setForm] = useState({ name: '', email: initEmail, password: '', confirm: '', role: initRole })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingRecruiter, setPendingRecruiter] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password, role: form.role,
      })
      if (form.role === 'recruiter' && data.user?.status === 'pending') { setPendingRecruiter(true); return }
      login(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (pendingRecruiter) return (
    <div className="min-h-screen bg-[#F1EAD9] flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-[#FDE9DC] flex items-center justify-center text-4xl mx-auto mb-6">⏳</div>
        <h2 className="font-['Space_Grotesk'] font-bold text-[32px] text-[#161310] mb-3">Almost there.</h2>
        <p className="text-[#3B342B] text-[17px] leading-relaxed mb-8">
          Your recruiter account is <strong>pending admin approval</strong>. You'll get an email once approved. Meanwhile, you can explore the platform.
        </p>
        <Link to="/login" className="bg-[#161310] text-[#F1EAD9] font-bold px-8 py-4 rounded-full hover:bg-black transition-colors no-underline inline-block">
          Go to login →
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex font-['DM_Sans'] bg-[#F1EAD9]">
      {/* ── Left panel (palm green) ── */}
      <div className="hidden lg:flex w-[45%] bg-[#2F4A2E] flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute -left-6 bottom-0 font-['Cairo'] font-black text-[200px] leading-none text-white/[0.05] select-none pointer-events-none">
          ابدأ
        </div>
        <Link to="/" className="relative z-10 font-['Space_Grotesk'] font-bold text-xl text-white no-underline">GIU Nexus</Link>
        <div className="relative z-10">
          <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.16em] text-white/40 mb-6">
            2,400+ students already in
          </p>
          <h2 className="font-['Space_Grotesk'] font-bold text-[42px] leading-[1.05] text-white">
            YOUR FIRST JOB<br />
            <span className="text-[#E5A93A]">STARTS HERE.</span>
          </h2>
          <p className="mt-5 text-white/50 text-[17px] leading-[1.5] max-w-[34ch]">
            Real opportunities. Matched by AI that reads your CV — not your wasta.
          </p>
        </div>
        <div className="relative z-10 font-['JetBrains_Mono'] text-xs text-white/20">EST. 2026 · Cairo</div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-[440px] py-8">
          <p className="font-['Cairo'] text-2xl text-[#2F4A2E]">ابدأ رحلتك</p>
          <h1 className="font-['Space_Grotesk'] font-bold text-[34px] text-[#161310] mt-1 leading-tight mb-6">
            Create your account.
          </h1>

          {/* Role toggle */}
          <div className="flex gap-2 mb-6 bg-white rounded-full p-1.5 border border-[#16131010]">
            {[{ id: 'jobSeeker', label: "I'm a student 🎓" }, { id: 'recruiter', label: "I'm a recruiter 💼" }].map(r => (
              <button key={r.id} type="button" onClick={() => setForm(p => ({ ...p, role: r.id }))}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${form.role === r.id ? 'bg-[#161310] text-[#F1EAD9]' : 'text-[#3B342B] hover:bg-[#F1EAD9]'}`}>
                {r.label}
              </button>
            ))}
          </div>

          {error && <div className="mb-4 p-3.5 bg-[#FEE2E2] border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {[
              { name: 'name', type: 'text', label: 'Full name', ph: 'Mostafa Abuelabbas' },
              { name: 'email', type: 'email', label: 'Email address', ph: 'you@student.giu-uni.de' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-semibold text-[#161310] mb-1.5">{f.label}</label>
                <input type={f.type} name={f.name} value={form[f.name]} onChange={onChange} placeholder={f.ph} required
                  className="w-full bg-white border border-[#16131018] rounded-xl px-4 py-3 text-[#161310] placeholder-[#3B342B]/30 text-[15px] focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 transition-all" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold text-[#161310] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={onChange}
                  placeholder="Min. 8 characters" required
                  className="w-full bg-white border border-[#16131018] rounded-xl px-4 py-3 pr-20 text-[#161310] placeholder-[#3B342B]/30 text-[15px] focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 transition-all" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/50 hover:text-[#161310] px-2 py-1">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#161310] mb-1.5">Confirm password</label>
              <input type={showPw ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={onChange}
                placeholder="••••••••" required
                className="w-full bg-white border border-[#16131018] rounded-xl px-4 py-3 text-[#161310] placeholder-[#3B342B]/30 text-[15px] focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 transition-all" />
            </div>

            <label className="flex items-start gap-2.5 text-sm text-[#3B342B] cursor-pointer mt-1">
              <input type="checkbox" required className="accent-[#EE5688] mt-0.5 flex-shrink-0" />
              I agree to the{' '}
              <a href="#" className="text-[#161310] font-semibold hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#161310] font-semibold hover:underline">Privacy Policy</a>
            </label>

            <button type="submit" disabled={loading}
              className="w-full bg-[#161310] text-[#F1EAD9] font-['Space_Grotesk'] font-bold text-[15px] py-4 rounded-full flex items-center justify-center gap-2 hover:bg-black transition-colors mt-2 disabled:opacity-60">
              {loading ? <><Spinner white size="sm" />Creating account…</> : 'Create account →'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#3B342B]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#161310] hover:text-[#EE5688] transition-colors no-underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}