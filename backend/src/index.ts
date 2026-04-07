import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import eventsRouter from './routes/events'
import organizationsRouter from './routes/organizations'
import syncRouter from './routes/sync'
import authRouter from './routes/auth'
import webhooksRouter from './routes/webhooks'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/events', eventsRouter)
app.use('/api/organizations', organizationsRouter)
app.use('/api/sync', syncRouter)
app.use('/api/auth', authRouter)
app.use('/api/webhooks', webhooksRouter)

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
