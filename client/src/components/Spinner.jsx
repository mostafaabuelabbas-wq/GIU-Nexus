export default function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="w-10 h-10 border-4 border-[#F1EAD9] border-t-[#EE5688] rounded-full animate-spin" />
    </div>
  )
}
