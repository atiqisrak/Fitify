/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const API_URL = import.meta.env.VITE_ENGINE_URL;

export interface CoinTransaction {
  coins_amount: number;
  transaction_type: 'earned' | 'spent' | 'recharged_money' | 'recharged_invitation';
  description: string;
}

class CoinService {
  async getUserStats(userId: number) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  async addCoinTransaction(userId: number, transaction: CoinTransaction) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add coin transaction');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding coin transaction:', error);
      throw error;
    }
  }

  async getCoinTransactions(userId: number) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/transactions`);
      if (!response.ok) {
        throw new Error('Failed to fetch coin transactions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching coin transactions:', error);
      return [];
    }
  }

  async deductCoin(userId: number, description: string = 'Coin used'): Promise<boolean> {
    try {
      await this.addCoinTransaction(userId, {
        coins_amount: 1,
        transaction_type: 'spent',
        description,
      });
      return true;
    } catch (error) {
      console.error('Error deducting coin:', error);
      return false;
    }
  }

  async addCoins(userId: number, amount: number, type: 'earned' | 'recharged_money' | 'recharged_invitation', description: string): Promise<boolean> {
    try {
      await this.addCoinTransaction(userId, {
        coins_amount: amount,
        transaction_type: type,
        description,
      });
      return true;
    } catch (error) {
      console.error('Error adding coins:', error);
      return false;
    }
  }
}

export const coinService = new CoinService();

