import { useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const FRAMES = [
  { bg:'#2F4A2E', tag:'// studio · cairo', num:'٠١', baseT:'rotate(-3deg)',  cls:'left-0 top-0 w-[62%] h-[55%]'           },
  { bg:'#EE5688', tag:'// portrait',         num:'٠٢', baseT:'rotate(4deg)',   cls:'right-0 top-[40px] w-[46%] h-[46%]'      },
  { bg:'#E5A93A', tag:'// abstract',          num:'٠٣', baseT:'rotate(2deg)',   cls:'left-[30px] bottom-0 w-[52%] h-[42%]'   },
  { bg:'#161310', tag:'// interface',          num:'٠٤', baseT:'rotate(-5deg)', cls:'right-[10%] bottom-[40px] w-[36%] h-[36%]' },
]

export default function HeroSection({ primaryCta }) {
  const { isAuthenticated } = useAuth()
  const collageRef = useRef(null)
  const kwRef      = useRef(null)
  const locRef     = useRef(null)
  const navigate   = useNavigate()

  useEffect(() => {
    const el = collageRef.current
    if (!el) return
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width  - 0.5
      const y = (e.clientY - r.top)  / r.height - 0.5
      el.querySelectorAll('[data-frame]').forEach((f, i) => {
        const d = (i + 1) * 4
        f.style.transform = `${f.dataset.baseT} translate(${x*d}px,${y*d}px)`
      })
    }
    const onLeave = () => el.querySelectorAll('[data-frame]').forEach(f => { f.style.transform = f.dataset.baseT })
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [])

  const onSearch = (e) => {
    e.preventDefault()
    const p = new URLSearchParams()
    const kw  = kwRef.current?.value?.trim()
    const loc = locRef.current?.value?.trim()
    if (kw)  p.set('keyword', kw)
    if (loc) p.set('location', loc)
    navigate(`/jobs${p.toString() ? `?${p}` : ''}`)
  }

  return (
    <section className="max-w-[1360px] mx-auto px-10 pt-16 pb-10">
      {/* ── Meta chips ── */}
      <div className="flex gap-[18px] items-center mb-8 flex-wrap">
        <span className="inline-flex items-center gap-2 bg-white rounded-full px-3.5 py-2 font-['JetBrains_Mono'] text-xs uppercase tracking-[0.08em]">
          <span className="w-2 h-2 rounded-full bg-[#E96A3A] flex-shrink-0" />
          EST. 2026 · 30.0444° N, 31.2357° E
        </span>
        <span className="bg-[#161310] text-[#F1EAD9] rounded-full px-3.5 py-2 font-['JetBrains_Mono'] text-xs uppercase tracking-[0.08em]">
          Built by GIU students. Powered by AI.
        </span>
        <span className="bg-white rounded-full px-3.5 py-2 font-['JetBrains_Mono'] text-xs uppercase tracking-[0.08em]">
          Internships · Graduate roles · Part-time
        </span>
      </div>

      {/* ── Hero grid ── */}
      <div className="grid grid-cols-[1.05fr_0.95fr] gap-12 items-end">
        <div>
          <h1 className="font-['Space_Grotesk'] font-bold leading-[0.86] tracking-[-0.04em] text-[#161310] m-0"
            style={{ fontSize: 'clamp(72px,9.2vw,148px)' }}>
            Made by us.<br />
            Made <em className="not-italic font-medium text-[#2F4A2E]">for</em>{' '}
            <span className="text-[#2F4A2E]">us.</span>
          </h1>

          <div dir="rtl" className="font-['Cairo'] font-black text-[#161310] leading-[1.05] tracking-[-0.02em] mt-2"
            style={{ fontSize: 'clamp(56px,7vw,118px)' }}>
            <span className="relative inline-block">
              صُنع في مصر
              <span className="absolute left-0 right-0 bottom-1.5 h-3.5 bg-[#E5A93A] rounded-full -z-10 opacity-70" />
            </span>،<br />
            <span className="text-[#EE5688]">لطلبتها.</span>
          </div>

          <p className="mt-9 max-w-[560px] text-[19px] leading-[1.4] text-[#3B342B]">
            A career platform built by GIU students, for every Egyptian student looking for the first job
            that actually fits. Real opportunities. Real companies. Matched by AI that read your
            CV — not your wasta.
          </p>

          <div className="flex gap-3 mt-7 items-center flex-wrap">
            <Link to={primaryCta.to}
              className="inline-flex items-center gap-2 bg-[#EE5688] text-white font-['Space_Grotesk'] font-semibold text-base px-6 py-[18px] rounded-full hover:-translate-y-px transition-transform no-underline">
              {primaryCta.label}
              <span className="w-[22px] h-[22px] rounded-full bg-white/25 inline-flex items-center justify-center text-sm">→</span>
            </Link>
            {!isAuthenticated && (
              <Link to="/register?role=recruiter"
                className="inline-flex items-center text-[#161310] font-['Space_Grotesk'] font-semibold text-base px-6 py-[18px] rounded-full ring-[1.5px] ring-[#161310] hover:bg-[#161310] hover:text-[#F1EAD9] transition-colors no-underline">
                I'm hiring students
              </Link>
            )}
            <span className="text-sm text-[#3B342B] ml-2">
              <strong className="text-[#161310] font-semibold">2,400+</strong> students already in
            </span>
          </div>

          {/* Quick search */}
          <form onSubmit={onSearch}
            className="mt-9 bg-white rounded-full p-2 flex items-center gap-2 max-w-[580px] shadow-[0_30px_60px_-40px_rgba(0,0,0,0.25)]">
            <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 min-w-0">
              <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.1em] text-[#3B342B] whitespace-nowrap">I'm looking for</span>
              <input ref={kwRef} defaultValue="frontend internship" placeholder="role or skill"
                className="border-0 bg-transparent outline-none text-[15px] text-[#161310] w-full min-w-0 font-['DM_Sans']" />
            </div>
            <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 min-w-0 border-l border-[#16131015]">
              <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.1em] text-[#3B342B]">In</span>
              <input ref={locRef} defaultValue="Cairo" placeholder="city"
                className="border-0 bg-transparent outline-none text-[15px] text-[#161310] w-full min-w-0 font-['DM_Sans']" />
            </div>
            <button type="submit"
              className="bg-[#161310] text-[#F1EAD9] font-['Space_Grotesk'] font-semibold text-[15px] px-5 py-3 rounded-full hover:bg-black transition-colors">
              Match me
            </button>
          </form>
        </div>

        {/* ── Collage ── */}
        <div ref={collageRef} className="relative h-[640px]" aria-hidden="true">
          {FRAMES.map(f => (
            <div key={f.num} data-frame data-base-t={f.baseT}
              className={`absolute ${f.cls} rounded-[36px] overflow-hidden shadow-[0_30px_60px_-40px_rgba(0,0,0,0.33)] transition-[transform] duration-150`}
              style={{ background: f.bg, transform: f.baseT }}>
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.06)_0_16px,transparent_16px_36px)]" />
              <div className="absolute left-3.5 top-3.5 bg-white/10 text-white font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-full">
                {f.tag}
              </div>
              <div dir="rtl" className="absolute right-4 bottom-3.5 font-['Cairo'] font-black text-[42px] text-white/40">
                {f.num}
              </div>
            </div>
          ))}
          <div className="absolute bg-white border-[1.5px] border-[#161310] px-[18px] py-3.5 rounded-3xl font-['JetBrains_Mono'] text-xs uppercase tracking-[0.1em] flex items-center gap-2.5 shadow-[6px_6px_0_#161310] -right-2.5 top-[46%]">
            <span className="w-[18px] h-[18px] bg-[#E5A93A] rounded-[5px] rotate-45 flex-shrink-0" />
            AI match · 94%
          </div>
        </div>
      </div>

      {/* ── Ticker ── */}
      <div className="mt-16 bg-[#161310] text-[#F1EAD9] rounded-full py-[18px] overflow-hidden">
        <div className="flex gap-9 whitespace-nowrap font-['Space_Grotesk'] font-semibold text-[22px] tracking-[-0.01em] animate-ticker">
          {[0, 1].map(n => (
            <span key={n} className="inline-flex items-center gap-9" aria-hidden={n > 0 ? 'true' : undefined}>
              <span>Made in Cairo</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E96A3A] inline-block flex-shrink-0" />
              <span dir="rtl" className="font-['Cairo'] font-black">صُنع في القاهرة</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#EE5688] inline-block flex-shrink-0" />
              <span>By students, for students</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5A93A] inline-block flex-shrink-0" />
              <span dir="rtl" className="font-['Cairo'] font-black">من الطلبة، للطلبة</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E96A3A] inline-block flex-shrink-0" />
              <span>No CVs into the void</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#EE5688] inline-block flex-shrink-0" />
              <span dir="rtl" className="font-['Cairo'] font-black">مفيش سيرة بتضيع</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5A93A] inline-block flex-shrink-0" />
              <span>Real jobs. Real companies.</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E96A3A] inline-block flex-shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
