import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Star,
  Users,
  ExternalLink,
  Share2,
  Trophy,
  Globe,
  Instagram,
  Twitter,
  Facebook,
} from 'lucide-react';
import Footer from '../../components/User/Footer';

// TMDB API configuration
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Dummy black-themed banner for missing background
const DUMMY_BANNER = 'https://via.placeholder.com/1280x720/1a1a1a/ffffff?text=No+Image+Available';
const DEFAULT_PROFILE_IMAGE = import.meta.env.VITE_DEFAULT_PROFILE_IMAGE;

// Fetch person details from TMDB
const fetchPersonDetails = async (personId: string) => {
  const response = await fetch(
    `${TMDB_BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}&append_to_response=movie_credits,tv_credits,external_ids,images`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch person details');
  }
  return response.json();
};

const ActorProfilePage: React.FC = () => {
  const { id: personId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');
  const [showAllMovies, setShowAllMovies] = useState(false);
  const [showFullBiography, setShowFullBiography] = useState(false);

  // Fetch person details
  const { data: person, isLoading, isError, error } = useQuery({
    queryKey: ['personDetails', personId],
    queryFn: () => fetchPersonDetails(personId!),
    enabled: !!personId,
  });



  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: person?.name,
        text: `Check out ${person?.name}'s profile`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  const calculateAge = (birthday: string) => {
    if (!birthday) return null;
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getTopMovies = () => {
    if (!person?.movie_credits?.cast) return [];
    return person.movie_credits.cast
      .filter((movie: any) => movie.vote_average > 0)
      .sort((a: any, b: any) => b.vote_average - a.vote_average)
      .slice(0, showAllMovies ? undefined : 8);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-2xl font-semibold text-gray-700">Loading Profile...</div>
        </div>
      </div>
    );
  }

  if (isError || !person) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <div className="text-center space-y-4">
          <div className="text-6xl">😔</div>
          <div className="text-2xl font-semibold text-red-600">
            {error ? `Error: ${error.message}` : 'Failed to load profile'}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const profileImage = person.profile_path
    ? `${TMDB_IMAGE_BASE_URL}/w500${person.profile_path}`
    : DEFAULT_PROFILE_IMAGE;

  const backgroundImage = person.images?.profiles?.[0]?.file_path
    ? `${TMDB_IMAGE_BASE_URL}/w1280${person.images.profiles[0].file_path}`
    : DUMMY_BANNER;

  const hasSocialLinks =
    person.external_ids &&
    (person.external_ids.instagram_id ||
      person.external_ids.twitter_id ||
      person.external_ids.facebook_id ||
      person.homepage);

  const isBiographyLong = person.biography && person.biography.length > 200;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
{/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Static Background Image */}
        <div className="absolute inset-0 h-[50vh] xs:h-[55vh] sm:h-[60vh] md:h-[65vh]">
          <img
            src={backgroundImage}
            alt={person.name || 'Profile'}
            className="w-full h-full object-cover filter brightness-30 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 py-4 xs:py-6 sm:py-8 md:py-16">
          {/* Mobile Layout (< sm) */}
          <div className="block sm:hidden">
            <div className="flex items-end gap-3 mb-4">
              {/* Mobile Profile Image */}
              <div className="flex-shrink-0">
                <img
                  src={profileImage}
                  alt={person.name || 'Profile'}
                  className="w-40 xs:w-24 h-54 xs:h-28 object-cover rounded-2xl shadow-xl border-2 border-white/20"
                />
              </div>
              
              {/* Mobile Profile Info */}
              <div className="flex-1 text-white space-y-2">
                {/* Mobile Badges */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full font-bold text-xs">
                    {person.known_for_department || 'Actor'}
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="font-bold text-xs">{person.popularity?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
                
                {/* Mobile Name */}
                <h1 className="text-5xl xs:text-2xl font-black leading-tight line-clamp-2">
                  {person.name || 'Unknown'}
                </h1>
              </div>
            </div>

            {/* Mobile Details */}
            <div className="space-y-2 text-white mb-4">
              {/* Mobile Birth Info */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {person.birthday && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {formatDate(person.birthday)}
                      {calculateAge(person.birthday) && ` (${calculateAge(person.birthday)})`}
                    </span>
                  </div>
                )}
                {person.place_of_birth && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{person.place_of_birth}</span>
                  </div>
                )}
              </div>
              
              {/* Mobile Also Known As */}
              {person.also_known_as && person.also_known_as.length > 0 && (
                <p className="text-gray-300 text-xs line-clamp-1">
                  Also: {person.also_known_as.slice(0, 2).join(', ')}
                </p>
              )}
            </div>

            {/* Mobile Action Button */}
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 font-bold px-4 py-2.5 rounded-lg transition-all duration-300 text-sm flex-1"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Desktop/Tablet Layout (sm+) */}
          <div className="hidden sm:flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12 items-end">
            {/* Profile Image */}
            <div className="flex-shrink-0 relative group">
              <img
                src={profileImage}
                alt={person.name || 'Profile'}
                className="w-56 h-72 sm:w-64 sm:h-80 md:w-72 md:h-88 lg:w-80 lg:h-96 object-cover rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-white/20 group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-white space-y-3 sm:space-y-4 md:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full font-bold">
                    {person.known_for_department || 'Actor'}
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-bold">{person.popularity?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2 sm:mb-3 md:mb-4 leading-tight">{person.name || 'Unknown'}</h1>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-sm sm:text-base md:text-lg">
                  {person.birthday ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>
                        {formatDate(person.birthday)}
                        {calculateAge(person.birthday) && ` (${calculateAge(person.birthday)} years old)`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Birthdate Unknown</span>
                    </div>
                  )}
                  {person.place_of_birth ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{person.place_of_birth}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Birthplace Unknown</span>
                    </div>
                  )}
                </div>
                {person.also_known_as && person.also_known_as.length > 0 ? (
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg">
                    Also known as: {person.also_known_as.slice(0, 3).join(', ') || 'N/A'}
                  </p>
                ) : (
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg">No alternate names available</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 sm:gap-4 pt-2 sm:pt-3 md:pt-4">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 sm:gap-3 bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 font-bold px-4 py-2 sm:px-5 sm:py-3 md:px-6 md:py-4 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-8 py-1 pb-25">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div className="max-w-7xl mx-auto px-0 py-0">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-3 text-gray-600 hover:text-yellow-600 transition-colors group mt-5"
              >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold">Back to Movie</span>
              </button>
            </div>
            {/* Navigation Tabs */}
            <div className="flex gap-2 bg-gray-100 p-2 rounded-2xl overflow-x-auto">
              {['about', 'filmography', 'photos', 'awards'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-shrink-0 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
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
              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Biography</h3>
                  <div className="bg-white p-8 rounded-3xl shadow-lg">
                    <div className="text-gray-700 text-lg leading-relaxed">
                      {showFullBiography || !isBiographyLong ? (
                        <>
                          {person.biography || 'No biography available for this person.'}
                          {isBiographyLong && (
                            <button
                              onClick={() => setShowFullBiography(false)}
                              className="block mt-4 font-bold text-yellow-600 hover:text-yellow-700 transition-colors"
                            >
                              Show Less
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="line-clamp-6">
                            {person.biography}
                            <span className="text-gray-700">...</span>
                          </span>
                          <button
                            onClick={() => setShowFullBiography(true)}
                            className="block mt-2 font-bold text-yellow-600 hover:text-yellow-700 transition-colors"
                          >
                            Show More
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Details */}
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-yellow-500" />
                        Known For
                      </h4>
                      <p className="text-gray-700">{person.known_for_department || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-yellow-500" />
                        Born
                      </h4>
                      <p className="text-gray-700">{person.birthday ? formatDate(person.birthday) : 'N/A'}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-yellow-500" />
                        Place of Birth
                      </h4>
                      <p className="text-gray-700">{person.place_of_birth || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Popularity Score
                      </h4>
                      <p className="text-gray-700">{person.popularity?.toFixed(1) || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filmography Section */}
            {activeTab === 'filmography' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-bold text-gray-900">Filmography</h3>
                  <button
                    onClick={() => setShowAllMovies(!showAllMovies)}
                    className="text-yellow-600 hover:text-yellow-700 font-semibold"
                  >
                    {showAllMovies ? 'Show Less' : 'Show All'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getTopMovies().length > 0 ? (
                    getTopMovies().map((movie: any) => (
                      <div
                        key={movie.id}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                        onClick={() => navigate(`/movie-details/${movie.id}`)}
                      >
                        <div className="flex">
                          <img
                            src={
                              movie.poster_path
                                ? `${TMDB_IMAGE_BASE_URL}/w200${movie.poster_path}`
                                : 'https://via.placeholder.com/200x300'
                            }
                            alt={movie.title || 'Movie Poster'}
                            className="w-24 h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="flex-1 p-4">
                            <h4 className="font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                              {movie.title || 'Untitled'}
                            </h4>
                            <p className="text-gray-600 text-sm mb-2">
                              {movie.character ? `as ${movie.character}` : 'Role unknown'}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 text-sm">
                                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                              </span>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-semibold">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-700">No filmography available.</p>
                  )}
                </div>
              </div>
            )}

            {/* Photos Section */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-gray-900">Photos</h3>
                {person.images?.profiles?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {person.images.profiles.slice(0, 12).map((image: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                      >
                        <img
                          src={`${TMDB_IMAGE_BASE_URL}/w500${image.file_path}`}
                          alt={`${person.name || 'Profile'} photo ${index + 1}`}
                          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📷</div>
                    <p className="text-gray-600">No photos available</p>
                  </div>
                )}
              </div>
            )}


            {/* Awards Section */}
            {activeTab === 'awards' && (
              <div className="space-y-16">
                <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  Awards & Recognition
                </h3>
                <div className="text-center py-12">
                  <div className="text-6xl text-gray-600 mb-4">🏆</div>
                  <p className="text-gray-700">No awards information available.</p>
                  <p className="text-gray-500 text-sm mt-2">Check external sources for detailed awards information.</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Social Links */}
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Connect</h3>
              {hasSocialLinks ? (
                <div className="space-y-3">
                  {person.external_ids.instagram_id && (
                    <a
                      href={`https://instagram.com/${person.external_ids.instagram_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-colors group"
                    >
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <span className="font-medium text-gray-700 group-hover:text-pink-600">Instagram</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </a>
                  )}
                  {person.external_ids.twitter_id && (
                    <a
                      href={`https://twitter.com/${person.external_ids.twitter_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                    >
                      <Twitter className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-700 group-hover:text-blue-600">Twitter</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </a>
                  )}
                  {person.external_ids.facebook_id && (
                    <a
                      href={`https://facebook.com/${person.external_ids.facebook_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                    >
                      <Facebook className="w-5 h-5 text-blue-700" />
                      <span className="font-medium text-gray-700 group-hover:text-blue-700">Facebook</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </a>
                  )}
                  {person.homepage && (
                    <a
                      href={person.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <Globe className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-700 group-hover:text-gray-900">Official Website</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-700 font-medium">Connect Coming Soon</p>
                  <p className="text-gray-500 text-sm mt-2">Social links will be available soon!</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Career Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Movies</span>
                  <span className="font-bold text-gray-900">{person.movie_credits?.cast?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">TV Shows</span>
                  <span className="font-bold text-gray-900">{person.tv_credits?.cast?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Popularity</span>
                  <span className="font-bold text-gray-900">{person.popularity?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ActorProfilePage;