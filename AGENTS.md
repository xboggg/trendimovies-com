# TrendiMovies Agent Instructions

These instructions apply to the entire `trendimovies-com` repository.

## Safety

- Preserve working code and functions. Make the smallest scoped change that solves the confirmed problem.
- Inspect the current implementation, database state, and existing links before changing anything.
- Never stage, commit, overwrite, or discard unrelated worktree changes.
- Use transactions for related database writes and verify the exact affected rows afterward.
- Do not expose credentials, tokens, session files, or private configuration in output, documentation, or commits.

## Telegram movie assignments

- Verify the movie identity with title, year, IMDb, and TMDB before assigning files. Do not guess when titles are ambiguous.
- Import official TMDB metadata when the correct movie does not already exist.
- Use the indexed file record ID as the streaming file identifier. Never substitute the Telegram channel message ID.
- Check existing download links for the movie and quality before writing.
- When the request is to assign newly uploaded files, update the intended existing quality rows to the new indexed-file IDs instead of silently retaining old files or creating duplicate quality rows.
- Keep every available requested quality, normally one active link per source and quality.
- Detect and store the movie's correct original language.

## File-size display

- Use binary units based on the Telegram byte count.
- Files at least 1 GiB (`1,073,741,824` bytes) display in GB with two decimals, for example `1.24 GB`.
- Files below 1 GiB display in whole MB, for example `953 MB`.
- Never display a sub-1-GiB file as `0.xx GB`.

## Newly Added Movies

- A newly assigned file must surface its movie in the homepage "Newly Added Movies" row regardless of the movie's release year.
- The row should be driven by the assignment/update timestamp (`movies.updated_at DESC`), not limited to recent release years.
- Confirm that the download-link write bumped the movie timestamp. If it did not, diagnose the trigger or update path rather than falsifying the release year.

## Required verification

After an assignment, verify:

1. The movie/TMDB match and internal movie record.
2. The saved indexed-file IDs, qualities, sizes, languages, URLs, and active flags.
3. The file-metadata service returns the expected Telegram filename and byte count.
4. The public movie page loads successfully and shows the intended links.
5. The movie appears in "Newly Added Movies" even when it is older than the current or previous year.

See `DOCS/MOVIE_ASSIGNMENT_RUNBOOK.md` for the full workflow.

## Download-link audits

- Always process one content type at a time. A movie cleanup must never touch series rows, and a series cleanup must never touch movie rows.
- Classify every inactive link: same content and quality has an active replacement; the content has active links only in other qualities; or the content has no active link.
- Delete an inactive link only after proving that the same movie, or the same series episode, retains an approved active working download.
- Never infer safety from aggregate counts. Re-query exact row IDs before deletion, restrict deletion to inactive rows, and verify active rows afterward.
- Treat an inactive-only title or episode as an assignment problem. Assign and verify a replacement before removing the obsolete row.

See `DOCS/DOWNLOAD_LINK_OPERATIONS.md` for the complete procedure.

## Related Telegram search bot

- The interactive Telegram search bot is maintained in `xboggg/trendimovies-search-bot`, with the local checkout at the sibling folder `../trendimovies-search-bot`.
- Do not confuse it with `xboggg/trendimovies-bot`, which primarily contains website-assignment automation.
- The deployed interactive bot runs from `/opt/trendimovies/bot` on `38.242.195.0` as the `trendimovies-bot` systemd service.
- Preserve the search flow: `/m` or `/s` -> available seasons -> available qualities plus All/Best -> paginated episodes or a private batch.
- Treat `Love Island US` and `Love Island USA` as aliases for the same series.
- Series callbacks must search the selected season directly; do not filter a truncated whole-series result set.
- Display explicit 480p, 720p, and 1080p qualities accurately. Treat files without a quality label as 720p when the user has authorized that fallback.
- The Love Island season/quality picker fix was deployed and synchronized on 2026-08-05 from commit `2d5ba7f` on `fix/series-season-quality-picker`.

## Repository synchronization

- Treat GitHub `main` as the source of truth for tracked source.
- Preserve tracked and untracked work in a named stash and record its object ID before reconciling a dirty checkout.
- Compare local, GitHub, and live commits and tracked status. Do not overwrite local variants until current `main` is confirmed equal or newer.
- Documentation-only commits skip automatic deployment. Fast-forward live documentation separately without rebuilding or restarting when live source must match.
- A live `dist.prev/` directory is an expected untracked rollback artifact, not a source mismatch.

See `DOCS/WORKSPACE_SYNC.md` for the three-location procedure.
