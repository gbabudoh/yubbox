import { IAd } from '@/types/models';
import { ApiResponse } from '@/types/general';

const API_BASE_URL = '/api/ads';

export const adService = {
  async getAllAds(countryCode?: string): Promise<IAd[]> {
    const url = countryCode 
      ? `${API_BASE_URL}?country=${countryCode}&isActive=true`
      : `${API_BASE_URL}?isActive=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch ads');
    }
    const data: ApiResponse<IAd[]> = await response.json();
    return data.data || [];
  },

  async getAdById(adId: string): Promise<IAd> {
    const response = await fetch(`${API_BASE_URL}/${adId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch ad');
    }
    const data: ApiResponse<IAd> = await response.json();
    if (!data.data) {
      throw new Error('Ad not found');
    }
    return data.data;
  },

  async getUserAds(userId: string): Promise<IAd[]> {
    const response = await fetch(`${API_BASE_URL}?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user ads');
    }
    const data: ApiResponse<IAd[]> = await response.json();
    return data.data || [];
  },

  async createAd(formData: FormData): Promise<IAd> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create ad');
    }
    const data: ApiResponse<IAd> = await response.json();
    if (!data.data) {
      throw new Error('Failed to create ad');
    }
    return data.data;
  },

  async updateAd(adId: string, formData: FormData): Promise<IAd> {
    const response = await fetch(`${API_BASE_URL}/${adId}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update ad');
    }
    const data: ApiResponse<IAd> = await response.json();
    if (!data.data) {
      throw new Error('Failed to update ad');
    }
    return data.data;
  },

  async deleteAd(adId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${adId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete ad');
    }
  },

  async voteAd(adId: string): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/${adId}/vote`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to vote');
    }
    const data = await response.json();
    return data.data.yubboxCount;
  },
};

