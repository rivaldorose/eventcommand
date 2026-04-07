import { Router, Request, Response } from 'express'
import pool from '../db/client'
import { syncEvent } from '../services/syncService'

const router = Router()

router.get('/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params
    const result = await pool.query(
      `SELECT sl.* FROM sync_log sl
       JOIN events e ON sl.event_id = e.id
       WHERE sl.event_id = $1 AND e.user_id = $2
       ORDER BY sl.created_at DESC`,
      [eventId, req.userId]
    )
    const logs = result.rows.map((row) => ({
      id: row.id,
      eventId: row.event_id,
      platform: row.platform,
      action: row.action,
      status: row.status,
      message: row.error_message,
      attemptedAt: row.created_at,
    }))
    res.json(logs)
  } catch (err) {
    console.error('Error fetching sync log:', err)
    res.status(500).json({ error: 'Failed to fetch sync log' })
  }
})

router.post('/:eventId/retry', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1 AND user_id = $2',
      [eventId, req.userId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Event not found' })
      return
    }

    const event = result.rows[0]
    syncEvent(event, req.userId!).catch((err) => console.error('Sync retry error:', err))

    res.json({ message: 'Sync retry initiated' })
  } catch (err) {
    console.error('Error retrying sync:', err)
    res.status(500).json({ error: 'Failed to retry sync' })
  }
})

export default router
