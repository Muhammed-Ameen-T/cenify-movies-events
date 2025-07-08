import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter as FilterIcon, RotateCcw } from 'lucide-react';
import { FilterConfig, Filter as FilterType } from '../../../types/adminTable/filter';
import FilterDropdown from './FilterDropdown';
import FilterSearch from './FilterSearch';

const Filter: React.FC<FilterConfig> = ({
  filters,
  onReset,
  resetLabel = 'Reset Filters',
  showActiveCount = true,
  expandable = false,
  expandedContent,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    return filters.reduce((count, filter) => {
      switch (filter.type) {
        case 'search':
          return count + (filter.value ? 1 : 0);
        case 'select':
        case 'dateSort':
          return count + (filter.value !== null && filter.value !== undefined && filter.value !== '' ? 1 : 0);
        case 'multiSelect':
        case 'checkbox':
          return count + (Array.isArray(filter.value) && filter.value.length > 0 ? 1 : 0);
        default:
          return count;
      }
    }, 0);
  }, [filters]);

  const renderFilter = (filter: FilterType) => {
    switch (filter.type) {
      case 'search':
        return (
          <FilterSearch
            key={filter.key}
            value={filter.value}
            onChange={filter.onChange}
            placeholder={filter.placeholder}
            className={filter.className}
          />
        );
      
      case 'select':
        return (
          <FilterDropdown
            key={filter.key}
            label={filter.label}
            icon={filter.icon}
            value={filter.value}
            options={filter.options}
            onChange={filter.onChange}
            className={filter.className}
          />
        );
      
      case 'multiSelect':
      case 'checkbox':
        return (
          <FilterDropdown
            key={filter.key}
            label={filter.label}
            icon={filter.icon}
            value={filter.value}
            options={filter.options}
            onChange={filter.onChange}
            multiple={true}
            className={filter.className}
          />
        );
      
      case 'dateSort':
        return (
          <FilterDropdown
            key={filter.key}
            label={filter.label}
            icon={filter.icon}
            value={filter.value}
            options={filter.options}
            onChange={filter.onChange}
            className={filter.className}
          />
        );
      
      case 'custom':
        return <div key={filter.key} className={filter.className}>{filter.component}</div>;
      
      default:
        return null;
    }
  };

  // Separate search filters from others
  const searchFilters = filters.filter(f => f.type === 'search');
  const otherFilters = filters.filter(f => f.type !== 'search');

  return (
    <div className={`bg-gray-800 rounded-xl shadow-lg ${className}`}>
      {/* Search filters (shown at top) */}
      {searchFilters.length > 0 && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex flex-wrap gap-4">
            {searchFilters.map(renderFilter)}
          </div>
        </div>
      )}

      {/* Other filters */}
      <div className="flex flex-wrap items-center p-2">
        {expandable && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center p-3 rounded-lg mr-2 transition-all ${
              isExpanded ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FilterIcon className="w-5 h-5 mr-2" />
            <span>Filters</span>
            {showActiveCount && activeFilterCount > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        {otherFilters.map(renderFilter)}

        <button
          onClick={onReset}
          className={`flex items-center p-3 rounded-lg ml-auto ${
            activeFilterCount > 0 ? 'text-orange-500' : 'text-gray-500'
          }`}
          disabled={activeFilterCount === 0}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          {resetLabel}
        </button>
      </div>

      {/* Expandable content */}
      {expandable && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gray-700"
            >
              <div className="p-4">
                {expandedContent || (
                  <div className="text-gray-400 text-sm">No additional filters available.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Filter;