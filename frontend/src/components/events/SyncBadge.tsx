import type { SyncStatus } from '../../types/event'

interface SyncBadgeProps {
  platform: 'eventbrite' | 'wix'
  status: SyncStatus
}

const statusStyles: Record<SyncStatus, string> = {
  synced: 'bg-[#F0FDF4] text-[#166534]',
  pending: 'bg-[#FFFBEB] text-[#92400E]',
  failed: 'bg-[#FFF1F2] text-[#9F1239]',
  not_synced: 'bg-[#F3F4F6] text-[#6B7280]',
}

const platformStyles = {
  eventbrite: 'bg-[#FFF3E0] text-[#E65100]',
  wix: 'bg-[#E3F2FD] text-[#1565C0]',
}

const statusLabels: Record<SyncStatus, string> = {
  synced: 'Synced',
  pending: 'Pending',
  failed: 'Failed',
  not_synced: 'Not synced',
}

export default function SyncBadge({ platform, status }: SyncBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${platformStyles[platform]}`}>
        {platform === 'eventbrite' ? 'EB' : 'Wix'}
      </span>
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyles[status]}`}>
        {statusLabels[status]}
      </span>
    </div>
  )
}
