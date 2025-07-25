// src/components/Vendor/UpdateTheater.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Upload, Info, Award, Camera } from 'lucide-react';
import { theaterDetailsUpdateSchema } from '../../validation/schema';
import { uploadToCloudinary, fetchTheatersById, updateTheater } from '../../services/Vendor/theaterApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TheaterDetailsFormData, ITheater } from '../../types/theater';
import toast from 'react-hot-toast';
import BackButton from '../../components/Buttons/BackButton';
import ImageGallery from '../../components/Shared/ImageGalleryUpdate';
import MapSelector from '../../components/Shared/MapSelector';
import ImageCropper from '../../components/Shared/ImageCropper';

const UpdateTheater: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<TheaterDetailsFormData>({
    resolver: zodResolver(theaterDetailsUpdateSchema),
    defaultValues: {
      name: '',
      description: '',
      email: '',
      phone: '',
      facilities: {
        foodCourt: false,
        lounges: false,
        mTicket: false,
        parking: false,
        freeCancellation: false,
      },
      intervalTime: '10',
      location: {
        city: '',
        coordinates: [20.5937, 78.9629],
        type: 'point',
      },
      gallery: [],
    },
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isLoadingTheater, setIsLoadingTheater] = useState(true);

  const watchedGallery = watch('gallery');
  const watchedCity = watch('location.city');

  useEffect(() => {
    const fetchTheaterData = async () => {
      if (!id) {
        toast.error('Invalid theater ID');
        navigate('/vendor/theaters');
        return;
      }

      try {
        const theater = await fetchTheatersById(id);
        console.log('Raw theater data:', theater); // Debug raw data
        if (!theater) {
          toast.error('Theater not found');
          navigate('/vendor/theaters');
          return;
        }

        // Robust gallery filtering
        const uniqueGalleryUrls = Array.from(
          new Set(
            (theater.gallery || [])
              .filter((url): url is string => url != null && typeof url === 'string' && url.trim() !== '')
              .map((url) => url.trim())
          )
        );

        reset({
          name: theater.name || '',
          description: theater.description || '',
          email: theater.email || '',
          phone: String(theater.phone) || '',
          facilities: {
            foodCourt: theater.facilities?.foodCourt || false,
            lounges: theater.facilities?.lounges || false,
            mTicket: theater.facilities?.mTicket || false,
            parking: theater.facilities?.parking || false,
            freeCancellation: theater.facilities?.freeCancellation || false,
          },
          intervalTime: theater.intervalTime?.toString() || '10',
          location: {
            city: theater.location?.city || '',
            coordinates: theater.location?.coordinates || [20.5937, 78.9629],
            type: theater.location?.type || 'point',
          },
          gallery: uniqueGalleryUrls,
        });

        setGalleryUrls(uniqueGalleryUrls);
        console.log('Fetched gallery URLs:', uniqueGalleryUrls); // Debug log
        setIsLoadingTheater(false);
      } catch (error) {
        console.error('Fetch theater error:', error);
        toast.error('Failed to load theater data');
        navigate('/vendor/theaters');
      }
    };

    fetchTheaterData();
  }, [id, navigate, reset]);

  const updateTheaterMutation = useMutation({
    mutationFn: (data: Partial<TheaterDetailsFormData>) => updateTheater(id!, data),
    onSuccess: async () => {
      toast.success('Theater updated successfully!');
      await queryClient.invalidateQueries({ queryKey: ['theaters'] });
      navigate('/vendor/theaters');
    },
    onError: (error: any) => {
      console.error('Update theater error:', error);
      toast.error(error.response?.data?.message || 'Failed to update theater');
    },
  });

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (validateImageFile(file)) {
        const reader = new FileReader();
        reader.onload = () => {
          setCropImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCroppedImage = async (croppedImageBase64: string) => {
    setUploading(true);
    setCropImage(null);

    try {
      const response = await fetch(croppedImageBase64);
      const blob = await response.blob();
      const file = new File([blob], `theater-image-${Date.now()}.jpg`, { type: 'image/jpeg' });

      const newFiles = [...imageFiles, file];
      setImageFiles(newFiles);

      const url = await uploadToCloudinary(file);
      console.log('Cloudinary URL:', url); // Debug log
      if (!url || typeof url !== 'string' || url.trim() === '') {
        throw new Error('Invalid image URL returned from Cloudinary');
      }

      const trimmedUrl = url.trim();
      const updatedUrls = Array.from(
        new Set([...galleryUrls, trimmedUrl].filter((url) => url && url.trim() !== ''))
      );
      setGalleryUrls(updatedUrls);
      setValue('gallery', updatedUrls);
      console.log('Updated gallery URLs:', updatedUrls); // Debug log
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLocationSelected = (location: { lat: number; lng: number }) => {
    setValue('location.coordinates', [location.lat, location.lng]);
    setValue('location.type', 'point');
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newUrls = galleryUrls.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setGalleryUrls(newUrls);
    setValue('gallery', newUrls);
    console.log('Gallery URLs after removal:', newUrls); // Debug log
  };

  const onSubmit = (data: TheaterDetailsFormData) => {
    console.log('Submitting form with data:', data); // Debug log
    updateTheaterMutation.mutate({
      name: data.name,
      description: data.description,
      email: data.email,
      phone: data.phone,
      facilities: data.facilities,
      intervalTime: data.intervalTime,
      location: {
        city: data.location.city,
        coordinates: data.location.coordinates,
        type: data.location.type,
      },
      gallery: data.gallery,
    });
  };

  const hasRequiredImages = watchedGallery && watchedGallery.length >= 4;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0, y: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getUploadInstruction = () => {
    if (galleryUrls.length === 0) {
      return 'First, upload your Theater License Certificate';
    } else if (galleryUrls.length === 1) {
      return 'Now upload theater images (3 required)';
    } else {
      return 'Continue uploading theater images';
    }
  };

  if (isLoadingTheater) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="max-w-3xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="p-6 sm:p-10">
          <BackButton />
          <motion.h1 className="text-2xl font-bold text-white mb-6" variants={itemVariants}>
            Update Theater
          </motion.h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <motion.div className="space-y-2" variants={itemVariants}>
              <label htmlFor="name" className="text-base font-medium text-gray-200">
                Theater Name
              </label>
              <input
                {...register('name')}
                id="name"
                type="text"
                placeholder="Enter your theater name"
                className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                  errors.name ? 'border-red-500' : ''
                }`}
              />
              {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <label htmlFor="description" className="text-base font-medium text-gray-200">
                Theater Description
              </label>
              <textarea
                {...register('description')}
                id="description"
                placeholder="Describe your theater"
                className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-y min-h-[100px] ${
                  errors.description ? 'border-red-500' : ''
                }`}
              />
              {errors.description && (
                <p className="text-red-400 text-sm">{errors.description.message}</p>
              )}
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <label htmlFor="email" className="text-base font-medium text-gray-200">
                Email
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                placeholder="Enter your email"
                className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <label htmlFor="phone" className="text-base font-medium text-gray-200">
                Phone Number
              </label>
              <input
                {...register('phone')}
                id="phone"
                type="tel"
                placeholder="Enter your phone number (e.g., +1234567890)"
                className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                  errors.phone ? 'border-red-500' : ''
                }`}
              />
              {errors.phone && <p className="text-red-400 text-sm">{errors.phone.message}</p>}
            </motion.div>

            <motion.div className="space-y-3" variants={itemVariants}>
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-base font-medium text-gray-200">
                    Theater Certificate & Images
                  </label>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-gray-400">
                      • First image: Theater License Certificate (Required)
                    </p>
                    <p className="text-sm text-gray-400">
                      • Next 3 images: Theater photos (Required)
                    </p>
                    <p className="text-sm text-gray-400">
                      • 5th image: Additional theater photo (Optional)
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">{galleryUrls.length}/5 uploaded</span>
              </div>

              <AnimatePresence>
                {galleryUrls.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ImageGallery images={galleryUrls} onRemoveImage={removeImage} />
                  </motion.div>
                )}
              </AnimatePresence>

              {galleryUrls.length < 5 && (
                <motion.div
                  className="mt-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                      uploading
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                        <div className="text-center">
                          <motion.div
                            className="w-8 h-8 border-4 border-t-blue-500 border-blue-500/30 rounded-full mx-auto mb-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          ></motion.div>
                          <p className="text-sm text-gray-400">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          {galleryUrls.length === 0 ? (
                            <Award className="w-8 h-8 mb-3 text-blue-400" />
                          ) : (
                            <Camera className="w-8 h-8 mb-3 text-gray-400" />
                          )}
                          <p className="mb-1 text-sm text-gray-300 text-center">
                            <span className="font-semibold">Click to upload</span>
                            <br />
                            <span className="text-xs text-blue-400">
                              {getUploadInstruction()}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400">JPG, JPEG or PNG (MAX. 5MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </motion.div>
              )}

              {errors.gallery && <p className="text-red-400 text-sm mt-1">{errors.gallery.message}</p>}
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <label htmlFor="city" className="text-base font-medium text-gray-200">
                City
              </label>
              <select
                {...register('location.city')}
                id="city"
                className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                  errors.location?.city ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select a city</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Pune">Pune</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Lucknow">Lucknow</option>
                <option value="Kanpur">Kanpur</option>
                <option value="Nagpur">Nagpur</option>
                <option value="Indore">Indore</option>
                <option value="Thane">Thane</option>
                <option value="Bhopal">Bhopal</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
                <option value="Patna">Patna</option>
                <option value="Vadodara">Vadodara</option>
                <option value="Ghaziabad">Ghaziabad</option>
                <option value="Surat">Surat</option>
                <option value="Ludhiana">Ludhiana</option>
                <option value="Agra">Agra</option>
                <option value="Nashik">Nashik</option>
                <option value="Ranchi">Ranchi</option>
                <option value="Faridabad">Faridabad</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Rajkot">Rajkot</option>
                <option value="Meerut">Meerut</option>
                <option value="Srinagar">Srinagar</option>
                <option value="Aurangabad">Aurangabad</option>
                <option value="Dhanbad">Dhanbad</option>
                <option value="Amritsar">Amritsar</option>
                <option value="Allahabad">Allahabad</option>
                <option value="Howrah">Howrah</option>
                <option value="Gwalior">Gwalior</option>
                <option value="Jabalpur">Jabalpur</option>
                <option value="Madurai">Madurai</option>
                <option value="Vijayawada">Vijayawada</option>
                <option value="Jodhpur">Jodhpur</option>
                <option value="Salem">Salem</option>
                <option value="Raipur">Raipur</option>
                <option value="Kochi">Kochi</option>
                <option value="Kozhikode">Kozhikode</option>
                <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                <option value="Calicut">Calicut</option>
                <option value="Guwahati">Guwahati</option>
                <option value="Bhubaneswar">Bhubaneswar</option>
                <option value="Noida">Noida</option>
                <option value="Chandigarh">Chandigarh</option>
                <option value="Mysore">Mysore</option>
                <option value="Dehradun">Dehradun</option>
                <option value="Shimla">Shimla</option>
                <option value="Vellore">Vellore</option>
              </select>
              {errors.location?.city && (
                <p className="text-red-400 text-sm">{errors.location.city.message}</p>
              )}
            </motion.div>

            <AnimatePresence>
              {watchedCity && (
                <motion.div
                  variants={itemVariants}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p className="text-base font-medium text-gray-200 mb-2">
                    Pinpoint Theater Location
                  </p>
                  <MapSelector
                    initialLocation={{
                      lat: watch('location.coordinates')[0],
                      lng: watch('location.coordinates')[1],
                    }}
                    onLocationSelected={handleLocationSelected}
                  />
                  {errors.location?.coordinates && (
                    <p className="text-red-400 text-sm mt-1">{errors.location.coordinates.message}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div className="space-y-3" variants={itemVariants}>
              <label className="text-base font-medium text-gray-200">
                Amenities & Facilities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                {(['foodCourt', 'lounges', 'mTicket', 'parking', 'freeCancellation'] as const).map(
                  (amenity) => (
                    <motion.div
                      key={`amenity-${amenity}`}
                      className="relative"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <label
                        className="flex items-center space-x-3 bg-gray-700 rounded-lg p-3 transition-colors cursor-pointer hover:bg-gray-650 hover:border-blue-500 border border-transparent"
                      >
                        <input
                          {...register(`facilities.${amenity}`)}
                          type="checkbox"
                          id={`amenity-${amenity}`}
                          className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-offset-gray-700"
                        />
                        <span className="text-sm text-gray-200 select-none">
                          {amenity
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())}
                        </span>
                      </label>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <label htmlFor="intervalTime" className="text-base font-medium text-gray-200">
                Interval Gap Time
              </label>
              <select
                {...register('intervalTime')}
                id="intervalTime"
                className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                  errors.intervalTime ? 'border-red-500' : ''
                }`}
              >
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
              </select>
              {errors.intervalTime && (
                <p className="text-red-400 text-sm">{errors.intervalTime.message}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4">
              <motion.button
                type="submit"
                disabled={isSubmitting || !hasRequiredImages || updateTheaterMutation.isPending}
                className={`w-full py-4 px-4 rounded-lg font-semibold text-white transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
                  isSubmitting || !hasRequiredImages || updateTheaterMutation.isPending
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                whileHover={
                  isSubmitting || !hasRequiredImages || updateTheaterMutation.isPending
                    ? {}
                    : { scale: 1.02, backgroundColor: '#2563EB' }
                }
                whileTap={
                  isSubmitting || !hasRequiredImages || updateTheaterMutation.isPending
                    ? {}
                    : { scale: 0.98 }
                }
              >
                {updateTheaterMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Updating...
                  </div>
                ) : (
                  'Update Theater'
                )}
              </motion.button>

              {!hasRequiredImages && (
                <motion.div
                  className="flex items-center justify-center mt-4 text-amber-400 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Info className="w-4 h-4 mr-2" />
                  {galleryUrls.length === 0
                    ? 'Please upload theater certificate and at least 3 theater images'
                    : galleryUrls.length < 4
                      ? `Please upload ${4 - galleryUrls.length} more images (${galleryUrls.length >= 1 ? 'theater photos' : 'certificate and theater photos'})`
                      : 'Upload complete! You can add 1 more optional image'}
                </motion.div>
              )}
            </motion.div>
          </form>
        </div>
      </motion.div>

      <AnimatePresence>
        {cropImage && (
          <ImageCropper
            src={cropImage}
            onImageCropped={handleCroppedImage}
            onCancel={() => setCropImage(null)}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default UpdateTheater;