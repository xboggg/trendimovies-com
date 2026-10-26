# Telegram Mini App

Status as of 2026-10-26. This file is public-safe: no server addresses, absolute infrastructure paths, chat ids or credentials. The private runbook holds those.

## What it is

TrendiMovies opens inside Telegram in two ways. Both are served by this repo.

| | Page | What the user sees |
|---|---|---|
| **New app** | `/app` | A phone-first home built for Telegram: a swipeable hero that mixes movies and series, scrolling rows, a bottom bar (Home, Search, Movies, Series, My List), a pop-up with the Telegram download buttons for a movie. No ads. `noindex`. |
| **Old Mini App** | `/` (and every normal page) | The normal website opened inside Telegram. Unchanged. It works because of the same bridge script (below). It is linked from the bottom of `/app` ("Open the full website") and stays as the fallback. |

Nothing changes for visitors who are not inside Telegram.

## Files

| File | Job |
|---|---|
| `src/pages/app.astro` | The `/app` page. Standalone HTML (no site header, footer or ad script). Its styles and scripts are `is:inline` on purpose: Astro scopes normal `<style>` tags, which would not match the elements the script creates. |
| `src/pages/api/app/home.ts` | Data for the home: hero, rows, digital releases with dates, latest reviews. |
| `src/pages/api/app/title.ts` | The Telegram delivery buttons for one movie (`?type=movie&id=<tmdb id>`). |
| `public/js/tg-miniapp.js` | The bridge. Does nothing outside Telegram. Loaded by `BaseLayout.astro` and by `app.astro`. |
| `public/js/telegram-web-app.js` | Telegram's own helper script, hosted by this site because the site's security policy only allows its own scripts. |

## How the data works

- `home.ts` does **not** recompute the rows. It reads the site's own home page and `/digital-releases` page and picks out the rows by their `<h2>` heading, the `<a href="/movie/ID">` or `/tv/ID` cards, the `<h3>` title and the `<span>` badges (quality, episode such as `S01E14`). The app therefore always shows the same titles, posters and order as the website.
- **Consequence:** it depends on that markup. If a row disappears from the app, the home page markup changed; fix `parseCards()` and the `SECTIONS` list in `home.ts`. If nothing at all can be read, the endpoint returns the last good copy, or an error that makes the page show "Could not load" with a link to the full website.
- Digital releases: each `<h2>` on `/digital-releases` is a date and the cards under it release that day. Only today and later are kept, so the app shows real dates ("Tue 27 Oct", "Tomorrow").
- Reviews come from the `movie_reviews` table (latest 8 published).
- Result is cached in memory for 10 minutes.
- `title.ts` follows the movie page rules: active `download_links` whose `url` goes through the file-streaming path become `t.me/<delivery bot>?start=<id>`. One of the two delivery bots is chosen by the parity of the id, exactly as in `DownloadSection.svelte`, so a file always maps to the same bot.

## Behaviour

- Tap a **movie**: a pop-up with "Get 1080p in Telegram" (best quality first), other qualities behind a tap, "Save to My List". If the movie has no Telegram file, it says so and links to the movie page.
- Tap a **series**, a **review** or a not-yet-released title: opens the normal page. The Telegram Back button returns to `/app`.
- **Search** uses the site's `/api/search`.
- **Movies** and **Series** tabs list the titles from the home rows (not the whole catalogue) and link to the full lists on the website.
- **My List** is stored in the phone's `localStorage` only, so it is a per-device convenience. Every storage call is wrapped in try/catch.

## The bridge (`tg-miniapp.js`)

Switches on only when the address carries `tgWebAppData` or `tgWebAppPlatform` (Telegram adds it on the first page; the script remembers it in `sessionStorage` for the visit). Inside Telegram it:

- tells Telegram the app is ready and opens it full height, and turns off swipe-down-to-close;
- paints Telegram's top bar in the site colour;
- shows Telegram's own Back button on every page except `/` and `/app`;
- opens `t.me` links through Telegram, so the download buttons open the delivery bot;
- sends direct file downloads (`download` links and the file-streaming path) to the phone's browser, because Telegram's in-app browser silently blocks file downloads;
- sends links to other websites to the phone's browser.

Every step is wrapped so a failure cannot break the page.

## Turning it on in Telegram

The entry point is the bot's **menu button** (Bot API `setChatMenuButton`, type `web_app`).

- A menu button can be set for **one chat** (used for testing) or for **everyone**. A bot has only one menu button, so switching it on for everyone replaces the commands button in private chats; typing `/` still shows the commands.
- Open the new app: set the menu button URL to `<site>/app`.
- Go back to the old Mini App: set the URL to the site root.
- Remove it: set the menu button type back to `commands`.
- The helper script for this lives with the bot, not in this repo.

## Gotchas

- **Static `.js` is cached for 7 days.** Phones keep the old bridge. When `tg-miniapp.js` changes, bump the `?v=` on its script tag in **both** `BaseLayout.astro` and `app.astro`.
- Keep `.js` and `.astro` files on LF line endings. Files written on Windows come out as CRLF and turn a small change into a whole-file diff.
- The site's web server rejects the default `curl` user agent with 403. Use a browser user agent when testing from a shell.
- After a build and restart, check that the process on the web port is the one PM2 tracks.
- The GitHub deploy workflow was failing before this work started (see `OPERATIONS.md`); the live site was built and restarted by hand.

## Not built yet

- One-tap "send to my chat" from the app (needs a signed-in-user check of Telegram's launch data).
- A quick pop-up for series (series open their normal page).
- Torrent links inside the app (Telegram cannot open them).
- A direct Mini App link for the group (needs a BotFather setup).
- The menu button for all users (at the time of writing it is on for the owner's chat only).
