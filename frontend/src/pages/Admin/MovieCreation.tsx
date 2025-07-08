import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Upload, Info, CheckCircle2, Plus } from 'lucide-react';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { uploadToCloudinary } from '../../services/Vendor/theaterApi';
import { movieService} from '../../services/Admin/movieApi';
import ImageCropper from '../../components/Shared/ImageCropperMovie';
import BackButton from '../../components/Buttons/BackButton';
import Navbar from '../../components/Admin/Navbar';
import Sidebar from '../../components/Admin/Sidebar';

// Movie form schema
const movieSchema = z.object({
  name: z.string().min(1, 'Movie name is required').max(100, 'Movie name must be 100 characters or less'),
  genre: z.array(z.string()).min(1, 'At least one genre is required').max(5, 'Maximum 5 genres allowed'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be 1000 characters or less'),
  language: z.string().min(1, 'Language is required'),
  trailerLink: z.string().min(1, 'Trailer link is required'),
  duration: z.object({
    hours: z.number().int().min(0, 'Hours cannot be negative'),
    minutes: z.number().int().min(0, 'Minutes cannot be negative').max(59, 'Minutes must be less than 60'),
    seconds: z.number().int().min(0, 'Seconds cannot be negative').max(59, 'Seconds must be less than 60'),
  }).refine(data => data.hours > 0 || data.minutes > 0 || data.seconds > 0, {
    message: 'Duration must be at least 1 second',
    path: ['hours'],
  }).refine(data => (data.hours * 3600 + data.minutes * 60 + data.seconds) <= 36000, {
    message: 'Duration must not exceed 10 hours',
    path: ['hours'],
  }),
  releaseDate: z.string().refine(date => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: 'Release date cannot be in the past',
  }),
  is3D: z.boolean(),
  crew: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Crew member name is required'),
    role: z.string().min(1, 'Role is required'),
    profileImage: z.string().url('Invalid image URL').optional(),
  })).min(1, 'At least one crew member is required'),
  cast: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Cast member name is required'),
    as: z.string().min(1, 'Character name is required'),
    profileImage: z.string().url('Invalid image URL').optional(),
  })).min(1, 'At least one cast member is required'),
  poster: z.string().url('Poster image is required'),
});

type MovieFormData = z.infer<typeof movieSchema>;

const MOVIE_SUBMITTED_KEY = 'movieCreationSubmitted';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const DEFAULT_PROFILE_IMAGE = import.meta.env.VITE_DEFAULT_PROFILE_IMAGE || 'https://static.vecteezy.com/system/resources/previews/003/715/527/original/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-vector.jpg';

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
  'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance',
  'Science Fiction', 'Thriller', 'War', 'Western',
];

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali',
  'Marathi', 'Punjabi', 'Gujarati', 'Spanish', 'French', 'German', 'Japanese',
];

const CREW_ROLES = ['Director', 'Producer', 'Cinematographer', 'Editor', 'Composer', 'Writer', 'Other'];

const MovieCreationForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    control,
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      name: '',
      genre: [],
      description: '',
      language: '',
      trailerLink: '',
      duration: { hours: 0, minutes: 0, seconds: 0 },
      releaseDate: new Date().toISOString().split('T')[0],
      is3D: false,
      crew: [],
      cast: [],
      poster: '',
    },
  });

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(() => {
    return localStorage.getItem(MOVIE_SUBMITTED_KEY) === 'true';
  });
  const [crewSearch, setCrewSearch] = useState('');
  const [castSearch, setCastSearch] = useState('');
  const [crewSuggestions, setCrewSuggestions] = useState<any[]>([]);
  const [castSuggestions, setCastSuggestions] = useState<any[]>([]);
  const [isSearchingCrew, setIsSearchingCrew] = useState(false);
  const [isSearchingCast, setIsSearchingCast] = useState(false);
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewRole, setNewCrewRole] = useState(CREW_ROLES[0]);
  const [newCastName, setNewCastName] = useState('');
  const [newCastCharacter, setNewCastCharacter] = useState('');

  const watchedTrailerLink = watch('trailerLink');
  const watchedCrew = watch('crew');
  const watchedCast = watch('cast');
  const watchedPoster = watch('poster');

  const crewSearchInputRef = useRef<HTMLInputElement>(null);
  const castSearchInputRef = useRef<HTMLInputElement>(null);

  const searchTMDB = useCallback(
    debounce(async (query: string, setSuggestions: React.Dispatch<React.SetStateAction<any[]>>, setIsSearching: React.Dispatch<React.SetStateAction<boolean>>) => {
      if (!query.trim()) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
        );
        console.log('TMDB response for query', query, ':', response.data.results);
        setSuggestions(response.data.results);
      } catch (error) {
        console.error('TMDB search error for query', query, ':', error);
        toast.error('Failed to fetch suggestions');
      }
      setIsSearching(false);
    }, 500),
    []
  );

  useEffect(() => {
    searchTMDB(crewSearch, setCrewSuggestions, setIsSearchingCrew);
  }, [crewSearch, searchTMDB]);

  useEffect(() => {
    searchTMDB(castSearch, setCastSuggestions, setIsSearchingCast);
  }, [castSearch, searchTMDB]);

  const handleClearForm = () => {
    localStorage.removeItem(MOVIE_SUBMITTED_KEY);
    setFormSubmitted(false);
    reset();
    setPosterFile(null);
    setPosterPreview(null);
    setNewCrewName('');
    setNewCrewRole(CREW_ROLES[0]);
    setNewCastName('');
    setNewCastCharacter('');
    navigate('/admin/movies');
  };

  const validateImageFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024;

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
      console.log('Received cropped base64:', croppedImageBase64.slice(0, 50), '...');
      // Validate base64 string
      if (!croppedImageBase64.startsWith('data:image/jpeg;base64,')) {
        console.error('Invalid base64 format:', croppedImageBase64.slice(0, 50));
        toast.error('Invalid cropped image format');
        return;
      }

      console.log('Received cropped base64 length:', croppedImageBase64.length);

      // Convert base64 to blob
      const byteString = atob(croppedImageBase64.split(',')[1]);
      const mimeString = croppedImageBase64.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      // Create file from blob
      const file = new File([blob], `movie-poster-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Set preview and file
      setPosterFile(file);
      setPosterPreview(croppedImageBase64);
      console.log('Set posterPreview with base64 length:', croppedImageBase64.length);

      // Upload to Cloudinary
      const url = await uploadToCloudinary(file);
      console.log('Cloudinary upload URL:', url);
      setValue('poster', url, { shouldValidate: true, shouldDirty: true });
    } catch (error) {
      console.error('Error in handleCroppedImage:', error);
      toast.error('Poster upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addCrewMember = (person: { id: number; name: string; profile_path?: string } | null, role: string, name?: string) => {
    const newCrew = person
      ? {
          id: String(person.id),
          name: person.name,
          role,
          profileImage: person.profile_path
            ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
            : DEFAULT_PROFILE_IMAGE,
        }
      : {
          id: `custom-${Date.now()}`,
          name: name || crewSearch,
          role,
          profileImage: DEFAULT_PROFILE_IMAGE,
        };

    console.log('Adding crew member:', newCrew);
    setValue('crew', [...watchedCrew, newCrew], { shouldValidate: true, shouldDirty: true });
    setCrewSearch('');
    setCrewSuggestions([]);
    crewSearchInputRef.current?.focus();
  };

  const addCastMember = (person: { id: number; name: string; profile_path?: string } | null, as: string, name?: string) => {
    const newCast = person
      ? {
          id: String(person.id),
          name: person.name,
          as,
          profileImage: person.profile_path
            ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
            : DEFAULT_PROFILE_IMAGE,
        }
      : {
          id: `custom-${Date.now()}`,
          name: name || castSearch,
          as: as || castSearch,
          profileImage: DEFAULT_PROFILE_IMAGE,
        };

    console.log('Adding cast member:', newCast);
    setValue('cast', [...watchedCast, newCast], { shouldValidate: true, shouldDirty: true });
    setCastSearch('');
    setCastSuggestions([]);
    castSearchInputRef.current?.focus();
  };

  const handleAddNewCrew = () => {
    if (!newCrewName.trim()) {
      toast.error('Please enter a crew member name');
      return;
    }
    addCrewMember(null, newCrewRole, newCrewName.trim());
    setNewCrewName('');
    setNewCrewRole(CREW_ROLES[0]);
  };

  const handleAddNewCast = () => {
    if (!newCastName.trim() || !newCastCharacter.trim()) {
      toast.error('Please enter both actor name and character name');
      return;
    }
    addCastMember(null, newCastCharacter.trim(), newCastName.trim());
    setNewCastName('');
    setNewCastCharacter('');
  };

  const removeCrewMember = (index: number) => {
    console.log('Removing crew member at index:', index, 'Current crew:', watchedCrew);
    setValue('crew', watchedCrew.filter((_, i) => i !== index), { shouldValidate: true, shouldDirty: true });
  };

  const removeCastMember = (index: number) => {
    console.log('Removing cast member at index:', index, 'Current cast:', watchedCast);
    setValue('cast', watchedCast.filter((_, i) => i !== index), { shouldValidate: true, shouldDirty: true });
  };

  const createMovieMutation = useMutation({
    mutationFn: movieService.createMovie,
    onSuccess: () => {
      setFormSubmitted(true);
      localStorage.setItem(MOVIE_SUBMITTED_KEY, 'true');
      toast.success('Movie created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create movie');
    },
  });

  const onSubmit = (data: MovieFormData) => {
    console.log("🚀 ~ onSubmit ~ data:", data);
    createMovieMutation.mutate({
      name: data.name,
      genre: data.genre,
      description: data.description,
      language: data.language,
      trailerLink: data.trailerLink,
      duration: data.duration,
      releaseDate: data.releaseDate,
      is3D: data.is3D,
      crew: data.crew,
      cast: data.cast,
      poster: data.poster,
    });
  };

  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /([?&]v=|embed\/|v\/|\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[2] : null;
  };

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1, transition: { duration: 0.3 } },
    out: { opacity: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="flex h-screen bg-gray-900"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <Sidebar activePage="movies" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title="Create New Movie" />
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {formSubmitted ? (
              <motion.div
                className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-10 text-center"
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
                  Movie Created Successfully!
                </motion.h2>
                <motion.p
                  className="text-lg text-gray-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Your movie has been added. You can manage it from the dashboard.
                </motion.p>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <button
                    onClick={handleClearForm}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg shadow-md hover:bg-gray-600 hover:text-white transition-all mt-3"
                  >
                    OK
                  </button>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="p-6 sm:p-8">
                  <BackButton to="/admin/movies" />
                  <motion.h1
                    className="text-2xl font-bold text-white mb-6"
                    variants={itemVariants}
                  >
                    Create New Movie
                  </motion.h1>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Movie Name */}
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <label htmlFor="name" className="text-base font-medium text-gray-200">
                        Movie Name
                      </label>
                      <input
                        {...register('name')}
                        id="name"
                        type="text"
                        placeholder="Enter movie title"
                        className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                          errors.name ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}
                    </motion.div>

                    {/* Genre */}
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <label htmlFor="genre" className="text-base font-medium text-gray-200">
                        Genre
                      </label>
                      <Controller
                        name="genre"
                        control={control}
                        render={({ field }) => (
                          <select
                            multiple
                            value={field.value}
                            onChange={(e) => {
                              const selected = Array.from(e.target.selectedOptions).map(option => option.value);
                              field.onChange(selected);
                            }}
                            className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none h-32 ${
                              errors.genre ? 'border-red-500' : ''
                            }`}
                          >
                            {GENRES.map(genre => (
                              <option key={genre} value={genre}>{genre}</option>
                            ))}
                          </select>
                        )}
                      />
                      <p className="text-sm text-gray-400">Hold Ctrl/Cmd to select multiple genres</p>
                      {errors.genre && <p className="text-red-400 text-sm">{errors.genre.message}</p>}
                    </motion.div>

                    {/* Description */}
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <label htmlFor="description" className="text-base font-medium text-gray-200">
                        Description
                      </label>
                      <textarea
                        {...register('description')}
                        id="description"
                        placeholder="Enter movie synopsis"
                        className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-y min-h-[100px] ${
                          errors.description ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.description && <p className="text-red-400 text-sm">{errors.description.message}</p>}
                    </motion.div>

                    {/* Language */}
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <label htmlFor="language" className="text-base font-medium text-gray-200">
                        Language
                      </label>
                      <select
                        {...register('language')}
                        id="language"
                        className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                          errors.language ? 'border-red-500' : ''
                        }`}
                      >
                        <option value="">Select language</option>
                        {LANGUAGES.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                      {errors.language && <p className="text-red-400 text-sm">{errors.language.message}</p>}
                    </motion.div>

                    {/* Trailer Link */}
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <label htmlFor="trailerLink" className="text-base font-medium text-gray-200">
                        Trailer Link (YouTube)
                      </label>
                      <input
                        {...register('trailerLink')}
                        id="trailerLink"
                        type="url"
                        placeholder="Enter YouTube trailer URL"
                        className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                          errors.trailerLink ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.trailerLink && <p className="text-red-400 text-sm">{errors.trailerLink.message}</p>}
                      {watchedTrailerLink && getYouTubeVideoId(watchedTrailerLink) && (
                        <motion.div
                          className="mt-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <iframe
                            width="100%"
                            height="200"
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(watchedTrailerLink)}`}
                            title="Trailer Preview"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg"
                          ></iframe>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Duration */}
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <label className="text-base font-medium text-gray-200">
                        Duration
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <input
                            {...register('duration.hours', { valueAsNumber: true })}
                            type="number"
                            placeholder="Hours"
                            min="0"
                            className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                              errors.duration?.hours ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.duration?.hours && <p className="text-red-400 text-sm">{errors.duration.hours.message}</p>}
                        </div>
                        <div>
                          <input
                            {...register('duration.minutes', { valueAsNumber: true })}
                            type="number"
                            placeholder="Minutes"
                            min="0"
                            max="59"
                            className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                              errors.duration?.minutes ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.duration?.minutes && <p className="text-red-400 text-sm">{errors.duration.minutes.message}</p>}
                        </div>
                        <div>
                          <input
                            {...register('duration.seconds', { valueAsNumber: true })}
                            type="number"
                            placeholder="Seconds"
                            min="0"
                            max="59"
                            className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                              errors.duration?.seconds ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.duration?.seconds && <p className="text-red-400 text-sm">{errors.duration.seconds.message}</p>}
                        </div>
                      </div>
                    </motion.div>

                    {/* Release Date */}
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <label htmlFor="releaseDate" className="text-base font-medium text-gray-200">
                        Release Date
                      </label>
                      <input
                        {...register('releaseDate')}
                        id="releaseDate"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                          errors.releaseDate ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.releaseDate && <p className="text-red-400 text-sm">{errors.releaseDate.message}</p>}
                    </motion.div>

                    {/* Is 3D */}
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <label className="flex items-center space-x-3">
                        <input
                          {...register('is3D')}
                          type="checkbox"
                          className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-offset-gray-700"
                        />
                        <span className="text-base font-medium text-gray-200">Available in 3D</span>
                      </label>
                    </motion.div>

                    {/* Movie Cast */}
                    <motion.div className="space-y-3" variants={itemVariants}>
                      <label className="text-base font-medium text-gray-200">
                        Movie Cast
                      </label>
                      {/* TMDB Search */}
                      <div className="relative">
                        <input
                          ref={castSearchInputRef}
                          type="text"
                          value={castSearch}
                          onChange={(e) => setCastSearch(e.target.value)}
                          placeholder="Search for actors (e.g., Robert Downey Jr.)"
                          className="w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                        {isSearchingCast && (
                          <Loader2 className="absolute right-3 top-3 w-5 h-5 animate-spin text-gray-400" />
                        )}
                      </div>
                      {castSearch && castSuggestions.length > 0 && (
                        <motion.div
                          role="listbox"
                          aria-label="Cast suggestions"
                          className="bg-gray-700 border border-gray-600 rounded-lg mt-2 max-h-64 overflow-y-auto"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {castSuggestions.map(person => (
                            <div
                              key={person.id}
                              className="flex items-center space-x-3 p-3 hover:bg-gray-600 cursor-pointer"
                            >
                              <img
                                src={person.profile_path
                                  ? `https://image.tmdb.org/t/p/w92${person.profile_path}`
                                  : DEFAULT_PROFILE_IMAGE}
                                alt={person.name}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  console.error(`Failed to load suggestion image for ${person.name}:`, person.profile_path);
                                  e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                                }}
                              />
                              <div>
                                <p className="text-white">{person.name}</p>
                                <input
                                  type="text"
                                  placeholder="Character name (e.g., Tony Stark)"
                                  onBlur={(e) => {
                                    if (e.target.value.trim()) {
                                      addCastMember(person, e.target.value.trim());
                                    }
                                  }}
                                  className="bg-gray-600 text-white rounded px-2 py-1 text-sm w-full"
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              if (castSearch.trim()) {
                                addCastMember(null, castSearch.trim());
                              } else {
                                toast.error('Please enter a character name');
                              }
                            }}
                            className="w-full p-3 text-left text-blue-400 hover:bg-gray-600"
                          >
                            Create new cast member: "{castSearch}"
                          </button>
                        </motion.div>
                      )}
                      {/* Manual Cast Addition */}
                      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-200 mb-2">Add New Cast Member</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <input
                            type="text"
                            value={newCastName}
                            onChange={(e) => setNewCastName(e.target.value)}
                            placeholder="Enter actor name"
                            className="py-2 px-3 rounded-lg bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={newCastCharacter}
                            onChange={(e) => setNewCastCharacter(e.target.value)}
                            placeholder="Enter character name"
                            className="py-2 px-3 rounded-lg bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          />
                          <motion.button
                            type="button"
                            onClick={handleAddNewCast}
                            className="py-2 px-4 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Plus className="w-4 h-4 mr-2" /> Add Cast
                          </motion.button>
                        </div>
                      </div>
                      {/* Cast Preview */}
                      {watchedCast.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {watchedCast.map((cast, index) => (
                            <motion.div
                              key={cast.id || index}
                              className="flex items-center space-x-3 bg-gray-700 p-3 rounded-lg"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <img
                                src={cast.profileImage || DEFAULT_PROFILE_IMAGE}
                                alt={cast.name}
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => {
                                  console.error(`Failed to load cast image for ${cast.name}:`, cast.profileImage);
                                  e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                                }}
                              />
                              <div className="flex-1">
                                <p className="text-white font-medium">{cast.name}</p>
                                <p className="text-gray-400 text-sm">as {cast.as}</p>
                              </div>
                              <button
                                onClick={() => removeCastMember(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      {errors.cast && <p className="text-red-400 text-sm mt-2">{errors.cast.message}</p>}
                    </motion.div>

                    {/* Movie Crew */}
                    <motion.div className="space-y-3" variants={itemVariants}>
                      <label className="text-base font-medium text-gray-200">
                        Movie Crew
                      </label>
                      {/* TMDB Search */}
                      <div className="relative">
                        <input
                          ref={crewSearchInputRef}
                          type="text"
                          value={crewSearch}
                          onChange={(e) => setCrewSearch(e.target.value)}
                          placeholder="Search for crew (e.g., Christopher Nolan)"
                          className="w-full py-3 px-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                        {isSearchingCrew && (
                          <Loader2 className="absolute right-3 top-3 w-5 h-5 animate-spin text-gray-400" />
                        )}
                      </div>
                      {crewSearch && crewSuggestions.length > 0 && (
                        <motion.div
                          role="listbox"
                          aria-label="Crew suggestions"
                          className="bg-gray-700 border border-gray-600 rounded-lg mt-2 max-h-64 overflow-y-auto"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {crewSuggestions.map(person => (
                            <div
                              key={person.id}
                              className="flex items-center space-x-3 p-3 hover:bg-gray-600 cursor-pointer"
                            >
                              <img
                                src={person.profile_path
                                  ? `https://image.tmdb.org/t/p/w92${person.profile_path}`
                                  : DEFAULT_PROFILE_IMAGE}
                                alt={person.name}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  console.error(`Failed to load suggestion image for ${person.name}:`, person.profile_path);
                                  e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                                }}
                              />
                              <div>
                                <p className="text-white">{person.name}</p>
                                <select
                                  onChange={(e) => addCrewMember(person, e.target.value)}
                                  className="bg-gray-600 text-white rounded px-2 py-1 text-sm"
                                >
                                  <option value="">Select role</option>
                                  {CREW_ROLES.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const role = CREW_ROLES[0];
                              addCrewMember(null, role);
                            }}
                            className="w-full p-3 text-left text-blue-400 hover:bg-gray-600"
                          >
                            Create new crew member: "{crewSearch}" (Role: {CREW_ROLES[0]})
                          </button>
                        </motion.div>
                      )}
                      {/* Manual Crew Addition */}
                      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-200 mb-2">Add New Crew Member</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <input
                            type="text"
                            value={newCrewName}
                            onChange={(e) => setNewCrewName(e.target.value)}
                            placeholder="Enter crew member name"
                            className="py-2 px-3 rounded-lg bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          />
                          <select
                            value={newCrewRole}
                            onChange={(e) => setNewCrewRole(e.target.value)}
                            className="py-2 px-3 rounded-lg bg-gray-600 border border-gray-500 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                          >
                            {CREW_ROLES.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                          <motion.button
                            type="button"
                            onClick={handleAddNewCrew}
                            className="py-2 px-4 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Plus className="w-4 h-4 mr-2" /> Add Crew
                          </motion.button>
                        </div>
                      </div>
                      {/* Crew Preview */}
                      {watchedCrew.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {watchedCrew.map((crew, index) => (
                            <motion.div
                              key={crew.id || index}
                              className="flex items-center space-x-3 bg-gray-700 p-3 rounded-lg"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <img
                                src={crew.profileImage || DEFAULT_PROFILE_IMAGE}
                                alt={crew.name}
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => {
                                  console.error(`Failed to load crew image for ${crew.name}:`, crew.profileImage);
                                  e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                                }}
                              />
                              <div className="flex-1">
                                <p className="text-white font-medium">{crew.name}</p>
                                <p className="text-gray-400 text-sm">{crew.role}</p>
                              </div>
                              <button
                                onClick={() => removeCrewMember(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      {errors.crew && <p className="text-red-400 text-sm mt-2">{errors.crew.message}</p>}
                    </motion.div>

                    {/* Poster Upload */}
                    <motion.div className="space-y-3" variants={itemVariants}>
                      <label className="text-base font-medium text-gray-200">
                        Movie Poster (1402x2048 pixels)
                      </label>
                      {posterPreview && (
                        <motion.div
                          className="mt-4"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <img
                            src={posterPreview}
                            alt="Poster Preview"
                            className="w-40 h-auto rounded-lg shadow-md mx-auto"
                          />
                          <button
                            onClick={() => {
                              setPosterFile(null);
                              setPosterPreview(null);
                              setValue('poster', '', { shouldValidate: true, shouldDirty: true });
                            }}
                            className="mt-2 text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove Poster
                          </button>
                        </motion.div>
                      )}
                      {!posterPreview && (
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
                      {errors.poster && <p className="text-red-400 text-sm mt-1">{errors.poster.message}</p>}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants} className="pt-4">
                      <motion.button
                        type="submit"
                        disabled={isSubmitting || !watchedPoster || createMovieMutation.isPending}
                        className={`w-full py-4 px-4 rounded-lg font-semibold text-white transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
                          isSubmitting || !watchedPoster || createMovieMutation.isPending
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        whileHover={
                          isSubmitting || !watchedPoster || createMovieMutation.isPending
                            ? {}
                            : { scale: 1.02, backgroundColor: '#2563EB' }
                        }
                        whileTap={
                          isSubmitting || !watchedPoster || createMovieMutation.isPending
                            ? {}
                            : { scale: 0.98 }
                        }
                      >
                        {createMovieMutation.isPending ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          'Create Movie'
                        )}
                      </motion.button>
                      {!watchedPoster && (
                        <motion.div
                          className="flex items-center justify-center mt-4 text-amber-400 text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Info className="w-4 h-4 mr-2" />
                          Please upload a movie poster to continue
                        </motion.div>
                      )}
                    </motion.div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {cropImage && (
              <ImageCropper
                src={cropImage}
                onImageCropped={handleCroppedImage}
                onCancel={() => setCropImage(null)}
                aspectRatio={1402 / 2048}
                fixedSize={{ width: 1402, height: 2048 }}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
};

export default MovieCreationForm;