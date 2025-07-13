import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Star,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  Calendar,
  X,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Gift,
  Shield,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserProfile, WalletData, Transaction, WalletTransactionsResponse } from '../../types';
import { getUserWallet, getUserWalletTransactions, redeemPoints } from '../../services/User/profileApi';
import { formatRelativeTime } from '../../utils/timeFormator';
import { toast } from 'react-hot-toast';
import Loader from '../Shared/Loading';

interface WalletTabProps {
  user: UserProfile;
}

// Animation Variants (unchanged)
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

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

const WalletTab: React.FC<WalletTabProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Parse URL query parameters for pagination and filter
  const queryParams = new URLSearchParams(location.search);
  const initialLimit = parseInt(queryParams.get('limit') || '5', 10);
  const initialFilter = queryParams.get('filter') || 'all';

  // Validate query parameters
  const limit = isNaN(initialLimit) || initialLimit < 5 ? 5 : initialLimit;
  const validFilters = ['all', 'credit', 'debit'];
  const filter = validFilters.includes(initialFilter) ? (initialFilter as 'all' | 'credit' | 'debit') : 'all';

  const [showBalance, setShowBalance] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'history'>('overview');
  const [showConvertPoints, setShowConvertPoints] = useState(false);
  const [convertPoints, setConvertPoints] = useState('');
  const [currentLimit, setCurrentLimit] = useState(limit);
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>(filter);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [localLoyaltyPoints, setLocalLoyaltyPoints] = useState(user.loyalityPoints || 0);

  // Sync localLoyaltyPoints with user.loyalityPoints when the prop changes
  React.useEffect(() => {
    setLocalLoyaltyPoints(user.loyalityPoints || 0);
  }, [user.loyalityPoints]);

  // Update URL when limit or filter changes
  const updateUrl = useCallback(
    (newLimit: number, newFilter: typeof filterType) => {
      const params = new URLSearchParams({
        limit: newLimit.toString(),
        filter: newFilter,
      });
      navigate({ search: params.toString() });
    },
    [navigate]
  );

  // Fetch wallet data (balance and loyalty points)
  const { data: walletData, isLoading: isWalletLoading, error: walletError } = useQuery<WalletData>({
    queryKey: ['userWallet'],
    queryFn: getUserWallet,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch transactions with pagination and filter
  const {
    data: { transactions = [], total = 0, creditCount = 0, debitCount = 0, totalCredit = 0, totalDebit = 0 } = {},
    isLoading: isTransactionsLoading,
    error: transactionsError,
  } = useQuery<WalletTransactionsResponse>({
    queryKey: ['userWalletTransactions', currentLimit, filterType],
    queryFn: async () => {
      const response = await getUserWalletTransactions({
        page: 1,
        limit: currentLimit,
        filter: filterType,
      });
      return {
        transactions: response.transactions.map((t) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          description: t.remark || `${t.source.charAt(0).toUpperCase() + t.source.slice(1)} Transaction`,
          date: t.createdAt,
          status: t.status || 'completed',
          source: t.source,
        })),
        total: response.total,
        creditCount: response.creditCount,
        debitCount: response.debitCount,
        totalCredit: response.totalCredit,
        totalDebit: response.totalDebit,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mutation for converting points to wallet balance
  const convertPointsMutation = useMutation<void, Error, number>({
    mutationFn: async (amount) => {
      await redeemPoints(amount);
    },
    onSuccess: (_data, amount) => {
      toast.success('Points converted successfully');
      queryClient.invalidateQueries({ queryKey: ['userWallet'] });
      queryClient.invalidateQueries({ queryKey: ['userWalletTransactions'] });
      setLocalLoyaltyPoints((prev) => prev - amount);
      setConvertPoints('');
      setShowConvertPoints(false);
    },
    onError: () => {
      toast.error('Failed to convert points');
    },
  });

  const handleConvertPoints = () => {
    const pointsToConvert = parseFloat(convertPoints);
    if (!pointsToConvert || pointsToConvert <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (pointsToConvert > localLoyaltyPoints) {
      toast.error('Insufficient loyalty points');
      return;
    }
    convertPointsMutation.mutate(pointsToConvert);
  };

  const handleLoadMore = () => {
    const newLimit = currentLimit + 5;
    setCurrentLimit(newLimit);
    updateUrl(newLimit, filterType);
  };

  const handleFilterChange = (newFilter: typeof filterType) => {
    setFilterType(newFilter);
    setCurrentLimit(5);
    updateUrl(5, newFilter);
  };

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.source) {
      case 'booking':
        return transaction.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />;
      case 'topup':
        return <Plus className="w-4 h-4" />;
      case 'refund':
        return <RefreshCw className="w-4 h-4" />;
      case 'loyality':
        return <Star className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (transaction: Transaction) => {
    return transaction.type === 'credit' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  // Calculate statistics
  const totalCredits = creditCount > 0 ? transactions.filter((t) => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0) : 0;
  const totalDebits = debitCount > 0 ? transactions.filter((t) => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0) : 0;
  const thisMonthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
  });

  const hasMoreTransactions = transactions.length < total;

  // Filter buttons data
  const filterButtons = [
    { key: 'all', label: 'All Transactions', count: total },
    { key: 'credit', label: 'Credits', count: creditCount },
    { key: 'debit', label: 'Debits', count: debitCount },
  ];

  if (isWalletLoading || isTransactionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4 flex items-center justify-center">
        <Loader/>
      </div>
    );
  }

  if (walletError || transactionsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-gray-100 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Wallet</h3>
            <p className="text-gray-500">{(walletError || transactionsError)?.message || 'Something went wrong'}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-10 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
              <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
            </div>

            {/* Section Toggle */}
            <div className="flex gap-3 mb-6">
              {[
                { key: 'overview', label: 'Overview', icon: TrendingUp },
                { key: 'history', label: 'Transaction History', icon: Calendar },
              ].map((section) => (
                <motion.button
                  key={section.key}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveSection(section.key as 'overview' | 'history')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 border-2 ${
                    activeSection === section.key
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </motion.button>
              ))}
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Wallet Balance Card */}
              <motion.div
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden group shadow-xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      <span className="text-white/80 text-sm font-medium">Wallet Balance</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </motion.button>
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl font-bold mb-1">
                      {showBalance ? `₹${(walletData?.balance || 0).toLocaleString()}` : '₹••••••'}
                    </div>
                    <div className="text-white/60 text-sm">Available Balance</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConvertPoints(true)}
                    className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    <Star className="w-4 h-4" />
                    Convert Points
                  </motion.button>
                </div>
              </motion.div>

              {/* Loyalty Points Card */}
              <motion.div
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden group shadow-xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5" />
                    <span className="text-white/90 text-sm font-medium">Loyalty Points</span>
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl font-bold mb-1">{localLoyaltyPoints.toLocaleString()}</div>
                    <div className="text-white/80 text-sm">≈ ₹{localLoyaltyPoints.toLocaleString()} value</div>
                  </div>
                  <div className="flex items-center gap-1 text-white/80 text-xs">
                    <Gift className="w-3 h-3" />
                    <span>Earn more by booking movies</span>
                  </div>
                </div>
              </motion.div>

              {/* Statistics Card */}
              <motion.div
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 relative overflow-hidden group shadow-xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 text-sm font-medium">All Time</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 text-sm">Transactions</span>
                      <span className="font-bold text-blue-900">{total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 text-sm">Credits</span>
                      <span className="font-bold text-green-700">₹{totalCredit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-600 text-sm">Debits</span>
                      <span className="font-bold text-red-700">₹{totalDebit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants} className="max-w-7xl mx-auto mt-8">
        <AnimatePresence mode="wait">
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-100"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/5 to-purple-500/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveSection('history')}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
                  >
                    View All <ArrowUpRight className="w-4 h-4" />
                  </motion.button>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Transactions Yet</h3>
                    <p className="text-gray-500">Your transaction history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        onClick={() => setSelectedTransaction(transaction)}
                        className="group relative cursor-pointer"
                      >
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:border-yellow-300/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${getTransactionColor(transaction)} shadow-md`}>
                                {getTransactionIcon(transaction)}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                                  {transaction.description}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                  <Calendar className="w-3 h-3" />
                                  {formatRelativeTime(transaction.date)}
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      transaction.status === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : transaction.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {transaction.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`font-bold text-lg ${
                                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-400 capitalize">{transaction.source}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-100"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/5 to-pink-500/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
              <div className="relative">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Transaction History</h3>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <select
                      value={filterType}
                      onChange={(e) => handleFilterChange(e.target.value as 'all' | 'credit' | 'debit')}
                      className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all font-medium"
                    >
                      <option value="all">All Transactions</option>
                      <option value="credit">Credits Only</option>
                      <option value="debit">Debits Only</option>
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </motion.button>
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {filterButtons.map((filter) => (
                    <motion.button
                      key={filter.key}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleFilterChange(filter.key as 'all' | 'credit' | 'debit')}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 border-2 ${
                        filterType === filter.key
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {filter.label}
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          filterType === filter.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {filter.count}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Transactions Found</h3>
                    <p className="text-gray-500">Try adjusting your filters</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {transactions.map((transaction, index) => (
                        <motion.div
                          key={transaction.id}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.01, y: -2 }}
                          onClick={() => setSelectedTransaction(transaction)}
                          className="group relative cursor-pointer"
                        >
                          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:border-yellow-300/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${getTransactionColor(transaction)} shadow-md`}>
                                  {getTransactionIcon(transaction)}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                                    {transaction.description}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatRelativeTime(transaction.date)}
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        transaction.status === 'completed'
                                          ? 'bg-green-100 text-green-800'
                                          : transaction.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {transaction.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`font-bold text-xl ${
                                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                  }`}
                                >
                                  {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-400 capitalize">{transaction.source}</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Load More Button */}
                    {hasMoreTransactions && (
                      <div className="text-center mt-6">
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleLoadMore}
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md mx-auto text-sm hover:shadow-lg transition-shadow"
                        >
                          <TrendingUp className="w-4 h-4" />
                          Load More Transactions ({Math.min(5, total - transactions.length)} more)
                        </motion.button>
                      </div>
                    )}

                    {/* Showing count info */}
                    <div className="text-center mt-4 text-sm text-gray-500">
                      Showing {transactions.length} of {total} {filterType} transactions
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTransaction(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-modal-title"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-200/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 id="transaction-modal-title" className="text-2xl font-bold text-gray-900 mb-2">
                    Transaction Details
                  </h2>
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedTransaction.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : selectedTransaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedTransaction(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2"
                  aria-label="Close transaction details"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-4 rounded-xl ${getTransactionColor(selectedTransaction)} shadow-lg`}>
                      {getTransactionIcon(selectedTransaction)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedTransaction.description}</h3>
                      <p className="text-gray-600 capitalize">{selectedTransaction.source} transaction</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 font-medium">Amount</span>
                      <p
                        className={`text-2xl font-bold ${
                          selectedTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {selectedTransaction.type === 'credit' ? '+' : '-'}₹{selectedTransaction.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 font-medium">Transaction Date</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(selectedTransaction.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Transaction Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 font-medium">Transaction ID:</span>
                      <p className="font-mono text-gray-900 break-all">{selectedTransaction.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Type:</span>
                      <p className="font-semibold text-gray-900 capitalize">{selectedTransaction.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Source:</span>
                      <p className="font-semibold text-gray-900 capitalize">{selectedTransaction.source}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Status:</span>
                      <p className="font-semibold text-gray-900 capitalize">{selectedTransaction.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Convert Points Modal */}
      <AnimatePresence>
        {showConvertPoints && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConvertPoints(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="convert-points-modal-title"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-200/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 id="convert-points-modal-title" className="text-2xl font-bold text-gray-900">
                  Convert Loyalty Points
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowConvertPoints(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2"
                  aria-label="Close convert points modal"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">Enter Points to Convert</label>
                    <span className="text-sm text-gray-500">Available: {localLoyaltyPoints} points</span>
                  </div>
                  <input
                    type="number"
                    value={convertPoints}
                    onChange={(e) => setConvertPoints(e.target.value)}
                    placeholder="0 points"
                    className="w-full px-4 py-4 text-2xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all bg-white/50"
                    min="0"
                    max={localLoyaltyPoints}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {convertPoints ? `${convertPoints} points = ₹${parseFloat(convertPoints).toLocaleString()} wallet balance` : ''}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick Select</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[100, 200, 500, 1000].map((amount) => (
                      <motion.button
                        key={amount}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setConvertPoints(Math.min(amount, localLoyaltyPoints).toString())}
                        disabled={amount > localLoyaltyPoints}
                        className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                          amount > localLoyaltyPoints
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-transparent'
                            : 'bg-gray-100 hover:bg-yellow-50 hover:border-yellow-200 border-2 border-transparent text-gray-700 hover:text-yellow-700'
                        }`}
                      >
                        {amount} points
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConvertPoints(false)}
                    className="flex-1 py-3 bg-white border-2 border-gray-200 hover:bg-gray-50 rounded-xl font-semibold text-gray-700 transition-colors"
                    aria-label="Cancel"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConvertPoints}
                    disabled={convertPointsMutation.isLoading || !convertPoints || parseFloat(convertPoints) <= 0 || parseFloat(convertPoints) > localLoyaltyPoints}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 rounded-xl font-semibold text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Convert ${convertPoints || 0} points to wallet balance`}
                  >
                    {convertPointsMutation.isLoading ? (
                      <Loader/>
                    ) : (
                      `Convert ${convertPoints || 0} points`
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowConvertPoints(true)}
          className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-3xl transition-shadow border-4 border-white"
          aria-label="Open convert points modal"
        >
          <Star className="w-7 h-7" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default WalletTab;