import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Ticket, Gift, Star, Film, LogOut, X, Menu, Wallet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TabType, UserProfile, PasswordChange } from '../../types/index';
import { mockUser, mockBookings, mockNotifications } from '../../Data/MockData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, updateProfile, uploadToCloudinary } from '../../services/User/profileApi';
import { toast } from 'react-hot-toast';

// Components
import BookingsTab from '../../components/UserProfile/BookingTab';
import NotificationsTab from '../../components/UserProfile/NotificationTab';
import WalletTab from '../../components/UserProfile/WalletTab';
import MoviePassTab from '../../components/UserProfile/MoviePassTab';
import ProfileModal from '../../components/UserProfile/ProfileUpdateModal';
import PasswordModal from '../../components/UserProfile/ChangePasswordModal';
import ImageCropperModal from '../../components/UserProfile/ImageCroppperModal';
import AccountTab from '../../components/UserProfile/AccountTab';
import api from '../../config/axios.config';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../../store/slices/authSlice';
import { showSuccessToast } from '../../utils/toast';

export default function TheaterProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return getCurrentUser();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Extract tab from route path
  const pathSegments = location.pathname.split('/');
  const tabFromPath = pathSegments[pathSegments.length - 1].replace('-tab', '') as TabType;
  const validTabs: TabType[] = ['account', 'bookings', 'notifications', 'wallet', 'moviepass'];
  const initialTab = validTabs.includes(tabFromPath) ? tabFromPath : 'account';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [passwordChange, setPasswordChange] = useState<PasswordChange>({
    oldPassword: '',
    newPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isImageCropperOpen, setIsImageCropperOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Initialize and update editedProfile
  useEffect(() => {
    if (data) {
      setEditedProfile(data);
      setPreviewImage(null);
    } else {
      setEditedProfile(mockUser);
    }
  }, [data]);

  // Update activeTab when route changes
  useEffect(() => {
    const currentTab = pathSegments[pathSegments.length - 1].replace('-tab', '') as TabType;
    if (validTabs.includes(currentTab) && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [location.pathname]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (updatedUser) => {
      queryClient.setQueryData(['currentUser'], updatedUser);
      await refetch();
      setEditedProfile(updatedUser);
      setIsModalOpen(false);
      setPreviewImage(null);
      setImageSrc(null);
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  // Validate image file
  const validateImageFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG image formats are accepted');
      return false;
    }
    if (file.size > maxSize) {
      toast.error('Image size should not exceed 5MB');
      return false;
    }
    return true;
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateImageFile(file)) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          setImageSrc(reader.result as string);
          setIsImageCropperOpen(true);
        });
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle cropped image save
  const handleImageSave = async (croppedFile: File) => {
    try {
      const url = await uploadToCloudinary(croppedFile);
      setPreviewImage(url);
      setEditedProfile((prev) => (prev ? { ...prev, profileImage: url } : prev));
      setIsImageCropperOpen(false);
      setImageSrc(null);
    } catch (error) {
      toast.error('Image upload failed');
      console.error('Upload error:', error);
    }
  };

  // Password change handler
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordChange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Password form submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password change submitted:', passwordChange);
    setIsPasswordModalOpen(false);
    setPasswordChange({ oldPassword: '', newPassword: '' });
  };

  // Form validation
  const validateForm = (currentProfile: UserProfile, originalProfile: UserProfile | null): boolean => {
    const newErrors: Partial<Record<keyof UserProfile, string>> = {};

    if (currentProfile.name !== originalProfile?.name) {
      if (!currentProfile.name?.trim()) {
        newErrors.name = 'Name is required';
      } else if (currentProfile.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
    }

    if (currentProfile.phone !== originalProfile?.phone) {
      if (!currentProfile.phone?.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(currentProfile.phone.trim())) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if any field has changed
  const hasChanges = (currentProfile: UserProfile, originalProfile: UserProfile | null): boolean => {
    if (!originalProfile) return true;
    return (
      currentProfile.name !== originalProfile.name ||
      currentProfile.phone !== originalProfile.phone ||
      currentProfile.profileImage !== originalProfile.profileImage ||
      currentProfile.dateOfBirth !== originalProfile.dateOfBirth
    );
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedProfile && validateForm(editedProfile, data || mockUser) && hasChanges(editedProfile, data || mockUser)) {
      updateProfileMutation.mutate({
        name: editedProfile.name,
        phone: editedProfile.phone,
        profileImage: editedProfile.profileImage,
        dob: editedProfile.dateOfBirth || null,
      });
    } else if (!hasChanges(editedProfile, data || mockUser)) {
      toast.error('No changes to save');
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) =>
      prev ? { ...prev, [name]: value || null } : prev
    );
  };

   const handleLogout = () => {
      api.post(`/auth/logout`);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      dispatch(clearAuth());
      navigate('/');
      showSuccessToast('User Logout successfully!');
  };

  // Tabs configuration
  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="w-5 h-5" />, route: 'account-tab' },
    { id: 'bookings', label: 'Bookings', icon: <Ticket className="w-5 h-5" />, route: 'bookings-tab' },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, route: 'notifications-tab' },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-5 h-5" />, route: 'wallet-tab' },
    { id: 'moviepass', label: 'Movie Pass', icon: <Film className="w-5 h-5" />, route: 'moviepass-tab' },
  ];

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const slideIn = {
    hidden: { x: -300, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 120,
        duration: 0.6,
      },
    },
  };

  // Handle tab change
  const handleTabChange = (tabId: TabType) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {  
      setActiveTab(tabId);
      navigate(`/account/${tab.route}`);
      setIsMobileMenuOpen(false);
    }
  };

  // Handle authentication error
  if (isError && error?.message === 'No access token found') {
    navigate('/login', { replace: true });
    return null;
  }

  // Handle general error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex justify-center items-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-2xl">
          <div className="text-red-600 text-lg font-semibold">Error loading user data</div>
          <div className="text-gray-600 mt-2">{error?.message || 'Unknown error'}</div>
        </div>
      </div>
    );
  }

  // Fallback to mockUser if data is undefined
  const userData = data || mockUser

  // Dummy callback functions
  const handlePurchasePass = () => {
    console.log('Movie Pass purchased!');
  };

  const handleViewHistory = () => {
    console.log('Viewing pass history...');
  };

  // Tab content components
  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <AccountTab
            user={userData}
            isLoading={isLoading}
            onEditProfile={() => setIsModalOpen(true)}
            onChangePassword={() => setIsPasswordModalOpen(true)}
            onImageUpload={handleImageUpload}
          />
        );
      case 'bookings':
        return <BookingsTab />;
      case 'notifications':
        return <NotificationsTab  />;
      case 'wallet':
        return <WalletTab user={userData} />;
      case 'moviepass':
        return (
          <MoviePassTab
            isLoading={false}
            onViewHistory={handleViewHistory}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
      </div>

      {/* Mobile Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/95 backdrop-blur-sm shadow-xl p-4 md:hidden flex items-center justify-between relative z-10 border-b border-gray-100 fixed top-0 left-0 right-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Profile</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-300 bg-white shadow-lg border border-gray-200"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </motion.button>
      </motion.div>

      {/* Main Container with proper padding for mobile header */}
      <div className="pt-0 md:pt-1">
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Sidebar (Slide-in menu) */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed left-0 top-0 bottom-0 z-50 bg-white/95 backdrop-blur-xl md:hidden w-80 shadow-2xl"
                  >
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
                          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Menu</h2>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-300"
                        >
                          <X className="w-6 h-6 text-gray-700" />
                        </motion.button>
                      </div>
                      <div className="space-y-3 flex-1 overflow-y-auto px-2">
                        {tabs.map((tab, index) => (
                          <motion.button
                            key={tab.id}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleTabChange(tab.id as TabType)}
                            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                              activeTab === tab.id
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg shadow-yellow-400/25'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                            }`}
                          >
                            <div className={`p-2 rounded-xl ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                              {tab.icon}
                            </div>
                            <span className="font-semibold">{tab.label}</span>
                          </motion.button>
                        ))}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-4 px-6 py-4 text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 mt-4 border border-red-200"
                      >
                        <div className="p-2 rounded-xl bg-red-100">
                          <LogOut className="w-5 h-5" />
                        </div>
                        <span className="font-semibold">Sign Out</span>
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Desktop Fixed Sidebar */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideIn}
              className="hidden lg:block w-80 fixed left-4 top-25 bottom-8 z-50"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 h-full border border-gray-200 flex flex-col overflow-hidden">
                <div className="mb-8 flex-shrink-0">
                  <div className="flex items-center gap-3 mb-0">
                    <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
                    <span className="text-yellow-600 font-bold text-sm uppercase tracking-wider">
                      Profile Menu
                    </span>
                  </div>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-2">
                  {tabs.map((tab, index) => (
                    <motion.button
                      key={tab.id}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTabChange(tab.id as TabType)}
                      className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-xl shadow-yellow-400/25'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:shadow-lg'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl transition-all duration-300 ${
                          activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}
                      >
                        {tab.icon}
                      </div>
                      <span className="font-semibold">{tab.label}</span>
                    </motion.button>
                  ))}
                </div>
                <div className="flex-shrink-0 pt-6">
                  <hr className="mb-6 border-gray-200" />
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-4 px-6 py-4 text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 border border-red-200 hover:border-red-300 hover:shadow-lg group"
                  >
                    <div className="p-2 rounded-xl bg-red-100 group-hover:bg-red-200 transition-all duration-300">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">Sign Out</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Main Content with proper margin for fixed sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 lg:ml-80 lg:pl-8"
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {editedProfile && (
        <ProfileModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setPreviewImage(null);
            setImageSrc(null);
          }}
          profile={editedProfile}
          onChange={handleChange}
          onSubmit={handleSubmit}
          errors={errors}
          onImageUpload={handleImageUpload}
          previewImage={previewImage}
          isSubmitting={updateProfileMutation.isPending}
        />
      )}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        passwordChange={passwordChange}
        onChange={handlePasswordChange}
        onSubmit={handlePasswordSubmit}
      />
      <ImageCropperModal
        isOpen={isImageCropperOpen}
        onClose={() => {
          setIsImageCropperOpen(false);
          setImageSrc(null);
        }}
        imageSrc={imageSrc}
        onSave={handleImageSave}
      />
    </div>
  );
}