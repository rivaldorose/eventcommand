import axios from 'axios'
import pool from '../db/client'

async function getToken(): Promise<string | null> {
  const result = await pool.query("SELECT access_token FROM connections WHERE platform = 'wix'")
  return result.rows[0]?.access_token || null
}

async function getClient() {
  const token = await getToken()
  if (!token) throw new Error('Wix not connected. Please connect via Settings.')

  return axios.create({
    baseURL: 'https://www.wixapis.com/events/v1',
    headers: {
      Authorization: token,
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
