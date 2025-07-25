import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film,
  Star,
  Gift,
  Ticket,
  Clock,
  Sparkles,
  CheckCircle,
  Percent,
  Heart,
  TrendingUp,
  Zap,
  Eye,
  ArrowRight,
  XCircle,
  Calendar,
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { getMoviePass, createCheckoutSession, getMoviePassHistory, MoviePassData } from '../../services/User/moviePassApi';
import { formatRelativeTime } from '../../utils/timeFormator';

// Initialize Stripe with test mode publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISH_KEY || 'pk_test_your_test_publishable_key');

interface MoviePassTabProps {
  isLoading?: boolean;
  onViewHistory?: () => void;
}

// Animation variants
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

const shimmerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const shimmerItemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
};

const MoviePassTab: React.FC<MoviePassTabProps> = ({ onViewHistory }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'history'>('overview');

  // Parse URL query parameters for pagination
  const queryParams = new URLSearchParams(location.search);
  const initialLimit = parseInt(queryParams.get('limit') || '5', 10);
  const limit = isNaN(initialLimit) || initialLimit < 5 ? 5 : initialLimit;

  const [currentLimit, setCurrentLimit] = React.useState(limit);

  // Update URL when limit changes
  const updateUrl = React.useCallback(
    (newLimit: number) => {
      const params = new URLSearchParams({ limit: newLimit.toString() });
      navigate({ search: params.toString() }, { replace: true });
    },
    [navigate]
  );

  // Handle payment success/failure from redirect
  React.useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Movie Pass purchased successfully!');
      navigate('/account/moviepass-tab', { replace: true });
    } else if (paymentStatus === 'canceled') {
      toast.error('Payment canceled. Please try again.');
      navigate('/account/moviepass-tab', { replace: true });
    }
  }, [location.search, navigate]);

  // Fetch Movie Pass data
  const { data: moviePassData, isLoading, isError, error } = useQuery({
    queryKey: ['moviePass'],
    queryFn: getMoviePass,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Fetch paginated history
  const {
    data: { history = [], total = 0 } = {},
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useQuery({
    queryKey: ['moviePassHistory', currentLimit],
    queryFn: async () => {
      const response = await getMoviePassHistory({ page: 1, limit: currentLimit });
      return {
        history: response.history.map((h) => ({
          title: h.title,
          date: h.date,
          saved: h.saved,
        })),
        total: response.total,
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!moviePassData && moviePassData.status === 'Active',
  });

  // Create checkout session mutation
  const createCheckoutMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: async (data) => {
      const stripe = await stripePromise;
      if (stripe) {
        const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (result.error) {
          toast.error(result.error.message || 'Failed to redirect to checkout');
        }
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to initiate payment');
    },
  });

  // Shimmer loading component
  const ShimmerUI = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={shimmerVariants}
      className="space-y-8"
    >
      <motion.div variants={shimmerItemVariants} className="relative">
        <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="w-32 h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
              <div className="h-5 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div variants={shimmerItemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50">
            <div className="h-12 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse mb-4"></div>
            <div className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );

  // Handle loading state
  if (isLoading || isHistoryLoading) {
    return <ShimmerUI />;
  }

  // Handle error state
  if (isError || isHistoryError) {
    return (
      <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 text-center">
        <div className="text-red-600 text-lg font-semibold">Error loading Movie Pass data</div>
        <div className="text-gray-600 mt-2">{(error || historyError)?.message || 'Unknown error'}</div>
      </div>
    );
  }

  // Helper function to check if moviePassData is valid
  const isValidMoviePassData = (data: MoviePassData | {}): data is MoviePassData => {
    return (
      !!data &&
      'status' in data &&
      'totalMovies' in data &&
      'moneySaved' in data &&
      'purchaseDate' in data &&
      'expireDate' in data &&
      'history' in data
    );
  };

  // Function to calculate days left
  const calculateDaysLeft = (expireDate: string): string => {
    const today = new Date();
    const expiry = new Date(expireDate);
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays}`;
    } else if (diffDays === 0) {
      return '(Expires today!)';
    } else {
      return '(Expired)';
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    const newLimit = currentLimit + 5;
    setCurrentLimit(newLimit);
    updateUrl(newLimit);
  };

  const hasMoreHistory = history.length < total;

  // Inactive State (No Movie Pass, empty object, or Inactive)
  if (!isValidMoviePassData(moviePassData) || moviePassData.status === 'Inactive') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8 relative"
      >
        {/* Hero Section - Inactive */}
        <motion.div variants={itemVariants} className="relative">
          <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-yellow-300/10 to-yellow-500/10 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4"></div>
            <div className="relative text-center">
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full">
                  <Film className="w-16 h-16 text-yellow-600" />
                </div>
              </div>
              <h1 className="text-4xl font-black text-gray-900 mb-4">Get Your Movie Pass</h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Unlock exclusive savings and perks with a one-time Movie Pass purchase. Enjoy movies like never before!
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
                  <Percent className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-700">10% off tickets</span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-700">Free rewards</span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-gray-700">Earn points</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => createCheckoutMutation.mutate()}
                disabled={createCheckoutMutation.isPending}
                className={`bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-4 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${
                  createCheckoutMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {createCheckoutMutation.isPending ? 'Processing...' : 'Buy Movie Pass - ₹199'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Benefits Preview */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Get a Movie Pass?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover the perks that make every movie experience unforgettable.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Percent, title: 'Save on Tickets', desc: 'Get 10% off every movie ticket' },
              { icon: Gift, title: 'Free Rewards', desc: 'Enjoy monthly free popcorn or drinks' },
              { icon: Star, title: 'Earn Points', desc: 'Collect points for exclusive rewards' },
              { icon: Heart, title: 'Exclusive Access', desc: 'Priority booking for new releases' },
            ].map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:border-yellow-200 transition-all duration-300"
                >
                  <div className="inline-flex p-3 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-xl mb-4">
                    <IconComponent className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Active State
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 relative"
    >
      {/* Active Pass Header */}
      <motion.div variants={itemVariants} className="relative">
        <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/10 to-green-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-300/10 to-green-500/10 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-500 rounded-full"></div>
              <span className="text-green-600 font-bold text-sm uppercase tracking-wider">Active Movie Pass</span>
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                <CheckCircle className="w-3 h-3" />
                ACTIVE
              </div>
            </div>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <div className="p-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl">
                  <Film className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </motion.div>
              <div className="flex-1 space-y-6">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 mb-2">Movie Pass</h1>
                  <p className="text-gray-600">
                    Expires on {new Date(moviePassData.expireDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Ticket className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-500">Movies</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{moviePassData.totalMovies}</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-gray-500">Points</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{moviePassData.totalMovies * 10}</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-300">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-500">Saved</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">₹{moviePassData.moneySaved}</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-500">Days left</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{calculateDaysLeft(moviePassData.expireDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-gray-200/50">
        <div className="flex gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: Film },
            { id: 'history', label: 'History', icon: Clock },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'history' && onViewHistory) {
                    onViewHistory();
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Current Benefits */}
            <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Your Benefits</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  '10% off all movie tickets',
                  'Free monthly popcorn',
                  'Priority booking for new releases',
                  'Earn points for rewards',
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:border-yellow-200 transition-all duration-300"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="font-medium text-gray-900">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'Total Movies',
                  value: `${moviePassData.totalMovies} Movies`,
                  icon: Film,
                  color: 'blue',
                  change: `+${moviePassData.totalMovies} this month`,
                },
                {
                  label: 'Total Savings',
                  value: `₹${moviePassData.moneySaved}`,
                  icon: TrendingUp,
                  color: 'green',
                  change: `+₹${moviePassData.moneySaved} this month`,
                },
                {
                  label: 'Points Balance',
                  value: `${moviePassData.totalMovies * 10}`,
                  icon: Star,
                  color: 'yellow',
                  change: '+25 this week',
                },
                {
                  label: 'Left',
                  value: `${calculateDaysLeft(moviePassData.expireDate)} days`,
                  icon: Zap,
                  color: 'orange',
                  change: 'Keep it up!',
                },
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className={`bg-gradient-to-br from-white/90 to-${stat.color}-50/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl group hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-600 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                    <p className={`text-${stat.color}-600 font-medium mb-2`}>{stat.label}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-blue-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
                    <Film className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Total Movies</h3>
                    <p className="text-2xl font-black text-blue-600">{moviePassData.totalMovies}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white/90 to-green-50/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-green-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Money Saved</h3>
                    <p className="text-2xl font-black text-green-600">₹{moviePassData.moneySaved}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Pass Purchased</h3>
                    <p className="text-lg font-bold text-purple-600">{new Date(moviePassData.purchaseDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <div className="space-y-4">
                {history.length > 0 ? (
                  history.map((activity, index) => (
                    <motion.div
                      key={`${activity.title}-${activity.date}-${index}`}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:border-yellow-200 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Film className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500">{formatRelativeTime(activity.date)}</p>
                        </div>
                      </div>
                      {activity.saved > 0 && (
                        <div className="text-right">
                          <p className="font-bold text-green-600">+₹{activity.saved}</p>
                          <p className="text-xs text-gray-500">saved</p>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center">No activity yet.</p>
                )}
              </div>
              {hasMoreHistory && (
                <div className="text-center mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLoadMore}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md mx-auto text-sm hover:shadow-lg transition-shadow"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Load More Activities ({Math.min(5, total - history.length)} more)
                  </motion.button>
                </div>
              )}
              <div className="text-center mt-4 text-sm text-gray-500">
                Showing {history.length} of {total} activities
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MoviePassTab;