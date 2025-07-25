import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, X, Clock, Info, Plus, Trash2 } from 'lucide-react';
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { debounce } from 'lodash';
import DatePicker from 'react-datepicker';
import TimePicker from 'react-time-picker';
import BackButton from '../Buttons/BackButton';
import { createShow } from '../../services/Vendor/showApi';
import { fetchScreensByVendor } from '../../services/Vendor/screenApi';
import { fetchTheatersByVendor } from '../../services/Vendor/theaterApi';
import { movieService } from '../../services/Admin/movieApi'; 
import { showFormSchema, ShowFormData } from '../../types/show';
import { IMovie } from '../../types/movie';
import { ITheater } from '../../types/theater';
import { Screen } from '../../types/screen';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-time-picker/dist/TimePicker.css';
import '../../style/scroll.css';
import '../../style/pickers.css';

// Shimmer Component (unchanged)
const Shimmer: React.FC<{
  type: 'theater' | 'screen' | 'movie';
  count?: number;
}> = ({ type, count = 6 }) => {
  const shimmerVariants = {
    animate: {
      backgroundPosition: ['-200%', '200%'],
      transition: {
        backgroundPosition: {
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        },
      },
    },
  };

  return (
    <div
      className={`grid ${
        type === 'theater'
          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          : type === 'screen'
          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          : 'grid-cols-1'
      } gap-4 p-3`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`rounded-lg border border-gray-700 bg-gray-800/30 overflow-hidden ${
            type === 'movie' ? 'w-full' : ''
          }`}
          variants={shimmerVariants}
          animate="animate"
          style={{
            background:
              'linear-gradient(90deg, rgba(31, 41, 55, 0.2) 0%, rgba(75, 85, 99, 0.4) 50%, rgba(31, 41, 55, 0.2) 100%)',
            backgroundSize: '200% 100%',
          }}
        >
          {type === 'theater' && (
            <div className="w-full h-28 bg-gray-700/50 rounded-t-lg" />
          )}
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-700/50 rounded w-3/4" />
            <div className="h-3 bg-gray-700/50 rounded w-1/2" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, staggerChildren: 0.1 },
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

const CreateShowForm: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Add queryClient
  const [formSubmitted, setFormSubmitted] = useState<boolean>(() =>
    localStorage.getItem('showDetailsSubmitted') === 'true'
  );
  const [selectedTheater, setSelectedTheater] = useState<string | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);
  const [movieSearch, setMovieSearch] = useState('');
  const [movieSuggestions, setMovieSuggestions] = useState<IMovie[]>([]);
  const [isMovieLoading, setIsMovieLoading] = useState(false);
  const [timeConflictError, setTimeConflictError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newStartTime, setNewStartTime] = useState<string | null>(null);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ShowFormData>({
    resolver: zodResolver(showFormSchema),
    defaultValues: {
      theaterId: '',
      screenId: '',
      movieId: '',
      date: new Date().toISOString().split('T')[0],
      showTimes: [],
    },
  });

  const showTimes = watch('showTimes');

  // Fetch theaters
  const {
    data: theaterData,
    fetchNextPage: fetchNextTheaters,
    hasNextPage: hasNextTheaterPage,
    isFetchingNextPage: isFetchingNextTheater,
    isLoading: isTheatersLoading,
    error: theaterError,
  } = useInfiniteQuery({
    queryKey: ['theaters', selectedDate.toISOString().split('T')[0]],
    queryFn: ({ pageParam = 1 }) =>
      fetchTheatersByVendor({ page: pageParam, limit: 10 }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  // Fetch screens
  const {
    data: screenData,
    fetchNextPage: fetchNextScreens,
    hasNextPage: hasNextScreenPage,
    isFetchingNextPage: isFetchingNextScreen,
    isLoading: isScreensLoading,
    error: screenError,
  } = useInfiniteQuery({
    queryKey: ['screens', selectedTheater, selectedDate.toISOString().split('T')[0]],
    queryFn: ({ pageParam = 1 }) =>
      fetchScreensByVendor({
        page: pageParam,
        limit: 10,
        theaterId: selectedTheater || undefined,
        date: selectedDate.toISOString().split('T')[0],
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!selectedTheater,
  });

  // Debounced movie search
  const searchMovies = useCallback(
    debounce(async (query: string) => {
      if (query.trim() === '') {
        setMovieSuggestions([]);
        setIsMovieLoading(false);
        return;
      }
      try {
        setIsMovieLoading(true);
        const response = await movieService.getMovies({
          page: 1,
          limit: 5,
          search: query,
        });
        setMovieSuggestions(response.movies);
      } catch (error) {
        toast.error('Failed to fetch movie suggestions');
      } finally {
        setIsMovieLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    searchMovies(movieSearch);
  }, [movieSearch, searchMovies]);

  const theaters = theaterData?.pages.flatMap((page) => page.theaters) || [];
  const screens = screenData?.pages.flatMap((page) => page.screens) || [];
  const selectedScreenData = screens.find((s) => s._id === selectedScreen);

  // Set default values
  useEffect(() => {
    if (theaters.length > 0 && !selectedTheater) {
      const defaultTheaterId = theaters[0]._id;
      setSelectedTheater(defaultTheaterId);
      setValue('theaterId', defaultTheaterId);
    }
  }, [theaters, selectedTheater, setValue]);

  useEffect(() => {
    if (screens.length > 0 && !selectedScreen) {
      const defaultScreenId = screens[0]._id;
      setSelectedScreen(defaultScreenId);
      setValue('screenId', defaultScreenId);
    }
  }, [screens, selectedScreen, setValue]);

  // Infinite scroll for theaters
  const theaterContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (
        theaterContainerRef.current &&
        hasNextTheaterPage &&
        !isFetchingNextTheater
      ) {
        const { scrollTop, scrollHeight, clientHeight } =
          theaterContainerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
          fetchNextTheaters();
        }
      }
    };
    const container = theaterContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [hasNextTheaterPage, isFetchingNextTheater, fetchNextTheaters]);

  // Infinite scroll for screens
  const screenContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (
        screenContainerRef.current &&
        hasNextScreenPage &&
        !isFetchingNextScreen
      ) {
        const { scrollTop, scrollHeight, clientHeight } =
          screenContainerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
          fetchNextScreens();
        }
      }
    };
    const container = screenContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [hasNextScreenPage, isFetchingNextScreen, fetchNextScreens]);

  // Create show mutation
  const createShowMutation = useMutation({
    mutationFn: createShow,
    onSuccess: async () => {
      setFormSubmitted(true);
      localStorage.setItem('showDetailsSubmitted', 'true');
      toast.success('Show created successfully!');
      await queryClient.invalidateQueries({ 
        queryKey: ['shows'],
        refetchType: 'active', 
      });
      setTimeout(() => {
        setFormSubmitted(true);
        setValue('showTimes', []);
        setTimeConflictError(null);
        setNewStartTime(null);
        setSelectedMovie(null); 
        setSelectedTheater(null);
        setSelectedScreen(null); 
        setMovieSearch('');
      }, 2000);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create show');
    },
  });

  const handleClearForm = () => {
    localStorage.removeItem('showDetailsSubmitted');
    setFormSubmitted(false);
    setTimeout(() => navigate('/vendor/shows'), 100); // Small delay to allow refetch
    };

  const handleTheaterSelect = (theaterId: string) => {
    setSelectedTheater(theaterId);
    setSelectedScreen(null);
    setValue('theaterId', theaterId);
    setValue('screenId', '');
    setValue('showTimes', []);
    setTimeConflictError(null);
    setNewStartTime(null);
  };

  const handleScreenSelect = (screenId: string) => {
    setSelectedScreen(screenId);
    setValue('screenId', screenId);
    setValue('showTimes', []);
    setTimeConflictError(null);
    setNewStartTime(null);
  };

  const handleMovieSelect = (movie: IMovie) => {
    setSelectedMovie(movie);
    setMovieSearch('');
    setMovieSuggestions([]);
    setValue('movieId', movie._id);
    setValue('showTimes', []);
    setTimeConflictError(null);
    setNewStartTime(null);
  };

  const handleRemoveMovie = () => {
    setSelectedMovie(null);
    setMovieSearch('');
    setValue('movieId', '');
    setValue('showTimes', []);
    setTimeConflictError(null);
    setNewStartTime(null);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setValue('date', date.toISOString().split('T')[0]);
      setValue('showTimes', []);
      setTimeConflictError(null);
      setNewStartTime(null);
    }
  };

  const calculateEndTime = (startTime: string, movie: IMovie, theater: ITheater): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date(selectedDate);
    start.setHours(hours, minutes, 0, 0);
    const durationMs =
      (movie.duration.hours * 3600 + movie.duration.minutes * 60 + movie.duration.seconds) * 1000;
    const intervalMs = theater.intervalTime * 60 * 1000;
    const endTime = new Date(start.getTime() + durationMs + intervalMs);
    return endTime.toISOString();
  };

  const checkTimeConflict = (
    startTime: string,
    endTime: string,
    filledTimes: Array<{ startTime: Date | null; endTime: Date | null; showId: string | null }>,
    currentShowTimes: Array<{ startTime: string; endTime: string }>,
    excludeIndex?: number
  ): string | null => {
    const newStart = new Date(startTime).getTime();
    const newEnd = new Date(endTime).getTime();

    // Check against existing filled times
    for (const filled of filledTimes) {
      if (filled.startTime && filled.endTime) {
        const filledStart = new Date(filled.startTime).getTime();
        const filledEnd = new Date(filled.endTime).getTime();
        if (
          (newStart >= filledStart && newStart < filledEnd) ||
          (newEnd > filledStart && newEnd <= filledEnd) ||
          (newStart <= filledStart && newEnd >= filledEnd)
        ) {
          return `Time conflict with existing show from ${new Date(
            filled.startTime
          ).toLocaleTimeString()} to ${new Date(filled.endTime).toLocaleTimeString()}`;
        }
      }
    }

    // Check against other show times in the form
    for (let i = 0; i < currentShowTimes.length; i++) {
      if (excludeIndex !== undefined && i === excludeIndex) continue;
      const otherStart = new Date(currentShowTimes[i].startTime).getTime();
      const otherEnd = new Date(currentShowTimes[i].endTime).getTime();
      if (
        (newStart >= otherStart && newStart < otherEnd) ||
        (newEnd > otherStart && newEnd <= otherEnd) ||
        (newStart <= otherStart && newEnd >= otherEnd)
      ) {
        return `Time conflict with another selected show from ${new Date(
          currentShowTimes[i].startTime
        ).toLocaleTimeString()} to ${new Date(currentShowTimes[i].endTime).toLocaleTimeString()}`;
      }
    }

    if (newEnd <= newStart) {
      return 'End time must be after start time';
    }

    if (selectedMovie) {
      const durationMs =
        (selectedMovie.duration.hours * 3600 +
          selectedMovie.duration.minutes * 60 +
          selectedMovie.duration.seconds) *
        1000;
      if (newEnd - newStart < durationMs) {
        return 'Time slot is too short for the movie duration';
      }
    }

    return null;
  };

  const handleAddShowTime = () => {
    if (!selectedMovie || !selectedScreen || !selectedTheater || !newStartTime) {
      toast.error('Please select a movie, screen, theater, and start time');
      return;
    }

    const theater = theaters.find((t) => t._id === selectedTheater);
    const screen = screens.find((s) => s._id === selectedScreen);
    if (!theater || !screen) {
      toast.error('Theater or screen not found');
      return;
    }

    const startTimeDate = new Date(selectedDate);
    const [hours, minutes] = newStartTime.split(':').map(Number);
    startTimeDate.setHours(hours, minutes, 0, 0);
    const startTime = startTimeDate.toISOString();
    const endTime = calculateEndTime(newStartTime, selectedMovie, theater);
    const conflict = checkTimeConflict(startTime, endTime, screen.filledTimes || [], showTimes);

    if (conflict) {
      setTimeConflictError(conflict);
      return;
    }

    setTimeConflictError(null);
    const updatedShowTimes = [
      ...showTimes,
      { startTime, endTime },
    ].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    setValue('showTimes', updatedShowTimes);
    setNewStartTime(null);
  };

  const handleRemoveShowTime = (index: number) => {
    const updatedShowTimes = showTimes.filter((_, i) => i !== index);
    setValue('showTimes', updatedShowTimes);
    setTimeConflictError(null);
  };

  const onSubmit = (data: ShowFormData) => {
    if (timeConflictError) {
      toast.error('Please resolve time conflict before submitting');
      return;
    }

    createShowMutation.mutate({
      theaterId: data.theaterId,
      screenId: data.screenId,
      movieId: data.movieId,
      date: data.date,
      showTimes: data.showTimes,
    });
  };
  const today = selectedDate;
  const todayString = today.toISOString().split("T")[0];

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
            Show Created Successfully!
          </motion.h2>
          <motion.p
            className="text-lg text-gray-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Your show has been scheduled. You can manage it from the shows dashboard or create another show.
          </motion.p>
          <motion.div
            className="flex justify-center space-x-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <button
              onClick={handleClearForm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              Go to Dashboard
            </button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          className="max-w-5xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="p-6 sm:p-10">
            <BackButton />
            <motion.h1
              className="text-3xl font-bold text-white mb-8"
              variants={itemVariants}
            >
              Create Show
            </motion.h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              {/* Date Selection */}
              <motion.div className="space-y-3" variants={itemVariants}>
                <label className="text-lg font-medium text-gray-200">
                  Select Date
                </label>
                <div>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    className="w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select a date"
                  />
                  {errors.date && (
                    <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>
                  )}
                </div>
              </motion.div>

              {/* Theater Selection */}
              <motion.div className="space-y-3" variants={itemVariants}>
                <label className="text-lg font-medium text-gray-200">
                  Select Theater
                </label>
                <input type="hidden" {...register('theaterId')} />
                <div
                  ref={theaterContainerRef}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 p-3 rounded-lg"
                >
                  {isTheatersLoading || isFetchingNextTheater ? (
                    <Shimmer type="theater" />
                  ) : theaterError ? (
                    <p className="text-red-400 text-sm col-span-full">
                      Failed to load theaters: {theaterError.message}
                    </p>
                  ) : theaters.length > 0 ? (
                    theaters.map((theater: ITheater) => (
                      <motion.div
                        key={theater._id}
                        variants={boxVariants}
                        initial="idle"
                        animate={
                          selectedTheater === theater._id ? 'active' : 'idle'
                        }
                        whileHover="hover"
                        onClick={() => handleTheaterSelect(theater._id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                          selectedTheater === theater._id
                            ? 'border-blue-500 bg-blue-600/30 shadow-lg'
                            : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700'
                        }`}
                      >
                        <img
                          src={theater.gallery?.[1] || '/placeholder-image.jpg'}
                          alt={theater.name}
                          className="w-full h-28 object-cover rounded-md mb-3 transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.jpg';
                          }}
                        />
                        <p className="text-sm font-semibold text-white">
                          {theater.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {theater.location.city}
                        </p>
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

              {/* Screen Selection */}
              <motion.div className="space-y-3" variants={itemVariants}>
                <label className="text-lg font-medium text-gray-200">
                  Select Screen
                </label>
                <input type="hidden" {...register('screenId')} />
                <div
                  ref={screenContainerRef}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 p-3 rounded-lg"
                >
                  {isScreensLoading || isFetchingNextScreen ? (
                    <Shimmer type="screen" />
                  ) : screenError ? (
                    <p className="text-red-400 text-sm col-span-full">
                      Failed to load screens: {screenError.message}
                    </p>
                  ) : screens.length > 0 ? (
                    screens.map((screen: Screen) => (
                      <motion.div
                        key={screen._id}
                        variants={boxVariants}
                        initial="idle"
                        animate={
                          selectedScreen === screen._id ? 'active' : 'idle'
                        }
                        whileHover="hover"
                        onClick={() => handleScreenSelect(screen._id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                          selectedScreen === screen._id
                            ? 'border-blue-500 bg-blue-600/30 shadow-lg'
                            : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700'
                        }`}
                      >
                        <p className="text-sm font-semibold text-white">
                          {screen.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Amenities:{' '}
                          {[
                            screen.amenities.is4K && '4K',
                            screen.amenities.is3D && '3D',
                            screen.amenities.isDolby && 'Dolby',
                          ]
                            .filter(Boolean)
                            .join(', ') || 'None'}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-red-400 text-sm col-span-full">
                      No screens available for this theater. Please create a screen first.
                    </p>
                  )}
                  {isFetchingNextScreen && (
                    <div className="col-span-full flex justify-center py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>
                {errors.screenId && (
                  <p className="text-red-400 text-sm">{errors.screenId.message}</p>
                )}
              </motion.div>

              {/* Screen Details */}
              {selectedScreenData && (
                <motion.div className="space-y-3" variants={itemVariants}>
                  <h3 className="text-lg font-medium text-gray-200">
                    Screen Details
                  </h3>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-white">
                      <strong>Name:</strong> {selectedScreenData.name}
                    </p>
                    <p className="text-sm text-white mt-1">
                      <strong>Theater:</strong> {selectedScreenData.theaterId.name}
                    </p>
                    <p className="text-sm text-white mt-1">
                      <strong>Seat Layout:</strong> {selectedScreenData.seatLayoutId.name} (
                      {selectedScreenData.seatLayoutId.capacity} seats)
                    </p>
                    <p className="text-sm text-white mt-1">
                      <strong>Amenities:</strong>{' '}
                      {[
                        selectedScreenData.amenities.is4K && '4K',
                        selectedScreenData.amenities.is3D && '3D',
                        selectedScreenData.amenities.isDolby && 'Dolby',
                      ]
                        .filter(Boolean)
                        .join(', ') || 'None'}
                    </p>
                    <p className="text-sm text-white mt-2">
                      <strong>Filled Times:</strong>
                    </p>
                    
                    {selectedScreenData.filledTimes?.length ? (
                      <ul className="text-sm text-gray-300 mt-1 ml-4 list-disc">
                        {selectedScreenData.filledTimes
                          .filter((time) => {
                            const startDate = time.startTime ? new Date(time.startTime) : null;
                            const endDate = time.endTime ? new Date(time.endTime) : null;

                            const today = new Date();
                            const todayString = today.toISOString().split("T")[0];

                            return startDate?.toISOString().split("T")[0] === todayString || 
                                  endDate?.toISOString().split("T")[0] === todayString;
                          })
                          .map((time, index) =>
                            time.startTime &&
                            time.endTime && (
                              <li key={index}>
                                {new Date(time.startTime).toLocaleTimeString()} -{' '}
                                {new Date(time.endTime).toLocaleTimeString()}
                              </li>
                            )
                          )}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400 mt-1">
                        No filled times for this screen on today's date.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Movie Selection */}
              <motion.div className="space-y-3" variants={itemVariants}>
                <label className="text-lg font-medium text-gray-200">
                  Select Movie
                </label>
                <input type="hidden" {...register('movieId')} />
                {!selectedMovie ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={movieSearch}
                      onChange={(e) => setMovieSearch(e.target.value)}
                      placeholder="Search for a movie..."
                      className="w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    />
                    {isMovieLoading ? (
                      <Shimmer type="movie" count={3} />
                    ) : movieSuggestions.length > 0 ? (
                      <motion.div
                        className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {movieSuggestions.map((movie) => (
                          <motion.div
                            key={movie._id}
                            className="px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors"
                            onClick={() => handleMovieSelect(movie)}
                            whileHover={{ backgroundColor: '#374151' }}
                          >
                            <p className="text-sm font-medium text-white">
                              {movie.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              Duration: {movie.duration.hours}h {movie.duration.minutes}m
                            </p>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : movieSearch.trim() !== '' ? (
                      <p className="text-gray-400 text-sm mt-2">
                        No movies found.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <motion.div
                    className="bg-gray-800 rounded-lg p-6 flex items-start space-x-4 border border-gray-700 shadow-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <img
                      src={selectedMovie.poster || '/placeholder-image.jpg'}
                      alt={selectedMovie.name}
                      className="w-32 h-48 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-white">
                          {selectedMovie.name}
                        </h3>
                        <button
                          onClick={handleRemoveMovie}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Duration: {selectedMovie.duration.hours}h{' '}
                        {selectedMovie.duration.minutes}m
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Genre: {selectedMovie.genre?.join(', ') || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Rating: {selectedMovie.rating || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-300 mt-2 line-clamp-3">
                        {selectedMovie.description || 'No description available.'}
                      </p>
                    </div>
                  </motion.div>
                )}
                {errors.movieId && (
                  <p className="text-red-400 text-sm">{errors.movieId.message}</p>
                )}
              </motion.div>

              {/* Time Selection */}
              <motion.div className="space-y-3" variants={itemVariants}>
                <div className="flex items-center justify-between">
                  <label className="text-lg font-medium text-gray-200">
                    Select Show Times
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
                    className="flex items-center text-blue-400 hover:text-blue-300"
                  >
                    <Info className="w-5 h-5 mr-1" />
                    Instructions
                  </button>
                </div>
                {isInstructionsOpen && (
                  <motion.div
                    className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-sm text-gray-300"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <h4 className="font-semibold text-white mb-2">
                      Time Selection Instructions
                    </h4>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>
                        Choose start times that do not overlap with existing shows (see Filled Times above) or other selected show times.
                      </li>
                      <li>
                        The end time is automatically calculated based on the movie duration and theater interval time.
                      </li>
                      <li>
                        Ensure each time slot is long enough for the movie duration (at least{' '}
                        {selectedMovie
                          ? `${selectedMovie.duration.hours}h ${selectedMovie.duration.minutes}m`
                          : 'select a movie'}
                        ).
                      </li>
                      <li>
                        Add multiple show times by selecting a start time and clicking the "+" button.
                      </li>
                      <li>
                        Remove unwanted show times using the trash icon.
                      </li>
                      <li>
                        Avoid scheduling shows too close; include a buffer (theater interval time: {theaters.find((t) => t._id === selectedTheater)?.intervalTime || 'N/A'} minutes).
                      </li>
                      <li>
                        Double-check times to avoid conflicts, as the backend will reject conflicting shows.
                      </li>
                    </ul>
                  </motion.div>
                )}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <TimePicker
                      value={newStartTime}
                      onChange={(time: string | null) => setNewStartTime(time)}
                      disabled={!selectedMovie || !selectedScreen}
                      className="w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      ampm={false}
                      disableClock
                      format="HH:mm"
                    />
                    <motion.button
                      type="button"
                      onClick={handleAddShowTime}
                      disabled={!selectedMovie || !selectedScreen || !newStartTime}
                      className={`p-3 rounded-lg ${
                        !selectedMovie || !selectedScreen || !newStartTime
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white transition-all`}
                      whileHover={
                        !selectedMovie || !selectedScreen || !newStartTime
                          ? {}
                          : { scale: 1.05 }
                      }
                      whileTap={
                        !selectedMovie || !selectedScreen || !newStartTime
                          ? {}
                          : { scale: 0.95 }
                      }
                    >
                      <Plus className="w-5 h-5" />
                    </motion.button>
                  </div>
                  {timeConflictError && (
                    <p className="text-red-400 text-sm">{timeConflictError}</p>
                  )}
                  {errors.showTimes && (
                    <p className="text-red-400 text-sm">{errors.showTimes.message}</p>
                  )}
                  {showTimes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-200">
                        Selected Show Times
                      </h4>
                      {showTimes.map((time, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center justify-between bg-gray-800 rounded-lg p-3 border border-gray-700"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <p className="text-sm text-white">
                              {new Date(time.startTime).toLocaleTimeString()} -{' '}
                              {new Date(time.endTime).toLocaleTimeString()}
                            </p>
                          </div>
                          <motion.button
                            type="button"
                            onClick={() => handleRemoveShowTime(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-4">
                <motion.button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    createShowMutation.isPending ||
                    isTheatersLoading ||
                    isScreensLoading ||
                    showTimes.length === 0 ||
                    timeConflictError
                  }
                  className={`w-full py-4 px-4 rounded-lg font-semibold text-white transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
                    isSubmitting ||
                    createShowMutation.isPending ||
                    isTheatersLoading ||
                    isScreensLoading ||
                    showTimes.length === 0 ||
                    timeConflictError
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  whileHover={
                    isSubmitting ||
                    createShowMutation.isPending ||
                    isTheatersLoading ||
                    isScreensLoading ||
                    showTimes.length === 0 ||
                    timeConflictError
                      ? {}
                      : { scale: 1.02, backgroundColor: '#2563EB' }
                  }
                  whileTap={
                    isSubmitting ||
                    createShowMutation.isPending ||
                    isTheatersLoading ||
                    isScreensLoading ||
                    showTimes.length === 0 ||
                    timeConflictError
                      ? {}
                      : { scale: 0.98 }
                  }
                >
                  {createShowMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    'Create Show'
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

export default CreateShowForm;