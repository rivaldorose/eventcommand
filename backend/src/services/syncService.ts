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

async function logSync(eventId: string, platform: 'eventbrite' | 'wix', action: string, status: string, message: string) {
  await pool.query(
    'INSERT INTO sync_log (event_id, platform, action, status, error_message) VALUES ($1, $2, $3, $4, $5)',
    [eventId, platform, action, status, message]
  )
}

export async function syncEvent(event: EventRow, userId: string) {
  // Sync to Eventbrite
  if (event.sync_eventbrite) {
    const connected = await ebConnected(userId)
    if (!connected) {
      await pool.query(
        "UPDATE events SET eventbrite_sync_status = 'failed', updated_at = NOW() WHERE id = $1",
        [event.id]
      )
      await logSync(event.id, 'eventbrite', 'sync', 'failed', 'Eventbrite not connected')
    } else {
      try {
        await pool.query(
          "UPDATE events SET eventbrite_sync_status = 'pending', updated_at = NOW() WHERE id = $1",
          [event.id]
        )

        if (event.eventbrite_id) {
          await updateEventbriteEvent(userId, event.eventbrite_id, {
            title: event.title,
            description: event.description || '',
            startUtc: `${event.date}T${event.time}:00Z`,
            endUtc: `${event.date}T${event.time}:00Z`,
            timezone: 'Europe/Amsterdam',
          })
        } else {
          const result = await createEventbriteEvent(userId, {
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
        await logSync(event.id, 'eventbrite', 'sync', 'synced', 'Successfully synced')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        await pool.query(
          "UPDATE events SET eventbrite_sync_status = 'failed', updated_at = NOW() WHERE id = $1",
          [event.id]
        )
        await logSync(event.id, 'eventbrite', 'sync', 'failed', message)
      }
    }
  }

  // Sync to Wix
  if (event.sync_wix) {
    const connected = await wixConnected(userId)
    if (!connected) {
      await pool.query(
        "UPDATE events SET wix_sync_status = 'failed', updated_at = NOW() WHERE id = $1",
        [event.id]
      )
      await logSync(event.id, 'wix', 'sync', 'failed', 'Wix not connected')
    } else {
      try {
        await pool.query(
          "UPDATE events SET wix_sync_status = 'pending', updated_at = NOW() WHERE id = $1",
          [event.id]
        )

        if (event.wix_id) {
          await updateWixEvent(userId, event.wix_id, {
            title: event.title,
            description: event.description || '',
            startDate: `${event.date}T${event.time}:00Z`,
            endDate: `${event.date}T${event.time}:00Z`,
            location: event.location || '',
          })
        } else {
          const result = await createWixEvent(userId, {
            title: event.title,
            description: event.description || '',
            startDate: `${event.date}T${event.time}:00Z`,
            endDate: `${event.date}T${event.time}:00Z`,
            location: event.location || '',
          })
          await pool.query('UPDATE events SET wix_id = $1 WHERE id = $2', [result.event?.id, event.id])
        }

        await pool.query(
          "UPDATE events SET wix_sync_status = 'synced', updated_at = NOW() WHERE id = $1",
          [event.id]
        )
        await logSync(event.id, 'wix', 'sync', 'synced', 'Successfully synced')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        await pool.query(
          "UPDATE events SET wix_sync_status = 'failed', updated_at = NOW() WHERE id = $1",
          [event.id]
        )
        await logSync(event.id, 'wix', 'sync', 'failed', message)
      }
    }
  }
}
