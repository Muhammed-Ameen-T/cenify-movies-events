import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/Admin/Navbar';
import Sidebar from '../../components/Admin/Sidebar';
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  X,
  Film,
  Calendar,
  Clock,
  Globe,
  Tag,
  User,
  Users,
  Star,
  FileText,
  Filter,
  Search,
  RotateCcw,
} from 'lucide-react';
import { movieService } from '../../services/Admin/movieApi';
import { IMovie, ICast, ICrew, IDuration } from '../../types/movie';

// Default fallback images
const DEFAULT_IMAGE = 'https://via.placeholder.com/1402x2048?text=No+Image';
const DEFAULT_PROFILE_IMAGE =
  'https://static.vecteezy.com/system/resources/previews/003/715/527/original/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-vector.jpg';

// Status and genre options
const statusOptions = ['upcoming', 'released', 'archived'];
const genreOptions = ['Action', 'Thriller', 'Drama', 'Comedy', 'Animation'];
const ITEMS_PER_PAGE = 8;

// Filter options type
type FilterOptions = {
  search: string;
  status: string[];
  genre: string[];
  releaseDate: 'newest' | 'oldest' | null;
};

// Map backend movie data to frontend IMovie interface
const mapToFrontendMovie = (backendMovie: any): IMovie => ({
  _id: backendMovie._id,
  name: backendMovie.name,
  genre: backendMovie.genre || [],
  trailer: backendMovie.trailer,
  rating: backendMovie.rating || 0,
  poster: backendMovie.poster || DEFAULT_IMAGE,
  duration: backendMovie.duration || { hours: 0, minutes: 0, seconds: 0 },
  description: backendMovie.description || '',
  language: backendMovie.language || '',
  releaseDate: new Date(backendMovie.releaseDate),
  status: backendMovie.status || 'upcoming',
  likes: backendMovie.likes || 0,
  interests: backendMovie.interests || 0,
  is3D: backendMovie.is3D || false,
  crew: (backendMovie.crew || []).map((c: any) => ({
    id: c.id || c._id || '',
    name: c.name || '',
    role: c.role || '',
    profileImage: c.profileImage || DEFAULT_PROFILE_IMAGE,
  })),
  cast: (backendMovie.cast || []).map((c: any) => ({
    id: c.id || c._id || '',
    name: c.name || '',
    as: c.as || '',
    profileImage: c.profileImage || DEFAULT_PROFILE_IMAGE,
  })),
  reviews: backendMovie.reviews || [],
  createdAt: backendMovie.createdAt ? new Date(backendMovie.createdAt) : undefined,
  updatedAt: backendMovie.updatedAt ? new Date(backendMovie.updatedAt) : undefined,
});

// Shimmer Card Component
const ShimmerCard: React.FC = () => (
  <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 animate-pulse">
    <div className="relative h-[450px] w-full">
      <div className="w-full h-full bg-gray-700"></div>
    </div>
    <div className="p-5 space-y-4">
      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/3"></div>
        <div className="h-4 bg-gray-700 rounded w-1/4"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-8 bg-gray-700 rounded w-24"></div>
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-gray-700 rounded"></div>
          <div className="h-8 w-8 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const Movies: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: [],
    genre: [],
    releaseDate: null,
  });

  // Fetch movies data
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies', currentPage, filters],
    queryFn: () =>
      movieService.getMovies({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: filters.search || undefined,
        status: filters.status.length > 0 ? filters.status.join(',') : undefined,
        genre: filters.genre.length > 0 ? filters.genre.join(',') : undefined,
        sortBy: filters.releaseDate ? 'releaseDate' : undefined,
        sortOrder: filters.releaseDate === 'newest' ? 'desc' : filters.releaseDate === 'oldest' ? 'asc' : undefined,
      }),
  });

  const movies = data?.movies || [];
  const totalMovies = data?.totalCount || 0;
  const totalPages = data?.totalPages || Math.ceil(totalMovies / ITEMS_PER_PAGE);

  // Update movie status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { movieId: string; status: string }) =>
      movieService.updateMovieStatus(data.movieId, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success('Movie status updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  // Handle status change
  const handleStatusChange = (movieId: string, newStatus: string) => {
    updateStatusMutation.mutate({ movieId, status: newStatus });
  };

  // Open movie detail modal
  const openMovieDetail = (movie: IMovie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  // Navigate to edit movie
  const handleEditMovie = (movieId: string) => {
    navigate(`/admin/movies/edit/${movieId}`);
  };

  // Navigate to create movie
  const handleCreateMovie = () => {
    navigate('/admin/create-movie');
  };

  // Filter handlers
  const toggleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
    setCurrentPage(1);
  };

  const toggleGenreFilter = (genre: string) => {
    setFilters((prev) => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter((g) => g !== genre)
        : [...prev.genre, genre],
    }));
    setCurrentPage(1);
  };

  const setReleaseDateFilter = (releaseDate: 'newest' | 'oldest' | null) => {
    setFilters((prev) => ({
      ...prev,
      releaseDate,
    }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: [],
      genre: [],
      releaseDate: null,
    });
    setCurrentPage(1);
  };

  // Update URL with filters and pagination
  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (currentPage > 1) queryParams.set('page', currentPage.toString());
    if (filters.search) queryParams.set('search', filters.search);
    if (filters.status.length > 0) queryParams.set('status', filters.status.join(','));
    if (filters.genre.length > 0) queryParams.set('genre', filters.genre.join(','));
    if (filters.releaseDate) queryParams.set('releaseDate', filters.releaseDate);

    const queryString = queryParams.toString();
    navigate(
      {
        pathname: location.pathname,
        search: queryString ? `?${queryString}` : '',
      },
      { replace: true }
    );

    // Count active filters
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.genre.length > 0) count++;
    if (filters.releaseDate) count++;
    setActiveFilterCount(count);
  }, [filters, currentPage, location.pathname, navigate]);

  // Load filters and pagination from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newFilters = { ...filters };

    if (searchParams.has('page')) setCurrentPage(Number(searchParams.get('page')));
    if (searchParams.has('search')) newFilters.search = searchParams.get('search')!;
    if (searchParams.has('status')) newFilters.status = searchParams.get('status')!.split(',');
    if (searchParams.has('genre')) newFilters.genre = searchParams.get('genre')!.split(',');
    if (searchParams.has('releaseDate'))
      newFilters.releaseDate = searchParams.get('releaseDate') as 'newest' | 'oldest';

    setFilters(newFilters);
  }, []);

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1, transition: { duration: 0.3 } },
    out: { opacity: 0 },
  };

  // Card animation variants
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
    hover: {
      y: -10,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
      transition: { duration: 0.2 },
    },
  };

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar activePage="movies" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title="Movies" />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
          >
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">Movie Management</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
                    <Search className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search movies by name..."
                      className="bg-transparent text-white outline-none w-64"
                      value={filters.search}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreateMovie}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <Film size={18} />
                  <span>Add New Movie</span>
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-gray-800 rounded-xl mb-8 shadow-lg">
              <div className="flex flex-wrap items-center p-2">
                <button
                  onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                  className={`flex items-center p-3 rounded-lg mr-2 transition-all ${
                    isFilterDrawerOpen ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Filter className="w-5 h-5 mr-2" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <div className="relative group mx-1">
                  <button
                    className={`flex items-center p-3 rounded-lg transition-all ${
                      filters.releaseDate ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>
                      {filters.releaseDate
                        ? filters.releaseDate === 'newest'
                          ? 'Newest First'
                          : 'Oldest First'
                        : 'Release Date'}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => setReleaseDateFilter('newest')}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${
                        filters.releaseDate === 'newest' ? 'text-orange-500' : 'text-gray-300'
                      }`}
                    >
                      Newest First
                    </button>
                    <button
                      onClick={() => setReleaseDateFilter('oldest')}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${
                        filters.releaseDate === 'oldest' ? 'text-orange-500' : 'text-gray-300'
                      }`}
                    >
                      Oldest First
                    </button>
                  </div>
                </div>
                <div className="relative group mx-1">
                  <button
                    className={`flex items-center p-3 rounded-lg transition-all ${
                      filters.status.length > 0 ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Tag className="w-5 h-5 mr-2" />
                    <span>Status {filters.status.length > 0 && `(${filters.status.length})`}</span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {statusOptions.map((status) => (
                      <label
                        key={status}
                        className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={() => toggleStatusFilter(status)}
                          className="mr-2 accent-orange-500"
                        />
                        <span
                          className={filters.status.includes(status) ? 'text-orange-500' : 'text-gray-300'}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="relative group mx-1">
                  <button
                    className={`flex items-center p-3 rounded-lg transition-all ${
                      filters.genre.length > 0 ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Tag className="w-5 h-5 mr-2" />
                    <span>Genre {filters.genre.length > 0 && `(${filters.genre.length})`}</span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {genreOptions.map((genre) => (
                      <label
                        key={genre}
                        className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.genre.includes(genre)}
                          onChange={() => toggleGenreFilter(genre)}
                          className="mr-2 accent-orange-500"
                        />
                        <span
                          className={filters.genre.includes(genre) ? 'text-orange-500' : 'text-gray-300'}
                        >
                          {genre}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  onClick={resetFilters}
                  className={`flex items-center p-3 rounded-lg ml-auto ${
                    activeFilterCount > 0 ? 'text-orange-500' : 'text-gray-500'
                  }`}
                  disabled={activeFilterCount === 0}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset Filters
                </button>
              </div>
              <AnimatePresence>
                {isFilterDrawerOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-gray-700"
                  >
                    <div className="p-4">
                      <h3 className="text-white font-medium mb-3">Additional Filters</h3>
                      <div className="text-gray-400 text-sm">No additional filters available for movies.</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <div className="text-red-400 mb-4 p-3 bg-red-900/30 rounded-lg border border-red-800">
                {error.message || 'Failed to load movies'}
              </div>
            )}

            {/* Movies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {isLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <ShimmerCard key={index} />
                ))
              ) : movies.length === 0 ? (
                <div className="col-span-full text-center p-8">
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-gray-400 text-5xl mb-4">🎬</div>
                    <h3 className="text-white text-xl font-bold mb-2">No movies found</h3>
                    <p className="text-gray-400 mb-6">
                      We couldn't find any movies matching your filter criteria
                    </p>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              ) : (
                movies.map((movie, index) => (
                  <MovieCard
                    key={movie._id}
                    movie={movie}
                    index={index}
                    onStatusChange={handleStatusChange}
                    onView={() => openMovieDetail(movie)}
                    onEdit={() => handleEditMovie(movie._id)}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6">
                <div className="flex items-center bg-gray-800 rounded-lg shadow-lg p-2 space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      currentPage === 1
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      ></path>
                    </svg>
                    Previous
                  </button>
                  {totalPages <= 5 ? (
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === page
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))
                  ) : (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === 1
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        1
                      </button>
                      {currentPage > 3 && <span className="px-3 py-2 text-gray-500">...</span>}
                      {currentPage > 2 && (
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
                        >
                          {currentPage - 1}
                        </button>
                      )}
                      {currentPage !== 1 && currentPage !== totalPages && (
                        <button className="px-4 py-2 rounded-lg bg-orange-600 text-white">
                          {currentPage}
                        </button>
                      )}
                      {currentPage < totalPages - 1 && (
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
                        >
                          {currentPage + 1}
                        </button>
                      )}
                      {currentPage < totalPages - 2 && (
                        <span className="px-3 py-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === totalPages
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      currentPage === totalPages
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Next
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </button>
                </div>
                <div className="ml-4 text-gray-400 text-sm">
                  Page {currentPage} of {totalPages} ({totalPages - currentPage} pages remaining)
                </div>
              </div>
            )}

            {/* Results count info */}
            {!isLoading && movies.length > 0 && (
              <div className="mt-4 text-gray-400 text-sm text-center">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalMovies)} of {totalMovies} movies
              </div>
            )}

            {/* Movie Detail Modal */}
            <AnimatePresence>
              {isModalOpen && selectedMovie && (
                <MovieDetailModal
                  movie={selectedMovie}
                  onClose={() => setIsModalOpen(false)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// Movie Card Component
interface MovieCardProps {
  movie: IMovie;
  index: number;
  onStatusChange: (movieId: string, status: string) => void;
  onView: () => void;
  onEdit: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  index,
  onStatusChange,
  onView,
  onEdit,
}) => {
  const [dropupOpen, setDropupOpen] = useState(false);

  // Format duration
  const formatDuration = (duration: IDuration): string => {
    const { hours, minutes, seconds } = duration;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <motion.div
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-orange-500 transition-all"
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: (i: number) => ({
          y: 0,
          opacity: 1,
          transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: 'easeOut',
          },
        }),
        hover: {
          y: -10,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
          transition: { duration: 0.2 },
        },
      }}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
    >
      <div className="relative">
        {/* Movie Poster */}
        <div className="relative h-[450px] w-full overflow-hidden">
          <img
            src={movie.poster}
            alt={movie.name}
            className="w-full h-full object-cover"
            style={{ aspectRatio: '1402/2048' }}
            onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="bg-orange-600 text-white text-xs font-medium px-2.5 py-1 rounded capitalize">
              {movie.status}
            </span>
            {movie.is3D && (
              <span className="bg-purple-600 text-white text-xs font-medium px-2.5 py-1 rounded">
                3D
              </span>
            )}
          </div>
        </div>

        {/* Movie Info */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{movie.name}</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center text-gray-400">
              <Tag size={14} className="mr-2" />
              <span>{movie.genre.join(', ') || 'N/A'}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Globe size={14} className="mr-2" />
              <span>{movie.language || 'N/A'}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Clock size={14} className="mr-2" />
              <span>{formatDuration(movie.duration)}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Calendar size={14} className="mr-2" />
              <span>{new Date(movie.releaseDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            {/* Status Dropup */}
            <div className="relative">
              <button
                onClick={() => setDropupOpen(!dropupOpen)}
                className="flex items-center justify-between w-32 px-3 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 capitalize"
              >
                <span>{movie.status}</span>
                <ChevronUp
                  size={16}
                  className={`transition-transform duration-200 ${dropupOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {dropupOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-10 bottom-full mb-1 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-lg overflow-hidden"
                >
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 transition-colors capitalize ${
                        movie.status === status ? 'bg-orange-600' : 'text-white'
                      }`}
                      onClick={() => {
                        onStatusChange(movie._id, status);
                        setDropupOpen(false);
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                onClick={onView}
                title="View Details"
              >
                <Eye size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                onClick={onEdit}
                title="Edit Movie"
              >
                <Edit2 size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Movie Detail Modal Component
interface MovieDetailModalProps {
  movie: IMovie;
  onClose: () => void;
}

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ movie, onClose }) => {
  // Convert YouTube URL to embedded format
  const getEmbedUrl = (url: string | undefined): string => {
    if (!url) return '';
    const videoIdMatch = url.match(/(?:v=|youtu\.be\/|\/embed\/)([^&\n?]+)/i);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : '';
  };

  // Format duration
  const formatDuration = (duration: IDuration): string => {
    const { hours, minutes, seconds } = duration;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
<div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-transparent p-4 backdrop-blur-md">
        <motion.div
        className="bg-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
          exit: { opacity: 0, y: 50, transition: { duration: 0.2 } },
        }}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-white">{movie.name}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X size={24} className="text-gray-400 hover:text-white transition-colors" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Movie Media */}
            <div className="flex flex-col space-y-6">
              <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
                <img
                  src={movie.poster}
                  alt={movie.name}
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: '1402/2048' }}
                  onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
                />
              </div>
              {movie.trailer && getEmbedUrl(movie.trailer) && (
                <div className="w-full rounded-lg overflow-hidden shadow-lg aspect-video">
                  <iframe
                    src={getEmbedUrl(movie.trailer)}
                    title={`${movie.name} trailer`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>

            {/* Movie Details */}
            <div className="space-y-6">
              {/* Movie Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Tag className="text-orange-400" size={18} />
                  <span className="text-gray-300 font-medium">Genre:</span>
                  <span className="text-white">{movie.genre.join(', ') || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="text-orange-400" size={18} />
                  <span className="text-gray-300 font-medium">Language:</span>
                  <span className="text-white">{movie.language || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="text-orange-400" size={18} />
                  <span className="text-gray-300 font-medium">Duration:</span>
                  <span className="text-white">{formatDuration(movie.duration)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="text-orange-400" size={18} />
                  <span className="text-gray-300 font-medium">Release Date:</span>
                  <span className="text-white">{new Date(movie.releaseDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Film className="text-orange-400" size={18} />
                  <span className="text-gray-300 font-medium">Status:</span>
                  <span className="text-white capitalize">{movie.status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 font-medium">3D:</span>
                  <span className="text-white">{movie.is3D ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="text-orange-400" size={18} />
                  <span className="text-gray-300 font-medium">Rating:</span>
                  <span className="text-white">{movie.rating || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="text-orange-400" size={18} />
                  <span className="text-gray-300 font-medium">Description:</span>
                  <span className="text-white">{movie.description || 'No description available'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="text-orange-400" size={18} />
                  <span className="text-gray-300 font-medium">Created:</span>
                  <span className="text-white">
                    {movie.createdAt ? new Date(movie.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Cast Information */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <User className="text-orange-400 mr-2" size={18} />
                  Cast
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {movie.cast?.length ? (
                    movie.cast.map((castMember) => (
                      <div
                        key={castMember.id || castMember.name}
                        className="flex items-center space-x-3 bg-gray-700 p-3 rounded-lg"
                      >
                        <img
                          src={castMember.profileImage || DEFAULT_PROFILE_IMAGE}
                          alt={castMember.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_IMAGE)}
                        />
                        <div>
                          <p className="text-white font-medium">{castMember.name}</p>
                          <p className="text-gray-400 text-sm">as {castMember.as || 'N/A'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No cast information available</p>
                  )}
                </div>
              </div>

              {/* Crew Information */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Users className="text-orange-400 mr-2" size={18} />
                  Crew
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {movie.crew?.length ? (
                    movie.crew.map((crewMember) => (
                      <div
                        key={crewMember.id || crewMember.name}
                        className="flex items-center space-x-3 bg-gray-700 p-3 rounded-lg"
                      >
                        <img
                          src={crewMember.profileImage || DEFAULT_PROFILE_IMAGE}
                          alt={crewMember.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_IMAGE)}
                        />
                        <div>
                          <p className="text-white font-medium">{crewMember.name}</p>
                          <p className="text-gray-400 text-sm">{crewMember.role || 'N/A'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No crew information available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Movies;