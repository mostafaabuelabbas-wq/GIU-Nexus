import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getCategoryColor } from '../utils/categoryColors'

const inputCls =
  "w-full bg-[#F1EAD9] border border-[#16131010] rounded-xl px-4 py-3 text-[#161310] text-[15px] placeholder-[#3B342B]/35 focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 focus:bg-white transition-all"

export default function CreateJobPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    type: 'full-time',
    salary: '',
    totalSlots: '',
  })
  const [requirements, setRequirements] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [createdJob, setCreatedJob] = useState(null)

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      setRequirements([...requirements, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (requirements.length === 0) {
      setError('Add at least one requirement.')
      return
    }
    setLoading(true)
    setError('')

    api.post('/jobs', { ...formData, requirements })
      .then(res => setCreatedJob(res.data.job))
      .catch(err => setError(err.response?.data?.message || 'Failed to create job.'))
      .finally(() => setLoading(false))
  }

  /* ── Success screen ── */
  if (createdJob) {
    const { bg, text, dot } = getCategoryColor(createdJob.category || 'Other')
    return (
      <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-[28px] p-10 max-w-md w-full text-center border border-[#16131010]">
            <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] border border-green-200 flex items-center justify-center text-3xl mx-auto mb-5">
              ✓
            </div>
            <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40 mb-3">
              // posted live
            </p>
            <h2 className="font-['Space_Grotesk'] font-bold text-[28px] text-[#161310] mb-2">
              Role posted!
            </h2>
            <p className="text-[#3B342B] mb-5">
              Our AI scanned the job and assigned it a category.
            </p>
            <span
              className="inline-flex items-center gap-1.5 rounded-full font-['JetBrains_Mono'] font-medium px-3 py-1.5 text-[12px]"
              style={{ background: bg, color: text }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
              {createdJob.category || 'Other'}
            </span>
            <div className="flex gap-3 mt-7">
              <button
                onClick={() => navigate('/recruiter/dashboard')}
                className="flex-1 bg-[#161310] text-[#F1EAD9] font-bold py-3.5 rounded-full hover:bg-black transition-colors"
              >
                Back to dashboard →
              </button>
              <button
                onClick={() => { setCreatedJob(null); setFormData({ title:'', company:'', description:'', location:'', type:'full-time', salary:'', totalSlots:'' }); setRequirements([]) }}
                className="bg-[#F1EAD9] text-[#161310] font-semibold px-5 py-3.5 rounded-full hover:bg-[#E9E0CB] border border-[#16131015] transition-colors"
              >
                Post another
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  /* ── Form ── */
  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10">
        <Link
          to="/recruiter/dashboard"
          className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/50 hover:text-[#161310] transition-colors inline-flex items-center gap-1.5 mb-6 no-underline"
        >
          ← Back to dashboard
        </Link>

        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <h1 className="font-['Space_Grotesk'] font-bold text-[36px] text-[#161310] leading-tight tracking-tight m-0">
            Post a role.
          </h1>
          <span className="font-['Cairo'] font-black text-[28px] text-[#3B342B]/25">وظيفة جديدة</span>
        </div>
        <p className="text-[#3B342B] text-sm mb-8">
          Fill out the role. Our AI will auto-assign a category after you post.
        </p>

        <div className="bg-white rounded-[28px] p-8 border border-[#16131010]">
          {error && (
            <div className="mb-5 p-3.5 bg-[#FEE2E2] border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#161310] mb-1.5">Job title</label>
              <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Senior Frontend Engineer" required className={inputCls} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#161310] mb-1.5">Company</label>
              <input name="company" value={formData.company} onChange={handleChange} placeholder="e.g. Instabug" required className={inputCls} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#161310] mb-1.5">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="What does this role do? What's the team like?" required rows={5} className={inputCls} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#161310] mb-1.5">Location</label>
                <input name="location" value={formData.location} onChange={handleChange} placeholder="Cairo, Remote…" required className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#161310] mb-1.5">Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className={inputCls}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#161310] mb-1.5">Salary <span className="text-[#3B342B]/50 font-normal">(optional)</span></label>
                <input name="salary" type="number" value={formData.salary} onChange={handleChange} placeholder="EGP / month" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#161310] mb-1.5">Total slots</label>
                <input name="totalSlots" type="number" min="1" value={formData.totalSlots} onChange={handleChange} placeholder="How many to hire" required className={inputCls} />
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-semibold text-[#161310] mb-1.5">Requirements</label>
              <p className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/40 mb-2">
                Press Enter to add each one.
              </p>
              {requirements.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {requirements.map((req, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-[#FDE9DC] text-[#E96A3A] text-sm font-medium px-3 py-1.5 rounded-full border border-[#E96A3A]/20">
                      {req}
                      <button type="button" onClick={() => removeTag(i)} className="text-[#E96A3A]/50 hover:text-[#E96A3A] transition-colors leading-none text-base" aria-label={`Remove ${req}`}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="e.g. React, TypeScript, 2+ years experience…"
                className={inputCls}
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#161310] text-[#F1EAD9] font-bold py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-60"
              >
                {loading
                  ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" /> Posting…</>
                  : 'Post role →'}
              </button>
              <Link
                to="/recruiter/dashboard"
                className="bg-[#F1EAD9] text-[#161310] font-semibold px-5 py-3.5 rounded-full hover:bg-[#E9E0CB] transition-colors border border-[#16131015] no-underline"
              >
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
