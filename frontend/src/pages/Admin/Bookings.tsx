import React, { useState, useEffect } from 'react';
import { Eye, Ticket, Calendar, Tag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import BookingDetailsModal from '../../components/Admin/BookingViewModal';
import CancelConfirmationModal from '../../components/Admin/BookingCancelConfirmationModal'; 
import Table from '../../components/AdminCommon/Table/Table';
import Pagination from '../../components/AdminCommon/Pagination/Pagination';
import Filter from '../../components/AdminCommon/Filter/Filter';
import { fetchAllBooking, BookingService } from '../../services/User/bookingApi';
import { CreateBookingResponse } from '../../types/booking';
import { TableColumn, TableAction } from '../../types/adminTable/table';
import { Filter as FilterType } from '../../types/adminTable/filter';
import { formatRelativeTime } from '../../utils/timeFormator';
import { Booking } from '../../types/bookingResponse';

const ITEMS_PER_PAGE = 5;

type FilterOptions = {
  status?: string[];
  bookingDate: 'newest' | 'oldest' | null;
  search: string;
};

const BookingManagement: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // States
  const [selectedBooking, setSelectedBooking] = useState<CreateBookingResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    bookingDate: null,
    search: '',
  });

  // Fetch bookings
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings', currentPage, JSON.stringify(filters)],
    queryFn: () =>
      fetchAllBooking({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: filters.status?.length ? filters.status : undefined,
        sortBy: filters.bookingDate ? 'createdAt' : undefined,
        sortOrder: filters.bookingDate === 'newest' ? 'desc' : filters.bookingDate === 'oldest' ? 'asc' : undefined,
      }),
  });
  const bookings = data?.bookings || [];
  const totalBookings = data?.totalCount || 0;
  const totalPages = data?.totalPages || Math.ceil(totalBookings / ITEMS_PER_PAGE);

  // Mutation for cancelling a booking
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      BookingService.cancelBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setErrorMessage(null);
      setIsCancelModalOpen(false);
      setBookingToCancel(null);
    },
    onError: (error: string) => {
      setErrorMessage(error.message || 'Failed to cancel booking');
    },
  });

  // Update URL with filters and pagination
  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (currentPage > 1) queryParams.set('page', currentPage.toString());
    if (filters.status?.length) queryParams.set('status', filters.status.join(','));
    if (filters.bookingDate) queryParams.set('bookingDate', filters.bookingDate);
    if (filters.search) queryParams.set('search', filters.search);

    navigate(
      {
        pathname: location.pathname,
        search: queryParams.toString() ? `?${queryParams.toString()}` : '',
      },
      { replace: true },
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
    if (searchParams.has('bookingDate')) {
      const bookingDate = searchParams.get('bookingDate');
      if (bookingDate === 'newest' || bookingDate === 'oldest') {
        newFilters.bookingDate = bookingDate;
      }
    }
    if (searchParams.has('search')) newFilters.search = searchParams.get('search')!;

    setFilters(newFilters);
  }, [location.search]);

  // Booking action handlers
  const handleViewBooking = (booking: CreateBookingResponse) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking.bookingId);
    setIsCancelModalOpen(true);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: [],
      bookingDate: null,
      search: '',
    });
    setCurrentPage(1);
  };

  // Table columns configuration
  const columns: TableColumn<Booking>[] = [
    {
      key: '_id',
      label: 'No',
      render: (_, __, index) => (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
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
      render: (_, booking) => booking.showId?.movieId?.name || 'N/A',
      className: 'text-gray-300',
    },
    {
      key: 'showId.theaterId.name',
      label: 'Theater',
      render: (_, booking) => booking.showId?.theaterId?.name || 'N/A',
      className: 'text-gray-300',
    },
    {
      key: 'showId.startTime',
      label: 'Show Time',
      render: (_, booking) =>
        booking.showId?.startTime
          ? new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(
              new Date(booking.showId.startTime),
            )
          : 'N/A',
      className: 'text-gray-300',
    },
    {
      key: 'userId.name',
      label: 'User',
      render: (_, booking) => booking.userId?.name || 'N/A',
      className: 'text-gray-300',
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (value) => `₹${Number(value).toFixed(2)}`,
      className: 'text-gray-300',
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
            status === 'confirmed' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value: unknown) => {
        const dateStr = typeof value === 'string' || value instanceof Date ? value.toString() : '';
        return formatRelativeTime(dateStr);
      },
      className: 'text-gray-300',
    },
  ];

  // Table actions configuration
  const actions: TableAction<Booking>[] = [
    {
      label: 'View',
      onClick: handleViewBooking,
      icon: <Eye className="w-4 h-4" />,
      className: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      label: 'Cancel',
      onClick: handleCancelBooking,
      className: 'bg-red-600 hover:bg-red-700 text-white',
      condition: (booking) => booking.status=='Confirmeed' ||booking.showId.status !== 'Completed',
    },
  ];

  // Filter configuration
  const filtersConfig: FilterType[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'search',
      value: filters.search,
      onChange: (value: string) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      },
      placeholder: 'Search by booking ID, movie, or user...',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'multiSelect',
      icon: <Tag className="w-5 h-5" />,
      value: filters.status,
      onChange: (value: string[]) => {
        setFilters((prev) => ({ ...prev, status: value }));
        setCurrentPage(1);
      },
      options: [
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      key: 'bookingDate',
      label: 'Booking Date',
      type: 'dateSort',
      icon: <Calendar className="w-5 h-5" />,
      value: filters.bookingDate,
      onChange: (value: 'newest' | 'oldest' | null) => {
        setFilters((prev) => ({
          ...prev,
          bookingDate: value,
        }));
        setCurrentPage(1);
      },
      for: 'booking',
      options: [
        { label: 'Newest First', value: ' langs' },
        { label: 'Oldest First', value: 'oldest' },
        { label: 'Clear', value: null },
      ],
    },
  ];

  // Calculate active filter count
  const activeFilterCount = [
    filters.status?.length > 0,
    filters.bookingDate !== null,
    filters.search !== '',
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Error Message */}
          {errorMessage && (
            <div className="text-red-400 mb-4 p-3 bg-red-900/30 rounded-lg border border-red-800">
              {errorMessage}
            </div>
          )}

          {/* Filters */}
          <div className="mb-8">
            <Filter
              filters={filtersConfig}
              onReset={resetFilters}
              showActiveCount={true}
              expandable={true}
              expandedContent={
                <div className="text-gray-400 text-sm">No additional filters available for bookings.</div>
              }
            />
          </div>

          {/* Table */}
          <div className="mb-8">
            <Table
              columns={columns}
              data={bookings}
              actions={actions}
              loading={isLoading}
              emptyState={{
                icon: <Ticket />,
                title: 'No bookings found',
                description: 'No bookings match your filter criteria.',
                action: {
                  label: 'Reset Filters',
                  onClick: resetFilters,
                },
              }}
              onRowClick={handleViewBooking}
            />
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={totalBookings}
              showPageInfo={true}
              showItemsInfo={true}
            />
          )}

          {/* Booking Details Modal */}
          {selectedBooking && (
            <BookingDetailsModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              booking={selectedBooking}
            />
          )}

          {/* Cancel Confirmation Modal */}
          {bookingToCancel && (
            <CancelConfirmationModal
              bookingId={bookingToCancel}
              onClose={() => {
                setIsCancelModalOpen(false);
                setBookingToCancel(null);
              }}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['bookings'] });
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default BookingManagement;