import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import Icon from '../components/ui/Icon'
import api from '../lib/api'

interface ConnectionStatus {
  connected: boolean
  orgId?: string
  orgName?: string
  connectedAt?: string
}

interface Connections {
  eventbrite: ConnectionStatus
  wix: ConnectionStatus
}

export default function Settings() {
  const [connections, setConnections] = useState<Connections>({
    eventbrite: { connected: false },
    wix: { connected: false },
  })
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const authStatus = searchParams.get('auth')
  const authPlatform = searchParams.get('platform')

  useEffect(() => {
    fetchStatus()
    // Clear auth params from URL after showing
    if (authStatus) {
      const timer = setTimeout(() => {
        setSearchParams({})
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStatus = async () => {
    try {
      const res = await api.get('/auth/status')
      setConnections(res.data)
    } catch {
      console.error('Failed to fetch connection status')
    } finally {
      setLoading(false)
    }
  }

  const connectEventbrite = () => {
    // Redirect to backend OAuth start
    window.location.href = '/api/auth/eventbrite'
  }

  const connectWix = () => {
    window.location.href = '/api/auth/wix'
  }

  const disconnect = async (platform: 'eventbrite' | 'wix') => {
    try {
      await api.delete(`/auth/${platform}`)
      setConnections((prev) => ({
        ...prev,
        [platform]: { connected: false },
      }))
    } catch {
      console.error('Failed to disconnect')
    }
  }

  return (
    <div>
      <TopBar title="Settings" />

      {/* Auth notification */}
      {authStatus && (
        <div className={`mb-8 p-4 rounded-card text-sm font-medium ${
          authStatus === 'success'
            ? 'bg-[#ECFDF5] text-[#059669]'
            : 'bg-[#FEF2F2] text-[#DC2626]'
        }`}>
          {authStatus === 'success'
            ? `Successfully connected to ${authPlatform === 'eventbrite' ? 'Eventbrite' : 'Wix Events'}!`
            : `Failed to connect to ${authPlatform === 'eventbrite' ? 'Eventbrite' : 'Wix Events'}. Please try again.`
          }
        </div>
      )}

      <div className="max-w-3xl">
        {/* Section Header */}
        <div className="mb-10">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#474747] mb-2 block">
            Configuration
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-[#1a1c1c]">Platform Connections</h1>
          <p className="text-[#474747] mt-2">Connect your Eventbrite and Wix accounts to enable event synchronization.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#999]">
            <Icon name="sync" className="animate-spin mr-2" />
            Loading connections...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Eventbrite Connection */}
            <div className="bg-white rounded-card p-8" style={{ border: '1px solid #EBEBEB' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-xl bg-[#FFF3E0] flex items-center justify-center">
                    <Icon name="confirmation_number" className="text-[#E65100] !text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1a1c1c]">Eventbrite</h3>
                    {connections.eventbrite.connected ? (
                      <div>
                        <p className="text-sm text-[#059669] font-medium">Connected</p>
                        {connections.eventbrite.orgName && (
                          <p className="text-xs text-[#474747] mt-0.5">
                            Organization: {connections.eventbrite.orgName}
                          </p>
                        )}
                        {connections.eventbrite.connectedAt && (
                          <p className="text-[11px] text-[#999] mt-0.5">
                            Since {new Date(connections.eventbrite.connectedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-[#999]">Not connected — click to authorize</p>
                    )}
                  </div>
                </div>
                <div>
                  {connections.eventbrite.connected ? (
                    <button
                      onClick={() => disconnect('eventbrite')}
                      className="px-6 py-2.5 rounded-full border border-[#DC2626] text-[#DC2626] text-sm font-semibold hover:bg-[#FEF2F2] transition-all active:scale-95"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={connectEventbrite}
                      className="px-6 py-2.5 rounded-full bg-[#E65100] text-white text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
                    >
                      Connect Eventbrite
                    </button>
                  )}
                </div>
              </div>

              {connections.eventbrite.connected && (
                <div className="mt-6 pt-6 border-t border-[#f3f3f3]">
                  <div className="flex items-center gap-2 text-xs text-[#474747]">
                    <Icon name="check_circle" filled className="text-[#059669] !text-sm" />
                    <span>OAuth 2.0 authenticated</span>
                    <span className="text-[#ccc] mx-2">|</span>
                    <Icon name="sync" className="text-[#059669] !text-sm" />
                    <span>Event sync enabled</span>
                    <span className="text-[#ccc] mx-2">|</span>
                    <Icon name="webhook" className="text-[#059669] !text-sm" />
                    <span>Webhooks ready</span>
                  </div>
                </div>
              )}
            </div>

            {/* Wix Connection */}
            <div className="bg-white rounded-card p-8" style={{ border: '1px solid #EBEBEB' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-xl bg-[#E3F2FD] flex items-center justify-center">
                    <Icon name="webhook" className="text-[#1565C0] !text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1a1c1c]">Wix Events</h3>
                    {connections.wix.connected ? (
                      <div>
                        <p className="text-sm text-[#059669] font-medium">Connected</p>
                        {connections.wix.connectedAt && (
                          <p className="text-[11px] text-[#999] mt-0.5">
                            Since {new Date(connections.wix.connectedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-[#999]">Not connected — click to authorize</p>
                    )}
                  </div>
                </div>
                <div>
                  {connections.wix.connected ? (
                    <button
                      onClick={() => disconnect('wix')}
                      className="px-6 py-2.5 rounded-full border border-[#DC2626] text-[#DC2626] text-sm font-semibold hover:bg-[#FEF2F2] transition-all active:scale-95"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={connectWix}
                      className="px-6 py-2.5 rounded-full bg-[#1565C0] text-white text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
                    >
                      Connect Wix Events
                    </button>
                  )}
                </div>
              </div>

              {connections.wix.connected && (
                <div className="mt-6 pt-6 border-t border-[#f3f3f3]">
                  <div className="flex items-center gap-2 text-xs text-[#474747]">
                    <Icon name="check_circle" filled className="text-[#059669] !text-sm" />
                    <span>API authenticated</span>
                    <span className="text-[#ccc] mx-2">|</span>
                    <Icon name="sync" className="text-[#059669] !text-sm" />
                    <span>Event sync enabled</span>
                  </div>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-[#f3f3f3] rounded-card p-6 mt-8">
              <div className="flex items-start gap-4">
                <Icon name="info" className="text-[#474747] mt-0.5" />
                <div className="text-sm text-[#474747] space-y-2">
                  <p className="font-semibold text-[#1a1c1c]">How it works</p>
                  <p>When you connect a platform, EventCommand uses OAuth 2.0 to securely access your account. Your credentials are never stored — only an access token.</p>
                  <p>Events you create with sync enabled will automatically be pushed to connected platforms. Changes on either side stay in sync.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
