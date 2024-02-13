import { v4 as uuidv4 } from 'uuid';
import { mostMovingStocks, stockError, isLoading } from '../stores/stockStore';
import type { Stock } from '../types/Stock';

const API_KEY = '878ef591b32e64242bbfce43ae7a872f';
const API_URL = 'https://financialmodelingprep.com/api/v3/stock_market/actives/';

export const getMostMovingStocks = async (): Promise<void> => {
  isLoading.set(true);
  try {
    const response = await fetch(`${API_URL}?apikey=${API_KEY}`);
    if (!response.ok) {
      const errorResponse = await response.json();
      const errorMessage = `HTTP Error: ${response.status} . ${errorResponse["Error Message"]}` || `HTTP Error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }
    let data: Stock[] = await response.json();
    data = data.map(stock => ({ ...stock, id: uuidv4() }));
    mostMovingStocks.set(data);
    stockError.set(null);
  } catch (error) {
    console.error(error);
    stockError.set(error instanceof Error ? error.message : "An unknown error occurred");
  } finally {
    isLoading.set(false);
  }
};

getMostMovingStocks();

