import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'

const LIMIT = 15
const unwrap = (data) =>
    Array.isArray(data) ? data : data?.users ?? data?.data ?? data?.results ?? []

const PALETTE = ['#2F4A2E', '#EE5688', '#E96A3A', '#E5A93A', '#5A3A6B', '#2A6FDB']
const colorFor = (s = '') => {
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
    return PALETTE[h % PALETTE.length]
}
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-EG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const ROLE_OPTS = [{ v: '', l: 'All roles' }, { v: 'jobSeeker', l: 'Students' }, { v: 'recruiter', l: 'Recruiters' }, { v: 'admin', l: 'Admins' }]
const STATUS_OPTS = [{ v: '', l: 'All statuses' }, { v: 'approved', l: 'Approved' }, { v: 'pending', l: 'Pending' }, { v: 'rejected', l: 'Rejected' }]
const STATUS_NEW = [{ v: 'approved', l: 'Approve' }, { v: 'pending', l: 'Set pending' }, { v: 'rejected', l: 'Reject' }]

const ROLE_BADGE = {
    jobSeeker: 'bg-[#EDE9FE] text-[#6D28D9]',
    recruiter: 'bg-[#FDE9DC] text-[#E96A3A]',
    admin: 'bg-[#161310] text-[#F1EAD9]',
}
const STATUS_BADGE = {
    approved: 'bg-[#DCFCE7] text-[#15803D]',
    pending: 'bg-[#FEF3C7] text-[#B45309]',
    rejected: 'bg-[#FEE2E2] text-[#B91C1C]',
}

const selectCls =
    'bg-white border border-[#16131010] rounded-xl px-3 py-2.5 text-[#161310] text-sm focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 transition-all'

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [deleteId, setDeleteId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [updating, setUpdating] = useState({}) // { [id]: 'active' | null }
    const [actionErrors, setActionErrors] = useState({})

    const load = useCallback(async (role, status, p) => {
        setLoading(true)
        setError('')
        try {
            const params = { page: p, limit: LIMIT }
            if (role) params.role = role
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

    // Hide the logged-in admin from their own user list — can't safely act on yourself.
    const visibleUsers = users.filter(u => u._id !== currentUser?._id)
    const visibleTotal = Math.max(0, total - (users.length - visibleUsers.length))
    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    /* Delete user */
    const handleDelete = async () => {
        setDeleting(true)
        try {
            await api.delete(`/users/${deleteId}`)
            setUsers(prev => prev.filter(u => u._id !== deleteId))
            setTotal(t => t - 1)
            setDeleteId(null)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user.')
            setDeleteId(null)
        } finally {
            setDeleting(false)
        }
    }

    /* Change user status */
    const handleStatusChange = async (userId, status) => {
        setUpdating(p => ({ ...p, [userId]: status }))
        setActionErrors(p => ({ ...p, [userId]: '' }))
        try {
            await api.patch(`/users/${userId}/status`, { status })
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, status } : u))
        } catch (err) {
            setActionErrors(p => ({ ...p, [userId]: err.response?.data?.message || 'Failed to update.' }))
        } finally {
            setUpdating(p => ({ ...p, [userId]: null }))
        }
    }

    const clearFilters = () => { setRoleFilter(''); setStatusFilter(''); setPage(1) }
    const hasFilters = roleFilter || statusFilter

    return (
        <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
            <Navbar />

            {/* Header */}
            <div className="max-w-[1360px] w-full mx-auto px-10 pt-10 pb-6">
                <div className="flex items-baseline gap-3 flex-wrap">
                    <h1 className="font-['Space_Grotesk'] font-bold text-[48px] text-[#161310] leading-tight tracking-tight m-0">
                        All users.
                    </h1>
                    <span className="font-['Cairo'] font-black text-[40px] text-[#3B342B]/25">المستخدمون</span>
                </div>
                <p className="text-[#3B342B] text-[17px] mt-2">
                    View, filter, and manage every account on the platform.
                </p>
            </div>

            {/* Filter bar */}
            <div className="max-w-[1360px] w-full mx-auto px-10 mb-6">
                <div className="flex gap-3 flex-wrap items-center">
                    <select
                        value={roleFilter}
                        onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
                        className={selectCls}
                    >
                        {ROLE_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                        className={selectCls}
                    >
                        {STATUS_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>

                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-[#3B342B]/50 hover:text-[#161310] transition-colors px-2"
                        >
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

                {/* Error */}
                {error && (
                    <div className="mb-4 p-4 bg-[#FEE2E2] border border-red-200 rounded-2xl text-red-700 text-sm flex items-center justify-between gap-3">
                        <span>{error}</span>
                        <button
                            onClick={() => load(roleFilter, statusFilter, page)}
                            className="font-bold underline flex-shrink-0"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Spinner size="lg" />
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && visibleUsers.length === 0 && (
                    <div className="text-center py-20 max-w-sm mx-auto">
                        <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40 mb-3">
              // no users
                        </p>
                        <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-2">
                            No users found.
                        </h3>
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-[#EE5688] font-semibold hover:underline"
                            >
                                Clear filters →
                            </button>
                        )}
                    </div>
                )}

                {/* User list */}
                {!loading && !error && visibleUsers.length > 0 && (
                    <>
                        <div className="flex flex-col gap-3">
                            {visibleUsers.map(u => (
                                <article
                                    key={u._id}
                                    className="bg-white rounded-[24px] p-5 border border-[#16131010] flex items-center gap-4 flex-wrap"
                                >
                                    {/* Avatar */}
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-['Space_Grotesk'] font-bold text-base flex-shrink-0"
                                        style={{ background: colorFor(u.name) }}
                                    >
                                        {(u.name || '?')[0].toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-['Space_Grotesk'] font-semibold text-[15px] text-[#161310]">
                                                {u.name}
                                            </h3>
                                            <span
                                                className={`font-['JetBrains_Mono'] text-[11px] px-2.5 py-0.5 rounded-full capitalize ${ROLE_BADGE[u.role] ?? 'bg-[#F3F4F6] text-[#6B7280]'
                                                    }`}
                                            >
                                                {u.role === 'jobSeeker' ? 'student' : u.role}
                                            </span>
                                            {u.status && STATUS_BADGE[u.status] && (
                                              <span
                                                className={`font-['JetBrains_Mono'] text-[11px] px-2.5 py-0.5 rounded-full capitalize ${STATUS_BADGE[u.status]}`}
                                              >
                                                {u.status}
                                              </span>
                                            )}
                                        </div>
                                        <p className="text-[#3B342B] text-sm mt-0.5">{u.email}</p>
                                        <p className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/40 mt-1">
                                            Joined {fmtDate(u.createdAt)}
                                        </p>
                                        {actionErrors[u._id] && (
                                            <p className="text-sm text-red-600 mt-1">{actionErrors[u._id]}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                                        {/* Status dropdown — only for recruiters */}
                                        {u.role === 'recruiter' && (
                                            <>
                                                <select
                                                    value=""
                                                    onChange={e => e.target.value && handleStatusChange(u._id, e.target.value)}
                                                    disabled={!!updating[u._id]}
                                                    className="bg-[#F1EAD9] border border-[#16131010] rounded-full px-3 py-2 text-sm font-semibold text-[#161310] focus:outline-none focus:ring-2 focus:ring-[#EE5688]/15 disabled:opacity-50 cursor-pointer"
                                                >
                                                    <option value="">Change status…</option>
                                                    {STATUS_NEW.filter(s => s.v !== u.status).map(s => (
                                                        <option key={s.v} value={s.v}>{s.l}</option>
                                                    ))}
                                                </select>
                                                {updating[u._id] && <Spinner size="sm" />}
                                            </>
                                        )}

                                        <button
                                            onClick={() => setDeleteId(u._id)}
                                            className="bg-[#FEE2E2] text-[#DC2626] font-bold text-xs px-4 py-2 rounded-full hover:bg-[#FECACA] transition-colors border-0 cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-10 h-10 rounded-full bg-white border border-[#16131010] flex items-center justify-center hover:bg-[#F1EAD9] transition-colors disabled:opacity-30"
                                >
                                    ←
                                </button>
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p} onClick={() => setPage(p)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${page === p
                                            ? 'bg-[#161310] text-[#F1EAD9]'
                                            : 'bg-white border border-[#16131010] text-[#161310] hover:bg-[#F1EAD9]'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="w-10 h-10 rounded-full bg-white border border-[#16131010] flex items-center justify-center hover:bg-[#F1EAD9] transition-colors disabled:opacity-30"
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete modal */}
            <Modal
                open={!!deleteId}
                title="Delete this user?"
                message="This will permanently delete the account, all their applications, and any jobs they posted. This cannot be undone."
                confirmLabel={deleting ? 'Deleting…' : 'Delete account'}
                danger
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />

            <Footer />
        </div>
    )
}