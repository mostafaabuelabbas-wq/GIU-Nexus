/** Full job-card shaped skeleton used in grids while fetching. */
export function JobCardSkeleton() {
  return (
    <article className="bg-white rounded-[28px] p-5 flex flex-col gap-3 border border-[#16131010] animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 bg-[#1613100C] rounded-xl flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-[#1613100C] rounded-lg w-3/4" />
          <div className="h-3 bg-[#1613100C] rounded-lg w-1/2" />
        </div>
        <div className="w-8 h-8 bg-[#1613100C] rounded-xl" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 bg-[#1613100C] rounded-full w-20" />
        <div className="h-5 bg-[#1613100C] rounded-full w-16" />
        <div className="h-5 bg-[#1613100C] rounded-full w-24" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-[#16131008]">
        <div className="h-3 bg-[#1613100C] rounded-lg w-24" />
        <div className="h-6 bg-[#1613100C] rounded-full w-20" />
      </div>
    </article>
  )
}

/** Generic text-line skeleton for smaller loading states. */
export default function Skeleton({ lines = 3 }) {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-[#1613100C] rounded-lg"
          style={{ width: `${92 - i * 10}%` }}
        />
      ))}
    </div>
  )
}
