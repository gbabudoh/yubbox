/**
 * Shared Stripe constants and utility functions
 * This file is safe to import in both client and server components.
 */

export const AD_PRICE = 1.0; // $1.00 per listing
export const TOP_LENS_PRICE = 5.0; // Additional $5.00 for Top Lens
export const STORIES_PRICE = 3.0; // Additional $3.00 for Stories
export const AD_DURATION_DAYS = 14;
export const CURRENCY = 'usd';

/**
 * Convert dollars to cents for Stripe
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}
