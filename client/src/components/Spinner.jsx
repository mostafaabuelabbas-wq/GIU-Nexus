const SIZE = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
}

export default function Spinner({ className = '', size = 'md' }) {
  const ring = SIZE[size] ?? SIZE.md
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className={`${ring} border-[#F1EAD9] border-t-[#EE5688] rounded-full animate-spin`} />
    </div>
  )
}
