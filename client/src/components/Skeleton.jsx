export default function Skeleton() {
  return (
    <div className="bg-white rounded-[28px] p-5 flex flex-col gap-3 border border-[#16131010] animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#F1EAD9]" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-[#F1EAD9] rounded-full w-3/4" />
          <div className="h-3 bg-[#F1EAD9] rounded-full w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 bg-[#F1EAD9] rounded-full w-16" />
        <div className="h-5 bg-[#F1EAD9] rounded-full w-20" />
        <div className="h-5 bg-[#F1EAD9] rounded-full w-14" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#16131008]">
        <div className="h-4 bg-[#F1EAD9] rounded-full w-24" />
        <div className="h-7 bg-[#F1EAD9] rounded-full w-20" />
      </div>
    </div>
  )
}
