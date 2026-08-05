# Local, GitHub, and Live Synchronization

GitHub `main` is the source of truth for tracked website source. This procedure reconciles a developer checkout and `/var/www/trendimovies` without losing uncommitted work or disturbing the running application.

## 1. Audit all three locations

Record each location's branch, commit, tracked changes, untracked files, ahead/behind state, and application health. On live, distinguish tracked source from runtime artifacts: `dist/`, `dist.prev/`, caches, dependencies, and `.env` are operational state.

## 2. Preserve dirty local work

Before switching branches or cleaning the canonical checkout:

```bash
git stash push --include-untracked -m "pre-integration website workspace YYYY-MM-DD"
git stash list
git rev-parse 'stash@{0}'
git stash show --stat --include-untracked 'stash@{0}'
```

Record the stash object ID. If filesystem synchronization leaves duplicate changes visible, verify the stash contents directly before further action.

## 3. Integrate from a clean worktree

Create a separate worktree from current GitHub `main`. Classify each local candidate as exactly current GitHub, an older snapshot, already incorporated in newer form, genuinely missing, scratch/generated output, or an operational script needing separate security review.

Port only genuinely missing behavior. Do not reapply older whole files over newer source. Keep deletion or maintenance scripts out of application commits until their scope, credentials, dry-run behavior, and rollback are reviewed.

## 4. Validate and publish

- Inspect the exact diff and stage only intended paths.
- Run `git diff --check` and relevant tests or build.
- If external build-time fetching causes a timeout, record the limitation; do not report a pass.
- Push a dedicated `agent/...` branch and open a draft PR.
- Verify PR files, commits, mergeability, and checks before merging.

## 5. Synchronize live safely

Application-code pushes to `main` trigger `.github/workflows/deploy.yml`. Monitor the workflow and verify the server commit, PM2 status, localhost HTTP response, and public response.

Markdown and `DOCS/**` changes skip automatic deployment. For a documentation-only merge:

1. Confirm the commit range contains only documentation.
2. Inspect live status read-only.
3. Preserve a conflicting untracked documentation file in `/tmp`.
4. Restore only known tracked documentation deletions when required.
5. Run `git pull --ff-only origin main` in `/var/www/trendimovies`.
6. Do not rebuild or restart because runtime code did not change.
7. Verify live commit, tracked cleanliness, HTTP 200, and PM2 status.

Never run a broad live reset or clean. Preserve `.env`, builds, dependencies, caches, backups, and server-specific state.

## 6. Synchronize the canonical local folder

After revalidating the recovery stash, free the local `main` branch from other worktrees, clean only duplicated changes whose stash is confirmed, switch the canonical folder to `main`, and fast-forward with `git merge --ff-only origin/main`. Verify `HEAD`, `origin/main`, and an empty porcelain status. Keep the stash until the owner explicitly releases it.

## 7. Final equality check

Synchronization is complete when local `HEAD`, GitHub `main`, and live tracked `HEAD` match; documentation hashes match; the live app is online with HTTP 200; and any remaining live untracked paths are identified operational artifacts.

On 2026-08-05, all three locations were reconciled to merge commit `606f5c3293db4bd32414032a83722a83e576170f`. The original local workspace was preserved in a named stash, and the prior live `AGENTS.md` was retained in `/tmp` before the documentation-only fast-forward.
