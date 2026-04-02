import type { Organization } from '../../types/organization'
import PillButton from '../ui/PillButton'

interface OrgCardProps {
  org: Organization
  onToggleFollow?: (id: string) => void
}

export default function OrgCard({ org, onToggleFollow }: OrgCardProps) {
  return (
    <div className="bg-white border border-border rounded-card p-5 flex flex-col items-center text-center min-w-[200px]">
      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold mb-3">
        {org.avatarInitials}
      </div>
      <h4 className="text-sm font-semibold text-primary">{org.name}</h4>
      <p className="text-xs text-gray-500 mb-1">{org.location}</p>
      <p className="text-xs text-gray-400 mb-3">{org.eventCount} events</p>
      {org.nextEvent && (
        <p className="text-[11px] text-gray-500 mb-3">
          Next: {org.nextEvent.title} &middot; {org.nextEvent.date}
        </p>
      )}
      <PillButton
        variant={org.isFollowing ? 'primary' : 'outlined'}
        onClick={() => onToggleFollow?.(org.id)}
        className="text-xs"
      >
        {org.isFollowing ? 'Following' : 'Follow'}
      </PillButton>
    </div>
  )
}
