import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../ui/Button';
import { Screen, ScreenUpdateFormData, screenUpdateSchema } from '../../types/screen';
import { fetchTheatersByVendor } from '../../services/Vendor/theaterApi';
import { fetchSeatLayouts } from '../../services/Vendor/seatLayoutApi';
import { useQuery } from '@tanstack/react-query';

// Shimmer component for loading state
const Shimmer: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 animate-pulse"
        >
          <div className="w-full h-24 bg-gray-700 rounded-md mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-1"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

interface UpdateScreenModalProps {
  screen: Screen;
  onClose: () => void;
  onSubmit: (data: ScreenUpdateFormData) => void;
  isLoading: boolean;
}

const UpdateScreenModal: React.FC<UpdateScreenModalProps> = ({
  screen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const vendorId = '68136be091d98d82eb9e9947';
  const [selectedTheater, setSelectedTheater] = useState<string | null>(screen.theaterId?._id || null);
  const [selectedLayout, setSelectedLayout] = useState<string | null>(screen.seatLayoutId?._id || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ScreenUpdateFormData>({
    resolver: zodResolver(screenUpdateSchema),
    defaultValues: {
      name: screen.name,
      theaterId: screen.theaterId?._id,
      seatLayoutId: screen.seatLayoutId?._id,
      amenities: screen.amenities || { is3D: false, is4K: false, isDolby: false },
    },
  });

  // Fetch theaters
  const { data: theaters, isLoading: isTheatersLoading } = useQuery({
    queryKey: ['theaters'],
    queryFn: () => fetchTheatersByVendor({ limit: 100 }),
  });

  // Fetch seat layouts
  const { data: seatLayouts, isLoading: isSeatLayoutsLoading } = useQuery({
    queryKey: ['seatLayouts'],
    queryFn: () => fetchSeatLayouts(),
  });

  useEffect(() => {
    setValue('name', screen.name);
    setValue('theaterId', screen.theaterId?._id || '');
    setValue('seatLayoutId', screen.seatLayoutId?._id || '');
    setValue('amenities', screen.amenities || { is3D: false, is4K: false, isDolby: false });
    setSelectedTheater(screen.theaterId?._id || null);
    setSelectedLayout(screen.seatLayoutId?._id || null);
  }, [screen, setValue]);

  const handleTheaterSelect = (theaterId: string) => {
    setSelectedTheater(theaterId);
    setValue('theaterId', theaterId);
  };

  const handleLayoutSelect = (layoutId: string) => {
    setSelectedLayout(layoutId);
    setValue('seatLayoutId', layoutId);
  };

  const handleAmenityChange = (amenity: keyof Screen['amenities']) => {
    const currentAmenities = watch('amenities');
    setValue('amenities', {
      ...currentAmenities,
      [amenity]: !currentAmenities[amenity],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50"
      role="dialog"
      aria-labelledby="update-screen-title"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-gray-900/95 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700/30"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="update-screen-title" className="text-2xl font-semibold text-white tracking-tight">
            Update Screen
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Close update modal"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-300">
                  Screen Name
                </label>
                <input
                  id="name"
                  {...register('name')}
                  className="w-full mt-1 pl-4 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter screen name"
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Amenities</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {(['is3D', 'is4K', 'isDolby'] as const).map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={watch('amenities')[amenity] || false}
                        onChange={() => handleAmenityChange(amenity)}
                        className="form-checkbox h-4 w-4 text-indigo-500 bg-gray-800 border-gray-700 rounded focus:ring-indigo-500"
                        aria-label={`Toggle ${amenity} amenity`}
                      />
                      <span className="text-sm text-gray-300">{amenity.replace('is', '')}</span>
                    </label>
                  ))}
                </div>
                {errors.amenities && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {errors.amenities.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-300">Select Theater</label>
                <input type="hidden" {...register('theaterId')} />
                {isTheatersLoading ? (
                  <Shimmer />
                ) : (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {theaters?.theaters?.length > 0 ? (
                      theaters.theaters.map((theater: any) => (
                        <div
                          key={theater._id}
                          onClick={() => handleTheaterSelect(theater._id)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedTheater === theater._id
                              ? 'border-indigo-500 bg-indigo-600/20'
                              : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700'
                          }`}
                        >
                          <img
                            src={theater.gallery?.[0] || '/placeholder-image.jpg'}
                            alt={theater.name}
                            className="w-full h-24 object-cover rounded-md mb-2"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.jpg';
                            }}
                          />
                          <p className="text-sm text-white">{theater.name}</p>
                          <p className="text-xs text-gray-400">{theater.location.city}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-red-400 text-sm">
                        No theaters available. Please create a theater first.
                      </p>
                    )}
                  </div>
                )}
                {errors.theaterId && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {errors.theaterId.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Select Seat Layout</label>
                <input type="hidden" {...register('seatLayoutId')} />
                {isSeatLayoutsLoading ? (
                  <Shimmer />
                ) : (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {seatLayouts?.length > 0 ? (
                      seatLayouts.map((layout: any) => (
                        <div
                          key={layout._id}
                          onClick={() => handleLayoutSelect(layout._id)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedLayout === layout._id
                              ? 'border-indigo-500 bg-indigo-600/20'
                              : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700'
                          }`}
                        >
                          <p className="text-sm text-white">{layout.layoutName}</p>
                          <p className="text-xs text-gray-400">Capacity: {layout.capacity}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-red-400 text-sm">
                        No seat layouts available. Please create a seat layout first.
                      </p>
                    )}
                  </div>
                )}
                {errors.seatLayoutId && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {errors.seatLayoutId.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              type="reset"
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              onClick={onClose}
              aria-label="Cancel update"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              disabled={isLoading || isTheatersLoading || isSeatLayoutsLoading || !theaters?.theaters?.length || !seatLayouts?.length}
              aria-label="Submit update"
            >
              {isLoading ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(UpdateScreenModal);