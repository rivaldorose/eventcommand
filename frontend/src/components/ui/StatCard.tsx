import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
}

export default function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded-card p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-surface flex items-center justify-center">
        <Icon size={20} className="text-primary" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-primary">{value}</p>
      </div>
    </div>
  )
}
