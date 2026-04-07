import { Router, Request, Response } from 'express'
import pool from '../db/client'
import { getOrganizer, searchOrganizers } from '../services/eventbriteService'

const router = Router()

// Search Eventbrite organizers — MUST be before /:id route
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string
    if (!q || q.trim().length < 2) {
      res.json([])
      return
    }

    const data = await searchOrganizers(req.userId!, q)

    const organizersMap = new Map<string, { id: string; name: string; eventCount: number; website?: string }>()
    for (const event of data.events || []) {
      if (event.organizer && !organizersMap.has(event.organizer.id)) {
        organizersMap.set(event.organizer.id, {
          id: event.organizer.id,
          name: event.organizer.name || 'Unknown Organizer',
          eventCount: event.organizer.num_past_events || 0,
          website: event.organizer.website || undefined,
        })
      }
    }

    res.json(Array.from(organizersMap.values()))
  } catch (err) {
    console.error('Organizer search error:', err)
    res.json([])
  }
})

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM followed_orgs WHERE user_id = $1 ORDER BY followed_at DESC',
      [req.userId]
    )
    const orgs = result.rows.map((row) => ({
      id: row.id,
      eventbriteOrgId: row.eventbrite_org_id,
      name: row.name,
      image_url: row.image_url,
      isFollowing: true,
      followedAt: row.followed_at,
    }))
    res.json(orgs)
  } catch (err) {
    console.error('Error fetching organizations:', err)
    res.status(500).json({ error: 'Failed to fetch organizations' })
  }
})

router.post('/follow', async (req: Request, res: Response) => {
  try {
    const { eventbriteOrgId } = req.body

    let orgData
    try {
      orgData = await getOrganizer(req.userId!, eventbriteOrgId)
    } catch {
      orgData = { name: req.body.name || 'Unknown' }
    }

    const name = orgData.name || req.body.name || 'Unknown'

    const result = await pool.query(
      `INSERT INTO followed_orgs (eventbrite_org_id, name, user_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (eventbrite_org_id, user_id) DO NOTHING
       RETURNING *`,
      [eventbriteOrgId, name, req.userId]
    )

    if (result.rows.length === 0) {
      res.status(409).json({ error: 'Already following this organization' })
      return
    }

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Error following organization:', err)
    res.status(500).json({ error: 'Failed to follow organization' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'DELETE FROM followed_orgs WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Organization not found' })
      return
    }

    res.json({ message: 'Unfollowed organization' })
  } catch (err) {
    console.error('Error unfollowing organization:', err)
    res.status(500).json({ error: 'Failed to unfollow organization' })
  }
})

export default router
