<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Play, Square, RefreshCw, Terminal, Clock, Cpu, Activity } from 'lucide-svelte';

  interface RunningScript {
    pid: string;
    cpu: string;
    mem: string;
    command: string;
  }

  interface CronStatus {
    runningScripts: RunningScript[];
    progress: {
      seriesSync?: {
        totalProcessed?: number;
        successful?: number;
        failed?: number;
        skipped?: number;
        lastUpdated?: string;
      };
      missingSeriesCount?: number;
    };
  }

  let status: CronStatus = { runningScripts: [], progress: {} };
  let logs: string[] = [];
  let loading = true;
  let logsLoading = false;
  let triggering: string | null = null;
  let selectedLog = 'series-sync.log';
  let autoRefresh = true;
  let refreshInterval: number;

  const availableLogs = [
    { value: 'series-sync.log', label: 'Series Sync Log' },
    { value: 'series-sync-temp.log', label: 'Series Sync (Temp)' },
    { value: 'episode-ddl-migration.log', label: 'Episode DDL Migration' },
  ];

  async function fetchStatus() {
    try {
      const res = await fetch('/api/admin/crons/status');
      status = await res.json();
    } catch (e) {
      console.error('Error fetching status:', e);
    }
    loading = false;
  }

  async function fetchLogs() {
    logsLoading = true;
    try {
      const res = await fetch(`/api/admin/crons/logs?file=${selectedLog}&lines=100`);
      const data = await res.json();
      logs = data.lines || [];
    } catch (e) {
      logs = ['Error fetching logs'];
    }
    logsLoading = false;
  }

  async function triggerScript(script: string) {
    triggering = script;
    try {
      const res = await fetch('/api/admin/crons/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script })
      });
      const data = await res.json();
      if (data.success) {
        setTimeout(() => {
          fetchStatus();
          fetchLogs();
        }, 2000);
      }
    } catch (e) {
      console.error('Error triggering script:', e);
    }
    triggering = null;
  }

  function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        fetchStatus();
        fetchLogs();
      }, 10000);
    }
  }

  onMount(() => {
    fetchStatus();
    fetchLogs();
    startAutoRefresh();
  });

  onDestroy(() => {
    if (refreshInterval) clearInterval(refreshInterval);
  });

  $: if (autoRefresh !== undefined) startAutoRefresh();
  $: if (selectedLog) fetchLogs();

  function getLogLineClass(line: string): string {
    if (line.includes('Error') || line.includes('error') || line.includes('failed')) return 'log-line error';
    if (line.includes('Success') || line.includes('Added:') || line.includes('✓')) return 'log-line success';
    if (line.includes('Warning') || line.includes('Skipped')) return 'log-line warning';
    if (line.includes('[')) return 'log-line info';
    return 'log-line';
  }
</script>

<div class="space-y-6">
  <!-- Controls -->
  <div class="flex flex-wrap gap-4 items-center justify-between">
    <div class="flex gap-2">
      <button
        on:click={() => triggerScript('sync-series')}
        disabled={triggering !== null}
        class="btn btn-primary"
      >
        {#if triggering === 'sync-series'}
          <RefreshCw size={16} class="animate-spin" />
        {:else}
          <Play size={16} />
        {/if}
        Run Series Sync
      </button>

      <button
        on:click={() => triggerScript('migrate-episode')}
        disabled={triggering !== null}
        class="btn btn-secondary"
      >
        {#if triggering === 'migrate-episode'}
          <RefreshCw size={16} class="animate-spin" />
        {:else}
          <Play size={16} />
        {/if}
        Run Episode DDL
      </button>
    </div>

    <div class="flex items-center gap-4">
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={autoRefresh} class="rounded" />
        Auto-refresh (10s)
      </label>

      <button on:click={() => { fetchStatus(); fetchLogs(); }} class="btn btn-ghost">
        <RefreshCw size={16} />
        Refresh Now
      </button>
    </div>
  </div>

  <!-- Running Processes -->
  <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6">
    <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
      <Activity size={20} class="text-green-500" />
      Running Processes
    </h3>

    {#if loading}
      <div class="text-[#666] py-4">Loading...</div>
    {:else if status.runningScripts.length === 0}
      <div class="text-[#666] py-4">No scripts currently running</div>
    {:else}
      <div class="space-y-3">
        {#each status.runningScripts as proc}
          <div class="bg-[#0a0a0a] rounded-lg p-4 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <p class="font-mono text-sm truncate max-w-md">{proc.command}</p>
                <p class="text-xs text-[#666]">PID: {proc.pid}</p>
              </div>
            </div>
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-1">
                <Cpu size={14} class="text-[#666]" />
                <span>{proc.cpu}%</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[#666]">MEM:</span>
                <span>{proc.mem}%</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Progress Info -->
  {#if status.progress?.seriesSync}
    <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock size={20} class="text-blue-500" />
        Series Sync Progress
      </h3>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-[#0a0a0a] rounded-lg p-4">
          <p class="text-sm text-[#666] mb-1">Processed</p>
          <p class="text-2xl font-bold">{(status.progress.seriesSync.totalProcessed || 0).toLocaleString()}</p>
        </div>
        <div class="bg-[#0a0a0a] rounded-lg p-4">
          <p class="text-sm text-[#666] mb-1">Successful</p>
          <p class="text-2xl font-bold text-green-500">{(status.progress.seriesSync.successful || 0).toLocaleString()}</p>
        </div>
        <div class="bg-[#0a0a0a] rounded-lg p-4">
          <p class="text-sm text-[#666] mb-1">Failed</p>
          <p class="text-2xl font-bold text-red-500">{(status.progress.seriesSync.failed || 0).toLocaleString()}</p>
        </div>
        <div class="bg-[#0a0a0a] rounded-lg p-4">
          <p class="text-sm text-[#666] mb-1">Skipped</p>
          <p class="text-2xl font-bold text-yellow-500">{(status.progress.seriesSync.skipped || 0).toLocaleString()}</p>
        </div>
      </div>

      {#if status.progress.seriesSync.lastUpdated}
        <p class="text-xs text-[#666] mt-4">
          Last updated: {status.progress.seriesSync.lastUpdated}
        </p>
      {/if}
    </div>
  {/if}

  <!-- Logs -->
  <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <Terminal size={20} class="text-purple-500" />
        Logs
      </h3>

      <select bind:value={selectedLog} class="select w-auto">
        {#each availableLogs as log}
          <option value={log.value}>{log.label}</option>
        {/each}
      </select>
    </div>

    <div class="log-viewer admin-scrollbar">
      {#if logsLoading}
        <div class="text-[#666]">Loading logs...</div>
      {:else if logs.length === 0}
        <div class="text-[#666]">No log entries found</div>
      {:else}
        {#each logs as line}
          <div class={getLogLineClass(line)}>{line}</div>
        {/each}
      {/if}
    </div>
  </div>
</div>
