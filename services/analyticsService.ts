import { ApiResponse } from '@/types/general';

const API_BASE_URL = '/api/analytics';

export const analyticsService = {
  async trackEvent(
    adId: string,
    eventType: 'view' | 'click',
    metadata?: {
      country?: string;
      ipAddress?: string;
      userAgent?: string;
      referrer?: string;
      // Behavioural signals (Yubbox Brain)
      sessionId?: string;
      scrollDepth?: number;
      timeOnAd?: number;
      clickElement?: string;
      deviceType?: string;
    }
  ): Promise<void> {
    try {
      await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, eventType, ...metadata }),
      });
    } catch (error) {
      console.error('Failed to track analytics:', error);
    }
  },

  async getAnalytics(adId: string, filters?: {
    eventType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams({ adId });
    if (filters?.eventType) params.append('eventType', filters.eventType);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },
};

