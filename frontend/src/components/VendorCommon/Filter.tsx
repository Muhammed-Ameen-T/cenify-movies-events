// src/components/Common/AdvancedFilterWithHeader.tsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, X } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface FilterConfig {
  key: string;
  label: string;
  type: 'search' | 'select' | 'multiSelect' | 'text';
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  options?: { label: string; value: string | boolean | number }[];
  icon?: React.ReactNode;
}

interface AdvancedFilterWithHeaderProps {
  title: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    ariaLabel?: string;
  };
  filters: FilterConfig[];
  onReset?: () => void;
  activeFilterCount?: number;
  className?: string;
}

const AdvancedFilterWithHeader: React.FC<AdvancedFilterWithHeaderProps> = ({
  title,
  actionButton,
  filters,
  onReset,
  activeFilterCount = 0,
  className = '',
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const toggleFilter = useCallback(() => setIsFilterOpen((prev) => !prev), []);

  const filterVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: 'auto', opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <Card
      className={`mb-6 p-6 bg-gray-900/90 backdrop-blur-xl border border-gray-700/30 rounded-2xl shadow-xl ${className}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {actionButton && (
          <Button
            variant={actionButton.variant || 'primary'}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
            onClick={actionButton.onClick}
            aria-label={actionButton.ariaLabel || actionButton.label}
          >
            {actionButton.label}
          </Button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Filter className="mr-2 text-indigo-400" size={20} />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </h3>
        <div className="flex items-center gap-4">
          {onReset && (
            <Button
              variant="outline"
              className="text-gray-400 border-gray-600 hover:text-white hover:border-white text-sm"
              onClick={onReset}
              aria-label="Reset filters"
            >
              Reset
            </Button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleFilter}
            className="text-gray-400 hover:text-white"
            aria-label={isFilterOpen ? 'Collapse filters' : 'Expand filters'}
          >
            {isFilterOpen ? <X size={20} /> : <Filter size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Filter Inputs */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={filterVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {filters.map((filter) => (
              <div key={filter.key} className="relative">
                <label className="text-sm font-medium text-gray-300 mb-1 block">{filter.label}</label>
                {filter.type === 'search' && (
                  <div className="relative">
                    {filter.icon || <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />}
                    <input
                      type="text"
                      value={filter.value || ''}
                      onChange={(e) => filter.onChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-500"
                      placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                    />
                  </div>
                )}  
                {filter.type === 'text' && (
                  <input
                    type="text"
                    value={filter.value || ''}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="w-full pl-4 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-500"
                    placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}...`}
                  />
                )}
                {filter.type === 'select' && (
                  <select
                    value={filter.value || ''}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="w-full pl-4 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  >
                    <option value="">Select {filter.label}</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {filter.type === 'multiSelect' && (
                  <div className="flex flex-wrap gap-2">
                    {filter.options?.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => filter.onChange(
                          filter.value.includes(option.value)
                            ? filter.value.filter((v: string) => v !== option.value)
                            : [...filter.value, option.value]
                        )}
                        className={`px-3 py-1 rounded-full text-sm ${
                          filter.value.includes(option.value)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700'
                        } transition-all duration-200`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default AdvancedFilterWithHeader;