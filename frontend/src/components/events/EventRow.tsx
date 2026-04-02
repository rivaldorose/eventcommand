import { Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Event } from '../../types/event'
import SyncBadge from './SyncBadge'

interface EventRowProps {
  event: Event
}

export default function EventRow({ event }: EventRowProps) {
  const navigate = useNavigate()

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-gray-50/50 transition-colors">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-medium text-gray-400">
            IMG
          </div>
          <div>
            <p className="text-sm font-medium text-primary">{event.title}</p>
            <p className="text-xs text-gray-400">{event.location}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4 text-sm text-gray-600">{event.date}</td>
      <td className="py-3.5 px-4">
        <SyncBadge platform="eventbrite" status={event.eventbriteSyncStatus} />
      </td>
      <td className="py-3.5 px-4">
        <SyncBadge platform="wix" status={event.wixSyncStatus} />
      </td>
      <td className="py-3.5 px-4">
        <button
          onClick={() => navigate(`/events/${event.id}/edit`)}
          className="p-1.5 rounded-lg hover:bg-surface transition-colors"
        >
          <Pencil size={15} className="text-gray-400" />
        </button>
      </td>
    </tr>
  )
}
