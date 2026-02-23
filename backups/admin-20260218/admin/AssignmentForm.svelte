<script lang="ts">
  import { Search, Film, Tv, Download, Check, AlertCircle, Loader2, X } from 'lucide-svelte';

  interface TelegramFile {
    id: number;
    file_name: string;
    file_size: string;
    quality: string;
    year: number | null;
  }

  interface SearchResult {
    id: number;
    title: string;
    year: string | null;
    poster_path: string | null;
    media_type: 'movie' | 'tv';
  }

  interface Episode {
    id: number;
    episode_number: number;
    season_number: number;
    name: string;
  }

  let contentType: 'movie' | 'episode' = 'movie';
  let searchQuery = '';
  let telegramQuery = '';
  let selectedQuality: '720p' | '1080p' | '2160p' | 'hdrip' = '1080p';
  let source: 'telegram' | 'cinematika' | 'torrent' = 'telegram';
  let customUrl = '';
  let fileSize = '';

  // Search results
  let telegramFiles: TelegramFile[] = [];
  let tmdbResults: SearchResult[] = [];
  let episodes: Episode[] = [];

  // Selected items
  let selectedFile: TelegramFile | null = null;
  let selectedContent: SearchResult | null = null;
  let selectedEpisode: Episode | null = null;
  let selectedSeason: number | null = null;

  // Loading states
  let searchingTelegram = false;
  let searchingTmdb = false;
  let loadingEpisodes = false;
  let assigning = false;

  // Messages
  let successMessage = '';
  let errorMessage = '';

  async function searchTelegram() {
    if (!telegramQuery.trim()) return;

    searchingTelegram = true;
    errorMessage = '';

    try {
      const params = new URLSearchParams({ query: telegramQuery });
      if (selectedQuality) params.append('quality', selectedQuality);

      const res = await fetch(`/api/admin/assign/search-telegram?${params}`, {
        signal: AbortSignal.timeout(30000)
      });
      const data = await res.json();

      if (res.ok) {
        telegramFiles = data.files || [];
        if (telegramFiles.length === 0) {
          errorMessage = 'No Telegram files found matching your query';
        }
      } else {
        errorMessage = data.error || 'Failed to search Telegram files';
      }
    } catch (err: any) {
      if (err.name === 'TimeoutError') {
        errorMessage = 'Search timed out - try a more specific query';
      } else {
        errorMessage = 'Failed to connect to server';
      }
    } finally {
      searchingTelegram = false;
    }
  }

  async function searchTmdb() {
    if (!searchQuery.trim()) return;

    searchingTmdb = true;
    errorMessage = '';

    try {
      // Search for movies
      const movieRes = await fetch(`/api/admin/assign/search-tmdb?query=${encodeURIComponent(searchQuery)}&type=movie`);
      const movieData = await movieRes.json();

      // Search for TV shows
      const tvRes = await fetch(`/api/admin/assign/search-tmdb?query=${encodeURIComponent(searchQuery)}&type=tv`);
      const tvData = await tvRes.json();

      // Combine results
      const movies = (movieData.results || []).map((r: any) => ({ ...r, media_type: 'movie' }));
      const tvShows = (tvData.results || []).map((r: any) => ({ ...r, media_type: 'tv' }));

      tmdbResults = [...movies, ...tvShows]
        .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
        .slice(0, 15);

      if (tmdbResults.length === 0) {
        errorMessage = 'No TMDB results found';
      }
    } catch (err) {
      errorMessage = 'Failed to search TMDB';
    } finally {
      searchingTmdb = false;
    }
  }

  async function loadEpisodes(tmdbId: number, season: number) {
    loadingEpisodes = true;

    try {
      const res = await fetch(`/api/admin/assign/episodes?tmdb_id=${tmdbId}&season=${season}`);
      const data = await res.json();

      episodes = (data.episodes || []).map((ep: any) => ({
        id: ep.id,
        episode_number: ep.episode_number,
        season_number: ep.season_number,
        name: ep.name
      }));
    } catch (err) {
      errorMessage = 'Failed to load episodes';
    } finally {
      loadingEpisodes = false;
    }
  }

  function selectContent(result: SearchResult) {
    selectedContent = result;
    selectedEpisode = null;
    selectedSeason = null;
    episodes = [];

    if (result.media_type === 'tv') {
      contentType = 'episode';
    } else {
      contentType = 'movie';
    }
  }

  function selectSeason(season: number) {
    if (!selectedContent) return;
    selectedSeason = season;
    selectedEpisode = null;
    loadEpisodes(selectedContent.id, season);
  }

  async function assignLink() {
    if (source === 'telegram' && !selectedFile) {
      errorMessage = 'Please select a Telegram file';
      return;
    }

    if (source !== 'telegram' && !customUrl) {
      errorMessage = 'Please enter a URL';
      return;
    }

    if (!selectedContent) {
      errorMessage = 'Please select content from TMDB';
      return;
    }

    if (contentType === 'episode' && !selectedEpisode) {
      errorMessage = 'Please select an episode';
      return;
    }

    assigning = true;
    errorMessage = '';
    successMessage = '';

    try {
      const body: any = {
        content_type: contentType,
        content_id: contentType === 'movie' ? selectedContent.id : selectedEpisode?.id,
        source,
        quality: selectedQuality,
        file_size: fileSize || selectedFile?.file_size || null
      };

      if (source === 'telegram') {
        body.telegram_file_id = selectedFile?.id;
      } else {
        body.url = customUrl;
      }

      const res = await fetch('/api/admin/assign/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        successMessage = `Successfully assigned ${selectedQuality} link to ${selectedContent.title}${contentType === 'episode' ? ` S${selectedSeason}E${selectedEpisode?.episode_number}` : ''}`;

        // Reset selection
        selectedFile = null;
        customUrl = '';
        fileSize = '';
      } else {
        errorMessage = data.error || 'Failed to assign link';
      }
    } catch (err) {
      errorMessage = 'Failed to connect to server';
    } finally {
      assigning = false;
    }
  }

  function formatFileSize(size: string): string {
    return size || 'Unknown size';
  }

  function getPosterUrl(path: string | null): string {
    return path ? `https://image.tmdb.org/t/p/w92${path}` : '/images/no-poster.jpg';
  }

  function clearSelection() {
    selectedContent = null;
    selectedEpisode = null;
    selectedSeason = null;
    episodes = [];
    tmdbResults = [];
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Left Panel: File Selection -->
  <div class="space-y-6">
    <!-- Source Selection -->
    <div class="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
      <h3 class="text-lg font-semibold mb-4">1. Select Source</h3>

      <div class="flex gap-2 mb-4">
        <button
          on:click={() => source = 'telegram'}
          class="px-4 py-2 rounded-lg font-medium transition-colors {source === 'telegram' ? 'bg-[#e50914] text-white' : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}"
        >
          Telegram
        </button>
        <button
          on:click={() => source = 'cinematika'}
          class="px-4 py-2 rounded-lg font-medium transition-colors {source === 'cinematika' ? 'bg-[#e50914] text-white' : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}"
        >
          Cinematika
        </button>
        <button
          on:click={() => source = 'torrent'}
          class="px-4 py-2 rounded-lg font-medium transition-colors {source === 'torrent' ? 'bg-[#e50914] text-white' : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}"
        >
          Torrent
        </button>
      </div>

      <!-- Quality Selection -->
      <div class="mb-4">
        <label class="text-sm text-gray-400 block mb-2">Quality</label>
        <div class="flex gap-2">
          {#each ['720p', '1080p', '2160p', 'hdrip'] as q}
            <button
              on:click={() => selectedQuality = q}
              class="px-3 py-1.5 rounded text-sm font-medium transition-colors {selectedQuality === q ? 'bg-blue-600 text-white' : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}"
            >
              {q}
            </button>
          {/each}
        </div>
      </div>

      {#if source === 'telegram'}
        <!-- Telegram Search -->
        <div>
          <label class="text-sm text-gray-400 block mb-2">Search Telegram Files</label>
          <div class="flex gap-2">
            <input
              type="text"
              bind:value={telegramQuery}
              placeholder="Enter movie/series title..."
              class="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#e50914]"
              on:keydown={(e) => e.key === 'Enter' && searchTelegram()}
            />
            <button
              on:click={searchTelegram}
              disabled={searchingTelegram}
              class="px-4 py-2 bg-[#e50914] text-white rounded-lg font-medium hover:bg-[#b20710] disabled:opacity-50 flex items-center gap-2"
            >
              {#if searchingTelegram}
                <Loader2 size={16} class="animate-spin" />
              {:else}
                <Search size={16} />
              {/if}
              Search
            </button>
          </div>
        </div>

        <!-- Telegram Results -->
        {#if telegramFiles.length > 0}
          <div class="mt-4 max-h-80 overflow-y-auto space-y-2">
            {#each telegramFiles as file}
              <button
                on:click={() => selectedFile = file}
                class="w-full text-left p-3 rounded-lg border transition-colors {selectedFile?.id === file.id ? 'bg-[#e50914]/20 border-[#e50914]' : 'bg-[#0a0a0a] border-[#333] hover:border-[#555]'}"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium truncate">{file.file_name}</p>
                    <div class="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span class="px-2 py-0.5 bg-[#2a2a2a] rounded">{file.quality}</span>
                      <span>{formatFileSize(file.file_size)}</span>
                      {#if file.year}
                        <span>{file.year}</span>
                      {/if}
                    </div>
                  </div>
                  {#if selectedFile?.id === file.id}
                    <Check size={16} class="text-[#e50914] flex-shrink-0" />
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        {/if}
      {:else}
        <!-- Custom URL Input -->
        <div class="space-y-4">
          <div>
            <label class="text-sm text-gray-400 block mb-2">Direct URL</label>
            <input
              type="url"
              bind:value={customUrl}
              placeholder="https://..."
              class="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#e50914]"
            />
          </div>
          <div>
            <label class="text-sm text-gray-400 block mb-2">File Size (optional)</label>
            <input
              type="text"
              bind:value={fileSize}
              placeholder="e.g., 1.2 GB"
              class="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#e50914]"
            />
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Right Panel: Content Selection -->
  <div class="space-y-6">
    <!-- TMDB Search -->
    <div class="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
      <h3 class="text-lg font-semibold mb-4">2. Select Content</h3>

      {#if selectedContent}
        <!-- Selected Content Display -->
        <div class="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#e50914] mb-4">
          <img
            src={getPosterUrl(selectedContent.poster_path)}
            alt={selectedContent.title}
            class="w-16 h-24 object-cover rounded"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              {#if selectedContent.media_type === 'movie'}
                <Film size={16} class="text-blue-400" />
              {:else}
                <Tv size={16} class="text-green-400" />
              {/if}
              <span class="text-xs uppercase text-gray-500">{selectedContent.media_type}</span>
            </div>
            <p class="font-semibold truncate">{selectedContent.title}</p>
            <p class="text-sm text-gray-500">{selectedContent.year}</p>
            <p class="text-xs text-gray-600 mt-1">TMDB ID: {selectedContent.id}</p>
          </div>
          <button
            on:click={clearSelection}
            class="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <X size={16} class="text-gray-400" />
          </button>
        </div>

        <!-- Season/Episode Selection for TV -->
        {#if selectedContent.media_type === 'tv'}
          <div class="space-y-4">
            <div>
              <label class="text-sm text-gray-400 block mb-2">Select Season</label>
              <div class="flex flex-wrap gap-2">
                {#each Array.from({ length: 20 }, (_, i) => i + 1) as season}
                  <button
                    on:click={() => selectSeason(season)}
                    class="w-10 h-10 rounded-lg font-medium transition-colors {selectedSeason === season ? 'bg-[#e50914] text-white' : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}"
                  >
                    {season}
                  </button>
                {/each}
              </div>
            </div>

            {#if loadingEpisodes}
              <div class="flex items-center justify-center py-8">
                <Loader2 size={24} class="animate-spin text-gray-400" />
              </div>
            {:else if episodes.length > 0}
              <div>
                <label class="text-sm text-gray-400 block mb-2">Select Episode</label>
                <div class="max-h-60 overflow-y-auto space-y-2">
                  {#each episodes as ep}
                    <button
                      on:click={() => selectedEpisode = ep}
                      class="w-full text-left p-3 rounded-lg border transition-colors {selectedEpisode?.id === ep.id ? 'bg-[#e50914]/20 border-[#e50914]' : 'bg-[#0a0a0a] border-[#333] hover:border-[#555]'}"
                    >
                      <div class="flex items-center justify-between">
                        <div>
                          <span class="text-sm font-medium">Episode {ep.episode_number}</span>
                          <span class="text-gray-500 ml-2">{ep.name}</span>
                        </div>
                        {#if selectedEpisode?.id === ep.id}
                          <Check size={16} class="text-[#e50914]" />
                        {/if}
                      </div>
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}
      {:else}
        <!-- TMDB Search -->
        <div class="flex gap-2 mb-4">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search TMDB for movie or series..."
            class="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#e50914]"
            on:keydown={(e) => e.key === 'Enter' && searchTmdb()}
          />
          <button
            on:click={searchTmdb}
            disabled={searchingTmdb}
            class="px-4 py-2 bg-[#e50914] text-white rounded-lg font-medium hover:bg-[#b20710] disabled:opacity-50 flex items-center gap-2"
          >
            {#if searchingTmdb}
              <Loader2 size={16} class="animate-spin" />
            {:else}
              <Search size={16} />
            {/if}
            Search
          </button>
        </div>

        <!-- TMDB Results -->
        {#if tmdbResults.length > 0}
          <div class="max-h-96 overflow-y-auto space-y-2">
            {#each tmdbResults as result}
              <button
                on:click={() => selectContent(result)}
                class="w-full text-left p-3 rounded-lg border border-[#333] hover:border-[#555] bg-[#0a0a0a] transition-colors"
              >
                <div class="flex items-center gap-3">
                  <img
                    src={getPosterUrl(result.poster_path)}
                    alt={result.title}
                    class="w-12 h-16 object-cover rounded"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      {#if result.media_type === 'movie'}
                        <Film size={14} class="text-blue-400" />
                      {:else}
                        <Tv size={14} class="text-green-400" />
                      {/if}
                      <span class="text-xs uppercase text-gray-500">{result.media_type}</span>
                    </div>
                    <p class="font-medium truncate">{result.title}</p>
                    <p class="text-sm text-gray-500">{result.year}</p>
                  </div>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      {/if}
    </div>

    <!-- Assignment Summary & Submit -->
    <div class="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
      <h3 class="text-lg font-semibold mb-4">3. Assign Link</h3>

      <!-- Summary -->
      <div class="space-y-2 mb-4 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">Source:</span>
          <span class="font-medium">{source}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Quality:</span>
          <span class="font-medium">{selectedQuality}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">File:</span>
          <span class="font-medium truncate max-w-48">
            {#if source === 'telegram'}
              {selectedFile?.file_name || 'Not selected'}
            {:else}
              {customUrl || 'Not entered'}
            {/if}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Content:</span>
          <span class="font-medium">
            {selectedContent?.title || 'Not selected'}
            {#if contentType === 'episode' && selectedEpisode}
              S{selectedSeason}E{selectedEpisode.episode_number}
            {/if}
          </span>
        </div>
      </div>

      <!-- Messages -->
      {#if errorMessage}
        <div class="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
          <AlertCircle size={16} class="text-red-400" />
          <span class="text-sm text-red-400">{errorMessage}</span>
        </div>
      {/if}

      {#if successMessage}
        <div class="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
          <Check size={16} class="text-green-400" />
          <span class="text-sm text-green-400">{successMessage}</span>
        </div>
      {/if}

      <!-- Submit Button -->
      <button
        on:click={assignLink}
        disabled={assigning || !selectedContent || (source === 'telegram' ? !selectedFile : !customUrl) || (contentType === 'episode' && !selectedEpisode)}
        class="w-full py-3 bg-[#e50914] text-white rounded-lg font-semibold hover:bg-[#b20710] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {#if assigning}
          <Loader2 size={18} class="animate-spin" />
          Assigning...
        {:else}
          <Download size={18} />
          Assign Download Link
        {/if}
      </button>
    </div>
  </div>
</div>
