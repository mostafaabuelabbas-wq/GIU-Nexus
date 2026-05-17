import { Link } from 'react-router-dom'

function BrandMark() {
  return (
    <div className="w-[30px] h-[30px] rounded-[9px] bg-[#161310] relative flex-shrink-0">
      <div className="absolute left-[7px] top-[7px] w-[6px] h-[16px] bg-[#F1EAD9] rounded-sm -rotate-[12deg]" />
      <div className="absolute right-[7px] top-[7px] w-[6px] h-[16px] bg-[#EE5688] rounded-sm rotate-[12deg]" />
    </div>
  )
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="font-['JetBrains_Mono'] text-xs uppercase tracking-[0.14em] text-[#3B342B] mb-[18px] font-medium m-0">
        {title}
      </h4>
      <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            {href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#') ? (
              <a href={href} className="text-[#161310] text-[15px] hover:text-[#2F4A2E] transition-colors no-underline">
                {label}
              </a>
            ) : (
              <Link to={href} className="text-[#161310] text-[15px] hover:text-[#2F4A2E] transition-colors no-underline">
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[#F1EAD9] text-[#161310] overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-10 pt-20 pb-14">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-12 pb-12 mb-12 border-b border-[#16131015]">
          <div>
            <Link to="/" className="flex items-center gap-3 no-underline text-[#161310]">
              <BrandMark />
              <span className="font-['Space_Grotesk'] font-bold text-[22px] tracking-tight">GIU Nexus</span>
              <span className="font-['Cairo'] font-bold text-[20px]">نِكسَس</span>
            </Link>
            <p className="mt-6 text-[15px] text-[#3B342B] leading-[1.5] max-w-[36ch]">
              A career platform{' '}
              <span className="font-['Cairo'] font-bold text-[#161310]">من الطلبة، للطلبة</span>
              {' '}— built in New Cairo at GIU, Spring 2026.
            </p>
          </div>
          <FooterCol title="For students" links={[
            ['Find jobs', '/jobs'],
            ['Internships', '/jobs?type=internship'],
            ['Recommended for me', '/jobs/recommended'],
            ['AI skill scan', '/profile'],
          ]} />
          <FooterCol title="For employers" links={[
            ['Post a role', '/register?role=recruiter'],
            ['Recruiter login', '/login'],
            ['Book a demo', 'mailto:hello@giu-nexus.eg'],
          ]} />
          <FooterCol title="The project" links={[
            ['Our manifesto', '#manifesto'],
            ['How it works', '#how'],
            ['Open source', 'https://github.com/mostafaabuelabbas-wq/GIU-Nexus'],
            ['hello@giu-nexus.eg', 'mailto:hello@giu-nexus.eg'],
          ]} />
        </div>

        {/* Mega wordmark */}
        <h1 className="font-['Space_Grotesk'] font-bold leading-[0.85] tracking-[-0.06em] m-0 -mx-1 text-[clamp(100px,14vw,220px)]">
          <span className="font-['Cairo'] font-black text-[#2F4A2E] tracking-[-0.02em]">نِكسَس</span>
          ·NEXUS
          <span className="italic font-medium text-[#EE5688]">.</span>
        </h1>

        {/* Legal */}
        <div className="flex flex-wrap gap-4 items-center font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.08em] text-[#3B342B] mt-8">
          <span>© 2026 GIU Nexus · German International University, New Cairo</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span className="ml-auto font-['Cairo'] normal-case tracking-normal text-sm">صُنع في القاهرة 🇪🇬</span>
        </div>
      </div>
    </footer>
  )
}
