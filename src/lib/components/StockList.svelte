<script lang="ts">
  import { mostMovingStocks, stockError, isLoading } from '../stores/stockStore';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import type { Stock } from '../types/Stock';
  import { getMostMovingStocks } from '../services/stockService';
  import StockGraph from './StockGraph.svelte';

  onMount(async () => {
    getMostMovingStocks();
  });

  let detailsShown:string = '';
  function toggleDetails(stockSymbol: string) {
    detailsShown = detailsShown === stockSymbol ? '' : stockSymbol;
  }

  function getColor(change: number) : string {
    if (change > 0) return 'green';
    if (change < 0) return 'red';
    return 'white';
  }

  let searchTerm: string = '';

  let filteredStocks: Stock[] = [];

  $: {
    filteredStocks = $mostMovingStocks.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  let sortColumn: 'symbol' | 'name' | 'change' | 'price' = 'change';
  let sortDirection: 'asc' | 'desc' = 'desc';

  $: sortedStocks = filteredStocks.sort((a, b) => {
    let compare = 0;
    switch (sortColumn) {
      case 'symbol':
      case 'name':
        compare = a[sortColumn].localeCompare(b[sortColumn]);
        break;
      case 'change':
        compare = a.changesPercentage - b.changesPercentage;
        break;
      case 'price':
        compare = a[sortColumn] - b[sortColumn];
        break;
    }
    return sortDirection === 'asc' ? compare : -compare;
  });
  function changeSort(column: 'symbol' | 'name' | 'change' | 'price') {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }
  }
</script>

<div class="stocklist-container">
  <h2>Market Most Active</h2>
  {#if $isLoading}
    <p class="loading">Loading Data...</p>
  {:else if $stockError}
    <p style="color: red;">Error: {$stockError}</p>
  {:else}
  <input type="text" bind:value={searchTerm} placeholder="Search stocks..." />
  <table transition:fade="{{duration: 1000}}">
    <thead>
      <tr>
        <th class="symbol" on:click={() => changeSort('symbol')}>
          Ticker Symbol {sortColumn === 'symbol' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </th>
        <th class="name" on:click={() => changeSort('name')}>
          Company Name {sortColumn === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </th>
        <th class="change" on:click={() => changeSort('change')}>
          Change (%) {sortColumn === 'change' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </th>
        <th class="price" on:click={() => changeSort('price')}>
          Price {sortColumn === 'price' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </th>
      </tr>
    </thead>    
    <tbody>
      {#each sortedStocks as stock (stock.id)}
        <tr>
          <td class="clickable" on:click={() => toggleDetails(stock.symbol)}>{stock.symbol}</td>
          <td>{stock.name}</td>
          <td style="color: {getColor(stock.change)}">{stock.change.toFixed(2)} ({stock.changesPercentage.toFixed(2)}%)</td>
          <td>{stock.price.toFixed(2)}</td>
        </tr>
        {#if detailsShown === stock.symbol}
          <tr class="detail-row">
            <td colspan="5">
              <div class="detail-content">
                <p>Performance for {stock.symbol} over the last 30 days.</p>
                <StockGraph symbol={stock.symbol} />
              </div>
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
  {/if}
</div>

<style>
  .stocklist-container{
    padding: 0 20px;
    width: 100%;
    margin: 0 auto;
    min-width: 900px;
  }
  .detail-row{
    background-color: #262626;
    transition: all ease-in-out 0.5s;
  }
  .loading{
    text-align: center;
    width: 100%;
  }
  input{
    width: 100%;
    padding: 12px 20px;
    margin: 8px 0;
    box-sizing: border-box;
  }
  table {
    border: 1px solid #ddd;
    border-collapse: collapse;
    width: 100%;
  }
  thead tr{
    background-color: var(--secondary-background-color);
    color: var(--highlight-color);
  }
  th:not(:last-child){
    border-right: 1px solid #ddd;
  }
  th.symbol{
    width: 10%;
  }
  th.name{
    width: 55%;
  }
  th.change{
    width: 20%;
  }
  th.price{
    width: 15%;
  }
  tr{
    border-bottom: 1px solid #ddd;
  }
  tr:not(.detail-row):nth-child(even) {
    background-color: var(--secondary-background-color);
  }
  td, th{
    text-align: left;
    padding: 8px;
  }
  td:not(:last-child){
    border-right: 1px solid #ddd;
  }
  td.clickable, thead{
    cursor: pointer;
    text-decoration: underline;
  }
  @media screen and (max-width: 900px) {
    .stocklist-container{
      min-width: 400px;
    }
  }
</style>
