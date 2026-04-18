<script lang="ts">
  export let columns: string[] = [];
  export let rows: (string | number | null)[][] = [];
  export let emptyMessage: string = 'No data available';
  export let pageSize: number = 0;

  let currentPage = 0;

  $: totalPages = pageSize > 0 ? Math.ceil(rows.length / pageSize) : 1;
  $: displayRows = pageSize > 0 ? rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize) : rows;

  function prevPage() {
    if (currentPage > 0) currentPage--;
  }
  function nextPage() {
    if (currentPage < totalPages - 1) currentPage++;
  }
</script>

<div class="overflow-x-auto">
  {#if rows.length === 0}
    <div class="text-center py-8 text-[#666]">
      {emptyMessage}
    </div>
  {:else}
    <table class="admin-table">
      <thead>
        <tr>
          {#each columns as col}
            <th>{col}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each displayRows as row}
          <tr>
            {#each row as cell}
              <td>{cell ?? '-'}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>

    {#if pageSize > 0 && totalPages > 1}
      <div class="flex items-center justify-between mt-3 px-1">
        <span class="text-xs text-[#666]">
          {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, rows.length)} of {rows.length}
        </span>
        <div class="flex gap-2">
          <button
            on:click={prevPage}
            disabled={currentPage === 0}
            class="px-3 py-1 text-xs rounded bg-[#1a1a1a] border border-[#333] text-[#a0a0a0] hover:bg-[#222] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span class="text-xs text-[#666] flex items-center">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            on:click={nextPage}
            disabled={currentPage >= totalPages - 1}
            class="px-3 py-1 text-xs rounded bg-[#1a1a1a] border border-[#333] text-[#a0a0a0] hover:bg-[#222] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    {/if}
  {/if}
</div>
