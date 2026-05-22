import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import { getCategoryColor } from '../utils/categoryColors'

export default function AdminDashboard() {
  const [stats,       setStats]       = useState(null)
  const [rawResponse, setRawResponse] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => { setRawResponse(data); setStats(data.stats || data) })
      .catch(err => setError(`${err.response?.status || ''} ${err.response?.data?.message || err.message || 'Failed to load stats.'}`))
      .finally(() => setLoading(false))
  }, [])

  const usersByRole  = stats?.usersByRole  ?? {}
  const jobsByStatus = stats?.jobsByStatus ?? {}
  const appsByStatus = stats?.appsByStatus ?? {}
  const topJobs      = stats?.topJobs      ?? []

  const totalUsers = Object.values(usersByRole).reduce((s, v) => s + (v || 0), 0)
  const totalJobs  = Object.values(jobsByStatus).reduce((s, v) => s + (v || 0), 0)
  const totalApps  = Object.values(appsByStatus).reduce((s, v) => s + (v || 0), 0)

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      {/* ── Paper header ── */}
      <div className="bg-[#F7F1E3] border-b border-[#16131010] relative overflow-hidden">
        <div className="absolute right-0 top-0 font-['Cairo'] font-black select-none pointer-events-none leading-none text-[#161310] opacity-[0.04]"
          style={{ fontSize: 'clamp(120px,16vw,240px)' }} aria-hidden="true">
          إدارة
        </div>
        <div className="max-w-[1360px] mx-auto px-10 py-10 relative z-10">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-['Space_Grotesk'] font-bold text-[#161310] leading-tight tracking-tight m-0"
              style={{ fontSize: 'clamp(32px,5vw,52px)' }}>
              Admin overview.
            </h1>
            <span className="font-['Cairo'] font-black text-[#3B342B]/20"
              style={{ fontSize: 'clamp(28px,4vw,44px)' }}>لوحة التحكم</span>
          </div>
          <p className="text-[#3B342B] text-[16px] mt-2">A live look at the platform.</p>
        </div>
      </div>

      <div className="flex-1 max-w-[1360px] w-full mx-auto px-10 pb-16 pt-8">

        {loading && <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>}

        {!loading && error && (
          <div className="text-center py-16">
            <h3 className="font-['Space_Grotesk'] font-bold text-xl text-[#161310] mb-2">Failed to load stats.</h3>
            <p className="text-[#3B342B] mb-4">{error}</p>
            <button onClick={() => window.location.reload()}
              className="bg-[#2F4A2E] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-[#243b23] transition-colors">
              Try again →
            </button>
          </div>
        )}

        {!loading && !error && stats && (
          <div className="flex flex-col gap-6">

            {/* ── Diagnostic banner ── */}
            {totalUsers + totalJobs + totalApps === 0 && (
              <div className="bg-[#FEF3C7] border border-[#E5A93A]/40 rounded-2xl p-5">
                <p className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#B45309] mb-2">
                  // diagnostic — totals are all 0
                </p>
                <p className="text-[#7A3E1C] text-sm mb-3">
                  The <code className="bg-[#EDE4D0] px-1.5 py-0.5 rounded">/admin/stats</code> endpoint replied with empty data.
                </p>
                <pre className="bg-[#EDE4D0] rounded-xl p-3 text-[12px] font-['JetBrains_Mono'] text-[#161310] overflow-auto max-h-64">
{JSON.stringify(rawResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* ── Four stat tiles ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatTile label="People"       arLabel="مستخدم"  value={totalUsers}                tone="ink"   hint={`${usersByRole.jobSeeker ?? 0} jobseekers · ${usersByRole.recruiter ?? 0} recruiters`} href="/admin/users" />
              <StatTile label="Jobs"         arLabel="وظائف"   value={totalJobs}                 tone="palm"  hint={`${jobsByStatus.open ?? 0} open · ${jobsByStatus.closed ?? 0} closed`}              href="/admin/jobs"  />
              <StatTile label="Applications" arLabel="طلبات"   value={totalApps}                 tone="beige" hint={`${appsByStatus.pending ?? 0} awaiting review`} />
              <StatTile label="Shortlisted"  arLabel="مختارون" value={appsByStatus.shortlisted ?? 0} tone="pink"  hint={`${appsByStatus.rejected ?? 0} rejected`} />
            </div>

            {/* ── Breakdown columns ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BreakdownCard title="Users by role" rows={[
                { k:'jobSeeker', l:'Jobseekers', color:'#EE5688', value: usersByRole.jobSeeker ?? 0, total: totalUsers },
                { k:'recruiter', l:'Recruiters', color:'#E96A3A', value: usersByRole.recruiter ?? 0, total: totalUsers },
                { k:'admin',     l:'Admins',     color:'#2F4A2E', value: usersByRole.admin     ?? 0, total: totalUsers },
              ]} />
              <BreakdownCard title="Applications by status" rows={[
                { k:'pending',     l:'Pending',     color:'#E5A93A', value: appsByStatus.pending     ?? 0, total: totalApps },
                { k:'shortlisted', l:'Shortlisted', color:'#2F4A2E', value: appsByStatus.shortlisted ?? 0, total: totalApps },
                { k:'rejected',    l:'Rejected',    color:'#DC2626', value: appsByStatus.rejected    ?? 0, total: totalApps },
              ]} />
            </div>

            {/* ── Top jobs leaderboard ── */}
            <div className="bg-[#EDE4D0] rounded-[28px] p-7 border border-[#16131012]">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <p className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/50 mb-1">
                    Top jobs by applications
                  </p>
                  <h3 className="font-['Space_Grotesk'] font-bold text-[22px] text-[#161310] m-0">
                    Where everyone's applying.
                  </h3>
                </div>
                <Link to="/admin/jobs"
                  className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#2F4A2E] hover:text-[#161310] transition-colors no-underline">
                  View all jobs →
                </Link>
              </div>

              {topJobs.length === 0 ? (
                <p className="text-[#3B342B]/50 text-sm py-6 text-center font-['JetBrains_Mono'] text-xs uppercase tracking-wider">
                  // no applications yet — leaderboard fills when students apply
                </p>
              ) : (
                <ol className="flex flex-col gap-4">
                  {topJobs.map((job, i) => (
                    <li key={job._id ?? i} className="flex items-center gap-4">
                      <span className="font-['Space_Grotesk'] font-bold text-[28px] text-[#161310]/12 w-8 text-right flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-['Space_Grotesk'] font-bold text-[15px] text-[#161310] truncate">{job.title}</div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[#3B342B] text-xs">{job.company}</span>
                          {job.category && (() => {
                            const { bg, text, dot } = getCategoryColor(job.category)
                            return (
                              <span className="inline-flex items-center gap-1.5 rounded-full font-['JetBrains_Mono'] font-bold px-2.5 py-0.5 text-[10px] uppercase tracking-wide border"
                                style={{ background: bg, color: text, borderColor: `${dot}40` }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />{job.category}
                              </span>
                            )
                          })()}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-['Space_Grotesk'] font-bold text-[24px] text-[#EE5688] leading-none">
                          {job.applicationCount ?? job.count ?? 0}
                        </div>
                        <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#3B342B]/40 mt-0.5">apps</div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* ── Quick actions ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label:'Pending recruiters', href:'/admin/recruiters', ar:'توثيق',    accent:'#E96A3A' },
                { label:'Manage users',       href:'/admin/users',      ar:'مستخدمون', accent:'#EE5688' },
                { label:'Manage jobs',        href:'/admin/jobs',       ar:'وظائف',    accent:'#2F4A2E' },
              ].map(q => (
                <Link key={q.label} to={q.href}
                  className="bg-[#EDE4D0] border border-[#16131012] rounded-[20px] p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-transform no-underline">
                  <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#3B342B]/50">
                    → {q.label}
                  </span>
                  <span dir="rtl" className="font-['Cairo'] font-bold text-xl leading-tight" style={{ color: q.accent }}>
                    {q.ar}
                  </span>
                </Link>
              ))}
            </div>

          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

function StatTile({ label, arLabel, value, tone, hint, href }) {
  const palette = {
    ink:   { bg:'#161310', fg:'#F1EAD9', sub:'rgba(241,234,217,0.45)' },
    palm:  { bg:'#2F4A2E', fg:'#F1EAD9', sub:'rgba(241,234,217,0.45)' },
    pink:  { bg:'#EE5688', fg:'#FFFFFF', sub:'rgba(255,255,255,0.65)' },
    beige: { bg:'#EDE4D0', fg:'#161310', sub:'rgba(59,52,43,0.45)'    },
  }[tone] || { bg:'#EDE4D0', fg:'#161310', sub:'rgba(59,52,43,0.45)' }

  const inner = (
    <div className="rounded-[24px] p-6 border border-[#16131012] flex flex-col justify-between min-h-[160px] h-full hover:-translate-y-0.5 transition-transform"
      style={{ background: palette.bg }}>
      <div className="flex items-center justify-between">
        <p className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider m-0" style={{ color: palette.sub }}>{label}</p>
        {href && <span className="font-['JetBrains_Mono'] text-[11px]" style={{ color: palette.fg }}>→</span>}
      </div>
      <div>
        <div className="font-['Space_Grotesk'] font-bold text-[52px] leading-none" style={{ color: palette.fg }}>{value}</div>
        <p className="font-['Cairo'] font-bold text-sm mt-1 m-0" style={{ color: palette.sub }} dir="rtl">{arLabel}</p>
      </div>
      <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider mt-3 m-0" style={{ color: palette.sub }}>{hint}</p>
    </div>
  )
  return href ? <Link to={href} className="no-underline">{inner}</Link> : inner
}

function BreakdownCard({ title, rows }) {
  return (
    <div className="bg-[#EDE4D0] rounded-[24px] p-7 border border-[#16131012]">
      <p className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/50 mb-5 m-0">{title}</p>
      <div className="flex flex-col gap-5">
        {rows.map(r => {
          const pct = r.total > 0 ? Math.round((r.value / r.total) * 100) : 0
          return (
            <div key={r.k}>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm font-semibold text-[#161310]">{r.l}</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-['Space_Grotesk'] font-bold text-xl text-[#161310]">{r.value}</span>
                  <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#3B342B]/40">{pct}%</span>
                </div>
              </div>
              <div className="h-2 bg-[#D8CEBA] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: r.color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
