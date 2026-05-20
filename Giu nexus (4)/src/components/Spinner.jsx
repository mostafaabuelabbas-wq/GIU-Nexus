export default function Spinner({ size = 'md', white = false }) {
  const sz = { sm: 'w-4 h-4 border-2', md: 'w-5 h-5 border-2', lg: 'w-8 h-8 border-[3px]' }[size]
  const color = white
    ? 'border-white/25 border-t-white'
    : 'border-[#161310]/15 border-t-[#161310]'
  return (
    <div className={`${sz} ${color} rounded-full animate-spin flex-shrink-0`} />
  )
}
