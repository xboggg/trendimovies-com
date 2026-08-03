<script lang="ts">
  import { onMount } from 'svelte';

  interface Review {
    id: number; tmdb_id: number; slug: string; title: string; year: number;
    headline: string; status: string; accent: string; poster_path: string | null;
    rt_score: string | null; box_office: string | null; created_at: string; published_at: string | null;
  }

  let reviews: Review[] = [];
  let loading = true;
  let error = '';
  let filter: 'all' | 'draft' | 'published' = 'all';
  let busyId: number | null = null;

  async function load() {
    loading = true; error = '';
    try {
      const res = await fetch('/api/admin/reviews');
      if (res.ok) { const d = await res.json(); reviews = d.reviews || []; }
      else error = 'Failed to load reviews';
    } catch (e) { error = 'Failed to load reviews'; }
    loading = false;
  }

  async function act(id: number, action: string) {
    if (action === 'delete' && !confirm('Delete this review permanently?')) return;
    busyId = id;
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id }),
      });
      if (res.ok) await load();
      else alert('Action failed');
    } catch (e) { alert('Action failed'); }
    busyId = null;
  }

  // ---- edit modal ----
  let editing: any = null;   // the review being edited (a working copy)
  let saving = false;
  let editErr = '';
  let bodyEl: HTMLDivElement;   // contentEditable rich editor

  // Body (stored as \n\n-separated paragraphs w/ inline <em>) -> editor HTML (<p>…</p>).
  function bodyToHtml(body: string): string {
    return (body || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
      .map(p => `<p>${p}</p>`).join('');
  }
  // Editor HTML -> clean stored body: paragraphs joined by blank lines, inline
  // tags normalised to <em>/<strong>, everything else stripped.
  function htmlToBody(html: string): string {
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    // normalise <b>->strong, <i>->em, <div>->p
    wrap.querySelectorAll('b').forEach(n => { const e = document.createElement('strong'); e.innerHTML = n.innerHTML; n.replaceWith(e); });
    wrap.querySelectorAll('i').forEach(n => { const e = document.createElement('em'); e.innerHTML = n.innerHTML; n.replaceWith(e); });
    const blocks: string[] = [];
    const push = (el: Element) => {
      // keep only em/strong/a inside; strip other tags but keep their text
      const t = document.createElement('div'); t.innerHTML = el.innerHTML;
      t.querySelectorAll('*').forEach(c => {
        const tag = c.tagName.toLowerCase();
        if (!['em', 'strong', 'a', 'br'].includes(tag)) { c.replaceWith(...Array.from(c.childNodes)); }
        else if (tag === 'a') { const href = (c as HTMLAnchorElement).getAttribute('href') || '#'; c.setAttribute('href', href); Array.from(c.attributes).forEach(a => { if (a.name !== 'href') c.removeAttribute(a.name); }); }
        else { Array.from(c.attributes).forEach(a => c.removeAttribute(a.name)); }
      });
      const s = t.innerHTML.replace(/<br\s*\/?>(?=)/gi, ' ').replace(/\s+/g, ' ').trim();
      if (s) blocks.push(s);
    };
    const kids = Array.from(wrap.children);
    if (kids.length) kids.forEach(push);
    else if (wrap.textContent?.trim()) blocks.push(wrap.textContent.trim());
    return blocks.join('\n\n');
  }

  function rtCmd(cmd: string) {
    document.execCommand(cmd, false);
    bodyEl?.focus();
  }
  function makeLink() {
    const url = prompt('Link URL (e.g. https://…):', 'https://');
    if (url) document.execCommand('createLink', false, url);
    bodyEl?.focus();
  }

  function openEdit(r: any) {
    editErr = '';
    editing = {
      id: r.id, headline: r.headline || '', deck: r.deck || '', body: r.body || '',
      pull_quote: r.pull_quote || '', verdict: r.verdict || '', rt_score: r.rt_score || '',
      box_office: r.box_office || '', budget: r.budget || '', director: r.director || '',
      starring: r.starring || '', genre: r.genre || '', rating: r.rating || '',
      digital_date: r.digital_date || '', accent: r.accent || '#dc2626',
    };
    // populate the contentEditable after it mounts
    setTimeout(() => { if (bodyEl) bodyEl.innerHTML = bodyToHtml(editing.body); }, 0);
  }
  function closeEdit() { editing = null; }
  async function saveEdit() {
    if (!editing) return;
    saving = true; editErr = '';
    try {
      if (bodyEl) editing.body = htmlToBody(bodyEl.innerHTML);
      const { id, ...patch } = editing;
      const res = await fetch('/api/admin/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id, patch }),
      });
      const d = await res.json();
      if (res.ok && d.ok) { editing = null; await load(); }
      else editErr = d.error || 'Save failed';
    } catch (e) { editErr = 'Save failed'; }
    saving = false;
  }

  $: shown = reviews.filter(r => filter === 'all' || r.status === filter);
  $: draftCount = reviews.filter(r => r.status === 'draft').length;
  $: pubCount = reviews.filter(r => r.status === 'published').length;

  // ---- comment moderation ----
  let tab: 'reviews' | 'comments' = 'reviews';
  let comments: any[] = [];
  let cmFilter: 'pending' | 'all' = 'pending';
  let pendingCount = 0;
  let cmLoading = false;
  let cmBusy: number | null = null;

  async function loadComments() {
    cmLoading = true;
    try {
      const res = await fetch(`/api/admin/reviews?comments=${cmFilter}`);
      if (res.ok) { const d = await res.json(); comments = d.comments || []; pendingCount = d.pendingCount ?? comments.filter((c:any)=>c.status==='pending').length; }
    } catch {} finally { cmLoading = false; }
  }
  async function cmAct(id: number, action: string) {
    if (action === 'comment_remove' && !confirm('Delete this comment?')) return;
    cmBusy = id;
    try {
      const res = await fetch('/api/admin/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id }) });
      if (res.ok) await loadComments();
    } catch {} finally { cmBusy = null; }
  }
  async function cmReply(id: number) {
    const text = prompt('Reply as TrendiMovies Team (posts an official ✓ reply):');
    if (!text || text.trim().length < 2) return;
    cmBusy = id;
    try {
      const res = await fetch('/api/admin/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'comment_reply', id, text: text.trim() }) });
      if (res.ok) await loadComments(); else alert('Reply failed');
    } catch { alert('Reply failed'); } finally { cmBusy = null; }
  }
  function switchTab(t: 'reviews' | 'comments') { tab = t; if (t === 'comments' && comments.length === 0) loadComments(); }
  $: if (cmFilter) { /* reload on filter change */ }
  const cfmt = (s: string) => s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  const poster = (p: string | null) => p ? `https://image.tmdb.org/t/p/w92${p}` : '/images/no-poster.svg';
  const fmt = (s: string | null) => s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  onMount(load);
</script>

<div class="mb-5 flex gap-2 border-b border-[#2a2a2a] pb-3">
  <button class="px-4 py-2 rounded-lg text-sm font-semibold" class:bg-[#e50914]={tab==='reviews'} class:text-white={tab==='reviews'} class:text-[#888]={tab!=='reviews'} on:click={() => switchTab('reviews')}>Reviews</button>
  <button class="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2" class:bg-[#e50914]={tab==='comments'} class:text-white={tab==='comments'} class:text-[#888]={tab!=='comments'} on:click={() => switchTab('comments')}>
    Comments {#if pendingCount > 0}<span class="text-xs bg-amber-500 text-black px-1.5 rounded-full">{pendingCount}</span>{/if}
  </button>
</div>

{#if tab === 'comments'}
  <div class="mb-5 flex gap-2">
    <button class="px-4 py-2 rounded-lg text-sm font-medium" class:bg-amber-600={cmFilter==='pending'} class:text-white={cmFilter==='pending'} class:bg-[#1a1a1a]={cmFilter!=='pending'} class:text-[#a0a0a0]={cmFilter!=='pending'} on:click={() => { cmFilter='pending'; loadComments(); }}>Pending review</button>
    <button class="px-4 py-2 rounded-lg text-sm font-medium" class:bg-amber-600={cmFilter==='all'} class:text-white={cmFilter==='all'} class:bg-[#1a1a1a]={cmFilter!=='all'} class:text-[#a0a0a0]={cmFilter!=='all'} on:click={() => { cmFilter='all'; loadComments(); }}>All comments</button>
  </div>
  {#if cmLoading}
    <p class="text-center py-12 text-[#666]">Loading comments…</p>
  {:else if comments.length === 0}
    <p class="text-center py-12 text-[#666]">{cmFilter === 'pending' ? 'No comments awaiting review. 🎉' : 'No comments yet.'}</p>
  {:else}
    <div class="space-y-3">
      {#each comments as c (c.id)}
        <div class="p-4 rounded-xl border" style="border-color:#2a2a2a; background:#141414;">
          <div class="flex items-center gap-2 mb-2 text-xs">
            <span class="font-bold px-2 py-0.5 rounded-full" class:bg-amber-900={c.status==='pending'} class:text-amber-300={c.status==='pending'} class:bg-green-900={c.status==='visible'} class:text-green-300={c.status==='visible'}>{c.status === 'pending' ? 'PENDING' : 'VISIBLE'}</span>
            <span class="font-semibold text-white">{c.author}</span>
            {#if c.parent_id}<span class="text-[#777]">↳ reply</span>{/if}
            {#if c.is_spoiler}<span class="text-purple-400">⚠️ spoiler</span>{/if}
            {#if c.ctx}<span class="text-[#8a8fa0]">{c.ctx.kind}</span><span class="text-[#666]">on “{c.ctx.title}”</span>{/if}
            <span class="text-[#555] ml-auto">{cfmt(c.created_at)}</span>
          </div>
          <p class="text-sm text-[#dcdae0] whitespace-pre-wrap break-words mb-3">{c.body}</p>
          <div class="flex gap-2">
            {#if c.status === 'pending'}
              <button disabled={cmBusy===c.id} on:click={() => cmAct(c.id, 'comment_approve')} class="px-3 py-1.5 text-sm rounded-lg bg-green-700 text-white hover:bg-green-600 disabled:opacity-50 font-medium">Approve</button>
            {/if}
            {#if c.ctx}<a href={c.ctx.url} target="_blank" rel="noopener" class="px-3 py-1.5 text-sm rounded-lg bg-[#222] text-white hover:bg-[#2e2e2e]">View ↗</a>{/if}
            <button disabled={cmBusy===c.id} on:click={() => cmReply(c.id)} class="px-3 py-1.5 text-sm rounded-lg bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 disabled:opacity-50 font-medium">↩ Reply</button>
            <button disabled={cmBusy===c.id} on:click={() => cmAct(c.id, 'comment_remove')} class="px-3 py-1.5 text-sm rounded-lg bg-red-900/40 text-red-300 hover:bg-red-900/70 disabled:opacity-50">Delete</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
{:else}

<div class="mb-6 flex items-center justify-between flex-wrap gap-4">
  <div class="flex gap-2">
    {#each [['all', `All (${reviews.length})`], ['draft', `Drafts (${draftCount})`], ['published', `Published (${pubCount})`]] as [key, label]}
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        class:bg-[#e50914]={filter === key}
        class:text-white={filter === key}
        class:bg-[#1a1a1a]={filter !== key}
        class:text-[#a0a0a0]={filter !== key}
        on:click={() => filter = key as any}>{label}</button>
    {/each}
  </div>
  <div class="text-sm text-[#888]">Reviews auto-drafted by the generator appear here for approval.</div>
</div>

{#if loading}
  <p class="text-center py-12 text-[#666]">Loading reviews…</p>
{:else if error}
  <p class="text-center py-12 text-red-400">{error}</p>
{:else if shown.length === 0}
  <p class="text-center py-12 text-[#666]">No reviews yet. Generate one with the review generator on the server.</p>
{:else}
  <div class="space-y-3">
    {#each shown as r (r.id)}
      <div class="flex items-center gap-4 p-4 rounded-xl border" style="border-color:#2a2a2a; background:#141414;">
        <img src={poster(r.poster_path)} alt="" class="w-14 h-20 object-cover rounded-lg flex-none" style="box-shadow:0 4px 12px rgba(0,0,0,.4);" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold px-2 py-0.5 rounded-full"
              class:bg-green-900={r.status === 'published'} class:text-green-300={r.status === 'published'}
              class:bg-amber-900={r.status === 'draft'} class:text-amber-300={r.status === 'draft'}>
              {r.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
            </span>
            <span class="text-xs text-[#777]">{r.title} ({r.year})</span>
            {#if r.rt_score}<span class="text-xs text-green-400">🍅 {r.rt_score}</span>{/if}
            {#if r.box_office}<span class="text-xs text-amber-400">{r.box_office}</span>{/if}
          </div>
          <div class="font-semibold text-white truncate">{r.headline}</div>
          <div class="text-xs text-[#666] mt-1">Created {fmt(r.created_at)}{r.published_at ? ` · Published ${fmt(r.published_at)}` : ''}</div>
        </div>
        <div class="flex items-center gap-2 flex-none">
          <a href={`/review/${r.slug}?preview=1`} target="_blank" rel="noopener"
             class="px-3 py-2 text-sm rounded-lg bg-[#222] text-white hover:bg-[#2e2e2e] transition-colors">Preview ↗</a>
          <button on:click={() => openEdit(r)}
             class="px-3 py-2 text-sm rounded-lg bg-[#1f2a44] text-blue-200 hover:bg-[#26365a] transition-colors">Edit</button>
          {#if r.status === 'draft'}
            <button disabled={busyId === r.id} on:click={() => act(r.id, 'publish')}
              class="px-3 py-2 text-sm rounded-lg bg-green-700 text-white hover:bg-green-600 disabled:opacity-50 font-medium">Publish</button>
          {:else}
            <button disabled={busyId === r.id} on:click={() => act(r.id, 'unpublish')}
              class="px-3 py-2 text-sm rounded-lg bg-[#333] text-white hover:bg-[#444] disabled:opacity-50">Unpublish</button>
          {/if}
          <button disabled={busyId === r.id} on:click={() => act(r.id, 'delete')}
            class="px-2.5 py-2 text-sm rounded-lg bg-red-900/40 text-red-300 hover:bg-red-900/70 disabled:opacity-50" title="Delete">🗑</button>
        </div>
      </div>
    {/each}
  </div>
{/if}
{/if}

{#if editing}
  <div class="edit-overlay" on:click|self={closeEdit}>
    <div class="edit-modal">
      <div class="edit-head">
        <h3>Edit review</h3>
        <button class="edit-x" on:click={closeEdit}>✕</button>
      </div>
      <div class="edit-body">
        <label>Headline<input bind:value={editing.headline} maxlength="300" /></label>
        <label>Deck (subtitle)<input bind:value={editing.deck} maxlength="300" /></label>
        <div class="rt-field">
          <span class="rt-label">Body</span>
          <div class="rt-toolbar">
            <button type="button" title="Bold" on:click={() => rtCmd('bold')}><b>B</b></button>
            <button type="button" title="Italic" on:click={() => rtCmd('italic')}><i>I</i></button>
            <button type="button" title="Link" on:click={makeLink}>🔗</button>
            <span class="rt-sep"></span>
            <button type="button" title="New paragraph" on:click={() => rtCmd('insertParagraph')}>¶ Paragraph</button>
            <span class="rt-hint">Select text, then Bold/Italic. Enter twice = new paragraph.</span>
          </div>
          <div class="rt-editor" contenteditable="true" bind:this={bodyEl}></div>
        </div>
        <label>Pull-quote<input bind:value={editing.pull_quote} /></label>
        <label>Verdict<input bind:value={editing.verdict} maxlength="300" /></label>
        <div class="edit-grid">
          <label>RT score<input bind:value={editing.rt_score} placeholder="94%" /></label>
          <label>Box office<input bind:value={editing.box_office} placeholder="$371M" /></label>
          <label>Budget<input bind:value={editing.budget} placeholder="$750K" /></label>
          <label>Rating<input bind:value={editing.rating} placeholder="R" /></label>
          <label>Genre<input bind:value={editing.genre} placeholder="Horror" /></label>
          <label>Digital date<input bind:value={editing.digital_date} placeholder="Jun 30, 2026" /></label>
          <label>Director<input bind:value={editing.director} /></label>
          <label>Starring<input bind:value={editing.starring} /></label>
          <label>Accent<input type="color" bind:value={editing.accent} style="height:42px;padding:4px;" /></label>
        </div>
        {#if editErr}<div class="edit-err">{editErr}</div>{/if}
      </div>
      <div class="edit-foot">
        <button class="edit-cancel" on:click={closeEdit}>Cancel</button>
        <button class="edit-save" on:click={saveEdit} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .edit-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;overflow-y:auto}
  .edit-modal{background:#141414;border:1px solid #2a2a2a;border-radius:18px;width:100%;max-width:760px;box-shadow:0 30px 80px rgba(0,0,0,.6)}
  .edit-head{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #2a2a2a}
  .edit-head h3{font-size:18px;font-weight:800;color:#fff}
  .edit-x{background:none;border:none;color:#888;font-size:18px;cursor:pointer}
  .edit-body{padding:22px 24px;display:flex;flex-direction:column;gap:16px;max-height:70vh;overflow-y:auto}
  .edit-body label{display:flex;flex-direction:column;gap:6px;font-size:13px;color:#9a97a4;font-weight:600}
  .edit-body .hint{font-weight:400;color:#666}
  .edit-body input,.edit-body textarea{background:#0a0a0a;border:1px solid #333;border-radius:10px;padding:10px 12px;color:#fff;font-size:14px;font-family:inherit}
  .edit-body input:focus,.edit-body textarea:focus{outline:none;border-color:#e50914}
  .edit-body textarea{line-height:1.6;resize:vertical}
  .edit-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
  .edit-err{color:#f87171;font-size:13px}
  /* rich text editor */
  .rt-field{display:flex;flex-direction:column;gap:6px}
  .rt-label{font-size:13px;color:#9a97a4;font-weight:600}
  .rt-toolbar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;background:#0a0a0a;border:1px solid #333;border-bottom:none;border-radius:10px 10px 0 0;padding:7px 10px}
  .rt-toolbar button{background:#1c1c1c;border:1px solid #333;color:#ddd;width:32px;height:30px;border-radius:7px;cursor:pointer;font-size:14px;display:inline-flex;align-items:center;justify-content:center}
  .rt-toolbar button:hover{background:#2a2a2a;color:#fff}
  .rt-toolbar button:nth-child(5){width:auto;padding:0 12px;font-size:12px}
  .rt-sep{width:1px;height:20px;background:#333;margin:0 2px}
  .rt-hint{font-size:11px;color:#666;margin-left:auto}
  .rt-editor{background:#0a0a0a;border:1px solid #333;border-radius:0 0 10px 10px;padding:14px;color:#fff;font-size:15px;line-height:1.7;min-height:220px;max-height:360px;overflow-y:auto;outline:none}
  .rt-editor:focus{border-color:#e50914}
  .rt-editor :global(p){margin:0 0 14px}
  .rt-editor :global(em){color:#ffd7d7;font-style:italic}
  .rt-editor :global(strong){color:#fff}
  .rt-editor:empty:before{content:'Write the review…';color:#555}
  .edit-foot{display:flex;justify-content:flex-end;gap:10px;padding:18px 24px;border-top:1px solid #2a2a2a}
  .edit-cancel{background:#222;color:#ccc;border:none;padding:10px 20px;border-radius:10px;cursor:pointer;font-weight:600}
  .edit-save{background:#e50914;color:#fff;border:none;padding:10px 24px;border-radius:10px;cursor:pointer;font-weight:700}
  .edit-save:disabled{opacity:.6}
  @media(max-width:640px){.edit-grid{grid-template-columns:1fr 1fr}}
</style>
