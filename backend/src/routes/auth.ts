import { Router, Request, Response } from 'express'
import axios from 'axios'
import pool from '../db/client'

const router = Router()

const EVENTBRITE_AUTH_URL = 'https://www.eventbrite.com/oauth/authorize'
const EVENTBRITE_TOKEN_URL = 'https://www.eventbrite.com/oauth/token'
const EVENTBRITE_API = 'https://www.eventbriteapi.com/v3'

// ─── Eventbrite OAuth ───

// Start OAuth flow
router.get('/eventbrite', (_req: Request, res: Response) => {
  const clientId = process.env.EVENTBRITE_CLIENT_ID
  const redirectUri = process.env.EVENTBRITE_REDIRECT_URI

  if (!clientId || !redirectUri) {
    res.status(500).json({ error: 'Eventbrite OAuth not configured. Set EVENTBRITE_CLIENT_ID and EVENTBRITE_REDIRECT_URI.' })
    return
  }

  const authUrl = `${EVENTBRITE_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`
  res.redirect(authUrl)
})

// OAuth callback
router.get('/eventbrite/callback', async (req: Request, res: Response) => {
  const { code } = req.query
  const clientId = process.env.EVENTBRITE_CLIENT_ID
  const clientSecret = process.env.EVENTBRITE_CLIENT_SECRET
  const redirectUri = process.env.EVENTBRITE_REDIRECT_URI
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

  if (!code || !clientId || !clientSecret || !redirectUri) {
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

    // Fetch user/org info from Eventbrite
    const meRes = await axios.get(`${EVENTBRITE_API}/users/me/`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    const orgRes = await axios.get(`${EVENTBRITE_API}/users/me/organizations/`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    const orgId = orgRes.data.organizations?.[0]?.id || null
    const orgName = orgRes.data.organizations?.[0]?.name || meRes.data.name || 'Unknown'

    // Upsert connection in DB
    await pool.query(
      `INSERT INTO connections (platform, access_token, token_type, org_id, org_name, connected_at, updated_at)
       VALUES ('eventbrite', $1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (platform) DO UPDATE SET
         access_token = $1, token_type = $2, org_id = $3, org_name = $4, updated_at = NOW()`,
      [access_token, token_type || 'Bearer', orgId, orgName]
    )

    res.redirect(`${frontendUrl}/settings?auth=success&platform=eventbrite`)
  } catch (err) {
    console.error('Eventbrite OAuth error:', err)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/settings?auth=error&platform=eventbrite`)
  }
})

// Disconnect Eventbrite
router.delete('/eventbrite', async (_req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM connections WHERE platform = 'eventbrite'")
    res.json({ message: 'Eventbrite disconnected' })
  } catch (err) {
    console.error('Disconnect error:', err)
    res.status(500).json({ error: 'Failed to disconnect' })
  }
})

// ─── Wix OAuth ───

// Start Wix OAuth flow
router.get('/wix', (_req: Request, res: Response) => {
  const clientId = process.env.WIX_CLIENT_ID
  const redirectUri = process.env.WIX_REDIRECT_URI

  if (!clientId || !redirectUri) {
    res.status(500).json({ error: 'Wix OAuth not configured. Set WIX_CLIENT_ID and WIX_REDIRECT_URI.' })
    return
  }

  const authUrl = `https://www.wix.com/installer/install?token=${clientId}&appId=${clientId}&redirectUrl=${encodeURIComponent(redirectUri)}`
  res.redirect(authUrl)
})

// Wix OAuth callback
router.get('/wix/callback', async (req: Request, res: Response) => {
  const { code, instanceId } = req.query
  const clientId = process.env.WIX_CLIENT_ID
  const clientSecret = process.env.WIX_CLIENT_SECRET
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

  if (!code || !clientId || !clientSecret) {
    res.redirect(`${frontendUrl}/settings?auth=error&platform=wix`)
    return
  }

  try {
    const tokenRes = await axios.post('https://www.wixapis.com/oauth/access', {
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
    })

    const { access_token, refresh_token } = tokenRes.data

    await pool.query(
      `INSERT INTO connections (platform, access_token, refresh_token, org_id, org_name, connected_at, updated_at)
       VALUES ('wix', $1, $2, $3, 'Wix Site', NOW(), NOW())
       ON CONFLICT (platform) DO UPDATE SET
         access_token = $1, refresh_token = $2, org_id = $3, updated_at = NOW()`,
      [access_token, refresh_token || null, instanceId || null]
    )

    res.redirect(`${frontendUrl}/settings?auth=success&platform=wix`)
  } catch (err) {
    console.error('Wix OAuth error:', err)
    res.redirect(`${frontendUrl}/settings?auth=error&platform=wix`)
  }
})

// Disconnect Wix
router.delete('/wix', async (_req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM connections WHERE platform = 'wix'")
    res.json({ message: 'Wix disconnected' })
  } catch (err) {
    console.error('Disconnect error:', err)
    res.status(500).json({ error: 'Failed to disconnect' })
  }
})

// ─── Connection Status ───

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT platform, org_id, org_name, connected_at FROM connections')

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
    res.json({
      eventbrite: { connected: false },
      wix: { connected: false },
    })
  }
})

export default router
