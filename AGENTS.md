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
