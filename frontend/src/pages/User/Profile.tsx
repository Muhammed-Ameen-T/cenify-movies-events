// src/pages/TheaterProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Ticket, Gift, Star, Film, LogOut, X, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TabType, UserProfile, PasswordChange } from '../../types/index';
import { mockUser, mockBookings, mockNotifications } from '../../Data/MockData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, updateProfile, uploadToCloudinary } from '../../services/User/profileApi';
import { toast } from 'react-hot-toast';

// Components
import BookingsTab from '../../components/UserProfile/BookingTab';
import NotificationsTab from '../../components/UserProfile/NotificationTab';
import RewardsTab from '../../components/UserProfile/RewardTab';
import LoyaltyTab from '../../components/UserProfile/LoyalityTab';
import MoviePassTab from '../../components/UserProfile/MoviePassTab';
import ProfileModal from '../../components/UserProfile/ProfileModal';
import PasswordModal from '../../components/UserProfile/PasswordModal';
import ImageCropperModal from '../../components/UserProfile/ImageCroppperModal'; // Fixed typo
import AccountTab from '../../components/UserProfile/AccountTab';

export default function TheaterProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      console.log('🚀 ~ useQuery ~ Calling getCurrentUser');
      return getCurrentUser();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Get tab from query parameter
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'account';

  // Validate initial tab
  const validTabs: TabType[] = ['account', 'bookings', 'notifications', 'rewards', 'loyalty', 'moviepass'];
  const [activeTab, setActiveTab] = useState<TabType>(
    validTabs.includes(initialTab as TabType) ? (initialTab as TabType) : 'account'
  );

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

  // Update URL when activeTab changes
  useEffect(() => {
    if (activeTab !== queryParams.get('tab')) {
      navigate(`/account?tab=${activeTab}`, { replace: true });
    }
  }, [activeTab, navigate, queryParams]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (updatedUser) => {
      // Update cache immediately for optimistic update
      queryClient.setQueryData(['currentUser'], updatedUser);
      // Refetch to ensure we have the full, latest user data from the backend
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
    // Only validate if the field is being submitted
    if (currentProfile.name !== originalProfile?.name && !currentProfile.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (currentProfile.phone !== originalProfile?.phone && !currentProfile.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
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
      toast.info('No changes to save');
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) =>
      prev ? { ...prev, [name]: value || null } : prev
    );
  };

  // Tabs configuration
  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="w-5 h-5" /> },
    { id: 'bookings', label: 'Bookings', icon: <Ticket className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'rewards', label: 'Rewards', icon: <Gift className="w-5 h-5" /> },
    { id: 'loyalty', label: 'Loyalty Points', icon: <Star className="w-5 h-5" /> },
    { id: 'moviepass', label: 'Movie Pass', icon: <Film className="w-5 h-5" /> },
  ];

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  // Handle tab change
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // Handle authentication error
  if (isError && error?.message === 'No access token found') {
    navigate('/login', { replace: true });
    return null;
  }

  // Handle general error state
  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Error loading user data: {error?.message || 'Unknown error'}</div>
      </div>
    );
  }

  // Fallback to mockUser if data is undefined
  const userData = data || mockUser;

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
        return <BookingsTab bookings={mockBookings} />;
      case 'notifications':
        return <NotificationsTab notifications={mockNotifications} />;
      case 'rewards':
        return <RewardsTab />;
      case 'loyalty':
        return <LoyaltyTab user={userData} />;
      case 'moviepass':
        return <MoviePassTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="bg-white shadow-md p-4 md:hidden flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile Sidebar (Slide-in menu) */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-50 bg-white md:hidden"
              >
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id as TabType)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-[#FFCC00] text-gray-900'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                  <button className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Sidebar */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="hidden md:block w-64 bg-white rounded-xl shadow-lg p-4 h-fit"
          >
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as TabType)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#FFCC00] text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
              <hr className="my-4" />
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">{renderTabContent()}</div>
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