<script lang="ts">
  import {
    LayoutDashboard,
    Film,
    Tv,
    Download,
    Clock,
    Link2,
    LogOut,
    ChevronRight,
    Activity,
    MessageSquare,
    X
  } from 'lucide-svelte';

  export let activeTab: string = 'dashboard';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { id: 'movies', label: 'Movies', href: '/admin/movies', icon: Film },
    { id: 'series', label: 'Series', href: '/admin/series', icon: Tv },
    { id: 'downloads', label: 'Downloads', href: '/admin/downloads', icon: Download },
    { id: 'requests', label: 'Requests', href: '/admin/requests', icon: MessageSquare },
    { id: 'crons', label: 'Cron Jobs', href: '/admin/crons', icon: Clock },
    { id: 'assign', label: 'Manual Assign', href: '/admin/manual-assign', icon: Link2 },
    { id: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: Activity },
  ];

  function logout() {
    window.location.href = '/admin/logout';
  }

  function closeMobileSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) {
      sidebar.classList.remove('mobile-open');
    }
    if (overlay) {
      overlay.classList.remove('active');
    }
  }
</script>

<aside class="admin-sidebar fixed left-0 top-0 h-screen w-64 bg-[#141414] border-r border-[#2a2a2a] flex flex-col z-50">
  <!-- Logo -->
  <div class="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
    <a href="/admin" class="flex items-center gap-2">
      <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-[#e50914] to-[#b20710] flex items-center justify-center flex-shrink-0">
        <Activity size={20} class="text-white" />
      </div>
      <div class="min-w-0">
        <h2 class="text-base font-bold text-white truncate">TrendiMovies</h2>
        <p class="text-xs text-[#666]">Admin Panel</p>
      </div>
    </a>
    <!-- Close button for mobile -->
    <button
      class="mobile-close-btn p-2 rounded-lg hover:bg-[#1f1f1f] text-[#666] hover:text-white transition-colors"
      on:click={closeMobileSidebar}
      aria-label="Close menu"
    >
      <X size={20} />
    </button>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 p-3 space-y-1 overflow-y-auto admin-scrollbar">
    <p class="px-3 py-2 text-xs font-semibold text-[#666] uppercase tracking-wider">Menu</p>

    {#each navItems as item}
      <a
        href={item.href}
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative"
        class:bg-[#e50914]={activeTab === item.id}
        class:text-white={activeTab === item.id}
        class:text-[#a0a0a0]={activeTab !== item.id}
        class:hover:bg-[#1f1f1f]={activeTab !== item.id}
        class:hover:text-white={activeTab !== item.id}
        on:click={closeMobileSidebar}
      >
        <svelte:component this={item.icon} size={20} />
        <span class="font-medium">{item.label}</span>
        {#if activeTab === item.id}
          <ChevronRight size={16} class="ml-auto" />
        {/if}
      </a>
    {/each}
  </nav>

  <!-- Footer -->
  <div class="p-3 border-t border-[#2a2a2a]">
    <a
      href="/"
      target="_blank"
      class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#a0a0a0] hover:bg-[#1f1f1f] hover:text-white transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
      <span class="font-medium">View Site</span>
    </a>

    <button
      on:click={logout}
      class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors mt-1 cursor-pointer"
    >
      <LogOut size={20} />
      <span class="font-medium">Logout</span>
    </button>
  </div>
</aside>

<style>
  /* Mobile close button - hidden on desktop */
  .mobile-close-btn {
    display: none;
  }

  /* Mobile styles */
  @media (max-width: 1024px) {
    .admin-sidebar {
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }

    .admin-sidebar:global(.mobile-open) {
      transform: translateX(0);
    }

    .mobile-close-btn {
      display: flex;
    }
  }
</style>
