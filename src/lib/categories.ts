import type { Category } from '@/types';

// Maps Plaid personal finance categories → our simple 8 categories
const CATEGORY_MAP: Record<string, Category> = {
  // Rent / Housing
  RENT_AND_UTILITIES_RENT: 'Rent',
  RENT_AND_UTILITIES_GAS_AND_ELECTRICITY: 'Utilities',
  RENT_AND_UTILITIES_WATER: 'Utilities',
  RENT_AND_UTILITIES_INTERNET_AND_CABLE: 'Utilities',
  RENT_AND_UTILITIES_SEWAGE_AND_WASTE: 'Utilities',
  RENT_AND_UTILITIES_TELEPHONE: 'Utilities',
  HOME_IMPROVEMENT: 'Other',

  // Food
  FOOD_AND_DRINK_GROCERIES: 'Groceries',
  FOOD_AND_DRINK_RESTAURANT: 'Dining',
  FOOD_AND_DRINK_FAST_FOOD: 'Dining',
  FOOD_AND_DRINK_COFFEE: 'Dining',
  FOOD_AND_DRINK_ALCOHOL_AND_BAR: 'Dining',

  // Transportation
  TRANSPORTATION_GAS_STATION: 'Gas',
  TRANSPORTATION_PARKING: 'Gas',
  TRANSPORTATION_TAXI: 'Gas',
  TRANSPORTATION_PUBLIC_TRANSIT: 'Gas',
  TRANSPORTATION_CAR_SERVICE: 'Gas',

  // Shopping
  GENERAL_MERCHANDISE: 'Shopping',
  GENERAL_MERCHANDISE_ONLINE_MARKETPLACES: 'Shopping',
  GENERAL_MERCHANDISE_DEPARTMENT_STORES: 'Shopping',
  CLOTHING_AND_ACCESSORIES: 'Shopping',
  SPORTING_GOODS: 'Shopping',

  // Entertainment / Subscriptions
  ENTERTAINMENT: 'Subscriptions',
  ENTERTAINMENT_STREAMING_SERVICES: 'Subscriptions',
  ENTERTAINMENT_MUSIC_AND_AUDIO: 'Subscriptions',
  ENTERTAINMENT_TV_AND_MOVIES: 'Subscriptions',
  PERSONAL_CARE: 'Shopping',
  MEDICAL: 'Other',
  TRAVEL: 'Other',
};

export function mapPlaidCategory(
  personalFinanceCategoryPrimary?: string,
  personalFinanceCategoryDetailed?: string
): Category {
  // Try detailed first
  if (personalFinanceCategoryDetailed) {
    const key = personalFinanceCategoryDetailed.toUpperCase().replace(/ /g, '_');
    if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  }

  // Fall back to primary
  if (personalFinanceCategoryPrimary) {
    const key = personalFinanceCategoryPrimary.toUpperCase().replace(/ /g, '_');
    // Rough match on primary
    if (key.includes('FOOD')) return 'Groceries';
    if (key.includes('TRANSPORT')) return 'Gas';
    if (key.includes('RENT')) return 'Rent';
    if (key.includes('ENTERTAINMENT')) return 'Subscriptions';
    if (key.includes('MERCHANDISE') || key.includes('SHOP')) return 'Shopping';
  }

  return 'Other';
}

export const CATEGORY_COLORS: Record<Category, string> = {
  Rent: '#6366f1',
  Utilities: '#06b6d4',
  Groceries: '#10b981',
  Dining: '#f59e0b',
  Gas: '#ef4444',
  Subscriptions: '#8b5cf6',
  Shopping: '#ec4899',
  Other: '#94a3b8',
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  Rent: '🏠',
  Utilities: '💡',
  Groceries: '🛒',
  Dining: '🍽️',
  Gas: '⛽',
  Subscriptions: '📺',
  Shopping: '🛍️',
  Other: '📦',
};
