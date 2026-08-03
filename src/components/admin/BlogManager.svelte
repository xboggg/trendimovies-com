<script lang="ts">
  import { onMount } from 'svelte';

  interface Post {
    id: number; slug: string; title: string; deck: string; status: string;
    accent: string; cover_image: string | null; tags: string[] | null;
    angle: string | null; source: string; created_at: string; published_at: string | null;
  }

  let posts: Post[] = [];
  let loading = true;
  let error = '';
  let filter: 'all' | 'draft' | 'published' = 'all';
  let busyId: number | null = null;

  async function load() {
    loading = true; error = '';
    try {
      const res = await fetch('/api/admin/blog');
      if (res.ok) { const d = await res.json(); posts = d.posts || []; }
      else error = 'Failed to load posts';
    } catch (e) { error = 'Failed to load posts'; }
    loading = false;
  }

  async function act(id: number, action: string) {
    if (action === 'delete' && !confirm('Delete this post permanently?')) return;
    busyId = id;
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id }),
      });
      if (res.ok) await load();
      else alert('Action failed');
    } catch (e) { alert('Action failed'); }
    busyId = null;
  }

  // ---- edit modal ----
  let editing: any = null;
  let saving = false;
  let editErr = '';

  function openEdit(p: any) {
    editErr = '';
    editing = {
      id: p.id, title: p.title || '', deck: p.deck || '', body: p.body || '',
      tags: (p.tags || []).join(', '), accent: p.accent || '#dc2626',
      related_tmdb_id: p.related_tmdb_id || '',
    };
  }
  function closeEdit() { editing = null; }
  async function saveEdit() {
    if (!editing) return;
    saving = true; editErr = '';
    try {
      const { id, tags, related_tmdb_id, ...rest } = editing;
      const patch = {
        ...rest,
        tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        related_tmdb_id: related_tmdb_id ? Number(related_tmdb_id) : null,
      };
      const res = await fetch('/api/admin/blog', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id, patch }),
      });
      const d = await res.json();
      if (res.ok && d.ok) { editing = null; await load(); }
      else editErr = d.error || 'Save failed';
    } catch (e) { editErr = 'Save failed'; }
    saving = false;
  }

  $: shown = posts.filter(p => filter === 'all' || p.status === filter);
  $: draftCount = posts.filter(p => p.status === 'draft').length;
  $: pubCount = posts.filter(p => p.status === 'published').length;

  const cover = (p: string | null) => p ? (p.startsWith('http') ? p : `https://image.tmdb.org/t/p/w185${p}`) : '/images/no-poster.svg';
  const fmt = (s: string | null) => s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  onMount(load);
</script>

<div class="mb-6 flex items-center justify-between flex-wrap gap-4">
  <div class="flex gap-2">
    {#each [['all', `All (${posts.length})`], ['draft', `Drafts (${draftCount})`], ['published', `Published (${pubCount})`]] as [key, label]}
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        class:bg-[#e50914]={filter === key}
        class:text-white={filter === key}
        class:bg-[#1a1a1a]={filter !== key}
        class:text-[#a0a0a0]={filter !== key}
        on:click={() => filter = key as any}>{label}</button>
    {/each}
  </div>
  <div class="text-sm text-[#888]">Auto-written daily by auto_blog.py — held here as a draft if the sanity gate doesn't pass.</div>
</div>

{#if loading}
  <p class="text-center py-12 text-[#666]">Loading posts…</p>
{:else if error}
  <p class="text-center py-12 text-red-400">{error}</p>
{:else if shown.length === 0}
  <p class="text-center py-12 text-[#666]">No posts yet. The daily cron writes one automatically, or run <code class="text-[#f59e0b]">blog_generator.py --angle &lt;name&gt;</code> on the server.</p>
{:else}
  <div class="space-y-3">
    {#each shown as p (p.id)}
      <div class="flex items-center gap-4 p-4 rounded-xl border" style="border-color:#2a2a2a; background:#141414;">
        <img src={cover(p.cover_image)} alt="" class="w-14 h-14 object-cover rounded-lg flex-none" style="box-shadow:0 4px 12px rgba(0,0,0,.4);" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold px-2 py-0.5 rounded-full"
              class:bg-green-900={p.status === 'published'} class:text-green-300={p.status === 'published'}
              class:bg-amber-900={p.status === 'draft'} class:text-amber-300={p.status === 'draft'}>
              {p.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
            </span>
            {#if p.angle}<span class="text-xs text-[#777]">{p.angle.replace(/_/g, ' ')}</span>{/if}
            {#if p.tags?.length}<span class="text-xs text-[#8a8fa0]">{p.tags.join(', ')}</span>{/if}
          </div>
          <div class="font-semibold text-white truncate">{p.title}</div>
          <div class="text-xs text-[#666] mt-1">Created {fmt(p.created_at)}{p.published_at ? ` · Published ${fmt(p.published_at)}` : ''}</div>
        </div>
        <div class="flex items-center gap-2 flex-none">
          <a href={`/blog/${p.slug}?preview=1`} target="_blank" rel="noopener"
             class="px-3 py-2 text-sm rounded-lg bg-[#222] text-white hover:bg-[#2e2e2e] transition-colors">Preview ↗</a>
          <button on:click={() => openEdit(p)}
             class="px-3 py-2 text-sm rounded-lg bg-[#1f2a44] text-blue-200 hover:bg-[#26365a] transition-colors">Edit</button>
          {#if p.status === 'draft'}
            <button disabled={busyId === p.id} on:click={() => act(p.id, 'publish')}
              class="px-3 py-2 text-sm rounded-lg bg-green-700 text-white hover:bg-green-600 disabled:opacity-50 font-medium">Publish</button>
          {:else}
            <button disabled={busyId === p.id} on:click={() => act(p.id, 'unpublish')}
              class="px-3 py-2 text-sm rounded-lg bg-[#333] text-white hover:bg-[#444] disabled:opacity-50">Unpublish</button>
          {/if}
          <button disabled={busyId === p.id} on:click={() => act(p.id, 'delete')}
            class="px-2.5 py-2 text-sm rounded-lg bg-red-900/40 text-red-300 hover:bg-red-900/70 disabled:opacity-50" title="Delete">🗑</button>
        </div>
      </div>
    {/each}
  </div>
{/if}

{#if editing}
  <div class="edit-overlay" on:click|self={closeEdit}>
    <div class="edit-modal">
      <div class="edit-head">
        <h3>Edit post</h3>
        <button class="edit-x" on:click={closeEdit}>✕</button>
      </div>
      <div class="edit-body">
        <label>Title<input bind:value={editing.title} maxlength="300" /></label>
        <label>Deck (subtitle)<input bind:value={editing.deck} maxlength="300" /></label>
        <label>Body (leave a blank line between paragraphs)
          <textarea bind:value={editing.body} rows="14"></textarea>
        </label>
        <div class="edit-grid">
          <label>Tags (comma-separated)<input bind:value={editing.tags} placeholder="box-office, weekly-recap" /></label>
          <label>Related TMDB id<input bind:value={editing.related_tmdb_id} placeholder="e.g. 27205" /></label>
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
  .edit-modal{background:#141414;border:1px solid #2a2a2a;border-radius:18px;width:100%;max-width:720px;box-shadow:0 30px 80px rgba(0,0,0,.6)}
  .edit-head{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #2a2a2a}
  .edit-head h3{font-size:18px;font-weight:800;color:#fff}
  .edit-x{background:none;border:none;color:#888;font-size:18px;cursor:pointer}
  .edit-body{padding:22px 24px;display:flex;flex-direction:column;gap:16px;max-height:70vh;overflow-y:auto}
  .edit-body label{display:flex;flex-direction:column;gap:6px;font-size:13px;color:#9a97a4;font-weight:600}
  .edit-body input,.edit-body textarea{background:#0a0a0a;border:1px solid #333;border-radius:10px;padding:10px 12px;color:#fff;font-size:14px;font-family:inherit}
  .edit-body textarea{resize:vertical;line-height:1.6}
  .edit-body input:focus,.edit-body textarea:focus{outline:none;border-color:#e50914}
  .edit-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
  .edit-err{color:#f87171;font-size:13px}
  .edit-foot{display:flex;justify-content:flex-end;gap:10px;padding:18px 24px;border-top:1px solid #2a2a2a}
  .edit-cancel{background:#222;color:#ccc;border:none;padding:10px 20px;border-radius:10px;cursor:pointer;font-weight:600}
  .edit-save{background:#e50914;color:#fff;border:none;padding:10px 24px;border-radius:10px;cursor:pointer;font-weight:700}
  .edit-save:disabled{opacity:.6}
  @media(max-width:640px){.edit-grid{grid-template-columns:1fr 1fr}}
</style>
