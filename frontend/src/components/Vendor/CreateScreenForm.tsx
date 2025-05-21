import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useMutation, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import BackButton from '../Buttons/BackButton';
import { createScreen } from '../../services/Vendor/screenApi';
import { fetchSeatLayouts } from '../../services/Vendor/seatLayoutApi';
import { fetchTheatersByVendor } from '../../services/Vendor/theaterApi';
import { screenFormSchema } from '../../types/screen';
import '../../style/scroll.css';

const SCREEN_SUBMITTED_KEY = 'screenDetailsSubmitted';

interface ScreenFormData {
  name: string;
  theaterId: string;
  seatLayoutId: string;
  amenities: {
    is4K: boolean;
    is3D: boolean;
    isDolby: boolean;
  };
}

// Shimmer component for loading state
const Shimmer: React.FC<{ isTheater?: boolean }> = ({ isTheater = false }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 animate-pulse"
        >
          {isTheater && (
            <div className="w-full h-24 bg-gray-700 rounded-md mb-2"></div>
          )}
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-1"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

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

const boxVariants = {
  idle: { scale: 1, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)' },
  hover: { scale: 1.05, boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.3)' },
  active: { scale: 1.03, boxShadow: '0px 8px 20px rgba(59, 130, 246, 0.4)' },
};

const CreateScreenForm: React.FC = () => {
  const navigate = useNavigate();
  const [formSubmitted, setFormSubmitted] = useState<boolean>(() => {
    return localStorage.getItem(SCREEN_SUBMITTED_KEY) === 'true';
  });
  const [selectedTheater, setSelectedTheater] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [visibleLayouts, setVisibleLayouts] = useState<any[]>([]);
  const [layoutPage, setLayoutPage] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ScreenFormData>({
    resolver: zodResolver(screenFormSchema),
    defaultValues: {
      name: '',
      theaterId: '',
      seatLayoutId: '',
      amenities: {
        is4K: false,
        is3D: false,
        isDolby: false,
      },
    },
  });

  // Infinite query for theaters
  const {
    data: theaterData,
    fetchNextPage: fetchNextTheaters,
    hasNextPage: hasNextTheaterPage,
    isFetchingNextPage: isFetchingNextTheater,
    isLoading: isTheatersLoading,
  } = useInfiniteQuery({
    queryKey: ['theaters'],
    queryFn: ({ pageParam = 1 }) =>
      fetchTheatersByVendor({ limit: 10, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Query for seat layouts
  const { data: seatLayouts, isLoading: isLoadingLayouts } = useQuery({
    queryKey: ['seatLayouts'],
    queryFn: fetchSeatLayouts,
  });

  // Flatten theater data
  const theaters = theaterData?.pages.flatMap((page) => page.theaters) || [];

  // Client-side pagination for seat layouts
  const LAYOUTS_PER_PAGE = 9;
  useEffect(() => {
    if (seatLayouts?.length) {
      const start = (layoutPage - 1) * LAYOUTS_PER_PAGE;
      const end = start + LAYOUTS_PER_PAGE;
      setVisibleLayouts(seatLayouts.slice(0, end));
    }
  }, [seatLayouts, layoutPage]);

  // Set default theater and seat layout
  useEffect(() => {
    if (theaters.length > 0 && !selectedTheater) {
      const defaultTheaterId = theaters[0]._id;
      setSelectedTheater(defaultTheaterId);
      setValue('theaterId', defaultTheaterId);
    }
    if (seatLayouts?.length > 0 && !selectedLayout) {
      const defaultLayoutId = seatLayouts[0]._id;
      setSelectedLayout(defaultLayoutId);
      setValue('seatLayoutId', defaultLayoutId);
    }
  }, [theaters, seatLayouts, selectedTheater, selectedLayout, setValue]);

  // Infinite scroll for theaters
  const theaterContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (
        theaterContainerRef.current &&
        hasNextTheaterPage &&
        !isFetchingNextTheater
      ) {
        const { scrollTop, scrollHeight, clientHeight } = theaterContainerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
          fetchNextTheaters();
        }
      }
    };
    const container = theaterContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [hasNextTheaterPage, isFetchingNextTheater, fetchNextTheaters]);

  // Scroll handling for seat layouts (client-side pagination)
  const layoutContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (
        layoutContainerRef.current &&
        seatLayouts &&
        visibleLayouts.length < seatLayouts.length
      ) {
        const { scrollTop, scrollHeight, clientHeight } = layoutContainerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
          setLayoutPage((prev) => prev + 1);
        }
      }
    };
    const container = layoutContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [seatLayouts, visibleLayouts.length]);

  // Use mutation for form submission
  const createScreenMutation = useMutation({
    mutationFn: createScreen,
    onSuccess: () => {
      setFormSubmitted(true);
      localStorage.setItem(SCREEN_SUBMITTED_KEY, 'true');
      toast.success('Screen created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleClearForm = () => {
    localStorage.removeItem(SCREEN_SUBMITTED_KEY);
    setFormSubmitted(false);
    navigate('/vendor/screens');
  };

  const onSubmit = (data: ScreenFormData) => {
    createScreenMutation.mutate({
      name: data.name,
      theaterId: data.theaterId,
      seatLayoutId: data.seatLayoutId,
      amenities: data.amenities,
    });
  };

  const handleTheaterSelect = (theaterId: string) => {
    setSelectedTheater(theaterId);
    setValue('theaterId', theaterId);
  };

  const handleLayoutSelect = (layoutId: string) => {
    setSelectedLayout(layoutId);
    setValue('seatLayoutId', layoutId);
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
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Screen Created Successfully!
          </motion.h2>
          <motion.p
            className="text-lg text-gray-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Your screen has been added. You can manage it from the screens dashboard.
          </motion.p>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
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
          className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="p-6 sm:p-10">
            <BackButton />
            <motion.h1
              className="text-2xl font-bold text-white mb-6"
              variants={itemVariants}
            >
              Create Screen
            </motion.h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Screen Name */}
              <motion.div className="space-y-2" variants={itemVariants}>
                <label htmlFor="name" className="text-base font-medium text-gray-200">
                  Screen Name
                </label>
                <input
                  {...register('name')}
                  id="name"
                  type="text"
                  placeholder="Enter screen name"
                  className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                />
                {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}
              </motion.div>

              {/* Theater Selection */}
              <motion.div className="space-y-2" variants={itemVariants}>
                <label className="text-base font-medium text-gray-200">Select Theater</label>
                <input type="hidden" {...register('theaterId')} />
                <div
                  ref={theaterContainerRef}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 p-2"
                >
                  {isTheatersLoading ? (
                    <Shimmer isTheater={true} />
                  ) : theaters.length > 0 ? (
                    theaters.map((theater: any) => (
                      <motion.div
                        key={theater._id}
                        variants={boxVariants}
                        initial="idle"
                        animate={selectedTheater === theater._id ? 'active' : 'idle'}
                        whileHover="hover"
                        onClick={() => handleTheaterSelect(theater._id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedTheater === theater._id
                            ? 'border-blue-500 bg-blue-600/20'
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
                        <p className="text-sm font-medium text-white">{theater.name}</p>
                        <p className="text-xs text-gray-400">{theater.location.city}</p>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-red-400 text-sm col-span-full">
                      No theaters available. Please create a theater first.
                    </p>
                  )}
                  {isFetchingNextTheater && (
                    <div className="col-span-full flex justify-center py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>
                {errors.theaterId && (
                  <p className="text-red-400 text-sm">{errors.theaterId.message}</p>
                )}
              </motion.div>

              {/* Seat Layout Selection */}
              <motion.div className="space-y-2" variants={itemVariants}>
                <label className="text-base font-medium text-gray-200">Select Seat Layout</label>
                <input type="hidden" {...register('seatLayoutId')} />
                <div
                  ref={layoutContainerRef}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 p-2"
                >
                  {isLoadingLayouts ? (
                    <Shimmer />
                  ) : visibleLayouts.length > 0 ? (
                    visibleLayouts.map((layout: any) => (
                      <motion.div
                        key={layout._id}
                        variants={boxVariants}
                        initial="idle"
                        animate={selectedLayout === layout._id ? 'active' : 'idle'}
                        whileHover="hover"
                        onClick={() => handleLayoutSelect(layout._id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedLayout === layout._id
                            ? 'border-blue-500 bg-blue-600/20'
                            : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700'
                        }`}
                      >
                        <p className="text-sm font-medium text-white">{layout.layoutName}</p>
                        <p className="text-xs text-gray-400">Capacity: {layout.capacity}</p>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-red-400 text-sm col-span-full">
                      No seat layouts available. Please create a seat layout first.
                    </p>
                  )}
                </div>
                {errors.seatLayoutId && (
                  <p className="text-red-400 text-sm">{errors.seatLayoutId.message}</p>
                )}
              </motion.div>

              {/* Amenities */}
              <motion.div className="space-y-3" variants={itemVariants}>
                <label className="text-base font-medium text-gray-200">Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                  {(['is4K', 'is3D', 'isDolby'] as const).map((amenity) => (
                    <motion.div
                      key={amenity}
                      className="relative"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <label
                        className="flex items-center space-x-3 bg-gray-700 rounded-lg p-3 transition-colors cursor-pointer hover:bg-gray-650 hover:border-blue-500 border border-transparent"
                      >
                        <input
                          {...register(`amenities.${amenity}`)}
                          type="checkbox"
                          id={amenity}
                          className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-offset-gray-700"
                        />
                        <span className="text-sm text-gray-200 select-none">
                          {amenity
                            .replace(/^is/, '')
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())}
                        </span>
                      </label>
                    </motion.div>
                  ))}
                </div>
                {errors.amenities && (
                  <p className="text-red-400 text-sm">{errors.amenities.message}</p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-4">
                <motion.button
                  type="submit"
                  disabled={isSubmitting || createScreenMutation.isPending || isTheatersLoading || isLoadingLayouts}
                  className={`w-full py-4 px-4 rounded-lg font-semibold text-white transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
                    isSubmitting || createScreenMutation.isPending || isTheatersLoading || isLoadingLayouts
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  whileHover={
                    isSubmitting || createScreenMutation.isPending || isTheatersLoading || isLoadingLayouts
                      ? {}
                      : { scale: 1.02, backgroundColor: '#2563EB' }
                  }
                  whileTap={
                    isSubmitting || createScreenMutation.isPending || isTheatersLoading || isLoadingLayouts
                      ? {}
                      : { scale: 0.98 }
                  }
                >
                  {createScreenMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    'Create Screen'
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateScreenForm;