// Comment moderation for the admin pages. The public database role can only read and add comments (on purpose),
// so approving and deleting use the site's private database login. Call only after requireAuth().
import { getPool } from './news-store';

export async function approveComment(id: number) {
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: 'Bad comment number' };
  const r = await getPool().query("UPDATE review_comments SET status='visible' WHERE id=$1", [id]);
  return r.rowCount === 1 ? { ok: true } : { ok: false, error: 'That comment no longer exists' };
}

/** Deletes the comment; its replies go with it (database rule). */
export async function removeComment(id: number) {
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: 'Bad comment number' };
  const r = await getPool().query('DELETE FROM review_comments WHERE id=$1', [id]);
  return r.rowCount === 1 ? { ok: true } : { ok: false, error: 'That comment no longer exists' };
}
