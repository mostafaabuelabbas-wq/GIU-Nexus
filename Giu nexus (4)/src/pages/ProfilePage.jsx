import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SkillChip from '../components/SkillChip'
import Spinner from '../components/Spinner'

const PALETTE = ['#2F4A2E', '#EE5688', '#E96A3A', '#E5A93A']
const avatarColor = (name = '') => PALETTE[name.charCodeAt(0) % PALETTE.length]

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')

  useEffect(() => {
    let cancelled = false
    api.get('/profile')
      .then(({ data }) => { if (!cancelled) { setProfile(data); setLoading(false) } })
      .catch(err => { if (!cancelled) { setError(err.response?.data?.message || 'Failed to load profile.'); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  const handleExtract = async () => {
    setExtracting(true)
    setExtractError('')
    try {
      const { data } = await api.post('/profile/extract-skills')
      setProfile(p => ({ ...p, skills: data.skills ?? [] }))
    } catch (err) {
      setExtractError(err.response?.data?.message || 'Extraction failed.')
    } finally {
      setExtracting(false)
    }
  }

  const name = profile?.name || user?.name || ''
  const initial = name[0]?.toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">

        {loading && (
          <div className="flex items-center justify-center py-32"><Spinner size="lg" /></div>
        )}

        {error && !loading && (
          <div className="bg-[#FDE9DC] border border-[#E96A3A]/30 rounded-[28px] p-8 text-center">
            <p className="font-['Space_Grotesk'] font-bold text-xl text-[#7A3E1C] mb-4">{error}</p>
            <button onClick={() => window.location.reload()}
              className="bg-[#161310] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-black transition-colors">
              Try again →
            </button>
          </div>
        )}

        {!loading && !error && profile && (
          <div className="flex flex-col gap-6">

            {/* ── Profile header ── */}
            <div className="bg-white rounded-[32px] p-8 border border-[#16131010]">
              <div className="flex items-start gap-6 flex-wrap">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-['Space_Grotesk'] font-bold text-4xl flex-shrink-0 overflow-hidden"
                  style={{ background: avatarColor(name) }}>
                  {profile.profilePicture
                    ? <img src={profile.profilePicture} alt={name} className="w-full h-full object-cover" />
                    : initial}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-['Space_Grotesk'] font-bold text-[28px] text-[#161310] leading-tight">{profile.name}</h1>
                    <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider bg-[#F1EAD9] text-[#3B342B] px-3 py-1 rounded-full">
                      {profile.role === 'jobSeeker' ? 'Student' : profile.role}
                    </span>
                  </div>
                  <p className="text-[#3B342B] mt-1">{profile.email}</p>
                  {profile.bio ? (
                    <p className="mt-3 text-[#161310] text-[15px] leading-relaxed max-w-[56ch]">{profile.bio}</p>
                  ) : (
                    <p className="mt-3 text-[#3B342B]/50 text-sm italic">
                      No bio yet.{' '}
                      <Link to="/profile/edit" className="text-[#EE5688] not-italic hover:underline font-semibold no-underline">Add one →</Link>
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link to="/profile/edit"
                    className="bg-[#161310] text-[#F1EAD9] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-black transition-colors text-center no-underline">
                    Edit profile
                  </Link>
                  <Link to="/profile/change-password"
                    className="bg-[#F1EAD9] text-[#161310] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#E9E0CB] transition-colors text-center border border-[#16131015] no-underline">
                    Change password
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Skills section ── */}
            <div className="bg-white rounded-[32px] p-8 border border-[#16131010]">
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <h2 className="font-['Space_Grotesk'] font-bold text-[22px] text-[#161310] m-0">Your skills</h2>
                    <span className="font-['Cairo'] text-lg text-[#3B342B]/40">· خبراتك</span>
                  </div>
                  <p className="text-[#3B342B] text-sm">AI-extracted from your bio. Used to rank your job matches.</p>
                </div>

                <button onClick={handleExtract} disabled={extracting || !profile.bio}
                  className="flex items-center gap-2 bg-[#EE5688] text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#e9437a] transition-colors disabled:opacity-50 flex-shrink-0">
                  {extracting ? (
                    <><Spinner white size="sm" />Extracting…</>
                  ) : (
                    <>
                      <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">AI</span>
                      Extract Skills from Bio
                    </>
                  )}
                </button>
              </div>

              {extractError && (
                <div className="mb-4 p-3 bg-[#FDE9DC] border border-[#E96A3A]/25 rounded-xl text-sm text-[#7A3E1C] flex items-center justify-between gap-3 flex-wrap">
                  <span>{extractError}</span>
                  {(extractError.toLowerCase().includes('bio') || extractError.toLowerCase().includes('empty')) && (
                    <Link to="/profile/edit" className="font-bold text-[#E96A3A] hover:underline whitespace-nowrap no-underline">Update bio →</Link>
                  )}
                </div>
              )}

              {profile.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => <SkillChip key={skill} skill={skill} />)}
                </div>
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-[#16131015] rounded-2xl">
                  <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/35 mb-2">// no skills yet</p>
                  <p className="text-[#3B342B] text-sm leading-relaxed">
                    {profile.bio
                      ? 'Click "Extract Skills from Bio" to auto-detect your skills using AI.'
                      : <><Link to="/profile/edit" className="text-[#EE5688] hover:underline font-semibold no-underline">Add a bio first</Link>, then extract your skills.</>}
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
