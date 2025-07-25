import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Play,
  Heart,
  Star,
  Clock,
  Calendar,
  Ticket,
  Users,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  ThumbsUp,
  Earth,
  ExternalLink,
} from 'lucide-react';
import Footer from './Footer';
import { getMovieDetails, getUserMoviesForYouMightAlsoLike, isLikedMovie, likeMovie } from '../../services/User/movieApi';
import { formatRelativeTime } from '../../utils/timeFormator';
import Loader from '../Shared/Loading';

// Utility to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const MovieDetailPage: React.FC = () => {
  const { id: movieId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Fetch movie details
  const { data: movie, isLoading, isError, error } = useQuery({
    queryKey: ['movieDetails', movieId],
    queryFn: () => getMovieDetails(movieId!),
    enabled: !!movieId,
  });

  // Fetch suggested movies
  const { data: suggestedMoviesData, isLoading: isSuggestedLoading } = useQuery({
    queryKey: ['suggestedMovies', movie?._id],
    queryFn: () =>
      getUserMoviesForYouMightAlsoLike({
        genres: movie?.genre || [],
        limit: 4,
        page: 1,
      }),
    enabled: !!movie?._id,
    select: (data) => data?.movies.filter((m: any) => m._id !== movie?._id) || [],
  });

  // Fetch isLiked status
  const { data: isMovieLiked } = useQuery<boolean>({
    queryKey: ['isLikedMovie', movieId],
    queryFn: () => isLikedMovie(movieId!),
    enabled: !!movieId,
    onSuccess: (data) => {  
      setIsLiked(data);
    },
    onError: () => {
      toast.error('Failed to fetch like status');
    },
  });
  useEffect(() => {
    setIsLiked(isMovieLiked)
  }, [isMovieLiked])

  // Set initial likes count from movie data
  useEffect(() => {
    if (movie?.likes !== undefined) {
      setLikes(movie.likes);
    }
  }, [movie]);

  const formatDuration = (duration: { hours: number; minutes: number; seconds: number } | undefined) => {
    if (!duration) return 'N/A';
    return `${duration.hours}h ${duration.minutes}m`;
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleLike = async () => {
    if (!movieId || isLiking) return;

    setIsLiking(true);
    const previousIsLiked = isLiked;
    const previousLikes = likes;
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);

    try {
      const updatedMovie = await likeMovie(movieId, !isLiked);
      if (updatedMovie) {
        setLikes(updatedMovie.likes || likes);
        queryClient.invalidateQueries(['movieDetails', movieId]);
        queryClient.invalidateQueries(['isLikedMovie', movieId]);
        toast.success(`Movie ${!isLiked ? 'liked' : 'unliked'} successfully!`);
      }
    } catch (err) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikes(previousLikes);
      toast.error('Failed to update like status');
      console.error('Failed to update like status:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <Loader/>
      </div>
    );
  }

  // Error state
  if (isError || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <div className="text-2xl font-semibold text-red-600">
          {error instanceof Error ? `Error: ${error.message}` : 'Failed to load movie details'}
        </div>
      </div>
    );
  }

  // Extract YouTube video ID
  const trailerId = movie.trailer ? getYouTubeVideoId(movie.trailer) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Hero Section - Enhanced Mobile Responsive */}
      <div className="relative h-[50vh] xs:h-[55vh] sm:h-[65vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={movie.poster || 'https://via.placeholder.com/1200x675'}
            alt={movie.name || 'Movie'}
            className="w-full h-full object-cover filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-3 xs:p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Layout (< sm) */}
            <div className="block sm:hidden space-y-3">
              {/* Mobile Poster and Title Container */}
              <div className="flex items-end gap-3 mb-3">
                {/* Small Mobile Poster */}
                <div className="flex-shrink-0">
                  <img
                    src={movie.poster || 'https://via.placeholder.com/300x450'}
                    alt={movie.name || 'Movie'}
                    className="w-42 xs:w-32 h-58 xs:h-40 object-cover rounded-lg shadow-xl border-2 border-white/20"
                  />
                </div>
                
                {/* Mobile Movie Info */}
                <div className="flex-1 text-white space-y-2">
                  {/* Status and Rating */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full font-bold text-xs">
                      {movie.status === 'released' ? 'NOW PLAYING' : movie.status?.toUpperCase() || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="font-bold text-xs">{movie.rating || '0'}</span>
                    </div>
                  </div>
                  
                  {/* Mobile Title */}
                  <h1 className="text-4xl xs:text-2xl font-black leading-tight line-clamp-2">
                    {movie.name || 'Untitled'}
                  </h1>
                </div>
              </div>

              {/* Mobile Movie Details */}
              <div className="space-y-2 text-white">
                {/* Genre */}
                <p className="text-gray-300 text-sm line-clamp-1">
                  {movie.genre?.join(' • ') || 'N/A'}
                </p>
                
                {/* Movie Meta Info */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(movie.duration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(movie.releaseDate || '').getFullYear()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Earth className="w-3 h-3" />
                    <span>{movie.language || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex gap-2 pt-2">
                {trailerId && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-bold px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-all duration-300 text-sm"
                  >
                    <Play className="w-4 h-4" />
                    <span>Trailer</span>
                  </button>
                )}
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all duration-300 text-sm min-w-[80px] ${
                    isLiked ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                  } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLiking ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
                    </svg>
                  ) : (
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  )}
                  <span className="hidden xs:inline">{likes.toLocaleString()}</span>
                  <span className="xs:hidden">{likes > 999 ? `${(likes/1000).toFixed(1)}k` : likes}</span>
                </button>
              </div>
            </div>

            {/* Desktop/Tablet Layout (sm+) - Keep existing layout */}
            <div className="hidden sm:flex gap-6 md:gap-8 items-end">
              {/* Movie Poster */}
              <div className="flex-shrink-0">
                <img
                  src={movie.poster || 'https://via.placeholder.com/300x450'}
                  alt={movie.name || 'Movie'}
                  className="w-56 h-80 md:w-64 md:h-96 lg:w-80 lg:h-[28rem] object-cover rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-white/20"
                />
              </div>
              
              {/* Movie Details */}
              <div className="flex-1 text-white space-y-3 md:space-y-4">
                {/* Status and Rating badges */}
                <div className="flex items-center gap-3 md:gap-4 mb-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full font-bold text-sm">
                    {movie.status === 'released' ? 'NOW PLAYING' : movie.status?.toUpperCase() || 'N/A'}
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-bold text-sm">{movie.rating || '0'}</span>
                  </div>
                </div>
                
                {/* Movie Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4 leading-tight">
                  {movie.name || 'Untitled'}
                </h1>
                
                {/* Movie Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 md:gap-6 text-base md:text-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{formatDuration(movie.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{formatDate(movie.releaseDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Earth className="w-5 h-5" />
                    <span>{movie.language || 'N/A'}</span>
                  </div>
                </div>
                
                {/* Genre */}
                <p className="text-gray-300 text-base md:text-lg">
                  {movie.genre?.join(' • ') || 'N/A'}
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pt-3 md:pt-4">
                  {trailerId && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="flex items-center gap-3 bg-white text-black font-bold px-6 py-3 md:px-8 md:py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 text-base w-full sm:w-auto justify-center sm:justify-start"
                    >
                      <Play className="w-5 h-5 md:w-6 md:h-6" />
                      <span>Watch Trailer</span>
                    </button>
                  )}
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex items-center gap-2 px-5 py-3 md:px-6 md:py-4 rounded-xl border-2 transition-all duration-300 text-base w-full sm:w-auto justify-center sm:justify-start ${
                      isLiked ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                    } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLiking ? (
                      <svg className="w-5 h-5 md:w-6 md:h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
                      </svg>
                    ) : (
                      <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isLiked ? 'fill-current' : ''}`} />
                    )}
                    <span>{likes.toLocaleString()}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Navigation Tabs */}
            <div className="flex gap-2 bg-gray-100 p-2 rounded-2xl">
              {['about', 'cast', 'crew', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* About Section */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-gray-900">About the Movie</h3>
                <p className="text-gray-700 text-lg leading-relaxed">{movie.description || 'No description available'}</p>
                <div className="grid grid-cols-2 gap-6 bg-gray-100 p-6 rounded-2xl">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Director</h4>
                    <p className="text-gray-700">
                      {movie.crew?.find((c: any) => c.role === 'Director')?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Language</h4>
                    <p className="text-gray-700">{movie.language || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Country</h4>
                    <p className="text-gray-700">{movie.country || 'India'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Release Date</h4>
                    <p className="text-gray-700">{formatDate(movie.releaseDate)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cast Section */}
            {activeTab === 'cast' && (
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Users className="w-8 h-8 text-yellow-500" />
                  <span>Cast</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(movie.cast || []).map((actor: any) => (
                    <div
                      key={actor.id || actor.name}
                      className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative"
                    >
                      <img
                        src={actor.profileImage || 'https://via.placeholder.com/150'}
                        alt={actor.name || 'Actor'}
                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{actor.name || 'N/A'}</h4>
                        <p className="text-gray-600">as {actor.as || 'Unknown'}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/actor-profile/${actor.id || ''}`)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-yellow-500 transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Crew Section */}
            {activeTab === 'crew' && (
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Award className="w-8 h-8 text-yellow-500" />
                  <span>Crew</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(movie.crew || []).map((member: any) => (
                    <div
                      key={member.id || member.name}
                      className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative"
                    >
                      <img
                        src={member.profileImage || 'https://via.placeholder.com/150'}
                        alt={member.name || 'Crew Member'}
                        className="w-20 h-20 rounded-full object-cover border-4 border-orange-200"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{member.name || 'N/A'}</h4>
                        <p className="text-gray-600">{member.role || 'Unknown'}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/actor-profile/${member.id || ''}`)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-yellow-500 transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>  
            )}

            {/* Reviews Section */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-gray-900">Reviews</h3>
                {(movie.reviews || []).length === 0 ? (
                  <p className="text-gray-600">No reviews available yet.</p>
                ) : (
                  <div className="space-y-6">
                    {(movie.reviews || []).map((review: any) => (
                      <div
                        key={review.id || review.comment}
                        className="bg-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={review.userId?.profileImage || import.meta.env.VITE_DEFAULT_PROFILE_IMAGE}
                            onError={(e) => {
                              e.currentTarget.src = import.meta.env.VITE_DEFAULT_PROFILE_IMAGE;
                            }}
                            alt={review.userId?.name || 'Anonymous'}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <h4 className="font-bold text-gray-900">{review.userId?.name || 'Anonymous'}</h4>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="font-semibold">{review.rating || 0} / 5</span>
                                  </div>
                                  <span className="text-gray-500 text-sm">{formatRelativeTime(review.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-0">{review.comment || 'No comment'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Book Tickets Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Book Tickets</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Movie</span>
                  <span className="font-semibold text-gray-900">{movie.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-900">{formatDuration(movie.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900">{movie.rating || '0'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/show-selection/${movie._id}`)}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/25"
              >
                <Ticket className="w-6 h-6" />
                <span>Book Tickets</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* You Might Also Like */}
      <section className="py-16 px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-4xl font-bold text-gray-900">You Might Also Like</h3>
          </div>
          <div className="relative">
            {isSuggestedLoading ? (
              <div className="flex gap-6 pb-6 overflow-x-auto scrollbar-hide scroll-smooth pt-3 pl-2">
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="flex-shrink-0 w-72">
                      <div className="bg-gray-200 rounded-2xl h-96 animate-pulse"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : suggestedMoviesData?.length ? (
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex gap-6 pb-6 overflow-x-auto scrollbar-hide scroll-smooth pt-3 pl-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {suggestedMoviesData.map((suggestedMovie: any) => (
                  <div
                    key={suggestedMovie._id}
                    className="flex-shrink-0 w-72 group cursor-pointer"
                    onClick={() => navigate(`/movie-details/${suggestedMovie._id}`)}
                  >
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="relative h-96 overflow-hidden">
                        <img
                          src={suggestedMovie.poster || 'https://via.placeholder.com/300x450'}
                          alt={suggestedMovie.name || 'Movie'}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-bold text-sm">{suggestedMovie.rating || '0'}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{suggestedMovie.name || 'N/A'}</h4>
                        <p className="text-gray-600 text-sm">{suggestedMovie.genre?.join(' • ') || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No suggested movies available.</p>
            )}
            {canScrollLeft && suggestedMoviesData?.length > 0 && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {canScrollRight && suggestedMoviesData?.length > 4 && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      {showTrailer && trailerId && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-yellow-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerId}?autoplay=1`}
              title="Movie Trailer"
              className="w-full h-full rounded-2xl"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default MovieDetailPage;