// Customer category options and mapping utilities

export const CUSTOMER_CATEGORIES = [
  'Land',
  'House',
  'Rental',
  'Commercial Land',
  'Apartment',
  'Plot',
  'Villa',
  'Office Space',
  'Shop',
  'Other'
] as const;

export type CustomerCategory = typeof CUSTOMER_CATEGORIES[number];

// Legacy fallback: map old "need" field values to categories
export function mapNeedToCategory(need: string | undefined): CustomerCategory | undefined {
  if (!need) return undefined;
  
  const needLower = need.toLowerCase();
  
  if (needLower.includes('land') && needLower.includes('commercial')) return 'Commercial Land';
  if (needLower.includes('land') || needLower.includes('plot')) return 'Land';
  if (needLower.includes('house') || needLower.includes('villa')) return 'House';
  if (needLower.includes('rent')) return 'Rental';
  if (needLower.includes('apartment') || needLower.includes('flat') || needLower.includes('bhk')) return 'Apartment';
  if (needLower.includes('office')) return 'Office Space';
  if (needLower.includes('shop')) return 'Shop';
  
  return 'Other';
}

// Map customer category to property category for matching
export function mapCustomerCategoryToPropertyType(category: CustomerCategory | undefined): string[] {
  if (!category) return [];
  
  switch (category) {
    case 'Land':
    case 'Plot':
      return ['Land', 'Plot', 'Agricultural Land'];
    case 'House':
    case 'Villa':
      return ['House', 'Villa', 'Bungalow'];
    case 'Commercial Land':
      return ['Commercial Land', 'Commercial Property'];
    case 'Apartment':
      return ['Apartment', 'Flat'];
    case 'Rental':
      return ['Rental', 'House', 'Apartment', 'Flat'];
    case 'Office Space':
      return ['Office Space', 'Commercial Property'];
    case 'Shop':
      return ['Shop', 'Commercial Property'];
    default:
      return [category];
  }
}

// Get display category (with fallback to legacy need field)
export function getDisplayCategory(record: any): string {
  if (record.customerCategory) return record.customerCategory;
  if (record.need) return mapNeedToCategory(record.need) || record.need;
  return 'N/A';
}
