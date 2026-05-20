import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getCategoryColor } from '../utils/categoryColors'
import Modal from '../components/Modal'
import { JobCardSkeleton } from '../components/Skeleton'

const LIMIT = 12
const unwrap = (data) =>
    Array.isArray(data) ? data : data?.jobs ?? data?.data ?? data?.results ?? []

const TYPE_LABEL = { 'full-time': 'Full-time', 'part-time': 'Part-time', 'internship': 'Internship' }

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [keyword, setKeyword] = useState('')
    const [draftKw, setDraftKw] = useState('')
    const [deleteId, setDeleteId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState('')

    const [retryKey, setRetryKey] = useState(0)

    useEffect(() => {
        let active = true
        const params = { page, limit: LIMIT }
        if (keyword) params.keyword = keyword
        Promise.resolve()
            .then(() => { if (active) { setLoading(true); setError('') } })
            .then(() => api.get('/jobs', { params }))
            .then(({ data }) => {
                if (!active) return
                setJobs(unwrap(data))
                setTotal(data?.total ?? unwrap(data).length)
            })
            .catch(err => {
                if (!active) return
                setError(err.response?.data?.message || 'Failed to load jobs.')
            })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [keyword, page, retryKey])

    const totalPages = Math.max(1, Math.ceil(total / LIMIT))
    const handleSearch = (e) => { e.preventDefault(); setKeyword(draftKw); setPage(1) }
    const clearSearch = () => { setKeyword(''); setDraftKw(''); setPage(1) }

    const handleDelete = async () => {
        setDeleting(true)
        setDeleteError('')
        try {
            await api.delete(`/jobs/${deleteId}`)
            setJobs(prev => prev.filter(j => j._id !== deleteId))
            setTotal(t => t - 1)
            setDeleteId(null)
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Failed to delete job.')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F1EAD9] flex flex-col">
            <Navbar />

            {/* Header */}
            <div className="max-w-[1360px] w-full mx-auto px-10 pt-10 pb-6">
                <div className="flex items-baseline gap-3 flex-wrap">
                    <h1 className="font-['Space_Grotesk'] font-bold text-[48px] text-[#161310] leading-tight tracking-tight m-0">
                        All jobs.
                    </h1>
                    <span className="font-['Cairo'] font-black text-[40px] text-[#3B342B]/25">الوظائف</span>
                </div>
                <p className="text-[#3B342B] text-[17px] mt-2">
                    Search and delete any listing on the platform.
                </p>
            </div>

            {/* Search bar */}
            <div className="max-w-[1360px] w-full mx-auto px-10 mb-6">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input
                        value={draftKw}
                        onChange={e => setDraftKw(e.target.value)}
                        placeholder="Search by title, company, or location…"
                        className="flex-1 bg-white border border-[#16131010] rounded-xl px-4 py-3 text-[#161310] text-[15px] focus:outline-none focus:border-[#EE5688] focus:ring-2 focus:ring-[#EE5688]/15 transition-all placeholder-[#3B342B]/35"
                    />
                    <button
                        type="submit"
                        className="bg-[#161310] text-[#F1EAD9] font-bold text-sm px-6 py-3 rounded-xl hover:bg-black transition-colors"
                    >
                        Search →
                    </button>
                    {keyword && (
                        <button
                            type="button" onClick={clearSearch}
                            className="text-sm text-[#3B342B]/50 hover:text-[#161310] transition-colors px-2"
                        >
                            Clear
                        </button>
                    )}
                </form>
            </div>

            <div className="flex-1 max-w-[1360px] w-full mx-auto px-10 pb-16">

                {/* Fetch error */}
                {error && (
                    <div className="mb-4 p-4 bg-[#FEE2E2] border border-red-200 rounded-2xl text-red-700 text-sm">
                        {error}
                        <button onClick={() => setRetryKey(k => k + 1)} className="ml-3 font-bold underline">
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading skeletons */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && jobs.length === 0 && (
                    <div className="text-center py-20 max-w-sm mx-auto">
                        <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/40 mb-3">
              // no results
                        </p>
                        <h3 className="font-['Space_Grotesk'] font-bold text-2xl text-[#161310] mb-3">
                            No jobs found.
                        </h3>
                        {keyword && (
                            <button
                                onClick={clearSearch}
                                className="text-[#EE5688] font-semibold hover:underline"
                            >
                                Clear search →
                            </button>
                        )}
                    </div>
                )}

                {/* Job list */}
                {!loading && jobs.length > 0 && (
                    <>
                        <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B342B]/45 mb-5">
                            {total} job{total !== 1 ? 's' : ''} total
                        </p>

                        <div className="flex flex-col gap-3">
                            {jobs.map(job => (
                                <article
                                    key={job._id}
                                    className="bg-white rounded-[24px] p-5 border border-[#16131010] flex items-center gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-['Space_Grotesk'] font-bold text-[15px] text-[#161310] truncate">
                                                {job.title}
                                            </h3>
                                            <span
                                                className={`font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded-full capitalize ${job.status === 'open'
                                                    ? 'bg-[#DCFCE7] text-[#15803D]'
                                                    : 'bg-[#F3F4F6] text-[#6B7280]'
                                                    }`}
                                            >
                                                {job.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-[#3B342B] text-sm font-medium">{job.company}</span>
                                            <span className="text-[#3B342B]/40 text-xs">·</span>
                                            <span className="text-[#3B342B] text-xs">{job.location}</span>
                                            {job.type && (
                                                <>
                                                    <span className="text-[#3B342B]/40 text-xs">·</span>
                                                    <span className="text-[#3B342B] text-xs">{TYPE_LABEL[job.type] ?? job.type}</span>
                                                </>
                                            )}
                                            {job.category && (() => {
                                                const { bg, text, dot } = getCategoryColor(job.category); return (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full font-['JetBrains_Mono'] font-medium px-2.5 py-0.5 text-[11px]" style={{ background: bg, color: text }}>
                                                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />{job.category}
                                                    </span>
                                                )
                                            })()}
                                        </div>

                                        {(job.recruiter?.name || job.recruiter?.email) && (
                                            <p className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider text-[#3B342B]/40 mt-1">
                                                Posted by: {job.recruiter?.name ?? job.recruiter?.email}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => { setDeleteError(''); setDeleteId(job._id) }}
                                        className="flex-shrink-0 bg-[#FEE2E2] text-[#DC2626] font-bold text-xs px-4 py-2 rounded-full hover:bg-[#FECACA] transition-colors border-0 cursor-pointer"
                                    >
                                        Delete
                                    </button>
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

            {/* Delete confirmation modal */}
            <Modal
                open={!!deleteId}
                title="Delete this job?"
                message="This will permanently remove the listing and all associated applications. This cannot be undone."
                confirmLabel={deleting ? 'Deleting…' : 'Delete listing'}
                danger
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            >
                {deleteError && (
                    <p className="text-sm text-red-600 mb-2">{deleteError}</p>
                )}
            </Modal>

            <Footer />
        </div>
    )
}