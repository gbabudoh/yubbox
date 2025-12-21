import { ApiResponse } from '@/types/general';

/**
 * Public service for fetching active categories, industries, and product types
 * Used in ad forms and public pages
 */
export interface PublicCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface PublicIndustry {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface PublicProductType {
  _id: string;
  name: string;
  slug: string;
  type: 'service' | 'physical';
  description?: string;
}

export const publicService = {
  async getCategories(): Promise<PublicCategory[]> {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data: ApiResponse<PublicCategory[]> = await response.json();
    return data.data || [];
  },

  async getIndustries(): Promise<PublicIndustry[]> {
    const response = await fetch('/api/industries');
    if (!response.ok) {
      throw new Error('Failed to fetch industries');
    }
    const data: ApiResponse<PublicIndustry[]> = await response.json();
    return data.data || [];
  },

  async getProductTypes(type?: 'service' | 'physical'): Promise<PublicProductType[]> {
    const url = type ? `/api/product-types?type=${type}` : '/api/product-types';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch product types');
    }
    const data: ApiResponse<PublicProductType[]> = await response.json();
    return data.data || [];
  },
};

