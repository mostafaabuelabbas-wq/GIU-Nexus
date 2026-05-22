import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Reusable column ───────────────────────────────────────────────
function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#E5A93A] mb-5 font-semibold m-0">
        // {title}
      </h4>
      <ul className="list-none p-0 m-0 flex flex-col gap-3">
        {links.map(({ label, href, external }) => {
          const cls = "text-[15px] no-underline text-[#F1EAD9]/85 hover:text-[#EE5688] transition-colors"
          const isExternal = external || href.startsWith('http') || href.startsWith('mailto:')
          return (
            <li key={label}>
              {isExternal
                ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={cls}>{label}</a>
                : <Link to={href} className={cls}>{label}</Link>
              }
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function Footer() {
  const { user } = useAuth()
  const isRecruiter = user?.role === 'recruiter'
  const isJobSeeker = user?.role === 'jobSeeker'

  const studentLinks = [
    { label: 'Browse jobs',         href: '/jobs' },
    { label: 'Recommended for me',  href: isJobSeeker ? '/jobs/recommended' : '/login' },
    { label: 'Saved roles',         href: isJobSeeker ? '/jobs/saved' : '/login' },
    { label: 'My applications',     href: isJobSeeker ? '/applications/my' : '/login' },
  ]

  const employerLinks = [
    { label: 'Post a role', href: isRecruiter ? '/recruiter/jobs/create' : '/register?role=recruiter' },
    { label: 'Dashboard',   href: isRecruiter ? '/recruiter/dashboard' : '/login' },
  ]

  const projectLinks = [
    { label: 'How it works',  href: '/#how-it-works' },
    { label: 'Manifesto',     href: '/#manifesto' },
    { label: 'Open source',   href: 'https://github.com/mostafaabuelabbas-wq/GIU-Nexus' },
    { label: 'hello@giu-nexus.eg', href: 'mailto:hello@giu-nexus.eg' },
  ]

  return (
    <footer className="bg-[#1B2F1A] text-[#F1EAD9] mt-24">
      <div className="max-w-[1360px] mx-auto px-10 pt-20 pb-10">

        {/* ── Top: brand block + 3 columns ── */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14 ${(isRecruiter || isJobSeeker) ? 'lg:grid-cols-[1.5fr_1fr_1fr]' : 'lg:grid-cols-[1.5fr_1fr_1fr_1fr]'}`}>

          {/* Brand block — compact, professional */}
          <div className="min-w-0 max-w-[360px]">
            <Link to="/" className="inline-flex items-center no-underline">
              <span className="font-['Space_Grotesk'] font-bold text-[32px] tracking-tight leading-none">
                <span className="text-[#F1EAD9]">giu</span>
                <span className="text-[#F1EAD9]/40 mx-0.5">/</span>
                <span className="text-[#E5A93A]">nexus</span>
                <span className="text-[#EE5688]">.</span>
              </span>
            </Link>

            <p className="mt-6 text-[15px] text-[#F1EAD9]/80 leading-[1.6]">
              Built by GIU students, for GIU students.{' '}
              <span className="font-serif italic text-[#E5A93A]">Made by us. Made for us.</span>
            </p>

            <p className="mt-4 text-[14px] text-[#F1EAD9]/60 leading-relaxed">
              A career platform{' '}
              <span className="font-['Cairo'] font-bold text-[#F1EAD9]/85" lang="ar">من الطلبة، للطلبة</span>
              {' '}— built in New Cairo at GIU, Spring 2026.
            </p>
          </div>

          {!isRecruiter && <FooterCol title="For jobseekers" links={studentLinks} />}
          {!isJobSeeker  && <FooterCol title="For employers"  links={employerLinks} />}
          <FooterCol title="The project" links={projectLinks} />
        </div>

        {/* ── Bottom row ── */}
        <div className="flex flex-wrap items-center gap-4 mt-16 pt-6 border-t border-[#F1EAD9]/15">
          <p className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.1em] text-[#F1EAD9]/55 m-0">
            © 2026 GIU Nexus · A Software Engineering capstone
          </p>
          <a href="#privacy" className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.1em] text-[#F1EAD9]/55 hover:text-[#E5A93A] transition-colors no-underline">Privacy</a>
          <a href="#terms" className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.1em] text-[#F1EAD9]/55 hover:text-[#E5A93A] transition-colors no-underline">Terms</a>
          <div className="ml-auto flex items-center gap-3">
            <span className="font-['Cairo'] text-[15px] text-[#E5A93A]" lang="ar">صنع في القاهرة</span>
            <span className="text-[#F1EAD9]/35">·</span>
            <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.1em] text-[#EE5688]">Made in Cairo</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
