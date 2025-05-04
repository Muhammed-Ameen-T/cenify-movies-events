import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchInput from '../common/SearchInput';
import FilterDropdown from '../common/FilterDropdown';
import Button from '../ui/Button';

interface ShowFilterProps {
  onFilterChange: (filters: any) => void;
}

const ShowFilter: React.FC<ShowFilterProps> = ({ onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: [] as string[],
    theater: [] as string[],
    tags: [] as string[],
    priceRange: { min: 0, max: 500 },
    dateRange: { start: '', end: '' }
  });
  
  const statusOptions = [
    { label: 'Ongoing', value: 'ongoing' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];
  
  const theaterOptions = [
    { label: 'Grand Theater', value: '1' },
    { label: 'Cinema Palace', value: '2' },
    { label: 'Royal Stage', value: '3' },
    { label: 'Metro Screening Hall', value: '4' }
  ];
  
  const tagOptions = [
    { label: 'Musical', value: 'Musical' },
    { label: 'Classic', value: 'Classic' },
    { label: 'Broadway', value: 'Broadway' },
    { label: 'Adaptation', value: 'Adaptation' },
    { label: 'Sci-Fi', value: 'Sci-Fi' },
    { label: 'Immersive', value: 'Immersive' },
    { label: 'Shakespeare', value: 'Shakespeare' },
    { label: 'Drama', value: 'Drama' },
    { label: 'Contemporary', value: 'Contemporary' },
    { label: 'Original', value: 'Original' },
    { label: 'Family', value: 'Family' }
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
  
  const handlePriceChange = (minOrMax: 'min' | 'max', value: number) => {
    const newRange = { ...filters.priceRange, [minOrMax]: value };
    const newFilters = { ...filters, priceRange: newRange };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const handleDateChange = (startOrEnd: 'start' | 'end', value: string) => {
    const newRange = { ...filters.dateRange, [startOrEnd]: value };
    const newFilters = { ...filters, dateRange: newRange };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const resetFilters = () => {
    const resetFilters = {
      search: '',
      status: [],
      theater: [],
      tags: [],
      priceRange: { min: 0, max: 500 },
      dateRange: { start: '', end: '' }
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };
  
  const hasActiveFilters = () => {
    return filters.status.length > 0 || 
           filters.theater.length > 0 || 
           filters.tags.length > 0 || 
           filters.priceRange.min > 0 || 
           filters.priceRange.max < 500 ||
           filters.dateRange.start !== '' ||
           filters.dateRange.end !== '';
  };
  
  return (
    <div className="bg-[#18181f] rounded-lg border border-[#333333] p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <SearchInput 
            placeholder="Search shows by title, theater, or description..." 
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
              {filters.status.length + filters.theater.length + filters.tags.length + 
               (filters.priceRange.min > 0 || filters.priceRange.max < 500 ? 1 : 0) +
               (filters.dateRange.start || filters.dateRange.end ? 1 : 0)}
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
                  label="Theater"
                  options={theaterOptions}
                  selectedValues={filters.theater}
                  onChange={(values) => handleFilterChange('theater', values)}
                />
              </div>
              
              <div>
                <FilterDropdown
                  label="Tags"
                  options={tagOptions}
                  selectedValues={filters.tags}
                  onChange={(values) => handleFilterChange('tags', values)}
                />
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-2">Price Range ($)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={filters.priceRange.max}
                    value={filters.priceRange.min}
                    onChange={(e) => handlePriceChange('min', parseInt(e.target.value) || 0)}
                    className="w-full bg-[#121218] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0066F5]"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    min={filters.priceRange.min}
                    max="500"
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceChange('max', parseInt(e.target.value) || 500)}
                    className="w-full bg-[#121218] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0066F5]"
                    placeholder="Max"
                  />
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-2">Date Range</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    className="w-full bg-[#121218] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0066F5]"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    className="w-full bg-[#121218] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0066F5]"
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

export default ShowFilter;