import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for portals
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import '../../style/Calendar.css'; // Assuming this contains base styles and animations

interface ValidationRule {
  validate: (date: Date) => boolean;
  message: string;
}

interface CalendarProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  validationRules?: ValidationRule[];
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  error?: string;
  theme?: 'light' | 'dark';
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  validationRules = [],
  placeholder = 'Select a date',
  disabled = false,
  minDate,
  maxDate = new Date(),
  className = '',
  error,
  theme = 'dark',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [validationError, setValidationError] = useState<string>('');
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLButtonElement>(null); // Ref to the input button
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref to the dropdown div
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const normalizeDate = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const validateDate = (date: Date): string => {
    const normalizedDate = normalizeDate(date);
    if (minDate && normalizedDate < normalizeDate(minDate)) {
      return `Date must be after ${minDate.toLocaleDateString()}`;
    }
    if (maxDate && normalizedDate > normalizeDate(maxDate)) {
      return `Date must be before or on ${maxDate.toLocaleDateString()}`;
    }
    for (const rule of validationRules) {
      if (!rule.validate(normalizedDate)) {
        return rule.message;
      }
    }
    return '';
  };

  const handleDateSelect = (date: Date) => {
    const normalizedDate = normalizeDate(date);
    const errorMsg = validateDate(normalizedDate);
    setValidationError(errorMsg);
    if (!errorMsg) {
      onChange?.(normalizedDate);
      setIsOpen(false);
    }
  };

  const handleClearDate = () => {
    onChange?.(undefined);
    setValidationError('');
    setIsOpen(false);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(direction === 'prev' ? prev.getMonth() - 1 : prev.getMonth() + 1);

      // Boundary checks for navigation
      if (minDate && normalizeDate(newMonth) < normalizeDate(new Date(minDate.getFullYear(), minDate.getMonth(), 1))) {
        return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      }
      if (maxDate && normalizeDate(newMonth) > normalizeDate(new Date(maxDate.getFullYear(), maxDate.getMonth(), 1))) {
        return new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      }
      return newMonth;
    });
  };

  const setYear = (year: number) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);

      // Boundary checks for year selection
      if (minDate && normalizeDate(newDate) < normalizeDate(new Date(minDate.getFullYear(), minDate.getMonth(), 1))) {
        return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      }
      if (maxDate && normalizeDate(newDate) > normalizeDate(new Date(maxDate.getFullYear(), maxDate.getMonth(), 1))) {
        return new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      }
      return newDate;
    });
    setIsYearDropdownOpen(false);
  };

  const setMonth = (month: number) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(month);

      // Boundary checks for month selection
      if (minDate && normalizeDate(newDate) < normalizeDate(new Date(minDate.getFullYear(), minDate.getMonth(), 1))) {
        return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      }
      if (maxDate && normalizeDate(newDate) > normalizeDate(new Date(maxDate.getFullYear(), maxDate.getMonth(), 1))) {
        return new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      }
      return newDate;
    });
    setIsMonthDropdownOpen(false);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    // Default range, can be adjusted or made dynamic based on actual data needs
    const minYear = minDate ? minDate.getFullYear() : currentYear - 10;
    const maxYear = maxDate ? maxDate.getFullYear() : currentYear + 5; // Allow future years slightly

    const years = [];
    for (let year = maxYear; year >= minYear; year--) { // Display from latest to earliest
      years.push(year);
    }
    return years;
  };

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (minDate && normalizeDate(date) < normalizeDate(minDate)) return true;
    if (maxDate && normalizeDate(date) > normalizeDate(maxDate)) return true;
    return validationRules.some((rule) => !rule.validate(normalizeDate(date)));
  };

  const isSelectedDate = (day: number): boolean => {
    if (!value) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return normalizeDate(date).toDateString() === normalizeDate(value).toDateString();
  };

  const isToday = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    return normalizeDate(date).toDateString() === normalizeDate(today).toDateString();
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const displayError = error || validationError;

  // --- Portal Logic ---
  useEffect(() => {
    if (isOpen && inputRef.current && dropdownRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const dropdownWidth = dropdownRef.current.offsetWidth; // Get actual rendered width

      setDropdownPosition({
        top: inputRect.bottom + window.scrollY,
        // Calculate left to align right edges: input's right edge - dropdown's width
        left: inputRect.right + window.scrollX - dropdownWidth,
        width: inputRect.width, // Still match the input width if desired, or set a fixed width for the dropdown
      });
    }
  }, [isOpen, inputRef.current, dropdownRef.current]); // Recalculate if dropdownRef also changes

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsYearDropdownOpen(false);
        setIsMonthDropdownOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) {
    console.error("Portal root element 'portal-root' not found in index.html. Please add <div id='portal-root'></div> to your public/index.html file.");
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        ref={inputRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 text-sm rounded-md
          border transition-all duration-200
          ${disabled
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
            : theme === 'dark'
              ? 'bg-gray-900 hover:bg-gray-800 text-gray-100'
              : 'bg-white hover:bg-gray-50 text-gray-900'
          }
          ${displayError
            ? 'border-red-500 focus:ring-red-400'
            : 'border-gray-600 focus:ring-blue-400'
          }
          ${isOpen ? 'ring-1 ring-blue-400' : ''}
        `}
      >
        <span className={value ? 'text-gray-100' : 'text-gray-400'}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-gray-400" />
      </button>

      {displayError && (
        <p className="mt-1 text-xs text-red-400 animate-fadeIn">
          {displayError}
        </p>
      )}

      {isOpen && ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          className="absolute z-[10000] mt-1 p-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg animate-fadeIn"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: '220px' // Keep a fixed width for the calendar dropdown for consistency
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              disabled={
                minDate &&
                currentMonth.getFullYear() === minDate.getFullYear() &&
                currentMonth.getMonth() === minDate.getMonth()
              }
              className="p-1 hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 text-gray-400" />
            </button>

            <div className="flex items-center space-x-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                  className="text-sm font-medium text-gray-100 hover:text-blue-400 flex items-center px-1.5 py-0.5 rounded-md hover:bg-gray-800 transition-colors"
                >
                  {months[currentMonth.getMonth()]?.substring(0, 3)}
                  <ChevronDown className="ml-0.5 h-3 w-3" />
                </button>
                {isMonthDropdownOpen && (
                  <div className="absolute z-[10001] mt-1 w-28 bg-gray-900 border border-gray-700 rounded-md shadow-xl max-h-40 overflow-y-auto left-1/2 -translate-x-1/2">
                    {months.map((month, index) => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => setMonth(index)}
                        className="w-full px-2 py-1 text-sm text-gray-100 hover:bg-blue-600 hover:text-white transition-colors duration-150"
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                  className="text-sm font-medium text-gray-100 hover:text-blue-400 flex items-center px-1.5 py-0.5 rounded-md hover:bg-gray-800 transition-colors"
                >
                  {currentMonth.getFullYear()}
                  <ChevronDown className="ml-0.5 h-3 w-3" />
                </button>
                {isYearDropdownOpen && (
                  <div className="absolute z-[10001] mt-1 w-24 bg-gray-900 border border-gray-700 rounded-md shadow-xl max-h-40 overflow-y-auto left-1/2 -translate-x-1/2">
                    {generateYearOptions().map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setYear(year)}
                        className="w-full px-2 py-1 text-sm text-gray-100 hover:bg-blue-600 hover:text-white transition-colors duration-150"
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigateMonth('next')}
              disabled={
                maxDate &&
                currentMonth.getFullYear() === maxDate.getFullYear() &&
                currentMonth.getMonth() === maxDate.getMonth()
              }
              className="p-1 hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {generateCalendarDays().map((day, index) => (
              <div key={index} className="aspect-square">
                {day && (
                  <button
                    type="button"
                    onClick={() => handleDateSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                    disabled={isDateDisabled(day)}
                    className={`
                      w-7 h-7 flex items-center justify-center text-xs rounded-full
                      transition-all duration-200 relative
                      ${isDateDisabled(day)
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-300 hover:bg-gray-800'
                      }
                      ${isSelectedDate(day)
                        ? 'bg-blue-500 text-white hover:bg-blue-600 font-semibold'
                        : ''
                      }
                      ${isToday(day) && !isSelectedDate(day)
                        ? 'bg-gray-800 font-semibold'
                        : ''
                      }
                    `}
                  >
                    {day}
                    {isToday(day) && !isSelectedDate(day) && (
                      <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {value && (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleClearDate}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                aria-label="Clear selected date"
              >
                Clear Date
              </button>
            </div>
          )}
        </div>,
        portalRoot
      )}

      {isOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999]" onClick={() => setIsOpen(false)} />,
        portalRoot
      )}
    </div>
  );
};

export default Calendar;