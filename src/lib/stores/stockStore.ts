import { writable } from 'svelte/store';
import type { Stock } from '../types/Stock';

export const mostMovingStocks = writable<Stock[]>([]);
export const stockError = writable<string | null>(null);
export const isLoading = writable(true);