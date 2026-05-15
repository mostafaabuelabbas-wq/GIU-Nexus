import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const STORIES = [
  {
    featured: true,
    dept: 'Computer Science', year: "'26",
    quote: '"I\'d been refreshing LinkedIn for three months. Nexus matched me to an internship at Instabug in a week. The recruiter messaged me first."',
    quoteAr: 'قعدت أرفرش لينكدإن ٣ شهور. نِكسَس لاقالي تدريب في أسبوع.',
    name: 'Nour Galal', role: 'Frontend Intern · Instabug',
    av: 'ن', avBg: '#EE5688', badge: '94% match',
  },
  {
    bg: '#E5A93A',
    dept: 'Mechatronics', year: "'25",
    quote: '"The AI actually picked up that I\'d worked on robotics — stuff that never makes it onto a one-page CV."',
    name: 'Ziad Moharam', role: 'R&D Junior · Valeo',
    av: 'ز', avBg: '#161310', avColor: '#E5A93A', badge: '3 days to hired',
  },
  {
    bg: '#2F4A2E', dark: true,
    dept: 'Business Informatics', year: "'27",
    quote: '"I wanted a part-time that didn\'t conflict with my Tuesday labs. Found three. Picked the one that paid in EGP, not promises."',
    name: 'Sarah Ibrahim', role: 'Part-time PM · MaxAB',
    av: 'س', avBg: '#E5A93A', avColor: '#161310', badge: '12 hrs/wk',
  },
]

const MICRO = [
  { k: '3.2×', kAr:'أسرع', v: 'Time to hire vs. LinkedIn' },
  { k: '60s',  v: 'From post to ranked shortlist' },
  { k: '100%', v: 'Verified GIU students' },
  { k: '0',    v: 'Ghost applications', kColor:'#EE5688' },
]

export default function StoriesBottom() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const onCloser = (e) => {
    e.preventDefault()
    if (isAuthenticated) { navigate('/jobs/recommended'); return }
    const q = email ? `?email=${encodeURIComponent(email)}` : ''
    navigate(`/register${q}`)
  }

  return (
    <>
      {/* ══════════ STORIES ══════════ */}
      <section id="stories" className="max-w-[1360px] mx-auto px-10 pb-[120px]">
        <div className="flex items-baseline justify-between mb-12 gap-6 flex-wrap">
          <div>
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B] block mb-3">
              / 04 — Stories · <span className="font-['Cairo'] font-bold" dir="rtl">قصص</span>
            </span>
            <h2 className="font-['Space_Grotesk'] font-bold text-[64px] tracking-[-0.03em] leading-none text-[#161310] m-0">The first job, in their words.</h2>
          </div>
          <span dir="rtl" className="font-['Cairo'] font-black text-[48px] text-[#2F4A2E] leading-none self-end">أول شغل، بكلامهم.</span>
        </div>

        <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-5">
          {STORIES.map((s, i) => (
            <article key={i}
              className="rounded-[32px] p-7 flex flex-col gap-4 min-h-[380px] justify-between"
              style={{
                background: s.featured ? '#E9E0CB' : s.bg || 'white',
                border: s.featured ? '1.5px solid #161310' : undefined,
                color: s.dark ? '#F1EAD9' : '#161310',
              }}>
              <div>
                <div className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.1em]"
                  style={{ color: s.dark ? 'rgba(241,234,217,0.7)' : '#3B342B' }}>
                  <strong style={{ color: s.dark ? 'white' : '#161310' }}>{s.dept}</strong> · GIU {s.year}
                </div>
                <p className="font-['Space_Grotesk'] font-medium leading-[1.25] tracking-[-0.015em] mt-3.5"
                  style={{ fontSize: s.featured ? 30 : 24, color: s.dark ? '#F1EAD9' : '#161310' }}>
                  {s.quote}
                </p>
                {s.quoteAr && (
                  <p dir="rtl" className="font-['Cairo'] font-bold text-[22px] leading-[1.4] text-[#2F4A2E] mt-1.5">{s.quoteAr}</p>
                )}
              </div>
              <div className="flex justify-between items-center pt-4 border-t"
                style={{ borderColor: s.dark ? 'rgba(255,255,255,0.15)' : 'rgba(22,19,16,0.1)' }}>
                <div className="flex items-center gap-3.5">
                  <span className="w-12 h-12 rounded-full inline-flex items-center justify-center font-['Cairo'] font-black text-lg flex-shrink-0"
                    style={{ background: s.avBg, color: s.avColor || '#fff' }}>
                    {s.av}
                  </span>
                  <div>
                    <div className="font-semibold text-[15px]">{s.name}</div>
                    <div className="font-['JetBrains_Mono'] text-[13px]"
                      style={{ color: s.dark ? 'rgba(241,234,217,0.6)' : '#3B342B' }}>
                      {s.role}
                    </div>
                  </div>
                </div>
                <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.1em]"
                  style={{ color: s.dark ? 'rgba(241,234,217,0.7)' : '#3B342B' }}>
                  <strong style={{ color: s.dark ? 'white' : '#161310' }}>{s.badge}</strong>
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ══════════ EMPLOYER BAND ══════════ */}
      <section className="max-w-[1360px] mx-auto px-10 pb-[120px]">
        <div className="bg-[#F7F1E3] rounded-[48px] p-16 grid grid-cols-2 gap-12 items-center border-[1.5px] border-[#161310]">
          <div>
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B]">// for employers</span>
            <h3 className="font-['Space_Grotesk'] font-bold text-[64px] leading-[0.95] tracking-[-0.03em] text-[#161310] mt-3 mb-0">
              Hire the next class<br />before LinkedIn does.
            </h3>
            <div dir="rtl" className="font-['Cairo'] font-black text-[44px] text-[#2F4A2E] mt-3.5">
              طلبة جاهزين. <span className="text-[#EE5688]">دلوقتي.</span>
            </div>
            <p className="text-[18px] leading-[1.5] text-[#3B342B] max-w-[42ch] my-6">
              Nexus gives you a direct line to ranked, verified GIU candidates. Skills extracted by AI, not self-reported. Approved recruiters only — so it's quality, not noise.
            </p>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 mb-6">
              {[
                'AI-ranked candidate shortlists in 60 seconds',
                'Auto-categorised listings (intern · grad · part-time)',
                'Admin-approved access. No spam recruiters.',
                'Free until you make your first hire',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[15px] text-[#161310]">
                  <span className="w-[22px] h-[22px] rounded-full bg-[#2F4A2E] text-white text-xs inline-flex items-center justify-center flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-2.5">
              <Link to="/register?role=recruiter"
                className="inline-flex items-center gap-2 bg-[#161310] text-[#F1EAD9] font-['Space_Grotesk'] font-semibold text-[15px] px-5 py-3 rounded-full hover:-translate-y-px transition-transform no-underline">
                Post a role · free
              </Link>
              <a href="mailto:hello@giu-nexus.eg"
                className="inline-flex items-center gap-2 text-[#161310] font-['Space_Grotesk'] font-semibold text-[15px] px-5 py-3 rounded-full hover:bg-[#161310]/5 transition-colors no-underline">
                Book a demo →
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            {/* Price card */}
            <div className="bg-[#161310] text-[#F1EAD9] rounded-[28px] p-7 relative overflow-hidden">
              <div className="absolute -right-7 -top-7 w-[140px] h-[140px] rounded-full bg-[#E96A3A] opacity-60 pointer-events-none" />
              <div className="relative">
                <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] opacity-70">// per successful hire</span>
                <div className="font-['Space_Grotesk'] font-bold text-[72px] leading-none tracking-[-0.03em] mt-2">
                  EGP 0 <small className="text-[18px] font-medium opacity-60">· your first one</small>
                </div>
                <p className="mt-4 text-sm opacity-85 leading-[1.5]">Then a flat fee, no recurring subscription. Cancel any time — but you won't.</p>
              </div>
            </div>
            {/* Micro stats */}
            <div className="grid grid-cols-2 gap-3.5">
              {MICRO.map((m, i) => (
                <div key={i} className="bg-white rounded-[22px] p-4">
                  <div className="font-['Space_Grotesk'] font-bold text-[34px] leading-none tracking-[-0.02em]"
                    style={{ color: m.kColor || '#161310' }}>
                    {m.k}
                    {m.kAr && <span dir="rtl" className="font-['Cairo'] font-black text-[#EE5688] ml-1.5">{m.kAr}</span>}
                  </div>
                  <div className="font-['JetBrains_Mono'] text-[12px] uppercase tracking-[0.05em] text-[#3B342B] mt-1.5">{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CLOSER CTA ══════════ */}
      <section className="max-w-[1360px] mx-auto px-10 pb-[120px]">
        <div className="bg-[#EE5688] text-white rounded-[48px] py-24 px-16 relative overflow-hidden">
          <div className="absolute -left-24 -bottom-24 w-[380px] h-[380px] rounded-full bg-[#E96A3A] opacity-85 pointer-events-none" />
          <div className="relative z-10 grid grid-cols-[1.2fr_0.8fr] items-center gap-12">
            <div>
              <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-white/80">// your move</span>
              <h2 className="font-['Space_Grotesk'] font-bold leading-[0.88] tracking-[-0.04em] text-white mt-2 mb-0"
                style={{ fontSize: 'clamp(72px,8vw,128px)' }}>
                Your <em className="not-italic font-medium">turn.</em>
              </h2>
              <div dir="rtl" className="font-['Cairo'] font-black text-[84px] leading-none mt-4">دورك دلوقتي.</div>
              <p className="text-[18px] leading-[1.5] max-w-[38ch] my-8 opacity-95">
                Make a profile in two minutes. Get matched by tomorrow morning. We'll bring the jobs — you just have to show up.
              </p>
              <form onSubmit={onCloser} className="flex bg-white rounded-full p-2 items-center max-w-[520px]">
                <input
                  type="email"
                  placeholder="you@student.giu-uni.edu.eg"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 border-0 bg-transparent outline-none px-4 py-3 font-['DM_Sans'] text-[16px] text-[#161310] placeholder-[#161310]/60"
                />
                <button type="submit"
                  className="bg-[#161310] text-[#F1EAD9] font-['Space_Grotesk'] font-semibold text-[15px] px-5 py-3 rounded-full hover:bg-black transition-colors flex-shrink-0">
                  {isAuthenticated ? 'See my matches →' : 'Get matched →'}
                </button>
              </form>
            </div>

            <div className="relative h-[340px]">
              {[
                { cls:'top-0 left-[30px] -rotate-[6deg]', bg:'white', lines:['// signed up just now', 'Yassin · \'27'] },
                { cls:'top-[130px] right-0 rotate-[4deg]', bg:'#161310', dark:true, lines:['// الكلام بالعربي', 'واجهة عربية كاملة'] },
                { cls:'bottom-0 left-0 -rotate-[3deg]', bg:'#E5A93A', lines:['// matched today', '+ 47 students'] },
              ].map((b, i) => (
                <div key={i} className={`absolute ${b.cls} rounded-[24px] p-4 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.25)]`}
                  style={{ background: b.bg }}>
                  <div className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.1em]"
                    style={{ color: b.dark ? 'rgba(241,234,217,0.6)' : '#3B342B' }}>
                    {b.lines[0]}
                  </div>
                  <div className={`font-bold text-[28px] leading-none mt-1 ${i === 1 ? "font-['Cairo'] font-black text-[#E5A93A] text-[30px]" : "font-['Space_Grotesk'] tracking-tight"}`}
                    dir={i === 1 ? 'rtl' : undefined}
                    style={{ color: b.dark ? undefined : '#161310' }}>
                    {b.lines[1]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
