import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  placeholder = 'Search...',
  onSearch
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [focused, setFocused] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };
  
  const clearSearch = () => {
    setSearchValue('');
    onSearch('');
  };
  
  return (
    <div className={`
      relative flex items-center rounded-lg bg-[#121218] border transition-all duration-200
      ${focused ? 'border-[#0066F5] shadow-sm shadow-[#0066F5]/20' : 'border-[#333333]'}
    `}>
      <div className="flex items-center justify-center h-full pl-3">
        <Search size={18} className="text-gray-400" />
      </div>
      
      <input
        type="text"
        value={searchValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-grow py-2 px-3 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
      />
      
      {searchValue && (
        <button
          onClick={clearSearch}
          className="flex items-center justify-center h-full pr-3 text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;