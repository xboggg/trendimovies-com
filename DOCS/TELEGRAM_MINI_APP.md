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
| `src/pages/api/app/browse.ts` | The **Movies** and **Series** tabs: 60 titles per page with filters (`?kind=movies` or `series`, optional `genre`, `lang`, `year`, `rating=1`, `nolly=1`, `running=1`, `sort`, `page`). Every value is checked against fixed lists in `appData.ts`; anything else is ignored. |
| `src/pages/api/app/title.ts` | The Telegram delivery buttons for one movie (`?type=movie&id=<tmdb id>`). |
| `public/js/tg-miniapp.js` | The bridge. Does nothing outside Telegram. Loaded by `BaseLayout.astro` and by `app.astro`. |
| `public/js/telegram-web-app.js` | Telegram's own helper script, hosted by this site because the site's security policy only allows its own scripts. |

## How the data works

- `appData.ts` does **not** recompute the rows. It reads the site's own home page and `/digital-releases` page and picks out the rows by their `<h2>` heading, the `<a href="/movie/ID">` or `/tv/ID` cards, the `<h3>` title and the `<span>` badges (quality, episode such as `S01E14`). The app therefore shows the same titles, posters and order as the website.
- **Consequence:** it depends on that markup. If a row disappears from the app, the home page markup changed; fix `parseCards()` and the `ROWS` list in `appData.ts`. If nothing at all can be read, the last good copy is served, or the endpoints answer with an error and the page shows "Could not load" with a link to the full website.
- Digital releases: each `<h2>` on `/digital-releases` is a date and the cards under it release that day. Only today and later are kept, so the app shows real dates ("Tue 27 Oct", "Tomorrow"). "Today" is the server's own local date, not UTC.
- Reviews come from the `movie_reviews` table (latest 40 published; the home shows 8).
- A row on the home shows 12 titles. **More** opens that row's list inside the app, **at most 30 titles** (`MORE_LIMIT` in `appData.ts`), with a link to the website's own "see all" page at the bottom. A row can hold fewer than 30 when the website's own home row has fewer (Trending This Week and Trending TV Series 20, Non-Stop Action 15, Digital Releases 29 at the time of writing).
- The **Movies** and **Series** tabs show **60 titles per page** with a **Show more** button and a filter bar (see "Filters" below). The first page loads when the tab is first opened.
- Everything is cached in memory for 10 minutes.

## Where the hero and the rows come from

- **App hero** (`home.ts`, data from `parseHero()` in `appData.ts`): **the website's own hero, all 12 slides in the same order** (top 8 TMDB weekly trending movies plus top 4 weekly trending series, interleaved). The website passes those slides to its hero component as props and Astro writes the props into the home page, so the app reads them from there: **no TMDB call and nothing extra to wait for** (the home page is already read for the rows and cached for 10 minutes). The app shows each slide's poster. If the home page markup changes and the hero cannot be read, the app falls back to a smaller hero built from the rows (first Trending This Week, first New Episodes, second Trending, first Trending TV, first Newly Added Movies).
- **Logo:** the app home shows the website's own wordmark (`/images/logo-header.png`, the same file as the site header) instead of a text title. The other tabs keep their text titles.
- **Row sources on the website:** Trending This Week = TMDB weekly trending movies (global, not our audience); Trending TV Series = TMDB weekly trending series; Newly Added Movies = our database (`rpc/recently_added_movies`); New Episodes This Week = our database (`recent_episode_series`) plus TMDB on-the-air; Non-Stop Action = TMDB discover (action, by popularity, 15 shown); Digital Releases = the dated list on `/digital-releases`.

## Movie pop-up: the best 720p, then the best 1080p

`title.ts` follows the movie page rules: active `download_links` whose `url` goes through the file-streaming path become `t.me/<delivery bot>?start=<id>`. One of the two delivery bots is chosen by the parity of the id, exactly as in `DownloadSection.svelte`, so a file always maps to the same bot.

The pop-up shows two buttons, the **best 720p first, then the best 1080p** (the same order as the movie page; only the ones that exist). Among files of the same resolution, "best" is decided in this order:

1. a file with no language tag beats a tagged one (a dub must never win just for being bigger);
2. no hard-coded subtitles beats hard-coded;
3. BluRay beats WEB-DL beats WEBRip beats unknown;
4. the larger file.

Every other file (other resolutions, 4K, HDRip, the runners-up) is listed under "Other versions" with its variant, size and language, in the website's order (720p, 1080p, 4K, 480p, HDRip). If a movie has neither 1080p nor 720p, the best remaining file is the main button.

Series do not have a pop-up: tapping a series opens its normal page, which has the season and episode picker with the same Telegram buttons (episodes have far more Telegram links than movies).

## Filters (Movies, Series, Search)

The rules copy the website's own `/movies/latest` page so the app and the site agree. **Quality is deliberately not a filter** (on the site it only matters when a file is delivered on Telegram, where the pop-up offers 720p and 1080p).

| | Movies | Series |
|---|---|---|
| Source | `movies` table, only titles with files (`has_downloads`) | view `series_with_downloads` (series with at least one active episode file; 6,148 of 6,567 at the time) |
| **Sort** | Newest added (default, same as the website's Latest Movies page), Top rated, Most popular, Release date | New episodes (default; the series with the newest files, with their episode number), Top rated, Most popular, Newest shows |
| **Genre** | the website's 18 genres | 14 TV genres (Drama, Comedy, Sci-Fi & Fantasy, Crime, Animation, Action & Adventure, Mystery, Documentary, Family, Reality, Kids, War & Politics, Western, Soap) |
| **Year** | 2026, 2025, 2024, 2020–23, 2010s, Before 2010 | same |
| **Language** | English, Indian, Chinese, Japanese, French, Korean, Spanish | same |
| **7+ rating** | `vote_average >= 7` | same |
| Extra | **Nigerian** (matched on production country, as on the website, because Nigerian films are tagged English) | **Still running** (status Returning Series or In Production) |

- The rating sort requires a vote floor (movies 200 votes, series 100); without it the top of the list is titles with no votes at a meaningless 10.0.
- Movies store genres as plain names (`["Action"]`), series store them as objects (`[{"id": 18, "name": "Drama"}]`); `browse()` uses the right match for each.
- With the default series sort (New episodes) the filters narrow the list of series that had files added in the last 7 days, so a narrow filter can return only a few shows.
- **Search** has its own two filters: **Show** (all / movies / series, sent to the site's search as `type`) and **Year** (applied to the results already returned, using each result's year). Genre is not offered in Search because search results carry no genres.
- **More lists** (the **More ›** buttons) are curated rows and have no filters; they link to the website's own "see all" page.
- Each answer is cached in memory for 60 seconds. All queries measured under 200 ms.

## The episode number on a "New Episodes" card

The New Episodes row (website home, `/series/new-episodes`, and the app) reads the database view `recent_episode_series`: one entry per series that had a file added in the last 7 days. Since 2026-10-27 the number shown is the **highest episode that received a file in those 7 days** (before, it was the episode whose file was added last, so a batch of older episodes made a finished season show e.g. S01E04 when E08 was there; 99 of 195 shows were affected). The order of the row is unchanged (by the time of the newest file). A show whose only file this week is an old episode still shows that episode: the label means "newest episode that got a file this week", not "newest aired episode".

## Behaviour

- Tap a **movie**: the pop-up above, plus "Save to My List".
- Tap a **series**, a **review** or a not-yet-released title: opens the normal page. The Telegram Back button returns to `/app`.
- **More**: opens at address `#more=<row>`, a history entry of its own, so Telegram's Back button (and the arrow in the page) closes it and returns to the previous tab. It can also be opened directly by that address.
- **Search** uses the site's `/api/search`.
- **Movies** and **Series** tabs: filter bar, 60 per page, Show more. They also link to the full lists on the website.
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
