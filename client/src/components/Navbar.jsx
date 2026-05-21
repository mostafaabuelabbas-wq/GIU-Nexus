import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const cx = (...c) => c.filter(Boolean).join(' ')

function BrandMark() {
  return (
    <div className="w-[30px] h-[30px] rounded-[9px] bg-[#161310] relative flex-shrink-0">
      <div className="absolute left-[7px] top-[7px] w-[6px] h-[16px] bg-[#F1EAD9] rounded-sm -rotate-[12deg]" />
      <div className="absolute right-[7px] top-[7px] w-[6px] h-[16px] bg-[#EE5688] rounded-sm rotate-[12deg]" />
    </div>
  )
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const menuRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const scrollToSection = (id) => {
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [menuOpen])

  const role = user?.role
  const isPending = role === 'recruiter' && user?.status === 'pending'

  const handleLogout = () => { setMenuOpen(false); logout(); navigate('/login') }

  const linkClass = ({ isActive }) =>
    cx('text-[#161310] font-medium text-[15px] px-3.5 py-2.5 rounded-full transition-colors cursor-pointer no-underline',
      isActive ? 'bg-[#161310] !text-[#F1EAD9]' : 'hover:bg-[#F1EAD9]')

  return (
    <>
      <div className="sticky top-[32px] z-50 flex justify-center px-6 mt-[32px]">
        <nav className={cx(
          'flex items-center gap-2 rounded-full py-2 pl-[22px] pr-2 w-full max-w-[1280px] transition-all',
          'bg-white shadow-[0_1px_0_rgba(0,0,0,0.03),0_12px_40px_-28px_rgba(0,0,0,0.25)]',
          scrolled && 'bg-white/90 backdrop-blur-[12px]'
        )}>
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 no-underline flex-shrink-0">
            <BrandMark />
            <span className="font-['Space_Grotesk'] font-bold text-[20px] tracking-tight text-[#161310]">GIU Nexus</span>
            <span className="hidden sm:inline font-['Cairo'] text-[17px] font-bold text-[#161310] opacity-80 translate-y-px">· نِكسَس</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-0.5 ml-4">
            {!isAuthenticated && (
              <>
                <NavLink to="/jobs" className={linkClass}>Find jobs</NavLink>
                <button type="button" onClick={() => scrollToSection('manifesto')} className="text-[#161310] font-medium text-[15px] px-3.5 py-2.5 rounded-full hover:bg-[#F1EAD9] transition-colors hidden md:block bg-transparent border-0 cursor-pointer">Manifesto</button>
                <button type="button" onClick={() => scrollToSection('how-it-works')} className="text-[#161310] font-medium text-[15px] px-3.5 py-2.5 rounded-full hover:bg-[#F1EAD9] transition-colors hidden md:block bg-transparent border-0 cursor-pointer">How it works</button>
              </>
            )}
            {role === 'jobSeeker' && (
              <>
                <NavLink to="/jobs" className={linkClass}>Find jobs</NavLink>
                <NavLink to="/jobs/recommended" className={({ isActive }) => cx(linkClass({ isActive }), 'hidden md:block')}>Recommended</NavLink>
                <NavLink to="/jobs/saved" className={({ isActive }) => cx(linkClass({ isActive }), 'hidden md:block')}>Saved</NavLink>
                <NavLink to="/applications/my" className={({ isActive }) => cx(linkClass({ isActive }), 'hidden lg:block')}>My applications</NavLink>
              </>
            )}
            {role === 'recruiter' && (
              <>
                <NavLink to="/recruiter/dashboard" className={linkClass}>Dashboard</NavLink>
                <NavLink to="/recruiter/jobs/create" className={linkClass}>Post a role</NavLink>
              </>
            )}
            {role === 'admin' && (
              <>
                <NavLink to="/admin/dashboard" className={linkClass}>Dashboard</NavLink>
                <NavLink to="/admin/users" className={linkClass}>Users</NavLink>
                <NavLink to="/admin/recruiters" className={linkClass}>Recruiters</NavLink>
                <NavLink to="/admin/jobs" className={linkClass}>Jobs</NavLink>
              </>
            )}
          </div>

          <div className="flex-1" />

          {/* Cairo flag */}
          <div className="hidden md:flex items-center gap-2 bg-[#F1EAD9] rounded-full px-3 py-1.5 text-sm font-medium text-[#161310] mr-2 flex-shrink-0">
            <div className="w-[18px] h-[18px] rounded-full flex-shrink-0"
              style={{ background: 'linear-gradient(180deg,#fff 0 33%,#161310 33% 66%,#E96A3A 66%)' }} />
            Cairo, EG
          </div>

          {/* Auth */}
          <div className="flex items-center gap-1.5 flex-shrink-0" ref={menuRef}>
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-[#161310] font-semibold text-[15px] px-5 py-3 rounded-full hover:bg-[#F1EAD9] transition-colors no-underline">Log in</Link>
                <Link to="/register" className="bg-[#161310] text-[#F1EAD9] font-semibold text-[15px] px-5 py-3 rounded-full hover:bg-black transition-colors no-underline">Sign up — it's free</Link>
              </>
            ) : (
              <div className="relative">
                <button type="button" onClick={() => setMenuOpen(o => !o)}
                  className="w-10 h-10 rounded-full bg-[#EE5688] text-white font-['Space_Grotesk'] font-bold text-base flex items-center justify-center hover:scale-105 transition-transform border-0 cursor-pointer">
                  {(user?.name || '?')[0].toUpperCase()}
                </button>
                {menuOpen && (
                  <div className="absolute top-[calc(100%+10px)] right-0 bg-white rounded-[18px] shadow-[0_24px_50px_-16px_rgba(0,0,0,0.2)] min-w-[220px] p-2 flex flex-col z-[70]">
                    <div className="px-3 py-2.5 border-b border-[#16131010] mb-1">
                      <div className="font-semibold text-sm text-[#161310]">{user?.name}</div>
                      <div className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B] mt-0.5">{role}</div>
                    </div>
                    {role === 'jobSeeker' && <>
                      <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-[10px] text-sm text-[#161310] hover:bg-[#F1EAD9] transition-colors no-underline">My profile</Link>
                      <Link to="/profile/edit" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-[10px] text-sm text-[#161310] hover:bg-[#F1EAD9] transition-colors no-underline">Edit profile</Link>
                    </>}
                    {role === 'recruiter' && <Link to="/recruiter/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-[10px] text-sm text-[#161310] hover:bg-[#F1EAD9] transition-colors no-underline">My dashboard</Link>}
                    <Link to="/profile/change-password" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-[10px] text-sm text-[#161310] hover:bg-[#F1EAD9] transition-colors no-underline">Change password</Link>
                    <button type="button" onClick={handleLogout} className="text-left px-3 py-2.5 rounded-[10px] text-sm text-[#161310] hover:bg-[#F1EAD9] transition-colors border-0 bg-transparent cursor-pointer font-inherit mt-1 border-t border-[#16131010] pt-2.5 w-full">Log out</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      {isPending && (
        <div className="flex justify-center px-6 mt-3">
          <div className="max-w-[1280px] w-full bg-[#FDE9DC] text-[#7A3E1C] border border-[#E96A3A]/30 rounded-full px-5 py-3 text-sm flex items-center gap-3" role="alert">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E96A3A] flex-shrink-0 shadow-[0_0_0_4px_rgba(233,106,58,0.25)] animate-pulse" />
            Your recruiter account is <strong className="text-[#161310]">pending admin approval</strong>. You can browse the platform, but you can't post jobs yet.
          </div>
        </div>
      )}
    </>
  )
}
