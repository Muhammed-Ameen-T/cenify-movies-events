import React from 'react';
import { Search } from 'lucide-react';

interface FilterSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const FilterSearch: React.FC<FilterSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder={placeholder}
          className="bg-transparent text-white outline-none w-200 placeholder-gray-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default FilterSearch;