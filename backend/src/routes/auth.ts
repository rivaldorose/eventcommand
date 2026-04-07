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

// ─── Wix App Install ───

// Called when a user installs the app on their Wix site (embedded in iframe)
router.get('/wix/install', async (req: Request, res: Response) => {
  const clientId = process.env.WIX_CLIENT_ID
  const clientSecret = process.env.WIX_CLIENT_SECRET

  // Log all query params to debug what Wix sends
  console.log('Wix install - query params:', JSON.stringify(req.query))

  const instance = req.query.instance as string | undefined

  if (!clientId || !clientSecret) {
    res.status(500).json({ error: 'Wix credentials not configured' })
    return
  }

  if (!instance) {
    // Show a simple HTML page if no instance (direct browser visit)
    res.send('<html><body><h2>EventCommand - Wix Integration</h2><p>This page is loaded by Wix when installing the app.</p></body></html>')
    return
  }

  try {
    // Decode instance to get instanceId and site info
    const parts = instance.split('.')
    let instanceId: string = ''
    let siteOwnerId: string = ''

    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
      instanceId = payload.instanceId
      siteOwnerId = payload.siteOwnerId || ''
    }

    console.log('Wix: storing instance token for instanceId:', instanceId)

    // Store the full signed instance as the access token
    // Wix REST API accepts the signed instance directly in the Authorization header
    await pool.query(
      `INSERT INTO connections (platform, access_token, token_type, org_id, org_name, connected_at, updated_at)
       VALUES ('wix', $1, 'instance', $2, 'Wix Site', NOW(), NOW())
       ON CONFLICT (platform) DO UPDATE SET
         access_token = $1, org_id = $2, updated_at = NOW()`,
      [instance, instanceId]
    )

    // Test the connection by making a simple API call
    try {
      const testRes = await axios.get('https://www.wixapis.com/site-properties/v4/properties', {
        headers: { Authorization: instance },
      })
      const siteName = testRes.data?.properties?.siteDisplayName || 'Wix Site'

      await pool.query(
        "UPDATE connections SET org_name = $1 WHERE platform = 'wix'",
        [siteName]
      )

      res.send(`
        <html>
          <body style="font-family: Inter, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #FAFAFA;">
            <div style="text-align: center; background: white; padding: 40px; border-radius: 14px; border: 1px solid #EBEBEB;">
              <h2 style="color: #0A0A0A; margin: 0 0 8px;">EventCommand Connected!</h2>
              <p style="color: #666; margin: 0;">Site "${siteName}" is now linked. Events will sync automatically.</p>
            </div>
          </body>
        </html>
      `)
    } catch (testErr) {
      // Connection stored but couldn't verify — still OK
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
    }
  } catch (err: any) {
    console.error('Wix install error:', err?.message || err)
    res.status(500).json({ error: 'Failed to connect Wix', details: err?.message })
  }
})

// Connect Wix manually with instance ID (for frontend settings page)
router.post('/wix/connect', async (req: Request, res: Response) => {
  const { instanceId } = req.body
  const clientId = process.env.WIX_CLIENT_ID
  const clientSecret = process.env.WIX_CLIENT_SECRET

  if (!instanceId || !clientId || !clientSecret) {
    res.status(400).json({ error: 'Missing instanceId or Wix credentials' })
    return
  }

  try {
    const tokenRes = await axios.post('https://www.wixapis.com/oauth2/token', {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      instance_id: instanceId,
    })

    const { access_token } = tokenRes.data

    await pool.query(
      `INSERT INTO connections (platform, access_token, token_type, org_id, org_name, connected_at, updated_at)
       VALUES ('wix', $1, 'Bearer', $2, 'Wix Site', NOW(), NOW())
       ON CONFLICT (platform) DO UPDATE SET
         access_token = $1, org_id = $2, updated_at = NOW()`,
      [access_token, instanceId]
    )

    res.json({ success: true, message: 'Wix connected' })
  } catch (err) {
    console.error('Wix connect error:', err)
    res.status(500).json({ error: 'Failed to connect Wix' })
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
