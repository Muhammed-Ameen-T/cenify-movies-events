import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import { Search, Filter, Eye, Edit, Trash2, ChevronDown, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import BackButton from '../../components/Buttons/BackButton';
import ConfirmationModal from '../../components/Admin/ConfirmationModal';
import CreateRecurringShowModal from '../../components/Vendor/ReccuringShowModal'; 
import { fetchShowsByVendor, deleteShow, updateShowStatus, createReccuringShow } from '../../services/Vendor/showApi';
import { Show } from '../../types/show';
import { useNavigate, useLocation } from 'react-router-dom';
import { debounce } from 'lodash';
import 'react-toastify/dist/ReactToastify.css';
import qs from 'query-string';

// Lazy-loaded modal
const ViewShowModal = React.lazy(() => import('../../components/Vendor/ViewShowModal'));

const ShowManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Initialize filters from URL query parameters
  const initialFilters = useMemo(() => {
    const parsed = qs.parse(location.search);
    return {
      search: (parsed.search as string) || '',
      status: (parsed.status as string) || '',
      sortBy: (parsed.sortBy as string) || 'showDate',
      sortOrder: (parsed.sortOrder as 'asc' | 'desc') || 'desc',
    };
  }, [location.search]);

  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(() => {
    const parsed = qs.parse(location.search);
    return Number(parsed.page) || 1;
  });
  const [pageSize, setPageSize] = useState(() => {
    const parsed = qs.parse(location.search);
    return Number(parsed.limit) || 10;
  });
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [showToDelete, setShowToDelete] = useState<Show | null>(null);
  const [showToCancel, setShowToCancel] = useState<Show | null>(null);
  const [showToReschedule, setShowToReschedule] = useState<Show | null>(null);
  const [showToRecur, setShowToRecur] = useState<Show | null>(null); // State for recurring show
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Update URL with filters and pagination
  useEffect(() => {
    const query = {
      page: currentPage.toString(),
      limit: pageSize.toString(),
      search: filters.search || undefined,
      status: filters.status || undefined,
      sortBy: filters.sortBy || undefined,
      sortOrder: filters.sortOrder || undefined,
    };
    navigate(
      {
        pathname: location.pathname,
        search: qs.stringify(query, { skipEmptyString: true, skipNull: true }),
      },
      { replace: true }
    );
  }, [filters, currentPage, pageSize, navigate, location.pathname]);

  // Debounced search handler
  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 300),
    []
  );

  // Fetch shows
  const { data, isLoading, error } = useQuery({
    queryKey: ['shows', currentPage, pageSize, filters],
    queryFn: () =>
      fetchShowsByVendor({
        page: currentPage,
        limit: pageSize,
        search: filters.search || undefined,
        status: filters.status || undefined,
        sortBy: filters.sortBy || undefined,
        sortOrder: filters.sortOrder || undefined,
      }),
    keepPreviousData: true,
    retry: 2,
  });

  // Delete show mutation
  const deleteMutation = useMutation({
    mutationFn: (showId: string) => deleteShow(showId),
    onSuccess: (_, showId) => {
      toast.success('Show deleted successfully');
      queryClient.setQueryData(
        ['shows', currentPage, pageSize, filters],
        (oldData: { shows: Show[]; totalCount: number; totalPages: number } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            shows: oldData.shows.filter((show) => show._id !== showId),
            totalCount: oldData.totalCount - 1,
            totalPages: Math.ceil((oldData.totalCount - 1) / pageSize),
          };
        }
      );
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete show');
    },
  });

  // Status update mutation (for both cancel and reschedule)
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateShowStatus(id, status),
    onSuccess: (updatedShow) => {
      const action = updatedShow.status === 'Cancelled' ? 'cancelled' : 'rescheduled';
      toast.success(`Show ${action} successfully`);
      queryClient.setQueryData(
        ['shows', currentPage, pageSize, filters],
        (oldData: { shows: Show[]; totalCount: number; totalPages: number } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            shows: oldData.shows.map((show) =>
              show._id === updatedShow._id ? { ...show, status: updatedShow.status } : show
            ),
          };
        }
      );
      setShowToCancel(null);
      setShowToReschedule(null);
      setDropdownOpen(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update show status');
    },
  });

  // Create recurring show mutation
  const recurringShowMutation = useMutation({
    mutationFn: ({ showId, startDate, endDate }: { showId: string; startDate: string; endDate: string }) =>
      createReccuringShow({ showId, startDate: new Date(startDate), endDate: new Date(endDate) }),
    onSuccess: () => {
      toast.success('Recurring shows created successfully');
      queryClient.invalidateQueries(['shows', currentPage, pageSize, filters]);
      setShowToRecur(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create recurring shows');
    },
  });

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (name === 'search') {
        debouncedSetSearch(value);
      } else {
        setFilters((prev) => ({ ...prev, [name]: value }));
      }
      setCurrentPage(1);
    },
    [debouncedSetSearch]
  );

  const handleSortChange = useCallback(
    (sortBy: string) => {
      setFilters((prev) => ({
        ...prev,
        sortBy,
        sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      }));
      setCurrentPage(1);
    },
    []
  );

  const handleView = useCallback((show: Show) => {
    setSelectedShow(show);
    setDropdownOpen(null);
  }, []);

  const handleEdit = useCallback(
    (show: Show) => {
      navigate(`/vendor/update-show/${show._id}`);
      setDropdownOpen(null);
    },
    [navigate]
  );

  const handleDelete = useCallback((show: Show) => {
    setShowToDelete(show);
    setDropdownOpen(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (showToDelete) {
      deleteMutation.mutate(showToDelete._id);
      setShowToDelete(null);
    }
  }, [showToDelete, deleteMutation]);

  const handleCancel = useCallback((show: Show) => {
    setShowToCancel(show);
    setDropdownOpen(null);
  }, []);

  const confirmCancel = useCallback(() => {
    if (showToCancel) {
      statusMutation.mutate({ id: showToCancel._id, status: 'Cancelled' });
    }
  }, [showToCancel, statusMutation]);

  const handleReschedule = useCallback((show: Show) => {
    setShowToReschedule(show);
    setDropdownOpen(null);
  }, []);

  const confirmReschedule = useCallback(() => {
    if (showToReschedule) {
      statusMutation.mutate({ id: showToReschedule._id, status: 'Scheduled' });
    }
  }, [showToReschedule, statusMutation]);

  const handleRecur = useCallback((show: Show) => {
    setShowToRecur(show);
    setDropdownOpen(null);
  }, []);

  const confirmRecur = useCallback(
    (startDate: string, endDate: string) => {
      if (showToRecur) {
        recurringShowMutation.mutate({ showId: showToRecur._id, startDate, endDate });
      }
    },
    [showToRecur, recurringShowMutation]
  );

  const toggleDropdown = useCallback((showId: string) => {
    setDropdownOpen((prev) => (prev === showId ? null : showId));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  const shows = useMemo(() => data?.shows || [], [data]);
  const totalCount = useMemo(() => data?.totalCount || 0, [data]);
  const totalPages = useMemo(
    () => data?.totalPages || Math.ceil(totalCount / pageSize),
    [data, totalCount, pageSize]
  );

  // Handle modal close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedShow(null);
        setShowToDelete(null);
        setShowToCancel(null);
        setShowToReschedule(null);
        setShowToRecur(null);
        setDropdownOpen(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <BackButton />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Show Management</h1>
        <Button
          variant="primary"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md"
          onClick={() => navigate('/vendor/create-show')}
          aria-label="Add new show"
        >
          Add Show
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-6 bg-gray-900/80 backdrop-blur-xl border border-gray-700/30 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Filter className="mr-2 text-purple-400" size={20} />
            Filter Shows
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="text-sm font-medium text-gray-300 mb-1 block">
              Search by Movie, Theater, or Screen
            </label>
            <Search className="absolute left-3 top-9 text-gray-400" size={18} />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-gray-500"
              placeholder="Search shows..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full pl-4 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Running">Running</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Show Table */}
      <Card className="p-6 bg-gray-900/80 backdrop-blur-xl border border-gray-700/30 rounded-2xl shadow-xl">
        {isLoading ? (
          <div className="text-center text-gray-400 py-6">Loading shows...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-6">
            Failed to load shows: {(error as any).message || 'An error occurred'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-white">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">No.</th>
                    <th
                      className="py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer"
                      onClick={() => handleSortChange('movieId.name')}
                    >
                      Movie Title {filters.sortBy === 'movieId.name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer"
                      onClick={() => handleSortChange('theaterId.name')}
                    >
                      Theater {filters.sortBy === 'theaterId.name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Screen</th>
                    <th
                      className="py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer"
                      onClick={() => handleSortChange('showDate')}
                    >
                      Date {filters.sortBy === 'showDate' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Show Time</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {shows.map((show:Show, index:number) => (
                      <motion.tr
                        key={show._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors duration-200"
                      >
                        <td className="py-3 px-4 text-sm">{(currentPage - 1) * pageSize + index + 1}</td>
                        <td className="py-3 px-4 text-sm">{show.movieId?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm">{show.theaterId?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm">{show.screenId?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(show.showDate).toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(show.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          }) || 'N/A'}{' '}
                          -{' '}
                          {new Date(show.endTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          }) || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm relative">
                          <button
                            onClick={() => toggleDropdown(show._id)}
                            className={`flex items-center px-2 py-1 rounded-full text-xs cursor-pointer ${
                              show.status === 'Running'
                                ? 'bg-green-600/20 text-green-300'
                                : show.status === 'Scheduled'
                                ? 'bg-blue-600/20 text-blue-300'
                                : show.status === 'Completed'
                                ? 'bg-gray-600/20 text-gray-300'
                                : 'bg-red-600/20 text-red-300'
                            }`}
                            aria-label={`Toggle status options for ${show.movieId?.name || 'show'}`}
                          >
                            {show.status}
                            {show.status !== 'Completed' && <ChevronDown className="ml-1" size={14} />}
                          </button>
                          <AnimatePresence>
                            {dropdownOpen === show._id && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute z-10 mt-1 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-lg"
                              >
                                {(show.status === 'Scheduled' || show.status === 'Running') && (
                                  <button
                                    onClick={() => handleCancel(show)}
                                    className="w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors text-left"
                                    aria-label={`Cancel ${show.movieId?.name || 'show'}`}
                                  >
                                    Cancel Show
                                  </button>
                                )}
                                {show.status === 'Cancelled' && (
                                  <button
                                    onClick={() => handleReschedule(show)}
                                    className="w-full px-4 py-2 text-sm text-blue-400 hover:bg-gray-700 hover:text-blue-300 transition-colors text-left"
                                    aria-label={`Reschedule ${show.movieId?.name || 'show'}`}
                                  >
                                    Reschedule Show
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                        <td className="py-3 px-4 text-sm flex space-x-2">
                          <button
                            onClick={() => handleView(show)}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            title="View show details"
                            aria-label={`View details for ${show.movieId?.name || 'show'}`}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(show)}
                            className={`transition-colors ${
                              show.status === 'Scheduled'
                                ? 'text-yellow-400 hover:text-yellow-300'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title="Edit show"
                            aria-label={`Edit ${show.movieId?.name || 'show'}`}
                            disabled={show.status !== 'Scheduled'}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(show)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete show"
                            aria-label={`Delete ${show.movieId?.name || 'show'}`}
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={() => handleRecur(show)}
                            className={`transition-colors ${
                              show.status === 'Scheduled'
                                ? 'text-purple-400 hover:text-purple-300'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title="Create recurring shows"
                            aria-label={`Create recurring shows for ${show.movieId?.name || 'show'}`}
                            disabled={show.status !== 'Scheduled'}
                          >
                            <Repeat size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {shows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-gray-400">
                        No shows found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Show</span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="pl-2 pr-8 py-1 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  aria-label="Select number of entries per page"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-400">of {totalCount} entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all duration-200"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === page
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800/50 border border-gray-700 text-white hover:bg-gray-700'
                    } transition-all duration-200`}
                    aria-label={`Go to page ${page}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all duration-200"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* View Modal */}
      <React.Suspense fallback={<div className="text-center text-gray-400">Loading...</div>}>
        <AnimatePresence>
          {selectedShow && (
            <ViewShowModal show={selectedShow} onClose={() => setSelectedShow(null)} />
          )}
        </AnimatePresence>
      </React.Suspense>

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={!!showToDelete}
        onClose={() => setShowToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Show"
        message={`Are you sure you want to delete the show "${showToDelete?.movieId?.name || 'this show'}" on ${showToDelete ? new Date(showToDelete.showDate).toLocaleDateString() : ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Confirmation Modal for Cancellation */}
      <ConfirmationModal
        isOpen={!!showToCancel}
        onClose={() => setShowToCancel(null)}
        onConfirm={confirmCancel}
        title="Cancel Show"
        message={`Are you sure you want to cancel the show "${showToCancel?.movieId?.name || 'this show'}" on ${showToCancel ? new Date(showToCancel.showDate).toLocaleDateString() : ''}? You can reschedule it later by editing the show or using the status dropdown.`}
        confirmText="Cancel Show"
        cancelText="Keep Show"
        type="danger"
      />

      {/* Confirmation Modal for Rescheduling */}
      <ConfirmationModal
        isOpen={!!showToReschedule}
        onClose={() => setShowToReschedule(null)}
        onConfirm={confirmReschedule}
        title="Reschedule Show"
        message={`Are you sure you want to reschedule the show "${showToReschedule?.movieId?.name || 'this show'}" on ${showToReschedule ? new Date(showToReschedule.showDate).toLocaleDateString() : ''}? This will set the status to Scheduled.`}
        confirmText="Reschedule Show"
        cancelText="Keep Cancelled"
        type="info"
      />

      {/* Recurring Show Modal */}
      <React.Suspense fallback={<div className="text-center text-gray-400">Loading...</div>}>
        <AnimatePresence>
          {showToRecur && (
            <CreateRecurringShowModal
              show={showToRecur}
              onClose={() => setShowToRecur(null)}
              onConfirm={confirmRecur}
            />
          )}
        </AnimatePresence>
      </React.Suspense>
    </div>
  );
};

export default memo(ShowManagement);