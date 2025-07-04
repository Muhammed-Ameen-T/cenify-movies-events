import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertCircle,
  Bell,
  X,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Clock,
  Theater,
  Users,
  DollarSign,
  Star,
  Settings,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  fetchAllUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/User/notificationApi';
import { NotificationDocument } from '../../types/index';
import { toast } from 'react-hot-toast';
import { formatRelativeTime } from '../../utils/timeFormator';
import BackButton from '../../components/Buttons/BackButton';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../components/Shared/Loading';
import ShimmerNotification from '../../components/Admin/NotificationShimmer';

// Simplified Notification interface for display
interface VendorNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'booking' | 'theater' | 'payment' | 'review' | 'system' | 'alert';
}

// Get notification icon based on type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'booking':
      return Users;
    case 'theater':
      return Theater;
    case 'payment':
      return DollarSign;
    case 'review':
      return Star;
    case 'system':
      return Settings;
    case 'alert':
      return AlertTriangle;
    default:
      return Bell;
  }
};

// Get notification color based on type
const getNotificationColors = (type: string, isRead: boolean) => {
  const colors = {
    booking: {
      bg: !isRead ? 'from-blue-500/10 to-blue-600/10' : 'from-gray-800/30 to-gray-700/30',
      border: !isRead ? 'border-blue-500/30' : 'border-gray-600/30',
      icon: !isRead ? 'bg-blue-500' : 'bg-gray-600',
      text: !isRead ? 'text-blue-400' : 'text-gray-400',
    },
    theater: {
      bg: !isRead ? 'from-purple-500/10 to-purple-600/10' : 'from-gray-800/30 to-gray-700/30',
      border: !isRead ? 'border-purple-500/30' : 'border-gray-600/30',
      icon: !isRead ? 'bg-purple-500' : 'bg-gray-600',
      text: !isRead ? 'text-purple-400' : 'text-gray-400',
    },
    payment: {
      bg: !isRead ? 'from-green-500/10 to-green-600/10' : 'from-gray-800/30 to-gray-700/30',
      border: !isRead ? 'border-green-500/30' : 'border-gray-600/30',
      icon: !isRead ? 'bg-green-500' : 'bg-gray-600',
      text: !isRead ? 'text-green-400' : 'text-gray-400',
    },
    review: {
      bg: !isRead ? 'from-yellow-500/10 to-yellow-600/10' : 'from-gray-800/30 to-gray-700/30',
      border: !isRead ? 'border-yellow-500/30' : 'border-gray-600/30',
      icon: !isRead ? 'bg-yellow-500' : 'bg-gray-600',
      text: !isRead ? 'text-yellow-400' : 'text-gray-400',
    },
    alert: {
      bg: !isRead ? 'from-red-500/10 to-red-600/10' : 'from-gray-800/30 to-gray-700/30',
      border: !isRead ? 'border-red-500/30' : 'border-gray-600/30',
      icon: !isRead ? 'bg-red-500' : 'bg-gray-600',
      text: !isRead ? 'text-red-400' : 'text-gray-400',
    },
    system: {
      bg: !isRead ? 'from-indigo-500/10 to-indigo-600/10' : 'from-gray-800/30 to-gray-700/30',
      border: !isRead ? 'border-indigo-500/30' : 'border-gray-600/30',
      icon: !isRead ? 'bg-indigo-500' : 'bg-gray-600',
      text: !isRead ? 'text-indigo-400' : 'text-gray-400',
    },
  };
  return colors[type as keyof typeof colors] || colors.system;
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

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

const VendorNotifications: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Parse URL query parameters with validation
  const queryParams = new URLSearchParams(location.search);
  const initialLimit = parseInt(queryParams.get('limit') || '5', 10);
  const initialFilter = queryParams.get('filter') || 'all';

  // Validate query parameters
  const limit = isNaN(initialLimit) || initialLimit < 5 ? 5 : initialLimit;
  const validFilters = ['all', 'unread', 'read'];
  const filter = validFilters.includes(initialFilter)
    ? (initialFilter as 'all' | 'unread' | 'read')
    : 'all';

  const [currentLimit, setCurrentLimit] = useState(limit);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'unread' | 'read'>(filter);
  const [selectedNotification, setSelectedNotification] = useState<VendorNotification | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Update URL when limit or filter changes
  const updateUrl = useCallback(
    (newLimit: number, newFilter: typeof currentFilter) => {
      const params = new URLSearchParams({
        limit: newLimit.toString(),
        filter: newFilter,
      });
      navigate({ search: params.toString() });
    },
    [navigate]
  );

  // Fetch notifications with limit and filter
  const {
    data: { notifications = [], total = 0, unreadCount = 0, readCount = 0 } = {},
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['vendor-notifications', currentLimit, currentFilter],
    queryFn: async () => {
      const response = await fetchAllUserNotifications({
        page: 1,
        limit: currentLimit,
        filter: currentFilter,
      });
      return {
        notifications: response.notifications.map((doc: NotificationDocument) => ({
          id: doc._id.toString(),
          title: doc.title,
          message: doc.description,
          date: doc.createdAt.toString(),
          read: doc.isRead,
          type: doc.type || 'system',
        })),
        total: response.total,
        unreadCount: response.unreadCount,
        readCount: response.readCount,
      };
    },
    staleTime: 5000,
  });

  // Mutation for marking a single notification as read
  const markAsReadMutation = useMutation<void, Error, string>({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['vendor-notifications', currentLimit, currentFilter] });
      const previousData = queryClient.getQueryData(['vendor-notifications', currentLimit, currentFilter]);
      queryClient.setQueryData(['vendor-notifications', currentLimit, currentFilter], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          notifications: oldData.notifications.map((notification: VendorNotification) =>
            notification.id === notificationId ? { ...notification, read: true } : notification
          ),
          unreadCount: oldData.unreadCount - 1,
          readCount: oldData.readCount + 1,
        };
      });
      return { previousData };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['vendor-notifications', currentLimit, currentFilter], context?.previousData);
      toast.error('Failed to mark notification as read');
    },
    onSuccess: () => {
      toast.success('Notification marked as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-notifications', currentLimit, currentFilter] });
    },
  });

  // Mutation for marking all notifications as read
  const markAllAsReadMutation = useMutation<void, Error>({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['vendor-notifications', currentLimit, currentFilter] });
      const previousData = queryClient.getQueryData(['vendor-notifications', currentLimit, currentFilter]);
      queryClient.setQueryData(['vendor-notifications', currentLimit, currentFilter], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          notifications: oldData.notifications.map((notification: VendorNotification) => ({
            ...notification,
            read: true,
          })),
          unreadCount: 0,
          readCount: oldData.total,
        };
      });
      return { previousData };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['vendor-notifications', currentLimit, currentFilter], context?.previousData);
      toast.error('Failed to mark all notifications as read');
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
      setShowConfirmModal(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-notifications'] });
    },
  });

  // Handle load more
  const handleLoadMore = () => {
    const newLimit = currentLimit + 5;
    setCurrentLimit(newLimit);
    updateUrl(newLimit, currentFilter);
  };

  // Handle filter change
  const handleFilterChange = (newFilter: typeof currentFilter) => {
    setCurrentFilter(newFilter);
    setCurrentLimit(5);
    updateUrl(5, newFilter);
  };

  // Handle marking a single notification as read
  const handleMarkRead = (id: string) => {
    if (!notifications.find((n) => n.id === id)?.read) {
      markAsReadMutation.mutate(id);
    }
  };

  // Check if there are more notifications to load
  const hasMoreNotifications = notifications.length < total;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-3">
          {[...Array(5)].map((_, index) => (
            <ShimmerNotification key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-transparent px-4">
        <BackButton />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-gray-700/50 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Error Loading Notifications</h3>
            <p className="text-gray-400">{error?.message || 'Something went wrong'}</p>
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
      className="min-h-screen bg-transparent py-0 px-4"
    >
      {/* Header with Stats */}
      <motion.div variants={itemVariants} className="max-w-5xl mx-auto mb-6">
        <BackButton />
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-700/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full"></div>
                  <h1 className="text-2xl font-bold text-white">Vendor Notifications</h1>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold">{unreadCount} unread</span>
                  </div>
                  <div className="text-gray-400">{total} total</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirmModal(true)}
                    className="bg-gray-700 border border-gray-600 text-gray-300 px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-gray-600 transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark All Read
                  </motion.button>
                )}
                <select
                  value={currentFilter}
                  onChange={(e) => handleFilterChange(e.target.value as 'all' | 'unread' | 'read')}
                  className="appearance-none bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all font-medium text-sm text-white"
                >
                  <option value="all">All ({total})</option>
                  <option value="unread">Unread ({unreadCount})</option>
                  <option value="read">Read ({readCount})</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications List */}
      <motion.div variants={itemVariants} className="max-w-5xl mx-auto">
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-700/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="relative">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {currentFilter === 'all'
                    ? 'No Notifications Yet'
                    : currentFilter === 'unread'
                    ? 'No Unread Notifications'
                    : 'No Read Notifications'}
                </h3>
                <p className="text-gray-400">
                  {currentFilter === 'all'
                    ? "We'll notify you about important updates and activities!"
                    : currentFilter === 'unread'
                    ? 'All caught up! No new notifications to review.'
                    : 'No notifications have been read yet.'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {notifications.map((notification, index) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    const colors = getNotificationColors(notification.type, notification.read);

                    return (
                      <motion.div
                        key={notification.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, y: -1 }}
                        onClick={() => setSelectedNotification(notification)}
                        className="group relative cursor-pointer"
                      >
                        <div
                          className={`bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-xl p-4 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:border-indigo-400/50`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`${colors.icon} text-white p-2 rounded-lg shadow-sm flex-shrink-0`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`font-semibold group-hover:text-indigo-300 transition-colors mb-1 ${
                                    !notification.read ? 'text-white' : 'text-gray-300'
                                  }`}
                                >
                                  {notification.title}
                                </div>
                                <div className="text-sm text-gray-400 mb-2 line-clamp-2">
                                  {notification.message}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatRelativeTime(notification.date)}
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full font-medium text-xs ${colors.text} ${
                                      colors.bg.replace('/10', '/20')
                                    } border ${colors.border}`}
                                  >
                                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                  </span>
                                  {!notification.read && (
                                    <span className="px-2 py-0.5 rounded-full font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                      New
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {!notification.read && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkRead(notification.id);
                                }}
                                className="text-indigo-400 hover:text-indigo-300 p-1 flex-shrink-0"
                                aria-label={`Mark notification ${notification.title} as read`}
                              >
                                <CheckCircle className="w-5 h-5" />
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {hasMoreNotifications && (
                  <div className="text-center mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLoadMore}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md mx-auto text-sm hover:shadow-lg transition-shadow"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Load More Notifications ({Math.min(5, total - notifications.length)} more)
                    </motion.button>
                  </div>
                )}

                {/* Showing count info */}
                <div className="text-center mt-4 text-sm text-gray-500">
                  Showing {notifications.length} of {total} {currentFilter} notifications
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Notification Detail Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNotification(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-modal-title"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 id="notification-modal-title" className="text-2xl font-bold text-white mb-2">
                    {selectedNotification.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                        !selectedNotification.read
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                      }`}
                    >
                      {selectedNotification.read ? 'Read' : 'Unread'}
                    </div>
                    <div
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                        getNotificationColors(selectedNotification.type, false).text
                      } ${getNotificationColors(selectedNotification.type, false).bg.replace('/10', '/20')} border ${
                        getNotificationColors(selectedNotification.type, false).border
                      }`}
                    >
                      {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)}
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedNotification(null)}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full p-2"
                  aria-label="Close notification details"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-2xl p-6 border border-gray-600/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`${getNotificationColors(selectedNotification.type, false).icon} text-white p-4 rounded-xl shadow-lg`}
                    >
                      {React.createElement(getNotificationIcon(selectedNotification.type), { className: 'w-6 h-6' })}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedNotification.title}</h3>
                      <p className="text-gray-400">Notification Details</p>
                    </div>
                  </div>
                  <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50">
                    <p className="text-gray-200 leading-relaxed">{selectedNotification.message}</p>
                  </div>
                </div>

                <div className="bg-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    Notification Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400 font-medium">Received:</span>
                      <p className="font-semibold text-white">
                        {new Date(selectedNotification.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">Type:</span>
                      <p className="font-semibold text-white capitalize">{selectedNotification.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">Status:</span>
                      <p className="font-semibold text-white capitalize">
                        {selectedNotification.read ? 'Read' : 'Unread'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium">Priority:</span>
                      <p className="font-semibold text-white">
                        {selectedNotification.type === 'alert'
                          ? 'High'
                          : selectedNotification.type === 'payment'
                          ? 'Medium'
                          : 'Normal'}
                      </p>
                    </div>
                  </div>
                </div>

                {!selectedNotification.read && (
                  <div className="flex justify-center pt-4">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        handleMarkRead(selectedNotification.id);
                        setSelectedNotification(null);
                      }}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark as Read
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mark All Read Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <h3 id="confirm-modal-title" className="text-xl font-bold text-white">
                  Mark All as Read
                </h3>
              </div>
              <p className="text-gray-400 mb-6 text-center">
                Are you sure you want to mark all {unreadCount} unread notifications as read? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowConfirmModal(false)}
                  className="bg-gray-700 border-2 border-gray-600 text-gray-300 px-6 py-2 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                  aria-label="Cancel"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isLoading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
                  aria-label="Confirm mark all as read"
                >
                  {markAllAsReadMutation.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VendorNotifications;