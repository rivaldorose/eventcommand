import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import eventsRouter from './routes/events'
import organizationsRouter from './routes/organizations'
import syncRouter from './routes/sync'
import authRouter from './routes/auth'
import webhooksRouter from './routes/webhooks'
import { requireAuth } from './middleware/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://eventcommand.vercel.app',
    'https://frontend-fawn-one-44.vercel.app',
    /\.vercel\.app$/,
  ],
}))
app.use(express.json())

app.use('/api/events', requireAuth, eventsRouter)
app.use('/api/organizations', requireAuth, organizationsRouter)
app.use('/api/sync', requireAuth, syncRouter)
app.use('/api/auth', authRouter) // handles its own auth per-route
app.use('/api/webhooks', webhooksRouter) // external webhooks, no user auth

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'eventcommand-api' })
})

// Only listen in non-Vercel environments
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`EventCommand API running on http://localhost:${PORT}`)
  })
}

export default app
