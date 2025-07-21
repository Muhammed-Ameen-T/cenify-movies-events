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
  TrendingUp,
  Shield,
  Clock,
  Filter,
  Search,
  CreditCard,
  Loader,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { WalletData, Transaction, WalletTransactionsResponse, UserProfile } from '../../types';
import { getUserWallet, getUserWalletTransactions } from '../../services/User/profileApi';
import { formatRelativeTime } from '../../utils/timeFormator';
import BackButton from '../../components/Buttons/BackButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

// Shimmer Loading Component for Wallet Summary
const ShimmerWallet: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-transparent rounded-2xl p-6 mb-4">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="h-8 bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );
};

// Shimmer Loading Component for Transaction Items
const ShimmerTransaction: React.FC = () => {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg border bg-gray-700 w-10 h-10"></div>
          <div>
            <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-24"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-5 bg-gray-700 rounded w-20 mb-1"></div>
          <div className="h-3 bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
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

const VendorWalletTab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const queryClient = useQueryClient();
  const userId = user?.id || '';

  // Parse URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialLimit = parseInt(queryParams.get('limit') || '10', 10);
  const initialFilter = queryParams.get('filter') || 'all';

  const limit = isNaN(initialLimit) || initialLimit < 5 ? 10 : initialLimit;
  const validFilters = ['all', 'credit', 'debit'];
  const filter = validFilters.includes(initialFilter) ? (initialFilter as 'all' | 'credit' | 'debit') : 'all';

  const [showBalance, setShowBalance] = useState(true);
  const [currentLimit, setCurrentLimit] = useState(limit);
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>(filter);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Fetch wallet data
  const { data: walletData, isLoading: isWalletLoading, error: walletError } = useQuery<WalletData>({
    queryKey: ['vendorWallet', userId],
    queryFn: getUserWallet,
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });

  // Fetch transactions
  const {
    data: { transactions = [], total = 0, creditCount = 0, debitCount = 0, totalCredit = 0, totalDebit = 0 } = {},
    isLoading: isTransactionsLoading,
    error: transactionsError,
  } = useQuery<WalletTransactionsResponse>({
    queryKey: ['vendorWalletTransactions', userId, currentLimit, filterType],
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
    enabled: !!userId,
  });

  const handleLoadMore = () => {
    const newLimit = currentLimit + 10;
    setCurrentLimit(newLimit);
    updateUrl(newLimit, filterType);
  };

  const handleFilterChange = (newFilter: typeof filterType) => {
    setFilterType(newFilter);
    setCurrentLimit(10);
    updateUrl(10, newFilter);
  };

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.source) {
      case 'booking':
        return transaction.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />;
      case 'topup':
        return <Plus className="w-4 h-4" />;
      case 'refund':
        return <RefreshCw className="w-4 h-4" />;
      case 'loyalty':
        return <Star className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (transaction: Transaction) => {
    return transaction.type === 'credit'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  // Filter transactions by search term
  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasMoreTransactions = transactions.length < total;

  if (isWalletLoading) {
    return (
      <div className="min-h-screen bg-transparent py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(5)].map((_, index) => (
            <ShimmerWallet key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (walletError || transactionsError) {
    return (
      <div className="min-h-screen bg-gray-950 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800 mt-6"
          >
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Wallet</h3>
            <p className="text-gray-400">{(walletError || transactionsError)?.message || 'Something went wrong'}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-transparent py-6 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <BackButton />
          <div className="flex items-center gap-3 mt-3 mb-6">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <Wallet className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Vendor Wallet</h1>
              <p className="text-gray-400 text-sm">Manage your earnings and transactions</p>
            </div>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-indigo-100 text-sm font-medium">Available Balance</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </motion.button>
              </div>
              <div className="text-3xl font-bold mb-1">
                {showBalance ? `₹${(walletData?.balance || 0).toLocaleString()}` : '₹••••••'}
              </div>
              <div className="text-indigo-200 text-sm">Current wallet balance</div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Transactions</p>
                <p className="text-white font-semibold">{total}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Credits</p>
                <p className="text-emerald-400 font-semibold">₹{totalCredit.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Debits</p>
                <p className="text-red-400 font-semibold">₹{totalDebit.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div variants={itemVariants} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Transaction History
            </h2>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value as 'all' | 'credit' | 'debit')}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Transactions</option>
              <option value="credit">Credits Only</option>
              <option value="debit">Debits Only</option>
            </select>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { key: 'all', label: 'All', count: total },
              { key: 'credit', label: 'Credits', count: creditCount },
              { key: 'debit', label: 'Debits', count: debitCount },
            ].map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFilterChange(tab.key as 'all' | 'credit' | 'debit')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterType === tab.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </motion.button>
            ))}
          </div>

          {/* Transactions List */}
          {isTransactionsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <ShimmerTransaction key={index} />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Transactions Found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.02 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedTransaction(transaction)}
                    className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800 hover:border-gray-600 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg border ${getTransactionColor(transaction)}`}>
                          {getTransactionIcon(transaction)}
                        </div>
                        <div>
                          <h4 className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                            {transaction.description}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(transaction.date)}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 capitalize">
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold text-lg ${
                          transaction.type === 'credit' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">{transaction.source}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Load More Button */}
          {hasMoreTransactions && !isTransactionsLoading && (
            <div className="text-center mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLoadMore}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Load More ({Math.min(10, total - transactions.length)} more)
              </motion.button>
            </div>
          )}

          {/* Results Count */}
          <div className="text-center mt-4 text-sm text-gray-500">
            Showing {filteredTransactions.length} of {total} transactions
          </div>
        </motion.div>
      </div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-auto border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Transaction Details</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTransaction.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : selectedTransaction.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedTransaction(null)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg p-2"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${getTransactionColor(selectedTransaction)}`}>
                      {getTransactionIcon(selectedTransaction)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{selectedTransaction.description}</h4>
                      <p className="text-gray-400 text-sm capitalize">{selectedTransaction.source} transaction</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Amount</p>
                      <p className={`text-xl font-bold ${
                        selectedTransaction.type === 'credit' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {selectedTransaction.type === 'credit' ? '+' : '-'}₹{selectedTransaction.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Date</p>
                      <p className="text-white font-medium">
                        {new Date(selectedTransaction.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4">
                  <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    Transaction Info
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transaction ID:</span>
                      <span className="font-mono text-white text-xs">{selectedTransaction.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white capitalize">{selectedTransaction.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Source:</span>
                      <span className="text-white capitalize">{selectedTransaction.source}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VendorWalletTab;