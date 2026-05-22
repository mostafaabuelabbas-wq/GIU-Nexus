import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getCategoryColor } from '../utils/categoryColors'
import Spinner from '../components/Spinner'

const inputCls =
  'w-full bg-[#F1EAD9] border border-[#16131012] rounded-xl px-4 py-3 text-[#161310] text-[15px] placeholder-[#3B342B]/35 focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 focus:bg-[#F7F1E3] transition-all'

export default function CreateJobPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '', company: '', description: '',
    location: '', type: 'full-time', salary: '', totalSlots: '',
  })
  const [requirements, setRequirements]   = useState([])
  const [tagInput,      setTagInput]      = useState('')
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')
  const [createdJob,    setCreatedJob]    = useState(null)
  const pollRef = useRef(0)

  /* Poll until AI finishes classifying */
  useEffect(() => {
    if (!createdJob || createdJob.category !== 'Classifying...') return
    const id = setInterval(async () => {
      pollRef.current += 1
      if (pollRef.current >= 10) { setCreatedJob(j => ({ ...j, category: 'Other' })); clearInterval(id); return }
      try {
        const { data } = await api.get(`/jobs/${createdJob._id}`)
        const j = data.job ?? data
        if (j.category !== 'Classifying...') { setCreatedJob(p => ({ ...p, category: j.category })); clearInterval(id) }
      } catch { /* keep polling */ }
    }, 3000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdJob?._id, createdJob?.category])

  const handleChange = (e) => { setFormData(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      setRequirements(prev => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (requirements.length === 0) { setError('Add at least one requirement.'); return }
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/jobs', { ...formData, requirements })
      setCreatedJob(data.job)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCreatedJob(null)
    setFormData({ title:'', company:'', description:'', location:'', type:'full-time', salary:'', totalSlots:'' })
    setRequirements([])
    pollRef.current = 0
  }

  /* ════════════════════════════════════════════════════
     SUCCESS SCREEN
  ════════════════════════════════════════════════════ */
  if (createdJob) {
    const classifying    = createdJob.category === 'Classifying...'
    const displayCat     = classifying ? 'Other' : (createdJob.category || 'Other')
    const { bg, text, dot } = getCategoryColor(displayCat)
    return (
      <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-[#EDE4D0] rounded-[32px] p-10 max-w-md w-full text-center border border-[#2F4A2E]/15">
            {/* check icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] border border-green-200 flex items-center justify-center text-3xl mx-auto mb-5">✓</div>
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B]/40 block mb-3">
              // posted live
            </span>
            <h2 className="font-['Space_Grotesk'] font-bold text-[28px] text-[#161310] mb-2">Role posted!</h2>
            <p className="text-[#3B342B] text-[15px] leading-relaxed mb-5">
              Our AI scanned the job and assigned it a category.
            </p>

            {/* AI category result */}
            {classifying ? (
              <span className="inline-flex items-center gap-2 bg-[#F1EAD9] text-[#3B342B]/60 font-['JetBrains_Mono'] font-medium px-4 py-2 rounded-full text-[12px]">
                <span className="w-3 h-3 rounded-full border-2 border-[#3B342B]/20 border-t-[#EE5688] animate-spin flex-shrink-0" />
                AI is classifying…
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 rounded-full font-['JetBrains_Mono'] font-bold px-4 py-2 text-[12px] uppercase tracking-[0.1em] border"
                style={{ background: bg, color: text, borderColor: `${dot}40` }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
                {displayCat}
              </span>
            )}

            <div className="flex gap-3 mt-8">
              <button onClick={() => navigate('/recruiter/dashboard')}
                className="flex-1 bg-[#2F4A2E] text-[#F1EAD9] font-bold py-3.5 rounded-full hover:bg-[#243b23] transition-colors">
                Back to dashboard →
              </button>
              <button onClick={resetForm}
                className="bg-[#E9E0CB] text-[#161310] font-semibold px-5 py-3.5 rounded-full hover:bg-[#D8CEBA] border border-[#16131012] transition-colors">
                Post another
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  /* ════════════════════════════════════════════════════
     FORM
  ════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      {/* ── Paper header ── */}
      <div className="bg-[#F7F1E3] border-b border-[#16131010] relative overflow-hidden">
        <div className="absolute right-0 top-0 font-['Cairo'] font-black select-none pointer-events-none leading-none text-[#161310] opacity-[0.04]"
          style={{ fontSize: 'clamp(120px,16vw,240px)' }} aria-hidden="true">
          وظيفة
        </div>
        <div className="max-w-[860px] mx-auto px-10 py-10 relative z-10">
          <Link to="/recruiter/dashboard"
            className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B]/45 hover:text-[#161310] transition-colors inline-flex items-center gap-1.5 mb-6 no-underline">
            ← Back to dashboard
          </Link>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-['Space_Grotesk'] font-bold text-[#161310] leading-tight tracking-tight m-0"
              style={{ fontSize: 'clamp(28px,5vw,48px)' }}>
              Post a role.
            </h1>
            <span className="font-['Cairo'] font-black text-[#3B342B]/20" style={{ fontSize: 'clamp(24px,4vw,40px)' }}>
              وظيفة جديدة
            </span>
          </div>
          <p className="text-[#3B342B] text-[15px] mt-2">
            Fill out the role. Our AI will auto-assign a category after you post.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-[860px] w-full mx-auto px-10 py-10">
        {error && (
          <div className="mb-6 p-4 bg-[#FEE2E2] border border-red-200 rounded-2xl text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* ── Card 1: Role basics ── */}
          <div className="bg-[#EDE4D0] rounded-[28px] p-8 border border-[#16131012]">
            <div className="flex items-baseline gap-2 mb-6">
              <h2 className="font-['Space_Grotesk'] font-bold text-[20px] text-[#161310] m-0">Role basics</h2>
              <span className="font-['Cairo'] text-lg text-[#3B342B]/35">· الأساسيات</span>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">Job title</label>
                <input name="title" value={formData.title} onChange={handleChange}
                  placeholder="e.g. Senior Frontend Engineer" required className={inputCls} />
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">Company</label>
                <input name="company" value={formData.company} onChange={handleChange}
                  placeholder="e.g. Instabug" required className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">Location</label>
                  <input name="location" value={formData.location} onChange={handleChange}
                    placeholder="Cairo, Remote…" required className={inputCls} />
                </div>
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className={inputCls}>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">
                    Salary <span className="normal-case text-[#3B342B]/35 tracking-normal">(optional)</span>
                  </label>
                  <input name="salary" type="number" value={formData.salary} onChange={handleChange}
                    placeholder="EGP / month" className={inputCls} />
                </div>
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">Total slots</label>
                  <input name="totalSlots" type="number" min="1" value={formData.totalSlots} onChange={handleChange}
                    placeholder="How many to hire" required className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Card 2: Description + Requirements ── */}
          <div className="bg-[#EDE4D0] rounded-[28px] p-8 border border-[#16131012]">
            <div className="flex items-baseline gap-2 mb-6">
              <h2 className="font-['Space_Grotesk'] font-bold text-[20px] text-[#161310] m-0">Details</h2>
              <span className="font-['Cairo'] text-lg text-[#3B342B]/35">· التفاصيل</span>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  placeholder="What does this role do? What's the team like? What will they build?" required rows={5}
                  className={`${inputCls} resize-none`} />
                <p className="text-xs text-[#3B342B]/40 mt-1.5 font-['JetBrains_Mono']">
                  Our AI reads this to classify the category. Be specific.
                </p>
              </div>

              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">Requirements</label>
                <p className="text-xs text-[#3B342B]/40 font-['JetBrains_Mono'] uppercase tracking-wider mb-2">
                  Press Enter to add each one
                </p>
                {requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {requirements.map((req, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 bg-[#2F4A2E]/10 text-[#2F4A2E] text-sm font-medium px-3 py-1.5 rounded-full border border-[#2F4A2E]/20">
                        {req}
                        <button type="button" onClick={() => setRequirements(r => r.filter((_, j) => j !== i))}
                          className="text-[#2F4A2E]/40 hover:text-[#2F4A2E] transition-colors leading-none text-base bg-transparent border-0 cursor-pointer">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
                  placeholder="e.g. React, TypeScript, 2+ years experience…"
                  className={inputCls} />
              </div>
            </div>
          </div>

          {/* ── AI note ── */}
          <div className="flex items-start gap-3 px-1">
            <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#EE5688] bg-[#EE5688]/10 px-2 py-1 rounded flex-shrink-0 mt-0.5">AI</span>
            <p className="text-[#3B342B]/60 text-sm leading-relaxed">
              After posting, our model reads the description and auto-assigns one of six categories: Frontend, Backend, AI/ML, DevOps, Data Engineering, or Other. You can't set this manually — that's the point.
            </p>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pb-4">
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#2F4A2E] text-[#F1EAD9] font-['Space_Grotesk'] font-bold py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-[#243b23] transition-colors disabled:opacity-60">
              {loading ? <><Spinner white size="sm" />Posting…</> : 'Post role →'}
            </button>
            <Link to="/recruiter/dashboard"
              className="bg-[#E9E0CB] text-[#161310] font-semibold px-6 py-3.5 rounded-full hover:bg-[#D8CEBA] transition-colors border border-[#16131012] no-underline">
              Cancel
            </Link>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
