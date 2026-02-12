import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CustomerForm from '../forms/CustomerForm';
import CommercialLandForm from '../forms/CommercialLandForm';
import HouseForm from '../forms/HouseForm';
import OtherCategoryForm from '../forms/OtherCategoryForm';

const CATEGORIES = [
  { value: 'Customer', label: 'Customer (Buyer)' },
  { value: 'Commercial Land', label: 'Commercial Land' },
  { value: 'House', label: 'House' },
  { value: 'Agriculture Land', label: 'Agriculture Land' },
  { value: 'Flat', label: 'Flat' },
  { value: 'Shops', label: 'Shops' },
  { value: 'Rental', label: 'Rental' },
  { value: 'Custom', label: 'Custom' }
];

export default function NewEntryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const renderForm = () => {
    switch (selectedCategory) {
      case 'Customer':
        return <CustomerForm onSuccess={() => navigate({ to: '/' })} />;
      case 'Commercial Land':
        return <CommercialLandForm onSuccess={() => navigate({ to: '/' })} />;
      case 'House':
        return <HouseForm onSuccess={() => navigate({ to: '/' })} />;
      case 'Agriculture Land':
      case 'Flat':
      case 'Shops':
      case 'Rental':
      case 'Custom':
        return <OtherCategoryForm category={selectedCategory} onSuccess={() => navigate({ to: '/' })} />;
      default:
        return null;
    }
  };

  if (selectedCategory) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => setSelectedCategory(null)} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Button>
        {renderForm()}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <h2 className="text-3xl font-bold">New Entry</h2>
        <p className="text-muted-foreground">Select a category to create a new record</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {CATEGORIES.map(category => (
          <Card 
            key={category.value}
            className="cursor-pointer hover:border-amber-500 hover:shadow-md transition-all"
            onClick={() => setSelectedCategory(category.value)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{category.label}</CardTitle>
              <CardDescription>
                {category.value === 'Customer' && 'Add buyer or customer information'}
                {category.value === 'Commercial Land' && 'Add commercial property details'}
                {category.value === 'House' && 'Add residential house details'}
                {category.value === 'Agriculture Land' && 'Add agricultural land details'}
                {category.value === 'Flat' && 'Add flat or apartment details'}
                {category.value === 'Shops' && 'Add shop or retail space details'}
                {category.value === 'Rental' && 'Add rental property details'}
                {category.value === 'Custom' && 'Add custom property type'}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
