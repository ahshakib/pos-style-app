import { User } from './auth';
import api from './client';
import { Product } from './products';

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Pick<Product, 'id' | 'name' | 'sku'>;
}

export interface Sale {
  id: string;
  userId: string;
  total: number;
  createdAt: string;
  items: SaleItem[];
  user: Pick<User, 'id' | 'email' | 'name'>;
}

export interface CreateSaleItemData {
  productId: string;
  quantity: number;
}

export interface CreateSaleData {
  items: CreateSaleItemData[];
}

export const salesApi = {
  getAll: async (): Promise<Sale[]> => {
    const response = await api.get<Sale[]>('/sales');
    return response.data;
  },

  getById: async (id: string): Promise<Sale> => {
    const response = await api.get<Sale>(`/sales/${id}`);
    return response.data;
  },

  create: async (data: CreateSaleData): Promise<Sale> => {
    const response = await api.post<Sale>('/sales', data);
    return response.data;
  },
};
