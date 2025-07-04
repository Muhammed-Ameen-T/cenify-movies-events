import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, RotateCcw, Search, Calendar, Tag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import ShowViewModal from '../../components/Admin/ShowViewModal';
import ConfirmationModal from '../../components/Admin/ConfirmationModal';
import { fetchAllShows, updateShowStatus, deleteShow } from '../../services/Vendor/showApi';
import { Show } from '../../types/show';

const ITEMS_PER_PAGE = 5;

type FilterOptions = {
  theaterId?: string;
  movieId?: string;
  screenId?: string;
  status?: string;
  showDate?: 'newest' | 'oldest' | null;
  search?: string;
};

const ShimmerRow: React.FC = () => {
  return (
    <tr className="border-b border-gray-700">
      <td className="p-4">
        <div className="h-4 bg-gray-700 rounded w-8 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
          <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
          <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
        </div>
      </td>
    </tr>
  );
};

const ShowManagement: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // States
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: 'cancel' | 'delete' | 'revert';
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    theaterId: undefined,
    movieId: undefined,
    screenId: undefined,
    status: undefined,
    showDate: null,
    search: '',
  });

  // Options for filtering
  const statusOptions = ['Scheduled', 'Running', 'Completed', 'Cancelled'];

  // Fetch shows
  const { data, isLoading, error } = useQuery({
    queryKey: ['shows', currentPage, JSON.stringify(filters)],
    queryFn: () =>
      fetchAllShows({
        page: currentPage,
        limit: ITEMS_PER_PAGE,  
        theaterId: filters.theaterId,
        movieId: filters.movieId,
        screenId: filters.screenId,
        status: filters.status,
        sortBy: filters.showDate ? 'showDate' : undefined,
        sortOrder: filters.showDate === 'newest' ? 'desc' : filters.showDate === 'oldest' ? 'asc' : undefined,
        search: filters.search || undefined,
      }),
  });

  // Log raw data for debugging
  console.log('🚀 ~ Raw data from useQuery:', data);

  const shows = data?.shows || [];
  const totalShows = data?.totalCount || 0;
  const totalPages = Math.ceil(totalShows / ITEMS_PER_PAGE) || 1;

  // Log shows for debugging
  console.log('🚀 ~ Shows from API:', shows);

  // Normalize shows to ensure id
  const normalizedShows = shows.map((show: Show) => ({
    ...show,
    id: show._id || show.id || `fallback-${Math.random().toString(36).substr(2, 9)}`, // Fallback ID if both _id and id are missing
  }));

  // Check for duplicates (for debugging, optional)
  const hasDuplicates = new Set(normalizedShows.map((show: Show) => show.id)).size < normalizedShows.length;
  if (hasDuplicates) {
    console.warn('🚨 Duplicate show IDs detected:', normalizedShows);
  }

  // Extract unique options for dropdowns
  const movieOptions = Array.from(
    new Map(normalizedShows.map((show: Show) => [show.movieId?._id, show.movieId])).values()
  ).filter((movie): movie is { _id: string; name: string } => !!movie);
  const theaterOptions = Array.from(
    new Map(normalizedShows.map((show: Show) => [show.theaterId?._id, show.theaterId])).values()
  ).filter((theater): theater is { _id: string; name: string } => !!theater);
  const screenOptions = Array.from(
    new Map(normalizedShows.map((show: Show) => [show.screenId?._id, show.screenId])).values()
  ).filter((screen): screen is { _id: string; name: string } => !!screen);

  // Mutation for updating show status (cancel or revert)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateShowStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows'] });
      setErrorMessage(null);
      setIsConfirmModalOpen(false);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || `Failed to update show status`);
    },
  });

  // Mutation for deleting a show
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows'] });
      setErrorMessage(null);
      setIsConfirmModalOpen(false);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to delete show');
    },
  });

  // Update URL with filters and pagination
  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (currentPage > 1) queryParams.set('page', currentPage.toString());
    if (filters.theaterId) queryParams.set('theaterId', filters.theaterId);
    if (filters.movieId) queryParams.set('movieId', filters.movieId);
    if (filters.screenId) queryParams.set('screenId', filters.screenId);
    if (filters.status) queryParams.set('status', filters.status);
    if (filters.showDate) queryParams.set('showDate', filters.showDate);
    if (filters.search) queryParams.set('search', filters.search);

    const queryString = queryParams.toString();
    navigate(
      {
        pathname: location.pathname,
        search: queryString ? `?${queryString}` : '',
      },
      { replace: true }
    );

    // Count active filters
    let count = 0;
    if (filters.theaterId) count++;
    if (filters.movieId) count++;
    if (filters.screenId) count++;
    if (filters.status) count++;
    if (filters.showDate) count++;
    if (filters.search) count++;
    setActiveFilterCount(count);
  }, [filters, currentPage, location.pathname, navigate]);

  // Load filters and pagination from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newFilters = { ...filters };
    if (searchParams.has('page')) setCurrentPage(Number(searchParams.get('page')));
    if (searchParams.has('theaterId')) newFilters.theaterId = searchParams.get('theaterId')!;
    if (searchParams.has('movieId')) newFilters.movieId = searchParams.get('movieId')!;
    if (searchParams.has('screenId')) newFilters.screenId = searchParams.get('screenId')!;
    if (searchParams.has('status')) newFilters.status = searchParams.get('status')!;
    if (searchParams.has('showDate')) newFilters.showDate = searchParams.get('showDate') as 'newest' | 'oldest';
    if (searchParams.has('search')) newFilters.search = searchParams.get('search')!;
    setFilters(newFilters);
  }, [location.search]);

  // Action handlers
  const handleViewShow = (id: string) => {
    const show = normalizedShows.find((s: Show) => s.id === id);
    if (show) {
      setSelectedShow(show);
      setIsModalOpen(true);
    }
  };

  const handleCancelShow = (id: string) => {
    setConfirmAction({
      id,
      action: 'cancel',
      message: 'Are you sure you want to cancel this show?',
    });
    setIsConfirmModalOpen(true);
  };

  const handleRevertShow = (id: string) => {
    setConfirmAction({
      id,
      action: 'revert',
      message: 'Are you sure you want to revert this show to Scheduled?',
    });
    setIsConfirmModalOpen(true);
  };

  const handleDeleteShow = (id: string) => {
    setConfirmAction({
      id,
      action: 'delete',
      message: 'Are you sure you want to delete this show?',
    });
    setIsConfirmModalOpen(true);
  };

  const confirmActionHandler = () => {
    if (confirmAction) {
      if (confirmAction.action === 'cancel') {
        updateStatusMutation.mutate({ id: confirmAction.id, status: 'Cancelled' });
      } else if (confirmAction.action === 'revert') {
        updateStatusMutation.mutate({ id: confirmAction.id, status: 'Scheduled' });
      } else if (confirmAction.action === 'delete') {
        deleteMutation.mutate(confirmAction.id);
      }
    }
  };

  // Filter handlers
  const toggleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? undefined : status,
    }));
    setCurrentPage(1);
  };

  const setShowDateFilter = (showDate: 'newest' | 'oldest' | null) => {
    setFilters((prev) => ({
      ...prev,
      showDate,
    }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
    }));
    setCurrentPage(1);
  };

  const handleTheaterFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      theaterId: e.target.value || undefined,
    }));
    setCurrentPage(1);
  };

  const handleMovieFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      movieId: e.target.value || undefined,
    }));
    setCurrentPage(1);
  };

  const handleScreenFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      screenId: e.target.value || undefined,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      theaterId: undefined,
      movieId: undefined,
      screenId: undefined,
      status: undefined,
      showDate: null,
      search: '',
    });
    setCurrentPage(1);
  };

  const formatDate = (date: string | Date) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(date));
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (date: string | Date) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(date));
    } catch {
      return 'Invalid Time';
    }
  };

  const renderStatusBadge = (status: string) => {
    const bgColor =
      status === 'Scheduled'
        ? 'bg-blue-500'
        : status === 'Running'
        ? 'bg-green-500'
        : status === 'Completed'
        ? 'bg-gray-500'
        : status === 'Cancelled'
        ? 'bg-red-500'
        : 'bg-gray-600';
    const textColor = 'text-white';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Show Management</h1>
            <div className="relative">
              <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search shows..."
                  className="bg-transparent text-white outline-none w-64"
                  value={filters.search || ''}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-gray-800 rounded-xl mb-8 shadow-lg">
            <div className="flex flex-wrap items-center p-2">
              <button
                onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                className={`flex items-center p-3 rounded-lg mr-2 transition-all ${
                  isFilterDrawerOpen ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Filter className="w-5 h-5 mr-2" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <div className="relative group mx-1">
                <button
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    filters.showDate ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>
                    {filters.showDate
                      ? filters.showDate === 'newest'
                        ? 'Newest First'
                        : 'Oldest First'
                      : 'Show Date'}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => setShowDateFilter('newest')}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${
                      filters.showDate === 'newest' ? 'text-orange-500' : 'text-gray-300'
                    }`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => setShowDateFilter('oldest')}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${
                      filters.showDate === 'oldest' ? 'text-orange-500' : 'text-gray-300'
                    }`}
                  >
                    Oldest First
                  </button>
                </div>
              </div>
              <div className="relative group mx-1">
                <button
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    filters.status ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Tag className="w-5 h-5 mr-2" />
                  <span>Status {filters.status && '(1)'}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {statusOptions.map((status) => (
                    <label
                      key={status}
                      className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.status === status}
                        onChange={() => toggleStatusFilter(status)}
                        className="mr-2 accent-orange-500"
                      />
                      <span className={filters.status === status ? 'text-orange-500' : 'text-gray-300'}>
                        {status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={resetFilters}
                className={`flex items-center p-3 rounded-lg ml-auto ${
                  activeFilterCount > 0 ? 'text-orange-500' : 'text-gray-500'
                }`}
                disabled={activeFilterCount === 0}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset Filters
              </button>
            </div>
            <AnimatePresence>
              {isFilterDrawerOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-gray-700"
                >
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-3">Additional Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-gray-300 block mb-1">Theater</label>
                        <select
                          value={filters.theaterId || ''}
                          onChange={handleTheaterFilterChange}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 outline-none"
                        >
                          <option value="">Select Theater</option>
                          {theaterOptions.map((theater) => (
                            <option key={theater._id} value={theater._id}>
                              {theater.name || 'Unknown Theater'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-300 block mb-1">Movie</label>
                        <select
                          value={filters.movieId || ''}
                          onChange={handleMovieFilterChange}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 outline-none"
                        >
                          <option value="">Select Movie</option>
                          {movieOptions.map((movie) => (
                            <option key={movie._id} value={movie._id}>
                              {movie.name || 'Unknown Movie'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-300 block mb-1">Screen</label>
                        <select
                          value={filters.screenId || ''}
                          onChange={handleScreenFilterChange}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 outline-none"
                        >
                          <option value="">Select Screen</option>
                          {screenOptions.map((screen) => (
                            <option key={screen._id} value={screen._id}>
                              {screen.name || 'Unknown Screen'}
                            </option>
                          ))}
                        </select>
                      </div>
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

          {/* Show Table */}
          <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900/50 text-left">
                    <th className="p-4 text-gray-400 font-medium">No</th>
                    <th className="p-4 text-gray-400 font-medium">Movie</th>
                    <th className="p-4 text-gray-400 font-medium">Theater</th>
                    <th className="p-4 text-gray-400 font-medium">Screen</th>
                    <th className="p-4 text-gray-400 font-medium">Date</th>
                    <th className="p-4 text-gray-400 font-medium">Start Time</th>
                    <th className="p-4 text-gray-400 font-medium">Status</th>
                    <th className="p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => <ShimmerRow key={index} />)
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-red-400">
                        Error loading shows: {(error as Error).message}
                      </td>
                    </tr>
                  ) : normalizedShows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-gray-400 text-5xl mb-4">🎬</div>
                          <h3 className="text-white text-xl font-bold mb-2">No shows found</h3>
                          <p className="text-gray-400 mb-6">
                            We couldn't find any shows matching your filter criteria
                          </p>
                          <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                      [...normalizedShows]
                        .map((show: Show, index: number) => {
                      const uniqueKey = show.id || `${index}-${show.movieId?._id || 'no-movie'}-${show.showDate || 'no-date'}`;
                      return (
                        <motion.tr
                          key={uniqueKey}
                          className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="p-4 text-gray-300">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                          <td className="p-4 text-gray-300">{show.movieId?.name || show.movieId?._id || 'Unknown'}</td>
                          <td className="p-4 text-gray-300">{show.theaterId?.name || show.theaterId?._id || 'Unknown'}</td>
                          <td className="p-4 text-gray-300">{show.screenId?.name || show.screenId?._id || 'Unknown'}</td>
                          <td className="p-4 text-gray-300">{formatDate(show.showDate)}</td>
                          <td className="p-4 text-gray-300">{formatTime(show.startTime)}</td>
                          <td className="p-4">{renderStatusBadge(show.status)}</td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewShow(show.id)}
                                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                disabled={!show.id}
                              >
                                View Details
                              </button>
                              {(show.status === 'Scheduled' || show.status === 'Running') && (
                                <button
                                  onClick={() => handleCancelShow(show.id)}
                                  className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                                  disabled={!show.id}
                                >
                                  Cancel
                                </button>
                              )}
                              {show.status === 'Cancelled' && (
                                <button
                                  onClick={() => handleRevertShow(show.id)}
                                  className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                                  disabled={!show.id}
                                >
                                  Schedule
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteShow(show.id)}
                                className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                                disabled={!show.id}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6">
              <div className="flex items-center bg-gray-800 rounded-lg shadow-lg p-2 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentPage === 1
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                  Previous
                </button>
                {totalPages <= 5 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))
                ) : (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === 1
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      1
                    </button>
                    {currentPage > 3 && <span className="px-3 py-2 text-gray-500">...</span>}
                    {currentPage > 2 && (
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
                      >
                        {currentPage - 1}
                      </button>
                    )}
                    {currentPage !== 1 && currentPage !== totalPages && (
                      <button className="px-4 py-2 rounded-lg bg-orange-600 text-white">
                        {currentPage}
                      </button>
                    )}
                    {currentPage < totalPages - 1 && (
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
                      >
                        {currentPage + 1}
                      </button>
                    )}
                    {currentPage < totalPages - 2 && (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className={`px-4 py-2 rounded-lg ${
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentPage === totalPages
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Next
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>
              </div>
              <div className="ml-4 text-gray-400 text-sm">
                Page {currentPage} of {totalPages} ({totalPages - currentPage} pages remaining)
              </div>
            </div>
          )}

          {/* Results count info */}
          {!isLoading && normalizedShows.length > 0 && (
            <div className="mt-4 me-40 text-gray-400 text-sm text-center">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalShows)} of {totalShows} shows
            </div>
          )}

          {/* Show modal */}
          {selectedShow && (
            <ShowViewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} show={selectedShow} />
          )}

          {/* Confirmation modal */}
          {confirmAction && (
            <ConfirmationModal
              isOpen={isConfirmModalOpen}
              onClose={() => setIsConfirmModalOpen(false)}
              onConfirm={confirmActionHandler}
              title={
                confirmAction.action === 'cancel'
                  ? 'Cancel Show'
                  : confirmAction.action === 'revert'
                  ? 'Revert Show'
                  : 'Delete Show'
              }
              message={confirmAction.message}
              confirmText={
                confirmAction.action === 'cancel'
                  ? 'Cancel Show'
                  : confirmAction.action === 'revert'
                  ? 'Revert to Scheduled'
                  : 'Delete'
              }
              type={confirmAction.action === 'cancel' ? 'danger' : confirmAction.action === 'revert' ? 'success' : 'warning'}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default ShowManagement;