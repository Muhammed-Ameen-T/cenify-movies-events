// src/components/User/BookingsTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Calendar,
  MapPin,
  Users,
  Search,
  SortDesc,
  Share2,
  Ticket,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Star,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Booking, BookingResponse } from '../../types/bookingResponse';
import { findUserBookings } from '../../services/User/bookingApi';
import BookingDetailModal from './BookingDetailModal';
import CancelConfirmationModal from './BookingCancellationModal';
import RateMovieModal from './RateMovieModal';
import { CreateBookingResponse } from '../../types/booking';

// Constants
const ITEMS_PER_PAGE = 8;
const STATUS_MAP = {
  all: [],
  confirmed: ['confirmed'],
  cancelled: ['cancelled'],
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

const cardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 20,
    },
  },
};

interface BookingsTabProps {
  initialBookings?: Booking[];
}

const BookingsTab: React.FC<BookingsTabProps> = ({ initialBookings = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'movieTitle' | 'theater'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeFilter, setActiveFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);

  // Parse URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter') as 'all' | 'confirmed' | 'cancelled';
    const sortByParam = params.get('sortBy') as 'createdAt' | 'movieTitle' | 'theater';
    const sortOrderParam = params.get('sortOrder') as 'asc' | 'desc';
    const pageParam = params.get('page');
    const search = params.get('search');

    if (filter && ['all', 'confirmed', 'cancelled'].includes(filter)) setActiveFilter(filter);
    if (sortByParam && ['createdAt', 'movieTitle', 'theater'].includes(sortByParam)) setSortBy(sortByParam);
    if (sortOrderParam && ['asc', 'desc'].includes(sortOrderParam)) setSortOrder(sortOrderParam);
    if (pageParam && !isNaN(parseInt(pageParam))) setPage(parseInt(pageParam));
    if (search) setSearchTerm(search);
  }, [location.search]);

  // Update URL query params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (activeFilter !== 'all') params.set('filter', activeFilter);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (page !== 1) params.set('page', page.toString());
    if (searchTerm) params.set('search', searchTerm);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [activeFilter, sortBy, sortOrder, page, searchTerm, navigate, location.pathname]);

  useEffect(() => {
    updateUrlParams();
  }, [activeFilter, sortBy, sortOrder, page, searchTerm, updateUrlParams]);

  // Fetch bookings
  const mapBooking = (booking: Booking): Booking => {
    const showTime = new Date(booking.showId.startTime);
    const isConfirmed = booking.status === 'confirmed';
    return {
      id: booking.id,
      bookingId: booking.bookingId,
      movieTitle: booking.showId.movieId.name,
      poster: booking.showId.movieId.poster,
      theater: `${booking.showId.theaterId.name}, ${booking.showId.theaterId.location.city}`,
      date: booking.showId.showDate,
      time: showTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      seats: booking.bookedSeatsId.map((seat) => seat.number),
      totalAmount: booking.totalAmount,
      status: booking.status,
      qrCode: booking.qrCode,
      duration: `${booking.showId.movieId.duration.hours}h ${booking.showId.movieId.duration.minutes}m`,
      genre: booking.showId.movieId.genre,
      rating: booking.showId.movieId.rating.toString(),
      screen: booking.showId.theaterId.screen || 'Screen 1',
      paymentId: booking.payment.paymentId,
      showId: booking.showId._id,
      userId: booking.userId._id,
      paymentStatus: booking.payment.status,
      createdAt: booking.createdAt,
      language: booking.showId.movieId.language,
      theaterId: booking.showId.theaterId._id,
      coordinates: booking.showId.theaterId.location.coordinates,
      movieId: booking.showId.movieId._id,
      showStatus: booking.showId.status,
      reason:booking.reason
    };
  };

  const { data, isLoading, isError, error, isFetching } = useQuery<BookingResponse>({
    queryKey: ['userBookings', page, activeFilter, sortBy, sortOrder, searchTerm],
    queryFn: async () => {
      const response = await findUserBookings({
        page,
        limit: ITEMS_PER_PAGE,
        status: STATUS_MAP[activeFilter],
        sortBy: sortBy === 'movieTitle' ? 'showId.movieId.name' : sortBy === 'theater' ? 'showId.theaterId.name' : 'createdAt',
        sortOrder,
      });
      return {
        bookings: response.bookings.map(mapBooking),
        totalCount: response.totalCount,
        totalPages: response.totalPages,
      };
    },
    placeholderData: (previousData) => previousData, 
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Share handler
  const handleShare = useCallback(
    async (booking: Booking) => {
      const shareUrl = `${window.location.origin}/booking-success/${booking.bookingId}`;
      const shareData = {
        title: `Movie Ticket: ${booking.movieTitle}`,
        text: `Check out my booking for ${booking.movieTitle} at ${booking.theater} on ${new Date(
          booking.date
        ).toLocaleDateString()}!`,
        url: shareUrl,
      };

      try {
        if (navigator.share && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success('Booking shared successfully!');
        } else {
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard!');
        }
      } catch (error) {
        toast.error('Failed to share booking');
        console.error('Share error:', error);
      }
    },
    []
  );

  // Pagination controls
  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-4 mt-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="p-2 rounded-full bg-white border border-gray-200 disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </motion.button>
        <span className="text-gray-700 font-medium">
          Page {page} of {data.totalPages}
        </span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={page === data.totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="p-2 rounded-full bg-white border border-gray-200 disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </motion.button>
      </div>
    );
  };

  // Filter buttons data
  const filterButtons = [
    { key: 'all', label: 'All Bookings', count: data?.totalCount || initialBookings.length },
    { key: 'confirmed', label: 'Confirmed', count: data?.bookings.filter((b) => b.status === 'confirmed').length || initialBookings.filter((b) => b.status === 'confirmed').length },
    { key: 'cancelled', label: 'Cancelled', count: data?.bookings.filter((b) => b.status === 'cancelled').length || initialBookings.filter((b) => b.status === 'cancelled').length },
  ];

  // Total spent
  const totalSpent = (data?.bookings || initialBookings).reduce((acc, b) => acc + (b.totalAmount || 0), 0);

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-0 px-4"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="relative max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-100">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-10 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
                <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              </div>

              {/* Search and Sort */}
              <div className="flex flex-col lg:flex-row gap-4 mb-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search movies or theaters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all font-medium"
                    aria-label="Search bookings"
                  />
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'movieTitle' | 'theater')}
                    className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all font-medium min-w-[160px]"
                    aria-label="Sort by"
                  >
                    <option value="createdAt">Sort by Date</option>
                    <option value="movieTitle">Sort by Movie</option>
                    <option value="theater">Sort by Theater</option>
                  </select>
                  <SortDesc className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all font-medium min-w-[120px]"
                    aria-label="Sort order"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                  <SortDesc className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-3 mb-3">
                {filterButtons.map((filter) => (
                  <motion.button
                    key={filter.key}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setActiveFilter(filter.key as 'all' | 'confirmed' | 'cancelled');
                      setPage(1);
                    }}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 border-2 ${
                      activeFilter === filter.key
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                    aria-label={`Filter by ${filter.label}`}
                  >
                    {filter.label}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        activeFilter === filter.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {filter.count}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bookings List */}
        <motion.div variants={itemVariants} className="max-w-7xl mx-auto mt-8 space-y-6">
          {isLoading && page === 1 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
          ) : isError ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-gray-100 text-center"
            >
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Bookings</h3>
              <p className="text-gray-500">{(error as Error)?.message || 'Something went wrong'}</p>
            </motion.div>
          ) : (data?.bookings.length || 0) === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-gray-100 text-center"
            >
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Book your first movie show!'}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              <div className="space-y-6">
                {data?.bookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, y: -4 }}
                    className="group relative"
                  >
                    <div
                      className={`bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border transition-all duration-300 group-hover:shadow-2xl ${
                        booking.status === 'confirmed'
                          ? 'border-yellow-300/50 group-hover:border-yellow-400/70'
                          : 'border-gray-200/50 group-hover:border-gray-300/70'
                      }`}
                    >
                      <div className="absolute top-4 right-4 flex gap-4">
                      {booking.paymentStatus === 'pending' && (
                        <div
                          className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 relative group bg-yellow-100 text-yellow-800 border border-yellow-300"
                        >
                          <X className="w-3 h-3 text-yellow-800" />
                          Payment Pending

                          {/* Tooltip */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-max bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            Booking will cancel if payment isn't completed.
                          </div>
                        </div>
                      )}

                        <div
                          className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                            booking.status === 'confirmed'
                              ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {booking.status === 'confirmed' ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </div>
                      </div>
                      <div className="flex flex-col lg:flex-row gap-6">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex-shrink-0 relative group/poster cursor-pointer"
                          onClick={() => setSelectedBooking(booking)}
                          role="button"
                          aria-label={`View details for ${booking.movieTitle}`}
                        >
                          <img
                            src={booking.poster}
                            alt={booking.movieTitle}
                            className="w-32 h-48 rounded-2xl shadow-2xl object-cover"
                          />
                        </motion.div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                              {booking.movieTitle}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm text-gray-500 font-medium">{booking.genre?.join(', ')}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-2xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-bold text-blue-600 uppercase">Date & Time</span>
                              </div>
                              <p className="text-sm font-bold text-gray-900">
                                {new Date(booking.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                              <p className="text-blue-600 font-semibold">{booking.time}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-2xl">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-purple-600" />
                                <span className="text-xs font-bold text-purple-600 uppercase">Theater</span>
                              </div>
                              <p className="text-sm font-bold text-gray-900">{booking.theater}</p>
                              <p className="text-purple-600 text-xs font-medium">{booking.screen}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-2xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-bold text-green-600 uppercase">Seats</span>
                              </div>
                              <p className="text-sm font-bold text-gray-900">{booking.seats.length} Tickets</p>
                              <p className="text-green-600 font-semibold">{booking.seats.join(', ')}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 pt-0 border-t border-gray-100">
                            {booking.status === 'confirmed' ? (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.03, y: -2 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => navigate(`/booking-success/${booking.bookingId}`)}
                                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
                                  aria-label={`View tickets for ${booking.movieTitle}`}
                                >
                                  <Ticket className="w-4 h-4" />
                                  View Tickets
                                </motion.button>
                                {booking.showStatus === 'Scheduled'&& (
                                  <motion.button
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setCancelBookingId(booking.bookingId)}
                                    className="bg-white border-2 border-red-300 text-red-600 px-6 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:bg-red-50"
                                    aria-label={`Cancel booking for ${booking.movieTitle}`}
                                  >
                                    <X className="w-4 h-4" />
                                    Cancel
                                  </motion.button>
                                )}

                                <motion.button
                                  whileHover={{ scale: 1.03, y: -2 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => handleShare(booking)}
                                  className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:bg-gray-50"
                                  aria-label={`Share booking for ${booking.movieTitle}`}
                                >
                                  <Share2 className="w-4 h-4" />
                                  Share
                                </motion.button>
                                {booking.showStatus === 'Completed'&& (
                                  <motion.button
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setRatingBooking(booking)}
                                    className="bg-white border-2 border-yellow-400 text-yellow-600 px-6 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:bg-yellow-50"
                                    aria-label={`Rate ${booking.movieTitle}`}
                                  >
                                    <Star className="w-4 h-4" />
                                    Rate Movie
                                  </motion.button>
                                )}
                              </>
                            ) : (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.03, y: -2 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => navigate(`/booking-success/${booking.bookingId}`)}
                                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
                                  aria-label={`View receipt for ${booking.movieTitle}`}
                                >
                                  <CreditCard className="w-4 h-4" />
                                  View Ticket
                                </motion.button>
                                
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
          {renderPagination()}
        </motion.div>

        {/* Modals */}
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onShare={handleShare}
          onCancel={() => setCancelBookingId(selectedBooking?.bookingId || null)}
          onRate={() => setRatingBooking(selectedBooking)}
        />
        <CancelConfirmationModal
          bookingId={cancelBookingId}
          onClose={() => setCancelBookingId(null)}
          onSuccess={() => queryClient.invalidateQueries(['userBookings'])}
        />
        <RateMovieModal
          booking={ratingBooking}
          onClose={() => setRatingBooking(null)}
        />
      </motion.div>
    </>
  );
};

export default BookingsTab;