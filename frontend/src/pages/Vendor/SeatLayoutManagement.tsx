import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import { Search, Filter, Eye, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import BackButton from '../../components/Buttons/BackButton';
import { fetchSeatLayouts, findSeatLayoutById } from '../../services/Vendor/seatLayoutApi';
import { SeatLayoutResponse } from '../../types/seatLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { debounce } from 'lodash';
import 'react-toastify/dist/ReactToastify.css';
import qs from 'query-string';

// Lazy-loaded modal
const ViewSeatLayoutModal = React.lazy(() => import('../../components/Vendor/ViewSeatLayoutModal'));

interface FetchSeatLayoutsResponse {
  seatLayouts: SeatLayoutResponse[];
  totalCount: number;
}

const SeatLayoutManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Initialize filters from URL query parameters
  const initialFilters = useMemo(() => {
    const parsed = qs.parse(location.search);
    return {
      search: (parsed.search as string) || '',
      sortBy: (parsed.sortBy as string) || 'createdAt',
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
  const [selectedLayout, setSelectedLayout] = useState<SeatLayoutResponse | null>(null);

  // Update URL with filters and pagination, excluding empty filters
  useEffect(() => {
    const query = {
      page: currentPage.toString(),
      limit: pageSize.toString(),
      search: filters.search || undefined,
      sortBy: filters.sortBy !== 'createdAt' ? filters.sortBy : undefined,
      sortOrder: filters.sortOrder !== 'desc' ? filters.sortOrder : undefined,
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

  // Fetch seat layouts
  const { data, isLoading, error } = useQuery<FetchSeatLayoutsResponse>({
    queryKey: ['seatLayouts', currentPage, pageSize, filters],
    queryFn: () =>
      fetchSeatLayouts({
        page: currentPage,
        limit: pageSize,
        search: filters.search || undefined,
        sortBy: filters.sortBy || undefined,
        sortOrder: filters.sortOrder || undefined,
      }),
    keepPreviousData: true,
    retry: 2,
    onError: (err: any) => {
      toast.error(err.message || 'Failed to load seat layouts');
    },
  });
  console.log('🚀 ~ data:', data);

  const layouts = useMemo(() => data?.seatLayouts || [], [data]);
  const totalCount = useMemo(() => data?.totalCount || 0, [data]);
  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (name === 'search') {
        debouncedSetSearch(value);
      } else {
        setFilters((prev) => ({ ...prev, [name]: value }));
        setCurrentPage(1);
      }
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

  const handleView = useCallback(async (layoutId: string) => {
    try {
      const layout = await findSeatLayoutById(layoutId);
      setSelectedLayout(layout);
    } catch (error) {
      toast.error('Failed to load seat layout details');
    }
  }, []);

  const handleEdit = useCallback(
    (layout: SeatLayoutResponse) => {
      navigate(`/vendor/update-seats/${layout._id}`);
    },
    [navigate]
  );

  const handleClearFilters = useCallback(() => {
    setFilters({ search: '', sortBy: 'createdAt', sortOrder: 'desc' });
    setCurrentPage(1);
    navigate('/vendor/seat-layouts');
  }, [navigate]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  // Handle modal close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedLayout(null);
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
        <h1 className="text-3xl font-bold text-white tracking-tight">Seat Layout Management</h1>
        <Button
          variant="primary"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md"
          onClick={() => navigate('/vendor/create-seats')}
          aria-label="Create new seat layout"
        >
          Create New Layout
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-6 bg-gray-900/80 backdrop-blur-xl border border-gray-700/30 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Filter className="mr-2 text-purple-400" size={20} />
            Filter Seat Layouts
          </h3>
          <Button
            variant="secondary"
            className="text-sm text-gray-400 hover:text-gray-300"
            onClick={handleClearFilters}
            aria-label="Clear all filters"
          >
            Clear Filters
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="text-sm font-medium text-gray-300 mb-1 block">
              Search by Layout Name
            </label>
            <Search className="absolute left-3 top-9 text-gray-400" size={18} />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-gray-500"
              placeholder="Search layouts..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Sort By</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full pl-4 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="layoutName">Layout Name</option>
              <option value="capacity">Capacity</option>
              <option value="createdAt">Created At</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Layout Table */}
      <Card className="p-6 bg-gray-900/80 backdrop-blur-xl border border-gray-700/30 rounded-2xl shadow-xl">
        {isLoading ? (
          <div className="text-center text-gray-400 py-6">Loading layouts...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-6">
            Failed to load layouts: {(error as any).message || 'An error occurred'}
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
                      onClick={() => handleSortChange('layoutName')}
                    >
                      Layout Name {filters.sortBy === 'layoutName' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer"
                      onClick={() => handleSortChange('capacity')}
                    >
                      Capacity {filters.sortBy === 'capacity' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Rows × Columns</th>
                    <th
                      className="py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer"
                      onClick={() => handleSortChange('createdAt')}
                    >
                      Created At {filters.sortBy === 'createdAt' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {layouts.map((layout, index) => (
                      <motion.tr
                        key={layout._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors duration-200"
                      >
                        <td className="py-3 px-4 text-sm">{(currentPage - 1) * pageSize + index + 1}</td>
                        <td className="py-3 px-4 text-sm">{layout.layoutName || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm">{layout.capacity || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm">{`${layout.rowCount} × ${layout.columnCount}`}</td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(layout.createdAt).toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm flex space-x-2">
                          <button
                            onClick={() => handleView(layout._id)}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            title={`View details for ${layout.layoutName || 'layout'}`}
                            aria-label={`View details for ${layout.layoutName || 'layout'}`}
                          >
                            <Eye size={18} />
                          </button>
                          {/* <button
                            onClick={() => handleEdit(layout)}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                            title={`Edit ${layout.layoutName || 'layout'}`}
                            aria-label={`Edit ${layout.layoutName || 'layout'}`}
                          >
                            <Edit size={18} />
                          </button> */}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {layouts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-400">
                        No seat layouts found
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
                  className="pl-2 pr-8 py-1 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm9156 focus:ring-2 focus:ring-purple-500 transition-all duration-200"
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
          {selectedLayout && (
            <ViewSeatLayoutModal layout={selectedLayout} onClose={() => setSelectedLayout(null)} />
          )}
        </AnimatePresence>
      </React.Suspense>
    </div>
  );
};

export default memo(SeatLayoutManagement);