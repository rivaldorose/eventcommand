export interface Organization {
  id: string
  name: string
  location: string
  eventCount: number
  avatarInitials: string
  isFollowing: boolean
  nextEvent?: {
    title: string
    date: string
  }
}
