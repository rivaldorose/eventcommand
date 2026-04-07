import { Router, Request, Response } from 'express'
import axios from 'axios'
import pool from '../db/client'
import { requireAuth } from '../middleware/auth'

const router = Router()

const EVENTBRITE_API = 'https://www.eventbriteapi.com/v3'

// ─── Eventbrite ───

// Store Eventbrite API token (protected)
router.post('/eventbrite/connect', requireAuth, async (req: Request, res: Response) => {
  const { token } = req.body

  if (!token) {
    res.status(400).json({ error: 'Missing Eventbrite token' })
    return
  }

  try {
    // Verify token by fetching user info
    const meRes = await axios.get(`${EVENTBRITE_API}/users/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const orgRes = await axios.get(`${EVENTBRITE_API}/users/me/organizations/`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const orgId = orgRes.data.organizations?.[0]?.id || null
    const orgName = orgRes.data.organizations?.[0]?.name || meRes.data.name || 'Unknown'

    await pool.query(
      `INSERT INTO connections (platform, access_token, token_type, org_id, org_name, user_id, connected_at, updated_at)
       VALUES ('eventbrite', $1, 'Bearer', $2, $3, $4, NOW(), NOW())
       ON CONFLICT (platform, user_id) DO UPDATE SET
         access_token = $1, org_id = $2, org_name = $3, updated_at = NOW()`,
      [token, orgId, orgName, req.userId]
    )

    res.json({ success: true, orgId, orgName })
  } catch (err: any) {
    console.error('Eventbrite connect error:', err?.response?.data || err?.message)
    res.status(400).json({ error: 'Invalid Eventbrite token' })
  }
})

// Disconnect Eventbrite (protected)
router.delete('/eventbrite', requireAuth, async (req: Request, res: Response) => {
  try {
    await pool.query(
      "DELETE FROM connections WHERE platform = 'eventbrite' AND user_id = $1",
      [req.userId]
    )
    res.json({ message: 'Eventbrite disconnected' })
  } catch (err) {
    console.error('Disconnect error:', err)
    res.status(500).json({ error: 'Failed to disconnect' })
  }
})

// ─── Wix App Install (unprotected — called by Wix iframe) ───

router.get('/wix/install', async (req: Request, res: Response) => {
  const instance = req.query.instance as string | undefined

  if (!instance) {
    res.send('<html><body><h2>EventCommand - Wix Integration</h2><p>This page is loaded by Wix when installing the app.</p></body></html>')
    return
  }

  try {
    const parts = instance.split('.')
    let instanceId = ''

    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
      instanceId = payload.instanceId
    }

    // For Wix installs, we store without user_id initially
    // The user links it later from their EventCommand settings
    await pool.query(
      `INSERT INTO connections (platform, access_token, token_type, org_id, org_name, connected_at, updated_at)
       VALUES ('wix', $1, 'instance', $2, 'Wix Site', NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      [instance, instanceId]
    )

    res.send(`
      <html>
        <body style="font-family: Inter, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #FAFAFA;">
          <div style="text-align: center; background: white; padding: 40px; border-radius: 14px; border: 1px solid #EBEBEB;">
            <h2 style="color: #0A0A0A; margin: 0 0 8px;">EventCommand Connected!</h2>
            <p style="color: #666; margin: 0;">Your Wix site is now linked to EventCommand.</p>
          </div>
        </body>
      </html>
    `)
  } catch (err: any) {
    console.error('Wix install error:', err?.message || err)
    res.status(500).json({ error: 'Failed to connect Wix' })
  }
})

// Connect Wix manually (protected)
router.post('/wix/connect', requireAuth, async (req: Request, res: Response) => {
  const { instanceToken } = req.body

  if (!instanceToken) {
    res.status(400).json({ error: 'Missing Wix instance token' })
    return
  }

  try {
    let instanceId = ''
    const parts = instanceToken.split('.')
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
      instanceId = payload.instanceId
    }

    await pool.query(
      `INSERT INTO connections (platform, access_token, token_type, org_id, org_name, user_id, connected_at, updated_at)
       VALUES ('wix', $1, 'instance', $2, 'Wix Site', $3, NOW(), NOW())
       ON CONFLICT (platform, user_id) DO UPDATE SET
         access_token = $1, org_id = $2, updated_at = NOW()`,
      [instanceToken, instanceId, req.userId]
    )

    res.json({ success: true })
  } catch (err) {
    console.error('Wix connect error:', err)
    res.status(500).json({ error: 'Failed to connect Wix' })
  }
})

// Disconnect Wix (protected)
router.delete('/wix', requireAuth, async (req: Request, res: Response) => {
  try {
    await pool.query(
      "DELETE FROM connections WHERE platform = 'wix' AND user_id = $1",
      [req.userId]
    )
    res.json({ message: 'Wix disconnected' })
  } catch (err) {
    console.error('Disconnect error:', err)
    res.status(500).json({ error: 'Failed to disconnect' })
  }
})

// ─── Connection Status (protected) ───

router.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT platform, org_id, org_name, connected_at FROM connections WHERE user_id = $1',
      [req.userId]
    )

    const connections: Record<string, { connected: boolean; orgId?: string; orgName?: string; connectedAt?: string }> = {
      eventbrite: { connected: false },
      wix: { connected: false },
    }

    for (const row of result.rows) {
      connections[row.platform] = {
        connected: true,
        orgId: row.org_id,
        orgName: row.org_name,
        connectedAt: row.connected_at,
      }
    }

    res.json(connections)
  } catch (err) {
    console.error('Status error:', err)
    res.json({ eventbrite: { connected: false }, wix: { connected: false } })
  }
})

export default router
