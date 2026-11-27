# Hidden titles

Takes one film completely off the public website, without deleting anything.

## What it does

- The film page (and the old `/m/` address) answers **410 Gone** with a "page removed" notice and `noindex`.
- The Mini App data feed for that film answers 410.
- The film is taken out of film lists the server gets from TMDB or the site database (search, home page, lists, movie sitemap, saved TMDB data).
- The digital release calendar and its data feed hide it by its full name.

## How to hide or show a film

The film must be on the takedown list (admin Takedowns page). Its entry in the takedown list file needs `"hidden": true`.
There is no button for this yet. The list is read live, so no rebuild or restart is needed.
Remove the flag to show the film again. This does not switch any download link back on.
Pressing Takedown again keeps the flag. Removing the film from the takedown list also removes the flag.

## How matching works

A list entry is removed only when both the TMDB number and the name (or page slug) match, so a series or person with the same number stays.
The release calendar has no numbers, so it matches the whole name.

## Limits

- It does not remove the film from Google at once. Google drops a 410 page when it next visits.
- Text written by hand that mentions the film (for example an article) is not changed.
- Browsers may briefly keep pages already loaded.
- It does not affect Telegram bots.

Code: `src/lib/hidden-titles.ts`, `src/middleware.ts`.
