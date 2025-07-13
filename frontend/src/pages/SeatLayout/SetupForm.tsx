import React, { useState } from 'react';
import { useTheater } from './TheaterContext';
import { SeatPrice } from './theater.types';
import { Theater, Armchair, Sofa } from 'lucide-react';

interface SetupFormProps {
  onComplete: () => void;
}

const THEATER_TEMPLATES = [
  {
    name: 'Small Theater',
    description: '5 rows × 8 columns (40 seats)',
    icon: Theater,
    rows: 5,
    columns: 8,
    seats: Array.from({ length: 40 }, (_, i) => ({
      type: 'regular' as const,
      row: Math.floor(i / 8),
      column: i % 8
    }))
  },
  {
    name: 'Medium Theater',
    description: '8 rows × 12 columns (96 seats)',
    icon: Armchair,
    rows: 8,
    columns: 12,
    seats: Array.from({ length: 96 }, (_, i) => ({
      type: (Math.floor(i / 12) < 2 ? 'premium' : 'regular') as const,
      row: Math.floor(i / 12),
      column: i % 12
    }))
  },
  {
    name: 'Large Theater',
    description: '12 rows × 16 columns (192 seats)',
    icon: Sofa,
    rows: 12,
    columns: 16,
    seats: Array.from({ length: 192 }, (_, i) => {
      const row = Math.floor(i / 16);
      return {
        type: (row < 2 ? 'vip' : row < 4 ? 'premium' : 'regular') as const,
        row,
        column: i % 16
      };
    })
  }
];

const SetupForm: React.FC<SetupFormProps> = ({ onComplete }) => {
  const { createNewLayout, createFromTemplate } = useTheater();
  const [name, setName] = useState('');
  const [prices, setPrices] = useState<SeatPrice>({
    regular: 200,
    premium: 350,
    vip: 500
  });
  const [errors, setErrors] = useState<{
    name?: string;
    prices?: {
      regular?: string;
      premium?: string;
      vip?: string;
    };
  }>({});

  const handlePriceChange = (type: keyof SeatPrice, value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    setPrices(prev => ({
      ...prev,
      [type]: numValue
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: typeof errors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Layout name is required';
    }
    
    if (prices.regular <= 0) {
      newErrors.prices = { ...newErrors.prices, regular: 'Regular seat price must be greater than 0' };
    }
    
    if (prices.premium <= 0) {
      newErrors.prices = { ...newErrors.prices, premium: 'Premium seat price must be greater than 0' };
    }
    
    if (prices.vip <= 0) {
      newErrors.prices = { ...newErrors.prices, vip: 'VIP seat price must be greater than 0' };
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    createNewLayout(name, prices);
    onComplete();
  };

  const handleTemplateSelect = (template: typeof THEATER_TEMPLATES[0]) => {
    if (!name.trim()) {
      setErrors({ name: 'Layout name is required' });
      return; 
    }
    
    createFromTemplate(name, prices, template);
    onComplete();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1E1E2D] text-gray-100 p-4">
      <div className="w-full max-w-4xl p-8 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">Create New Theater Layout</h2>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-6">
            <label htmlFor="name" className="block mb-2 text-sm font-medium">
              Layout Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              placeholder="Main Theater"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Seat Prices (₹)</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="regularPrice" className="block mb-2 text-sm font-medium">
                  Regular
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">₹</span>
                  <input
                    type="number"
                    id="regularPrice"
                    value={prices.regular}
                    onChange={(e) => handlePriceChange('regular', e.target.value)}
                    className="w-full pl-8 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    min="1"
                    step="1"
                  />
                </div>
                {errors.prices?.regular && (
                  <p className="mt-1 text-sm text-red-400">{errors.prices.regular}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="premiumPrice" className="block mb-2 text-sm font-medium">
                  Premium
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">₹</span>
                  <input
                    type="number"
                    id="premiumPrice"
                    value={prices.premium}
                    onChange={(e) => handlePriceChange('premium', e.target.value)}
                    className="w-full pl-8 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    min="1"
                    step="1"
                  />
                </div>
                {errors.prices?.premium && (
                  <p className="mt-1 text-sm text-red-400">{errors.prices.premium}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="vipPrice" className="block mb-2 text-sm font-medium">
                  VIP
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">₹</span>
                  <input
                    type="number"
                    id="vipPrice"
                    value={prices.vip}
                    onChange={(e) => handlePriceChange('vip', e.target.value)}
                    className="w-full pl-8 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    min="1"
                    step="1"
                  />
                </div>
                {errors.prices?.vip && (
                  <p className="mt-1 text-sm text-red-400">{errors.prices.vip}</p>
                )}
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]"
          >
            Create Empty Layout
          </button>
        </form>

        <div className="border-t border-gray-700 pt-8">
          <h3 className="text-lg font-medium mb-4 text-center">Or Start with a Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {THEATER_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.name}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Icon className="w-8 h-8 mb-2 mx-auto text-blue-400" />
                  <h4 className="text-lg font-medium mb-1">{template.name}</h4>
                  <p className="text-sm text-gray-400">{template.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupForm;