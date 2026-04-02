CREATE TABLE IF NOT EXISTS followed_orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eventbrite_org_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  event_count INTEGER DEFAULT 0,
  avatar_initials VARCHAR(4),
  followed_at TIMESTAMPTZ DEFAULT NOW()
);
