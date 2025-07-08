import React from 'react';
import { ChevronDown } from 'lucide-react';
import { FilterOption } from '../../../types/adminTable/filter';

interface FilterDropdownProps {
  label: string;
  icon?: React.ReactNode;
  value: any;
  options: FilterOption[];
  onChange: (value: any) => void;
  multiple?: boolean;
  placeholder?: string;
  className?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  icon,
  value,
  options,
  onChange,
  multiple = false,
  placeholder = 'Select...',
  className = ''
}) => {
  const getDisplayValue = () => {
    if (multiple) {
      const selectedCount = Array.isArray(value) ? value.length : 0;
      return selectedCount > 0 ? `${label} (${selectedCount})` : label;
    }
    
    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption ? selectedOption.label : label;
  };

  const isActive = multiple 
    ? Array.isArray(value) && value.length > 0
    : value !== null && value !== undefined && value !== '';

  const handleOptionClick = (optionValue: any) => {
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      if (currentValue.includes(optionValue)) {
        onChange(currentValue.filter(v => v !== optionValue));
      } else {
        onChange([...currentValue, optionValue]);
      }
    } else {
      onChange(optionValue);
    }
  };

  return (
    <div className={`relative group mx-1 ${className}`}>
      <button
        className={`flex items-center p-3 rounded-lg transition-all ${
          isActive ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        {icon && <span className="w-5 h-5 mr-2">{icon}</span>}
        <span>{getDisplayValue()}</span>
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>
      
      <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
        {options.map((option) => {
          const isSelected = multiple 
            ? Array.isArray(value) && value.includes(option.value)
            : value === option.value;

          return (
            <div key={String(option.value)}>
              {multiple ? (
                <label className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleOptionClick(option.value)}
                    className="mr-2 accent-orange-500"
                  />
                  <span className={isSelected ? 'text-orange-500' : 'text-gray-300'}>
                    {option.label}
                  </span>
                </label>
              ) : (
                <button
                  onClick={() => handleOptionClick(option.value)}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${
                    isSelected ? 'text-orange-500' : 'text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FilterDropdown;