import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import Icon from '../components/ui/Icon'
import api from '../lib/api'

interface Event {
  id: string
  title: string
  date: string
  eventbriteSyncStatus: string
  wixSyncStatus: string
}

interface Org {
  id: string
  name: string
  image_url?: string
}

function getSyncLabel(event: Event) {
  if (event.eventbriteSyncStatus === 'synced') return { label: 'Synced • Eventbrite', style: 'bg-[#ECFDF5] text-[#059669]' }
  if (event.wixSyncStatus === 'synced') return { label: 'Synced • Wix', style: 'bg-[#E3F2FD] text-[#1565C0]' }
  if (event.eventbriteSyncStatus === 'failed' || event.wixSyncStatus === 'failed') return { label: 'Failed • Sync Error', style: 'bg-[#FEF2F2] text-[#DC2626]' }
  if (event.eventbriteSyncStatus === 'pending' || event.wixSyncStatus === 'pending') return { label: 'Pending', style: 'bg-[#f3f3f3] text-[#777]' }
  return { label: 'Not Synced', style: 'bg-[#f3f3f3] text-[#777]' }
}

const greeting = (() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
})()

export default function Dashboard() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [orgs, setOrgs] = useState<Org[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/events').catch(() => ({ data: [] })),
      api.get('/organizations').catch(() => ({ data: [] })),
    ]).then(([eventsRes, orgsRes]) => {
      setEvents(eventsRes.data)
      setOrgs(orgsRes.data)
      setLoading(false)
    })
  }, [])

  const pendingCount = events.filter(
    (e) => e.eventbriteSyncStatus === 'pending' || e.wixSyncStatus === 'pending' ||
           e.eventbriteSyncStatus === 'failed' || e.wixSyncStatus === 'failed'
  ).length

  return (
    <div>
      <TopBar title="Dashboard" />

      <div className="flex flex-col gap-12">
        {/* Hero */}
        <section>
          <h1 className="text-[3.5rem] font-bold tracking-tight text-[#1a1c1c] leading-none mb-2">{greeting}</h1>
          <p className="text-[#474747] font-medium text-lg">Your orchestration for today is looking seamless.</p>
        </section>

        {/* Stat Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-card" style={{ border: '1px solid #EBEBEB' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium uppercase tracking-widest text-[#474747]">My Events</span>
              <Icon name="calendar_today" className="text-[#bbb]" />
            </div>
            <p className="text-5xl font-bold tracking-tighter text-[#1a1c1c]">{loading ? '—' : events.length}</p>
            <p className="text-xs text-emerald-600 mt-2 font-medium">Total events</p>
          </div>
          <div className="bg-white p-8 rounded-card" style={{ border: '1px solid #EBEBEB' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium uppercase tracking-widest text-[#474747]">Following</span>
              <Icon name="business_center" className="text-[#bbb]" />
            </div>
            <p className="text-5xl font-bold tracking-tighter text-[#1a1c1c]">{loading ? '—' : orgs.length} <span className="text-lg font-medium tracking-normal text-[#474747]">orgs</span></p>
            <p className="text-xs text-[#474747] mt-2 font-medium">Monitoring feeds</p>
          </div>
          <div className="bg-white p-8 rounded-card" style={{ border: '1px solid #EBEBEB' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium uppercase tracking-widest text-[#474747]">Pending Sync</span>
              <Icon name="sync" className="text-[#bbb]" />
            </div>
            <p className="text-5xl font-bold tracking-tighter text-[#1a1c1c]">{loading ? '—' : pendingCount}</p>
            {pendingCount > 0 && <p className="text-xs text-rose-600 mt-2 font-medium">Requires attention</p>}
            {pendingCount === 0 && <p className="text-xs text-emerald-600 mt-2 font-medium">All synced</p>}
          </div>
        </section>

        {/* Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Recent Activity Table */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-xl font-semibold tracking-tight text-[#1a1c1c]">Recent Activity</h3>
              <button
                onClick={() => navigate('/events')}
                className="text-xs font-bold uppercase tracking-widest border-b border-[#0A0A0A] pb-1 text-[#0A0A0A]"
              >
                View Schedule
              </button>
            </div>
            <div className="bg-white rounded-card overflow-hidden" style={{ border: '1px solid #EBEBEB' }}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f7f7f7]">
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#474747]">Event Title</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#474747]">Date</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#474747]">Sync Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f5]">
                  {events.slice(0, 5).map((event) => {
                    const sync = getSyncLabel(event)
                    return (
                      <tr
                        key={event.id}
                        className="hover:bg-[#f9f9f9] transition-colors cursor-pointer"
                        onClick={() => navigate(`/sync/${event.id}`)}
                      >
                        <td className="px-8 py-5 font-medium text-sm text-[#1a1c1c]">{event.title}</td>
                        <td className="px-8 py-5 text-sm text-[#474747]">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${sync.style}`}>
                            {sync.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {events.length === 0 && !loading && (
                    <tr>
                      <td colSpan={3} className="px-8 py-12 text-center text-sm text-[#474747]">
                        No events yet. Create your first event to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Following Feed */}
          <section className="space-y-6">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-xl font-semibold tracking-tight text-[#1a1c1c]">Following Feed</h3>
            </div>
            <div className="flex flex-col gap-4">
              {orgs.slice(0, 4).map((org) => (
                <div key={org.id} className="bg-white p-6 rounded-card flex items-center justify-between group hover:border-[#0A0A0A]/20 transition-all" style={{ border: '1px solid #EBEBEB' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f3f3f3] flex items-center justify-center font-bold text-xs text-[#555]">
                      {org.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1a1c1c]">{org.name}</h4>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 rounded-full border border-[#ccc] text-[11px] font-bold text-[#1a1c1c] hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A] transition-all">
                    Following
                  </button>
                </div>
              ))}
              {orgs.length === 0 && !loading && (
                <p className="text-sm text-[#474747] text-center py-6">No organizations followed yet.</p>
              )}
            </div>

            {/* Invite CTA */}
            <div className="mt-8 bg-[#0A0A0A] rounded-card p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-lg font-bold mb-2">Invite Collaborators</h4>
                <p className="text-xs text-white/70 mb-4 leading-relaxed">Scale your command center by adding your team members.</p>
                <button className="bg-white text-[#0A0A0A] px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider">
                  Invite Team
                </button>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>group_add</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
