import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Upload, Info, CheckCircle2 } from 'lucide-react';
import { theaterDetailsSchema } from '../../validation/schema';
import { uploadToCloudinary, updateTheaterDetails } from '../../services/Vendor/api';
import MapSelector from '../Shared/MapSelector';
import ImageCropper from '../Shared/ImageCropper';
import ImageGallery from '../Shared/ImageGallery';
import { useMutation } from '@tanstack/react-query';
import { TheaterDetailsFormData } from '../../types/theater';
import { toast } from "react-toastify";


interface TheaterDetailsFormProps {
  vendorId: string;
}

const THEATER_SUBMITTED_KEY = 'theaterDetailsSubmitted';

const TheaterDetailsForm: React.FC<TheaterDetailsFormProps> = ({ vendorId }) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<TheaterDetailsFormData>({
    resolver: zodResolver(theaterDetailsSchema),
    defaultValues: {
      name: '',
      facilities: { 
        foodCourt: false, 
        lounges: false, 
        mTicket: false, 
        parking: false, 
        freeCancellation: false,
      },
      intervalTime: '10',
      location: { lat: 20.5937, lng: 78.9629 }, // Default to center of India
      city: '',
      images: [],
    },
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(() => {
    return localStorage.getItem(THEATER_SUBMITTED_KEY) === 'true';
  });
  const handleClearForm = () => {
    localStorage.removeItem(THEATER_SUBMITTED_KEY); // Remove the stored value
    setFormSubmitted(false); // Reset state
    navigate('/vendor/login')
  };
  

  // Watch form values
  const watchedImages = watch('images');
  const watchedCity = watch('city');

  // Use mutation for form submission
  const updateTheaterMutation = useMutation({
    mutationFn: updateTheaterDetails,
    onSuccess: () => {
      setFormSubmitted(true);
      localStorage.setItem(THEATER_SUBMITTED_KEY, 'true'); 
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save theater details');
    }
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
      // Convert base64 to file
      const response = await fetch(croppedImageBase64);
      const blob = await response.blob();
      const file = new File([blob], `theater-image-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Add to files array
      const newFiles = [...imageFiles, file];
      setImageFiles(newFiles);
      
      // Upload to Cloudinary
      const url = await uploadToCloudinary(file);
      const updatedUrls = [...galleryUrls, url];
      setGalleryUrls(updatedUrls);
      setValue('images', updatedUrls);
    } catch (error) {
      toast.error('Image upload failed');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleLocationSelected = (location: { lat: number; lng: number }) => {
    setValue('location', location);
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newUrls = galleryUrls.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setGalleryUrls(newUrls);
    setValue('images', newUrls);
  };

  const onSubmit = (data: TheaterDetailsFormData) => {
    updateTheaterMutation.mutate({
      id: vendorId,
      location: { city: data.city, coordinates: [data.location.lat, data.location.lng], type: 'point' },
      facilities: data.facilities,
      intervalTime: data.intervalTime,
      gallery: data.images,
    });
  };

  // Check if we have the minimum required images
  const hasMinimumImages = watchedImages && watchedImages.length >= 3;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1,
      }
    },
    exit: { opacity: 0, y: -20 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence mode="wait">
      {formSubmitted ? (
            <motion.div 
            className="max-w-3xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden p-10 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <motion.h2 
            className="text-2xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            >
            Theater Details Saved Successfully!
            </motion.h2>
            <motion.p 
            className="text-lg text-gray-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            >
            You will be able to edit your application soon. The application link will be sent to your registered email address.
            </motion.p>
            <motion.button>
              <button 
                onClick={handleClearForm} 
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg shadow-md hover:bg-gray-700 hover:text-white transition-all mt-3"
              >
                OK
              </button>
            </motion.button>
        </motion.div>
      
      ) : (
        <motion.div 
          className="max-w-3xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="p-6 sm:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Theater Name */}
              {/* <motion.div className="space-y-2" variants={itemVariants}>
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
              </motion.div> */}
              
              {/* Theater Images */}
              <motion.div className="space-y-3" variants={itemVariants}>
                <div className="flex justify-between items-center">
                  <label className="text-base font-medium text-gray-200">
                    Theater Images
                    <span className="ml-2 text-sm text-gray-400">(Minimum 3 photos required)</span>
                  </label>
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
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
                        ${uploading ? 'bg-gray-700 border-gray-600' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-blue-500'}`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <div className="text-center">
                            <motion.div 
                              className="w-8 h-8 border-4 border-t-blue-500 border-blue-500/30 rounded-full mx-auto mb-2"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            ></motion.div>
                            <p className="text-sm text-gray-400">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-1 text-sm text-gray-300">
                              <span className="font-semibold">Click to upload</span> or drag and drop
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
                
                {errors.images && <p className="text-red-400 text-sm mt-1">{errors.images.message}</p>}
              </motion.div>

              {/* City Selection */}
              <motion.div className="space-y-2" variants={itemVariants}>
                <label htmlFor="city" className="text-base font-medium text-gray-200">
                  City
                </label>
                <select
                  {...register('city')}
                  id="city"
                  className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                    errors.city ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select a city</option>
                  <option value="Kochi">Kochi</option>
                  <option value="Calicut">Calicut</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Ahmedabad">Ahmedabad</option>  
                  <option value="Surat">Surat</option>
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
                </select>
                {errors.city && <p className="text-red-400 text-sm">{errors.city.message}</p>}
              </motion.div>

              {/* Location Map */}
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
                      initialLocation={watch('location')} 
                      onLocationSelected={handleLocationSelected} 
                    />
                    {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location.message}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Amenities */}
              <motion.div className="space-y-3" variants={itemVariants}>
                <label className="text-base font-medium text-gray-200">Amenities & Facilities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                  {(['foodCourt', 'lounges', 'mTicket', 'parking', 'freeCancellation'] as const).map((amenity) => (
                    <motion.div 
                      key={amenity} 
                      className="relative"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <label className="flex items-center space-x-3 bg-gray-700 rounded-lg p-3 transition-colors cursor-pointer hover:bg-gray-650 hover:border-blue-500 border border-transparent">
                        <input
                          {...register(`facilities.${amenity}`)}
                          type="checkbox"
                          id={amenity}
                          className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-offset-gray-700"
                        />
                        <span className="text-sm text-gray-200 select-none">
                          {amenity
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())}
                        </span>
                      </label>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Interval Time */}
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
                {errors.intervalTime && <p className="text-red-400 text-sm">{errors.intervalTime.message}</p>}
              </motion.div>

              {/* Submit Button */}
              <motion.div
                variants={itemVariants}
                className="pt-4"
              >
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !hasMinimumImages || updateTheaterMutation.isPending}
                  className={`w-full py-4 px-4 rounded-lg font-semibold text-white transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
                    isSubmitting || !hasMinimumImages || updateTheaterMutation.isPending
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  whileHover={
                    isSubmitting || !hasMinimumImages || updateTheaterMutation.isPending
                      ? {}
                      : { scale: 1.02, backgroundColor: '#2563EB' }
                  }
                  whileTap={
                    isSubmitting || !hasMinimumImages || updateTheaterMutation.isPending
                      ? {}
                      : { scale: 0.98 }
                  }
                >
                  {updateTheaterMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    'Complete Registration'
                  )}
                </motion.button>
                
                {!hasMinimumImages && (
                  <motion.div 
                    className="flex items-center justify-center mt-4 text-amber-400 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Please upload at least 3 theater images to continue
                  </motion.div>
                )}
              </motion.div>
            </form>
          </div>
        </motion.div>
      )}
      
      {/* Image Cropper Modal */}
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

export default TheaterDetailsForm;