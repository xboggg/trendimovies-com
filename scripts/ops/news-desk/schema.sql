-- TrendiMovies News desk (24 Nov 2026)
-- news_items = everything (drafts, rejected, skipped, origin text). NOT readable by the public role.
-- news_public = view of PUBLISHED items only, safe columns only. This is all the website's public pages can read.
BEGIN;

CREATE TABLE IF NOT EXISTS news_items (
  id            serial PRIMARY KEY,
  slug          text UNIQUE NOT NULL,
  title         text NOT NULL,
  summary       text,
  body          text,
  points        text[] DEFAULT '{}',
  category      text DEFAULT 'industry',
  cover_image   text,
  poster_image  text,
  related_tmdb_id integer,
  related_type  text,
  film_title    text,
  source_name   text,
  source_url    text,
  origin        text,                 -- 'channel' | 'feed' | 'manual'
  origin_ref    text UNIQUE,          -- channel post id or feed link (stops the same story being picked up twice)
  origin_text   text,                 -- what the lead said; admin screen only, never public
  confidence    text DEFAULT 'low',   -- 'high' = source found and facts match, 'low' = no source found
  status        text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','rejected','skipped')),
  skip_reason   text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  published_at  timestamptz
);
CREATE INDEX IF NOT EXISTS idx_news_status_pub ON news_items (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_tmdb ON news_items (related_tmdb_id) WHERE related_tmdb_id IS NOT NULL;

CREATE OR REPLACE VIEW news_public AS
  SELECT id, slug, title, summary, body, points, category, cover_image, poster_image,
         related_tmdb_id, related_type, film_title, source_name, source_url, published_at
  FROM news_items
  WHERE status = 'published' AND published_at IS NOT NULL AND published_at <= now();

REVOKE ALL ON news_items FROM PUBLIC;
REVOKE ALL ON news_items FROM web_anon;
GRANT ALL ON news_items TO trendimovies;
GRANT USAGE, SELECT ON SEQUENCE news_items_id_seq TO trendimovies;
GRANT SELECT ON news_public TO web_anon;
GRANT ALL ON news_public TO trendimovies;
COMMIT;
