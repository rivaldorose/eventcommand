import { Router, Request, Response } from 'express'
import pool from '../db/client'
import { syncEvent } from '../services/syncService'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events ORDER BY created_at DESC'
    )
    const events = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      date: row.date,
      time: row.time,
      location: row.location,
      description: row.description,
      coverImage: row.cover_image,
      status: row.status,
      syncEventbrite: row.sync_eventbrite,
      syncWix: row.sync_wix,
      eventbriteSyncStatus: row.eventbrite_sync_status,
      wixSyncStatus: row.wix_sync_status,
      eventbriteId: row.eventbrite_id,
      wixId: row.wix_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
    res.json(events)
  } catch (err) {
    console.error('Error fetching events:', err)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, date, time, location, description, coverImage, status, syncEventbrite, syncWix } = req.body

    const result = await pool.query(
      `INSERT INTO events (title, date, time, location, description, cover_image, status, sync_eventbrite, sync_wix)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, date, time, location, description, coverImage, status || 'upcoming', syncEventbrite ?? true, syncWix ?? true]
    )

    const event = result.rows[0]

    // Trigger sync in background
    syncEvent(event).catch((err) => console.error('Sync error:', err))

    res.status(201).json(event)
  } catch (err) {
    console.error('Error creating event:', err)
    res.status(500).json({ error: 'Failed to create event' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, date, time, location, description, coverImage, status, syncEventbrite, syncWix } = req.body

    const result = await pool.query(
      `UPDATE events SET
        title = $1, date = $2, time = $3, location = $4, description = $5,
        cover_image = $6, status = $7, sync_eventbrite = $8, sync_wix = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [title, date, time, location, description, coverImage, status, syncEventbrite, syncWix, id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Event not found' })
      return
    }

    const event = result.rows[0]

    // Trigger sync in background
    syncEvent(event).catch((err) => console.error('Sync error:', err))

    res.json(event)
  } catch (err) {
    console.error('Error updating event:', err)
    res.status(500).json({ error: 'Failed to update event' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id])

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Event not found' })
      return
    }

    res.json({ message: 'Event deleted' })
  } catch (err) {
    console.error('Error deleting event:', err)
    res.status(500).json({ error: 'Failed to delete event' })
  }
})

export default router
