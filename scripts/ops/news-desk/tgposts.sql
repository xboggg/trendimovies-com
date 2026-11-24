-- What has been posted to the Telegram news channel (private; one row per story/blog post).
BEGIN;
CREATE TABLE IF NOT EXISTS tg_posts (
  kind       text NOT NULL,                 -- 'news' | 'blog'
  item_id    integer NOT NULL,
  posted_at  timestamptz DEFAULT now(),
  message_id bigint,
  status     text DEFAULT 'sent',           -- 'sent' | 'failed'
  error      text,
  tries      integer DEFAULT 0,
  PRIMARY KEY (kind, item_id)
);
REVOKE ALL ON tg_posts FROM PUBLIC;
REVOKE ALL ON tg_posts FROM web_anon;
GRANT ALL ON tg_posts TO trendimovies;
COMMIT;
