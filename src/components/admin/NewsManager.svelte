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
  let sources = { channels: [], feeds: [] };
  let newLink = '';
  let newLabel = '';
  let replaceLink = {};     // handle -> pasted new link
  let bulkConfirm = false;
  let tg = { configured: false, enabled: false, chat: '', title: '', bot: '', daily_cap: 8 };
  let tgPosts = [];
  let tgVisits = null;      // visits that came from the channel: { today, week }; null until counted
  let tgVisitsFailed = false;
  async function loadVisits() {
    try {
      const d = await (await fetch('/api/admin/news?tgvisits=1')).json();
      if (d.ok) { tgVisits = d.visits; tgVisitsFailed = false; } else tgVisitsFailed = true;
    } catch (e) { tgVisitsFailed = true; }
  }
  let tgToken = '';
  let tgChat = '';
  let tgConfirm = false;
  async function tgConnect() {
    busy = true; flash('Checking with Telegram...');
    try {
      const r = await fetch('/api/admin/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'tg_connect', token: tgToken, chat: tgChat }) });
      const d = await r.json();
      if (d.ok) { flash('Connected to "' + d.title + '" with bot @' + d.bot + '. Posting is still OFF. Turn it on below when you are ready.', 'success'); tgToken = ''; tgChat = ''; await load(); }
      else flash('Problem: ' + (d.error || 'unknown'), 'error');
    } catch (e) { flash('Problem: ' + e, 'error'); }
    busy = false;
  }
  async function tgToggle() {
    if (!tgConfirm) { tgConfirm = true; return; }
    tgConfirm = false;
    busy = true;
    try {
      const r = await fetch('/api/admin/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'tg_enable', on: !tg.enabled }) });
      const d = await r.json();
      if (d.ok) { flash(!tg.enabled ? 'Telegram posting is ON. Stories published from now on go to the channel.' : 'Telegram posting is OFF.', 'success'); await load(); }
      else flash('Problem: ' + (d.error || 'unknown'), 'error');
    } catch (e) { flash('Problem: ' + e, 'error'); }
    busy = false;
  }
  let leads = [];
  let leadText = '';
  let leadLink = '';
  let leadDate = '';
  async function sendLead() {
    busy = true; flash('Sending...');
    try {
      const r = await fetch('/api/admin/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'lead_add', text: leadText, link: leadLink, posted_on: leadDate }) });
      const d = await r.json();
      if (d.ok) {
        flash('Got it. The desk is checking it now. A draft appears in Waiting in about a minute (tap Refresh below).', 'success');
        leadText = ''; leadLink = ''; leadDate = '';
        setTimeout(load, 20000); setTimeout(load, 50000); setTimeout(load, 90000);
        await load();
      } else flash('Problem: ' + (d.error || 'unknown'), 'error');
    } catch (e) { flash('Problem: ' + e, 'error'); }
    busy = false;
  }
  const leadIcon = (l) => (l.status === 'done' ? (l.item_id ? '✅' : 'ℹ️') : l.status === 'failed' ? '⚠️' : '⏳');

  async function srcCall(payload, okText) {
    busy = true; flash('Working...');
    try {
      const r = await fetch('/api/admin/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (d.ok) { flash(okText, 'success'); newLink = ''; newLabel = ''; replaceLink = {}; await load(); }
      else flash('Problem: ' + (d.error || 'unknown'), 'error');
    } catch (e) { flash('Problem: ' + e, 'error'); }
    busy = false;
  }
  const addSource = () => srcCall({ action: 'source_add', link: newLink, label: newLabel }, 'Channel added. The desk reads it on its next run.');
  const replaceSource = (c) => srcCall({ action: 'source_replace', handle: c.handle, link: replaceLink[c.handle] || '' }, 'Link replaced. The desk uses the new one from its next run.');
  const toggleSource = (c) => srcCall({ action: 'source_toggle', handle: c.handle, active: !c.active }, c.active ? 'Channel paused.' : 'Channel turned on.');
  async function publishDated() {
    if (!bulkConfirm) { bulkConfirm = true; return; }
    bulkConfirm = false;
    busy = true; flash('Working...');
    try {
      const r = await fetch('/api/admin/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'publish_dated' }) });
      const d = await r.json();
      if (d.ok) { flash(d.n + ' older stories published, each with its original date.', 'success'); await load(); } else flash('Problem: ' + (d.error || 'unknown'), 'error');
    } catch (e) { flash('Problem: ' + e, 'error'); }
    busy = false;
  }
  $: datedCount = items.filter((i) => i.status === 'draft' && i.published_at && i.source_url).length;
  const dot = (st) => (!st ? '⚪' : st.fails >= 3 ? '🔴' : st.fails > 0 ? '🟠' : '🟢');
  const when = (s) => (s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'no posts yet');

  function flash(t, type = 'info') { msg = t; msgType = type; }

  async function load() {
    loading = true;
    loadVisits();            // not awaited: the list must not wait for the count
    try {
      const r = await fetch('/api/admin/news?status=' + tab);
      const d = await r.json();
      if (d.ok) { items = d.items; counts = d.counts; mode = d.mode; sources = d.sources || sources; leads = d.leads || []; tg = d.tg || tg; tgPosts = d.tgPosts || []; } else flash(d.error || 'Could not load', 'error');
    } catch (e) { flash('Could not load: ' + e, 'error'); }
    loading = false;
  }
  onMount(load);
  function pick(t) { tab = t; confirm = ''; open = {}; load(); }

  function startEdit(it) {
    edit[it.id] = {
      title: it.title, summary: it.summary || '', body: it.body || '', points: (it.points || []).join('\n'),
      category: it.category, source_name: it.source_name || '', source_url: it.source_url || '',
      cover_image: it.cover_image || '', related_tmdb_id: it.related_tmdb_id || null, related_type: it.related_type || null,
      film_title: it.film_title || '', poster_image: it.poster_image || '',
    };
    pic[it.id] = { q: it.film_title || '', results: [], images: [], picked: null, busy: false, err: '' };
    edit = edit; pic = pic; open[it.id] = !open[it.id]; open = open;
  }

  // ---- picture picker (TMDB only)
  let pic = {};
  async function picSearch(id) {
    const s = pic[id]; if (!s.q.trim()) return;
    s.busy = true; s.err = ''; s.images = []; s.picked = null; pic = pic;
    try {
      const r = await fetch('/api/admin/news?pictures=' + encodeURIComponent(s.q.trim()));
      const d = await r.json();
      s.results = d.ok ? d.results : []; if (!s.results.length) s.err = 'Nothing found on TMDB.';
    } catch { s.err = 'Could not search right now.'; }
    s.busy = false; pic = pic;
  }
  async function picOpen(id, res) {
    const s = pic[id]; s.busy = true; s.err = ''; pic = pic;
    try {
      const r = await fetch('/api/admin/news?images=' + res.kind + ':' + res.id);
      const d = await r.json();
      if (d.ok) { s.images = d.images; s.picked = { kind: res.kind, id: res.id, title: d.title || res.name, poster: d.poster || '' }; if (!d.images.length) s.err = 'TMDB has no pictures for this yet.'; }
      else s.err = d.error || 'Could not load pictures.';
    } catch { s.err = 'Could not load pictures.'; }
    s.busy = false; pic = pic;
  }
  function picUse(id, img) {
    const e = edit[id], p = pic[id].picked;
    e.cover_image = img.url;
    if (p && (p.kind === 'movie' || p.kind === 'tv')) { e.related_tmdb_id = p.id; e.related_type = p.kind; e.film_title = p.title; e.poster_image = p.poster; }
    edit = edit;
  }
  function picClear(id) { edit[id].cover_image = ''; edit = edit; }
  function patchOf(id) {
    const e = edit[id];
    if (!e) return undefined;
    return { title: e.title, summary: e.summary, body: e.body, points: e.points.split('\n').map((s) => s.trim()).filter(Boolean),
             category: e.category, source_name: e.source_name, source_url: e.source_url,
             cover_image: e.cover_image, related_tmdb_id: e.related_tmdb_id, related_type: e.related_type, film_title: e.film_title, poster_image: e.poster_image };
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

  <div class="card paste">
    <div class="t">Add a story from a post</div>
    <p class="muted">Copy a post from any channel (for example Hislordship News) and paste it here. The desk checks it on the web, writes it in its own words and leaves a draft for your yes.</p>
    <textarea rows="5" placeholder="Paste the post text here" bind:value={leadText}></textarea>
    <div class="srow-in">
      <input placeholder="Article link (optional, helps a lot)" bind:value={leadLink} />
      <label class="dl">Posted on <input type="date" bind:value={leadDate} /></label>
    </div>
    <div class="muted">Leave the date empty if the post is from today. An older date keeps the story dated that day.</div>
    <button class="btn good" disabled={busy || leadText.trim().length < 20} on:click={sendLead}>Make a story</button>
    {#if leads.length}
      <div class="leads">
        {#each leads as l (l.id)}
          <div class="lrow">{leadIcon(l)} <span class="muted">{l.text}…</span><br /><span>{l.status === 'new' || l.status === 'working' ? 'Working on it...' : l.note}</span></div>
        {/each}
        <button class="btn ghost" disabled={busy} on:click={load}>Refresh</button>
      </div>
    {/if}
  </div>

  <details class="card src">
    <summary>Telegram news channel: <b class:on={tg.enabled}>{tg.enabled ? 'ON' : tg.configured ? 'connected, OFF' : 'not connected'}</b></summary>
    {#if tg.configured}
      <div class="srow">
        <div class="t">{tg.title} <span class="muted">{tg.chat} · bot @{tg.bot}</span></div>
        <div class="muted">{tg.enabled ? 'Every new story and blog post is posted to the channel automatically.' : 'Switched off. Nothing is posted.'} Limits: up to {tg.daily_cap} posts a day, one at a time, only fresh items with a picture and a source. Older catch-up stories are never posted.</div>
        <button class="btn {tgConfirm ? 'warn' : tg.enabled ? 'ghost' : 'good'}" disabled={busy} on:click={tgToggle}>{tgConfirm ? 'Tap again to confirm' : tg.enabled ? 'Turn off' : 'Turn on'}</button>
      </div>
      <div class="srow">
        <div class="t">Visits from the channel: {#if tgVisits}today {tgVisits.today} · last 7 days {tgVisits.week}{:else if tgVisitsFailed}could not be counted just now{:else}counting…{/if}</div>
        <div class="muted">People who reached the site by tapping a link in the channel, your own taps included. Counting started 26 Nov 2026.</div>
      </div>
      {#if tgPosts.length}
        <div class="leads">
          {#each tgPosts as p}<div class="lrow">{p.status === 'sent' ? '✅' : '⚠️'} <span class="muted">{p.kind === 'blog' ? 'Blog' : 'News'} · {ago(p.posted_at)}</span> {p.title}{#if p.error}<br /><span class="bad">{p.error}</span>{/if}</div>{/each}
        </div>
      {/if}
    {/if}
    <div class="srow">
      <div class="t">{tg.configured ? 'Change the bot or channel' : 'Connect the channel'}</div>
      <div class="muted">1) Make a public channel with a name (for example TrendiMoviesNews). 2) In Telegram, open @BotFather, send /newbot and follow the steps; copy the token it gives you. 3) Add that bot to your channel as an administrator that can post messages. 4) Paste the token and channel name here. The token is saved on the server only and is never shown again.</div>
      <div class="srow-in">
        <input placeholder="Bot token (from BotFather)" bind:value={tgToken} autocomplete="off" />
        <input placeholder="Channel, e.g. https://t.me/TrendiMoviesNews" bind:value={tgChat} />
        <button class="btn good" disabled={busy || !tgToken || !tgChat} on:click={tgConnect}>Connect</button>
      </div>
    </div>
  </details>

  <details class="card src">
    <summary>Sources the desk watches {#if sources.channels.some((c) => c.status && c.status.fails >= 3)}<b class="bad">⚠️ a link looks dead</b>{/if}</summary>
    <p class="muted">If a channel changes its link, paste the new one next to it and tap Replace. The desk tells you on Telegram when a source stops working.</p>
    {#each sources.channels as c (c.handle)}
      <div class="srow">
        <div class="t">{dot(c.status)} {c.label} <span class="muted">t.me/{c.handle}</span></div>
        <div class="muted">{c.active ? 'On' : 'Paused'} · latest post: {when(c.status?.newest_post)}{#if c.status?.why} · <span class="bad">{c.status.why}</span>{/if}</div>
        <div class="srow-in">
          <input placeholder="New link, e.g. https://t.me/NewName" bind:value={replaceLink[c.handle]} />
          <button class="btn ghost" disabled={busy || !replaceLink[c.handle]} on:click={() => replaceSource(c)}>Replace</button>
          <button class="btn ghost" disabled={busy} on:click={() => toggleSource(c)}>{c.active ? 'Pause' : 'Turn on'}</button>
        </div>
      </div>
    {/each}
    <div class="srow">
      <div class="t">Add a channel</div>
      <div class="srow-in">
        <input placeholder="Channel link, e.g. https://t.me/Name" bind:value={newLink} />
        <input placeholder="Label (optional)" bind:value={newLabel} />
        <button class="btn good" disabled={busy || !newLink} on:click={addSource}>Add</button>
      </div>
      <div class="muted">Only public channels can be read (t.me/Name). Private invite links (t.me/+...) cannot.</div>
    </div>
    {#if sources.feeds.length}
      <div class="muted feeds">News sites: {#each sources.feeds as f}<span>{dot(f.status)} {f.name}</span>{' '}{/each}</div>
    {/if}
  </details>

  {#if tab === 'draft' && datedCount > 0}
    <div class="card switch">
      <div class="grow">
        <div class="t">Older stories caught up from the channel: {datedCount}</div>
        <div class="muted">Each has a real source and keeps its original date. Publish them all at once, or go through them one by one below.</div>
      </div>
      <button class="btn {bulkConfirm ? 'warn' : 'good'}" disabled={busy} on:click={publishDated}>{bulkConfirm ? 'Tap again: publish all ' + datedCount : 'Publish all ' + datedCount}</button>
    </div>
  {/if}

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
            <div class="picker">
              <div class="plabel">Picture</div>
              {#if edit[it.id].cover_image}
                <img class="pcur" src={thumb(edit[it.id].cover_image)} alt="" />
                <button type="button" class="btn ghost" on:click={() => picClear(it.id)}>Remove picture</button>
              {:else}<div class="muted">No picture. Search TMDB below.</div>{/if}
              <div class="srow-in">
                <input placeholder="Film, series or person" bind:value={pic[it.id].q} on:keydown={(e) => e.key === 'Enter' && picSearch(it.id)} />
                <button type="button" class="btn ghost" disabled={pic[it.id].busy} on:click={() => picSearch(it.id)}>{pic[it.id].busy ? '...' : 'Find pictures'}</button>
              </div>
              {#if pic[it.id].err}<div class="muted">{pic[it.id].err}</div>{/if}
              {#if pic[it.id].results.length && !pic[it.id].picked}
                <div class="pres">
                  {#each pic[it.id].results as r}
                    <button type="button" class="pr" on:click={() => picOpen(it.id, r)}>
                      {#if r.thumb}<img src={r.thumb} alt="" />{:else}<span class="pnone">?</span>{/if}
                      <span>{r.name}{r.year ? ' (' + r.year + ')' : ''}<br /><small>{r.kind === 'person' ? 'Person' : r.kind === 'tv' ? 'Series' : 'Film'}</small></span>
                    </button>
                  {/each}
                </div>
              {/if}
              {#if pic[it.id].picked && pic[it.id].images.length}
                <div class="muted">{pic[it.id].picked.title}: tap a picture to use it{pic[it.id].picked.kind !== 'person' ? ' (the story also links to this film)' : ''}. Then tap Save.</div>
                <div class="pgrid">
                  {#each pic[it.id].images as img}
                    <button type="button" class="pg" class:sel={edit[it.id].cover_image === img.url} on:click={() => picUse(it.id, img)}><img src={img.thumb} alt="" loading="lazy" />{#if img.trailer}<span class="ptag">Trailer</span>{/if}</button>
                  {/each}
                </div>
                <button type="button" class="btn ghost" on:click={() => { pic[it.id].picked = null; pic[it.id].images = []; pic = pic; }}>Back to results</button>
              {/if}
            </div>
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
  .picker { display: flex; flex-direction: column; gap: 10px; padding: 12px; border: 1px solid #2f2f2f; border-radius: 12px; background: #101010; }
  .plabel { font-size: 12px; font-weight: 700; color: #9a9a9a; text-transform: uppercase; letter-spacing: .05em; }
  .pcur { width: 100%; max-height: 220px; object-fit: cover; object-position: 50% 20%; border-radius: 10px; background: #000; }
  .pres { display: flex; flex-direction: column; gap: 8px; }
  .pr { display: flex; align-items: center; gap: 10px; text-align: left; background: #1a1a1a; border: 1px solid #333; border-radius: 10px; padding: 8px; color: #fff; font: inherit; font-size: 14px; cursor: pointer; min-height: 56px; }
  .pr img, .pnone { width: 40px; height: 56px; object-fit: cover; border-radius: 6px; flex: none; background: #000; display: grid; place-items: center; }
  .pr small { color: #8a8a8a; }
  .pgrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .pg { padding: 0; border: 3px solid transparent; border-radius: 10px; background: #000; overflow: hidden; cursor: pointer; }
  .pg { position: relative; }
  .ptag { position: absolute; left: 6px; top: 6px; background: #e50914; color: #fff; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: 2px 6px; border-radius: 5px; }
  .pg.sel { border-color: #22c55e; }
  .pg img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; object-position: 50% 20%; }
  .paste { display: flex; flex-direction: column; gap: 10px; }
  .paste textarea { background: #0d0d0d; border: 1px solid #333; color: #fff; padding: 11px; border-radius: 9px; font: inherit; font-size: 15px; }
  .dl { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #9a9a9a; }
  .dl input { flex: none; }
  .leads { border-top: 1px solid #262626; padding-top: 8px; display: flex; flex-direction: column; gap: 8px; font-size: 14px; line-height: 1.4; }
  .lrow { color: #ddd; }
  .src summary { font-size: 15px; font-weight: 800; color: #fff; }
  .src .bad { margin-left: 8px; }
  .srow { padding: 10px 0; border-top: 1px solid #262626; display: flex; flex-direction: column; gap: 6px; }
  .srow-in { display: flex; flex-wrap: wrap; gap: 8px; }
  .srow-in input { flex: 1 1 180px; min-width: 0; background: #0d0d0d; border: 1px solid #333; color: #fff; padding: 11px; border-radius: 9px; font: inherit; font-size: 14px; }
  .srow-in .btn { flex: 0 0 auto; }
  .feeds { padding-top: 8px; border-top: 1px solid #262626; line-height: 1.9; }
  .btn.ghost { background: #1f1f1f; border-color: #333; } .btn.warn { background: #b45309; }
</style>
