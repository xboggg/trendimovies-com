<script>
  import { onMount } from 'svelte';

  let topics = [];
  let loading = true;
  let busy = false;
  let msg = '';
  let msgType = 'info';

  // create/edit form
  let showForm = false;
  let editingSlug = null; // null = new
  let f = blankForm();
  let draft = null; // {engine, intro, films}
  let drafting = false;
  let searchQ = '';
  let searchResults = [];
  let searching = false;

  const CATEGORIES = [
    { v: 'best-of', label: 'Best Of' },
    { v: 'mood', label: 'By Mood' },
    { v: 'decade', label: 'By Decade' },
    { v: 'hidden', label: 'Hidden Gems' },
  ];
  const COLORS = ['#7c3aed', '#dc2626', '#f59e0b', '#0d9488', '#2563eb', '#db2777', '#475569', '#16a34a'];
  const EMOJIS = ['🎬', '🔥', '😢', '😊', '🤯', '🔪', '🚀', '🕵️', '👽', '💀', '❤️', '🏆', '🌍', '⚡', '🎃', '🤖'];

  function blankForm() {
    return { title: '', category: 'best-of', emoji: '🎬', color: '#7c3aed', intro: '', sort_order: 100, source: '' };
  }

  function flash(text, type = 'info') {
    msg = text; msgType = type;
    if (type === 'success') setTimeout(() => { if (msg === text) msg = ''; }, 4000);
  }

  async function load() {
    loading = true;
    try {
      const r = await fetch('/api/admin/guides');
      const d = await r.json();
      topics = d.ok ? d.topics : [];
    } catch { topics = []; }
    loading = false;
  }
  onMount(load);

  function newGuide() {
    editingSlug = null; f = blankForm(); draft = null; searchResults = []; searchQ = '';
    showForm = true; msg = '';
  }
  function cancelForm() { showForm = false; draft = null; }

  // Step 1: preview (curate without saving)
  async function preview() {
    if (!f.title.trim()) { flash('Enter a title first', 'error'); return; }
    drafting = true; draft = null; msg = '';
    try {
      const r = await fetch('/api/admin/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'preview', title: f.title, category: f.category, emoji: f.emoji, color: f.color, source: f.source || undefined }),
      });
      const d = await r.json();
      if (!d.ok) { flash(d.error || 'Curation failed', 'error'); }
      else {
        draft = { engine: d.engine, intro: d.intro || '', films: d.films || [] };
        if (!f.intro) f.intro = draft.intro;
        flash(`Got ${draft.films.length} films via ${d.engine === 'live' ? 'live TMDB' : d.engine === 'ai' ? 'AI curation' : d.engine}. Edit below, then Publish.`, 'success');
      }
    } catch { flash('Network error', 'error'); }
    drafting = false;
  }

  function removeFilm(i) { draft.films = draft.films.filter((_, j) => j !== i); }
  function moveFilm(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= draft.films.length) return;
    const a = [...draft.films];
    [a[i], a[j]] = [a[j], a[i]];
    draft.films = a;
  }

  async function doSearch() {
    if (!searchQ.trim()) return;
    searching = true;
    try {
      const r = await fetch('/api/admin/guides?search=' + encodeURIComponent(searchQ));
      const d = await r.json();
      searchResults = d.ok ? d.films : [];
    } catch { searchResults = []; }
    searching = false;
  }
  function addFilm(film) {
    if (!draft) draft = { engine: f.source || 'ai', intro: f.intro, films: [] };
    if (draft.films.some(x => x.tmdb_id === film.tmdb_id)) { flash('Already in list', 'error'); return; }
    draft.films = [...draft.films, film];
    searchResults = []; searchQ = '';
  }

  // Step 2: publish (save edited list)
  async function publish() {
    if (!f.title.trim()) { flash('Title required', 'error'); return; }
    if (!draft || !draft.films.length) { flash('Get a film list first (click Preview)', 'error'); return; }
    busy = true; msg = '';
    try {
      const r = await fetch('/api/admin/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          slug: editingSlug || undefined,
          title: f.title, category: f.category, emoji: f.emoji, color: f.color,
          intro: f.intro, sort_order: Number(f.sort_order) || 100,
          source: draft.engine, films: draft.films,
        }),
      });
      const d = await r.json();
      if (!d.ok) { flash(d.error || 'Publish failed', 'error'); }
      else {
        flash(`Published “${f.title}” — ${d.count} films. Live on the site now.`, 'success');
        showForm = false; draft = null;
        await load();
      }
    } catch { flash('Network error', 'error'); }
    busy = false;
  }

  async function recurate(t) {
    if (!confirm(`Re-curate “${t.title}”? This rebuilds its film list.`)) return;
    busy = true; flash(`Re-curating “${t.title}”…`, 'info');
    try {
      const r = await fetch('/api/admin/guides', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recurate', slug: t.slug }),
      });
      const d = await r.json();
      flash(d.ok ? `“${t.title}” refreshed — ${d.count} films.` : (d.error || 'Failed'), d.ok ? 'success' : 'error');
      await load();
    } catch { flash('Network error', 'error'); }
    busy = false;
  }

  async function refreshLive() {
    if (!confirm('Refresh all live/time-sensitive guides now?')) return;
    busy = true; flash('Refreshing live guides… (this can take a minute)', 'info');
    try {
      const r = await fetch('/api/admin/guides', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh-live' }),
      });
      const d = await r.json();
      flash(d.ok ? 'Live guides refreshed.' : (d.error || 'Failed'), d.ok ? 'success' : 'error');
      await load();
    } catch { flash('Network error', 'error'); }
    busy = false;
  }

  async function togglePublish(t) {
    busy = true;
    try {
      await fetch('/api/admin/guides', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: t.slug, is_published: !t.is_published }),
      });
      await load();
    } catch { flash('Failed to toggle', 'error'); }
    busy = false;
  }

  async function del(t) {
    if (!confirm(`Delete “${t.title}” permanently? The vinyl disc disappears from the site.`)) return;
    busy = true;
    try {
      const r = await fetch('/api/admin/guides?slug=' + encodeURIComponent(t.slug), { method: 'DELETE' });
      const d = await r.json();
      flash(d.ok ? 'Deleted.' : (d.error || 'Delete failed'), d.ok ? 'success' : 'error');
      await load();
    } catch { flash('Network error', 'error'); }
    busy = false;
  }

  const poster = (p) => !p ? '/images/no-poster.svg' : (p.startsWith('/images/') ? p : 'https://image.tmdb.org/t/p/w185' + p);
</script>

<div class="wrap">
  <div class="head">
    <div>
      <h1>Movie Guides</h1>
      <p class="sub">Type a topic — the system curates the films and builds a vinyl guide on the site.</p>
    </div>
    <div class="head-actions">
      <button class="btn ghost" on:click={refreshLive} disabled={busy}>↻ Refresh live guides</button>
      <button class="btn primary" on:click={newGuide} disabled={busy}>+ New Guide</button>
    </div>
  </div>

  {#if msg}
    <div class="flash {msgType}">{msg}</div>
  {/if}

  {#if showForm}
    <div class="card form">
      <h2>{editingSlug ? 'Edit' : 'New'} Guide</h2>

      <div class="grid">
        <label class="field wide">
          <span>Topic title</span>
          <input bind:value={f.title} placeholder="e.g. 30 Most Popular Movies Right Now" />
          <small>“right now / trending / this week” → live TMDB data · “best / greatest / mood” → AI curated</small>
        </label>

        <label class="field">
          <span>Category</span>
          <select bind:value={f.category}>
            {#each CATEGORIES as c}<option value={c.v}>{c.label}</option>{/each}
          </select>
        </label>

        <label class="field">
          <span>Sort order</span>
          <input type="number" bind:value={f.sort_order} />
        </label>

        <div class="field">
          <span>Emoji</span>
          <div class="chips">
            {#each EMOJIS as e}
              <button type="button" class="chip {f.emoji === e ? 'on' : ''}" on:click={() => f.emoji = e}>{e}</button>
            {/each}
          </div>
        </div>

        <div class="field">
          <span>Disc color</span>
          <div class="chips">
            {#each COLORS as c}
              <button type="button" class="swatch {f.color === c ? 'on' : ''}" style="background:{c}" on:click={() => f.color = c} aria-label={c}></button>
            {/each}
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn primary" on:click={preview} disabled={drafting || busy}>
          {drafting ? 'Curating…' : draft ? '↻ Re-preview' : '🔎 Preview films'}
        </button>
        <button class="btn ghost" on:click={cancelForm} disabled={busy}>Cancel</button>
      </div>

      {#if draft}
        <div class="draft">
          <div class="draft-head">
            <strong>{draft.films.length} films</strong>
            <span class="badge">{draft.engine === 'live' ? 'live TMDB' : draft.engine === 'ai' ? 'AI curated' : draft.engine}</span>
          </div>

          <label class="field wide">
            <span>Intro (shown under the guide title)</span>
            <textarea rows="2" bind:value={f.intro} placeholder="Two punchy sentences…"></textarea>
          </label>

          <div class="film-list">
            {#each draft.films as film, i (film.tmdb_id)}
              <div class="film-row">
                <img src={poster(film.poster_path)} alt="" />
                <div class="film-meta">
                  <div class="film-title">{film.title} {#if film.year}<span class="yr">({film.year})</span>{/if}</div>
                  {#if film.blurb}<div class="film-blurb">{film.blurb}</div>{/if}
                </div>
                <div class="film-ctrls">
                  <button title="Up" on:click={() => moveFilm(i, -1)} disabled={i === 0}>▲</button>
                  <button title="Down" on:click={() => moveFilm(i, 1)} disabled={i === draft.films.length - 1}>▼</button>
                  <button title="Remove" class="rm" on:click={() => removeFilm(i)}>✕</button>
                </div>
              </div>
            {/each}
          </div>

          <div class="add-film">
            <span>Add a specific film</span>
            <div class="search-row">
              <input bind:value={searchQ} placeholder="Search a movie title…" on:keydown={(e) => e.key === 'Enter' && doSearch()} />
              <button class="btn ghost" on:click={doSearch} disabled={searching}>{searching ? '…' : 'Search'}</button>
            </div>
            {#if searchResults.length}
              <div class="search-results">
                {#each searchResults as sr (sr.tmdb_id)}
                  <button class="sr" on:click={() => addFilm(sr)}>
                    <img src={poster(sr.poster_path)} alt="" />
                    <span>{sr.title} {#if sr.year}({sr.year}){/if}</span>
                    <span class="plus">+</span>
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <div class="form-actions sticky">
            <button class="btn publish" on:click={publish} disabled={busy || !draft.films.length}>
              {busy ? 'Publishing…' : `✓ Publish guide (${draft.films.length} films)`}
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  {#if loading}
    <p class="muted">Loading guides…</p>
  {:else if !topics.length}
    <p class="muted">No guides yet. Click “New Guide” to create your first one.</p>
  {:else}
    <div class="card">
      <table>
        <thead>
          <tr><th></th><th>Guide</th><th>Category</th><th>Films</th><th>Source</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {#each topics as t (t.slug)}
            <tr class:hidden-row={!t.is_published}>
              <td><span class="disc" style="--c:{t.color}">{t.emoji}</span></td>
              <td>
                <a class="g-title" href={'/guides/' + t.slug} target="_blank" rel="noopener">{t.title}</a>
                <div class="g-slug">/{t.slug}</div>
              </td>
              <td>{t.category}</td>
              <td>{t.film_count ?? '—'}</td>
              <td><span class="src">{t.source}</span></td>
              <td>
                <button class="pill {t.is_published ? 'live' : 'off'}" on:click={() => togglePublish(t)} disabled={busy}>
                  {t.is_published ? 'Live' : 'Hidden'}
                </button>
              </td>
              <td class="row-actions">
                <button on:click={() => recurate(t)} disabled={busy} title="Rebuild film list">↻</button>
                <button class="danger" on:click={() => del(t)} disabled={busy} title="Delete">🗑</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .wrap { max-width: 1100px; margin: 0 auto; padding: 4px; color: #e5e7eb; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
  h1 { font-size: 1.6rem; font-weight: 800; margin: 0; color: #fff; }
  .sub { color: #9ca3af; font-size: 0.9rem; margin: 4px 0 0; }
  .head-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  .btn { border: 1px solid #374151; background: #1f2937; color: #e5e7eb; padding: 9px 16px; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
  .btn:hover:not(:disabled) { background: #374151; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn.primary { background: linear-gradient(135deg,#a855f7,#ec4899); border: none; color: #fff; }
  .btn.ghost { background: transparent; }
  .btn.publish { background: linear-gradient(135deg,#16a34a,#22c55e); border: none; color: #fff; font-size: 1rem; padding: 12px 22px; }

  .flash { padding: 11px 14px; border-radius: 10px; margin-bottom: 16px; font-size: 0.9rem; }
  .flash.info { background: #1e3a5f; color: #bfdbfe; }
  .flash.success { background: #14532d; color: #bbf7d0; }
  .flash.error { background: #4c1d1d; color: #fecaca; }

  .card { background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 18px; margin-bottom: 18px; }
  .form h2 { margin: 0 0 14px; font-size: 1.15rem; color: #fff; }

  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field.wide { grid-column: 1 / -1; }
  .field > span { font-size: 0.82rem; color: #9ca3af; font-weight: 600; }
  .field small { color: #6b7280; font-size: 0.74rem; }
  input, select, textarea { background: #0b0f17; border: 1px solid #374151; color: #fff; border-radius: 9px; padding: 10px 12px; font-size: 0.92rem; font-family: inherit; }
  input:focus, select:focus, textarea:focus { outline: none; border-color: #a855f7; }

  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { background: #0b0f17; border: 1px solid #374151; border-radius: 8px; padding: 5px 8px; font-size: 1.1rem; cursor: pointer; line-height: 1; }
  .chip.on { border-color: #a855f7; background: #2a1a3a; }
  .swatch { width: 26px; height: 26px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
  .swatch.on { border-color: #fff; box-shadow: 0 0 0 2px #a855f7; }

  .form-actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
  .form-actions.sticky { position: sticky; bottom: 0; background: #111827; padding-top: 12px; margin-top: 18px; }

  .draft { margin-top: 20px; border-top: 1px solid #1f2937; padding-top: 16px; }
  .draft-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .badge { background: #2a1a3a; color: #d8b4fe; border-radius: 999px; padding: 3px 10px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }

  .film-list { display: flex; flex-direction: column; gap: 8px; margin: 14px 0; }
  .film-row { display: flex; align-items: center; gap: 12px; background: #0b0f17; border: 1px solid #1f2937; border-radius: 10px; padding: 8px; }
  .film-row img { width: 38px; height: 57px; object-fit: cover; border-radius: 5px; flex-shrink: 0; }
  .film-meta { flex: 1; min-width: 0; }
  .film-title { font-weight: 600; color: #fff; font-size: 0.92rem; }
  .film-title .yr { color: #6b7280; font-weight: 400; }
  .film-blurb { color: #9ca3af; font-size: 0.8rem; margin-top: 2px; }
  .film-ctrls { display: flex; gap: 4px; }
  .film-ctrls button { background: #1f2937; border: none; color: #9ca3af; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 0.78rem; }
  .film-ctrls button:hover:not(:disabled) { background: #374151; color: #fff; }
  .film-ctrls button:disabled { opacity: 0.3; cursor: not-allowed; }
  .film-ctrls .rm:hover { background: #4c1d1d; color: #fecaca; }

  .add-film { background: #0b0f17; border: 1px dashed #374151; border-radius: 10px; padding: 12px; margin-top: 8px; }
  .add-film > span { font-size: 0.82rem; color: #9ca3af; font-weight: 600; display: block; margin-bottom: 8px; }
  .search-row { display: flex; gap: 8px; }
  .search-row input { flex: 1; }
  .search-results { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; }
  .sr { display: flex; align-items: center; gap: 10px; background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 6px; cursor: pointer; color: #e5e7eb; text-align: left; }
  .sr:hover { border-color: #a855f7; }
  .sr img { width: 30px; height: 45px; object-fit: cover; border-radius: 4px; }
  .sr span { flex: 1; font-size: 0.88rem; }
  .sr .plus { flex: 0; color: #22c55e; font-weight: 800; font-size: 1.1rem; }

  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 0.74rem; text-transform: uppercase; color: #6b7280; padding: 8px 10px; border-bottom: 1px solid #1f2937; }
  td { padding: 10px; border-bottom: 1px solid #1f2937; font-size: 0.9rem; vertical-align: middle; }
  tr.hidden-row { opacity: 0.5; }
  .disc { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; background: radial-gradient(circle,#1a1a1a 30%,#0a0a0a 30%); box-shadow: inset 0 0 0 3px var(--c); font-size: 1rem; }
  .g-title { color: #fff; font-weight: 600; text-decoration: none; }
  .g-title:hover { color: #d8b4fe; }
  .g-slug { color: #6b7280; font-size: 0.76rem; }
  .src { background: #1f2937; border-radius: 6px; padding: 2px 8px; font-size: 0.76rem; color: #9ca3af; }
  .pill { border: none; border-radius: 999px; padding: 4px 12px; font-size: 0.76rem; font-weight: 700; cursor: pointer; }
  .pill.live { background: #14532d; color: #bbf7d0; }
  .pill.off { background: #3f3f46; color: #d4d4d8; }
  .row-actions { display: flex; gap: 6px; }
  .row-actions button { background: #1f2937; border: none; color: #9ca3af; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; }
  .row-actions button:hover:not(:disabled) { background: #374151; color: #fff; }
  .row-actions .danger:hover { background: #4c1d1d; color: #fecaca; }

  .muted { color: #6b7280; padding: 20px; text-align: center; }

  @media (max-width: 640px) {
    .grid { grid-template-columns: 1fr; }
    table, thead, tbody, th, td, tr { display: block; }
    thead { display: none; }
    tr { border: 1px solid #1f2937; border-radius: 10px; margin-bottom: 10px; padding: 6px; }
    td { border: none; padding: 6px 8px; }
    .row-actions { justify-content: flex-start; }
  }
</style>
