import pool from '../db/client'
import { createEventbriteEvent, updateEventbriteEvent, isConnected as ebConnected } from './eventbriteService'
import { createWixEvent, updateWixEvent, isConnected as wixConnected } from './wixService'

interface EventRow {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  sync_eventbrite: boolean
  sync_wix: boolean
  eventbrite_id: string | null
  wix_id: string | null
}

async function logSync(eventId: string, platform: 'eventbrite' | 'wix', status: string, message: string) {
  await pool.query(
    'INSERT INTO sync_log (event_id, platform, status, message) VALUES ($1, $2, $3, $4)',
    [eventId, platform, status, message]
  )
}

export async function syncEvent(event: EventRow) {
  // Sync to Eventbrite
  if (event.sync_eventbrite) {
    const connected = await ebConnected()
    if (!connected) {
      await pool.query(
        "UPDATE events SET eventbrite_sync_status = 'failed', updated_at = NOW() WHERE id = $1",
        [event.id]
      )
      await logSync(event.id, 'eventbrite', 'failed', 'Eventbrite not connected. Go to Settings to connect.')
    } else {
      try {
        await pool.query(
          "UPDATE events SET eventbrite_sync_status = 'pending', updated_at = NOW() WHERE id = $1",
          [event.id]
        )
        await logSync(event.id, 'eventbrite', 'pending', 'Sync initiated')

        if (event.eventbrite_id) {
          await updateEventbriteEvent(event.eventbrite_id, {
            title: event.title,
            description: event.description || '',
            startUtc: `${event.date}T${event.time}:00Z`,
            endUtc: `${event.date}T${event.time}:00Z`,
            timezone: 'Europe/Amsterdam',
          })
        } else {
          const result = await createEventbriteEvent({
            title: event.title,
            description: event.description || '',
            startUtc: `${event.date}T${event.time}:00Z`,
            endUtc: `${event.date}T${event.time}:00Z`,
            timezone: 'Europe/Amsterdam',
            currency: 'EUR',
          })
          await pool.query('UPDATE events SET eventbrite_id = $1 WHERE id = $2', [result.id, event.id])
        }

        await pool.query(
          "UPDATE events SET eventbrite_sync_status = 'synced', updated_at = NOW() WHERE id = $1",
          [event.id]
        )
        await logSync(event.id, 'eventbrite', 'synced', 'Successfully synced to Eventbrite')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        await pool.query(
          "UPDATE events SET eventbrite_sync_status = 'failed', updated_at = NOW() WHERE id = $1",
          [event.id]
        )
        await logSync(event.id, 'eventbrite', 'failed', message)
      }
    }
  }

  // Sync to Wix
  if (event.sync_wix) {
    const connected = await wixConnected()
    if (!connected) {
      await pool.query(
        "UPDATE events SET wix_sync_status = 'failed', updated_at = NOW() WHERE id = $1",
        [event.id]
      )
      await logSync(event.id, 'wix', 'failed', 'Wix not connected. Go to Settings to connect.')
    } else {
      try {
        await pool.query(
          "UPDATE events SET wix_sync_status = 'pending', updated_at = NOW() WHERE id = $1",
          [event.id]
        )
        await logSync(event.id, 'wix', 'pending', 'Sync initiated')

        if (event.wix_id) {
          await updateWixEvent(event.wix_id, {
            title: event.title,
            description: event.description || '',
            startDate: `${event.date}T${event.time}:00Z`,
            endDate: `${event.date}T${event.time}:00Z`,
            location: event.location || '',
          })
        } else {
          const result = await createWixEvent({
            title: event.title,
            description: event.description || '',
            startDate: `${event.date}T${event.time}:00Z`,
            endDate: `${event.date}T${event.time}:00Z`,
            location: event.location || '',
          })
          await pool.query('UPDATE events SET wix_id = $1 WHERE id = $2', [result.event.id, event.id])
        }

        await pool.query(
          "UPDATE events SET wix_sync_status = 'synced', updated_at = NOW() WHERE id = $1",
          [event.id]
        )
        await logSync(event.id, 'wix', 'synced', 'Successfully synced to Wix')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        await pool.query(
          "UPDATE events SET wix_sync_status = 'failed', updated_at = NOW() WHERE id = $1",
          [event.id]
        )
        await logSync(event.id, 'wix', 'failed', message)
      }
    }
  }
}
