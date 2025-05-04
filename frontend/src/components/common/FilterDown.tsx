import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  multiSelect?: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ 
  label, 
  options, 
  selectedValues,
  onChange,
  multiSelect = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleOption = (value: string) => {
    if (multiSelect) {
      if (selectedValues.includes(value)) {
        // Remove value if already selected
        onChange(selectedValues.filter(v => v !== value));
      } else {
        // Add value if not selected
        onChange([...selectedValues, value]);
      }
    } else {
      // For single select, just replace the selected value
      onChange([value]);
      setIsOpen(false);
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`
          flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg border transition-colors
          ${isOpen ? 'border-[#0066F5] bg-[#121218]' : 'border-[#333333] bg-[#121218]'}
          ${selectedValues.length > 0 ? 'text-white' : 'text-gray-400'}
        `}
        onClick={toggleDropdown}
      >
        <span>
          {selectedValues.length > 0 
            ? `${label} (${selectedValues.length})` 
            : label
          }
        </span>
        <span className="ml-2">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-1 w-full bg-[#18181f] border border-[#333333] rounded-lg shadow-lg overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#333333] transition-colors"
                  onClick={() => toggleOption(option.value)}
                >
                  <span>{option.label}</span>
                  {selectedValues.includes(option.value) && (
                    <Check size={16} className="text-[#0066F5]" />
                  )}
                </button>
              ))}
            </div>
            
            {multiSelect && selectedValues.length > 0 && (
              <div className="p-2 border-t border-[#333333] flex justify-between">
                <button
                  className="text-xs text-[#0066F5] hover:text-[#3391f7]"
                  onClick={() => onChange([])}
                >
                  Clear all
                </button>
                <button
                  className="text-xs text-[#0066F5] hover:text-[#3391f7]"
                  onClick={() => setIsOpen(false)}
                >
                  Apply
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterDropdown;