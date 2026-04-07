import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import Icon from '../components/ui/Icon'
import api from '../lib/api'

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  status: string
  syncEventbrite: boolean
  syncWix: boolean
  eventbriteSyncStatus: string
  wixSyncStatus: string
}

type Filter = 'all' | 'upcoming' | 'past' | 'draft'
const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'draft', label: 'Draft' },
]

export default function MyEvents() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/events').then((res) => {
      setEvents(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = activeFilter === 'all'
    ? events
    : events.filter((e) => e.status === activeFilter)

  const formatDate = (date: string, time: string) => {
    const d = new Date(date)
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return time ? `${formatted} • ${time}` : formatted
  }

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
                        <div className="text-[11px] text-[#474747]">ID: {event.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-[#1a1c1c]">{formatDate(event.date, event.time)}</td>
                  <td className="px-8 py-5 text-sm text-[#1a1c1c]">{event.location || '—'}</td>
                  <td className="px-8 py-5">
                    <div className="flex gap-2">
                      {event.syncEventbrite && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-[#FFF3E0] text-[#E65100]">
                          Eventbrite
                        </span>
                      )}
                      {event.syncWix && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-[#E3F2FD] text-[#1565C0]">
                          Wix
                        </span>
                      )}
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
              {filtered.length === 0 && !loading && (
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
