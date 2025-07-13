import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Filter, X, ChevronDown, RefreshCcw, Search, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FilterHeaderProps, FilterConfig } from '../../types/VendorCommon';

const FilterHeader: React.FC<FilterHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackClick,
  actions = [],
  filters,
  onFilterChange,
  onReset,
  filterConfig,
  className,
  collapsible = true,
  activeFiltersCount = 0,
  showFilterSummary = true
}) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(!collapsible);

  const renderFilterInput = (config: FilterConfig) => {
    const { key, label, type, placeholder, options, icon: Icon, validation } = config;
    const value = filters[key] || '';

    const baseInputClasses = "w-full py-3 px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-500";

    switch (type) {
      case 'text':
        return (
          <div className="relative">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              {label}
              {validation?.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className="relative">
              {Icon && (
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              )}
              <input
                type="text"
                value={value}
                onChange={(e) => onFilterChange(key, e.target.value)}
                className={clsx(baseInputClasses, Icon && 'pl-10')}
                placeholder={placeholder}
                required={validation?.required}
                minLength={validation?.minLength}
                maxLength={validation?.maxLength}
                pattern={validation?.pattern?.source}
              />
            </div>
          </div>
        );

      case 'select':
        return (
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              {label}
              {validation?.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className="relative">
              <select
                value={value}
                onChange={(e) => onFilterChange(key, e.target.value)}
                className={clsx(baseInputClasses, "appearance-none cursor-pointer pr-10")}
                required={validation?.required}
              >
                <option value="">{placeholder || `Select ${label}`}</option>
                {options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} {option.count && `(${option.count})`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              {label}
              {validation?.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {options?.map((option) => (
                <motion.label 
                  key={option.value} 
                  className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-700/30 transition-colors"
                  whileHover={{ x: 2 }}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value);
                      onFilterChange(key, newValues);
                    }}
                    className="rounded border-gray-600 bg-gray-800/50 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition-colors"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {option.label} {option.count && `(${option.count})`}
                  </span>
                </motion.label>
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              {label}
              {validation?.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => onFilterChange(key, e.target.value)}
              className={baseInputClasses}
              required={validation?.required}
            />
          </div>
        );

      case 'number':
        return (
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              {label}
              {validation?.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => onFilterChange(key, Number(e.target.value))}
              className={baseInputClasses}
              placeholder={placeholder}
              required={validation?.required}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = activeFiltersCount > 0;
  const filterSummary = showFilterSummary ? Object.entries(filters).filter(([key, value]) => {
    if (['page', 'pageSize', 'sortBy', 'sortOrder'].includes(key)) return false;
    return value !== undefined && value !== null && value !== '' && 
           !(Array.isArray(value) && value.length === 0);
  }) : [];

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border backdrop-blur-xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border-gray-700/50 shadow-xl"
      >
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              leftIcon={<ArrowLeft size={16} />}
              className="shrink-0 hover:bg-gray-700/50"
            >
              Back
            </Button>
          )}
          
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {actions.length > 0 && (
          <div className="flex items-center gap-3">
            {actions.map((action) => (
              <Button
                key={action.key}
                variant={action.variant || 'primary'}
                onClick={action.onClick}
                disabled={action.disabled}
                loading={action.loading}
                leftIcon={action.icon && <action.icon size={18} />}
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Filters Section */}
      <Card className="overflow-hidden" gradient>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="text-indigo-400" size={20} />
                <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
              </div>
              {hasActiveFilters && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {activeFiltersCount} active
                </motion.div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReset}
                  leftIcon={<RefreshCcw size={16} />}
                  className="text-gray-400 hover:text-white"
                >
                  Reset
                </Button>
              )}
              {collapsible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                  rightIcon={
                    <motion.div
                      animate={{ rotate: isFiltersExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  }
                >
                  {isFiltersExpanded ? 'Collapse' : 'Expand'}
                </Button>
              )}
            </div>
          </div>

          {/* Filter Summary */}
          {hasActiveFilters && showFilterSummary && (
            <div className="mb-4 flex flex-wrap gap-2">
              {filterSummary.map(([key, value]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm"
                >
                  <span className="font-medium">{key}:</span>
                  <span>{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                  <button
                    onClick={() => onFilterChange(key, Array.isArray(filters[key]) ? [] : '')}
                    className="hover:bg-indigo-500/30 rounded-full p-1 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {isFiltersExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterConfig.map((config) => (
                    <motion.div
                      key={config.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {renderFilterInput(config)}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
};

export default FilterHeader;