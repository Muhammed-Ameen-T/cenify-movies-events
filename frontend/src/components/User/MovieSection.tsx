import React, { useState, useRef, useEffect } from 'react'; // Import useEffect
import { useQuery } from '@tanstack/react-query';
import { Star, Ticket, ArrowRight, Clock, ChevronLeft, ChevronRight, Calendar, Heart } from 'lucide-react';
import { getUserMovies } from '../../services/User/homePageApi';
import type { IMovie } from '../../types/movie'; // Assuming IMovie is correct
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';

interface MovieCardProps {
  movie: IMovie;
  index: number;
}

// Shimmer UI Component for a single movie card
const MovieCardShimmer: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-80 px-2 py-4 animate-pulse">
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
        {/* Shimmer Poster Area */}
        <div className="relative h-[450px] bg-gray-200/50">
          <div className="absolute top-4 left-4 h-6 w-16 bg-gray-300/50 rounded-full"></div> {/* NEW tag shimmer */}
          <div className="absolute top-4 right-4 h-6 w-16 bg-gray-300/50 rounded-full"></div> {/* Rating shimmer */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-4 text-sm mb-0">
              <div className="flex items-center gap-1 h-4 w-16 bg-gray-300/50 rounded"></div> {/* Duration shimmer */}
              <div className="flex items-center gap-1 h-4 w-20 bg-gray-300/50 rounded"></div> {/* Release date shimmer */}
              <div className="flex items-center gap-1 h-4 w-12 bg-gray-300/50 rounded"></div> {/* Likes shimmer */}
            </div>
          </div>
        </div>

        {/* Shimmer Card Content */}
        <div className="p-5 space-y-3 bg-white">
          <div>
            <div className="h-6 bg-gray-300/50 rounded w-3/4 mb-2"></div> {/* Title shimmer */}
            <div className="h-4 bg-gray-300/50 rounded w-1/2"></div> {/* Genre shimmer */}
            <div className="h-3 bg-gray-300/50 rounded w-full mt-2"></div> {/* Description line 1 shimmer */}
            <div className="h-3 bg-gray-300/50 rounded w-5/6 mt-1"></div> {/* Description line 2 shimmer */}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1 bg-gray-300/50 h-12 rounded-xl"></div> {/* Button shimmer */}
          </div>
        </div>
      </div>
    </div>
  );
};


const MovieSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const currentLocation = useSelector((state: RootState) => state.location.selectedLocation);

  // Helper functions defined before useQuery
  const formatDuration = (duration: { hours: number; minutes: number }) => {
    return `${duration.hours}h ${duration.minutes}m`;
  };

  const isNewRelease = (releaseDate: string) => {
    const date = new Date(releaseDate);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 30;
  };

  // Fetch movies with useQuery
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['userMovies', currentLocation], // Include currentLocation in queryKey
    queryFn: () => getUserMovies({ page: 1, limit: 8, location: currentLocation }), // Pass location to API call
    select: (data) => {
      if (!data?.movies) return { movies: [], totalCount: 0 };
      return {
        movies: data.movies.map((movie: any) => ({
          id: movie._id,
          title: movie.name,
          image: movie.poster || 'https://via.placeholder.com/300x450',
          genre: movie.genre.join(' • '),
          rating: movie.rating,
          duration: formatDuration(movie.duration),
          releaseDate: new Date(movie.releaseDate).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }),
          isNew: isNewRelease(movie.releaseDate),
          description: movie.description,
          likes: movie.likes
        })),
        totalCount: data.totalCount,
      };
    },
    retry: 1,
    // Add onSuccess to adjust scroll buttons after data loads
    onSuccess: () => {
      // Small delay to ensure DOM updates before calculating scroll
      setTimeout(() => handleScroll(), 0);
    },
  });

  const movies = data?.movies || [];
  const totalCount = data?.totalCount || 0;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of a card + gap (approx)
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  // Adjust scroll visibility immediately on mount and on data load
  useEffect(() => {
    handleScroll(); // Initial check
  }, [movies, isLoading]); // Re-run when movies change or loading state changes

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Added a small threshold (e.g., 5) to account for sub-pixel rendering or minor differences
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };


  return (
    <section className="pt-20 px-4 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
              <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">
                Now Playing in {currentLocation ? currentLocation : 'Your Location'}
              </span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tight">
              Featured Movies
            </h2>
            <p className="text-gray-600 mt-2 text-lg">Discover the latest blockbusters and timeless classics</p>
          </div>
          <a
            href="/movie-listing"
            className="group flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/25"
          >
            <span>View All</span>
            <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Movie Carousel */}
        <div className="relative">
          {isLoading ? ( // Use isLoading for shimmer
            <div
              className="flex gap-6 pb-4 overflow-x-hidden" // Hide overflow during shimmer
            >
              {[...Array(3)].map((_, index) => ( // Render 3 shimmer cards
                <MovieCardShimmer key={index} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center text-red-600 py-8">
              <p>Error: {error?.message || 'Failed to fetch movies'}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-500"
              >
                Retry
              </button>
            </div>
          ) : totalCount === 0 ? (
            <div className="text-center text-gray-600 py-8">
              <p>No movies available in your location.</p>
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex gap-6 pb-4 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {movies.map((movie, index) => (
                  <MovieCard key={movie.id} movie={movie} index={index} />
                ))}
              </div>

              {/* Navigation Arrows */}
              {canScrollLeft && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border border-gray-200"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {canScrollRight && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border border-gray-200"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Scroll Indicator - Only show if not loading and has movies */}
        {!isLoading && !isError && totalCount > 0 && (
          <div className="flex justify-center mt-6 gap-2">
            {/* The current logic for scroll indicator might need adjustment to reflect actual visible cards */}
            {/* For now, it will show a fixed number of dots or based on total movies */}
            {Array.from({ length: Math.min(movies.length, 5) }).map((_, i) => (
              <div key={i} className="w-2 h-2 bg-gray-300 rounded-full"></div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// MovieCard component remains unchanged
const MovieCard: React.FC<MovieCardProps> = ({ movie, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="flex-shrink-0 w-80 group cursor-pointer px-2 py-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/movie-details/${movie.id}`)} // Make the whole card clickable
    >
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-gray-100 hover:border-yellow-200">
        {/* Movie Poster */}
        <div className="relative h-[450px] overflow-hidden">
          <img
            src={movie.image}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          {movie.isNew && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              NEW
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="font-bold text-sm">{movie.rating}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-4 text-sm mb-0 opacity-90">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{movie.duration}</span>
              </div>
              {movie.releaseDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{movie.releaseDate}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{movie.likes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 space-y-3 bg-white">
          <div>
            <h3 className="font-bold text-gray-900 text-xl mb-1 line-clamp-1 group-hover:text-yellow-600 transition-colors">
              {movie.title}
            </h3>
            <p className="text-gray-600 text-sm font-medium">{movie.genre}</p>
            <p className="text-gray-500 text-xs mt-1 line-clamp-2">{movie.description}</p>
          </div>
          <div className="flex items-center justify-between">
            {/* The button within the card should also navigate */}
            <button
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/25"
            >
              <Ticket className="w-5 h-5" />
              <span>Book Now</span>
            </button>
          </div>
        </div>
        <div className="absolute inset-0 rounded-3xl border-2 border-yellow-400/0 group-hover:border-yellow-400/50 transition-colors duration-300 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default MovieSection;