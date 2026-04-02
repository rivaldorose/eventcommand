import { Search } from 'lucide-react'

interface OrgSearchProps {
  value: string
  onChange: (value: string) => void
}

export default function OrgSearch({ value, onChange }: OrgSearchProps) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search Eventbrite organizers..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-border rounded-full outline-none focus:border-primary transition-colors"
      />
    </div>
  )
}
