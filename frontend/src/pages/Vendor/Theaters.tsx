import React, { useState, useMemo, useCallback, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import { Search, Filter, Edit, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import BackButton from '../../components/Buttons/BackButton';
import { fetchTheatersByVendor, updateTheater } from '../../services/Vendor/theaterApi';
import { Theater, theaterUpdateSchema, TheaterUpdateFormData } from '../../types/theater';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import 'react-toastify/dist/ReactToastify.css';
import { debounce } from 'lodash';

// Lazy-loaded modals to reduce initial load
const ViewTheaterModal = React.lazy(() => import('../../components/Vendor/ViewTheaterModal'));
const UpdateTheaterModal = React.lazy(() => import('../../components/Vendor/UpdateTheaterModal'));

const TheaterManagement: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    status: [] as string[],
    location: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingTheater, setEditingTheater] = useState<Theater | null>(null);

  const vendorId = '68136be091d98d82eb9e9947';

  // Debounced search handler
  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => {
      setFilters((prev) => ({ ...prev, search: value }));
      setCurrentPage(1);
    }, 300),
    []
  );

  // Fetch theaters
  const { data, isLoading, error } = useQuery({
    queryKey: ['theaters', vendorId, currentPage, pageSize, filters],
    queryFn: () =>
      fetchTheatersByVendor({
        vendorId,
        page: currentPage,
        limit: pageSize,
        search: filters.search || undefined,
        status: filters.status.length > 0 ? filters.status : undefined,
        location: filters.location || undefined,
        sortBy: filters.sortBy || undefined,
        sortOrder: filters.sortOrder || undefined,
      }),
    keepPreviousData: true,
    retry: 2,
  });

  // Update theater mutation
  const updateTheaterMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TheaterUpdateFormData }) => updateTheater(id, data),
    onSuccess: () => {
      toast.success('Theater updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['theaters', vendorId] });
      setIsUpdateModalOpen(false);
      setEditingTheater(null);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update theater'),
  });

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { name: string; value: any }) => {
      if ('target' in e) {
        const { name, value } = e.target;
        if (name === 'search') {
          debouncedSetSearch(value);
        } else {
          setFilters((prev) => ({ ...prev, [name]: value }));
        }
      } else {
        setFilters((prev) => ({ ...prev, [e.name]: e.value }));
      }
      setCurrentPage(1);
    },
    [debouncedSetSearch]
  );

  const handleStatusChange = useCallback(
    (status: string) => {
      const newStatuses = filters.status.includes(status)
        ? filters.status.filter((s) => s !== status)
        : [...filters.status, status];
      handleFilterChange({ name: 'status', value: newStatuses });
    },
    [filters.status, handleFilterChange]
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

  const handleView = useCallback((theater: Theater) => {
    setSelectedTheater(theater);
  }, []);

  const handleEdit = useCallback((theater: Theater) => {
    setEditingTheater(theater);
    setIsUpdateModalOpen(true);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  const theaters = useMemo(() => data?.theaters || [], [data]);
  const totalCount = useMemo(() => data?.totalCount || 0, [data]);
  const totalPages = useMemo(
    () => data?.totalPages || Math.ceil(totalCount / pageSize),
    [data, totalCount, pageSize]
  );

  // Handle modal close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTheater(null);
        setIsUpdateModalOpen(false);
        setEditingTheater(null);
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
        <h1 className="text-3xl font-bold text-white">Theater Management</h1>
        <Button
          variant="primary"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
          onClick={() => navigate('/vendor/create-theater')}
          aria-label="Add new theater"
        >
          Add Theater
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-6 bg-gray-900/90 backdrop-blur-xl border border-gray-700/30 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Filter className="mr-2 text-indigo-400" size={20} />
            Advanced Filters
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <label className="text-sm font-medium text-gray-300 mb-1 block">Search by Name</label>
            <Search className="absolute left-3 top-9 text-gray-400" size={18} />
            <input
              type="text"
              name="search"
              defaultValue={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-500"
              placeholder="Search theaters..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Location (City)</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full pl-4 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-500"
              placeholder="Enter city..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Sort By</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full pl-4 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="createdAt">Created At</option>
              <option value="name">Name</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Theater Table */}
      <Card className="p-6 bg-gray-900/90 backdrop-blur-xl border border-gray-700/30 rounded-2xl shadow-xl">
        {isLoading ? (
          <div className="text-center text-gray-400 py-6">Loading theaters...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-6">
            Failed to load theaters: {(error as any).message || 'An error occurred'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-white">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">No.</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Theater Name</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">City</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Created At</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {theaters.map((theater, index) => (
                      <motion.tr
                        key={theater._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors duration-200"
                      >
                        <td className="py-3 px-4 text-sm">{(currentPage - 1) * pageSize + index + 1}</td>
                        <td className="py-3 px-4 text-sm">{theater.name}</td>
                        <td className="py-3 px-4 text-sm">{theater.location.city}</td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(theater.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              theater.status === 'verified'
                                ? 'bg-green-500/20 text-green-400'
                                : theater.status === 'verifying'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {theater.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm flex space-x-2">
                          <button
                            onClick={() => handleEdit(theater)}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                            title="Edit theater"
                            aria-label={`Edit ${theater.name}`}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleView(theater)}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            title="View theater details"
                            aria-label={`View details for ${theater.name}`}
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {theaters.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-400">
                        No theaters found
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
                  className="pl-2 pr-2 py-1 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
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
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800/50 border border-gray-700 text-white hover:bg-gray-700'
                    } transition-all duration-200`}
                    aria-label={`Go to page ${page}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
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

      {/* Modals */}
      <React.Suspense fallback={<div className="text-center text-gray-400">Loading...</div>}>
        <AnimatePresence>
          {selectedTheater && (
            <ViewTheaterModal
              theater={selectedTheater}
              onClose={() => setSelectedTheater(null)}
            />
          )}
          {isUpdateModalOpen && editingTheater && (
            <UpdateTheaterModal
              theater={editingTheater}
              onClose={() => {
                setIsUpdateModalOpen(false);
                setEditingTheater(null);
              }}
              onSubmit={(data) =>
                updateTheaterMutation.mutate({ id: editingTheater._id, data })
              }
              isLoading={updateTheaterMutation.isLoading}
            />
          )}
        </AnimatePresence>
      </React.Suspense>
    </div>
  );
};

export default memo(TheaterManagement);