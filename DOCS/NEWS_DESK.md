# News desk

The film and TV news section: `/news`, `/news/<slug>`, the home page news block, and the review screen at `/admin/news`.

Server paths and credentials are kept in the private runbook, not here.

## How a story gets published

1. A scheduled collector picks up leads and looks for a real report from an established outlet. A lead is only a lead: its text and pictures are not copied.
2. It writes a short original item, credits and links the source, and adds a picture.
3. The item waits as a draft. The editor publishes it with two taps. Automatic publishing is a switch and is off by default.

There is no delete action. Reject can be undone.

## Pictures, in order of preference

TMDB backdrop, official trailer picture, TMDB photo of the main person, topic tile. Covers are upgraded when a film picture becomes available. The editor can pick another picture on the review screen.

## Catch-up and pasted posts

- Catch-up items keep their original date and stay drafts until published.
- The editor can paste a post on the review screen. It follows the same source check and always becomes a draft.

## Telegram news channel

Newly published news stories and blog posts are sent to a Telegram channel as a picture, headline, short summary and site link.

- Connect and switch on or off in `/admin/news`. The bot token is saved on the server only and is never shown again.
- Only items published after posting was switched on, and within the last 6 hours, are sent.
- Up to 8 posts a day, one at a time, at least 20 minutes apart.
- News items need a picture and a source; blog posts need a picture. Titles on the takedown list are never posted.

## Visit tracking for channel links

Channel links carry `utm_source=telegram&utm_medium=channel`. On such a landing the tracking script in `src/layouts/BaseLayout.astro` saves the visit's `referrer` as `Telegram channel (news)`, `Telegram channel (blog)` or `Telegram channel`. Other visits keep the browser's referrer. Only the landing page is labelled.

## Database

`news_items` (private), `news_public` (published items only, the only one public pages read), `news_leads` (private), `tg_posts` (private). The SQL is in `scripts/ops/news-desk/`.

## Code

- Collector and channel poster: `scripts/ops/news-desk/` (copies of what runs on the server)
- Site: `src/lib/news.ts`, `src/lib/news-store.ts`, `src/pages/api/admin/news.ts`, `src/components/admin/NewsManager.svelte`, `src/pages/news/`
