<script>
  import { onMount } from 'svelte';

  const CATS = [
    ['casting', 'Casting'], ['trailers', 'Trailers'], ['release-dates', 'Release dates'], ['box-office', 'Box office'],
    ['streaming', 'Streaming'], ['awards', 'Awards'], ['behind-the-scenes', 'Behind the scenes'], ['new-projects', 'New projects'],
  ];
  const catLabel = (k) => (CATS.find((c) => c[0] === k) || [k, k])[1];

  let tab = 'draft';
  let items = [];
  let counts = { draft: 0, published: 0, rejected: 0, skipped: 0 };
  let mode = { auto_publish: false };
  let loading = true;
  let msg = '';
  let msgType = 'info';
  let busy = false;
  let open = {};        // id -> editing panel open
  let edit = {};        // id -> edited copy
  let confirm = '';     // 'pub:12' etc: first tap asks, second tap does it
  let modeConfirm = false;

  function flash(t, type = 'info') { msg = t; msgType = type; }

  async function load() {
    loading = true;
    try {
      const r = await fetch('/api/admin/news?status=' + tab);
      const d = await r.json();
      if (d.ok) { items = d.items; counts = d.counts; mode = d.mode; } else flash(d.error || 'Could not load', 'error');
    } catch (e) { flash('Could not load: ' + e, 'error'); }
    loading = false;
  }
  onMount(load);
  function pick(t) { tab = t; confirm = ''; open = {}; load(); }

  function startEdit(it) {
    edit[it.id] = {
      title: it.title, summary: it.summary || '', body: it.body || '', points: (it.points || []).join('\n'),
      category: it.category, source_name: it.source_name || '', source_url: it.source_url || '',
    };
    edit = edit; open[it.id] = !open[it.id]; open = open;
  }
  function patchOf(id) {
    const e = edit[id];
    if (!e) return undefined;
    return { title: e.title, summary: e.summary, body: e.body, points: e.points.split('\n').map((s) => s.trim()).filter(Boolean),
             category: e.category, source_name: e.source_name, source_url: e.source_url };
  }

  async function call(payload, okText) {
    busy = true; flash('Working...');
    try {
      const r = await fetch('/api/admin/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (d.ok) { flash(okText, 'success'); confirm = ''; await load(); }
      else flash('Problem: ' + (d.error || 'unknown'), 'error');
    } catch (e) { flash('Problem: ' + e, 'error'); }
    busy = false;
  }

  function publish(it) {
    const key = 'pub:' + it.id;
    const noSource = !(edit[it.id]?.source_url || it.source_url);
    if (confirm !== key) { confirm = key; return; }
    call({ action: 'publish', id: it.id, patch: patchOf(it.id) }, 'Published. It is live on the site now.');
    if (noSource) { /* allowed on purpose: the owner decided */ }
  }
  function reject(it) {
    const key = 'rej:' + it.id;
    if (confirm !== key) { confirm = key; return; }
    call({ action: 'reject', id: it.id }, 'Rejected. It is hidden and can be brought back from the Rejected tab.');
  }
  function save(it) { call({ action: 'save', id: it.id, patch: patchOf(it.id) }, 'Saved.'); }
  function restore(it) { call({ action: 'restore', id: it.id }, 'Moved back to Waiting.'); }
  function unpublish(it) {
    const key = 'unp:' + it.id;
    if (confirm !== key) { confirm = key; return; }
    call({ action: 'unpublish', id: it.id }, 'Taken off the site. It is back in Waiting.');
  }
  async function toggleMode() {
    if (!modeConfirm) { modeConfirm = true; return; }
    modeConfirm = false;
    busy = true;
    try {
      const r = await fetch('/api/admin/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mode', auto_publish: !mode.auto_publish }) });
      const d = await r.json();
      if (d.ok) { mode = d.mode; flash(mode.auto_publish ? 'Auto-publish is ON. Stories with a real source go live by themselves.' : 'Auto-publish is OFF. Every story waits for your yes.', 'success'); }
    } catch (e) { flash('Problem: ' + e, 'error'); }
    busy = false;
  }
  const ago = (s) => { if (!s) return ''; const m = Math.round((Date.now() - new Date(s).getTime()) / 60000); return m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + 'h ago' : Math.round(m / 1440) + 'd ago'; };
  const thumb = (u) => (u ? u.replace(/\/t\/p\/w\d+\//, '/t/p/w500/') : '');
</script>

<div class="wrap">
  <h1>News desk</h1>
  <p class="sub">Stories found by the desk wait here. Read, fix if needed, then tap <b>Publish</b> twice. Nothing goes live without your yes (unless auto-publish is on).</p>

  {#if msg}<div class="msg {msgType}">{msg}</div>{/if}

  <div class="switch card">
    <div class="grow">
      <div class="t">Auto-publish: <b class:on={mode.auto_publish}>{mode.auto_publish ? 'ON' : 'OFF'}</b></div>
      <div class="muted">{mode.auto_publish ? 'Stories that have a real source go live by themselves.' : 'Recommended for now. Every story waits for your yes.'}</div>
    </div>
    <button class="btn {modeConfirm ? 'warn' : 'ghost'}" disabled={busy} on:click={toggleMode}>
      {modeConfirm ? 'Tap again to confirm' : mode.auto_publish ? 'Turn off' : 'Turn on'}
    </button>
  </div>

  <div class="tabs">
    <button class:active={tab === 'draft'} on:click={() => pick('draft')}>Waiting <span>{counts.draft}</span></button>
    <button class:active={tab === 'published'} on:click={() => pick('published')}>Live <span>{counts.published}</span></button>
    <button class:active={tab === 'rejected'} on:click={() => pick('rejected')}>Rejected <span>{counts.rejected}</span></button>
    <button class:active={tab === 'skipped'} on:click={() => pick('skipped')}>Skipped <span>{counts.skipped}</span></button>
  </div>

  {#if loading}<p class="muted pad">Loading...</p>
  {:else if items.length === 0}<p class="muted pad">Nothing here.</p>{/if}

  {#each items as it (it.id)}
    <div class="card story">
      {#if tab === 'skipped'}
        <div class="t">{it.title}</div>
        <div class="muted">Skipped: {it.skip_reason || 'not news'} · {ago(it.created_at)}</div>
        {#if it.origin_text}<details><summary>What the lead said</summary><p class="lead">{it.origin_text}</p></details>{/if}
      {:else}
        {#if it.cover_image}<img class="cov" src={thumb(it.cover_image)} alt="" loading="lazy" />{/if}
        <div class="flags">
          <span class="chipc">{catLabel(it.category)}</span>
          {#if it.source_url}<span class="ok">✅ Source: {it.source_name}</span>{:else}<span class="bad">⚠️ No source found</span>{/if}
          {#if it.film_title}<span class="muted">🎞️ {it.film_title}</span>{:else}<span class="muted">No picture matched</span>{/if}
          <span class="muted">{ago(it.published_at || it.created_at)}</span>
        </div>
        <div class="t big">{it.title}</div>
        {#if it.summary}<div class="sum">{it.summary}</div>{/if}

        {#if open[it.id]}
          <div class="edit">
            <label>Headline<input bind:value={edit[it.id].title} /></label>
            <label>One-line summary<textarea rows="2" bind:value={edit[it.id].summary}></textarea></label>
            <label>In short (one point per line)<textarea rows="4" bind:value={edit[it.id].points}></textarea></label>
            <label>Story<textarea rows="9" bind:value={edit[it.id].body}></textarea></label>
            <label>Topic
              <select bind:value={edit[it.id].category}>{#each CATS as c}<option value={c[0]}>{c[1]}</option>{/each}</select>
            </label>
            <label>Source name<input bind:value={edit[it.id].source_name} placeholder="e.g. Variety" /></label>
            <label>Source link<input bind:value={edit[it.id].source_url} placeholder="https://..." /></label>
          </div>
        {:else}
          <details><summary>Read the story</summary>
            {#each (it.body || '').split(/\n\s*\n/) as p}<p class="para">{p}</p>{/each}
            {#if it.points?.length}<ul class="pts">{#each it.points as p}<li>{p}</li>{/each}</ul>{/if}
          </details>
        {/if}

        {#if it.origin_text}<details><summary>What the lead said (only you see this)</summary><p class="lead">{it.origin_text}</p></details>{/if}
        {#if it.source_url}<a class="srcl" href={it.source_url} target="_blank" rel="noopener noreferrer">Open the original report ↗</a>{/if}

        <div class="acts">
          {#if tab === 'draft'}
            <button class="btn good" disabled={busy} on:click={() => publish(it)}>
              {confirm === 'pub:' + it.id ? (it.source_url || edit[it.id]?.source_url ? 'Tap again: PUBLISH' : 'No source! Tap again to publish anyway') : 'Publish'}
            </button>
            <button class="btn ghost" disabled={busy} on:click={() => startEdit(it)}>{open[it.id] ? 'Close editor' : 'Edit'}</button>
            {#if open[it.id]}<button class="btn ghost" disabled={busy} on:click={() => save(it)}>Save</button>{/if}
            <button class="btn danger" disabled={busy} on:click={() => reject(it)}>{confirm === 'rej:' + it.id ? 'Tap again: reject' : 'Reject'}</button>
          {:else if tab === 'published'}
            <a class="btn ghost" href={'/news/' + it.slug} target="_blank" rel="noopener">View on site</a>
            <button class="btn ghost" disabled={busy} on:click={() => startEdit(it)}>{open[it.id] ? 'Close editor' : 'Edit'}</button>
            {#if open[it.id]}<button class="btn ghost" disabled={busy} on:click={() => save(it)}>Save</button>{/if}
            <button class="btn danger" disabled={busy} on:click={() => unpublish(it)}>{confirm === 'unp:' + it.id ? 'Tap again: take off site' : 'Take off site'}</button>
          {:else}
            <button class="btn ghost" disabled={busy} on:click={() => restore(it)}>Bring back to Waiting</button>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .wrap { max-width: 760px; margin: 0 auto; padding: 16px; color: #fff; }
  h1 { margin: 0 0 4px; font-size: 26px; font-weight: 800; }
  .sub { margin: 0 0 14px; color: #a0a0a0; font-size: 14px; line-height: 1.5; }
  .card { background: #141414; border: 1px solid #2a2a2a; border-radius: 14px; padding: 14px; margin-bottom: 12px; }
  .switch { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .grow { flex: 1; min-width: 200px; }
  .t { font-size: 15px; font-weight: 700; }
  .t.big { font-size: 18px; line-height: 1.25; margin: 8px 0 4px; font-weight: 800; }
  .t b.on { color: #22c55e; }
  .muted { color: #8a8a8a; font-size: 13px; }
  .pad { padding: 18px 4px; }
  .msg { padding: 11px 13px; border-radius: 10px; margin-bottom: 12px; font-size: 14px; line-height: 1.45; background: #1e293b; }
  .msg.success { background: #14532d; } .msg.error { background: #7f1d1d; }
  .tabs { display: flex; gap: 6px; overflow-x: auto; margin: 4px 0 12px; scrollbar-width: none; }
  .tabs::-webkit-scrollbar { display: none; }
  .tabs button { flex: none; padding: 10px 14px; border-radius: 999px; border: 1px solid #2a2a2a; background: #141414; color: #ddd; font-weight: 700; font-size: 14px; cursor: pointer; min-height: 42px; }
  .tabs button span { margin-left: 4px; color: #8a8a8a; font-weight: 600; }
  .tabs button.active { background: #e50914; border-color: #e50914; color: #fff; }
  .tabs button.active span { color: #fff; }
  .cov { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 10px; margin-bottom: 10px; background: #000; }
  .flags { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; font-size: 13px; }
  .chipc { background: #2a2a2a; padding: 3px 9px; border-radius: 999px; font-weight: 700; font-size: 12px; }
  .ok { color: #4ade80; font-weight: 700; } .bad { color: #fbbf24; font-weight: 800; }
  .sum { color: #c8c8c8; font-size: 14px; line-height: 1.45; margin-bottom: 6px; }
  details { margin: 8px 0; } summary { cursor: pointer; font-size: 14px; font-weight: 700; color: #9ab; padding: 6px 0; }
  .para { font-size: 14.5px; line-height: 1.55; margin: 8px 0; color: #ddd; }
  .lead { font-size: 13.5px; line-height: 1.5; color: #b8b8b8; background: #0d0d0d; padding: 10px; border-radius: 8px; margin: 6px 0; white-space: pre-wrap; }
  .pts { margin: 8px 0 0; padding-left: 18px; color: #ccc; font-size: 14px; line-height: 1.5; }
  .srcl { display: inline-block; margin: 4px 0 8px; color: #7dd3fc; font-weight: 700; font-size: 14px; }
  .edit { display: flex; flex-direction: column; gap: 10px; margin: 10px 0; }
  .edit label { display: flex; flex-direction: column; gap: 5px; font-size: 12px; font-weight: 700; color: #9a9a9a; text-transform: uppercase; letter-spacing: .05em; }
  .edit input, .edit textarea, .edit select { background: #0d0d0d; border: 1px solid #333; color: #fff; padding: 11px; border-radius: 9px; font: inherit; font-size: 15px; text-transform: none; letter-spacing: 0; font-weight: 500; }
  .acts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .btn { display: inline-flex; align-items: center; justify-content: center; flex: 1 1 auto; min-height: 46px; padding: 0 16px; border-radius: 11px; border: 1px solid transparent; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; text-decoration: none; color: #fff; }
  .btn:disabled { opacity: .5; }
  .btn.good { background: #16a34a; } .btn.danger { background: transparent; border-color: #7f1d1d; color: #fca5a5; }
  .btn.ghost { background: #1f1f1f; border-color: #333; } .btn.warn { background: #b45309; }
</style>
