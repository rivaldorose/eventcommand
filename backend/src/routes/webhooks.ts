import { Router, Request, Response } from 'express'
import pool from '../db/client'

const router = Router()

// Eventbrite webhook endpoint
// Eventbrite sends: { api_url: string, config: { action: string, endpoint_url: string, user_id: string, webhook_id: string } }
router.post('/eventbrite', async (req: Request, res: Response) => {
  try {
    const { api_url, config } = req.body
    const action = config?.action

    console.log(`Eventbrite webhook received: ${action}`, { api_url })

    switch (action) {
      case 'order.placed':
        // TODO: Handle new ticket order — update attendee count
        console.log('New order placed:', api_url)
        break

      case 'order.refunded':
        // TODO: Handle refund
        console.log('Order refunded:', api_url)
        break

      case 'event.published':
        // TODO: Sync event status to local DB
        console.log('Event published:', api_url)
        break

      case 'event.updated':
        // TODO: Sync event updates from Eventbrite back to local DB
        console.log('Event updated:', api_url)
        break

      case 'attendee.updated':
        // TODO: Handle attendee changes
        console.log('Attendee updated:', api_url)
        break

      default:
        console.log('Unhandled webhook action:', action)
    }

    // Log webhook to sync_log
    await pool.query(
      "INSERT INTO sync_log (event_id, platform, status, message) VALUES (NULL, 'eventbrite', 'synced', $1)",
      [`Webhook received: ${action}`]
    )

    // Eventbrite expects a 200 response
    res.status(200).json({ received: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    res.status(200).json({ received: true }) // Always return 200 to prevent retries
  }
})

export default router
