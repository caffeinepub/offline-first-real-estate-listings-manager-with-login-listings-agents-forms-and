// Frontend-only matching engine for buyer-property pairs

export interface MatchCandidate {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerContact: string;
  buyerCategory: string;
  buyerBudget: string;
  propertyId: string;
  propertyTitle: string;
  propertyOwner: string;
  propertyPrice: string;
  propertyCategory: string;
  matchScore: number;
  matchReasons: string[];
}

// Parse budget/price strings to numbers for comparison
function parseAmount(value: string | undefined): number | null {
  if (!value) return null;
  
  const cleaned = value.toLowerCase().replace(/[^0-9.klm]/g, '');
  let num = parseFloat(cleaned);
  
  if (isNaN(num)) return null;
  
  // Handle lakhs/crores
  if (value.toLowerCase().includes('lakh')) num *= 100000;
  if (value.toLowerCase().includes('crore')) num *= 10000000;
  if (value.toLowerCase().includes('k')) num *= 1000;
  if (value.toLowerCase().includes('m')) num *= 1000000;
  
  return num;
}

// Categorize budget/price into ranges
function getPriceCategory(amount: number | null): string {
  if (!amount) return 'unknown';
  if (amount < 1000000) return 'under-10L';
  if (amount < 2500000) return '10L-25L';
  if (amount < 5000000) return '25L-50L';
  if (amount < 10000000) return '50L-1Cr';
  return 'above-1Cr';
}

// Check if location/address keywords match
function locationMatches(str1: string | undefined, str2: string | undefined): boolean {
  if (!str1 || !str2) return false;
  
  const normalize = (s: string) => s.toLowerCase().trim();
  const s1 = normalize(str1);
  const s2 = normalize(str2);
  
  // Extract significant words (3+ chars)
  const words1 = s1.split(/\s+/).filter(w => w.length >= 3);
  const words2 = s2.split(/\s+/).filter(w => w.length >= 3);
  
  // Check for any common words
  return words1.some(w1 => words2.some(w2 => w1.includes(w2) || w2.includes(w1)));
}

// Check if area/land size is compatible
function areaMatches(buyerArea: string | undefined, propertyArea: string | undefined): boolean {
  if (!buyerArea || !propertyArea) return false;
  
  const parseArea = (s: string): number | null => {
    const num = parseFloat(s.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? null : num;
  };
  
  const buyer = parseArea(buyerArea);
  const property = parseArea(propertyArea);
  
  if (!buyer || !property) return false;
  
  // Allow 20% variance
  return Math.abs(buyer - property) / buyer <= 0.2;
}

export function computeMatches(records: any[]): MatchCandidate[] {
  const buyers = records.filter(r => r.category === 'Customer');
  const properties = records.filter(r => r.category !== 'Customer' && r.status !== 'Sold');
  
  const matches: MatchCandidate[] = [];
  
  for (const buyer of buyers) {
    const buyerCategory = buyer.customerCategory || 'Other';
    const buyerBudget = parseAmount(buyer.budget);
    const buyerBudgetCategory = getPriceCategory(buyerBudget);
    
    for (const property of properties) {
      const matchReasons: string[] = [];
      let matchScore = 0;
      
      // 1. Category match (required)
      const categoryMatch = (() => {
        if (buyerCategory === 'Land' && ['Land', 'Plot', 'Agricultural Land'].includes(property.category)) return true;
        if (buyerCategory === 'House' && ['House', 'Villa', 'Bungalow'].includes(property.category)) return true;
        if (buyerCategory === 'Commercial Land' && ['Commercial Land', 'Commercial Property'].includes(property.category)) return true;
        if (buyerCategory === 'Apartment' && ['Apartment', 'Flat'].includes(property.category)) return true;
        if (buyerCategory === 'Rental' && ['Rental', 'House', 'Apartment', 'Flat'].includes(property.category)) return true;
        if (buyerCategory === property.category) return true;
        return false;
      })();
      
      if (!categoryMatch) continue;
      
      matchReasons.push('Category match');
      matchScore += 40;
      
      // 2. Price/budget match
      const propertyPrice = parseAmount(property.price);
      const propertyPriceCategory = getPriceCategory(propertyPrice);
      
      if (buyerBudgetCategory === propertyPriceCategory) {
        matchReasons.push('Price range match');
        matchScore += 30;
      } else if (buyerBudget && propertyPrice && Math.abs(buyerBudget - propertyPrice) / buyerBudget <= 0.3) {
        matchReasons.push('Price within 30%');
        matchScore += 20;
      }
      
      // 3. Location match
      const buyerLocation = buyer.address || '';
      const propertyLocation = property.address || property.location || '';
      
      if (locationMatches(buyerLocation, propertyLocation)) {
        matchReasons.push('Location match');
        matchScore += 20;
      }
      
      // 4. Area/size match
      const buyerArea = buyer.area || '';
      const propertyArea = property.landArea || property.totalLandArea || '';
      
      if (areaMatches(buyerArea, propertyArea)) {
        matchReasons.push('Area/size match');
        matchScore += 10;
      }
      
      // Only include matches with score >= 40 (at least category match)
      if (matchScore >= 40) {
        matches.push({
          id: `${buyer.id}-${property.id}`,
          buyerId: buyer.id,
          buyerName: buyer.fullName || buyer.name || 'Unknown',
          buyerContact: buyer.contact || 'N/A',
          buyerCategory,
          buyerBudget: buyer.budget || 'N/A',
          propertyId: property.id,
          propertyTitle: property.ownerName || property.title || 'Untitled',
          propertyOwner: property.ownerName || 'N/A',
          propertyPrice: property.price || 'N/A',
          propertyCategory: property.category,
          matchScore,
          matchReasons
        });
      }
    }
  }
  
  // Sort by match score descending
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
