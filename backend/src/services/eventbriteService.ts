import axios from 'axios'
import pool from '../db/client'

const EVENTBRITE_API = 'https://www.eventbriteapi.com/v3'

async function getToken(): Promise<string | null> {
  const result = await pool.query("SELECT access_token FROM connections WHERE platform = 'eventbrite'")
  return result.rows[0]?.access_token || null
}

async function getOrgId(): Promise<string | null> {
  const result = await pool.query("SELECT org_id FROM connections WHERE platform = 'eventbrite'")
  return result.rows[0]?.org_id || null
}

async function getClient() {
  const token = await getToken()
  if (!token) throw new Error('Eventbrite not connected. Please connect via Settings.')

  return axios.create({
    baseURL: EVENTBRITE_API,
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

export async function createEventbriteEvent(event: {
  title: string
  description: string
  startUtc: string
  endUtc: string
  timezone: string
  currency: string
}) {
  const client = await getClient()
  const orgId = await getOrgId()
  if (!orgId) throw new Error('No Eventbrite organization found')

  const res = await client.post(`/organizations/${orgId}/events/`, {
    event: {
      name: { html: event.title },
      description: { html: event.description },
      start: { utc: event.startUtc, timezone: event.timezone },
      end: { utc: event.endUtc, timezone: event.timezone },
      currency: event.currency,
    },
  })
  return res.data
}

export async function updateEventbriteEvent(eventbriteId: string, event: {
  title: string
  description: string
  startUtc: string
  endUtc: string
  timezone: string
}) {
  const client = await getClient()
  const res = await client.post(`/events/${eventbriteId}/`, {
    event: {
      name: { html: event.title },
      description: { html: event.description },
      start: { utc: event.startUtc, timezone: event.timezone },
      end: { utc: event.endUtc, timezone: event.timezone },
    },
  })
  return res.data
}

export async function deleteEventbriteEvent(eventbriteId: string) {
  const client = await getClient()
  await client.delete(`/events/${eventbriteId}/`)
}

export async function getOrganizerEvents(orgId?: string) {
  const client = await getClient()
  const id = orgId || await getOrgId()
  if (!id) throw new Error('No organization ID')
  const res = await client.get(`/organizations/${id}/events/`)
  return res.data
}

export async function getOrganizer(orgId: string) {
  const client = await getClient()
  const res = await client.get(`/organizations/${orgId}/`)
  return res.data
}

export async function searchOrganizers(query: string) {
  const client = await getClient()
  // Eventbrite doesn't have a direct org search, but we can search events and extract organizers
  const res = await client.get('/events/search/', {
    params: { q: query, expand: 'organizer' },
  })
  return res.data
}
