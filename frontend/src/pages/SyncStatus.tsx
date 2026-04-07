import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import api from '../lib/api'

interface SyncLog {
  id: string
  platform: string
  status: string
  message?: string
  attemptedAt: string
}

interface Event {
  id: string
  title: string
  eventbriteSyncStatus: string
  wixSyncStatus: string
}

function statusBadge(status: string) {
  switch (status) {
    case 'synced': return { label: 'Synced', style: 'bg-[#ECFDF5] text-[#059669]', icon: 'check_circle' }
    case 'pending': return { label: 'Pending', style: 'bg-[#FFF8E1] text-[#F59E0B]', icon: 'schedule' }
    case 'failed': return { label: 'Failed', style: 'bg-[#FEF2F2] text-[#DC2626]', icon: 'error' }
    default: return { label: 'Not Synced', style: 'bg-[#f3f3f3] text-[#777]', icon: 'remove_circle' }
  }
}

function timelineColor(status: string) {
  switch (status) {
    case 'synced': return 'bg-[#059669]'
    case 'pending': return 'bg-[#F59E0B]'
    case 'failed': return 'bg-[#DC2626]'
    default: return 'bg-[#ccc]'
  }
}

export default function SyncStatus() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    if (!eventId) return

    api.get('/events').then((res) => {
      const found = res.data.find((e: any) => e.id === eventId)
      if (found) setEvent(found)
    })

    api.get(`/sync/${eventId}`).then((res) => {
      setLogs(res.data)
    }).catch(() => {})
  }, [eventId])

  const handleRetry = async () => {
    if (!eventId) return
    setRetrying(true)
    try {
      await api.post(`/sync/${eventId}/retry`)
      // Refresh logs after retry
      const res = await api.get(`/sync/${eventId}`)
      setLogs(res.data)
    } catch (err) {
      console.error('Retry failed:', err)
    }
    setRetrying(false)
  }

  const ebStatus = statusBadge(event?.eventbriteSyncStatus || 'not_synced')
  const wixStatus = statusBadge(event?.wixSyncStatus || 'not_synced')

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-[#111]/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        {/* Modal Container */}
        <div className="bg-white w-full max-w-2xl rounded-card shadow-[0_20px_40px_rgba(0,0,0,0.08)] relative overflow-hidden flex flex-col max-h-[90vh]">
          {/* Close Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-8 right-8 p-2 text-[#474747] hover:text-[#0A0A0A] transition-colors"
          >
            <Icon name="close" />
          </button>

          {/* Header */}
          <div className="p-10 pb-6">
            <p className="text-[#474747] text-[11px] font-medium uppercase tracking-widest mb-2">
              Activity Monitor
            </p>
            <h2 className="text-[1.75rem] font-semibold tracking-tight text-[#1a1c1c]">
              Sync Status: {event?.title || 'Loading...'}
            </h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-10 pb-12">
            {/* Platform List */}
            <div className="space-y-6 mb-12">
              {/* Eventbrite */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-[#eee] flex items-center justify-center">
                    <Icon name="hub" className="text-[#0A0A0A]" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-[#1a1c1c]">Eventbrite</h4>
                    <p className="text-sm text-[#474747]">{event?.eventbriteSyncStatus || 'not synced'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {event?.eventbriteSyncStatus === 'failed' && (
                    <button
                      onClick={handleRetry}
                      disabled={retrying}
                      className="px-4 py-1.5 rounded-full border border-[#0A0A0A] text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all disabled:opacity-50"
                    >
                      {retrying ? 'Retrying...' : 'Retry'}
                    </button>
                  )}
                  <div className={`${ebStatus.style} px-4 py-1.5 rounded-full flex items-center gap-2`}>
                    <Icon name={ebStatus.icon} filled className="!text-[16px]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{ebStatus.label}</span>
                  </div>
                </div>
              </div>

              {/* Wix */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-[#eee] flex items-center justify-center">
                    <Icon name="webhook" className="text-[#0A0A0A]" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-[#1a1c1c]">Wix Events</h4>
                    <p className="text-sm text-[#474747]">{event?.wixSyncStatus || 'not synced'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {event?.wixSyncStatus === 'failed' && (
                    <button
                      onClick={handleRetry}
                      disabled={retrying}
                      className="px-4 py-1.5 rounded-full border border-[#0A0A0A] text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all disabled:opacity-50"
                    >
                      {retrying ? 'Retrying...' : 'Retry'}
                    </button>
                  )}
                  <div className={`${wixStatus.style} px-4 py-1.5 rounded-full flex items-center gap-2`}>
                    <Icon name={wixStatus.icon} filled className="!text-[16px]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{wixStatus.label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-10 border-t border-[#eee]">
              <h3 className="text-sm font-semibold text-[#1a1c1c] mb-8">Timeline</h3>
              {logs.length > 0 ? (
                <div className="relative pl-8 space-y-10">
                  <div className="absolute left-[3.5px] top-1 bottom-1 w-[1px] bg-[#eee]" />
                  {logs.map((log) => (
                    <div key={log.id} className="relative">
                      <div className={`absolute -left-[32px] top-1 w-2 h-2 rounded-full ${timelineColor(log.status)} ring-4 ring-white`} />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#1a1c1c]">
                          {log.platform} — {log.status}
                        </span>
                        <span className="text-[11px] text-[#474747]">
                          {new Date(log.attemptedAt).toLocaleString()} {log.message && `• ${log.message}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#474747] text-center py-6">No sync activity yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
