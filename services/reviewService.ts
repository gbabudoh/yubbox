import { IReview } from '@/types/models';
import { ApiResponse } from '@/types/general';

const API_BASE_URL = '/api/reviews';

export const reviewService = {
  async getReviewsByAdId(adId: string): Promise<IReview[]> {
    const response = await fetch(`${API_BASE_URL}?adId=${adId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    const data: ApiResponse<IReview[]> = await response.json();
    return data.data || [];
  },

  async createReview(
    adId: string,
    rating: number,
    comment: string,
    userName?: string
  ): Promise<IReview> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adId,
        rating,
        comment,
        userName,
      }),
    });

    if (!response.ok) {
      const error: ApiResponse = await response.json();
      throw new Error(error.error || 'Failed to create review');
    }

    const data: ApiResponse<IReview> = await response.json();
    if (!data.data) {
      throw new Error('Failed to create review');
    }
    return data.data;
  },
};

