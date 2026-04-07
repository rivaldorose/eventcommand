import axios from 'axios'
import pool from '../db/client'

async function getConnection(): Promise<{ token: string; instanceId: string } | null> {
  const result = await pool.query("SELECT access_token, org_id FROM connections WHERE platform = 'wix'")
  if (!result.rows[0]) return null
  return { token: result.rows[0].access_token, instanceId: result.rows[0].org_id }
}

async function refreshToken(): Promise<string> {
  const conn = await getConnection()
  if (!conn) throw new Error('Wix not connected. Please connect via Settings.')

  const clientId = process.env.WIX_CLIENT_ID
  const clientSecret = process.env.WIX_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Wix credentials not configured')

  const tokenRes = await axios.post('https://www.wixapis.com/oauth2/token', {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    instance_id: conn.instanceId,
  })

  const { access_token } = tokenRes.data

  await pool.query(
    "UPDATE connections SET access_token = $1, updated_at = NOW() WHERE platform = 'wix'",
    [access_token]
  )

  return access_token
}

async function getClient() {
  let conn = await getConnection()
  if (!conn) throw new Error('Wix not connected. Please connect via Settings.')

  // Wix tokens expire after 4 hours, refresh proactively
  const token = await refreshToken()

  return axios.create({
    baseURL: 'https://www.wixapis.com/v1',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function isConnected(): Promise<boolean> {
  const token = await getToken()
  return Boolean(token)
}

export async function createWixEvent(event: {
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
}) {
  const client = await getClient()
  const res = await client.post('/events', {
    event: {
      title: event.title,
      description: event.description,
      scheduling: {
        config: {
          startDate: event.startDate,
          endDate: event.endDate,
        },
      },
      location: {
        name: event.location,
      },
    },
  })
  return res.data
}

export async function updateWixEvent(wixId: string, event: {
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
}) {
  const client = await getClient()
  const res = await client.patch(`/events/${wixId}`, {
    event: {
      title: event.title,
      description: event.description,
      scheduling: {
        config: {
          startDate: event.startDate,
          endDate: event.endDate,
        },
      },
      location: {
        name: event.location,
      },
    },
  })
  return res.data
}

export async function deleteWixEvent(wixId: string) {
  const client = await getClient()
  await client.delete(`/events/${wixId}`)
}
