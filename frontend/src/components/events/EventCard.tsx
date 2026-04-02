import type { Event } from '../../types/event'
import SyncBadge from './SyncBadge'

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white border border-border rounded-card p-4 min-w-[260px]">
      <div className="w-full h-28 rounded-lg bg-surface border border-border mb-3 flex items-center justify-center text-xs text-gray-400">
        Cover Image
      </div>
      <h4 className="text-sm font-semibold text-primary mb-1">{event.title}</h4>
      <p className="text-xs text-gray-500 mb-3">{event.date} &middot; {event.location}</p>
      <div className="flex gap-2">
        <SyncBadge platform="eventbrite" status={event.eventbriteSyncStatus} />
        <SyncBadge platform="wix" status={event.wixSyncStatus} />
      </div>
    </div>
  )
}
