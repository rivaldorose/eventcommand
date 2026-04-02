CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR(255),
  description TEXT,
  cover_image TEXT,
  status VARCHAR(20) DEFAULT 'upcoming',
  sync_eventbrite BOOLEAN DEFAULT true,
  sync_wix BOOLEAN DEFAULT true,
  eventbrite_sync_status VARCHAR(20) DEFAULT 'not_synced',
  wix_sync_status VARCHAR(20) DEFAULT 'not_synced',
  eventbrite_id VARCHAR(100),
  wix_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
