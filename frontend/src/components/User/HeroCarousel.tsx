import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import axios from 'axios';

// TMDB Credentials
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
const FALLBACK_IMAGE = 'https://via.placeholder.com/1280x720?text=No+Image+Available';

// Interface for TMDB movie data
interface Movie {
  id: number;
  title: string;
  tagline?: string;
  overview: string;
  backdrop_path: string | null;
  release_date: string;
}

// Interface for slide data
interface Slide {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
  img: string;
  year: string;
}

const ModernCarousel = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch movies from TMDB
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BASE_URL}/movie/popular`, {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
          params: {
            api_key: API_KEY,
            language: 'en-US',
            page: 1,
          },
        });

        const movies: Movie[] = response.data.results.slice(0, 4); // Get 4 movies
        const formattedSlides: Slide[] = movies.map((movie) => ({
          id: movie.id,
          title: movie.title.toUpperCase(),
          subtitle: movie.tagline || 'NOW PLAYING',
          desc: movie.overview.slice(0, 100) + '...' || `Releasing on ${movie.release_date}`,
          img: movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : FALLBACK_IMAGE,
          year: movie.release_date.split('-')[0] || 'Unknown',
        }));

        setSlides(formattedSlides);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching TMDB data:', err);
        setError('Failed to load movies. Please try again later.');
        setIsLoading(false);
        // Fallback data
        setSlides([
          {
            id: 1,
            title: 'FALLBACK MOVIE 1',
            subtitle: 'ENJOY THE SHOW',
            desc: 'A cinematic experience awaits you.',
            img: FALLBACK_IMAGE,
            year: '2024',
          },
          {
            id: 2,
            title: 'FALLBACK MOVIE 2',
            subtitle: 'ACTION PACKED',
            desc: 'An thrilling adventure unfolds.',
            img: FALLBACK_IMAGE,
            year: '2023',
          },
          {
            id: 3,
            title: 'FALLBACK MOVIE 3',
            subtitle: 'EPIC JOURNEY',
            desc: 'A visual masterpiece to behold.',
            img: FALLBACK_IMAGE,
            year: '2022',
          },
          {
            id: 4,
            title: 'FALLBACK MOVIE 4',
            subtitle: 'COMING SOON',
            desc: 'Stay tuned for more excitement.',
            img: FALLBACK_IMAGE,
            year: '2021',
          },
        ]);
      }
    };

    fetchMovies();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isLoading || error) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length, isLoading, error]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-96 md:h-[600px] flex items-center justify-center bg-gradient-to-r from-white via-yellow-50 to-orange-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative w-full h-96 md:h-[600px] flex items-center justify-center bg-gradient-to-r from-white via-yellow-50 to-orange-50 text-red-600">
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative w-full h-96 md:h-[710.5px] overflow-hidden bg-black group">
      {/* Main Image Container */}
      <div className="relative w-full h-full">
        {/* Background Image with Smooth Transition */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{ backgroundImage: `url(${currentSlideData.img})` }}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40" />

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 
                     w-12 h-12 md:w-14 md:h-14 
                     bg-black/30 hover:bg-black/60 backdrop-blur-sm
                     rounded-full flex items-center justify-center
                     text-white hover:text-yellow-400
                     transition-all duration-300 ease-out
                     hover:scale-110 active:scale-95
                     border border-white/20 hover:border-yellow-400/50
                     opacity-70 hover:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>

        <button
          onClick={nextSlide}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30
                     w-12 h-12 md:w-14 md:h-14 
                     bg-black/30 hover:bg-black/60 backdrop-blur-sm
                     rounded-full flex items-center justify-center
                     text-white hover:text-yellow-400
                     transition-all duration-300 ease-out
                     hover:scale-110 active:scale-95
                     border border-white/20 hover:border-yellow-400/50
                     opacity-70 hover:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight size={24} strokeWidth={2.5} />
        </button>

        {/* Content Section */}
        <div className="absolute inset-0 flex items-end z-20">
          <div className="w-full max-w-7xl mx-auto p-6 md:p-12">
            <div className="max-w-2xl">
              {/* Year Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 backdrop-blur-sm mb-4">
                <span className="text-yellow-400 font-semibold text-sm">{currentSlideData.year}</span>
              </div>

              {/* Title */}
             <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-2 md:mb-3 
               tracking-tight leading-tight overflow-hidden text-ellipsis 
               line-clamp-2 md:line-clamp-4 lg:line-clamp-3"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2, /* Adjust number here */
                    overflow: "hidden"
                  }}>
                {currentSlideData.title}
              </h1>


              {/* Subtitle */}
              <p className="text-yellow-400 font-semibold text-lg md:text-xl mb-4 tracking-wide">
                {currentSlideData.subtitle}
              </p>

              {/* Description */}
              <p className="text-gray-200 text-base md:text-lg leading-relaxed mb-6 md:mb-8 
                           max-w-xl line-clamp-3">
                {currentSlideData.desc}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="flex items-center justify-center gap-3 
                           bg-gradient-to-r from-yellow-400 to-orange-500 
                           hover:from-yellow-500 hover:to-orange-600
                           text-black font-bold px-8 py-3 md:py-4 rounded-xl
                           transition-all duration-300 ease-out
                           hover:scale-105 active:scale-95
                           shadow-lg hover:shadow-xl
                           text-base md:text-lg"
                >
                  <Play size={20} fill="currentColor" />
                  Watch Trailer
                </button>

                <button
                  className="flex items-center justify-center gap-3
                           bg-white/10 hover:bg-white/20 backdrop-blur-sm
                           text-white font-semibold px-8 py-3 md:py-4 rounded-xl
                           border border-white/20 hover:border-white/40
                           transition-all duration-300 ease-out
                           hover:scale-105 active:scale-95
                           text-base md:text-lg"
                >
                  <Info size={20} />
                  More Info
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Dot Indicators */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative transition-all duration-300 ease-out ${
                  index === currentSlide
                    ? 'w-8 h-2 bg-yellow-400 rounded-full'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80 rounded-full hover:scale-125'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {index === currentSlide && (
                  <div className="absolute inset-0 bg-yellow-400 rounded-full animate-pulse" />
                )}
              </button>
            ))}

            {/* Slide Counter */}
            {/* <div className="ml-2 pl-2 border-l border-white/20">
              <span className="text-white/80 text-sm font-medium">
                {String(currentSlide + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
              </span>
            </div> */}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300 ease-linear"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Thumbnail Preview (Hidden on mobile) */}
      <div className="hidden lg:block absolute right-8 top-145 -translate-y-1/2 z-20">
        <div className="flex flex-col gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`w-16 h-10 rounded-lg overflow-hidden transition-all duration-300 ${
                index === currentSlide
                  ? 'ring-2 ring-yellow-400 scale-110'
                  : 'opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            >
              <img
                src={slide.img}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModernCarousel;