import Stripe from 'stripe';
import { 
  AD_PRICE, 
  TOP_LENS_PRICE, 
  STORIES_PRICE, 
  AD_DURATION_DAYS, 
  CURRENCY, 
  dollarsToCents, 
  centsToDollars 
} from './stripe-shared';

// Re-export constants for server-side convenience
export { 
  AD_PRICE, 
  TOP_LENS_PRICE, 
  STORIES_PRICE, 
  AD_DURATION_DAYS, 
  CURRENCY, 
  dollarsToCents, 
  centsToDollars 
};

// Initialize Stripe lazily to avoid errors in client-side bundling or missing keys during build
let stripeInstance: Stripe | null = null;

export const stripe = (() => {
  if (typeof window !== 'undefined') {
    // Return a proxy or just null if on client, but we should never call stripe on client
    return null as unknown as Stripe;
  }

  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('STRIPE_SECRET_KEY is not set in environment variables');
      // We don't throw here to avoid crashing the build or irrelevant modules, 
      // but it will fail when used.
      return null as unknown as Stripe;
    }

    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    });
  }

  return stripeInstance;
})();

