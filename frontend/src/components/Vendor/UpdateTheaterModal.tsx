import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../ui/Button';
import { Theater, TheaterUpdateFormData, theaterUpdateSchema } from '../../types/theater';

interface UpdateTheaterModalProps {
  theater: Theater;
  onClose: () => void;
  onSubmit: (data: TheaterUpdateFormData) => void;
  isLoading: boolean;
}

const UpdateTheaterModal: React.FC<UpdateTheaterModalProps> = ({
  theater,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TheaterUpdateFormData>({
    resolver: zodResolver(theaterUpdateSchema),
    defaultValues: {
      name: theater.name,
      location: { city: theater.location.city },
      email: theater.email,
      phone: theater.phone,
      description: theater.description,
      intervalTime: theater.intervalTime,
      facilities: theater.facilities,
    },
  });

  React.useEffect(() => {
    reset({
      name: theater.name,
      location: { city: theater.location.city },
      email: theater.email,
      phone: theater.phone,
      description: theater.description,
      intervalTime: theater.intervalTime,
      facilities: theater.facilities,
    });
  }, [theater, reset]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50"
      role="dialog"
      aria-labelledby="update-theater-title"
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
          <h2 id="update-theater-title" className="text-2xl font-semibold text-white tracking-tight">
            Update Theater
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
                  Theater Name
                </label>
                <input
                  id="name"
                  {...register('name')}
                  className="w-full mt-1 pl-4 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter theater name"
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="city" className="text-sm font-medium text-gray-300">
                  City
                </label>
                <input
                  id="city"
                  {...register('location.city')}
                  className="w-full mt-1 pl-4 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter city"
                  aria-invalid={errors.location?.city ? 'true' : 'false'}
                />
                {errors.location?.city && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {errors.location.city.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  {...register('email')}
                  className="w-full mt-1 pl-4 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter email"
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-gray-300">
                  Phone
                </label>
                <input
                  id="phone"
                  type="number"
                  {...register('phone', { valueAsNumber: true })}
                  className="w-full mt-1 pl-4 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter phone number"
                  aria-invalid={errors.phone ? 'true' : 'false'}
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="description" className="text-sm font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  className="w-full mt-1 pl-4 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter description"
                  rows={4}
                  aria-invalid={errors.description ? 'true' : 'false'}
                />
                {errors.description && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="intervalTime" className="text-sm font-medium text-gray-300">
                  Interval Time (minutes)
                </label>
                <input
                  id="intervalTime"
                  type="number"
                  {...register('intervalTime', { valueAsNumber: true })}
                  className="w-full mt-1 pl-4 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter interval time"
                  aria-invalid={errors.intervalTime ? 'true' : 'false'}
                />
                {errors.intervalTime && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {errors.intervalTime.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Facilities</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {[
                    'foodCourt',
                    'lounges',
                    'mTicket',
                    'parking',
                    'freeCancellation',
                  ].map((facility) => (
                    <label key={facility} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register(`facilities.${facility}` as keyof TheaterUpdateFormData['facilities'])}
                        className="form-checkbox h-4 w-4 text-indigo-500 bg-gray-800 border-gray-700 rounded focus:ring-indigo-500"
                        aria-label={`Toggle ${facility} facility`}
                      />
                      <span className="text-sm text-gray-300 capitalize">
                        {facility.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
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
              disabled={isLoading}
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

export default React.memo(UpdateTheaterModal);