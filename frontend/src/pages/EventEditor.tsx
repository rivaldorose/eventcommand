import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import Icon from '../components/ui/Icon'

export default function EventEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  // TODO: connect to API — fetch event by id for edit mode
  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    syncEventbrite: true,
    syncWix: true,
  })

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: connect to API — POST /api/events or PUT /api/events/:id
    console.log('Saving event:', form)
    navigate('/events')
  }

  return (
    <div>
      <TopBar title="Dashboard" />

      <div className="max-w-4xl mx-auto w-full bg-white rounded-xl p-8 lg:p-12">
        <div className="mb-10">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#474747] mb-2 block">
            Editor Mode
          </span>
          <h1 className="text-5xl font-bold tracking-tight text-[#1a1c1c]">
            {isEdit ? 'Edit Event' : 'New Event'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[#474747] mb-3">
              Event Title
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="The Midnight Gala 2024"
              className="w-full text-4xl font-semibold tracking-tight bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 border-[#eee] focus:border-[#0A0A0A] focus:ring-0 transition-colors py-4 placeholder:text-[#ddd]"
            />
          </div>

          {/* Date & Location Bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-[#474747] mb-3">
                  Date & Time
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => update('date', e.target.value)}
                      className="w-full bg-[#f3f3f3] border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#0A0A0A]"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="time"
                      required
                      value={form.time}
                      onChange={(e) => update('time', e.target.value)}
                      className="w-full bg-[#f3f3f3] border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#0A0A0A]"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-[#474747] mb-3">
                  Location
                </label>
                <div className="relative">
                  <Icon name="location_on" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#474747] !text-lg" />
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="Metropolitan Museum of Art, NY"
                    className="w-full bg-[#f3f3f3] border-none rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-[#0A0A0A]"
                  />
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-widest text-[#474747] mb-3">
                Cover Image
              </label>
              <div className="relative group cursor-pointer border-2 border-dashed border-[#ccc] hover:border-[#0A0A0A] rounded-card aspect-video flex flex-col items-center justify-center transition-all bg-[#fafafa] overflow-hidden">
                <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform">
                  <Icon name="add_a_photo" className="!text-4xl text-[#474747]" />
                  <span className="text-sm font-medium text-[#474747]">Upload Cover Image</span>
                  <span className="text-[10px] text-[#777]">16:9 ratio, up to 10MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[#474747] mb-3">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Articulate the essence of your event..."
              rows={5}
              className="w-full bg-[#f3f3f3] border-none rounded-lg px-4 py-4 text-sm focus:ring-1 focus:ring-[#0A0A0A] resize-none"
            />
          </div>

          {/* Sync Section */}
          <div className="pt-6">
            <div className="flex items-center gap-2 mb-6">
              <Icon name="sync_alt" className="text-[#0A0A0A]" />
              <h3 className="text-sm font-bold tracking-tight text-[#1a1c1c]">Ecosystem Synchronization</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Eventbrite Toggle */}
              <div className="flex items-center justify-between p-5 rounded-xl bg-[#f3f3f3] border border-[#eee]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FFF3E0] flex items-center justify-center">
                    <Icon name="confirmation_number" className="text-[#E65100]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1c1c]">Eventbrite</p>
                    <p className="text-[11px] text-[#474747]">Sync tickets and attendees</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => update('syncEventbrite', !form.syncEventbrite)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.syncEventbrite ? 'bg-[#005db7]' : 'bg-[#ddd]'}`}
                >
                  <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${form.syncEventbrite ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {/* Wix Toggle */}
              <div className="flex items-center justify-between p-5 rounded-xl bg-[#f3f3f3] border border-[#eee]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center">
                    <Icon name="webhook" className="text-[#1565C0]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1c1c]">Wix Events</p>
                    <p className="text-[11px] text-[#474747]">Publish to Wix site portal</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => update('syncWix', !form.syncWix)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.syncWix ? 'bg-[#005db7]' : 'bg-[#ddd]'}`}
                >
                  <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform ${form.syncWix ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-10 flex justify-end items-center gap-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-[#474747] hover:text-[#1a1c1c] transition-colors"
            >
              Discard Draft
            </button>
            <button
              type="submit"
              className="bg-[#0A0A0A] text-white px-12 py-4 rounded-full font-semibold tracking-tight shadow-lg shadow-black/10 hover:shadow-black/20 active:scale-95 transition-all"
            >
              Save & Sync
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
