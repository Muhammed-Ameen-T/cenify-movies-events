import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, MapPin, Calendar, Film, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import movieService from '../../services/User/movieApi';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'movie' | 'theater' | 'event' | 'recent' | 'trending';
  subtitle?: string;
  image?: string;
  location?: string;
  date?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load recent searches from cookies
  useEffect(() => {
    try {
      const savedSearches = Cookies.get('recentSearches');
      if (savedSearches) {
        const parsedSearches = JSON.parse(savedSearches);
        if (Array.isArray(parsedSearches)) {
          setRecentSearches(parsedSearches);
        } else {
          console.warn('Invalid recent searches format in cookies:', parsedSearches);
        }
      }
    } catch (error) {
      console.error('Error loading recent searches from cookies:', error);
    }
  }, []);

  // Save recent searches to cookies
  useEffect(() => {
    try {
      Cookies.set('recentSearches', JSON.stringify(recentSearches), {
        expires: 7, // 7 days
        sameSite: 'Strict', // Prevent CSRF
        secure: process.env.NODE_ENV === 'production', // Secure in production
        path: '/', // Cookie available site-wide
      });
      console.log('Saved recent searches to cookies:', recentSearches);
    } catch (error) {
      console.error('Error saving recent searches to cookies:', error);
    }
  }, [recentSearches]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Fetch trending movies
  const { data: trendingData, isLoading: isTrendingLoading } = useQuery({
    queryKey: ['trendingMovies'],
    queryFn: () => movieService.getTrendingMovies({ page: 1, limit: 3 }),
    enabled: isOpen,
    select: (data) =>
      data?.movies.map((movie: any) => ({
        id: movie._id,
        title: movie.name,
        type: 'trending' as const,
        subtitle: movie.genre?.join(', '),
        image: movie.posterUrl,
      })) || [],
  });

  // Fetch search suggestions using getMoviesWithFilters
  const { data: suggestions, isLoading: isSuggestionsLoading } = useQuery({
    queryKey: ['movieSuggestions', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const showResponse = await movieService.getMoviesWithFilters({
        search: searchQuery,
        page: 1,
        limit: 5,
        latitude: 11.1542272,
        longitude: 75.8874112,
        selectedLocation: 'Chelambra',
        date: '2025-06-27',
      });

      console.log('🚀 ~ queryFn: ~ showResponse:', showResponse);

      const mappedSuggestions: SearchSuggestion[] = [];

      // Map movies, theaters, and shows
      showResponse?.movies.forEach((movie: any) => {
        mappedSuggestions.push({
          id: movie._id,
          title: movie.name,
          type: 'movie',
          subtitle: movie.genre?.join(', '),
          image: movie.posterUrl,
          location: 'Multiple Theaters',
        });

        movie.theaters?.forEach((theater: any) => {
          mappedSuggestions.push({
            id: theater.id,
            title: theater.name,
            type: 'theater',
            subtitle: `Rating: ${theater.rating}`,
            location: theater.address?.city,
          });
          theater.shows?.forEach((show: any) => {
            mappedSuggestions.push({
              id: show._id,
              title: `${movie.name} at ${theater.name}`,
              type: 'event',
              subtitle: `Time: ${show.time}`,
              location: theater.address?.city,
              date: '2025-06-27',
            });
          });
        });
      });

      return mappedSuggestions;
    },
    enabled: !!searchQuery.trim() && isOpen,
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'movie':
        return <Film size={16} className="text-blue-500" />;
      case 'theater':
        return <MapPin size={16} className="text-green-500" />;
      case 'event':
        return <Calendar size={16} className="text-purple-500" />;
      case 'recent':
        return <Clock size={16} className="text-gray-400" />;
      case 'trending':
        return <TrendingUp size={16} className="text-red-500" />;
      default:
        return <Search size={16} className="text-gray-400" />;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.title);
    if (!recentSearches.find((item) => item.title === suggestion.title)) {
      const newRecent: SearchSuggestion = {
        id: `r_${Date.now()}`,
        title: suggestion.title,
        type: 'recent',
        subtitle: 'Just searched',
      };
      setRecentSearches((prev) => [newRecent, ...prev.slice(0, 4)]);
    }
    console.log('Searching for:', suggestion.title);

    if (suggestion.type === 'movie') {
      navigate(`/movie-details/${suggestion.id}`);
    }
    onClose();
  };

  const clearSearchQuery = () => {
    setSearchQuery('');
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    Cookies.remove('recentSearches', { path: '/' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
          initial={{ y: -50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -50, opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for Movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors"
              />
              <button
                onClick={clearSearchQuery}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {(isSuggestionsLoading || isTrendingLoading) ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                <p className="text-gray-500">Searching...</p>
              </div>
            ) : searchQuery.trim() ? (
              suggestions && suggestions.length > 0 ? (
                <div className="p-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 py-2">
                    Search Results
                  </h3>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                    >
                      {suggestion.image ? (
                        <img
                          src={suggestion.image}
                          alt={suggestion.title}
                          className="w-12 h-16 object-cover rounded-lg bg-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center">
                          {getTypeIcon(suggestion.type)}
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                        {suggestion?.subtitle && (
                          <p className="text-sm text-gray-500">{suggestion?.subtitle}</p>
                        )}
                        {suggestion?.location && (
                          <p className="text-xs text-gray-400 flex items-center mt-1">
                            <MapPin size={12} className="mr-1" />
                            {suggestion.location}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-gray-400 mt-2">Try searching for movies, theaters, or events</p>
                </div>
              )
            ) : (
              <div className="p-2">
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between px-4 py-2">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Recent Searches
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    {recentSearches.map((search) => (
                      <button
                        key={search.id}
                        onClick={() => handleSuggestionClick(search)}
                        className="w-full p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getTypeIcon(search.type)}
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-medium text-gray-900">{search.title}</h4>
                          {search?.subtitle && (
                            <p className="text-sm text-gray-500">{search.subtitle}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 py-2">
                    Trending Now
                  </h3>
                  {(trendingData || []).map((trending) => (
                    <button
                      key={trending.id}
                      onClick={() => handleSuggestionClick(trending)}
                      className="w-full p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg flex items-center justify-center">
                        {getTypeIcon(trending.type)}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-medium text-gray-900">{trending.title}</h4>
                        {trending.subtitle && (
                          <p className="text-sm text-gray-500">{trending.subtitle}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Film size={14} />
                <span>Movies</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin size={14} />
                <span>Theaters</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>Events</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users size={14} />
                <span>Experiences</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchModal;