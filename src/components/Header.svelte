<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, Menu, X, Sun, Moon, Film, Tv, ChevronDown, Crown, Send } from 'lucide-svelte';

  let isMenuOpen = false;
  let isSearchOpen = false;
  let isScrolled = false;
  let isDark = true;
  let searchQuery = '';
  let showGenreDropdown = false;
  let showDiscoveryDropdown = false;
  let currentPath = '';

  // Live search autocomplete
  let suggestions: any[] = [];
  let showSuggestions = false;
  let searchLoading = false;
  let debounceTimer: any;

  const genres = [
    { name: 'Action', slug: 'action' },
    { name: 'Comedy', slug: 'comedy' },
    { name: 'Drama', slug: 'drama' },
    { name: 'Horror', slug: 'horror' },
    { name: 'Romance', slug: 'romance' },
    { name: 'Sci-Fi', slug: 'science-fiction' },
    { name: 'Thriller', slug: 'thriller' },
    { name: 'Animation', slug: 'animation' },
    { name: 'Documentary', slug: 'documentary' },
    { name: 'Fantasy', slug: 'fantasy' }
  ];

  onMount(() => {
    isDark = document.documentElement.classList.contains('dark');
    currentPath = window.location.pathname;
    const handleScroll = () => {
      isScrolled = window.scrollY > 50;
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        showSuggestions = false;
      }
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  });

  function toggleTheme() {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  function handleSearch(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      showSuggestions = false;
      return;
    }
    if (e.key === 'Enter' && searchQuery.trim()) {
      showSuggestions = false;
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  function submitSearch() {
    if (searchQuery.trim()) {
      showSuggestions = false;
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  function onSearchInput() {
    clearTimeout(debounceTimer);
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      suggestions = [];
      showSuggestions = false;
      searchLoading = false;
      return;
    }
    searchLoading = true;
    showSuggestions = true;
    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=all`);
        const data = await res.json();
        suggestions = (data.results || []).slice(0, 6);
      } catch {
        suggestions = [];
      }
      searchLoading = false;
    }, 300);
  }

  function goToResult(item: any) {
    showSuggestions = false;
    const path = item.type === 'movie'
      ? `/movie/${item.tmdb_id || item.id}`
      : `/tv/${item.tmdb_id || item.id}`;
    window.location.href = path;
  }

  function getPosterThumb(path: string | null): string {
    return path ? `https://image.tmdb.org/t/p/w92${path}` : '/images/no-poster.svg';
  }

  function isActive(path: string): boolean {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  }

  function isGenreActive(): boolean {
    return currentPath.startsWith('/genre');
  }

  function isDiscoveryActive(): boolean {
    return currentPath.startsWith('/category/');
  }
</script>

<header
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 header-bg"
  class:scrolled={isScrolled}
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16 lg:h-20">
      <!-- Premium Logo -->
      <a href="/" class="flex items-center space-x-1 group">
        <div class="relative">
          <Crown size={24} class="text-amber-400 group-hover:text-amber-300 transition-colors lg:w-7 lg:h-7" />
        </div>
        <span class="text-xl lg:text-2xl font-black tracking-tight logo-text">Trendi</span>
        <span class="text-xl lg:text-2xl font-black tracking-tight logo-text-dark">Movies</span>
      </a>

      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex items-center space-x-0.5">
        <a href="/" class="nav-link" class:nav-link-active={isActive('/')}>
          Home
        </a>
        <a href="/movies" class="nav-link flex items-center gap-1.5" class:nav-link-active={isActive('/movies')}>
          <Film size={16} />
          <span>Movies</span>
        </a>
        <a href="/series" class="nav-link flex items-center gap-1.5" class:nav-link-active={isActive('/series')}>
          <Tv size={16} />
          <span>Series</span>
        </a>

        <!-- Genres Dropdown -->
        <div class="relative" on:mouseenter={() => showGenreDropdown = true} on:mouseleave={() => showGenreDropdown = false}>
          <button class="nav-link flex items-center gap-1" class:nav-link-active={isGenreActive()}>
            <span>Genre</span>
            <ChevronDown size={14} class="transition-transform {showGenreDropdown ? 'rotate-180' : ''}" />
          </button>
          {#if showGenreDropdown}
            <div class="dropdown-menu">
              <div class="grid grid-cols-2 gap-1">
                {#each genres as genre}
                  <a href="/genre/{genre.slug}" class="dropdown-item">
                    {genre.name}
                  </a>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Discovery Dropdown -->
        <div class="relative" on:mouseenter={() => showDiscoveryDropdown = true} on:mouseleave={() => showDiscoveryDropdown = false}>
          <button class="nav-link flex items-center gap-1" class:nav-link-active={isDiscoveryActive()}>
            <span>Discovery</span>
            <ChevronDown size={14} class="transition-transform {showDiscoveryDropdown ? 'rotate-180' : ''}" />
          </button>
          {#if showDiscoveryDropdown}
            <div class="dropdown-menu w-52">
              <a href="/category/anime" class="dropdown-item">Anime</a>
              <a href="/category/korean-movies" class="dropdown-item">K-Drama Movies</a>
              <a href="/category/korean-series" class="dropdown-item">K-Drama Series</a>
              <a href="/category/bollywood" class="dropdown-item">Bollywood</a>
              <div class="my-1 border-t" style="border-color: var(--border);"></div>
              <a href="/category/marvel" class="dropdown-item flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-red-500"></span>
                Marvel
              </a>
              <a href="/category/dc" class="dropdown-item flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                DC
              </a>
            </div>
          {/if}
        </div>

        <a href="/request" class="nav-link-gold">
          Request
        </a>
      </nav>

      <!-- Right Side Actions -->
      <div class="flex items-center space-x-2">
        <!-- Search -->
        <div class="hidden sm:flex items-center">
          {#if isSearchOpen}
            <div class="relative search-container">
              <div class="flex items-center rounded-full px-4 py-2 search-bar">
                <input
                  type="text"
                  bind:value={searchQuery}
                  on:keydown={handleSearch}
                  on:input={onSearchInput}
                  on:focus={() => { if (suggestions.length > 0) showSuggestions = true; }}
                  placeholder="Search movies, series..."
                  class="bg-transparent outline-none w-52 text-sm search-input"
                  autofocus
                />
                <button on:click={submitSearch}>
                  <Search size={18} class="text-amber-400" />
                </button>
              </div>
              <!-- Suggestions Dropdown -->
              {#if showSuggestions}
                <div class="suggestions-dropdown">
                  {#if searchLoading}
                    <div class="suggestion-loading">
                      <div class="spinner"></div>
                      <span>Searching...</span>
                    </div>
                  {:else if suggestions.length === 0}
                    <div class="suggestion-empty">No results found</div>
                  {:else}
                    {#each suggestions as item}
                      <button class="suggestion-item" on:click={() => goToResult(item)}>
                        <img
                          src={getPosterThumb(item.poster_path)}
                          alt={item.title}
                          class="suggestion-poster"
                          loading="lazy"
                        />
                        <div class="suggestion-info">
                          <span class="suggestion-title">{item.title}</span>
                          <span class="suggestion-meta">
                            {item.year || 'N/A'}
                            <span class="suggestion-badge" class:badge-movie={item.type === 'movie'} class:badge-series={item.type === 'series'}>
                              {item.type === 'movie' ? 'Movie' : 'Series'}
                            </span>
                          </span>
                        </div>
                        {#if item.vote_average > 0}
                          <span class="suggestion-rating">★ {item.vote_average.toFixed(1)}</span>
                        {/if}
                      </button>
                    {/each}
                    <a href="/search?q={encodeURIComponent(searchQuery.trim())}" class="suggestion-viewall">
                      View all results →
                    </a>
                  {/if}
                </div>
              {/if}
            </div>
            <button on:click={() => { isSearchOpen = false; searchQuery = ''; showSuggestions = false; suggestions = []; }} class="ml-2 p-2">
              <X size={20} class="text-gray-400 hover:text-amber-400 transition-colors" />
            </button>
          {:else}
            <button on:click={() => isSearchOpen = true} class="action-btn">
              <Search size={20} />
            </button>
          {/if}
        </div>

        <!-- Theme Toggle -->
        <button on:click={toggleTheme} class="action-btn" aria-label="Toggle theme">
          {#if isDark}
            <Sun size={20} />
          {:else}
            <Moon size={20} />
          {/if}
        </button>

        <!-- Mobile Menu Toggle -->
        <button class="lg:hidden action-btn" on:click={() => isMenuOpen = !isMenuOpen}>
          {#if isMenuOpen}
            <X size={24} />
          {:else}
            <Menu size={24} />
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Menu - Slide down panel, not full page -->
  {#if isMenuOpen}
    <div class="lg:hidden mobile-menu" on:click|self={() => isMenuOpen = false}>
      <div class="mobile-menu-content">
        <!-- Mobile Search -->
        <div class="relative search-container mb-4">
          <div class="flex items-center rounded-xl px-4 py-3 mobile-search-bar">
            <Search size={18} class="text-amber-400" />
            <input
              type="text"
              bind:value={searchQuery}
              on:keydown={handleSearch}
              on:input={onSearchInput}
              on:focus={() => { if (suggestions.length > 0) showSuggestions = true; }}
              placeholder="Search movies, series..."
              class="bg-transparent outline-none flex-1 ml-3 text-sm mobile-search-input"
            />
          </div>
          <!-- Mobile Suggestions Dropdown -->
          {#if showSuggestions}
            <div class="suggestions-dropdown mobile">
              {#if searchLoading}
                <div class="suggestion-loading">
                  <div class="spinner"></div>
                  <span>Searching...</span>
                </div>
              {:else if suggestions.length === 0}
                <div class="suggestion-empty">No results found</div>
              {:else}
                {#each suggestions as item}
                  <button class="suggestion-item" on:click={() => goToResult(item)}>
                    <img
                      src={getPosterThumb(item.poster_path)}
                      alt={item.title}
                      class="suggestion-poster"
                      loading="lazy"
                    />
                    <div class="suggestion-info">
                      <span class="suggestion-title">{item.title}</span>
                      <span class="suggestion-meta">
                        {item.year || 'N/A'}
                        <span class="suggestion-badge" class:badge-movie={item.type === 'movie'} class:badge-series={item.type === 'series'}>
                          {item.type === 'movie' ? 'Movie' : 'Series'}
                        </span>
                      </span>
                    </div>
                    {#if item.vote_average > 0}
                      <span class="suggestion-rating">★ {item.vote_average.toFixed(1)}</span>
                    {/if}
                  </button>
                {/each}
                <a href="/search?q={encodeURIComponent(searchQuery.trim())}" class="suggestion-viewall">
                  View all results →
                </a>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Navigation Grid -->
        <div class="grid grid-cols-3 gap-2 mb-4">
          <a href="/" class="mobile-nav-item" class:mobile-nav-active={isActive('/')}>
            <span>Home</span>
          </a>
          <a href="/movies" class="mobile-nav-item" class:mobile-nav-active={isActive('/movies')}>
            <Film size={16} />
            <span>Movies</span>
          </a>
          <a href="/series" class="mobile-nav-item" class:mobile-nav-active={isActive('/series')}>
            <Tv size={16} />
            <span>Series</span>
          </a>
        </div>

        <!-- Genre -->
        <div class="mb-4">
          <p class="text-xs font-semibold uppercase tracking-wider mb-2 category-label">Genre</p>
          <div class="grid grid-cols-5 gap-2">
            {#each genres as genre}
              <a href="/genre/{genre.slug}" class="mobile-nav-item-sm">{genre.name}</a>
            {/each}
          </div>
        </div>

        <!-- Discovery -->
        <div class="mb-4">
          <p class="text-xs font-semibold uppercase tracking-wider mb-2 category-label">Discovery</p>
          <div class="grid grid-cols-3 gap-2">
            <a href="/category/anime" class="mobile-nav-item-sm">Anime</a>
            <a href="/category/korean-movies" class="mobile-nav-item-sm">K-Drama Movies</a>
            <a href="/category/korean-series" class="mobile-nav-item-sm">K-Drama Series</a>
            <a href="/category/bollywood" class="mobile-nav-item-sm">Bollywood</a>
            <a href="/category/marvel" class="mobile-nav-item-sm">Marvel</a>
            <a href="/category/dc" class="mobile-nav-item-sm">DC</a>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-3 pt-3 border-t mobile-border">
          <a href="/request" class="mobile-btn-gold">
            Request
          </a>
          <a href="https://t.me/+n6x4_P8DROA5ZDY0" target="_blank" rel="noopener" class="mobile-btn-telegram">
            <Send size={14} />
            <span>Telegram</span>
          </a>
        </div>
      </div>
    </div>
  {/if}
</header>

<!-- Spacer for fixed header -->
<div class="h-16 lg:h-20"></div>

<style>
  .header-bg {
    background: var(--bg-primary);
    border-bottom: 1px solid transparent;
    backdrop-filter: blur(20px);
    transition: all 0.3s ease;
  }
  .header-bg.scrolled {
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 1px 10px var(--shadow);
  }

  .logo-text {
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .logo-text-dark {
    color: var(--text-primary);
  }

  .nav-link {
    padding: 0.4rem 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 0.875rem;
    border-radius: 0.5rem;
    transition: all 0.2s;
  }
  .nav-link:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }

  .nav-link-active {
    color: var(--text-primary) !important;
    font-weight: 600 !important;
    background: var(--bg-hover) !important;
    border: 1px solid var(--border);
  }

  .nav-link-gold {
    padding: 0.4rem 0.875rem;
    color: #000;
    font-weight: 600;
    font-size: 0.8rem;
    border-radius: 0.5rem;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    transition: all 0.2s;
    box-shadow: 0 1px 4px rgba(251,191,36,0.25);
  }
  .nav-link-gold:hover {
    box-shadow: 0 2px 10px rgba(251,191,36,0.4);
  }

  .nav-link-telegram {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    color: white;
    font-weight: 600;
    font-size: 0.85rem;
    border-radius: 0.5rem;
    background: linear-gradient(135deg, #0088cc 0%, #0077b5 100%);
    transition: all 0.3s;
  }
  .nav-link-telegram:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,136,204,0.4);
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.75rem;
    padding-top: 1.25rem;
    border-radius: 0.75rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    box-shadow: 0 8px 30px var(--shadow);
    backdrop-filter: blur(20px);
    min-width: 200px;
    animation: dropIn 0.2s ease-out;
  }

  .dropdown-menu::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 10px;
  }

  @keyframes dropIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .dropdown-item {
    display: block;
    padding: 0.625rem 1rem;
    color: var(--text-secondary);
    font-size: 0.875rem;
    border-radius: 0.375rem;
    transition: all 0.15s;
  }
  .dropdown-item:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .search-bar {
    background: var(--bg-card);
    border: 1px solid var(--border);
  }

  .search-input {
    color: var(--text-primary);
  }
  .search-input::placeholder {
    color: var(--text-muted);
  }

  .action-btn {
    padding: 0.625rem;
    color: var(--text-secondary);
    border-radius: 0.5rem;
    transition: all 0.2s;
  }
  .action-btn:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }

  /* Mobile Menu Styles */
  .mobile-menu {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    max-height: calc(100vh - 64px);
    overflow-y: auto;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border);
    animation: slideDown 0.2s ease-out;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .mobile-menu-content {
    padding: 1rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .mobile-search-bar {
    background: var(--bg-card);
    border: 1px solid var(--border);
  }

  .mobile-search-input {
    color: var(--text-primary);
  }
  .mobile-search-input::placeholder {
    color: var(--text-muted);
  }

  .mobile-nav-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  .mobile-nav-item:hover {
    border-color: var(--border);
    background: var(--bg-hover);
  }

  .mobile-nav-active {
    background: var(--bg-hover) !important;
    border-color: var(--text-muted) !important;
    color: var(--text-primary) !important;
    font-weight: 600;
  }

  .mobile-nav-item-sm {
    display: block;
    padding: 0.625rem 0.75rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    color: var(--text-secondary);
    font-size: 0.8rem;
    text-align: center;
    transition: all 0.2s;
  }
  .mobile-nav-item-sm:hover {
    border-color: var(--border);
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .category-label {
    color: var(--text-muted);
    padding-left: 0.25rem;
  }

  .mobile-border {
    border-color: var(--border);
  }

  .mobile-btn-gold {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.875rem;
    color: #000;
    font-weight: 700;
    font-size: 0.9rem;
    border-radius: 0.75rem;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    box-shadow: 0 2px 10px rgba(251,191,36,0.3);
  }

  .mobile-btn-telegram {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.875rem;
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
    border-radius: 0.75rem;
    background: linear-gradient(135deg, #0088cc 0%, #0077b5 100%);
  }

  /* Search Suggestions */
  .suggestions-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    min-width: 320px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    box-shadow: 0 8px 30px var(--shadow);
    overflow: hidden;
    z-index: 100;
    animation: dropIn 0.15s ease-out;
  }
  .suggestions-dropdown.mobile {
    min-width: unset;
    border-radius: 0.75rem;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.625rem 0.75rem;
    text-align: left;
    transition: background 0.15s;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--text-primary);
  }
  .suggestion-item:hover {
    background: var(--bg-hover);
  }

  .suggestion-poster {
    width: 36px;
    height: 54px;
    object-fit: cover;
    border-radius: 0.25rem;
    flex-shrink: 0;
    background: var(--bg-hover);
  }

  .suggestion-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .suggestion-title {
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-primary);
  }

  .suggestion-meta {
    font-size: 0.75rem;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .suggestion-badge {
    padding: 0.1rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .badge-movie {
    background: rgba(251, 191, 36, 0.15);
    color: #fbbf24;
  }
  .badge-series {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
  }

  .suggestion-rating {
    font-size: 0.75rem;
    color: #fbbf24;
    font-weight: 600;
    flex-shrink: 0;
  }

  .suggestion-viewall {
    display: block;
    padding: 0.625rem 0.75rem;
    text-align: center;
    font-size: 0.8rem;
    font-weight: 500;
    color: #fbbf24;
    border-top: 1px solid var(--border);
    transition: background 0.15s;
  }
  .suggestion-viewall:hover {
    background: var(--bg-hover);
  }

  .suggestion-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .suggestion-empty {
    padding: 1rem;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--border);
    border-top-color: #fbbf24;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
