import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'

const LIMIT  = 15
const unwrap = (d) => Array.isArray(d) ? d : d?.users ?? d?.data ?? d?.results ?? []

const PALETTE  = ['#2F4A2E','#EE5688','#E96A3A','#E5A93A','#5A3A6B','#2A6FDB']
const colorFor = (s = '') => { let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return PALETTE[h%PALETTE.length] }
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-EG',{day:'numeric',month:'short',year:'numeric'}) : '—'

const ROLE_OPTS   = [{v:'',l:'All roles'},{v:'jobSeeker',l:'Students'},{v:'recruiter',l:'Recruiters'},{v:'admin',l:'Admins'}]
const STATUS_OPTS = [{v:'',l:'All statuses'},{v:'approved',l:'Approved'},{v:'pending',l:'Pending'},{v:'rejected',l:'Rejected'}]
const STATUS_NEW  = [{v:'approved',l:'Approve'},{v:'pending',l:'Set pending'},{v:'rejected',l:'Reject'}]

const ROLE_BADGE = {
  jobSeeker: { bg:'#E8DAF5', text:'#6D28D9' },
  recruiter: { bg:'#FDE9DC', text:'#E96A3A' },
  admin:     { bg:'#161310', text:'#F1EAD9' },
}
const STATUS_CFG = {
  approved: { bg:'#DCEDDA', border:'rgba(47,74,46,0.25)',  dot:'#2F4A2E', text:'#2F4A2E' },
  pending:  { bg:'#FEF3C7', border:'rgba(180,83,9,0.2)',   dot:'#D97706', text:'#B45309' },
  rejected: { bg:'#FEE2E2', border:'rgba(185,28,28,0.2)',  dot:'#DC2626', text:'#B91C1C' },
}

const selectCls = 'bg-[#F1EAD9] border border-[#16131012] rounded-xl px-3 py-2.5 text-[#161310] text-sm focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 transition-all cursor-pointer'

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [users,        setUsers]        = useState([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [roleFilter,   setRoleFilter]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteId,     setDeleteId]     = useState(null)
  const [deleting,     setDeleting]     = useState(false)
  const [updating,     setUpdating]     = useState({})
  const [actionErrors, setActionErrors] = useState({})

  const load = useCallback(async (role, status, p) => {
    setLoading(true); setError('')
    try {
      const params = { page: p, limit: LIMIT }
      if (role)   params.role   = role
      if (status) params.status = status
      const { data } = await api.get('/users', { params })
      setUsers(unwrap(data))
      setTotal(data?.total ?? unwrap(data).length)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(roleFilter, statusFilter, page) }, [roleFilter, statusFilter, page, load])

  const visibleUsers = users.filter(u => u._id !== currentUser?._id)
  const visibleTotal = Math.max(0, total - (users.length - visibleUsers.length))
  const totalPages   = Math.max(1, Math.ceil(total / LIMIT))

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/users/${deleteId}`)
      setUsers(prev => prev.filter(u => u._id !== deleteId))
      setTotal(t => t - 1); setDeleteId(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.')
      setDeleteId(null)
    } finally { setDeleting(false) }
  }

  const handleStatusChange = async (userId, status) => {
    setUpdating(p => ({ ...p, [userId]: status }))
    setActionErrors(p => ({ ...p, [userId]: '' }))
    try {
      await api.patch(`/users/${userId}/status`, { status })
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, status } : u))
    } catch (err) {
      setActionErrors(p => ({ ...p, [userId]: err.response?.data?.message || 'Failed to update.' }))
    } finally { setUpdating(p => ({ ...p, [userId]: null })) }
  }

  const clearFilters = () => { setRoleFilter(''); setStatusFilter(''); setPage(1) }
  const hasFilters   = roleFilter || statusFilter

  return (
    <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
      <Navbar />

      {/* ── Paper header ── */}
      <div className="bg-[#F7F1E3] border-b border-[#16131010] relative overflow-hidden">
        <div className="absolute right-0 top-0 font-['Cairo'] font-black select-none pointer-events-none leading-none text-[#161310] opacity-[0.04]"
          style={{ fontSize: 'clamp(120px,16vw,240px)' }} aria-hidden="true">
          مستخدمون
        </div>
        <div className="max-w-[1360px] mx-auto px-10 py-10 relative z-10">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-['Space_Grotesk'] font-bold text-[#161310] leading-tight tracking-tight m-0"
              style={{ fontSize: 'clamp(32px,5vw,52px)' }}>
              All users.
            </h1>
            <span className="font-['Cairo'] font-black text-[#3B342B]/20" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>المستخدمون</span>
          </div>
          <p className="text-[#3B342B] text-[16px] mt-2">View, filter, and manage every account on the platform.</p>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="max-w-[1360px] w-full mx-auto px-10 pt-8 mb-6">
        <div className="flex gap-3 flex-wrap items-center">
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} className={selectCls}>
            {ROLE_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className={selectCls}>
            {STATUS_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters}
              className="text-sm text-[#3B342B]/50 hover:text-[#161310] transition-colors px-2">
              Clear filters
            </button>
          )}
          {!loading && (
            <span className="ml-auto font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40">
              {visibleTotal} user{visibleTotal !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-[1360px] w-full mx-auto px-10 pb-16">

        {error && (
          <div className="mb-4 p-4 bg-[#FEE2E2] border border-red-200 rounded-2xl text-red-700 text-sm flex items-center justify-between gap-3">
            <span>{error}</span>
            <button onClick={() => load(roleFilter, statusFilter, page)} className="font-bold underline flex-shrink-0">Retry</button>
          </div>
        )}

        {loading && <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>}

        {!loading && !error && visibleUsers.length === 0 && (
          <div className="text-center py-20 max-w-sm mx-auto">
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40 block mb-3">// no users</span>
            <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">No users found.</h3>
            {hasFilters && <button onClick={clearFilters} className="text-[#EE5688] font-semibold hover:underline">Clear filters →</button>}
          </div>
        )}

        {!loading && !error && visibleUsers.length > 0 && (
          <>
            <div className="flex flex-col gap-3">
              {visibleUsers.map(u => {
                const roleCfg   = ROLE_BADGE[u.role]
                const statusCfg = STATUS_CFG[u.status]
                return (
                  <article key={u._id}
                    className="bg-[#EDE4D0] rounded-[20px] px-5 py-4 border border-[#2F4A2E]/15 flex items-center gap-4 flex-wrap hover:border-[#2F4A2E]/30 transition-colors">

                    {/* avatar */}
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-['Space_Grotesk'] font-bold text-base flex-shrink-0"
                      style={{ background: colorFor(u.name) }}>
                      {(u.name || '?')[0].toUpperCase()}
                    </div>

                    {/* info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-['Space_Grotesk'] font-bold text-[15px] text-[#161310]">{u.name}</h3>
                        {roleCfg && (
                          <span className="font-['JetBrains_Mono'] text-[10px] px-2.5 py-0.5 rounded-full capitalize font-bold uppercase tracking-wide"
                            style={{ background: roleCfg.bg, color: roleCfg.text }}>
                            {u.role === 'jobSeeker' ? 'jobseeker' : u.role}
                          </span>
                        )}
                        {statusCfg && (
                          <span className="inline-flex items-center gap-1 font-['JetBrains_Mono'] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wide border"
                            style={{ background: statusCfg.bg, color: statusCfg.text, borderColor: statusCfg.border }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.dot }} />
                            {u.status}
                          </span>
                        )}
                      </div>
                      <p className="text-[#3B342B] text-sm">{u.email}</p>
                      <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#3B342B]/35 mt-0.5">
                        Joined {fmtDate(u.createdAt)}
                      </p>
                      {actionErrors[u._id] && <p className="text-sm text-red-600 mt-1">{actionErrors[u._id]}</p>}
                    </div>

                    {/* actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      {u.role === 'recruiter' && (
                        <>
                          <select value="" onChange={e => e.target.value && handleStatusChange(u._id, e.target.value)}
                            disabled={!!updating[u._id]}
                            className="bg-[#E9E0CB] border border-[#16131012] rounded-full px-3 py-2 text-sm font-semibold text-[#161310] focus:outline-none focus:ring-2 focus:ring-[#EE5688]/15 disabled:opacity-50 cursor-pointer">
                            <option value="">Change status…</option>
                            {STATUS_NEW.filter(s => s.v !== u.status).map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
                          </select>
                          {updating[u._id] && <Spinner size="sm" />}
                        </>
                      )}
                      <button onClick={() => setDeleteId(u._id)}
                        className="bg-[#FEE2E2] text-[#DC2626] font-bold text-xs px-4 py-2 rounded-full hover:bg-[#FECACA] transition-colors border-0 cursor-pointer">
                        Delete
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-10 h-10 rounded-full bg-[#EDE4D0] border border-[#16131012] flex items-center justify-center hover:bg-[#D8CEBA] transition-colors disabled:opacity-30">←</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${page === p ? 'bg-[#2F4A2E] text-[#F1EAD9]' : 'bg-[#EDE4D0] border border-[#16131012] text-[#161310] hover:bg-[#D8CEBA]'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-10 h-10 rounded-full bg-[#EDE4D0] border border-[#16131012] flex items-center justify-center hover:bg-[#D8CEBA] transition-colors disabled:opacity-30">→</button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={!!deleteId} title="Delete this user?"
        message="This will permanently delete the account, all their applications, and any jobs they posted. This cannot be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete account'}
        danger loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)} />

      <Footer />
    </div>
  )
}
