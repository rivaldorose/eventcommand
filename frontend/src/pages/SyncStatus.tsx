import { useNavigate } from 'react-router-dom'
import Icon from '../components/ui/Icon'

// TODO: connect to API
const mockTimeline = [
  { id: '1', label: 'Sync Retrying...', detail: 'Just now \u2022 Attempt 4', color: 'bg-[#0A0A0A]' },
  { id: '2', label: 'Sync Failed', detail: '2 mins ago \u2022 Connection timeout on Wix API', color: 'bg-[#ba1a1a]' },
  { id: '3', label: 'Sync Attempted', detail: '5 mins ago \u2022 Manual trigger by Administrator', color: 'bg-[#ccc]' },
  { id: '4', label: 'Initial Baseline Synced', detail: '12 hours ago \u2022 Eventbrite Integration', color: 'bg-[#059669]' },
]

export default function SyncStatus() {
  const navigate = useNavigate()

  const handleRetry = () => {
    // TODO: connect to API — POST /api/sync/:eventId/retry
    console.log('Retrying sync')
  }

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
              Sync Status: Summer Music Festival
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
                    <p className="text-sm text-[#474747]">Last updated 2 mins ago</p>
                  </div>
                </div>
                <div className="bg-[#ECFDF5] text-[#059669] px-4 py-1.5 rounded-full flex items-center gap-2">
                  <Icon name="check_circle" filled className="!text-[16px]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Synced</span>
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
                    <p className="text-sm text-[#ba1a1a]">Connection timed out</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRetry}
                    className="px-4 py-1.5 rounded-full border border-[#0A0A0A] text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all"
                  >
                    Retry
                  </button>
                  <div className="bg-[#FEF2F2] text-[#DC2626] px-4 py-1.5 rounded-full flex items-center gap-2">
                    <Icon name="error" filled className="!text-[16px]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Failed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-10 border-t border-[#eee]">
              <h3 className="text-sm font-semibold text-[#1a1c1c] mb-8">Timeline</h3>
              <div className="relative pl-8 space-y-10">
                {/* Timeline Line */}
                <div className="absolute left-[3.5px] top-1 bottom-1 w-[1px] bg-[#eee]" />

                {mockTimeline.map((item) => (
                  <div key={item.id} className="relative">
                    <div className={`absolute -left-[32px] top-1 w-2 h-2 rounded-full ${item.color} ring-4 ring-white`} />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#1a1c1c]">{item.label}</span>
                      <span className="text-[11px] text-[#474747]">{item.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
