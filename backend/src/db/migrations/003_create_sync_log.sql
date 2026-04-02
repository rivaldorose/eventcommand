CREATE TABLE IF NOT EXISTS sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  message TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);
