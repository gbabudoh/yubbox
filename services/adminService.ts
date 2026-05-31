import { ApiResponse } from '@/types/general';

const API_BASE_URL = '/api/admin';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
}

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  type: 'service' | 'physical';
  description?: string;
  isActive: boolean;
  order: number;
}

export const adminService = {
  // Categories
  async getCategories(includeInactive = false): Promise<Category[]> {
    const response = await fetch(
      `${API_BASE_URL}/categories${includeInactive ? '?includeInactive=true' : ''}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data: ApiResponse<Category[]> = await response.json();
    return data.data || [];
  },

  async createCategory(category: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create category');
    }
    const data: ApiResponse<Category> = await response.json();
    return data.data!;
  },

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update category');
    }
    const data: ApiResponse<Category> = await response.json();
    return data.data!;
  },

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete category');
    }
  },

  // Industries
  async getIndustries(includeInactive = false): Promise<Industry[]> {
    const response = await fetch(
      `${API_BASE_URL}/industries${includeInactive ? '?includeInactive=true' : ''}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch industries');
    }
    const data: ApiResponse<Industry[]> = await response.json();
    return data.data || [];
  },

  async createIndustry(industry: Partial<Industry>): Promise<Industry> {
    const response = await fetch(`${API_BASE_URL}/industries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(industry),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create industry');
    }
    const data: ApiResponse<Industry> = await response.json();
    return data.data!;
  },

  async updateIndustry(id: string, industry: Partial<Industry>): Promise<Industry> {
    const response = await fetch(`${API_BASE_URL}/industries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(industry),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update industry');
    }
    const data: ApiResponse<Industry> = await response.json();
    return data.data!;
  },

  async deleteIndustry(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/industries/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete industry');
    }
  },

  // Product Types
  async getProductTypes(includeInactive = false, type?: 'service' | 'physical'): Promise<ProductType[]> {
    const params = new URLSearchParams();
    if (includeInactive) params.append('includeInactive', 'true');
    if (type) params.append('type', type);
    const query = params.toString();
    
    const response = await fetch(
      `${API_BASE_URL}/product-types${query ? `?${query}` : ''}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch product types');
    }
    const data: ApiResponse<ProductType[]> = await response.json();
    return data.data || [];
  },

  async createProductType(productType: Partial<ProductType>): Promise<ProductType> {
    const response = await fetch(`${API_BASE_URL}/product-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productType),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create product type');
    }
    const data: ApiResponse<ProductType> = await response.json();
    return data.data!;
  },

  async updateProductType(id: string, productType: Partial<ProductType>): Promise<ProductType> {
    const response = await fetch(`${API_BASE_URL}/product-types/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productType),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update product type');
    }
    const data: ApiResponse<ProductType> = await response.json();
    return data.data!;
  },

  async deleteProductType(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/product-types/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete product type');
    }
  },
};

