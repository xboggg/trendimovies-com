# Movie Assignment Runbook

This runbook preserves the operating procedure for assigning Telegram movie uploads to TrendiMovies.

## System outline

- A private indexing service records Telegram file metadata.
- The website stores movie metadata separately from downloadable-file links.
- Streaming links use the indexed file record ID.
- A Telegram channel message ID is diagnostic metadata and is not the streaming identifier.

## Assignment workflow

### 1. Locate the upload

Search the private Telegram file index by distinctive filename words and year. Exclude subtitle files when selecting video candidates. Record:

- indexed file ID
- channel message ID for diagnostics only
- exact filename
- byte size
- detected quality
- indexed date

Use the indexed file ID for all link assignments.

### 2. Establish the movie identity

Use the filename title and year to locate the IMDb and TMDB records. Confirm the title against the synopsis, country, language, runtime, release information, and IMDb-to-TMDB mapping. Alternative titles and festival/theatrical release years can differ, so the filename year alone is not sufficient.

If identity remains ambiguous, stop and request confirmation.

### 3. Inspect TrendiMovies

Check for an existing movie row by TMDB ID, then inspect all active and inactive download links for its internal database ID.

- If the movie is missing, import official TMDB metadata first.
- If the requested quality is missing, insert one link for that quality.
- If newly uploaded files are intended to replace existing quality rows, update only those exact rows with the new indexed-file IDs, URLs, sizes, and relevant metadata.
- Do not retain an old file merely because it still works when the user requested assignment of a new upload.
- Do not create duplicate links for the same movie, source, and quality.

Use one transaction when multiple quality rows belong to the same assignment.

### 4. Format file sizes

Use the actual Telegram byte count and binary conversion:

```text
1 MiB = 1,048,576 bytes
1 GiB = 1,073,741,824 bytes
```

- If bytes are at least 1 GiB: `bytes / 1,073,741,824`, rounded to two decimals, followed by `GB`.
- If bytes are below 1 GiB: `bytes / 1,048,576`, rounded to the nearest whole number, followed by `MB`.

Examples:

- `1,330,330,811` bytes becomes `1.24 GB`.
- `999,509,710` bytes becomes `953 MB`, not `0.93 GB`.
- `1,070,829,147` bytes becomes `1021 MB` because it is below 1 GiB.

### 5. Preserve Newly Added behavior

Assigning or replacing a download link must bump the parent movie's `updated_at` timestamp. The homepage "Newly Added Movies" query must order downloadable movies by `updated_at DESC` without filtering out older release years.

An old movie with a file assigned today is newly added content and must appear in that row. Never change the movie's factual release year to force visibility.

### 6. Verify before reporting completion

Verify all of the following:

- The database transaction affected the expected number of rows.
- Each quality points to the intended indexed-file ID.
- The URL ends with that same indexed-file ID.
- The stored size follows the 1-GiB threshold rule.
- The language is correct.
- Each link is active.
- The private file-metadata check returns the expected filename and byte size.
- The public movie page responds successfully and displays the intended qualities and sizes.
- The movie ranks in the live homepage "Newly Added Movies" query regardless of release year.

If the database is correct but the browser is stale, distinguish browser/CDN caching from origin output before changing code.

## Safe-change rules

- Prefer read-only diagnosis before mutation.
- Restrict writes with internal IDs, TMDB IDs, content type, quality, and Telegram file ID where practical.
- Stop on the first database error and use transactions for multi-row changes.
- Return or re-query changed rows immediately.
- Do not deploy broad code changes to solve a one-row data problem.
- When a code change is genuinely required, inspect the current branch and dirty worktree, modify only the necessary file, run the relevant checks, and keep unrelated changes out of the commit.
