import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const cx = (...c) => c.filter(Boolean).join(' ')

// ── Three-dot brand logo ─────────────────────────────────────────────────
function BrandMark() {
  return (
    <span className="flex items-center gap-[5px] flex-shrink-0">
      <span className="w-[11px] h-[11px] rounded-full bg-[#2F4A2E]" />
      <span className="w-[11px] h-[11px] rounded-full bg-[#EE5688]" />
      <span className="w-[11px] h-[11px] rounded-full bg-[#E5A93A]" />
    </span>
  )
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const menuRef   = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollToSection = (id) => {
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  useEffect(() => {
    if (!menuOpen) return
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [menuOpen])

  const role      = user?.role
  const isPending = role === 'recruiter' && user?.status === 'pending'
  const initials  = (user?.name || '?').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = () => { setMenuOpen(false); logout(); navigate('/login') }

  // Nav link: plain text, active = dark green pill, hover = lift
  const linkCls = ({ isActive }) => cx(
    "nav-link font-['Space_Grotesk'] font-bold text-[16px] px-5 py-2.5 rounded-full no-underline inline-block",
    "transition-all duration-200 ease-out",
    isActive
      ? "bg-[#2F4A2E] text-[#F1EAD9] shadow-[0_4px_14px_-4px_rgba(47,74,46,0.4)] hover:-translate-y-0.5"
      : "text-[#161310] hover:bg-[#161310]/8 hover:-translate-y-0.5"
  )

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#F1EAD9]/95 backdrop-blur-md border-b border-[#16131025]">
        <nav className="max-w-[1480px] mx-auto px-8 py-6 flex items-center gap-6">

          {/* ── Brand ── */}
          <Link to="/" className="flex items-center gap-3 no-underline flex-shrink-0">
            <BrandMark />
            <span className="font-['Space_Grotesk'] font-bold text-[26px] tracking-tight text-[#161310] lowercase leading-none">giu nexus</span>
            <span className="hidden sm:inline font-['Cairo'] text-[19px] font-bold text-[#161310]/55 leading-none" lang="ar">جيو نكسس</span>
          </Link>

          {/* ── Nav links (centered) ── */}
          <ul className="flex items-center gap-2 list-none m-0 p-0 ml-6">
            {!isAuthenticated && (
              <>
                <li><NavLink to="/" end className={linkCls}>Home</NavLink></li>
                <li><NavLink to="/jobs" className={linkCls}>Jobs</NavLink></li>
                <li>
                  <button type="button" onClick={() => scrollToSection('manifesto')}
                    className="font-['Space_Grotesk'] font-bold text-[16px] px-5 py-2.5 rounded-full text-[#161310] hover:bg-[#161310]/8 hover:-translate-y-0.5 transition-all duration-200 ease-out bg-transparent border-0 cursor-pointer hidden md:block">
                    Manifesto
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('how-it-works')}
                    className="font-['Space_Grotesk'] font-bold text-[16px] px-5 py-2.5 rounded-full text-[#161310] hover:bg-[#161310]/8 hover:-translate-y-0.5 transition-all duration-200 ease-out bg-transparent border-0 cursor-pointer hidden md:block">
                    How it works
                  </button>
                </li>
              </>
            )}
            {role === 'jobSeeker' && (
              <>
                <li><NavLink to="/" end className={linkCls}>Home</NavLink></li>
                <li><NavLink to="/jobs" className={linkCls}>Jobs</NavLink></li>
                <li className="hidden md:block"><NavLink to="/jobs/recommended" className={linkCls}>Recommended</NavLink></li>
                <li className="hidden md:block"><NavLink to="/jobs/saved" className={linkCls}>Saved</NavLink></li>
                <li className="hidden lg:block"><NavLink to="/applications/my" className={linkCls}>Applications</NavLink></li>
              </>
            )}
            {role === 'recruiter' && (
              <>
                <li><NavLink to="/" end className={linkCls}>Home</NavLink></li>
                <li><NavLink to="/recruiter/dashboard" className={linkCls}>Dashboard</NavLink></li>
                {!isPending && <li><NavLink to="/recruiter/jobs/create" className={linkCls}>Post a role</NavLink></li>}
              </>
            )}
            {role === 'admin' && (
              <>
                <li><NavLink to="/admin/dashboard" className={linkCls}>Dashboard</NavLink></li>
                <li><NavLink to="/admin/users" className={linkCls}>Users</NavLink></li>
                <li><NavLink to="/admin/recruiters" className={linkCls}>Recruiters</NavLink></li>
                <li><NavLink to="/admin/jobs" className={linkCls}>Jobs</NavLink></li>
              </>
            )}
          </ul>

          <div className="flex-1" />

          {/* ── Right side ── */}
          <div className="flex items-center gap-3 flex-shrink-0" ref={menuRef}>
            {!isAuthenticated ? (
              <>
                <Link to="/login"
                  className="font-['Space_Grotesk'] font-semibold text-[15px] px-5 py-2.5 rounded-full text-[#161310] border-2 border-[#16131025] hover:border-[#161310] transition-colors no-underline">
                  Sign in
                </Link>
                <Link to="/register"
                  className="font-['Space_Grotesk'] font-semibold text-[15px] px-5 py-2.5 rounded-full bg-[#EE5688] text-white hover:bg-[#e9437a] transition-colors no-underline">
                  Join Nexus →
                </Link>
              </>
            ) : (
              <>
                {/* ── Bell (outlined circle) ── */}
                <button type="button" aria-label="Notifications"
                  className="relative w-11 h-11 rounded-full flex items-center justify-center text-[#161310] border-2 border-[#16131025] hover:border-[#161310] bg-transparent cursor-pointer transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"/>
                    <path d="M10 21a2 2 0 0 0 4 0"/>
                  </svg>
                  <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#EE5688]" />
                </button>

                {/* ── User pill (outlined oval) ── */}
                <div className="relative">
                  <button type="button" onClick={() => setMenuOpen(o => !o)}
                    className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border-2 border-[#16131025] hover:border-[#161310] bg-transparent cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#E5A93A] text-[#161310] font-['Space_Grotesk'] font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                      {initials}
                    </div>
                    <div className="hidden md:flex flex-col items-start leading-none gap-1">
                      <span className="font-['Space_Grotesk'] font-bold text-[14px] text-[#161310]">{user?.name}</span>
                      <span className="font-['JetBrains_Mono'] text-[9.5px] text-[#3B342B]/55 uppercase tracking-[0.1em]">// {role === 'jobSeeker' ? 'JOBSEEKER' : role?.toUpperCase()}</span>
                    </div>
                  </button>

                  {menuOpen && (
                    <div className="absolute top-[calc(100%+10px)] right-0 bg-white rounded-[18px] shadow-[0_24px_50px_-16px_rgba(0,0,0,0.22)] min-w-[200px] p-2 flex flex-col z-[70] border border-[#16131008]">
                      {role === 'jobSeeker' && <>
                        <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-[10px] text-sm text-[#161310] hover:bg-[#F1EAD9] transition-colors no-underline">My profile</Link>
                        <Link to="/profile/edit" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-[10px] text-sm text-[#161310] hover:bg-[#F1EAD9] transition-colors no-underline">Edit profile</Link>
                      </>}
                      {role === 'recruiter' && (
                        <Link to="/recruiter/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-[10px] text-sm text-[#161310] hover:bg-[#F1EAD9] transition-colors no-underline">My dashboard</Link>
                      )}
                      <Link to="/profile/change-password" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-[10px] text-sm text-[#161310] hover:bg-[#F1EAD9] transition-colors no-underline">Change password</Link>
                    </div>
                  )}
                </div>

                {/* ── Sign out (outlined pill) ── */}
                <button type="button" onClick={handleLogout}
                  className="font-['Space_Grotesk'] font-semibold text-[15px] px-5 py-2.5 rounded-full text-[#161310] border-2 border-[#16131025] hover:border-[#161310] bg-transparent cursor-pointer transition-colors">
                  Sign out
                </button>
              </>
            )}
          </div>

        </nav>
      </header>

      {/* Pending recruiter banner */}
      {isPending && (
        <div className="flex justify-center px-6 mt-1">
          <div className="max-w-[1280px] w-full bg-[#FDE9DC] text-[#7A3E1C] border border-[#E96A3A]/30 rounded-full px-5 py-3 text-sm flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#E96A3A] flex-shrink-0 shadow-[0_0_0_4px_rgba(233,106,58,0.25)] animate-pulse" />
            Your recruiter account is <strong className="text-[#161310]">pending admin approval</strong>. You can browse the platform, but you can't post jobs yet.
          </div>
        </div>
      )}
    </>
  )
}
