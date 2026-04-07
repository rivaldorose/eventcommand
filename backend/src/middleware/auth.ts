import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
)

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }
    req.userId = user.id
    next()
  } catch {
    res.status(401).json({ error: 'Authentication failed' })
  }
}
