export interface Stock {
  id: number | string;
  symbol: string;
  name: string;
  change: number;
  price: number;
  changesPercentage: number;
}