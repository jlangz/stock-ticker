<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  // getting import error for svelte-chartjs, reverting to chart.js
  import Chart from 'chart.js/auto';
  export let symbol: string;
  import type { HistoricalData } from '../types/HistoricalData';
  import { fade } from 'svelte/transition';

  let performanceData: HistoricalData[] = [];
  let error: string | null = null;
  let chart: Chart | null = null;
  let chartElement: HTMLCanvasElement;

  const API_KEY = '878ef591b32e64242bbfce43ae7a872f';
  let isLoading: boolean = true;

  async function fetchPerformanceData(stockSymbol: string) {
    isLoading = true;
    const apiUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${stockSymbol}?from=${formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))}&to=${formatDate(new Date())}&apikey=${API_KEY}`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch performance data');
      performanceData = data.historical || [];
    }catch (e) {
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = 'An unknown error occurred';
      }
    } finally {
      isLoading = false;
    }
  }

  function formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  $: if (performanceData.length > 0 && chartElement) {
    chart?.destroy();
    const ctx = chartElement.getContext('2d');
    if (ctx) {
      const reversedData = [...performanceData].reverse();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: reversedData.map(data => data.date),
          datasets: [{
            label: `${symbol} Stock Price`,
            data: reversedData.map(data => data.close),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false,
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
    } else {
      console.error('Failed to get 2D context');
    }
  }
  onMount(() => fetchPerformanceData(symbol));
  onDestroy(() => chart?.destroy());
</script>

{#if isLoading}
  <p>Loading performance data...</p>
{:else if error}
  <p>{error}</p>
{:else if performanceData.length > 0}
  <div class="chart-container" transition:fade>
    <canvas bind:this={chartElement}></canvas>
  </div>
{:else}
  <p>No performance data available.</p>
{/if}

<style>
  .chart-container {
    max-width: 100%;
    margin: auto;
  }
  .chart-container canvas {
    max-width: 100%;
  }
</style>
