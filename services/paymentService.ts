import { ApiResponse } from '@/types/general';

const API_BASE_URL = '/api/payments';

export const paymentService = {
  /**
   * Create Stripe Checkout Session for ad payment
   */
  async payForAd(adId: string): Promise<{ url: string; sessionId: string }> {
    const response = await fetch(`${API_BASE_URL}/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ adId, isRelist: false }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const data: ApiResponse<{ url: string; sessionId: string; paymentId: string }> = await response.json();
    
    if (!data.data?.url) {
      throw new Error('No checkout URL received');
    }

    return {
      url: data.data.url,
      sessionId: data.data.sessionId,
    };
  },

  /**
   * Create Stripe Checkout Session for relisting an ad
   */
  async relistAd(adId: string): Promise<{ url: string; sessionId: string }> {
    const response = await fetch(`${API_BASE_URL}/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ adId, isRelist: true }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const data: ApiResponse<{ url: string; sessionId: string; paymentId: string }> = await response.json();
    
    if (!data.data?.url) {
      throw new Error('No checkout URL received');
    }

    return {
      url: data.data.url,
      sessionId: data.data.sessionId,
    };
  },

  async getPayments(adId?: string): Promise<any[]> {
    const url = adId
      ? `${API_BASE_URL}?adId=${adId}`
      : API_BASE_URL;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }
    const data: ApiResponse<any[]> = await response.json();
    return data.data || [];
  },
};

