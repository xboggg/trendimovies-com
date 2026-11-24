-- Posts pasted by the editor in /admin/news (e.g. from a private channel). Private: not readable by the public role.
BEGIN;
CREATE TABLE IF NOT EXISTS news_leads (
  id         serial PRIMARY KEY,
  text       text NOT NULL,
  link       text,
  posted_on  date,
  status     text NOT NULL DEFAULT 'new' CHECK (status IN ('new','working','done','failed')),
  note       text,
  item_id    integer,
  created_at timestamptz DEFAULT now()
);
REVOKE ALL ON news_leads FROM PUBLIC;
REVOKE ALL ON news_leads FROM web_anon;
GRANT ALL ON news_leads TO trendimovies;
GRANT USAGE, SELECT ON SEQUENCE news_leads_id_seq TO trendimovies;
COMMIT;
