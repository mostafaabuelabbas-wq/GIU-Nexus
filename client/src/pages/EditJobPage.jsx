import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'

const inputCls =
  'w-full bg-[#F1EAD9] border border-[#16131012] rounded-xl px-4 py-3 text-[#161310] text-[15px] placeholder-[#3B342B]/35 focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 focus:bg-[#F7F1E3] transition-all'

export default function EditJobPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [formData, setFormData] = useState({
    title: '', company: '', description: '',
    location: '', type: 'full-time', salary: '', totalSlots: '',
  })
  const [requirements, setRequirements] = useState([])
  const [tagInput,      setTagInput]    = useState('')
  const [loading,       setLoading]     = useState(true)
  const [submitting,    setSubmitting]  = useState(false)
  const [error,         setError]       = useState('')
  const [success,       setSuccess]     = useState('')

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then(res => {
        const job = res.data.job ?? res.data
        setFormData({
          title:       job.title       || '',
          company:     job.company     || '',
          description: job.description || '',
          location:    job.location    || '',
          type:        job.type        || 'full-time',
          salary:      job.salary      ?? '',
          totalSlots:  job.totalSlots  ?? '',
        })
        setRequirements(job.requirements || [])
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load job.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }))
    setError(''); setSuccess('')
  }

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
    setSubmitting(true); setError(''); setSuccess('')
    try {
      await api.patch(`/jobs/${id}`, { ...formData, requirements })
      setSuccess('Changes saved. AI is re-classifying the category…')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-20"><Spinner size="lg" /></div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      {/* ── Paper header ── */}
      <div className="bg-[#F7F1E3] border-b border-[#16131010] relative overflow-hidden">
        <div className="absolute right-0 top-0 font-['Cairo'] font-black select-none pointer-events-none leading-none text-[#161310] opacity-[0.04]"
          style={{ fontSize: 'clamp(120px,16vw,240px)' }} aria-hidden="true">
          تعديل
        </div>
        <div className="max-w-[860px] mx-auto px-10 py-10 relative z-10">
          <Link to="/recruiter/dashboard"
            className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B]/45 hover:text-[#161310] transition-colors inline-flex items-center gap-1.5 mb-6 no-underline">
            ← Back to dashboard
          </Link>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-['Space_Grotesk'] font-bold text-[#161310] leading-tight tracking-tight m-0"
              style={{ fontSize: 'clamp(28px,5vw,48px)' }}>
              Edit role.
            </h1>
            <span className="font-['Cairo'] font-black text-[#3B342B]/20" style={{ fontSize: 'clamp(24px,4vw,40px)' }}>
              تعديل
            </span>
          </div>
          <p className="text-[#3B342B] text-[15px] mt-2">
            Update any field and save. Editing the description re-triggers AI category classification.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-[860px] w-full mx-auto px-10 py-10">

        {/* banners */}
        {success && (
          <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-2xl text-green-800 font-semibold text-sm flex items-center gap-2">
            ✓ {success}
          </div>
        )}
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
                <input name="title" value={formData.title} onChange={handleChange} required className={inputCls} />
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">Company</label>
                <input name="company" value={formData.company} onChange={handleChange} required className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">Location</label>
                  <input name="location" value={formData.location} onChange={handleChange} required className={inputCls} />
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
                    Salary <span className="normal-case tracking-normal text-[#3B342B]/35">(optional)</span>
                  </label>
                  <input name="salary" type="number" value={formData.salary} onChange={handleChange} placeholder="EGP / month" className={inputCls} />
                </div>
                <div>
                  <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">Total slots</label>
                  <input name="totalSlots" type="number" min="1" value={formData.totalSlots} onChange={handleChange} required className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Card 2: Details ── */}
          <div className="bg-[#EDE4D0] rounded-[28px] p-8 border border-[#16131012]">
            <div className="flex items-baseline gap-2 mb-6">
              <h2 className="font-['Space_Grotesk'] font-bold text-[20px] text-[#161310] m-0">Details</h2>
              <span className="font-['Cairo'] text-lg text-[#3B342B]/35">· التفاصيل</span>
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows={5}
                  className={`${inputCls} resize-none`} />
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#EE5688] bg-[#EE5688]/10 px-1.5 py-0.5 rounded text-[9px]">AI</span>
                  <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#3B342B]/40">
                    Editing this re-triggers AI category classification
                  </p>
                </div>
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#3B342B]/50 mb-1.5">Requirements</label>
                <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#3B342B]/35 mb-2">
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
                  placeholder="e.g. React, TypeScript…" className={inputCls} />
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pb-4">
            <button type="submit" disabled={submitting}
              className="flex-1 bg-[#2F4A2E] text-[#F1EAD9] font-['Space_Grotesk'] font-bold py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-[#243b23] transition-colors disabled:opacity-60">
              {submitting ? <><Spinner white size="sm" />Saving…</> : 'Save changes →'}
            </button>
            <button type="button" onClick={() => navigate('/recruiter/dashboard')}
              className="bg-[#E9E0CB] text-[#161310] font-semibold px-6 py-3.5 rounded-full hover:bg-[#D8CEBA] transition-colors border border-[#16131012]">
              Cancel
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}
