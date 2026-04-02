import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import Icon from '../components/ui/Icon'

// TODO: connect to API
const mockEvents = [
  {
    id: '1', title: 'Global Tech Summit 2024', refId: '#TS-9231',
    date: 'Dec 12, 2024 \u2022 09:00 AM', location: 'San Francisco, CA',
    platforms: [
      { label: 'Eventbrite', style: 'bg-[#FFF3E0] text-[#E65100]' },
      { label: 'Wix', style: 'bg-[#E3F2FD] text-[#1565C0]' },
    ],
    status: 'upcoming',
  },
  {
    id: '2', title: 'Annual Founders Gala', refId: '#FG-1102',
    date: 'Dec 15, 2024 \u2022 07:00 PM', location: 'New York, NY',
    platforms: [
      { label: 'Eventbrite', style: 'bg-[#FFF3E0] text-[#E65100]' },
    ],
    status: 'upcoming',
  },
  {
    id: '3', title: 'Design Week: Opening Night', refId: '#DW-8829',
    date: 'Jan 05, 2025 \u2022 06:00 PM', location: 'London, UK',
    platforms: [
      { label: 'Wix', style: 'bg-[#E3F2FD] text-[#1565C0]' },
    ],
    status: 'upcoming',
  },
  {
    id: '4', title: 'Product Launch: Core v2', refId: '#PL-0034',
    date: 'Jan 22, 2025 \u2022 10:00 AM', location: 'Austin, TX',
    platforms: [
      { label: 'Eventbrite', style: 'bg-[#FFF3E0] text-[#E65100]' },
      { label: 'Wix', style: 'bg-[#E3F2FD] text-[#1565C0]' },
    ],
    status: 'upcoming',
  },
  {
    id: '5', title: 'Sustainability Workshop', refId: '#SW-5512',
    date: 'Feb 14, 2025 \u2022 01:00 PM', location: 'Seattle, WA',
    platforms: [
      { label: 'Wix', style: 'bg-[#E3F2FD] text-[#1565C0]' },
    ],
    status: 'draft',
  },
]

type Filter = 'all' | 'upcoming' | 'past' | 'draft'
const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'draft', label: 'Draft' },
]

export default function MyEvents() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const navigate = useNavigate()

  const filtered = activeFilter === 'all'
    ? mockEvents
    : mockEvents.filter((e) => e.status === activeFilter)

  return (
    <div>
      <TopBar title="My Events" />

      <div className="pb-12">
        {/* Segmented Control */}
        <div className="flex items-center gap-1 bg-[#f3f3f3] p-1 rounded-full w-fit mb-10">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                activeFilter === f.key
                  ? 'bg-white text-[#0A0A0A] shadow-sm'
                  : 'text-[#777] hover:text-[#0A0A0A]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Event List Table */}
        <div className="bg-white rounded-card overflow-hidden" style={{ border: '1px solid #EBEBEB' }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-[#474747] font-medium">
                <th className="px-8 py-5 border-b border-[#f3f3f3]">Event Details</th>
                <th className="px-8 py-5 border-b border-[#f3f3f3]">Date & Time</th>
                <th className="px-8 py-5 border-b border-[#f3f3f3]">Location</th>
                <th className="px-8 py-5 border-b border-[#f3f3f3]">Integrations</th>
                <th className="px-8 py-5 border-b border-[#f3f3f3] w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f9f9f9]">
              {filtered.map((event) => (
                <tr key={event.id} className="hover:bg-[#fafafa] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#f3f3f3] flex items-center justify-center">
                        <Icon name="event" className="text-[#777] !text-base" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#0A0A0A]">{event.title}</div>
                        <div className="text-[11px] text-[#474747]">ID: {event.refId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-[#1a1c1c]">{event.date}</td>
                  <td className="px-8 py-5 text-sm text-[#1a1c1c]">{event.location}</td>
                  <td className="px-8 py-5">
                    <div className="flex gap-2">
                      {event.platforms.map((p) => (
                        <span key={p.label} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${p.style}`}>
                          {p.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => navigate(`/events/${event.id}/edit`)}
                      className="text-[#bbb] hover:text-[#0A0A0A] opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Icon name="edit" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <div className="w-16 h-16 rounded-full bg-[#e8e8e8] flex items-center justify-center mb-4">
                        <Icon name="edit_note" className="!text-3xl text-[#999]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#0A0A0A]">No events found</h3>
                      <p className="text-sm text-[#474747] max-w-xs mt-1">Try a different filter or create a new event.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
