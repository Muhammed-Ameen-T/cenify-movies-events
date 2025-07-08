import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertCircle,
  Bell,
  X,
  Loader2,
  AlertTriangle,
  Calendar,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  fetchAllUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/User/notificationApi';
import { Notification } from '../../types/index';
import toast from 'react-hot-toast';
import { formatRelativeTime } from '../../utils/timeFormator';
import ShimmerNotification from '../User/NotificationShimmer';

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

const dropdownVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      staggerChildren: 0.05,
    },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const dropdownItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

const NotificationsTab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse URL query parameters with validation
  const queryParams = new URLSearchParams(location.search);
  const initialLimit = parseInt(queryParams.get('limit') || '5', 10);
  const initialFilter = queryParams.get('filter') || 'all';

  // Validate query parameters
  const limit = isNaN(initialLimit) || initialLimit < 5 ? 5 : initialLimit;
  const filter = ['all', 'unread', 'read'].includes(initialFilter)
    ? (initialFilter as 'all' | 'unread' | 'read')
    : 'all';

  const [currentLimit, setCurrentLimit] = useState(limit);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'unread' | 'read'>(filter);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Update URL when limit or filter changes
  const updateUrl = useCallback(
    (newLimit: number, newFilter: 'all' | 'unread' | 'read') => {
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
    queryKey: ['notifications', currentLimit, currentFilter],
    queryFn: async () =>
      fetchAllUserNotifications({
        page: 1, // Always page 1 since we're using limit
        limit: currentLimit,
        filter: currentFilter,
      }),
    staleTime: 5000,
  });

  // Mutation for marking a single notification as read
  const markAsReadMutation = useMutation<void, Error, string>({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications', currentLimit, currentFilter] });
      const previousData = queryClient.getQueryData(['notifications', currentLimit, currentFilter]);
      queryClient.setQueryData(['notifications', currentLimit, currentFilter], (oldData: any) => {
        if (!oldData) return oldData;
        const notification = oldData.notifications.find((n: Notification) => n._id === notificationId);
        if (!notification || notification.read) return oldData;
        return {
          ...oldData,
          notifications: oldData.notifications.map((n: Notification) =>
            n._id === notificationId ? { ...n, read: true } : n
          ),
          unreadCount: oldData.unreadCount - 1,
          readCount: oldData.readCount + 1,
        };
      });
      return { previousData };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['notifications', currentLimit, currentFilter], context?.previousData);
      toast.error('Failed to mark notification as read');
    },
    onSuccess: () => {
      toast.success('Notification marked as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', currentLimit, currentFilter] });
    },
  });

  // Mutation for marking all notifications as read
  const markAllAsReadMutation = useMutation<void, Error>({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications', currentLimit, currentFilter] });
      const previousData = queryClient.getQueryData(['notifications', currentLimit, currentFilter]);
      queryClient.setQueryData(['notifications', currentLimit, currentFilter], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          notifications: oldData.notifications.map((notification: Notification) => ({
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
      queryClient.setQueryData(['notifications', currentLimit, currentFilter], context?.previousData);
      toast.error('Failed to mark all notifications as read');
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
      setShowConfirmModal(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Handle load more
  const handleLoadMore = () => {
    const newLimit = currentLimit + 5;
    setCurrentLimit(newLimit);
    updateUrl(newLimit, currentFilter);
  };

  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'unread' | 'read') => {
    setCurrentFilter(newFilter);
    setCurrentLimit(5); // Reset limit when filter changes
    setIsDropdownOpen(false);
    updateUrl(5, newFilter);
  };

  // Handle clicking outside dropdown to close it
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Handle marking a single notification as read
  const handleMarkRead = (id: string) => {
    if (!notifications.find((n) => n._id === id)?.isRead) {
      markAsReadMutation.mutate(id);
    }
  };

  // Check if there are more notifications to load
  const hasMoreNotifications = notifications.length < total;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4">
        <ShimmerNotification />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient- to-br from-gray-50 to-white py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-gray-100 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Notifications</h3>
            <p className="text-gray-500">{error?.message || 'Something went wrong'}</p>
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
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
                  <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold">{unreadCount} unread</span>
                  </div>
                  <div className="text-gray-500">{total} total</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirmModal(true)}
                    className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark All Read
                  </motion.button>
                )}
                 <select
                  value={currentFilter}
                  onChange={(e) => handleFilterChange(e.target.value as 'all' | 'unread' | 'read')}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all font-medium text-sm"
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
      <motion.div variants={itemVariants} className="max-w-7xl mx-auto mt-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/5 to-purple-500/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="relative">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {currentFilter === 'all'
                    ? 'No Notifications Yet'
                    : currentFilter === 'unread'
                    ? 'No Unread Notifications'
                    : 'No Read Notifications'}
                </h3>
                <p className="text-gray-500">
                  {currentFilter === 'all'
                    ? "We'll let you know when something exciting happens!"
                    : currentFilter === 'unread'
                    ? 'All caught up! No new notifications to review.'
                    : 'No notifications have been read yet.'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, y: -1 }}
                      onClick={() => setSelectedNotification(notification)}
                      className="group relative cursor-pointer"
                    >
                      <div
                        className={`border rounded-xl p-4 shadow-sm group-hover:shadow-md transition-all duration-300 ${
                          !notification.isRead
                            ? 'bg-gradient-to-r from-blue-50/80 to-blue-100/80 border-blue-200 group-hover:border-blue-300/70'
                            : 'bg-white border-gray-200 group-hover:border-yellow-300/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className={`p-2 rounded-lg shadow-sm flex-shrink-0 ${
                                !notification.isRead ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={`font-semibold group-hover:text-yellow-600 transition-colors mb-1 ${
                                  !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                }`}
                              >
                                {notification.title}
                              </div>
                              <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {notification.description}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatRelativeTime(notification.createdAt)}
                                </div>
                                {!notification.isRead && (
                                  <span className="px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {!notification.isRead && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkRead(notification._id);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 flex-shrink-0"
                              aria-label={`Mark notification ${notification.title} as read`}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMoreNotifications && (
                  <div className="text-center mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLoadMore}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md mx-auto text-sm hover:shadow-lg transition-shadow"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-200/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 id="notification-modal-title" className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedNotification.title}
                  </h2>
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                      !selectedNotification.isRead ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedNotification.isRead ? 'Read' : 'Unread'}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedNotification(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2"
                  aria-label="Close notification details"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`p-4 rounded-xl shadow-lg ${
                        !selectedNotification.isRead ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedNotification.title}</h3>
                      <p className="text-gray-600">Notification Details</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-gray-800 leading-relaxed">{selectedNotification.description}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Notification Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 font-medium">Received:</span>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedNotification.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Status:</span>
                      <p className="font-semibold text-gray-900 capitalize">
                        {selectedNotification.isRead ? 'Read' : 'Unread'}
                      </p>
                    </div>
                  </div>
                </div>

                {!selectedNotification.isRead && (
                  <div className="flex justify-center pt-4">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        handleMarkRead(selectedNotification._id);
                        setSelectedNotification(null);
                      }}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4"
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
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <h3 id="confirm-modal-title" className="text-xl font-bold text-gray-900">
                  Mark All as Read
                </h3>
              </div>
              <p className="text-gray-600 mb-6 text-center">
                Are you sure you want to mark all {unreadCount} unread notifications as read? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowConfirmModal(false)}
                  className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold"
                  aria-label="Cancel"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isLoading}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
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

export default NotificationsTab;