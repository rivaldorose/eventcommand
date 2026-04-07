import axios from 'axios'
import pool from '../db/client'

async function getInstanceToken(userId: string): Promise<string | null> {
  const result = await pool.query(
    "SELECT access_token FROM connections WHERE platform = 'wix' AND user_id = $1",
    [userId]
  )
  return result.rows[0]?.access_token || null
}

async function getClient(userId: string) {
  const token = await getInstanceToken(userId)
  if (!token) throw new Error('Wix not connected. Please connect via Settings.')

  return axios.create({
    baseURL: 'https://www.wixapis.com/v1',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function isConnected(userId: string): Promise<boolean> {
  const token = await getInstanceToken(userId)
  return Boolean(token)
}

export async function createWixEvent(userId: string, event: {
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
}) {
  const client = await getClient(userId)
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

export async function updateWixEvent(userId: string, wixId: string, event: {
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
}) {
  const client = await getClient(userId)
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

export async function deleteWixEvent(userId: string, wixId: string) {
  const client = await getClient(userId)
  await client.delete(`/events/${wixId}`)
}
