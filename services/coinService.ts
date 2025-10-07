/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const STORAGE_KEY = 'fitify_coins';
const INITIAL_COINS = 10;

export interface CoinData {
  coins: number;
  lastUpdated: number;
}

class CoinService {
  private getData(): CoinData {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse coin data, resetting', e);
      }
    }
    return this.initialize();
  }

  private saveData(data: CoinData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  private initialize(): CoinData {
    const data: CoinData = {
      coins: INITIAL_COINS,
      lastUpdated: Date.now(),
    };
    this.saveData(data);
    return data;
  }

  getCoins(): number {
    return this.getData().coins;
  }

  hasCoins(): boolean {
    return this.getCoins() > 0;
  }

  deductCoin(): boolean {
    const data = this.getData();
    if (data.coins <= 0) {
      return false;
    }
    data.coins -= 1;
    data.lastUpdated = Date.now();
    this.saveData(data);
    return true;
  }

  addCoins(amount: number): void {
    const data = this.getData();
    data.coins += amount;
    data.lastUpdated = Date.now();
    this.saveData(data);
  }

  reset(): void {
    this.initialize();
  }
}

export const coinService = new CoinService();

