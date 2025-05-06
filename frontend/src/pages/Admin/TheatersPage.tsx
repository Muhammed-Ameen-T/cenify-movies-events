import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, RotateCcw, Search, Calendar, Star, MapPin, Tag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Admin/Navbar';
import Sidebar from '../../components/Admin/Sidebar';
import TheaterCard from '../../components/Admin/TheaterCard';
import TheaterModal from '../../components/Admin/TheaterModal';
import { fetchTheaters, updateTheaterStatus } from '../../services/Vendor/authApi';
import { Theater } from '../../types/theater';

const ITEMS_PER_PAGE = 6;

// Filter Types
type FilterOptions = {
  status: string[];
  features: string[];
  rating: number | null;
  location: string;
  date: 'newest' | 'oldest' | null;
  search: string;
};

const ShimmerCard: React.FC = () => {
  return (
    <motion.div
      className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 animate-pulse"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
    >
      <div className="h-48 bg-gray-700 rounded-t-lg" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-700 rounded w-1/2" />
        <div className="flex space-x-2">
          <div className="h-4 bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-700 rounded w-1/4" />
        </div>
        <div className="h-4 bg-gray-700 rounded w-1/3" />
      </div>
    </motion.div>
  );
};

const Theaters: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // States
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    features: [],
    rating: null,
    location: '',
    date: null,
    search: '',
  });

  // Status options for filtering
  const statusOptions = ['verified', 'pending', 'blocked', 'verifying', 'request'];
  const featureOptions = ['Parking', 'Food', 'IMAX', '3D', 'Dolby Atmos', 'VIP'];
  
  // Fetch theaters
  const { data: allTheaters, isLoading, error } = useQuery({
    queryKey: ['theaters'],
    queryFn: fetchTheaters,
  });

  // Apply filters to theaters
  const filteredTheaters = React.useMemo(() => {
    if (!allTheaters) return [];
    
    return allTheaters.filter((theater) => {
      // Filter by status
      if (filters.status.length > 0 && !filters.status.includes(theater.status)) {
        return false;
      }
      
      // Filter by features
      if (filters.features.length > 0) {
        const hasFeature = filters.features.some(feature => 
          theater.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
        );
        if (!hasFeature) return false;
      }
      
      // Filter by rating
      if (filters.rating !== null && theater.rating < filters.rating) {
        return false;
      }
      
      // Filter by location
      if (filters.location && !theater.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Filter by search query (name or location)
      if (filters.search && !theater.name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !theater.location.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by date
      if (filters.date === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (filters.date === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });
  }, [allTheaters, filters]);

  // Calculate pagination
  const totalPages = Math.ceil((filteredTheaters?.length || 0) / ITEMS_PER_PAGE);
  const paginatedTheaters = filteredTheaters.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Update URL with filters and pagination for state persistence
  useEffect(() => {
    const queryParams = new URLSearchParams();
    
    if (currentPage > 1) queryParams.set('page', currentPage.toString());
    if (filters.status.length > 0) queryParams.set('status', filters.status.join(','));
    if (filters.features.length > 0) queryParams.set('features', filters.features.join(','));
    if (filters.rating !== null) queryParams.set('rating', filters.rating.toString());
    if (filters.location) queryParams.set('location', filters.location);
    if (filters.date) queryParams.set('date', filters.date);
    if (filters.search) queryParams.set('search', filters.search);
    
    const queryString = queryParams.toString();
    navigate({
      pathname: location.pathname,
      search: queryString ? `?${queryString}` : ''
    }, { replace: true });
    
    // Count active filters
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.features.length > 0) count++;
    if (filters.rating !== null) count++;
    if (filters.location) count++;
    if (filters.date) count++;
    if (filters.search) count++;
    setActiveFilterCount(count);
  }, [filters, currentPage, location.pathname, navigate]);
  
  // Load filters and pagination from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newFilters = { ...filters };
    
    if (searchParams.has('page')) setCurrentPage(Number(searchParams.get('page')));
    if (searchParams.has('status')) newFilters.status = searchParams.get('status')!.split(',');
    if (searchParams.has('features')) newFilters.features = searchParams.get('features')!.split(',');
    if (searchParams.has('rating')) newFilters.rating = Number(searchParams.get('rating'));
    if (searchParams.has('location')) newFilters.location = searchParams.get('location')!;
    if (searchParams.has('date')) newFilters.date = searchParams.get('date') as 'newest' | 'oldest';
    if (searchParams.has('search')) newFilters.search = searchParams.get('search')!;
    
    setFilters(newFilters);
  }, [location.search]);

  // Mutation for updating theater status
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateTheaterStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theaters'] });
      setErrorMessage(null);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || 'Failed to update status');
    },
  });

  // Theater action handlers
  const handleViewTheater = (id: string) => {
    const theater = allTheaters?.find((t) => t.id === id);
    if (theater) {
      setSelectedTheater(theater);
      setIsModalOpen(true);
    }
  };

  const handleBlockTheater = (id: string) => {
    mutation.mutate({ id, status: 'blocked' });
  };

  const handleAcceptTheater = (id: string) => {
    mutation.mutate({ id, status: 'verified' });
  };

  const handleUnblockTheater = (id: string) => {
    mutation.mutate({ id, status: 'verifying' });
  };

  // Filter handlers
  const toggleStatusFilter = (status: string) => {
    setFilters(prev => {
      if (prev.status.includes(status)) {
        return {
          ...prev,
          status: prev.status.filter(s => s !== status)
        };
      } else {
        return {
          ...prev,
          status: [...prev.status, status]
        };
      }
    });
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const toggleFeatureFilter = (feature: string) => {
    setFilters(prev => {
      if (prev.features.includes(feature)) {
        return {
          ...prev,
          features: prev.features.filter(f => f !== feature)
        };
      } else {
        return {
          ...prev,
          features: [...prev.features, feature]
        };
      }
    });
    setCurrentPage(1);
  };

  const setRatingFilter = (rating: number | null) => {
    setFilters(prev => ({
      ...prev,
      rating
    }));
    setCurrentPage(1);
  };

  const setDateFilter = (date: 'newest' | 'oldest' | null) => {
    setFilters(prev => ({
      ...prev,
      date
    }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
    setCurrentPage(1);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      location: e.target.value
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      status: [],
      features: [],
      rating: null,
      location: '',
      date: null,
      search: '',
    });
    setCurrentPage(1);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar activePage="theaters" />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Theaters</h1>
            
            <div className="relative">
              <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search theaters..."
                  className="bg-transparent text-white outline-none w-64"
                  value={filters.search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-gray-800 rounded-xl mb-8 shadow-lg">
            <div className="flex flex-wrap items-center p-2">
              {/* Filter Button */}
              <button 
                onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)} 
                className={`flex items-center p-3 rounded-lg mr-2 transition-all ${isFilterDrawerOpen ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <Filter className="w-5 h-5 mr-2" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              {/* Date Filter */}
              <div className="relative group mx-1">
                <button className={`flex items-center p-3 rounded-lg transition-all ${filters.date ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{filters.date ? (filters.date === 'newest' ? 'Newest First' : 'Oldest First') : 'Date'}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button 
                    onClick={() => setDateFilter('newest')}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${filters.date === 'newest' ? 'text-orange-500' : 'text-gray-300'}`}
                  >
                    Newest First
                  </button>
                  <button 
                    onClick={() => setDateFilter('oldest')}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${filters.date === 'oldest' ? 'text-orange-500' : 'text-gray-300'}`}
                  >
                    Oldest First
                  </button>
                </div>
              </div>
              
              {/* Status Filter Dropdown */}
              <div className="relative group mx-1">
                <button className={`flex items-center p-3 rounded-lg transition-all ${filters.status.length > 0 ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                  <Tag className="w-5 h-5 mr-2" />
                  <span>Status {filters.status.length > 0 && `(${filters.status.length})`}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {statusOptions.map(status => (
                    <label 
                      key={status}
                      className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer"
                    >
                      <input 
                        type="checkbox" 
                        checked={filters.status.includes(status)}
                        onChange={() => toggleStatusFilter(status)}
                        className="mr-2 accent-orange-500"
                      />
                      <span className={filters.status.includes(status) ? 'text-orange-500' : 'text-gray-300'}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Rating Filter */}
              <div className="relative group mx-1">
                <button className={`flex items-center p-3 rounded-lg transition-all ${filters.rating ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                  <Star className="w-5 h-5 mr-2" />
                  <span>Rating {filters.rating ? `(${filters.rating}+)` : ''}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <button 
                      key={rating}
                      onClick={() => setRatingFilter(filters.rating === rating ? null : rating)}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${filters.rating === rating ? 'text-orange-500' : 'text-gray-300'}`}
                    >
                      {Array(rating).fill('★').join('')}
                      {Array(5-rating).fill('☆').join('')}
                      {' '}{rating}+ Stars
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Location Input */}
              <div className="relative mx-1 flex items-center p-2 rounded-lg text-gray-300 hover:bg-gray-700">
                <MapPin className="w-5 h-5 mx-2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by location"
                  className="bg-transparent text-white outline-none w-40"
                  value={filters.location}
                  onChange={handleLocationChange}
                />
              </div>
              
              {/* Reset Filters */}
              <button 
                onClick={resetFilters}
                className={`flex items-center p-3 rounded-lg ml-auto ${activeFilterCount > 0 ? 'text-orange-500' : 'text-gray-500'}`}
                disabled={activeFilterCount === 0}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset Filters
              </button>
            </div>
            
            {/* Extended Filter Panel */}
            <AnimatePresence>
              {isFilterDrawerOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-gray-700"
                >
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-3">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {featureOptions.map(feature => (
                        <button
                          key={feature}
                          onClick={() => toggleFeatureFilter(feature)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            filters.features.includes(feature) 
                              ? 'bg-orange-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {feature}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {errorMessage && (
            <div className="text-red-400 mb-4 p-3 bg-red-900/30 rounded-lg border border-red-800">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <ShimmerCard key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">
              Error loading theaters: {(error as Error).message}
            </div>
          ) : filteredTheaters.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-800 rounded-lg text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-gray-400 text-7xl mb-4">🎭</div>
                <h3 className="text-white text-xl font-bold mb-2">No theaters found</h3>
                <p className="text-gray-400 mb-6">
                  We couldn't find any theaters matching your filter criteria
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Reset Filters
                </button>
              </motion.div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <AnimatePresence>
                  {paginatedTheaters.map((theater) => (
                    <motion.div
                      key={theater.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TheaterCard
                        id={theater.id}
                        name={theater.name}
                        location={theater.location}
                        features={theater.features}
                        rating={theater.rating}
                        reviewCount={theater.reviewCount || 0}
                        image={theater.images[0]}
                        status={theater.status}
                        onView={handleViewTheater}
                        onBlock={
                          theater.status === 'verified' || theater.status === 'verifying' || theater.status ==='pending'
                            ? handleBlockTheater
                            : undefined
                        }
                        onAccept={
                          theater.status === 'blocked' ||
                          theater.status === 'pending' ||
                          theater.status === 'verifying' ||
                          theater.status === 'request'
                            ? handleAcceptTheater
                            : undefined
                        }
                        onUnblock={theater.status === 'blocked' ? handleUnblockTheater : undefined}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6">
                  <div className="flex flex-wrap bg-gray-800 rounded-lg shadow-lg">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-l-lg ${
                        currentPage === 1 
                          ? 'text-gray-500 cursor-not-allowed' 
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {/* First Page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => setCurrentPage(1)}
                          className={`px-4 py-2 ${
                            currentPage === 1 
                              ? 'bg-orange-600 text-white' 
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          1
                        </button>
                        {currentPage > 4 && (
                          <span className="px-3 py-2 text-gray-500">...</span>
                        )}
                      </>
                    )}
                    
                    {/* Page Numbers */}
                    {Array.from({ length: totalPages })
                      .map((_, i) => i + 1)
                      .filter(page => {
                        if (totalPages <= 7) return true;
                        return page >= currentPage - 1 && page <= currentPage + 1;
                      })
                      .map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 ${
                            currentPage === page 
                              ? 'bg-orange-600 text-white' 
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    
                    {/* Last Page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="px-3 py-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className={`px-4 py-2 ${
                            currentPage === totalPages 
                              ? 'bg-orange-600 text-white' 
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-r-lg ${
                        currentPage === totalPages 
                          ? 'text-gray-500 cursor-not-allowed' 
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Results count info */}
          {!isLoading && filteredTheaters.length > 0 && (
            <div className="mt-4 text-gray-400 text-sm text-center">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTheaters.length)} of {filteredTheaters.length} theaters
            </div>
          )}

          <TheaterModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            theater={selectedTheater}
          />
        </main>
      </div>
    </div>
  );
};

export default Theaters;