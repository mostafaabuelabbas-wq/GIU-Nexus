import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CategoryBadge from '../components/CategoryBadge'
import Spinner from '../components/Spinner'

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => { setStats(data); setLoading(false) })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load stats.')
        setLoading(false)
      })
  }, [])

  const usersByRole  = stats?.usersByRole  ?? {}
  const jobsByStatus = stats?.jobsByStatus ?? {}
  const appsByStatus = stats?.appsByStatus ?? {}
  const topJobs      = stats?.topJobs      ?? []
  const appsPerWeek  = stats?.applicationsPerWeek ?? []

  const totalUsers = Object.values(usersByRole).reduce((s, v)  => s + (v ?? 0), 0)
  const totalJobs  = Object.values(jobsByStatus).reduce((s, v) => s + (v ?? 0), 0)
  const totalApps  = Object.values(appsByStatus).reduce((s, v) => s + (v ?? 0), 0)
  const barMax     = Math.max(1, ...appsPerWeek.map(w => w.count ?? 0))

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="max-w-[1360px] w-full mx-auto px-10 pt-10 pb-6">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="font-['Space_Grotesk'] font-bold text-[48px] text-[#161310] leading-tight tracking-tight m-0">
            Admin overview.
          </h1>
          <span className="font-['Cairo'] font-black text-[40px] text-[#3B342B]/25">لوحة التحكم</span>
        </div>
        <p className="text-[#3B342B] text-[17px] mt-2">Platform health at a glance.</p>
      </div>

      <div className="flex-1 max-w-[1360px] w-full mx-auto px-10 pb-16">

        {loading && (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        )}

        {!loading && error && (
          <div className="text-center py-16">
            <h3 className="font-['Space_Grotesk'] font-bold text-xl text-[#161310] mb-2">Failed to load stats.</h3>
            <p className="text-[#3B342B] mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#161310] text-[#F1EAD9] font-bold px-6 py-3 rounded-full hover:bg-black transition-colors"
            >
              Try again →
            </button>
          </div>
        )}

        {!loading && !error && stats && (
          <div className="flex flex-col gap-6">

            {/* ── Hero stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label:'Total users',    value:totalUsers, sub:`${usersByRole.jobSeeker??0} students · ${usersByRole.recruiter??0} recruiters`, bg:'#161310', tc:'#F1EAD9', link:'/admin/users',      ar:'المستخدمون' },
                { label:'Total jobs',     value:totalJobs,  sub:`${jobsByStatus.open??0} open · ${jobsByStatus.closed??0} closed`,               bg:'#2F4A2E', tc:'#F1EAD9', link:'/admin/jobs',       ar:'الوظائف'    },
                { label:'Applications',   value:totalApps,  sub:`${appsByStatus.pending??0} pending`,                                            bg:'white',   tc:'#161310', link:null,                 ar:'الطلبات'    },
                { label:'Shortlisted',    value:appsByStatus.shortlisted??0, sub:`${appsByStatus.rejected??0} rejected`,                          bg:'white',   tc:'#161310', link:null,                 ar:'مختارون'    },
              ].map(card => (
                <div
                  key={card.label}
                  className="rounded-[24px] p-6 border border-[#16131010] flex flex-col justify-between min-h-[150px]"
                  style={{ background: card.bg }}
                >
                  <div>
                    <p
                      className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider"
                      style={{ color: card.bg === 'white' ? '#3B342B' : 'rgba(241,234,217,0.45)' }}
                    >
                      {card.label}
                    </p>
                    <div
                      className="font-['Space_Grotesk'] font-bold text-[52px] leading-none mt-1"
                      style={{ color: card.bg === 'white' ? '#161310' : card.tc }}
                    >
                      {card.value}
                    </div>
                    <p
                      className="font-['Cairo'] font-bold text-base mt-0.5"
                      style={{ color: card.bg === 'white' ? '#3B342B' : 'rgba(241,234,217,0.3)' }}
                      dir="rtl"
                    >
                      {card.ar}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(0,0,0,0.06)]">
                    <span
                      className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider"
                      style={{ color: card.bg === 'white' ? '#3B342B' : 'rgba(241,234,217,0.35)' }}
                    >
                      {card.sub}
                    </span>
                    {card.link && (
                      <Link
                        to={card.link}
                        className="font-['JetBrains_Mono'] text-[11px] no-underline hover:opacity-100 transition-opacity"
                        style={{ color: card.tc, opacity: 0.5 }}
                      >
                        →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Charts row ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Users by role */}
              <div className="bg-white rounded-[24px] p-6 border border-[#16131010]">
                <p className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/50 mb-5">
                  Users by role
                </p>
                <div className="flex flex-col gap-4">
                  {[
                    { k:'jobSeeker', l:'Students',   color:'#EE5688' },
                    { k:'recruiter', l:'Recruiters', color:'#E96A3A' },
                    { k:'admin',     l:'Admins',     color:'#161310' },
                  ].map(r => {
                    const count = usersByRole[r.k] ?? 0
                    const pct   = totalUsers > 0 ? Math.round(count / totalUsers * 100) : 0
                    return (
                      <div key={r.k}>
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span className="text-sm font-semibold text-[#161310]">{r.l}</span>
                          <span className="font-['Space_Grotesk'] font-bold text-lg text-[#161310]">{count}</span>
                        </div>
                        <div className="h-2 bg-[#F1EAD9] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: r.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Applications by status */}
              <div className="bg-white rounded-[24px] p-6 border border-[#16131010]">
                <p className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/50 mb-5">
                  Applications by status
                </p>
                <div className="flex flex-col gap-4">
                  {[
                    { k:'pending',     l:'Pending',     color:'#E5A93A' },
                    { k:'shortlisted', l:'Shortlisted', color:'#2A6FDB' },
                    { k:'rejected',    l:'Rejected',    color:'#DC2626' },
                  ].map(s => {
                    const count = appsByStatus[s.k] ?? 0
                    const pct   = totalApps > 0 ? Math.round(count / totalApps * 100) : 0
                    return (
                      <div key={s.k}>
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span className="text-sm font-semibold text-[#161310]">{s.l}</span>
                          <span className="font-['Space_Grotesk'] font-bold text-lg text-[#161310]">{count}</span>
                        </div>
                        <div className="h-2 bg-[#F1EAD9] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: s.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Applications per week bar chart */}
              <div className="bg-[#161310] rounded-[24px] p-6 border border-[#16131010]">
                <p className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-white/40 mb-5">
                  Apps per week
                </p>
                {appsPerWeek.length === 0 ? (
                  <p className="text-white/30 text-sm">No weekly data yet.</p>
                ) : (
                  <div className="flex items-end gap-1.5 h-28">
                    {appsPerWeek.slice(-10).map((w, i) => {
                      const h = barMax > 0 ? Math.max(6, Math.round((w.count / barMax) * 112)) : 6
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div
                            className="w-full rounded-t-lg bg-[#EE5688] transition-all group-hover:bg-[#E5A93A]"
                            style={{ height: h }}
                            title={`${w.count} apps`}
                          />
                          <span className="font-['JetBrains_Mono'] text-[8px] text-white/25">
                            {w.week ?? `W${i + 1}`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Top jobs leaderboard ── */}
            {topJobs.length > 0 && (
              <div className="bg-white rounded-[24px] p-6 border border-[#16131010]">
                <div className="flex items-center justify-between mb-6">
                  <p className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/50">
                    Top jobs · by applications
                  </p>
                  <Link
                    to="/admin/jobs"
                    className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#161310] hover:text-[#EE5688] transition-colors no-underline"
                  >
                    View all →
                  </Link>
                </div>
                <div className="flex flex-col gap-4">
                  {topJobs.map((job, i) => (
                    <div key={job._id ?? i} className="flex items-center gap-4">
                      <div className="font-['Space_Grotesk'] font-bold text-[28px] text-[#161310]/15 w-8 text-right flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-['Space_Grotesk'] font-semibold text-[15px] text-[#161310] truncate">
                          {job.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[#3B342B] text-xs">{job.company}</span>
                          {job.category && <CategoryBadge category={job.category} size="sm" />}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-['Space_Grotesk'] font-bold text-[24px] text-[#EE5688] leading-none">
                          {job.applicationCount ?? job.count ?? 0}
                        </div>
                        <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#3B342B]/40">
                          apps
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Quick-action cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label:'Pending recruiters', link:'/admin/recruiters', ar:'توثيق', color:'#E96A3A' },
                { label:'Manage users',       link:'/admin/users',      ar:'مستخدمون', color:'#EE5688' },
                { label:'Manage jobs',        link:'/admin/jobs',       ar:'وظائف', color:'#2F4A2E' },
                { label:'Browse platform',    link:'/jobs',             ar:'تصفح',  color:'#161310' },
              ].map(q => (
                <Link
                  key={q.label}
                  to={q.link}
                  className="bg-[#F7F1E3] border border-[#16131010] rounded-[20px] p-5 flex flex-col gap-2 hover:-translate-y-0.5 transition-transform no-underline"
                >
                  <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#3B342B]/50">
                    → {q.label}
                  </span>
                  <span
                    className="font-['Cairo'] font-bold text-xl leading-tight"
                    style={{ color: q.color }}
                    dir="rtl"
                  >
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