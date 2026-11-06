<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import { Play, Download } from 'lucide-svelte';
  import StreamSheet from './StreamSheet.svelte';
  import DownloadSheet from './DownloadSheet.svelte';

  // The series page's Episodes tab (Cinema look). Same data as SeasonTabs,
  // which it replaces on this page: seasons, episodes, our files, subtitles.
  // Stream and Download open the same pop-ups as the movie page, for the
  // episode that was tapped.
  interface Season { id: number; season_number: number; name: string | null; overview: string | null; poster_path: string | null; episode_count: number | null; }
  interface Episode {
    id: number; episode_number: number; name: string | null; overview: string | null; still_path: string | null;
    air_date: string | null; runtime: number | null; vote_average: number | null; has_downloads: boolean;
  }
  interface SubtitleLink { id: number; file_name: string | null; file_size: string | null; telegram_file_id: string; }

  export let tmdbId: number;
  export let imdbId: string | null = null;
  export let title: string = '';
  export let originalTitle: string = '';
  export let backdropPath: string | null = null;
  export let seasons: Season[] = [];
  export let episodesBySeason: Record<number, Episode[]> = {};
  export let downloadsByEpisode: Record<number, any[]> = {};
  export let subtitlesByEpisode: Record<number, SubtitleLink[]> = {};
  export let latest: { season: number; episode: number } | null = null;

  const ORDER: Record<string, number> = { '720p': 0, '1080p': 1, '2160p': 2, '480p': 3, hdrip: 4 };
  const today = new Date().toISOString().slice(0, 10);

  let activeSeason = (() => {
    const real = seasons.filter(s => s.season_number > 0);
    if (latest && real.some(s => s.season_number === latest!.season)) return latest.season;
    if (real.length > 0) return real[0].season_number;
    return seasons.length > 0 ? seasons[0].season_number : 1;
  })();

  $: currentEpisodes = episodesBySeason[activeSeason] || [];
  $: realSeasons = seasons.filter(s => s.season_number > 0);
  $: totalEpisodes = Object.entries(episodesBySeason).filter(([sn]) => Number(sn) > 0).reduce((n, [, e]) => n + (e?.length || 0), 0)
    || realSeasons.reduce((n, s) => n + (s.episode_count || 0), 0);
  $: totalFiles = Object.values(downloadsByEpisode).reduce((n, a) => n + (a?.length || 0), 0);

  function filesOf(ep: Episode): any[] { return downloadsByEpisode[ep.id] || []; }
  function qualitiesOf(ep: Episode): string[] {
    return [...new Set(filesOf(ep).map(l => l.quality))].sort((a, b) => (ORDER[a] ?? 9) - (ORDER[b] ?? 9));
  }
  function isUpcoming(ep: Episode): boolean { return !!ep.air_date && ep.air_date > today; }

  function seasonStatus(n: number): 'full' | 'some' | 'stream' {
    const eps = episodesBySeason[n] || [];
    if (eps.length === 0) return 'stream';
    const withFiles = eps.filter(e => filesOf(e).length > 0).length;
    return withFiles === 0 ? 'stream' : withFiles === eps.length ? 'full' : 'some';
  }
  function seasonLabel(s: Season): string {
    const nm = (s.name || '').trim();
    if (!nm || /^season\s*\d+$/i.test(nm)) return `Season ${s.season_number}`;
    return nm.replace(/^s\d+\s*[•·-]\s*/i, '');
  }
  function still(ep: Episode): string {
    if (ep.still_path) return `https://image.tmdb.org/t/p/w300${ep.still_path}`;
    if (backdropPath) return `https://image.tmdb.org/t/p/w300${backdropPath}`;
    return '/images/no-still.jpg';
  }
  function fmtDate(d: string | null): string {
    if (!d) return 'TBA';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  const code = (s: number, e: number) => `S${pad(s)}E${pad(e)}`;

  $: latestEp = latest ? (episodesBySeason[latest.season] || []).find(e => e.episode_number === latest!.episode) || null : null;

  // ---- the two pop-ups
  let streamFor: { season: number; episode: number } = { season: activeSeason, episode: 1 };
  let dlFor: { season: number; ep: Episode } | null = null;

  async function stream(season: number, episode: number) {
    streamFor = { season, episode };
    await tick();
    window.dispatchEvent(new CustomEvent('tm:stream'));
  }
  async function download(season: number, ep: Episode) {
    dlFor = { season, ep };
    await tick();
    window.dispatchEvent(new CustomEvent('tm:downloads'));
  }

  $: dlLinks = dlFor ? filesOf(dlFor.ep) : [];
  $: dlSubs = dlFor ? subtitlesByEpisode[dlFor.ep.id] || [] : [];

  // ---- jump to an episode in a long season
  let flash = '';
  function jump(n: number) {
    const el = document.getElementById(`ep-${activeSeason}-${n}`);
    if (!el) return;
    el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    flash = `${activeSeason}-${n}`;
    setTimeout(() => (flash = ''), 1300);
  }

  let reduce = false;
  let stripEl: HTMLElement;
  // keep the chosen season in view in the row of seasons
  async function showActive(smooth: boolean) {
    await tick();
    const el = stripEl?.querySelector('.sn.on') as HTMLElement | null;
    if (el && stripEl) stripEl.scrollTo({ left: Math.max(0, el.offsetLeft - (stripEl.clientWidth - el.clientWidth) / 2), behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }
  function pick(n: number) { activeSeason = n; showActive(true); }
  onMount(() => {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    showActive(false);
    const playLatest = () => { if (latest) stream(latest.season, latest.episode); };
    window.addEventListener('tm:play-latest', playLatest);
    return () => window.removeEventListener('tm:play-latest', playLatest);
  });
</script>

<div class="eb">
  <div class="tot">
    {#if realSeasons.length}<span><b>{realSeasons.length}</b> season{realSeasons.length > 1 ? 's' : ''}</span>{/if}
    {#if totalEpisodes}<span><b>{totalEpisodes}</b> episodes</span>{/if}
    {#if totalFiles}<span><b>{totalFiles}</b> files</span>{/if}
  </div>

  {#if latestEp && latest}
    <div class="lat">
      <div class="lat-img" style={`background-image:url(${still(latestEp)})`}></div>
      <div class="lat-in">
        <div class="lat-tag">LATEST EPISODE</div>
        <div class="lat-t">{code(latest.season, latest.episode)} · {latestEp.name || 'Episode ' + latestEp.episode_number}</div>
        <div class="lat-m">{fmtDate(latestEp.air_date) + (latestEp.runtime ? ' · ' + latestEp.runtime + ' min' : '')}</div>
        <div class="lat-go">
          <button type="button" class="b stream" on:click={() => stream(latest.season, latest.episode)}><Play size={15} fill="currentColor" /> Stream</button>
          {#if filesOf(latestEp).length > 0}
            <button type="button" class="b dl" on:click={() => download(latest.season, latestEp)}><Download size={15} /> Download</button>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <div class="strip" role="tablist" aria-label="Seasons" bind:this={stripEl}>
    {#each seasons as s (s.id + '-' + s.season_number)}
      {@const st = seasonStatus(s.season_number)}
      {@const n = (episodesBySeason[s.season_number] || []).length || s.episode_count || 0}
      <button type="button" role="tab" aria-selected={activeSeason === s.season_number} class="sn" class:on={activeSeason === s.season_number} on:click={() => pick(s.season_number)}>
        <span class="sn1">{s.season_number === 0 ? 'Specials' : `Season ${s.season_number}`}</span>
        <span class="sn2">{seasonLabel(s)}</span>
        <span class="sn3"><i class={`dot ${st}`}></i>{n} eps · {st === 'full' ? 'all files' : st === 'some' ? 'some files' : 'stream only'}</span>
      </button>
    {/each}
  </div>

  {#if currentEpisodes.length > 12}
    <div class="jump" aria-label="Jump to episode">
      <span>Jump to</span>
      <div class="jn">{#each currentEpisodes as e}<button type="button" on:click={() => jump(e.episode_number)}>{e.episode_number}</button>{/each}</div>
    </div>
  {/if}

  {#if currentEpisodes.length === 0}
    <p class="none">No episodes listed for this season yet.</p>
  {/if}

  <ul class="eps">
    {#each currentEpisodes as ep, i (activeSeason + '-' + ep.episode_number)}
      {@const files = filesOf(ep)}
      {@const quals = qualitiesOf(ep)}
      {@const up = isUpcoming(ep)}
      <li class="ep" class:flash={flash === `${activeSeason}-${ep.episode_number}`} id={`ep-${activeSeason}-${ep.episode_number}`}
          in:fly={{ y: reduce ? 0 : 14, duration: reduce ? 0 : 320, delay: reduce ? 0 : Math.min(i, 8) * 45 }}>
        <button type="button" class="still" on:click={() => !up && stream(activeSeason, ep.episode_number)} disabled={up} aria-label={`Stream episode ${ep.episode_number}`}>
          <img src={still(ep)} alt="" loading="lazy" width="300" height="169" />
          <span class="en">E{ep.episode_number}</span>
          {#if !up}<span class="pl" aria-hidden="true"><Play size={18} fill="currentColor" /></span>{/if}
        </button>
        <div class="hd">
          <h3>{ep.name || `Episode ${ep.episode_number}`}</h3>
          <div class="meta">
            <span>{up ? 'Airs ' + fmtDate(ep.air_date) : fmtDate(ep.air_date)}</span>
            {#if ep.runtime}<span>{ep.runtime} min</span>{/if}
            {#if ep.vote_average}<span class="star">★ {ep.vote_average.toFixed(1)}</span>{/if}
          </div>
        </div>
        {#if ep.overview}<p class="ov">{ep.overview}</p>{/if}
        <div class="chips">
          {#each quals as q}<span class="ch">{q}</span>{/each}
          {#if (subtitlesByEpisode[ep.id] || []).length > 0}<span class="ch sub">SUB</span>{/if}
          {#if up}<span class="ch soon">Coming soon</span>
          {:else if quals.length === 0}<span class="ch none">Stream only</span>{/if}
        </div>
        <div class="go">
          <button type="button" class="b stream" disabled={up} on:click={() => stream(activeSeason, ep.episode_number)}><Play size={15} fill="currentColor" /> Stream</button>
          <button type="button" class="b dl" disabled={files.length === 0} on:click={() => download(activeSeason, ep)}>
            <Download size={15} /> {files.length > 0 ? `Download` : 'No files yet'}
          </button>
        </div>
      </li>
    {/each}
  </ul>

  <StreamSheet
    {tmdbId}
    {imdbId}
    type="tv"
    season={streamFor.season}
    episode={streamFor.episode}
    title={`${title} ${code(streamFor.season, streamFor.episode)}`}
    hashOpen={false}
  />
  <DownloadSheet
    links={dlLinks}
    subtitles={dlSubs}
    originalTitle={originalTitle}
    heading="Download"
    noun="show"
    subheading={dlFor ? `${code(dlFor.season, dlFor.ep.episode_number)}${dlFor.ep.name ? ' · ' + dlFor.ep.name : ''}` : ''}
    hashOpen={false}
  />
</div>

<style>
  .eb { color: #eef0f5; }
  .tot { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 14px; }
  .tot span { font-size: 12.5px; color: #98a1b4; background: #141821; border: 1px solid #262c3b; border-radius: 999px; padding: 4px 11px; }
  .tot b { color: #eef0f5; }

  .lat { display: grid; grid-template-columns: 1fr; border: 1px solid rgba(246, 185, 59, 0.4); border-radius: 18px; overflow: hidden; margin: 0 0 18px;
    background: linear-gradient(135deg, rgba(246, 185, 59, 0.1), #141821 60%); }
  .lat-img { aspect-ratio: 16 / 7; background-size: cover; background-position: center; position: relative; }
  .lat-img::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, #141821, transparent 70%); }
  .lat-in { padding: 4px 16px 16px; margin-top: -26px; position: relative; z-index: 1; }
  .lat-tag { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.14em; color: #f6b93b; margin-bottom: 4px; }
  .lat-t { font-family: 'Bricolage Grotesque', Inter, sans-serif; font-weight: 700; font-size: 19px; line-height: 1.2; }
  .lat-m { color: #98a1b4; font-size: 12.5px; margin: 4px 0 12px; }
  .lat-go { display: flex; gap: 8px; }
  @media (min-width: 700px) { .lat { grid-template-columns: 260px 1fr; } .lat-img { aspect-ratio: auto; min-height: 150px; } .lat-img::after { background: linear-gradient(to right, transparent 60%, #141821); } .lat-in { margin: 0; padding: 16px; align-self: center; } }

  .strip { position: relative; display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding: 2px 0 8px; margin: 0 -2px 8px; scroll-snap-type: x proximity; }
  .strip::-webkit-scrollbar { display: none; }
  .sn { flex: none; text-align: left; appearance: none; cursor: pointer; font: inherit; color: #eef0f5; background: #141821; border: 1px solid #262c3b; border-radius: 14px; padding: 9px 13px; display: grid; gap: 2px; scroll-snap-align: start; transition: border-color .2s, background .2s, transform .2s; }
  .sn:hover { border-color: #3a4158; }
  .sn.on { border-color: #f6b93b; background: linear-gradient(160deg, rgba(246, 185, 59, 0.14), #141821); transform: translateY(-1px); }
  .sn1 { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #98a1b4; }
  .sn2 { font-weight: 700; font-size: 14px; white-space: nowrap; }
  .sn3 { font-size: 11.5px; color: #98a1b4; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
  .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; background: #3b82f6; }
  .dot.full { background: #39d3b2; box-shadow: 0 0 8px rgba(57, 211, 178, 0.7); } .dot.some { background: #f6b93b; }
  .sn:focus-visible, .b:focus-visible, .still:focus-visible, .jn button:focus-visible { outline: 2px solid #f6b93b; outline-offset: 2px; }

  .jump { display: flex; align-items: center; gap: 10px; margin: 0 0 10px; font-size: 12px; color: #98a1b4; }
  .jn { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding: 2px 0; }
  .jn::-webkit-scrollbar { display: none; }
  .jn button { flex: none; width: 32px; height: 32px; appearance: none; cursor: pointer; font: inherit; font-size: 12px; color: #c8cdd9; background: #141821; border: 1px solid #262c3b; border-radius: 9px; }
  .jn button:hover { border-color: #f6b93b; color: #fff; }

  .none { color: #98a1b4; padding: 18px 0; }
  .eps { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
  .ep { display: grid; grid-template-columns: 124px minmax(0, 1fr); gap: 4px 12px; padding: 12px; background: #141821; border: 1px solid #262c3b; border-radius: 16px; transition: border-color .25s, box-shadow .25s; }
  .ep:hover { border-color: #3a4158; }
  .ep.flash { border-color: #f6b93b; box-shadow: 0 0 0 3px rgba(246, 185, 59, 0.2); }
  .still { grid-row: 1; position: relative; appearance: none; border: 0; padding: 0; cursor: pointer; border-radius: 11px; overflow: hidden; aspect-ratio: 16 / 9; align-self: start; background: #1a1f2b; }
  .still:disabled { cursor: default; opacity: 0.7; }
  .still img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .35s; }
  .still:hover:not(:disabled) img { transform: scale(1.06); }
  .en { position: absolute; left: 6px; top: 6px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; font-weight: 700; padding: 2px 6px; border-radius: 6px; background: rgba(11, 13, 18, 0.78); color: #f6b93b; }
  .pl { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; background: rgba(5, 7, 10, 0.35); opacity: 0.85; transition: opacity .2s, background .2s; }
  .still:hover .pl { background: rgba(246, 185, 59, 0.35); opacity: 1; }
  .hd { grid-row: 1; min-width: 0; align-self: center; }
  .hd h3 { margin: 0 0 3px; font-size: 15px; font-weight: 700; line-height: 1.25; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .meta { display: flex; flex-wrap: wrap; gap: 2px 10px; font-size: 12px; color: #98a1b4; }
  .star { color: #f6b93b; }
  .ov { grid-column: 1 / -1; margin: 6px 0 0; font-size: 13px; line-height: 1.5; color: #aab1c0; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .chips { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .ch { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; padding: 2px 8px; border-radius: 7px; color: #39d3b2; background: rgba(57, 211, 178, 0.12); border: 1px solid rgba(57, 211, 178, 0.28); }
  .ch.sub { color: #b9a4ff; background: rgba(167, 139, 250, 0.12); border-color: rgba(167, 139, 250, 0.3); }
  .ch.none { color: #98a1b4; background: #1a1f2b; border-color: #262c3b; }
  .ch.soon { color: #f6b93b; background: rgba(246, 185, 59, 0.1); border-color: rgba(246, 185, 59, 0.3); }
  .go { grid-column: 1 / -1; display: flex; gap: 8px; margin-top: 10px; }
  .b { flex: 1 1 0; display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 42px; padding: 7px 14px; appearance: none; cursor: pointer; font: inherit; font-weight: 700; font-size: 14px; border-radius: 999px; border: 0; transition: filter .15s, transform .15s; }
  .b.stream { background: #39d3b2; color: #0b0d12; }
  .b.dl { background: #4da3ff; color: #06121f; }
  .b:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
  .b:disabled { cursor: not-allowed; background: #1a1f2b; color: #6d7588; border: 1px solid #262c3b; }

  @media (min-width: 700px) {
    .ep { grid-template-columns: 220px minmax(0, 1fr); gap: 4px 16px; padding: 14px; }
    .ov { grid-column: 2; }
    .chips { grid-column: 2; }
    .go { grid-column: 2; max-width: 360px; }
    .still { grid-row: 1 / span 4; }
    .hd { grid-row: 1; align-self: start; }
    .hd h3 { font-size: 17px; }
  }
  @media (prefers-reduced-motion: reduce) { .still img, .b, .sn, .ep { transition: none; } }
</style>
