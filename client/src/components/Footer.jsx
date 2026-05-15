import { Link } from 'react-router-dom'

function BrandMark() {
  return (
    <div className="w-[30px] h-[30px] rounded-[9px] bg-[#161310] relative flex-shrink-0">
      <div className="absolute left-[7px] top-[7px] w-[6px] h-[16px] bg-[#F1EAD9] rounded-sm -rotate-[12deg]" />
      <div className="absolute right-[7px] top-[7px] w-[6px] h-[16px] bg-[#EE5688] rounded-sm rotate-[12deg]" />
    </div>
  )
}

const COLS = [
  {
    title: 'For students',
    links: [
      { label: 'Find jobs',       to: '/jobs' },
      { label: 'Internships',     to: '/jobs?type=internship' },
      { label: 'Build a profile', to: '/profile' },
      { label: 'AI skill scan',   to: '/profile' },
      { label: 'Career stories',  to: '#stories' },
    ],
  },
  {
    title: 'For employers',
    links: [
      { label: 'Post a role',     to: '/register?role=recruiter' },
      { label: 'Why GIU talent',  to: '#manifesto' },
      { label: 'Get verified',    to: '/register?role=recruiter' },
      { label: 'Pricing',         to: '#' },
      { label: 'Book a demo',     href: 'mailto:hello@giu-nexus.eg' },
    ],
  },
  {
    title: 'The project',
    links: [
      { label: 'Our manifesto',        to: '#manifesto' },
      { label: 'Team of 10',           to: '#' },
      { label: 'Open source',          to: '#' },
      { label: 'Press kit',            to: '#' },
      { label: 'hello@giu‑nexus.eg',  href: 'mailto:hello@giu-nexus.eg' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="max-w-[1360px] mx-auto px-10 pt-20 pb-14 text-[#161310]">
      {/* ── Top grid ── */}
      <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] gap-12 pb-12 border-b border-[#16131015]">
        {/* Brand col */}
        <div>
          <div className="flex items-center gap-3">
            <BrandMark />
            <span className="font-['Space_Grotesk'] font-bold text-[22px] tracking-tight">GIU Nexus</span>
            <span className="font-['Cairo'] font-bold text-[20px]" dir="rtl">نِكسَس</span>
          </div>
          <p className="mt-6 text-[15px] text-[#3B342B] leading-[1.5] max-w-[36ch]">
            A career platform{' '}
            <span className="font-['Cairo'] font-bold text-[#161310]" dir="rtl">من الطلبة، للطلبة</span>
            {' '}— built in New Cairo at the German International University, Spring 2026.
          </p>
        </div>

        {/* Link cols */}
        {COLS.map(({ title, links }) => (
          <div key={title}>
            <h4 className="font-['JetBrains_Mono'] text-[12px] uppercase tracking-[0.14em] text-[#3B342B] m-0 mb-[18px] font-medium">
              {title}
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              {links.map(({ label, to, href }) => (
                <li key={label}>
                  {href ? (
                    <a href={href} className="text-[#161310] text-[15px] no-underline hover:text-[#EE5688] transition-colors">
                      {label}
                    </a>
                  ) : (
                    <Link to={to} className="text-[#161310] text-[15px] no-underline hover:text-[#EE5688] transition-colors">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Mega wordmark ── */}
      <div className="mt-4 -mx-2 overflow-hidden">
        <h1
          className="font-['Space_Grotesk'] font-bold leading-[0.85] tracking-[-0.06em] m-0 select-none"
          style={{ fontSize: 'clamp(140px, 18vw, 280px)' }}
        >
          <span className="font-['Cairo'] font-black text-[#2F4A2E]" dir="rtl">نِكسَس</span>
          ·NEXUS<em className="not-italic font-medium text-[#EE5688]">.</em>
        </h1>
      </div>

      {/* ── Legal ── */}
      <div className="flex flex-wrap gap-[18px] mt-8 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.08em] text-[#3B342B]">
        <span>© 2026 GIU Nexus · German International University, New Cairo</span>
        <span>Privacy</span>
        <span>Terms</span>
        <span>Cookies</span>
        <span className="ml-auto font-['Cairo'] font-bold normal-case tracking-normal text-[13px]" dir="rtl">
          صُنع في القاهرة 🇪🇬
        </span>
      </div>
    </footer>
  )
}
