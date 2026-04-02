import { useState } from 'react'
import Icon from '../components/ui/Icon'

// TODO: connect to API
const mockOrgs = [
  { id: '1', initials: 'DG', name: 'Design Guild', location: 'San Francisco, CA', eventCount: 24, isFollowing: true, color: 'bg-[#FFF3E0] text-[#E65100]' },
  { id: '2', initials: 'TC', name: 'Tech Collective', location: 'Austin, TX', eventCount: 12, isFollowing: true, color: 'bg-[#E3F2FD] text-[#1565C0]' },
  { id: '3', initials: 'AL', name: 'Art Loft', location: 'New York, NY', eventCount: 8, isFollowing: false, color: 'bg-[#ECFDF5] text-[#059669]' },
  { id: '4', initials: 'FC', name: 'Future Circuit', location: 'Seattle, WA', eventCount: 32, isFollowing: true, color: 'bg-[#FEF2F2] text-[#DC2626]' },
]

const mockUpcoming = [
  {
    id: '1', org: 'Design Guild', orgBadge: 'bg-[#FFF3E0] text-[#E65100]',
    title: 'Typography in the Age of AI', date: 'Aug 24, 2024', location: 'Fort Mason Center, San Francisco',
  },
  {
    id: '2', org: 'Tech Collective', orgBadge: 'bg-[#E3F2FD] text-[#1565C0]',
    title: 'Sustainable Systems Summit', date: 'Sep 02, 2024', location: 'Capital Factory, Austin',
  },
  {
    id: '3', org: 'Art Loft', orgBadge: 'bg-[#ECFDF5] text-[#059669]',
    title: 'Midnight Vernissage', date: 'Oct 12, 2024', location: 'Chelsea Studios, New York',
  },
]

export default function Following() {
  const [search, setSearch] = useState('')
  const [orgs, setOrgs] = useState(mockOrgs)

  const filtered = orgs.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleFollow = (id: string) => {
    // TODO: connect to API
    setOrgs((prev) =>
      prev.map((o) => (o.id === id ? { ...o, isFollowing: !o.isFollowing } : o))
    )
  }

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
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#999] p-0"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[#999] hover:opacity-80 transition-opacity">
              <Icon name="notifications" />
            </button>
            <button className="text-[#999] hover:opacity-80 transition-opacity">
              <Icon name="account_circle" />
            </button>
            <button className="bg-[#0A0A0A] text-white text-[13px] font-medium px-6 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all">
              Create Event
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl pb-12">
        {/* Org Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {filtered.map((org) => (
            <div key={org.id} className="bg-white rounded-card p-8 flex items-center justify-between group hover:bg-[#f9f9f9] transition-colors duration-300" style={{ border: '1px solid #EBEBEB' }}>
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-full ${org.color} flex items-center justify-center font-bold text-xl`}>
                  {org.initials}
                </div>
                <div>
                  <h3 className="text-[#1a1c1c] font-semibold text-lg">{org.name}</h3>
                  <p className="text-[#474747] text-sm">{org.location}</p>
                  <p className="text-[#999] text-xs mt-1">{org.eventCount} upcoming events</p>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(org.id)}
                className={`text-xs font-bold px-6 py-2.5 rounded-full tracking-tight transition-all ${
                  org.isFollowing
                    ? 'bg-[#0A0A0A] text-white'
                    : 'border border-[#ddd] text-[#1a1c1c] hover:bg-[#0A0A0A] hover:text-white'
                }`}
              >
                {org.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>

        {/* Upcoming Events Section */}
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">Their upcoming events</h2>
              <p className="text-[#474747] text-sm mt-1">Curated selection from your followed organizers</p>
            </div>
            <a href="#" className="text-sm font-semibold text-[#0A0A0A] underline underline-offset-8 decoration-[#ccc] hover:decoration-[#0A0A0A] transition-all">
              View All Events
            </a>
          </div>
          <div className="space-y-4">
            {mockUpcoming.map((event) => (
              <div key={event.id} className="bg-white rounded-card p-8 flex items-center gap-12 group hover:bg-[#f9f9f9] transition-colors duration-300" style={{ border: '1px solid #EBEBEB' }}>
                <div className="w-24 h-24 rounded-lg bg-[#f3f3f3] flex items-center justify-center shrink-0">
                  <Icon name="image" className="!text-3xl text-[#bbb]" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${event.orgBadge}`}>
                      {event.org}
                    </span>
                    <span className="text-[#999] text-[11px] font-medium tracking-widest uppercase">{event.date}</span>
                  </div>
                  <h4 className="text-xl font-bold text-[#1a1c1c]">{event.title}</h4>
                  <p className="text-[#474747] text-sm mt-1">{event.location}</p>
                </div>
                <div className="shrink-0">
                  <button className="p-2 hover:bg-[#f3f3f3] rounded-full transition-colors">
                    <Icon name="bookmark" className="text-[#bbb]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
