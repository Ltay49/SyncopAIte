// backend/db/seeds/seed.js
import { pool } from '../connection.js';

const schemaSQL = `
-- DROP in FK order
DROP TABLE IF EXISTS video_tag CASCADE;
DROP TABLE IF EXISTS saved CASCADE;
DROP TABLE IF EXISTS annotation CASCADE;
DROP TABLE IF EXISTS tag CASCADE;
DROP TABLE IF EXISTS video CASCADE;

-- video: simplified
CREATE TABLE video (
  id SERIAL PRIMARY KEY,         -- auto-incrementing integer
  source TEXT NOT NULL,          -- 'youtube' | 'vimeo' | ...
  url TEXT NOT NULL,             -- full video URL
  artist TEXT,                   -- e.g., "Billy Cobham"
  channel TEXT,                  -- uploader/channel name
  title TEXT NOT NULL            -- video title
);

-- annotation: keep rich fields, FK now INTEGER
CREATE TABLE annotation (
  video_id INTEGER PRIMARY KEY REFERENCES video(id) ON DELETE CASCADE,
  why_new TEXT,
  listen_for TEXT,
  groove TEXT,
  moments JSONB,                 -- e.g., [{ "t": "01:12", "note": "..." }]
  practice JSONB,                -- e.g., ["exercise 1", "exercise 2"]
  model_version TEXT,
  annotated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- saved: per-user bookmarks (FK now INTEGER)
CREATE TABLE saved (
  user_id TEXT NOT NULL,
  video_id INTEGER NOT NULL REFERENCES video(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, video_id)
);

-- tags (unchanged)
CREATE TABLE tag (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- join table (FKs now INTEGER)
CREATE TABLE video_tag (
  video_id INTEGER REFERENCES video(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tag(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, tag_id)
);

-- helpful index for saved listing
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved(user_id, saved_at DESC);
`;

async function runSeed() {
  try {
    await pool.query(schemaSQL);
    console.log('✅ Database seeded (simplified schema) successfully');
  } catch (err) {
    console.error('❌ Error seeding database', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
