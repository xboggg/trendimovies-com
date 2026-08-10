# Download-Link Operations

This runbook covers Telegram file assignment, inactive-link audits, and safe cleanup for movies and series. These are data operations; do not change application code unless a confirmed application defect requires it.

## Non-negotiable safeguards

- Work on exactly one content type: `movie` or `series`.
- Start read-only. Record the exact database row IDs before any mutation.
- Never delete an active link.
- Never delete an inactive-only link until a replacement has been assigned and verified.
- Use a transaction for related writes and stop on the first error.
- Re-query affected and active rows after every mutation.
- Do not rely on title text alone when IDs, TMDB IDs, seasons, episodes, and qualities are available.

## Inactive-link audit

Filter the admin download page by content type and `Inactive (dead) only`, then audit every page. Export a CSV containing at least:

- inactive download-row ID
- content type
- movie or series ID
- title and year
- season and episode for series
- inactive quality, source, size, and status
- matching active row IDs and qualities
- classification and recommended action

Classify each inactive row into exactly one group:

| Classification | Meaning | Default action |
| --- | --- | --- |
| Same content and same quality has an active link | A direct active replacement exists | Eligible for deletion after final row-level verification |
| Content has active links only in other qualities | At least one download works, but not at the inactive quality | Report separately; delete only when the approved policy requires one working quality rather than quality-for-quality replacement |
| Content has no active link | The title or episode has no working download | Do not delete; locate and assign a replacement first |

For movies, compare within the same movie record. For series, compare within the same series, season, and episode; a working link for a different episode is not a replacement.

## Safe deletion procedure

1. Freeze the audited candidate list as exact inactive row IDs.
2. Immediately before deletion, re-query each candidate and its active matches.
3. Assert the candidate still has `active = false` and the content type is the intended type.
4. Assert the approved active replacement still exists and is active.
5. Delete only the inactive candidate IDs inside a transaction.
6. Return or re-query deleted IDs and verify the count matches the candidate list.
7. Re-query active links for every affected title or episode and confirm none changed.
8. Refresh the admin inactive filter and record the new counts.

Never use a broad title-only delete. A safe predicate includes the inactive row ID, content type, inactive status, and relevant parent identifiers.

## Assigning replacement movie files

Follow `MOVIE_ASSIGNMENT_RUNBOOK.md`. Important reminders:

- Verify title, year, IMDb, and TMDB identity; alternative titles and release-year disparities require evidence.
- Use the Telegram index record ID, not the channel message ID.
- Store every available requested quality, normally 720p and 1080p.
- If two unlabeled files represent the same movie, use the smaller file for 720p and the larger file for 1080p only when identity is certain.
- Skip an existing correct active assignment rather than creating a duplicate.
- File sizes below 1 GiB display as whole MB; sizes at least 1 GiB display as two-decimal GB.
- Verify the public movie page and the homepage Newly Added row after assignment.

## Assigning series episodes

Match files using the series identity, season number, episode number, and filename. Do not assume similarly named shows are the same series without metadata evidence.

Quality rules:

- Preserve explicit 480p, 720p, and 1080p labels.
- Use an available 480p episode when it is the only copy.
- When the user has authorized the fallback, place an unlabeled lower-size episode under 720p.
- When two copies of the same episode are available and quality labels are absent or unreliable, use the smaller file for 720p and the larger file for 1080p after confirming both files are the same episode.
- If only one resolution exists, assign it and do not manufacture another quality.
- Skip an episode/quality that already has the correct active file.

After assignment, verify every episode row, Telegram index ID, quality, size, active flag, and public series picker. Missing episodes must be reported explicitly rather than silently ignored.

## Telegram search-bot verification

The interactive bot lives in `xboggg/trendimovies-search-bot`, not `xboggg/trendimovies-bot`.

For `/m <series>` and `/s <series>`, verify this flow:

1. The bot shows all available seasons.
2. Selecting a season queries that season directly.
3. The bot shows the qualities actually present, plus All/Best where supported.
4. Selecting a quality returns or batches the correct episodes.
5. Aliases such as `Love Island US` and `Love Island USA` resolve to the same series.

Do not derive season availability from a truncated whole-series search result. The Love Island picker correction was deployed and synchronized on 2026-08-05 from bot commit `2d5ba7f`.

## Completion report

Report:

- content type and scope
- inactive count before and after
- counts in all three classifications
- exact number deleted
- titles or episodes assigned before cleanup
- unresolved or ambiguous files
- confirmation that active links were untouched
- public-page and bot verification results
