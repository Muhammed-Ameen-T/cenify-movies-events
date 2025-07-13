// src/pages/User/Checkout.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  CreditCard,
  Wallet,
  ChevronDown,
  ChevronUp,
  X,
  Heart,
  Shield,
  Check,
  AlertCircle,
} from 'lucide-react';
import { BookingService } from '../../services/User/bookingApi';
import { BookingData, PaymentOptions, CreateBookingPayload } from '../../types/booking';
import Loader from '../../components/Shared/Loading';

const CheckoutPage: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<BookingData['seats']>([]);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'stripe' | ''>('');
  const [charityAmount, setCharityAmount] = useState(0);
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [showBookingSummary, setShowBookingSummary] = useState(true);
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedStartTime = localStorage.getItem(`timerStart_${showId}`);
    const defaultTime = 300; // 5 minutes in seconds
    if (savedStartTime) {
      const startTime = parseInt(savedStartTime, 10);
      if (isNaN(startTime)) {
        console.warn(`Invalid timerStart_${showId} in localStorage, resetting timer`);
        localStorage.setItem(`timerStart_${showId}`, Date.now().toString());
        return defaultTime;
      }
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const initialTime = defaultTime - elapsed;
      return initialTime > 0 ? initialTime : defaultTime;
    }
    localStorage.setItem(`timerStart_${showId}`, Date.now().toString());
    return defaultTime;
  });

  // Load selected seats from localStorage
  useEffect(() => {
    const seats = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
    if (!seats.length || !showId) {
      toast.error('No seats selected', { id: 'no-seats' });
      navigate(`/seat-selection/${showId}`);
      return;
    }
    setSelectedSeats(seats);
    // Ensure timer is set
    if (!localStorage.getItem(`timerStart_${showId}`)) {
      localStorage.setItem(`timerStart_${showId}`, Date.now().toString());
      setTimeLeft(300);
      console.log(`Initialized timerStart_${showId} in CheckoutPage`);
    }
  }, [showId, navigate]);

  // Session timer
  useEffect(() => {
    if (timeLeft <= 0) {
      toast.error('Booking session expired', { id: 'session-expired' });
      localStorage.removeItem('selectedSeats');
      localStorage.removeItem(`timerStart_${showId}`);
      navigate(`/seat-selection/${showId}`);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          localStorage.removeItem(`timerStart_${showId}`);
          console.log(`Timer expired for showId: ${showId}`);
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(timerId);
      console.log(`Cleared timer interval for showId: ${showId}`);
    };
  }, [timeLeft, showId, navigate]);

  // Fetch show details
  const { data: bookingData, isLoading: isBookingLoading, error: bookingError } = useQuery<BookingData>({
    queryKey: ['showDetails', showId],
    queryFn: () => BookingService.getShowDetails(showId!),
    enabled: !!showId && selectedSeats.length > 0,
    refetchOnWindowFocus: false,
  });

  // Log bookingData only when it changes
  useEffect(() => {
    if (bookingData) {
      console.log('🚀 ~ bookingData:', bookingData);
    }
  }, [bookingData]);

  // Calculate pricing
  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const convenienceFee = Math.round(subtotal * 0.15);
  const totalAmountWithoutDiscount = subtotal + convenienceFee + charityAmount;

  // Fetch payment options
  const { data: paymentOptions, isLoading: isPaymentLoading, error: paymentError } = useQuery<PaymentOptions>({
    queryKey: ['paymentOptions', totalAmountWithoutDiscount],
    queryFn: () => BookingService.getPaymentOptions(totalAmountWithoutDiscount),
    enabled: selectedSeats.length > 0,
    onSuccess: (data) => {
      setCharityAmount(selectedSeats.length);
    },
    refetchOnWindowFocus: false,
  });

  // Calculate final total with movie pass discount
  const moviePassDiscount = paymentOptions?.moviePass.active ? Math.round(subtotal * 0.08) : 0;
  const totalAmount = totalAmountWithoutDiscount - moviePassDiscount;

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (payload: CreateBookingPayload) => BookingService.createBooking(payload),
    onSuccess: ({ booking, stripeSessionUrl }) => {
      // toast.success('Booking confirmed!', { id: 'booking-confirmed' });
      localStorage.removeItem('selectedSeats');
      localStorage.removeItem(`timerStart_${showId}`);
      if (paymentMethod === 'wallet') {
        navigate(`/booking-success/${booking.bookingId}`);
      } else if (paymentMethod === 'stripe' && stripeSessionUrl) {
        window.location.href = stripeSessionUrl;
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Payment failed', { id: 'payment-failed' });
    },
  });

  const handlePayment = () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method', { id: 'no-payment-method' });
      return;
    }

    if (!showId || !bookingData) {
      toast.error('Booking data not available', { id: 'no-booking-data' });
      return;
    }

    const payload: CreateBookingPayload = {
      showId,
      bookedSeatsId: selectedSeats.map((seat) => seat.seatId),
      payment: {
        amount: totalAmount,
        method: paymentMethod,
      },
      subTotal: subtotal,
      convenienceFee,
      donation: charityAmount,
      totalAmount,
      couponDiscount: 0,
      couponApplied: false,
      moviePassApplied: paymentOptions?.moviePass.active || false,
      moviePassDiscount,
    };

    createBookingMutation.mutate(payload);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isBookingLoading && !isPaymentLoading && (bookingError || paymentError)) {
      toast.error('Failed to load booking details', { id: 'booking-error' });
    }
  }, [isBookingLoading, isPaymentLoading, bookingError, paymentError]);

  if (isBookingLoading || isPaymentLoading) {
    return <div className="text-center py-10"><Loader /></div>;
  }

  if (!bookingData || !paymentOptions) {
    return <div className="text-center py-10 text-red-600">Error loading booking details</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        .gradient-border {
          background: linear-gradient(45deg, #f59e0b, #ef4444, #f59e0b);
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{bookingData.movieId.name}</h1>
                  <p className="text-gray-600 font-md text-sm">
                    {bookingData.theaterId.name}: {bookingData.theaterId.location.city}
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm relative">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(bookingData.showDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(bookingData.startTime).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Ticket className="w-4 h-4" />
                <span>{selectedSeats.length} Tickets</span>
              </div>
              <div className="group flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-lg relative">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-semibold text-orange-900 text-sm">{formatTime(timeLeft)}</span>
                {timeLeft <= 300 && (
                  <div className="absolute left-40 -translate-x-full mt-35 w-64 bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md hidden group-hover:block transition-all duration-300">
                    ⚠️ You need to complete your payment and finalize the booking within {formatTime(timeLeft)} minutes.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-yellow-500" />
                  Payment Options
                </h2>
                <p className="text-gray-600 mt-1">Choose your preferred payment method</p>
              </div>
              <div className="p-6 space-y-4">
                <div
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    paymentMethod === 'wallet' && paymentOptions.wallet.enabled
                      ? 'border-yellow-400 bg-yellow-50 shadow-lg shadow-yellow-400/20'
                      : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50'
                  } ${!paymentOptions.wallet.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => paymentOptions.wallet.enabled && setPaymentMethod('wallet')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-full ${
                          paymentMethod === 'wallet' && paymentOptions.wallet.enabled ? 'bg-yellow-400' : 'bg-gray-100'
                        }`}
                      >
                        <Wallet
                          className={`w-6 h-6 ${paymentMethod === 'wallet' && paymentOptions.wallet.enabled ? 'text-white' : 'text-gray-600'}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Cenify Wallet</h3>
                        <p className="text-sm text-gray-600">Available Balance: ₹{paymentOptions.wallet.balance}</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'wallet' && paymentOptions.wallet.enabled ? 'border-yellow-400 bg-yellow-400' : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'wallet' && paymentOptions.wallet.enabled && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  {!paymentOptions.wallet.enabled && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Insufficient wallet balance. Please add ₹{totalAmount - paymentOptions.wallet.balance} more.</span>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    paymentMethod === 'stripe'
                      ? 'border-blue-400 bg-blue-50 shadow-lg shadow-blue-400/20'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                  onClick={() => setPaymentMethod('stripe')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${paymentMethod === 'stripe' ? 'bg-blue-400' : 'bg-gray-100'}`}>
                        <CreditCard className={`w-6 h-6 ${paymentMethod === 'stripe' ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Card Payment</h3>
                        <p className="text-sm text-gray-600">Credit/Debit Card via Stripe</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'stripe' ? 'border-blue-400 bg-blue-400' : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'stripe' && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-600">Secured by 256-bit SSL encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 sticky top-24">
              <div className="p-6 border-b border-gray-100 cursor-pointer" onClick={() => setShowBookingSummary(!showBookingSummary)}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Ticket className="w-6 h-6 text-yellow-500" />
                    Booking Summary
                  </h2>
                  {showBookingSummary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
              {showBookingSummary && (
                <div className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">
                        {selectedSeats[0].type} - {selectedSeats.map((s) => s.seatNumber).join(', ')} ({selectedSeats.length} Tickets)
                      </h3>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span>Subtotal</span>
                      <span className="font-bold">₹{subtotal}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Convenience Fee (incl. GST)</span>
                      <span className="text-gray-900">₹{convenienceFee}</span>
                    </div>
                    {moviePassDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Movie Pass Discount</span>
                        <span className="text-green-600">-₹{moviePassDiscount}</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="font-medium text-gray-900">Donate to BookAChange</span>
                        </div>
                        <button
                          onClick={() => setShowCharityModal(true)}
                          className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                        >
                          <Shield className="w-3 h-3" />
                          VIEW T&C
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex justify-center items-center space-x-3 text-center">
                          <span className="text-lg font-bold">₹{charityAmount}</span>
                          {charityAmount > 0 && <p className="text-xs text-gray-600">(₹1 per ticket will be added)</p>}
                        </div>
                        <div className="flex gap-2">
                          {charityAmount === 0 ? (
                            <button
                              onClick={() => setCharityAmount(selectedSeats.length)}
                              className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg text-sm font-bold hover:from-red-500 hover:to-red-600 transition-all transform hover:scale-105"
                            >
                              Add ₹{selectedSeats.length}
                            </button>
                          ) : (
                            <button
                              onClick={() => setCharityAmount(0)}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-all"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-yellow-600">₹{totalAmount}</span>
                    </div>
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={
                      !paymentMethod ||
                      createBookingMutation.isPending ||
                      (paymentMethod === 'wallet' && !paymentOptions.wallet.enabled)
                    }
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                      !paymentMethod ||
                      createBookingMutation.isPending ||
                      (paymentMethod === 'wallet' && !paymentOptions.wallet.enabled)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {createBookingMutation.isPending ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing Payment...
                      </div>
                    ) : (
                      `Proceed to Pay ₹${totalAmount}`
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-0">
                    <Shield className="w-3 h-3" />
                    <span>100% Safe & Secure Payments</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCharityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                BookAChange Initiative
              </h3>
              <button
                onClick={() => setShowCharityModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <p>
                <strong>About BookAChange:</strong> BookAChange is our initiative to support underprivileged children's
                education and provide them access to books and learning materials.
              </p>
              <p>
                <strong>How it works:</strong> Your donation of ₹1 per ticket (₹{selectedSeats.length} for {selectedSeats.length}{' '}
                tickets) will be directly contributed to our partner NGOs working in the education sector.
              </p>
              <p>
                <strong>Impact:</strong> Every ₹100 donated can provide educational materials for one child for a month.
              </p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800">
                  <strong>Note:</strong> This donation is completely voluntary and can be removed at any time before payment.
                  You will receive a donation receipt via email.
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-yellow-800">
                  <strong>Terms & Conditions:</strong> Donations are non-refundable. All donations will be utilized for
                  educational purposes only. Cenify reserves the right to modify or discontinue this program with prior notice.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setCharityAmount(selectedSeats.length);
                  setShowCharityModal(false);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white font-bold rounded-xl hover:from-red-500 hover:to-red-600 transition-all"
              >
                Add Donation
              </button>
              <button
                onClick={() => setShowCharityModal(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;