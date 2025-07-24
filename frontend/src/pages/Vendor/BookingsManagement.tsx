import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Calendar, Tag, XCircle, Eye } from 'lucide-react';
import {  AnimatePresence } from 'framer-motion';
import AdvancedFilterWithHeader from '../../components/VendorCommon/Filter';
import DataTableWithPagination from '../../components/VendorCommon/Table';
import BookingDetailsModal from '../../components/Admin/BookingViewModal';
import CancelConfirmationModal from '../../components/Admin/BookingCancelConfirmationModal'; // Updated import
import { fetchVendorBookings, BookingService } from '../../services/User/bookingApi';
import { CreateBookingResponse } from '../../types/booking';
import { formatRelativeTime } from '../../utils/timeFormator';
import BackButton from '../../components/Buttons/BackButton';
import 'react-toastify/dist/ReactToastify.css';
import { Booking } from '../../types/bookingResponse';

const ITEMS_PER_PAGE = 5;

type FilterOptions = {
  status: string[];
  bookingDate: 'newest' | 'oldest' | null;
  search: string;
};

const VendorBookings: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // States
  const [selectedBooking, setSelectedBooking] = useState<CreateBookingResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    bookingDate: null,
    search: '',
  });

  console.log(isCancelModalOpen)

  // Fetch bookings
  const { data, isLoading, error } = useQuery({
    queryKey: ['vendorBookings', currentPage, filters],
    queryFn: () =>
      fetchVendorBookings({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: filters.status.length ? filters.status : undefined,
        sortBy: filters.bookingDate ? 'createdAt' : undefined,
        sortOrder: filters.bookingDate === 'newest' ? 'desc' : filters.bookingDate === 'oldest' ? 'asc' : undefined,
        search: filters.search || undefined,
      }),
    placeholderData: (previousData) => previousData, 
    retry: 2,
  });

  const bookings = useMemo(() => data?.bookings || [], [data]);
  const totalBookings = useMemo(() => data?.totalCount || 0, [data]);
  const totalPages = useMemo(
    () => data?.totalPages || Math.ceil(totalBookings / ITEMS_PER_PAGE),
    [data, totalBookings]
  );

  // Mutation for cancelling a booking
  // const cancelMutation = useMutation({
  //   mutationFn: ({ id, reason }: { id: string; reason: string }) =>
  //     BookingService.cancelBooking(id, reason),
  //   onSuccess: () => {
  //     toast.success('Booking cancelled successfully!');
  //     queryClient.invalidateQueries({ queryKey: ['vendorBookings'] });
  //     setIsCancelModalOpen(false);
  //     setBookingToCancel(null);
  //   },
  //   onError: (error: any) => {
  //     toast.error(error.message || 'Failed to cancel booking');
  //   },
  // });
  

  // Update URL with filters and pagination
  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (currentPage > 1) queryParams.set('page', currentPage.toString());
    if (filters.status.length) queryParams.set('status', filters.status.join(','));
    if (filters.bookingDate) queryParams.set('bookingDate', filters.bookingDate);
    if (filters.search) queryParams.set('search', filters.search);

    navigate(
      {
        pathname: location.pathname,
        search: queryParams.toString() ? `?${queryParams.toString()}` : '',
      },
      { replace: true }
    );
  }, [filters, currentPage, location.pathname, navigate]);

  // Load filters from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newFilters: FilterOptions = {
      status: [],
      bookingDate: null,
      search: '',
    };

    if (searchParams.has('page')) setCurrentPage(Number(searchParams.get('page')));
    if (searchParams.has('status')) newFilters.status = searchParams.get('status')!.split(',');
    if (searchParams.has('bookingDate')) newFilters.bookingDate = searchParams.get('bookingDate') as 'newest' | 'oldest';
    if (searchParams.has('search')) newFilters.search = searchParams.get('search')!;

    setFilters(newFilters);
  }, [location.search]);

  // Handlers
  const handleViewBooking = useCallback((booking: CreateBookingResponse) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  }, []);

  const handleCancelBooking = useCallback((booking: Booking) => {
    setBookingToCancel(booking.bookingId);
    setIsCancelModalOpen(true);
  }, []);

  const handleFilterChange = useCallback(
    (value: any, name: string) => {
      setFilters((prev) => ({ ...prev, [name]: value }));
      setCurrentPage(1);
    },
    []
  );

  const handleSortChange = useCallback(
    (sortBy: string) => {
      console.log(sortBy)
      setFilters((prev) => ({
        ...prev,
        bookingDate: prev.bookingDate === 'newest' ? 'oldest' : 'newest',
      }));
      setCurrentPage(1);
    },
    []
    
  );

  const resetFilters = useCallback(() => {
    setFilters({
      status: [],
      bookingDate: null,
      search: '',
    });
    setCurrentPage(1);
  }, []);

  // Active filter count
  const activeFilterCount = useMemo(
    () =>
      [
        filters.status.length > 0,
        filters.bookingDate !== null,
        filters.search !== '',
      ].filter(Boolean).length,
    [filters]
  );

  // Filter configuration
  const filterConfig = [
    {
      key: 'search',
      label: 'Search',
      type: 'search' as const,
      value: filters.search,
      onChange: (value: string) => handleFilterChange(value, 'search'),
      placeholder: 'Search by booking ID, movie, or user...',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'multiSelect' as const,
      value: filters.status,
      onChange: (value: string[]) => handleFilterChange(value, 'status'),
      options: [
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      icon: <Tag className="w-5 h-5" />,
    },
    {
      key: 'bookingDate',
      label: 'Booking Date',
      type: 'select' as const,
      value: filters.bookingDate,
      onChange: (value: string) => handleFilterChange(value || null, 'bookingDate'),
      options: [
        { label: 'Newest First', value: 'newest' },
        { label: 'Oldest First', value: 'oldest' },
        { label: 'Clear', value: '' },
      ],
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  // Table columns configuration
  const columns = [
    {
      key: '_id',
      label: 'No',
      render: (_: any, __: CreateBookingResponse, index: number) =>
        (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
      width: '60px',
      className: 'text-gray-300 font-medium',
    },
    {
      key: 'bookingId',
      label: 'Booking ID',
      className: 'text-white font-medium',
    },
    {
      key: 'showId.movieId.name',
      label: 'Movie',
      render: (_: any, booking: CreateBookingResponse) => booking.showId?.movieId?.name || 'N/A',
      className: 'text-gray-300',
    },
    {
      key: 'showId.theaterId.name',
      label: 'Theater',
      render: (_: any, booking: CreateBookingResponse) => booking.showId?.theaterId?.name || 'N/A',
      className: 'text-gray-300',
    },
    {
      key: 'showId.startTime',
      label: 'Show Time',
      render: (_: any, booking: CreateBookingResponse) =>
        booking.showId?.startTime
          ? new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(
              new Date(booking.showId.startTime)
            )
          : 'N/A',
      className: 'text-gray-300',
    },
    {
      key: 'userId.name',
      label: 'User',
      render: (_: any, booking: CreateBookingResponse) => booking.userId?.name || 'N/A',
      className: 'text-gray-300',
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (value: number) => `₹${Number(value).toFixed(2)}`,
      className: 'text-gray-300',
    },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
            status === 'confirmed' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
      className: 'text-gray-300',
    },
    {
      key: 'createdAt',
      label: 'Booking Date',
      sortable: true,
      render: (date: string) => formatRelativeTime(date),
      className: 'text-gray-300',
    },
  ];

  // Table actions configuration
  const actions = [
    {
      label: 'View',
      onClick: handleViewBooking,
      icon: <Eye className="w-5 h-5" />,
      className: 'text-blue-400 hover:text-blue-300 transition-colors',
      ariaLabel: (booking: Booking) => `View details for booking ${booking.bookingId}`,
    },
    {
      label: 'Cancel',
      onClick: handleCancelBooking,
      icon: <XCircle className="w-4.5 h-4.5" />,
      className: 'text-red-400 hover:text-red-300 transition-colors',
      ariaLabel: (booking: Booking) => `Cancel booking ${booking.bookingId}`,
      condition: (booking: Booking) => booking.status === 'confirmed' && booking.showId.status !== 'Completed',
    },
  ];

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <BackButton />

      {/* Filter and Header */}
      <AdvancedFilterWithHeader
        title="Vendor Bookings"
        filters={filterConfig}
        onReset={resetFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* Table and Pagination */}
      <DataTableWithPagination
        columns={columns}
        data={bookings}
        actions={actions}
        isLoading={isLoading}
        error={error ? (error as any).message || 'Failed to load bookings' : null}
        emptyMessage="No bookings found"
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={ITEMS_PER_PAGE}
        totalCount={totalBookings}
        onPageChange={setCurrentPage}
        onPageSizeChange={() => {}} // Fixed page size at 5
        sortBy={filters.bookingDate ? 'createdAt' : undefined}
        sortOrder={filters.bookingDate === 'newest' ? 'desc' : 'asc'}
        onSort={handleSortChange}
      />

      {/* Modals */}
      <AnimatePresence>
        {selectedBooking && (
          <BookingDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            booking={selectedBooking}
          />
        )}
        {bookingToCancel && (
          <CancelConfirmationModal
            bookingId={bookingToCancel}
            onClose={() => {
              setIsCancelModalOpen(false);
              setBookingToCancel(null);
            }}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['vendorBookings'] });
              setIsCancelModalOpen(false);
              setBookingToCancel(null);
            }}
            cancellationFee={15}
            refundPercentage={85}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorBookings;