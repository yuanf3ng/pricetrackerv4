import { Product } from '../types';

const STORAGE_KEY = 'price_tracker_products';

export const storage = {
  getProducts: (): Product[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  },

  saveProducts: (products: Product[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Error saving products:', error);
    }
  }
};