/** Skeleton placeholder card — matches JobCard dimensions while data loads. */
export function JobCardSkeleton() {
  return (
    <div
      className="bg-white rounded-[28px] p-5 flex flex-col gap-3 min-h-[148px] border border-[#E9E0CB]"
      aria-hidden="true"
    >
      {/* category badge */}
      <div className="h-6 w-20 rounded-full bg-[#F1EAD9] animate-pulse" />
      {/* title lines */}
      <div className="h-5 w-4/5 rounded-lg bg-[#F1EAD9] animate-pulse" />
      <div className="h-4 w-2/5 rounded-lg bg-[#F1EAD9] animate-pulse" />
      {/* chip row */}
      <div className="flex gap-1.5 mt-auto pt-1">
        <div className="h-6 w-28 rounded-full bg-[#F1EAD9] animate-pulse" />
        <div className="h-6 w-20 rounded-full bg-[#F1EAD9] animate-pulse" />
      </div>
    </div>
  )
}
