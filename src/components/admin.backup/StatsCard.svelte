<script lang="ts">
  import { Film, Tv, Play, Download, Eye, MousePointer, Link2, Database } from 'lucide-svelte';

  export let label: string;
  export let value: string | number;
  export let icon: 'film' | 'tv' | 'play' | 'download' | 'eye' | 'click' | 'link' | 'database' = 'database';
  export let subtext: string = '';
  export let trend: 'up' | 'down' | 'neutral' = 'neutral';
  export let color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' = 'red';

  const icons = {
    film: Film,
    tv: Tv,
    play: Play,
    download: Download,
    eye: Eye,
    click: MousePointer,
    link: Link2,
    database: Database,
  };

  const colors = {
    red: 'from-red-500 to-red-700',
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    yellow: 'from-yellow-500 to-yellow-700',
    purple: 'from-purple-500 to-purple-700',
  };

  const bgColors = {
    red: 'bg-red-500/10',
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    yellow: 'bg-yellow-500/10',
    purple: 'bg-purple-500/10',
  };

  $: IconComponent = icons[icon];
</script>

<div class="stats-card bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
  <div class="flex items-start justify-between">
    <div>
      <p class="text-sm font-medium text-[#666] mb-1">{label}</p>
      <p class="text-3xl font-bold text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {#if subtext}
        <p class="text-xs text-[#888] mt-1">{subtext}</p>
      {/if}
    </div>
    <div class="w-12 h-12 rounded-xl bg-gradient-to-br {colors[color]} flex items-center justify-center shadow-lg">
      <svelte:component this={IconComponent} size={24} class="text-white" />
    </div>
  </div>
</div>
