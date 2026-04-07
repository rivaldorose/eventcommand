import { Router, Request, Response } from 'express'
import axios from 'axios'
import pool from '../db/client'
import { requireAuth } from '../middleware/auth'

const router = Router()

const EVENTBRITE_AUTH_URL = 'https://www.eventbrite.com/oauth/authorize'
const EVENTBRITE_TOKEN_URL = 'https://www.eventbrite.com/oauth/token'
const EVENTBRITE_API = 'https://www.eventbriteapi.com/v3'

// ─── Eventbrite OAuth ───

// Get the OAuth URL (protected — returns URL, frontend redirects)
router.get('/eventbrite/start', requireAuth, (req: Request, res: Response) => {
  const clientId = process.env.EVENTBRITE_CLIENT_ID
  const redirectUri = process.env.EVENTBRITE_REDIRECT_URI

  if (!clientId || !redirectUri) {
    res.status(500).json({ error: 'Eventbrite OAuth not configured' })
    return
  }

  // Encode user_id in state so the callback knows which user to associate
  const state = req.userId
  const url = `${EVENTBRITE_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
  res.json({ url })
})

// OAuth callback (unprotected — receives redirect from Eventbrite)
router.get('/eventbrite/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query
  const userId = state as string
  const clientId = process.env.EVENTBRITE_CLIENT_ID
  const clientSecret = process.env.EVENTBRITE_CLIENT_SECRET
  const redirectUri = process.env.EVENTBRITE_REDIRECT_URI
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

  if (!code || !userId || !clientId || !clientSecret || !redirectUri) {
    res.redirect(`${frontendUrl}/settings?auth=error&message=missing_params`)
    return
  }

  try {
    // Exchange code for token
    const tokenRes = await axios.post(
      EVENTBRITE_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code as string,
        redirect_uri: redirectUri,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    const { access_token, token_type } = tokenRes.data

    // Fetch user/org info
    const meRes = await axios.get(`${EVENTBRITE_API}/users/me/`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    const orgRes = await axios.get(`${EVENTBRITE_API}/users/me/organizations/`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    const orgId = orgRes.data.organizations?.[0]?.id || null
    const orgName = orgRes.data.organizations?.[0]?.name || meRes.data.name || 'Unknown'

    // Upsert connection for this user
    await pool.query(
      `INSERT INTO connections (platform, access_token, token_type, org_id, org_name, user_id, connected_at, updated_at)
       VALUES ('eventbrite', $1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (platform, user_id) DO UPDATE SET
         access_token = $1, token_type = $2, org_id = $3, org_name = $4, updated_at = NOW()`,
      [access_token, token_type || 'Bearer', orgId, orgName, userId]
    )

    res.redirect(`${frontendUrl}/settings?auth=success&platform=eventbrite`)
  } catch (err) {
    console.error('Eventbrite OAuth error:', err)
    res.redirect(`${frontendUrl}/settings?auth=error&platform=eventbrite`)
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
