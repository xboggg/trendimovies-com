# Telegram Mini App

Status as of 2026-10-26 (evening). This file is public-safe: no server addresses, absolute infrastructure paths, chat ids or credentials. The private runbook holds those.

## What it is

TrendiMovies opens inside Telegram in two ways. Both are served by this repo.

| | Page | What the user sees |
|---|---|---|
| **New app** | `/app` | A phone-first home built for Telegram: a swipeable hero that mixes movies and series, scrolling rows each with a **More** button, a bottom bar (Home, Search, Movies, Series, My List), and a pop-up with the Telegram download buttons for a movie. No ads. `noindex`. |
| **Old Mini App** | `/` (and every normal page) | The normal website opened inside Telegram. Unchanged. It works because of the same bridge script (below). It is linked from the bottom of `/app` ("Open the full website") and stays as the fallback. |

Nothing changes for visitors who are not inside Telegram.

## Files

| File | Job |
|---|---|
| `src/pages/app.astro` | The `/app` page. Standalone HTML (no site header, footer or ad script). Its styles and scripts are `is:inline` on purpose: Astro scopes normal `<style>` tags, which would not match the elements the script creates. |
| `src/lib/appData.ts` | Reads the website's own pages and builds the rows. Shared by the two endpoints below. Holds the row list (`ROWS`) and the 10-minute cache. |
| `src/pages/api/app/home.ts` | The home: hero, the first 12 titles of each row (plus the row's total), the first 8 reviews. |
| `src/pages/api/app/more.ts` | The list behind one row's **More** button (`?row=trending`, `newmovies`, `newep`, `tvtrending`, `action`, `digital`, `reviews`). At most 30 titles. |
| `src/pages/api/app/list.ts` | The 60 titles behind the **Movies** and **Series** tabs (`?kind=movies` or `series`). |
| `src/pages/api/app/title.ts` | The Telegram delivery buttons for one movie (`?type=movie&id=<tmdb id>`). |
| `public/js/tg-miniapp.js` | The bridge. Does nothing outside Telegram. Loaded by `BaseLayout.astro` and by `app.astro`. |
| `public/js/telegram-web-app.js` | Telegram's own helper script, hosted by this site because the site's security policy only allows its own scripts. |

## How the data works

- `appData.ts` does **not** recompute the rows. It reads the site's own home page and `/digital-releases` page and picks out the rows by their `<h2>` heading, the `<a href="/movie/ID">` or `/tv/ID` cards, the `<h3>` title and the `<span>` badges (quality, episode such as `S01E14`). The app therefore shows the same titles, posters and order as the website.
- **Consequence:** it depends on that markup. If a row disappears from the app, the home page markup changed; fix `parseCards()` and the `ROWS` list in `appData.ts`. If nothing at all can be read, the last good copy is served, or the endpoints answer with an error and the page shows "Could not load" with a link to the full website.
- Digital releases: each `<h2>` on `/digital-releases` is a date and the cards under it release that day. Only today and later are kept, so the app shows real dates ("Tue 27 Oct", "Tomorrow"). "Today" is the server's own local date, not UTC.
- Reviews come from the `movie_reviews` table (latest 40 published; the home shows 8).
- A row on the home shows 12 titles. **More** opens that row's list inside the app, **at most 30 titles** (`MORE_LIMIT` in `appData.ts`), with a link to the website's own "see all" page at the bottom. A row can hold fewer than 30 when the website's own home row has fewer (Trending This Week and Trending TV Series 20, Non-Stop Action 15, Digital Releases 29 at the time of writing).
- The **Movies** and **Series** tabs hold **60 titles each** (`TAB_LIMIT`), loaded the first time the tab is opened. Movies = the newest additions (`rpc/recently_added_movies`, ordered by the moment a file was really added, current and previous year, the same source as the home row Newly Added Movies). Series = the series with the newest episodes (`recent_episode_series`, one entry per series, with its latest episode number).
- Everything is cached in memory for 10 minutes.

## Where the hero and the rows come from

- **App hero** (`home.ts`): up to five slides taken from the home rows, in this order: the first title of Trending This Week (a TMDB weekly trending movie), the first title of New Episodes This Week (a series), the second Trending This Week title, the first Trending TV Series title, the first Newly Added Movies title. Titles already used are skipped, so four or five slides show. Slide tags ("Trending", "New episode", ...) are fixed by position.
- **This is NOT the website's own hero.** The website's hero is built from the top 8 TMDB weekly trending movies plus the top 4 TMDB weekly trending series, interleaved, and is drawn in the browser, so it is not in the page text the app reads.
- **Row sources on the website:** Trending This Week = TMDB weekly trending movies (global, not our audience); Trending TV Series = TMDB weekly trending series; Newly Added Movies = our database (`rpc/recently_added_movies`); New Episodes This Week = our database (`recent_episode_series`) plus TMDB on-the-air; Non-Stop Action = TMDB discover (action, by popularity, 15 shown); Digital Releases = the dated list on `/digital-releases`.

## Movie pop-up: the best 1080p and the best 720p

`title.ts` follows the movie page rules: active `download_links` whose `url` goes through the file-streaming path become `t.me/<delivery bot>?start=<id>`. One of the two delivery bots is chosen by the parity of the id, exactly as in `DownloadSection.svelte`, so a file always maps to the same bot.

The pop-up shows two buttons, the **best 1080p** and the **best 720p** (only the ones that exist). Among files of the same resolution, "best" is decided in this order:

1. a file with no language tag beats a tagged one (a dub must never win just for being bigger);
2. no hard-coded subtitles beats hard-coded;
3. BluRay beats WEB-DL beats WEBRip beats unknown;
4. the larger file.

Every other file (other resolutions, 4K, HDRip, the runners-up) is listed under "Other versions" with its variant, size and language. If a movie has neither 1080p nor 720p, the best remaining file is the main button.

Series do not have a pop-up: tapping a series opens its normal page, which has the season and episode picker with the same Telegram buttons (episodes have far more Telegram links than movies).

## Behaviour

- Tap a **movie**: the pop-up above, plus "Save to My List".
- Tap a **series**, a **review** or a not-yet-released title: opens the normal page. The Telegram Back button returns to `/app`.
- **More**: opens at address `#more=<row>`, a history entry of its own, so Telegram's Back button (and the arrow in the page) closes it and returns to the previous tab. It can also be opened directly by that address.
- **Search** uses the site's `/api/search`.
- **Movies** and **Series** tabs list the titles from the home rows and link to the full lists on the website.
- **My List** is stored in the phone's `localStorage` only, so it is a per-device convenience. Every storage call is wrapped in try/catch.

## The bridge (`tg-miniapp.js`)

Switches on only when the address carries `tgWebAppData` or `tgWebAppPlatform` (Telegram adds it on the first page; the script remembers it in `sessionStorage` for the visit). Inside Telegram it:

- tells Telegram the app is ready and opens it full height, and turns off swipe-down-to-close;
- paints Telegram's top bar in the site colour;
- shows Telegram's own Back button on every page except `/` and `/app`, and also while an in-app "More" list is open (it re-checks when `/app` sends the `tm-nav` event);
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

## Related fixes made with it (2026-10-26)

- **Site search** (`/api/search`): results that actually contain the searched name now come before loose, fuzzy local hits ("clayface" used to list Clap, Face and Claw first). Results that contain the name keep exactly their old order; a query that matches nothing keeps the old order.
- **Home page "Coming to Digital"**: the countdown was one day short ("tomorrow" showed as "Digital in 0 days") because the page turned local midnight into a date through UTC while the server runs on Berlin time. It now reads the date printed on the source page as a local date. **Not changed:** `digital-releases.astro` builds the same kind of UTC date in several places (its cached `iso` values are a day early on this server); its visible dates are correct, and the effect on its logic has not been checked.

## Gotchas

- **Static `.js` is cached for 7 days.** Phones keep the old bridge. When `tg-miniapp.js` changes, bump the `?v=` on its script tag in **both** `BaseLayout.astro` and `app.astro` (currently `v=20261026d`).
- Keep `.js`, `.ts` and `.astro` files on LF line endings. Files written on Windows come out as CRLF and turn a small change into a whole-file diff.
- The site's web server rejects the default `curl` user agent with 403. Use a browser user agent when testing from a shell.
- Test a build before it goes live: build into a throw-away folder as the deploy user and run it on a spare port (set `PORT`; `appData.ts` reads the site through that same port).

## Not built yet

- One-tap "send to my chat" from the app (needs a signed-in-user check of Telegram's launch data).
- A quick pop-up for series (series open their normal page).
- Torrent links inside the app (Telegram cannot open them).
- A direct Mini App link for the group (needs a BotFather setup).
- The menu button for all users (at the time of writing it is on for the owner's chat only).
