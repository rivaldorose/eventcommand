import type { SyncStatus } from './event'

export interface SyncLog {
  id: string
  eventId: string
  platform: 'eventbrite' | 'wix'
  status: SyncStatus
  message?: string
  attemptedAt: string
}
