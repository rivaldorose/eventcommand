import { useState, useEffect, useRef } from 'react'
import Icon from '../components/ui/Icon'
import api from '../lib/api'

interface FollowedOrg {
  id: string
  name: string
  location?: string
  eventCount: number
  avatarInitials: string
  eventbriteOrgId?: string
}

interface SearchResult {
  id: string
  name: string
  eventCount: number
  website?: string
}

const BADGE_COLORS = [
  'bg-[#FFF3E0] text-[#E65100]',
  'bg-[#E3F2FD] text-[#1565C0]',
  'bg-[#ECFDF5] text-[#059669]',
  'bg-[#FEF2F2] text-[#DC2626]',
  'bg-[#F3E5F5] text-[#7B1FA2]',
  'bg-[#E8F5E9] text-[#2E7D32]',
]

function getColor(name: string) {
  const code = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return BADGE_COLORS[code % BADGE_COLORS.length]
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Following() {
  const [search, setSearch] = useState('')
  const [followedOrgs, setFollowedOrgs] = useState<FollowedOrg[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())
  const [ebConnected, setEbConnected] = useState<boolean | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetchFollowedOrgs()
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const res = await api.get('/auth/status')
      setEbConnected(res.data.eventbrite?.connected ?? false)
    } catch {
      setEbConnected(false)
    }
  }

  const fetchFollowedOrgs = async () => {
    try {
      const res = await api.get('/organizations')
      const orgs: FollowedOrg[] = res.data.map((org: any) => ({
        id: org.id,
        name: org.name,
        location: org.location,
        eventCount: org.eventCount || 0,
        avatarInitials: org.avatarInitials || getInitials(org.name),
        eventbriteOrgId: org.eventbriteOrgId,
      }))
      setFollowedOrgs(orgs)
      setFollowingIds(new Set(orgs.map((o) => o.eventbriteOrgId).filter(Boolean) as string[]))
    } catch {
      // keep empty
    }
  }

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!search.trim() || search.length < 2) {
      setSearchResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.get(`/organizations/search?q=${encodeURIComponent(search)}`)
        setSearchResults(res.data)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 500)
  }, [search])

  const follow = async (org: SearchResult) => {
    try {
      setFollowingIds((prev) => new Set(prev).add(org.id))
      await api.post('/organizations/follow', {
        eventbriteOrgId: org.id,
        name: org.name,
      })
      await fetchFollowedOrgs()
    } catch {
      setFollowingIds((prev) => {
        const next = new Set(prev)
        next.delete(org.id)
        return next
      })
    }
  }

  const unfollow = async (org: FollowedOrg) => {
    try {
      setFollowedOrgs((prev) => prev.filter((o) => o.id !== org.id))
      if (org.eventbriteOrgId) {
        setFollowingIds((prev) => {
          const next = new Set(prev)
          next.delete(org.eventbriteOrgId!)
          return next
        })
      }
      await api.delete(`/organizations/${org.id}`)
    } catch {
      fetchFollowedOrgs()
    }
  }

  const isSearchMode = search.trim().length >= 2

  return (
    <div>
      {/* TopBar with search */}
      <header className="flex justify-between items-center w-full py-6 sticky top-0 bg-[#FAFAFA]/80 backdrop-blur-md z-50">
        <h2 className="text-2xl font-semibold tracking-tight text-[#0A0A0A]">Following</h2>
        <div className="flex items-center gap-6">
          <div className="relative flex items-center bg-[#f3f3f3] px-4 py-2 rounded-full w-80">
            <Icon name="search" className="text-[#999] !text-sm mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Eventbrite organizers..."
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#999] p-0 outline-none"
            />
            {searching && (
              <Icon name="sync" className="text-[#999] !text-sm ml-2 animate-spin" />
            )}
            {search && (
              <button onClick={() => setSearch('')} className="text-[#999] hover:text-[#333] ml-1">
                <Icon name="close" className="!text-sm" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[#999] hover:opacity-80 transition-opacity">
              <Icon name="notifications" />
            </button>
            <button className="text-[#999] hover:opacity-80 transition-opacity">
              <Icon name="account_circle" />
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl pb-12">

        {/* Eventbrite not connected warning */}
        {ebConnected === false && isSearchMode && (
          <div className="mb-6 p-4 rounded-card bg-[#FFF3E0] text-sm text-[#E65100] flex items-center gap-3" style={{ border: '1px solid #FFD180' }}>
            <Icon name="warning" className="!text-lg shrink-0" />
            <span>
              Connect Eventbrite in <a href="/settings" className="font-bold underline">Settings</a> to search real organizers.
            </span>
          </div>
        )}

        {/* Search results */}
        {isSearchMode ? (
          <div>
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#474747]">
                {searching ? 'Searching Eventbrite...' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${search}"`}
              </span>
            </div>

            {!searching && searchResults.length === 0 && (
              <div className="text-center py-20 text-[#999]">
                <Icon name="search_off" className="!text-4xl mb-3 block" />
                <p className="text-sm">No organizers found for "{search}"</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((org) => {
                const initials = getInitials(org.name)
                const color = getColor(org.name)
                const alreadyFollowing = followingIds.has(org.id)

                return (
                  <div
                    key={org.id}
                    className="bg-white rounded-card p-6 flex items-center justify-between hover:bg-[#f9f9f9] transition-colors duration-200"
                    style={{ border: '1px solid #EBEBEB' }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center font-bold text-lg shrink-0`}>
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-[#1a1c1c] font-semibold">{org.name}</h3>
                        <p className="text-[#999] text-xs mt-0.5">{org.eventCount} past events</p>
                        {org.website && (
                          <a
                            href={org.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#1565C0] hover:underline mt-0.5 flex items-center gap-1"
                          >
                            <Icon name="link" className="!text-xs" />
                            {org.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => !alreadyFollowing && follow(org)}
                      disabled={alreadyFollowing}
                      className={`text-xs font-bold px-5 py-2 rounded-full tracking-tight transition-all ${
                        alreadyFollowing
                          ? 'bg-[#f3f3f3] text-[#999] cursor-default'
                          : 'bg-[#0A0A0A] text-white hover:opacity-90 active:scale-95'
                      }`}
                    >
                      {alreadyFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Following list */
          <div>
            {followedOrgs.length === 0 ? (
              <div className="text-center py-20 text-[#999]">
                <Icon name="group" className="!text-4xl mb-3 block" />
                <p className="text-sm font-medium">You're not following anyone yet</p>
                <p className="text-xs mt-1">Search for Eventbrite organizers above to get started</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#474747]">
                    {followedOrgs.length} organizer{followedOrgs.length !== 1 ? 's' : ''} followed
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {followedOrgs.map((org) => {
                    const color = getColor(org.name)
                    return (
                      <div
                        key={org.id}
                        className="bg-white rounded-card p-8 flex items-center justify-between group hover:bg-[#f9f9f9] transition-colors duration-300"
                        style={{ border: '1px solid #EBEBEB' }}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center font-bold text-xl`}>
                            {org.avatarInitials}
                          </div>
                          <div>
                            <h3 className="text-[#1a1c1c] font-semibold text-lg">{org.name}</h3>
                            {org.location && <p className="text-[#474747] text-sm">{org.location}</p>}
                            <p className="text-[#999] text-xs mt-1">{org.eventCount} upcoming events</p>
                          </div>
                        </div>
                        <button
                          onClick={() => unfollow(org)}
                          className="text-xs font-bold px-6 py-2.5 rounded-full tracking-tight bg-[#0A0A0A] text-white hover:bg-[#DC2626] transition-all active:scale-95"
                        >
                          Following
                        </button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
