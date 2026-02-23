<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, Menu, X, Sun, Moon, Bell, Film, Tv, ChevronDown } from 'lucide-svelte';

  let isMenuOpen = false;
  let isSearchOpen = false;
  let isScrolled = false;
  let isDark = true;
  let searchQuery = '';
  let showGenreDropdown = false;

  const genres = [
    { name: 'Action', slug: 'action' },
    { name: 'Comedy', slug: 'comedy' },
    { name: 'Drama', slug: 'drama' },
    { name: 'Horror', slug: 'horror' },
    { name: 'Romance', slug: 'romance' },
    { name: 'Sci-Fi', slug: 'sci-fi' },
    { name: 'Thriller', slug: 'thriller' },
    { name: 'Animation', slug: 'animation' },
    { name: 'Documentary', slug: 'documentary' },
    { name: 'Fantasy', slug: 'fantasy' }
  ];

  onMount(() => {
    isDark = document.documentElement.classList.contains('dark');

    const handleScroll = () => {
      isScrolled = window.scrollY > 50;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    if (e.key === 'Enter' && searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  function submitSearch() {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }
</script>

<header
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
  class:bg-opacity-95={isScrolled}
  class:backdrop-blur-md={isScrolled}
  style="background-color: {isScrolled ? 'var(--bg-primary)' : 'transparent'};"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href="/" class="flex items-center space-x-2">
        <span class="text-2xl font-bold" style="color: var(--accent);">Trendi</span>
        <span class="text-2xl font-bold" style="color: var(--text-primary);">Movies</span>
      </a>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center space-x-6">
        <a href="/" class="flex items-center space-x-1 hover:text-[var(--accent)] transition-colors" style="color: var(--text-primary);">
          <span>Home</span>
        </a>
        <a href="/movies" class="flex items-center space-x-1 hover:text-[var(--accent)] transition-colors" style="color: var(--text-primary);">
          <Film size={18} />
          <span>Movies</span>
        </a>
        <a href="/series" class="flex items-center space-x-1 hover:text-[var(--accent)] transition-colors" style="color: var(--text-primary);">
          <Tv size={18} />
          <span>Series</span>
        </a>

        <!-- Genres Dropdown -->
        <div class="relative" on:mouseenter={() => showGenreDropdown = true} on:mouseleave={() => showGenreDropdown = false}>
          <button class="flex items-center space-x-1 hover:text-[var(--accent)] transition-colors" style="color: var(--text-primary);">
            <span>Genres</span>
            <ChevronDown size={16} />
          </button>

          {#if showGenreDropdown}
            <div class="absolute top-full left-0 mt-2 w-48 rounded-lg shadow-xl py-2" style="background-color: var(--bg-card); border: 1px solid var(--border);">
              {#each genres as genre}
                <a
                  href="/genre/{genre.slug}"
                  class="block px-4 py-2 hover:bg-[var(--bg-hover)] transition-colors"
                  style="color: var(--text-primary);"
                >
                  {genre.name}
                </a>
              {/each}
            </div>
          {/if}
        </div>

        <a href="/request" class="hover:text-[var(--accent)] transition-colors" style="color: var(--text-primary);">
          Request
        </a>
      </nav>

      <!-- Right Side Actions -->
      <div class="flex items-center space-x-4">
        <!-- Search -->
        <div class="hidden sm:flex items-center">
          {#if isSearchOpen}
            <div class="flex items-center rounded-full px-3 py-1.5" style="background-color: var(--bg-card); border: 1px solid var(--border);">
              <input
                type="text"
                bind:value={searchQuery}
                on:keydown={handleSearch}
                placeholder="Search movies, series..."
                class="bg-transparent outline-none w-48 text-sm"
                style="color: var(--text-primary);"
                autofocus
              />
              <button on:click={submitSearch} class="ml-2">
                <Search size={18} style="color: var(--text-secondary);" />
              </button>
            </div>
            <button on:click={() => { isSearchOpen = false; searchQuery = ''; }} class="ml-2">
              <X size={20} style="color: var(--text-secondary);" />
            </button>
          {:else}
            <button on:click={() => isSearchOpen = true} class="p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors">
              <Search size={20} style="color: var(--text-primary);" />
            </button>
          {/if}
        </div>

        <!-- Theme Toggle -->
        <button
          on:click={toggleTheme}
          class="p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Toggle theme"
        >
          {#if isDark}
            <Sun size={20} style="color: var(--text-primary);" />
          {:else}
            <Moon size={20} style="color: var(--text-primary);" />
          {/if}
        </button>

        <!-- Notifications -->
        <button class="p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors relative">
          <Bell size={20} style="color: var(--text-primary);" />
          <span class="absolute top-1 right-1 w-2 h-2 rounded-full" style="background-color: var(--accent);"></span>
        </button>

        <!-- Mobile Menu Toggle -->
        <button
          class="md:hidden p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
          on:click={() => isMenuOpen = !isMenuOpen}
        >
          {#if isMenuOpen}
            <X size={24} style="color: var(--text-primary);" />
          {:else}
            <Menu size={24} style="color: var(--text-primary);" />
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if isMenuOpen}
    <div class="md:hidden" style="background-color: var(--bg-primary); border-top: 1px solid var(--border);">
      <div class="px-4 py-4 space-y-3">
        <!-- Mobile Search -->
        <div class="flex items-center rounded-lg px-3 py-2" style="background-color: var(--bg-card); border: 1px solid var(--border);">
          <Search size={18} style="color: var(--text-secondary);" />
          <input
            type="text"
            bind:value={searchQuery}
            on:keydown={handleSearch}
            placeholder="Search movies, series..."
            class="bg-transparent outline-none flex-1 ml-2 text-sm"
            style="color: var(--text-primary);"
          />
        </div>

        <a href="/" class="block py-2 hover:text-[var(--accent)]" style="color: var(--text-primary);">Home</a>
        <a href="/movies" class="block py-2 hover:text-[var(--accent)]" style="color: var(--text-primary);">Movies</a>
        <a href="/series" class="block py-2 hover:text-[var(--accent)]" style="color: var(--text-primary);">Series</a>
        <a href="/genres" class="block py-2 hover:text-[var(--accent)]" style="color: var(--text-primary);">Genres</a>
        <a href="/request" class="block py-2 hover:text-[var(--accent)]" style="color: var(--text-primary);">Request</a>
      </div>
    </div>
  {/if}
</header>

<!-- Spacer for fixed header -->
<div class="h-16"></div>
