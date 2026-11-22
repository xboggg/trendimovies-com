<script>
  import { onMount } from 'svelte';

  let list = [];
  let loading = true;
  let q = '';
  let results = [];
  let searching = false;
  let searched = false;
  let note = '';
  let confirmId = null;   // tmdb id waiting for the second tap
  let busy = false;
  let msg = '';
  let msgType = 'info';

  function flash(t, type = 'info') { msg = t; msgType = type; }

  async function load() {
    loading = true;
    try {
      const r = await fetch('/api/admin/takedowns');
      const d = await r.json();
      list = d.ok ? d.list : [];
    } catch { list = []; }
    loading = false;
  }
  // ---- new-release hold
  let hold = { enabled: true, days: 180 };
  let holdMsg = '';
  async function loadHold() {
    try {
      const r = await fetch('/api/admin/release-hold');
      const d = await r.json();
      if (d.ok) hold = { enabled: d.hold.enabled, days: d.hold.days };
    } catch {}
  }
  async function saveHold() {
    holdMsg = 'Saving...';
    try {
      const r = await fetch('/api/admin/release-hold', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: hold.enabled, days: Number(hold.days) }),
      });
      const d = await r.json();
      if (d.ok) { hold = { enabled: d.hold.enabled, days: d.hold.days }; holdMsg = 'Saved. The link engine uses it from its next run.'; }
      else holdMsg = 'Problem: ' + (d.error || 'unknown');
    } catch (e) { holdMsg = 'Problem: ' + e; }
  }
  onMount(() => { load(); loadHold(); });

  async function search() {
    if (!q.trim()) return;
    searching = true; searched = false; confirmId = null;
    try {
      const r = await fetch('/api/admin/takedowns?search=' + encodeURIComponent(q.trim()));
      const d = await r.json();
      results = d.ok ? d.results : [];
    } catch { results = []; }
    searching = false; searched = true;
  }

  async function takeDown(m) {
    if (confirmId !== m.tmdb_id) { confirmId = m.tmdb_id; return; }   // first tap asks, second tap does it
    busy = true; flash('Working...');
    try {
      const r = await fetch('/api/admin/takedowns', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdb_id: m.tmdb_id, note }),
      });
      const d = await r.json();
      if (d.ok) {
        flash('Done: ' + d.title + ' (' + d.year + ') is taken down. ' + d.files + ' file address(es) now answer 410, links are off, the page shows no Download/Stream.' +
          (d.cached_copies ? ' Note: ' + d.cached_copies + ' saved stream copy(ies) still on the server disk (not deleted).' : '') +
          ' Now reply to the notice.', 'success');
        note = ''; confirmId = null;
        await load(); await search();
      } else {
        flash('Problem: ' + (d.error || 'unknown') + ' (tell Claude)', 'error');
      }
    } catch (e) { flash('Problem: ' + e, 'error'); }
    busy = false;
  }

  async function restoreOne(e) {
    if (confirmId !== 'r' + e.tmdb_id) { confirmId = 'r' + e.tmdb_id; return; }
    busy = true;
    try {
      const r = await fetch('/api/admin/takedowns', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdb_id: e.tmdb_id }),
      });
      const d = await r.json();
      flash(d.ok ? e.title + ' removed from the list. Its links stay OFF until you link it again.' : 'Problem: ' + d.error, d.ok ? 'success' : 'error');
      confirmId = null;
      await load();
    } catch (x) { flash('Problem: ' + x, 'error'); }
    busy = false;
  }
</script>

<div class="wrap">
  <h1>Takedowns</h1>
  <p class="sub">When a rights holder reports a film: find it, tap <b>Take down</b> twice. Everything is done in one go.</p>

  {#if msg}<div class="msg {msgType}">{msg}</div>{/if}

  <div class="card">
    <h2>1. Find the film</h2>
    <form on:submit|preventDefault={search} class="row">
      <input type="text" bind:value={q} placeholder="Film name or TMDB number" />
      <button type="submit" class="btn" disabled={searching}>{searching ? '...' : 'Search'}</button>
    </form>
    <input type="text" bind:value={note} class="note" placeholder="Who reported it? (e.g. Sony Pictures via Midnight Labs)" />

    {#if searched && results.length === 0}<p class="muted">Nothing found.</p>{/if}
    {#each results as m (m.id)}
      <div class="item">
        <div class="grow">
          <div class="t">{m.title} <span class="y">({m.year ?? '?'})</span></div>
          <div class="muted">TMDB {m.tmdb_id} · {m.active_links} active link(s)</div>
        </div>
        {#if m.taken_down}
          <span class="tag">Already taken down</span>
        {:else}
          <button class="btn red" disabled={busy} on:click={() => takeDown(m)}>
            {confirmId === m.tmdb_id ? 'Tap again to confirm' : 'Take down'}
          </button>
        {/if}
      </div>
    {/each}
  </div>

  <div class="card">
    <h2>New-release hold</h2>
    <p class="muted" style="margin:0 0 10px;">New films draw most copyright notices. While this is ON, a film released less than the number of days below is <b>not linked for the first time</b>. Films already on the site stay as they are.</p>
    <div class="row">
      <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" bind:checked={hold.enabled} /> Hold new releases</label>
      <input type="number" min="0" max="3650" bind:value={hold.days} style="width:90px;background:#0f1117;border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:8px;color:#fff;" /> <span class="muted" style="align-self:center;">days</span>
      <button class="btn" on:click={saveHold}>Save</button>
    </div>
    {#if holdMsg}<p class="muted">{holdMsg}</p>{/if}
  </div>

  <div class="card">
    <h2>Taken down so far ({list.length})</h2>
    {#if loading}<p class="muted">Loading...</p>{/if}
    {#each list as e (e.tmdb_id)}
      <div class="item">
        <div class="grow">
          <div class="t">{e.title} <span class="y">({e.year ?? '?'})</span></div>
          <div class="muted">{e.note || 'no note'} · {e.files.length} file(s) · {e.added.slice(0, 10)} · TMDB {e.tmdb_id}</div>
        </div>
        <button class="btn ghost" disabled={busy} on:click={() => restoreOne(e)}>
          {confirmId === 'r' + e.tmdb_id ? 'Tap again to remove' : 'Remove from list'}
        </button>
      </div>
    {/each}
  </div>

  <div class="card small">
    <b>What one tap does:</b> 1) switches off every download and subtitle link of the film, 2) makes its file addresses answer "410 Gone" (nginx), 3) removes Download and Stream from its page and says "This title is not available", 4) stops the link engine from ever linking it again. It does <b>not</b> delete any file from Telegram or the server disk. After it, reply to the notice (the reply message is the same as before).
  </div>
</div>

<style>
  .wrap { max-width: 760px; margin: 0 auto; padding: 8px 4px 40px; color: #e5e7eb; }
  h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
  h2 { font-size: 16px; font-weight: 600; margin: 0 0 10px; }
  .sub { color: #9ca3af; margin: 0 0 16px; font-size: 14px; }
  .card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 16px; margin-bottom: 16px; }
  .small { font-size: 13px; color: #9ca3af; line-height: 1.5; }
  .row { display: flex; gap: 8px; margin-bottom: 8px; }
  input[type=text] { flex: 1; min-width: 0; background: #0f1117; border: 1px solid rgba(255,255,255,.15); border-radius: 8px; padding: 10px 12px; color: #fff; font-size: 14px; }
  .note { width: 100%; box-sizing: border-box; margin-bottom: 10px; }
  .btn { background: #2563eb; color: #fff; border: 0; border-radius: 8px; padding: 10px 14px; font-weight: 600; cursor: pointer; font-size: 14px; white-space: nowrap; }
  .btn.red { background: #dc2626; }
  .btn.ghost { background: rgba(255,255,255,.08); }
  .btn:disabled { opacity: .5; cursor: default; }
  .item { display: flex; gap: 10px; align-items: center; padding: 10px 0; border-top: 1px solid rgba(255,255,255,.06); }
  .grow { flex: 1; min-width: 0; }
  .t { font-weight: 600; word-break: break-word; }
  .y { color: #9ca3af; font-weight: 400; }
  .muted { color: #9ca3af; font-size: 12px; word-break: break-word; }
  .tag { font-size: 12px; background: rgba(220,38,38,.2); color: #fca5a5; border-radius: 6px; padding: 4px 8px; }
  .msg { border-radius: 10px; padding: 12px 14px; margin-bottom: 14px; font-size: 14px; line-height: 1.4; }
  .msg.success { background: rgba(22,163,74,.18); color: #86efac; }
  .msg.error { background: rgba(220,38,38,.2); color: #fca5a5; }
  .msg.info { background: rgba(255,255,255,.08); }
</style>
