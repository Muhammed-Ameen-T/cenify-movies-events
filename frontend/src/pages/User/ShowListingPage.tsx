import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Filter,
  ChevronDown,
  Info,
  Car,
  Smartphone,
  Coffee,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  RotateCcw,
  Armchair,
  ExternalLink
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getShowSelectionService } from '../../services/Vendor/showApi';

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    background-clip: content-box;
  }
  
  .custom-scrollbar::-webkit-scrollbar-corner {
    background: rgba(0, 0, 0, 0.05);
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Interfaces
interface Show {
  time: string;
  status: 'available' | 'fast-filling' | 'not-available';
  _id: string;
  amenities: {
    is4K: boolean;
    isDolby: boolean;
  };
}

interface Theater {
  id: string;
  name: string;
  rating: number;
  facilities: {
    foodCourt: boolean;
    lounges: boolean;
    mTicket: boolean;
    parking: boolean;
    freeCancellation: boolean;
  };
  images: string[];
  address: {
    city: string;
    coordinates: [number, number];
  };
  shows: Show[];
}

interface Movie {
  title: string;
  language: string;
  genres: string[];
  duration: string;
  rating: number;
}

interface ShowSelectionResponse {
  movie: Movie | null;
  theaters: Theater[];
}

interface DateOption {
  id: number;
  day: string;
  date: string;
  month: string;
  fullDate: string;
}

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

interface TimeSlot {
  id: string;
  label: string;
  time: string;
  start: string;
  end: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface Facility {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Static Data
const priceRanges: PriceRange[] = [
  { id: '0-200', label: '₹0 - ₹200', min: 0, max: 200 },
  { id: '201-300', label: '₹201 - ₹300', min: 201, max: 300 },
  { id: '301-400', label: '₹301 - ₹400', min: 301, max: 400 },
  { id: '401-500', label: '₹401 - ₹500', min: 401, max: 500 },
];

const timeSlots: TimeSlot[] = [
  { id: 'morning', label: 'Morning', time: '6:00AM - 11:59AM', start: '06:00', end: '11:59', icon: Sunrise, color: 'text-orange-500' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00PM - 5:59PM', start: '12:00', end: '17:59', icon: Sun, color: 'text-yellow-500' },
  { id: 'evening', label: 'Evening', time: '6:00PM - 8:59PM', start: '18:00', end: '20:59', icon: Sunset, color: 'text-purple-500' },
  { id: 'night', label: 'Night', time: '9:00PM - 11:59PM', start: '21:00', end: '23:59', icon: Moon, color: 'text-blue-500' },
];

const facilities: Facility[] = [
  { id: 'parking', name: 'Parking', icon: Car },
  { id: 'mTicket', name: 'M-Ticket', icon: Smartphone },
  { id: 'foodCourt', name: 'Food Court', icon: Coffee },
  { id: 'lounges', name: 'Lounges', icon: Armchair },
  { id: 'freeCancellation', name: 'Free Cancellation', icon: RotateCcw },
];

// Function to generate date options
const generateDateOptions = (): DateOption[] => {
  const dates: DateOption[] = [];
  const today = new Date();
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const day = daysOfWeek[date.getDay()];
    const dateStr = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const fullDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    dates.push({
      id: i + 1,
      day,
      date: dateStr,
      month,
      fullDate,
    });
  }
  return dates;
};

const ShowSelectionPage: React.FC = () => {
  const dates = generateDateOptions();
  const [selectedDate, setSelectedDate] = useState<DateOption>(dates[0]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [showPriceDropdown, setShowPriceDropdown] = useState<boolean>(false);
  const [showFacilitiesDropdown, setShowFacilitiesDropdown] = useState<boolean>(false);
  const [urlParamsInitialized, setUrlParamsInitialized] = useState<boolean>(false);
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add custom scrollbar styles to document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = scrollbarStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Helper to compare arrays for equality
  // const areArraysEqual = (a: string[], b: string[]): boolean => {
  //   if (a.length !== b.length) return false;
  //   return a.every((val, idx) => val === b[idx]);
  // };

  // Initialize filters from URL query params ONCE on component mount
  useEffect(() => {
    if (urlParamsInitialized) return;
    
    const query = new URLSearchParams(location.search);
    const date = query.get('date');
    const priceRangesStr = query.get('priceRanges');
    const timeSlotsStr = query.get('timeSlots');
    const facilitiesStr = query.get('filters');

    try {
      if (date) {
        const foundDate = dates.find((d) => d.fullDate === date);
        if (foundDate) {
          setSelectedDate(foundDate);
        }
      }

      if (priceRangesStr) {
        const parsed = JSON.parse(priceRangesStr);
        if (Array.isArray(parsed)) {
          setSelectedPriceRanges(parsed);
        }
      }

      if (timeSlotsStr) {
        const parsed = JSON.parse(timeSlotsStr);
        if (Array.isArray(parsed)) {
          setSelectedTimeSlots(parsed);
        }
      }

      if (facilitiesStr) {
        const parsed = JSON.parse(facilitiesStr);
        if (Array.isArray(parsed)) {
          setSelectedFacilities(parsed);
        }
      }
    } catch (error) {
      console.error('Error parsing query params:', error);
    }
    
    setUrlParamsInitialized(true);
  }, [dates, location.search, urlParamsInitialized]);

  // Update URL query params when filters change (only after initialization)
  useEffect(() => {
    if (!urlParamsInitialized) return;
    
    const queryParams = new URLSearchParams();
    queryParams.set('date', selectedDate.fullDate);
    if (selectedPriceRanges.length > 0) queryParams.set('priceRanges', JSON.stringify(selectedPriceRanges));
    if (selectedTimeSlots.length > 0) queryParams.set('timeSlots', JSON.stringify(selectedTimeSlots));
    if (selectedFacilities.length > 0) queryParams.set('filters', JSON.stringify(selectedFacilities));

    const newQueryString = queryParams.toString();
    const currentQueryString = location.search.slice(1);
    
    if (newQueryString !== currentQueryString) {
      navigate(`${location.pathname}?${newQueryString}`, { replace: true });
    }
  }, [selectedDate, selectedPriceRanges, selectedTimeSlots, selectedFacilities, location.pathname, navigate, urlParamsInitialized]);

  // Fetch data using useQuery
  const { data, isLoading, error, isFetching } = useQuery<ShowSelectionResponse, Error>({
    queryKey: ['showSelection', movieId, selectedDate.fullDate, selectedPriceRanges, selectedTimeSlots, selectedFacilities],
    queryFn: async () => {
      const response = await getShowSelectionService(movieId!, {
        date: selectedDate.fullDate,
        priceRanges: selectedPriceRanges.length
          ? priceRanges
              .filter((range) => selectedPriceRanges.includes(range.id))
              .map(({ id, min, max }) => ({ id, min, max }))
          : undefined,
        timeSlots: selectedTimeSlots.length
          ? timeSlots
              .filter((slot) => selectedTimeSlots.includes(slot.id))
              .map(({ id, start, end }) => ({ id, start, end }))
          : undefined,
        facilities: selectedFacilities.length ? selectedFacilities.join(',') : undefined,
      });
      console.log('API Response:', response);
      return response;
    },
    enabled: !!movieId && urlParamsInitialized,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Image carousel for theater modal
  useEffect(() => {
    if (selectedTheater) {
      carouselIntervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          (prevIndex + 1) % selectedTheater.images.length
        );
      }, 3000);
    }
    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, [selectedTheater]);

  const getStatusColor = (status: string) => {  
    switch (status) {
      case 'available':
        return 'border-green-500 text-green-600 hover:bg-green-50';
      case 'fast-filling':
        return 'border-orange-500 text-orange-600 hover:bg-orange-50';
      case 'not-available':
        return 'border-red-500 text-red-600 cursor-not-allowed opacity-60';
      default:
        return 'border-gray-300 text-gray-600';
    }
  };

  const togglePriceRange = (rangeId: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(rangeId)
        ? prev.filter((id) => id !== rangeId)
        : [...prev, rangeId]
    );
  };

  // const toggleTimeSlot = (slotId: string) => {
  //   setSelectedTimeSlots((prev) =>
  //     prev.includes(slotId)
  //       ? prev.filter((id) => id !== slotId)
  //       : [...prev, slotId]
  //   );
  // };

  const toggleFacility = (facilityId: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId)
        ? prev.filter((id) => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  const visibleImages:string[] = selectedTheater? selectedTheater?.images.slice(1) : [];


  // const handleImageNavigation = (direction: 'prev' | 'next') => {
  //   setCurrentImageIndex((prevIndex) => {
  //     const totalImages = selectedTheater?.images.length || 1;
  //     if (direction === 'prev') {
  //       return (prevIndex - 1 + totalImages) % totalImages;
  //     }
  //     return (prevIndex + 1) % totalImages;
  //   });
  // };

  // Shimmer UI Components
  const ShimmerMovieHeader = () => (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 mb-4 animate-pulse">
      <div className="h-8 w-1/2 bg-gray-200 rounded mb-3"></div>
      <div className="flex gap-3">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-28 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-14 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );

  const ShimmerTheaterCard = () => (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 w-1/2 bg-gray-200 rounded mb-2"></div>
          <div className="flex gap-2 mb-3">
            <div className="h-5 w-14 bg-gray-200 rounded-full"></div>
            <div className="h-5 w-28 bg-gray-200 rounded-full"></div>
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pb-45 custom-scrollbar">
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span onClick={() => navigate('/')} className="cursor-pointer">
              <Home className="w-4 h-4" />
            </span>
            <span>/</span>
            <span onClick={() => navigate('/movie-listing')} className="cursor-pointer">
              Movies
            </span>
            <span>/</span>
            <span onClick={() => navigate(`/movie-details/${movieId}`)} className="cursor-pointer">
              Details
            </span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Show Selection</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Movie Info Header - More Compact */}
        {isLoading || isFetching ? (
          <ShimmerMovieHeader />
        ) : error ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 mb-4 text-center">
            <p className="text-red-600">Error: {error.message}</p>
          </div>
        ) : !movieId ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 mb-4 text-center">
            <p className="text-red-600">Invalid movie ID.</p>
          </div>
        ) : data?.movie ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  {data.movie.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full">
                    {data.movie.language}
                  </span>
                  <span className="bg-gradient-to-r from-green-100 to-blue-100 px-3 py-1 rounded-full">
                    {data.movie.genres.join(', ')}
                  </span>
                  <span className="bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-full">
                    {data.movie.duration}
                  </span>
                  <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-yellow-200 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-gray-900">{data.movie.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 mb-4 text-center">
            <p className="text-gray-600">Movie details not available.</p>
          </div>
        )}

        {/* Date Selection & Status Legend - More Compact */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Select Date
            </h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 pt-1 pl-1">
              {dates.map((date) => (
                <button
                  key={date.id}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedDate.id === date.id
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white/50'
                  }`}
                >
                  <div className="text-center min-w-[50px]">
                    <div className="text-xs font-medium text-gray-600">{date.day}</div>
                    <div className="text-xl font-bold text-gray-900">{date.date}</div>
                    <div className="text-xs text-gray-600">{date.month}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4">
            <h4 className="font-bold text-gray-900 mb-3 text-center text-sm">Seat Status</h4>
            <div className="flex gap-4 justify-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700">Fast Filling</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                <span className="text-xs font-medium text-gray-700">Not Available</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Filters Sidebar - More Compact */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>

              <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Price Range Dropdown */}
                <div className="relative">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Price Range</h4>
                  <button
                    onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:border-gray-300 transition-colors text-sm"
                  >
                    <span className="text-gray-700">
                      {selectedPriceRanges.length === 0
                        ? 'Select Price Range'
                        : `${selectedPriceRanges.length} selected`}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        showPriceDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {showPriceDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 custom-scrollbar">
                      <div className="p-1">
                        {priceRanges.map((range) => (
                          <label
                            key={range.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPriceRanges.includes(range.id)}
                              onChange={() => togglePriceRange(range.id)}
                              className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                            />
                            <span className="text-gray-700 font-medium text-sm">{range.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Preference Dropdown
                <div className="relative">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Preferred Time</h4>
                  <button
                    onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:border-gray-300 transition-colors text-sm"
                  >
                    <span className="text-gray-700">
                      {selectedTimeSlots.length === 0
                        ? 'Select Time Slots'
                        : `${selectedTimeSlots.length} selected`}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        showTimeDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {showTimeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 custom-scrollbar">
                      <div className="p-1">
                        {timeSlots.map((slot) => {
                          const IconComponent = slot.icon;
                          return (
                            <label
                              key={slot.id}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedTimeSlots.includes(slot.id)}
                                onChange={() => toggleTimeSlot(slot.id)}
                                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                              />
                              <IconComponent className={`w-4 h-4 ${slot.color}`} />
                              <div>
                                <div className="text-gray-900 font-medium text-sm">{slot.label}</div>
                                <div className="text-gray-500 text-xs">{slot.time}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div> */}

                {/* Facilities Dropdown */}
                <div className="relative">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Facilities</h4>
                  <button
                    onClick={() => setShowFacilitiesDropdown(!showFacilitiesDropdown)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:border-gray-300 transition-colors text-sm"
                  >
                    <span className="text-gray-700">
                      {selectedFacilities.length === 0
                        ? 'Select Facilities'
                        : `${selectedFacilities.length} selected`}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        showFacilitiesDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {showFacilitiesDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 custom-scrollbar">
                      <div className="p-1">
                        {facilities.map((facility) => {
                          const IconComponent = facility.icon;
                          return (
                            <label
                              key={facility.id}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedFacilities.includes(facility.id)}
                                onChange={() => toggleFacility(facility.id)}
                                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                              />
                              <IconComponent className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700 font-medium text-sm">{facility.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Theater Listings - More Compact */}
          <div className="lg:col-span-3">
            <div className="space-y-4 custom-scrollbar">
              {isLoading || isFetching ? (
                <>
                  <ShimmerTheaterCard />
                  <ShimmerTheaterCard />
                  <ShimmerTheaterCard />
                </>
              ) : error ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 text-center">
                  <p className="text-red-600">Error: {error.message}</p>
                </div>
              ) : !movieId ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 text-center">
                  <p className="text-red-600">Invalid movie ID.</p>
                </div>
              ) : data?.theaters?.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 text-center">
                  <p className="text-gray-600">
                    No shows available for the selected date and filters.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedPriceRanges([]);
                      setSelectedTimeSlots([]);
                      setSelectedFacilities([]);
                      setSelectedDate(dates[0]);
                    }}
                    className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : data?.theaters ? (
                data.theaters.map((theater) => (
                  <div
                    key={theater.id}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{theater.name}</h3>
                            <button
                              onClick={() => {
                                setSelectedTheater(theater);
                                setCurrentImageIndex(0);
                              }}
                              className="p-1 hover:bg-blue-100 rounded-full transition-colors group"
                            >
                              <Info className="w-4 h-4 text-gray-600 group-hover:text-blue-500" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-yellow-200 px-2 py-1 rounded-full">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="font-semibold text-gray-900 text-sm">{theater.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span className="text-xs">{theater.address.city}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-4 flex-wrap">
                            {Object.entries(theater.facilities)
                              .filter(([_, value]) => value)
                              .slice(0, 3)
                              .map(([facilityId]) => {
                                const facility = facilities.find((f) => f.id === facilityId);
                                if (!facility) return null;
                                const IconComponent = facility.icon;
                                return (
                                  <div
                                    key={facilityId}
                                    className="flex items-center gap-1 bg-gradient-to-r from-gray-100 to-gray-200 px-2 py-1 rounded-full"
                                  >
                                    <IconComponent className="w-3 h-3 text-gray-600" />
                                    <span className="text-xs text-gray-700 font-medium">
                                      {facility.name}
                                    </span>
                                  </div>
                                );
                              })}
                            {Object.entries(theater.facilities).filter(([_, value]) => value).length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{Object.entries(theater.facilities).filter(([_, value]) => value).length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold text-gray-900 text-sm">Show Times</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {theater.shows.map((show:Show, index:number) => (
                            <div className="relative group">
                              {/* Button */}
                              <button
                                key={index}
                                disabled={show.status === "not-available"}
                                onClick={() => navigate(`/seat-selection/${show._id}`)}
                                className={`w-22 h-12 rounded-lg border-2 bg-white font-semibold transition-all duration-300 transform hover:scale-105 ${getStatusColor(
                                  show.status
                                )} flex flex-col items-center justify-center text-sm relative`}
                              >
                                {(() => {
                                  const time = new Date(show.time).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                  });

                                  const [timePart, ampm] = time.split(' '); // e.g. ['09:00', 'AM']

                                  return (
                                    <span className="text-lg font-bold">
                                      {timePart}
                                      <span className="text-xs ml-0">{ampm?.toUpperCase()}</span>
                                    </span>
                                  );
                                })()}
                                <div className="text-[8px] text-gray-600 mt-0 mb-1 ">
                                  {show.amenities.is4K ? (
                                    <span className="bg-blue-100 px-2 py-0.5 rounded">4K ATMOS</span> 
                                  ) : (
                                    <span className="bg-purple-100 px-2 py-0.5 rounded">DOLBY 7.1</span>
                                  )}
                                </div>
                              </button>

                              {/* Modern Hover Popup */}
                              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-28 p-3 bg-white border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-sm font-semibold">{show.screenName}</p>
                                <p className={`text-xs font-bold ${getStatusColor(show.status)}`}>
                                  {show.status.replace("-", " ").toUpperCase()}
                                </p>
                                <div className="text-xs text-gray-600 mt-1">
                                  {show.amenities.isDolby && "DOLBY"} | 
                                   {show.amenities.is4K && " 4K"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 text-center">
                  <p className="text-gray-600">No theater data available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Theater Details Modal - Improved with larger images */}
      {selectedTheater && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 custom-scrollbar">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedTheater(null)}
                className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 p-2 rounded-full shadow-lg transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Carousel - Increased height and improved aspect ratio */}
              <div className="relative h-80 overflow-hidden rounded-t-2xl">
                <img
                  src={
                    visibleImages[currentImageIndex] ||
                    'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1000'
                  }
                  alt={selectedTheater.name}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      currentImageIndex === 0 ? visibleImages?.length - 1 : currentImageIndex - 1
                    )
                  }
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full hover:bg-white transition-colors shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>

                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      currentImageIndex === visibleImages?.length - 1 ? 0 : currentImageIndex + 1
                    )
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full hover:bg-white transition-colors shadow-lg"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>

                <div className="absolute bottom-4 left-4">
                  <h2 className="text-3xl font-bold text-white mb-1">{selectedTheater.name}</h2>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-white font-semibold text-lg">{selectedTheater.rating}</span>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 flex gap-1">
                  {visibleImages?.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Address */}
                <div className="mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                    <p className="text-gray-600">{selectedTheater.address.city}</p>
                  </div>
                </div>

                {/* Map Replacement - Using a more reliable solution */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                  <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden border">
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedTheater.address.coordinates[1] - 0.01},${selectedTheater.address.coordinates[0] - 0.01},${selectedTheater.address.coordinates[1] + 0.01},${selectedTheater.address.coordinates[0] + 0.01}&layer=mapnik&marker=${selectedTheater.address.coordinates[0]},${selectedTheater.address.coordinates[1]}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      title="Theater Location"
                      className="rounded-lg"
                    ></iframe>
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${selectedTheater.address.coordinates[0]},${selectedTheater.address.coordinates[1]}`,
                            '_blank'
                          )
                        }
                        className="bg-white/90 p-2 rounded-lg shadow-lg hover:bg-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Facilities */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Facilities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedTheater.facilities)
                      .filter(([_, value]) => value)
                      .map(([facilityId]) => {
                        const facility = facilities.find((f) => f.id === facilityId);
                        if (!facility) return null;
                        const IconComponent = facility.icon;
                        return (
                          <div
                            key={facilityId}
                            className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border"
                          >
                            <IconComponent className="w-5 h-5 text-blue-500" />
                            <span className="text-gray-700 font-medium">{facility.name}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${selectedTheater.address.coordinates[0]},${selectedTheater.address.coordinates[1]}`,
                        '_blank'
                      )
                    }
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Get Directions
                  </button>
                  <button
                    onClick={() => setSelectedTheater(null)}
                    className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-semibold py-3 rounded-xl transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowSelectionPage;