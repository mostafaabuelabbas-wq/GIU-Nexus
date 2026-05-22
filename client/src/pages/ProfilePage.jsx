import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'

// ── helpers ──────────────────────────────────────────────────────────────────
const PALETTE     = ['#2F4A2E', '#EE5688', '#E96A3A', '#E5A93A']
const avatarColor = (name = '') => PALETTE[name.charCodeAt(0) % PALETTE.length]
const RING_R      = 36
const RING_CIRC   = 2 * Math.PI * RING_R   // ≈ 226.2

function calcCompletion(profile) {
  if (!profile) return 0
  let s = 40                                          // base: name + email always present
  if (profile.bio?.trim())        s += 25
  if (profile.profilePicture)     s += 20
  if (profile.skills?.length > 0) s += 15
  return s
}

function timeAgo(date) {
  if (!date) return '—'
  const d = Math.floor((Date.now() - new Date(date)) / 1000)
  if (d < 3600)    return `${Math.floor(d / 60)}m ago`
  if (d < 86400)   return `${Math.floor(d / 3600)}h ago`
  if (d < 604800)  return `${Math.floor(d / 86400)}d ago`
  if (d < 2592000) return `${Math.floor(d / 604800)}w ago`
  return `${Math.floor(d / 2592000)}mo ago`
}

const STATUS_STYLES = {
  shortlisted: { bg: 'rgba(47,74,46,.14)',    color: '#2F4A2E' },
  pending:     { bg: 'rgba(229,169,58,.2)',   color: '#7A6210' },
  rejected:    { bg: 'rgba(233,106,58,.15)',  color: '#8A3A10' },
  reviewed:    { bg: 'rgba(233,106,58,.12)',  color: '#8A3A10' },
}
const statusStyle = s => STATUS_STYLES[s] ?? { bg: 'rgba(59,52,43,.1)', color: '#3B342B' }

// ── count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target, duration = 900, delay = 0) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!target) return
    const t = setTimeout(() => {
      const start = performance.now()
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1)
        setValue(Math.round(p * target))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(t)
  }, [target, duration, delay])
  return value
}

// ── chip pop keyframe (injected once) ─────────────────────────────────────────
const CHIP_STYLE = `@keyframes chipPop{from{opacity:0;transform:scale(.7) rotate(-3deg)}to{opacity:1;transform:scale(1) rotate(0)}}`

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useAuth()
  const [profile,      setProfile]      = useState(null)
  const [apps,         setApps]         = useState([])
  const [appTotal,     setAppTotal]     = useState(0)
  const [shortlisted,  setShortlisted]  = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [extracting,   setExtracting]   = useState(false)
  const [extractError, setExtractError] = useState('')
  const [ringReady,    setRingReady]    = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.get('/profile'),
      api.get('/applications/my').catch(() => ({ data: { applications: [] } })),
    ]).then(([pRes, aRes]) => {
      if (cancelled) return
      setProfile(pRes.data.user || pRes.data)
      const list = Array.isArray(aRes.data.applications ?? aRes.data) ? (aRes.data.applications ?? aRes.data) : []
      setAppTotal(list.length)
      setShortlisted(list.filter(a => a.status === 'shortlisted').length)
      setApps(list.slice(0, 3))
      setLoading(false)
    }).catch(err => {
      if (!cancelled) { setError(err.response?.data?.message || 'Failed to load profile.'); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [])

  // Delay ring animation so CSS transition is visible
  useEffect(() => {
    if (!profile) return
    const t = setTimeout(() => setRingReady(true), 300)
    return () => clearTimeout(t)
  }, [profile])

  const handleExtract = async () => {
    setExtracting(true); setExtractError('')
    try {
      const { data } = await api.post('/profile/extract-skills')
      setProfile(p => ({ ...p, skills: data.skills ?? [] }))
    } catch (err) {
      setExtractError(err.response?.data?.message || 'Extraction failed.')
    } finally { setExtracting(false) }
  }

  const name       = profile?.name || user?.name || ''
  const initial    = name[0]?.toUpperCase() || '?'
  const completion = calcCompletion(profile)
  const skillCount = profile?.skills?.length ?? 0
  const ringOffset = ringReady ? RING_CIRC * (1 - completion / 100) : RING_CIRC

  const animSkills      = useCountUp(skillCount,  800, 250)
  const animApps        = useCountUp(appTotal,    600, 350)
  const animShortlisted = useCountUp(shortlisted, 700, 450)

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 py-8 flex flex-col gap-[18px]">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-[28px] p-10 text-center"
            style={{ background: '#FDE9DC', border: '1px solid rgba(233,106,58,.3)' }}>
            <p className="font-['Space_Grotesk'] font-bold text-xl mb-4" style={{ color: '#7A3E1C' }}>{error}</p>
            <button onClick={() => window.location.reload()}
              className="font-['Space_Grotesk'] font-bold px-6 py-3 rounded-full transition-colors"
              style={{ background: '#2F4A2E', color: '#F1EAD9' }}>
              Try again →
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && profile && (
          <>
            <HeroCard
              profile={profile}
              name={name}
              initial={initial}
              completion={completion}
              ringOffset={ringOffset}
              animSkills={animSkills}
              animApps={animApps}
              animShortlisted={animShortlisted}
            />
            <BioCard profile={profile} />
            <SkillsCard
              profile={profile}
              skillCount={skillCount}
              extracting={extracting}
              extractError={extractError}
              onExtract={handleExtract}
            />
            {apps.length > 0 && <ActivityCard apps={apps} />}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO CARD
// ─────────────────────────────────────────────────────────────────────────────
function HeroCard({ profile, name, initial, completion, ringOffset, animSkills, animApps, animShortlisted }) {
  const nameParts = name.trim().split(/\s+/)
  const firstName = nameParts[0] || ''
  const lastName  = nameParts.slice(1).join(' ')

  return (
    <div className="rounded-[28px] overflow-hidden relative" style={{ background: '#2F4A2E' }}>

      {/* noise texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
      }} />

      {/* decorative arabic deco */}
      <span className="absolute right-7 top-4 select-none pointer-events-none font-['Cairo'] font-black leading-none"
        style={{ fontSize: 180, color: 'rgba(241,234,217,.04)' }} aria-hidden="true">
        ٩٤
      </span>

      {/* top area */}
      <div className="relative z-10 p-9 pb-0 grid grid-cols-[1fr_auto] gap-7 items-start">

        {/* left: tags → name → email → actions */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[.12em] px-3 py-[5px] rounded-full"
              style={{ border: '1.5px solid rgba(241,234,217,.25)', color: 'rgba(241,234,217,.65)' }}>
              // Jobseeker · جامعة GIU
            </span>
            <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[.12em] flex items-center gap-1.5 px-3 py-[5px] rounded-full"
              style={{ background: 'rgba(126,200,123,.18)', color: '#9DDEA1', border: '1.5px solid rgba(126,200,123,.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#9DDEA1] animate-pulse" />
              Open to work
            </span>
          </div>

          <h1 className="font-['Space_Grotesk'] font-bold text-[#F1EAD9] leading-[.92] tracking-[-0.04em]"
            style={{ fontSize: 'clamp(44px, 8vw, 78px)' }}>
            {firstName}{lastName && <><br />{lastName}</>}
          </h1>

          <p className="mt-2.5 text-[13.5px] tracking-[-0.01em]"
            style={{ color: 'rgba(241,234,217,.45)' }}>
            {profile.email}
          </p>

          {/* action pills */}
          <div className="flex gap-2 flex-wrap mt-4">
            <Link to="/profile/edit"
              className="font-['Space_Grotesk'] font-semibold text-[13px] px-[18px] py-2 rounded-full no-underline transition-colors"
              style={{ background: 'rgba(241,234,217,.13)', color: 'rgba(241,234,217,.9)', border: '1.5px solid transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(241,234,217,.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(241,234,217,.13)'}>
              Edit profile →
            </Link>
            <Link to="/profile/change-password"
              className="font-['Space_Grotesk'] font-semibold text-[13px] px-[18px] py-2 rounded-full no-underline transition-colors"
              style={{ border: '1.5px solid rgba(241,234,217,.28)', color: 'rgba(241,234,217,.75)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(241,234,217,.7)'; e.currentTarget.style.color = '#F1EAD9' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(241,234,217,.28)'; e.currentTarget.style.color = 'rgba(241,234,217,.75)' }}>
              Change password
            </Link>
          </div>
        </div>

        {/* right: avatar + ring */}
        <div className="relative flex-shrink-0">
          <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden="true">
            <circle cx="56" cy="56" r={RING_R} fill="none"
              stroke="rgba(241,234,217,.12)" strokeWidth="4.5" />
            <circle cx="56" cy="56" r={RING_R} fill="none"
              stroke="#E5A93A" strokeWidth="4.5" strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={ringOffset}
              transform={`rotate(-90 56 56)`}
              style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(.34,1.3,.64,1) 0.5s' }}
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82px] h-[82px] rounded-[18px] flex items-center justify-center font-['Space_Grotesk'] font-bold text-[34px] overflow-hidden"
            style={{ background: avatarColor(name), color: '#F1EAD9' }}>
            {profile.profilePicture
              ? <img src={profile.profilePicture} alt={name} className="w-full h-full object-cover" />
              : initial}
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap font-['JetBrains_Mono'] font-medium text-[10px] uppercase tracking-[.08em] px-2.5 py-[3px] rounded-full"
            style={{ background: '#E5A93A', color: '#2F4A2E' }}>
            {completion}% done
          </div>
        </div>
      </div>

      {/* stats strip */}
      <div className="relative z-10 grid grid-cols-4 mt-8"
        style={{ borderTop: '1.5px solid rgba(241,234,217,.1)' }}>

        {[
          { val: animSkills,      label: 'Skills detected', color: '#EE5688' },
          { val: animApps,        label: 'Applications',    color: '#F1EAD9' },
          { val: animShortlisted, label: 'Shortlisted',     color: '#E5A93A' },
        ].map((s, i) => (
          <div key={i} className="px-6 py-5"
            style={{ borderRight: '1.5px solid rgba(241,234,217,.1)' }}>
            <div className="font-['Space_Grotesk'] font-bold text-[32px] leading-none tracking-[-0.04em]"
              style={{ color: s.color }}>
              {s.val}
            </div>
            <div className="font-['JetBrains_Mono'] text-[9.5px] uppercase tracking-[.1em] mt-1"
              style={{ color: 'rgba(241,234,217,.35)' }}>
              {s.label}
            </div>
          </div>
        ))}

        {/* completion bar */}
        <div className="px-6 py-5">
          <div className="font-['JetBrains_Mono'] text-[9.5px] uppercase tracking-[.1em] mb-2.5"
            style={{ color: 'rgba(241,234,217,.35)' }}>
            Profile complete
          </div>
          <div className="h-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(241,234,217,.15)' }}>
            <div className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #EE5688, #E5A93A)',
                width: `${completion}%`,
                transition: 'width 1.3s cubic-bezier(.34,1.1,.64,1) .6s',
              }} />
          </div>
          <div className="font-['JetBrains_Mono'] text-[11px] mt-1.5"
            style={{ color: 'rgba(241,234,217,.45)' }}>
            {completion} / 100
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BIO CARD
// ─────────────────────────────────────────────────────────────────────────────
function BioCard({ profile }) {
  return (
    <div className="rounded-[24px] p-8 relative overflow-hidden flex flex-col"
      style={{ background: '#F5E8C0', border: '1.5px solid rgba(229,169,58,.2)' }}>

      {/* quote decoration */}
      <span className="absolute right-5 top-1 font-['Space_Grotesk'] font-bold leading-none select-none pointer-events-none"
        style={{ fontSize: 130, color: 'rgba(229,169,58,.12)' }} aria-hidden="true">
        "
      </span>

      <div className="relative z-10">
        <div className="flex items-baseline gap-2 mb-3">
          <h2 className="font-['Space_Grotesk'] font-bold text-[18px] m-0" style={{ color: '#2F4A2E' }}>About</h2>
          <span className="font-['Cairo'] text-[15px]" style={{ color: 'rgba(47,74,46,.35)' }} lang="ar">· عني</span>
        </div>

        {profile.bio ? (
          <p className="text-[15px] leading-[1.72] max-w-[68ch]"
            style={{ color: '#3B342B', textWrap: 'pretty' }}>
            {profile.bio}
          </p>
        ) : (
          <p className="text-[14px] italic" style={{ color: 'rgba(59,52,43,.6)' }}>
            No bio yet.{' '}
            <Link to="/profile/edit" className="not-italic font-semibold hover:underline no-underline"
              style={{ color: '#EE5688' }}>
              Add one →
            </Link>
          </p>
        )}
      </div>

      {/* meta chips */}
      {(profile.university || profile.major) && (
        <div className="flex gap-5 flex-wrap mt-5 pt-5 relative z-10"
          style={{ borderTop: '1.5px solid rgba(229,169,58,.22)' }}>
          {[
            profile.university && { dot: '#2F4A2E', label: profile.university },
            profile.major      && { dot: '#EE5688', label: profile.major },
          ].filter(Boolean).map(c => (
            <span key={c.label}
              className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[.09em]"
              style={{ color: '#5C5247' }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
              {c.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS CARD
// ─────────────────────────────────────────────────────────────────────────────
function SkillsCard({ profile, skillCount, extracting, extractError, onExtract }) {
  return (
    <div className="rounded-[24px] p-7"
      style={{ background: '#EDE4CE', border: '1.5px solid rgba(59,52,43,.08)' }}>
      <style>{CHIP_STYLE}</style>

      <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
        <div>
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <h2 className="font-['Space_Grotesk'] font-bold text-[18px] m-0" style={{ color: '#2F4A2E' }}>
              Your skills
            </h2>
            <span className="font-['Cairo'] text-[15px]" style={{ color: 'rgba(47,74,46,.35)' }} lang="ar">
              · خبراتك
            </span>
            {skillCount > 0 && (
              <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[.1em] px-2.5 py-1 rounded-full"
                style={{ background: '#2F4A2E', color: '#F1EAD9' }}>
                {skillCount}
              </span>
            )}
          </div>
          <p className="text-[13.5px]" style={{ color: '#5C5247' }}>
            AI-extracted from your bio · used to rank job matches.
          </p>
        </div>

        <button onClick={onExtract} disabled={extracting || !profile.bio}
          className="flex items-center gap-2 font-['Space_Grotesk'] font-semibold text-[13.5px] px-5 py-2.5 rounded-full border-none cursor-pointer flex-shrink-0 disabled:opacity-50 transition-colors"
          style={{ background: '#EE5688', color: '#F1EAD9' }}
          onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = '#e9437a' }}
          onMouseLeave={e => e.currentTarget.style.background = '#EE5688'}>
          {extracting ? (
            <><Spinner white size="sm" /> Extracting…</>
          ) : (
            <>
              <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-[.1em] px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(241,234,217,.25)' }}>
                AI
              </span>
              Extract from Bio
            </>
          )}
        </button>
      </div>

      {extractError && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center justify-between gap-3 flex-wrap"
          style={{ background: 'rgba(233,106,58,.1)', color: '#8A3A10' }}>
          <span>{extractError}</span>
          {(extractError.toLowerCase().includes('bio') || extractError.toLowerCase().includes('empty')) && (
            <Link to="/profile/edit"
              className="font-bold hover:underline whitespace-nowrap no-underline"
              style={{ color: '#E96A3A' }}>
              Update bio →
            </Link>
          )}
        </div>
      )}

      {profile.skills?.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill, i) => (
            <span key={skill}
              className="inline-flex items-center text-[13px] font-medium px-3.5 py-[7px] rounded-full"
              style={{
                background: 'rgba(47,74,46,.1)',
                color: '#2F4A2E',
                border: '1.5px solid rgba(47,74,46,.18)',
                animation: `chipPop .38s cubic-bezier(.34,1.56,.64,1) ${i * 0.05}s both`,
              }}>
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center rounded-[16px]"
          style={{ border: '2px dashed rgba(59,52,43,.1)' }}>
          <p className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[.1em] mb-2"
            style={{ color: 'rgba(59,52,43,.3)' }}>
            // no skills yet
          </p>
          <p className="text-[14px]" style={{ color: '#5C5247' }}>
            {profile.bio
              ? 'Click "Extract from Bio" to auto-detect your skills.'
              : (
                <>
                  <Link to="/profile/edit"
                    className="font-semibold hover:underline no-underline"
                    style={{ color: '#EE5688' }}>
                    Add a bio first
                  </Link>
                  , then extract your skills.
                </>
              )}
          </p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY CARD
// ─────────────────────────────────────────────────────────────────────────────
function ActivityCard({ apps }) {
  return (
    <div className="rounded-[24px] p-7"
      style={{ background: '#E5D9C0', border: '1.5px solid rgba(59,52,43,.07)' }}>

      <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <h2 className="font-['Space_Grotesk'] font-bold text-[18px] m-0" style={{ color: '#2F4A2E' }}>
              Recent activity
            </h2>
            <span className="font-['Cairo'] text-[15px]" style={{ color: 'rgba(47,74,46,.35)' }} lang="ar">
              · النشاط
            </span>
          </div>
          <p className="text-[13.5px]" style={{ color: '#5C5247' }}>
            Your latest applications and their status.
          </p>
        </div>
        <Link to="/applications/my"
          className="font-['Space_Grotesk'] font-semibold text-[13px] px-[18px] py-2 rounded-full no-underline transition-colors"
          style={{ color: '#2F4A2E', border: '1.5px solid rgba(47,74,46,.22)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#2F4A2E'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(47,74,46,.22)'}>
          View all →
        </Link>
      </div>

      <div className="flex flex-col gap-2.5">
        {apps.map((app, i) => {
          const co   = app.job?.company || 'Company'
          const role = app.job?.title   || 'Role'
          const st   = app.status       || 'pending'
          const ss   = statusStyle(st)
          return (
            <Link key={app._id || i} to={`/jobs/${app.job?._id}`}
              className="flex items-center gap-3.5 rounded-[14px] px-4 py-3.5 no-underline transition-all"
              style={{ background: '#F1EAD9', border: '1.5px solid rgba(59,52,43,.07)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '4px 0 0 0 #2F4A2E inset'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center font-['Space_Grotesk'] font-bold text-[15px] flex-shrink-0"
                style={{ background: avatarColor(co), color: '#F1EAD9' }}>
                {co.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-['Space_Grotesk'] font-semibold text-[15px] truncate"
                  style={{ color: '#2F4A2E' }}>
                  {role}
                </div>
                <div className="text-[13px] mt-0.5" style={{ color: '#5C5247' }}>{co}</div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="font-['JetBrains_Mono'] text-[9.5px] uppercase tracking-[.1em] px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: ss.bg, color: ss.color }}>
                  {st}
                </span>
                <span className="font-['JetBrains_Mono'] text-[9.5px] uppercase tracking-[.09em]"
                  style={{ color: 'rgba(59,52,43,.4)' }}>
                  // {timeAgo(app.updatedAt || app.createdAt)}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
