import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Edit,
  Lock,
  ChevronRight,
  Calendar,
  Phone,
  Mail,
  Camera,
  Shield,
  Trash2,
  Crown,
  Award,
  Clock,
  Sparkles,
  Wallet,
  Ticket,
  Zap,
  TrendingUp,
  Heart,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { formatRelativeTime } from '../../utils/timeFormator';
import { useQuery } from '@tanstack/react-query';
import { getUserContent } from '../../services/User/profileApi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AccountTabProps {
  user: UserProfile;
  isLoading: boolean;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Define types for getUserContent response
interface UserContent {
  walletBalance: number;
  bookingsCount: number;
  moviePass: {
    status: 'Active' | 'Inactive' | 'Expired';
    type?: string;
    expiryDate?: string;
    _id?: string;
    userId?: string;
    history?: Array<any>;
    purchaseDate?: string;
  } | null;
}

const AccountTab: React.FC<AccountTabProps> = ({
  user,
  isLoading,
  onEditProfile,
  onChangePassword,
  onImageUpload,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Use user directly with minimal fallbacks
  const safeUser: UserProfile = {
    id: user.id || '',
    name: user.name || 'N/A',
    email: user.email || 'N/A',
    phone: user.phone || 'N/A',
    dateOfBirth: user.dateOfBirth || 'N/A',
    joinedDate: user.joinedDate || new Date().toISOString(),
    loyalityPoints: user.loyalityPoints ?? 0,
    profileImage: user.profileImage || import.meta.env.VITE_DEFAULT_PROFILE_IMAGE,
    role: user.role || 'user',
  };

  // Fetch user content with useQuery
  const { data: userContent, isLoading: isContentLoading, error: contentError } = useQuery<UserContent>({
    queryKey: ['getUserContent'],
    queryFn: async () => {
      const response = await getUserContent();
      return {
        walletBalance: response?.walletBalance ?? 0,
        bookingsCount: response?.bookingsCount ?? 0,
        moviePass: response?.moviePass || null,
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    onError: (err: any) => {
      console.error('Failed to fetch user content:', err);
      toast.error('Failed to load user data');
    },
    onSuccess: (data) => {
      console.log('🚀 ~ userContent:', data);
    },
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  const shimmerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };

  const shimmerItemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  // Get loyalty tier
  const getLoyaltyTier = (points: number) => {
    if (points >= 350) return { name: 'Platinum', color: 'from-purple-400 to-purple-700', icon: Crown };
    if (points >= 250) return { name: 'Gold', color: 'from-yellow-400 to-yellow-600', icon: Award };
    if (points >= 150) return { name: 'Silver', color: 'from-gray-400 to-gray-600', icon: Star };
    return { name: 'Bronze', color: 'from-orange-400 to-orange-600', icon: Sparkles };
  };

  const loyaltyTier = getLoyaltyTier(safeUser.loyalityPoints);
  const TierIcon = loyaltyTier.icon;

  // Handle buy subscription
  const handleBuySubscription = () => {
    navigate('/account/moviepass-tab');
  };

  const ShimmerUI = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={shimmerVariants}
      className="space-y-8"
    >
      {/* Profile Header Shimmer */}
      <motion.div variants={shimmerItemVariants} className="relative">
        <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <div className="h-8 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse mb-2"></div>
                <div className="h-5 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-4 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                    <div className="h-6 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-36 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
                <div className="h-12 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards Shimmer */}
      <motion.div variants={shimmerItemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50">
            <div className="h-12 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse mb-4"></div>
            <div className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
          </div>
        ))}
      </motion.div>

      {/* Settings Sections Shimmer */}
      {[...Array(2)].map((_, sectionIndex) => (
        <motion.div key={sectionIndex} variants={shimmerItemVariants} className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
          <div className="h-6 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                    <div className="h-4 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-6 w-11 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  if (isLoading || isContentLoading) {
    return <ShimmerUI />;
  }

  if (contentError) {
    return (
      <div className="text-center text-red-600 font-semibold">
        Failed to load user data. Please try again later.
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Profile Header */}
        <motion.div variants={itemVariants} className="relative">
          <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-300/10 to-yellow-500/10 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
                <span className="text-yellow-600 font-bold text-sm uppercase tracking-wider">Profile Overview</span>
              </div>
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                <motion.div whileHover={{ scale: 1.05 }} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative">
                    <img
                      src={safeUser.profileImage}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl cursor-pointer relative z-10"
                      onClick={() => setIsModalOpen(true)}
                    />
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute -bottom-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-3 shadow-xl cursor-pointer z-20 border-2 border-white"
                      onClick={() => document.getElementById('profile-image-input')?.click()}
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </motion.div>
                    <input
                      id="profile-image-input"
                      type="file"
                      accept="image/*"
                      onChange={onImageUpload}
                      className="hidden"
                    />
                  </div>
                </motion.div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">{safeUser.name}</h1>
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${loyaltyTier.color} text-white text-sm font-semibold flex items-center gap-1`}>
                        <TierIcon className="w-4 h-4" />
                        {loyaltyTier.name} Member
                      </div>
                      <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                        Active
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Email</p>
                        <p className="font-semibold text-gray-900">{safeUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-xl">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Phone</p>
                        <p className="font-semibold text-gray-900">{safeUser.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-xl">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Date of Birth</p>
                        <p className="font-semibold text-gray-900">
                          {safeUser.dateOfBirth !== 'N/A'
                            ? new Date(safeUser.dateOfBirth).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-xl">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Member Joined</p>
                        <p className="font-semibold text-gray-900">
                          {safeUser.joinedDate ? formatRelativeTime(safeUser.joinedDate) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={onEditProfile}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold"
                    >
                      <Edit size={18} /> Edit Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={onChangePassword}
                      className="bg-white border-2 border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300 py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold"
                    >
                      <Lock size={18} /> Change Password
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Loyalty Points */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-blue-200/50 group hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Star className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{safeUser.loyalityPoints}</h3>
            <p className="text-blue-600 font-medium">Loyalty Points</p>
          </motion.div>

          {/* Total Bookings */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-gradient-to-br from-white/90 to-green-50/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-green-200/50 group hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <Zap className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{userContent?.bookingsCount ?? 0}</h3>
            <p className="text-green-600 font-medium">Total Bookings</p>
          </motion.div>

          {/* Wallet Balance */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-gradient-to-br from-white/90 to-orange-50/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-orange-200/50 group hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{userContent?.walletBalance.toLocaleString() ?? '0'}</h3>
            <p className="text-orange-600 font-medium">Wallet Balance</p>
          </motion.div>

          {/* Movie Pass or Buy Subscription */}
          {userContent?.moviePass?.status === 'Active' ? (
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-200/50 group hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <Crown className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{userContent.moviePass.type || 'Movie Pass'}</h3>
              <p className="text-purple-600 font-medium">Active Subscription</p>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-gradient-to-br from-white/90 to-yellow-50/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-yellow-200/50 group hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">No Active Pass</h3>
                <p className="text-yellow-600 font-medium">Regular User</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBuySubscription}
                className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-2 px-4 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold"
              >
                <Ticket size={18} /> Buy Subscription
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Privacy & Security */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-red-400 to-red-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Privacy & Security</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Change Password', desc: 'Update your account password', icon: Lock, action: onChangePassword, color: 'blue' },
              // { label: 'Delete Account', desc: 'Permanently remove your account', icon: Trash2, action: () => {}, color: 'red' },
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.action}
                  className="w-full text-left flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/20 rounded-xl transition-all duration-300 group border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 bg-${item.color}-100 group-hover:bg-${item.color}-200 rounded-xl transition-all duration-300`}>
                      <IconComponent className={`w-5 h-5 text-${item.color}-600`} />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">{item.label}</span>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0  }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 bg-gray-900/90"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={safeUser.profileImage}
                  alt="Enlarged Profile Picture"
                  className="w-full max-h-[60vh] object-contain rounded-2xl"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full p-3 transition-all duration-300 backdrop-blur-sm"
                >
                  <svg
                    className="w-5 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccountTab;