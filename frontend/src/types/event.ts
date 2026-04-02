export type SyncStatus = 'synced' | 'pending' | 'failed' | 'not_synced'

export interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  coverImage?: string
  status: 'upcoming' | 'past' | 'draft'
  syncEventbrite: boolean
  syncWix: boolean
  eventbriteSyncStatus: SyncStatus
  wixSyncStatus: SyncStatus
  eventbriteId?: string
  wixId?: string
  createdAt: string
  updatedAt: string
}
