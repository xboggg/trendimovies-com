<script lang="ts">
  import { onMount } from 'svelte';
  // Generic: content_type = 'review' | 'movie' | 'series'. reviewId kept for back-compat.
  export let contentType: string = 'review';
  export let contentId: number = 0;
  export let reviewId: number = 0;
  export let accent: string = '#dc2626';
  // resolve the effective key (reviewId still works for the review page)
  $: _ctype = contentId ? contentType : 'review';
  $: _cid = contentId || reviewId;

  let comments: any[] = [];
  let total = 0;
  let loading = true;
  let sort: 'new' | 'top' = 'new';
  let visitorId = '';

  // compose form (top-level)
  let name = '';
  let text = '';
  let spoiler = false;
  let website = ''; // honeypot
  let posting = false;
  let notice = '';

  // reply state
  let replyTo: number | null = null;
  let replyName = '';
  let replyText = '';
  let replySpoiler = false;
  let replyPosting = false;

  let revealed = new Set<number>();
  let liked = new Set<number>();

  function loadLocal() {
    try {
      visitorId = localStorage.getItem('tm_visitor') || '';
      if (!visitorId) { visitorId = 'v' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('tm_visitor', visitorId); }
      name = localStorage.getItem('tm_cname') || '';
      liked = new Set(JSON.parse(localStorage.getItem('tm_liked_' + _ctype + _cid) || '[]'));
    } catch {}
  }

  async function load() {
    loading = true;
    try {
      const r = await fetch(`/api/comments?content_type=${_ctype}&content_id=${_cid}&sort=${sort}`);
      if (r.ok) { const d = await r.json(); comments = d.comments || []; total = d.total || 0; }
    } catch {} finally { loading = false; }
  }

  async function post(parentId: number | null) {
    const isReply = parentId != null;
    const author = (isReply ? replyName : name).trim();
    const bodyText = (isReply ? replyText : text).trim();
    if (bodyText.length < 2) { notice = 'Please write a bit more.'; return; }
    if (isReply) replyPosting = true; else posting = true;
    notice = '';
    try {
      const r = await fetch('/api/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: _ctype, content_id: _cid, parent_id: parentId, author, body: bodyText,
          is_spoiler: isReply ? replySpoiler : spoiler, website }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) { notice = d.error || 'Could not post. Try again.'; return; }
      try { localStorage.setItem('tm_cname', author); } catch {}
      if (d.status === 'pending') { notice = d.message || 'Thanks! Your comment is awaiting review.'; }
      if (isReply) { replyText = ''; replySpoiler = false; replyTo = null; } else { text = ''; spoiler = false; }
      await load();
    } catch { notice = 'Network error. Try again.'; }
    finally { if (isReply) replyPosting = false; else posting = false; }
  }

  async function like(c: any) {
    if (liked.has(c.id)) return;
    liked.add(c.id); liked = liked;
    c.likes = (c.likes || 0) + 1; comments = comments;
    try { localStorage.setItem('tm_liked_' + _ctype + _cid, JSON.stringify([...liked])); } catch {}
    try {
      const r = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', comment_id: c.id, visitor: visitorId }) });
      const d = await r.json();
      if (d && typeof d.likes === 'number') { c.likes = d.likes; comments = comments; }
    } catch {}
  }

  function setSort(s: 'new' | 'top') { if (sort !== s) { sort = s; load(); } }
  function timeAgo(iso: string) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    if (s < 604800) return Math.floor(s / 86400) + 'd ago';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }
  function initials(n: string) { return (n || '?').trim().slice(0, 1).toUpperCase(); }

  onMount(() => { loadLocal(); load(); });
</script>

<section class="cmts" style={`--a:${accent}`}>
  <div class="cmts-head">
    <h2 class="cmts-title">Comments {#if total}<span class="cmts-count">{total}</span>{/if}</h2>
    <div class="cmts-sort">
      <button class:on={sort === 'new'} on:click={() => setSort('new')}>Newest</button>
      <button class:on={sort === 'top'} on:click={() => setSort('top')}>Top</button>
    </div>
  </div>

  <!-- compose -->
  <div class="cmts-box">
    <input class="cmts-name" placeholder="Your name" bind:value={name} maxlength="60" />
    <textarea class="cmts-text" rows="3" placeholder="Share your thoughts on this one…" bind:value={text} maxlength="3000"></textarea>
    <!-- honeypot: hidden from humans -->
    <input class="cmts-hp" tabindex="-1" autocomplete="off" bind:value={website} />
    <div class="cmts-actions">
      <label class="cmts-spoiler"><input type="checkbox" bind:checked={spoiler} /> Mark as spoiler</label>
      <button class="cmts-post" on:click={() => post(null)} disabled={posting}>{posting ? 'Posting…' : 'Post comment'}</button>
    </div>
    {#if notice}<div class="cmts-notice">{notice}</div>{/if}
  </div>

  {#if loading}
    <p class="cmts-empty">Loading comments…</p>
  {:else if comments.length === 0}
    <p class="cmts-empty">No comments yet. Be the first to weigh in.</p>
  {:else}
    <div class="cmts-list">
      {#each comments as c (c.id)}
        <div class="cmt">
          <div class="cmt-avatar" class:staff={c.is_staff} style={c.is_staff ? '' : `background:${accent}`}>{c.is_staff ? '✦' : initials(c.author)}</div>
          <div class="cmt-main">
            <div class="cmt-meta"><span class="cmt-author" class:staff-name={c.is_staff}>{c.author}</span>{#if c.is_staff}<span class="cmt-badge">✓ Official</span>{/if}<span class="cmt-time">{timeAgo(c.created_at)}</span></div>
            {#if c.is_spoiler && !revealed.has(c.id)}
              <button class="cmt-spoiler" on:click={() => { revealed.add(c.id); revealed = revealed; }}>⚠️ Spoiler — click to reveal</button>
            {:else}
              <p class="cmt-body">{c.body}</p>
            {/if}
            <div class="cmt-foot">
              <button class="cmt-like" class:liked={liked.has(c.id)} on:click={() => like(c)}>❤ {c.likes || 0}</button>
              <button class="cmt-reply" on:click={() => { replyTo = replyTo === c.id ? null : c.id; replyName = name; }}>Reply</button>
            </div>

            {#if replyTo === c.id}
              <div class="cmt-replybox">
                <input class="cmts-name" placeholder="Your name" bind:value={replyName} maxlength="60" />
                <textarea class="cmts-text" rows="2" placeholder="Write a reply…" bind:value={replyText} maxlength="3000"></textarea>
                <div class="cmts-actions">
                  <label class="cmts-spoiler"><input type="checkbox" bind:checked={replySpoiler} /> Spoiler</label>
                  <button class="cmts-post sm" on:click={() => post(c.id)} disabled={replyPosting}>{replyPosting ? '…' : 'Reply'}</button>
                </div>
              </div>
            {/if}

            {#if c.replies && c.replies.length}
              <div class="cmt-replies">
                {#each c.replies as r (r.id)}
                  <div class="cmt reply">
                    <div class="cmt-avatar sm" class:staff={r.is_staff} style={r.is_staff ? '' : `background:${accent};opacity:.85`}>{r.is_staff ? '✦' : initials(r.author)}</div>
                    <div class="cmt-main">
                      <div class="cmt-meta"><span class="cmt-author" class:staff-name={r.is_staff}>{r.author}</span>{#if r.is_staff}<span class="cmt-badge">✓ Official</span>{/if}<span class="cmt-time">{timeAgo(r.created_at)}</span></div>
                      {#if r.is_spoiler && !revealed.has(r.id)}
                        <button class="cmt-spoiler" on:click={() => { revealed.add(r.id); revealed = revealed; }}>⚠️ Spoiler — click to reveal</button>
                      {:else}
                        <p class="cmt-body">{r.body}</p>
                      {/if}
                      <div class="cmt-foot">
                        <button class="cmt-like" class:liked={liked.has(r.id)} on:click={() => like(r)}>❤ {r.likes || 0}</button>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .cmts{max-width:820px;margin:56px auto 0;padding:0 4px}
  .cmts-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
  .cmts-title{font-size:24px;font-weight:800;color:#fff;display:flex;align-items:center;gap:10px}
  .cmts-count{font-size:14px;font-weight:700;color:#9a97a4;background:rgba(255,255,255,.06);padding:3px 10px;border-radius:100px}
  .cmts-sort{display:flex;gap:4px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:100px;padding:3px}
  .cmts-sort button{background:none;border:none;color:#9a97a4;font-size:13px;font-weight:600;padding:6px 14px;border-radius:100px;cursor:pointer}
  .cmts-sort button.on{background:var(--a);color:#fff}
  .cmts-box{background:linear-gradient(160deg,rgba(24,22,28,.6),rgba(16,15,20,.6));border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:18px;margin-bottom:28px}
  .cmts-name{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:11px 14px;color:#fff;font-size:14px;margin-bottom:10px}
  .cmts-text{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:12px 14px;color:#fff;font-size:15px;line-height:1.5;resize:vertical;font-family:inherit}
  .cmts-name:focus,.cmts-text:focus{outline:none;border-color:var(--a)}
  .cmts-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
  .cmts-actions{display:flex;align-items:center;justify-content:space-between;margin-top:12px;gap:12px;flex-wrap:wrap}
  .cmts-spoiler{display:flex;align-items:center;gap:7px;color:#9a97a4;font-size:13px;cursor:pointer}
  .cmts-spoiler input{accent-color:var(--a)}
  .cmts-post{background:var(--a);color:#fff;font-weight:700;font-size:14px;padding:11px 22px;border:none;border-radius:100px;cursor:pointer}
  .cmts-post.sm{padding:8px 18px;font-size:13px}
  .cmts-post:disabled{opacity:.6}
  .cmts-notice{margin-top:12px;font-size:13px;color:var(--a);background:rgba(255,255,255,.04);padding:10px 12px;border-radius:10px}
  .cmts-empty{color:#8a8790;padding:24px 0;text-align:center}
  .cmts-list{display:flex;flex-direction:column;gap:22px}
  .cmt{display:flex;gap:13px}
  .cmt-avatar{flex:none;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:17px}
  .cmt-avatar.sm{width:34px;height:34px;font-size:14px}
  .cmt-main{flex:1;min-width:0}
  .cmt-meta{display:flex;align-items:center;gap:10px;margin-bottom:5px}
  .cmt-author{font-weight:700;color:#fff;font-size:14px}
  .cmt-avatar.staff{background:linear-gradient(135deg,#f59e0b,#dc2626);box-shadow:0 0 0 2px rgba(245,158,11,.35)}
  .cmt-author.staff-name{color:#fbbf24}
  .cmt-badge{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:800;letter-spacing:.4px;color:#fbbf24;background:rgba(245,158,11,.14);border:1px solid rgba(245,158,11,.4);padding:2px 8px;border-radius:100px;text-transform:uppercase}
  .cmt-time{color:#8a8790;font-size:12px}
  .cmt-body{color:#dcdae0;font-size:15px;line-height:1.6;white-space:pre-wrap;word-break:break-word}
  .cmt-spoiler{background:rgba(255,255,255,.05);border:1px dashed rgba(255,255,255,.25);color:#c3c0cc;font-size:13px;padding:9px 14px;border-radius:10px;cursor:pointer}
  .cmt-foot{display:flex;align-items:center;gap:16px;margin-top:8px}
  .cmt-like,.cmt-reply{background:none;border:none;color:#8a8790;font-size:13px;font-weight:600;cursor:pointer;padding:2px 0}
  .cmt-like.liked{color:var(--a)}
  .cmt-reply:hover,.cmt-like:hover{color:#fff}
  .cmt-replybox{margin-top:12px;padding:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px}
  .cmt-replies{margin-top:16px;padding-left:16px;border-left:2px solid rgba(255,255,255,.08);display:flex;flex-direction:column;gap:16px}
  @media(max-width:640px){.cmts{margin-top:40px}.cmt-avatar{width:36px;height:36px;font-size:15px}}
</style>
