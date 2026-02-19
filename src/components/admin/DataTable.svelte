<script lang="ts">
  export let columns: string[] = [];
  export let rows: (string | number | null)[][] = [];
  export let emptyMessage: string = 'No data available';
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
        {#each rows as row}
          <tr>
            {#each row as cell}
              <td>{cell ?? '-'}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
