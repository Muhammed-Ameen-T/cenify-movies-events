import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchInput from '../common/SearchInput';
import FilterDropdown from '../common/FilterDown';
import Button from '../ui/Button';

interface TheaterFilterProps {
  onFilterChange: (filters: any) => void;
}

const TheaterFilter: React.FC<TheaterFilterProps> = ({ onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: [] as string[],
    amenities: [] as string[],
    capacityRange: { min: 0, max: 1000 }
  });
  
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Inactive', value: 'inactive' }
  ];
  
  const amenityOptions = [
    { label: 'Parking', value: 'Parking' },
    { label: 'Food Court', value: 'Food Court' },
    { label: 'VIP Lounge', value: 'VIP Lounge' },
    { label: 'Accessibility', value: 'Accessibility' },
    { label: 'IMAX', value: 'IMAX' },
    { label: 'Dolby Atmos', value: 'Dolby Atmos' },
    { label: 'Recliner Seats', value: 'Recliner Seats' },
    { label: 'Arcade', value: 'Arcade' },
    { label: 'Bar', value: 'Bar' },
    { label: 'Restaurant', value: 'Restaurant' }
  ];
  
  const handleSearch = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const handleCapacityChange = (minOrMax: 'min' | 'max', value: number) => {
    const newRange = { ...filters.capacityRange, [minOrMax]: value };
    const newFilters = { ...filters, capacityRange: newRange };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const resetFilters = () => {
    const resetFilters = {
      search: '',
      status: [],
      amenities: [],
      capacityRange: { min: 0, max: 1000 }
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };
  
  const hasActiveFilters = () => {
    return filters.status.length > 0 || 
           filters.amenities.length > 0 || 
           filters.capacityRange.min > 0 || 
           filters.capacityRange.max < 1000;
  };
  
  return (
    <div className="bg-[#18181f] rounded-lg border border-[#333333] p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <SearchInput 
            placeholder="Search theaters by name or location..." 
            onSearch={handleSearch}
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
            ${showFilters ? 'border-[#0066F5] text-[#0066F5] bg-[#0066F5]/10' : 'border-[#333333] text-gray-400 bg-[#121218]'}
          `}
        >
          <Filter size={18} />
          <span>Filters</span>
          {hasActiveFilters() && (
            <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-[#0066F5] rounded-full">
              {filters.status.length + filters.amenities.length + (filters.capacityRange.min > 0 || filters.capacityRange.max < 1000 ? 1 : 0)}
            </span>
          )}
        </button>
      </div>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#333333]">
              <div>
                <FilterDropdown
                  label="Status"
                  options={statusOptions}
                  selectedValues={filters.status}
                  onChange={(values) => handleFilterChange('status', values)}
                />
              </div>
              
              <div>
                <FilterDropdown
                  label="Amenities"
                  options={amenityOptions}
                  selectedValues={filters.amenities}
                  onChange={(values) => handleFilterChange('amenities', values)}
                />
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-2">Capacity Range</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={filters.capacityRange.max}
                    value={filters.capacityRange.min}
                    onChange={(e) => handleCapacityChange('min', parseInt(e.target.value) || 0)}
                    className="w-full bg-[#121218] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0066F5]"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    min={filters.capacityRange.min}
                    max="1000"
                    value={filters.capacityRange.max}
                    onChange={(e) => handleCapacityChange('max', parseInt(e.target.value) || 1000)}
                    className="w-full bg-[#121218] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0066F5]"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 pt-4 border-t border-[#333333]">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                icon={<X size={16} />}
              >
                Reset Filters
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TheaterFilter;