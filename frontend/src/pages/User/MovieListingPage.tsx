import React, { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Star,
  Ticket,
  Clock,
  Calendar,
  Filter,
  Search,
  Grid,
  List,
  X,
  SlidersHorizontal,
  MapPin,
  Heart,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  User2,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

import { getMoviesWithFilters } from "../../services/User/movieApi";
import Footer from "../../components/User/Footer";

interface FilterState {
  search: string;
  status: string[];
  genre: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

const GENRES = [
  "Action",
  "Thriller",
  "Romance",
  "Comedy",
  "Crime",
  "Drama",
  "Adventure",
  "Fantasy",
  "Horror",
];

const STATUS_OPTIONS = ["released", "upcoming"];

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity (Rating)" },
  { value: "releaseDate", label: "Release Date" },
  { value: "name", label: "Title" },
];

// Shimmer Loading Components
const MovieGridSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 animate-pulse">
    <div className="h-80 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-1/2"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
        <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl w-20"></div>
      </div>
    </div>
  </div>
);

const MovieListSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 animate-pulse">
    <div className="flex gap-6 p-6">
      <div className="w-32 h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-1/2"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full"></div>
        </div>
        <div className="flex items-center gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"
            ></div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48"></div>
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
            <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl w-32"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MovieListingPage: React.FC = () => {
  const currentLocation = useSelector(
    (state: RootState) => state.location.selectedLocation
  );
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get view mode from localStorage or default to grid
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    return (localStorage.getItem("movieViewMode") as "grid" | "list") || "grid";
  });

  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlStatus = searchParams.get("status")
      ? searchParams.get("status")!.split(",")
      : [];
    const urlGenre = searchParams.get("genre")
      ? searchParams.get("genre")!.split(",")
      : [];
    const urlSortBy = searchParams.get("sortBy") || "popularity";
    const urlSortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const urlPage = parseInt(searchParams.get("page") || "1");

    return {
      search: urlSearch,
      status: urlStatus,
      genre: urlGenre,
      sortBy: urlSortBy,
      sortOrder: urlSortOrder,
      page: urlPage,
      limit: 12,
    };
  });

  // Debounced search
  const [searchInput, setSearchInput] = useState(filters.search);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Update localStorage when view mode changes
  useEffect(() => {
    localStorage.setItem("movieViewMode", viewMode);
  }, [viewMode]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.status.length > 0)
      params.set("status", filters.status.join(","));
    if (filters.genre.length > 0) params.set("genre", filters.genre.join(","));
    params.set("sortBy", filters.sortBy); // Always include sortBy
    params.set("sortOrder", filters.sortOrder); // Always include sortOrder
    if (filters.page !== 1) params.set("page", filters.page.toString());

    setSearchParams(params);
  }, [filters, setSearchParams]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  // Fetch movies query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["movies", filters],
    queryFn: () => getMoviesWithFilters(filters),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = e.target.value;
    setFilters((prev) => ({ ...prev, sortBy: newSortBy, page: 1 }));
  };

  const toggleSortOrder = () => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
      page: 1,
    }));
  };

  const clearSort = () => {
    setFilters((prev) => ({
      ...prev,
      sortBy: "popularity",
      sortOrder: "desc",
      page: 1,
    }));
  };

  const handleGenreToggle = (genre: string) => {
    setFilters((prev) => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter((g) => g !== genre)
        : [...prev.genre, genre],
      page: 1,
    }));
  };

  const handleStatusToggle = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: [],
      genre: [],
      sortBy: "popularity",
      sortOrder: "desc",
      page: 1,
      limit: 12,
    });
    setSearchInput("");
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDuration = (duration: { hours: number; minutes: number }) => {
    return `${duration.hours}h ${duration.minutes}m`;
  };

  const isNewRelease = (releaseDate: string) => {
    const date = new Date(releaseDate);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 30;
  };

  const movies = data?.movies || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;
  const currentPage = data?.currentPage || 1;

  return (
    <div className="relative">
      {/* Custom CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full blur-3xl transform translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-3xl transform translate-y-1/2"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 mb-35">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-500 font-semibold text-sm uppercase tracking-wider">
                      {currentLocation || "Your Location"}
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                    All Movies
                  </h1>
                </div>
              </div>
            </div>

            {/* Search and View Controls */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 lg:w-80 group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-yellow-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search movies, genres..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 hover:border-yellow-300"
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setFilters((prev) => ({ ...prev, search: "", page: 1 }));
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-white text-yellow-600 shadow-sm transform scale-105"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-white text-yellow-600 shadow-sm transform scale-105"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  showFilters ||
                  filters.genre.length > 0 ||
                  filters.status.length > 0
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-400/25"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-yellow-300"
                }`}
              >
                <SlidersHorizontal
                  className={`w-5 h-5 transition-transform duration-300 ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
                <span>Filters</span>
                {(filters.genre.length > 0 || filters.status.length > 0) && (
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full animate-pulse">
                    {filters.genre.length + filters.status.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Advanced Filters */}
          <div
            className={`space-y-6 transition-all duration-500 ease-in-out overflow-hidden ${
              showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-white rounded-2xl pt-8 pb-4 px-5 shadow-lg border border-gray-100">
              {/* Genre Filter - Enhanced Design */}
              <div className="relative mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span>Genres:</span>
                    {filters.genre.length > 0 && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium animate-bounce">
                        {filters.genre.length} selected
                      </span>
                    )}
                  </h3>
                  {filters.genre.length > 0 && (
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, genre: [], page: 1 }))
                      }
                      className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div
                    className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 pt-2 pl-1"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    <style jsx>{`
                      .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>
                    {GENRES.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => handleGenreToggle(genre)}
                        className={`flex-shrink-0 px-5 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                          filters.genre.includes(genre)
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-400/25"
                            : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 hover:shadow-md"
                        }`}
                      >
                        {filters.genre.includes(genre) && (
                          <Check className="w-4 h-4 inline mr-2" />
                        )}
                        {genre}
                      </button>
                    ))}
                  </div>
                  {/* Enhanced gradient overlay */}
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Status and Sort Row - Enhanced */}
              <div className="flex flex-wrap items-center gap-6">
                {/* Status Filter - Enhanced */}
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-800">
                    Status:
                  </span>
                  <div className="flex gap-3">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusToggle(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                          filters.status.includes(status)
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                        }`}
                      >
                        {filters.status.includes(status) && (
                          <Check className="w-3 h-3 inline mr-1" />
                        )}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enhanced Sort Section */}
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-800">Sort:</span>
                  <div className="flex items-center gap-2">
                    {/* Sort By Select */}
                    <select
                      value={filters.sortBy}
                      onChange={handleSortChange}
                      className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* Sort Order Button */}
                    <button
                      onClick={toggleSortOrder}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 shadow-sm ${
                        filters.sortOrder === "asc"
                          ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                          : "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                      }`}
                      title={`Sort ${
                        filters.sortOrder === "asc" ? "Ascending" : "Descending"
                      }`}
                    >
                      {filters.sortOrder === "asc" ? (
                        <SortAsc className="w-5 h-5" />
                      ) : (
                        <SortDesc className="w-5 h-5" />
                      )}
                    </button>

                    {/* Sort Order Label */}
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-lg ${
                        filters.sortOrder === "asc"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
                    </span>
                  </div>
                </div>

                {/* Clear Filters - Enhanced */}
                {(filters.genre.length > 0 ||
                  filters.status.length > 0 ||
                  filters.search ||
                  filters.sortBy !== "popularity" ||
                  filters.sortOrder !== "desc") && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-lg transition-all duration-300 text-sm font-medium transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Filters Display - Enhanced */}
          {(filters.genre.length > 0 ||
            filters.status.length > 0 ||
            filters.search ||
            filters.sortBy !== "popularity" ||
            filters.sortOrder !== "desc") && (
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-700">
                Active filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 animate-in fade-in duration-300">
                    <Search className="w-3 h-3" />"{filters.search}"
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setFilters((prev) => ({
                          ...prev,
                          search: "",
                          page: 1,
                        }));
                      }}
                    >
                      <X className="w-3 h-3 hover:text-yellow-600" />
                    </button>
                  </span>
                )}
                {filters.genre.map((genre) => (
                  <span
                    key={genre}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 animate-in slide-in-from-left duration-300"
                  >
                    {genre}
                    <button
                      onClick={() => handleGenreToggle(genre)}
                      className="hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.status.map((status) => (
                  <span
                    key={status}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 animate-in slide-in-from-left duration-300"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <button
                      onClick={() => handleStatusToggle(status)}
                      className="hover:text-green-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(filters.sortBy !== "popularity" ||
                  filters.sortOrder !== "desc") && (
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 animate-in slide-in-from-left duration-300">
                    Sort:{" "}
                    {
                      SORT_OPTIONS.find((opt) => opt.value === filters.sortBy)
                        ?.label
                    }{" "}
                    ({filters.sortOrder === "asc" ? "Asc" : "Desc"})
                    <button
                      onClick={clearSort}
                      className="hover:text-purple-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">{movies.length}</span>{" "}
            of <span className="font-semibold text-gray-900">{totalCount}</span>{" "}
            movies
            {(filters.sortBy !== "popularity" ||
              filters.sortOrder !== "desc") && (
              <span className="ml-2 text-sm text-gray-500">
                (sorted by{" "}
                {SORT_OPTIONS.find(
                  (opt) => opt.value === filters.sortBy
                )?.label.toLowerCase()}{" "}
                - {filters.sortOrder === "asc" ? "ascending" : "descending"})
              </span>
            )}
          </p>
        </div>

        {/* Enhanced Loading State with Shimmer */}
        {isLoading && (
          <div className="space-y-6">
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {Array.from({ length: 8 }).map((_, index) =>
                viewMode === "grid" ? (
                  <MovieGridSkeleton key={index} />
                ) : (
                  <MovieListSkeleton key={index} />
                )
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">Failed to load movies</p>
              <button
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["movies"] })
                }
                className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !isError && movies.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No movies found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearFilters}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Movies Grid/List */}
        {!isLoading && !isError && movies.length > 0 && (
          <>
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {movies.map((movie) =>
                viewMode === "grid" ? (
                  <MovieGridCard key={movie._id} movie={movie} />
                ) : (
                  <MovieListCard key={movie._id} movie={movie} />
                )
              )}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-400/25"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

// Movie Grid Card Component
const MovieGridCard: React.FC<{
  movie: any;
}> = ({ movie }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const formatDuration = (duration: { hours: number; minutes: number }) => {
    return `${duration.hours}h ${duration.minutes}m`;
  };

  const isNewRelease = (releaseDate: string) => {
    const date = new Date(releaseDate);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 30;
  };

  const bookTicketNavigate = (id: any) => {
    return navigate(`/movie-details/${id}`);
  };

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-gray-100 hover:border-yellow-200">
        {/* Movie Poster */}
        <div className="relative h-100 overflow-hidden">
          <img
            src={movie.poster}
            alt={movie.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

          {/* Overlay Icons */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="flex gap-2">
              {isNewRelease(movie.releaseDate) && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  NEW
                </div>
              )}
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  movie.status === "released"
                    ? "bg-green-500 text-white"
                    : movie.status === "upcoming"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {movie.status.charAt(0).toUpperCase() + movie.status.slice(1)}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-bold text-sm">{movie.rating}</span>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-center gap-4 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(movie.releaseDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{movie.likes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="px-5 py-3 pb-5 space-y-2">
          <div>
            <h3 className="font-bold text-gray-900 text-xl mb-1 line-clamp-1 group-hover:text-yellow-600 transition-colors">
              {movie.name}
            </h3>
            <p className="text-gray-600 text-sm font-medium">
              {movie.genre.join(" • ")}
            </p>
            <p className="text-gray-500 text-xs mt-1 line-clamp-2">
              {movie.description}
            </p>
          </div>

          {/* Enhanced Book Tickets Button - Smaller Size */}
          <div className="w-full">
            <button
              className="group/btn w-full relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/30 border-2 border-transparent hover:border-white/20 border-l-0"
              onClick={() => bookTicketNavigate(movie._id)} // Attach onClick to the button
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>

              {/* Button Content */}
              <div className="relative flex items-center justify-center gap-2">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 transform group-hover/btn:rotate-12 transition-transform duration-300" />
                  <span className="text-sm font-extrabold tracking-wide">
                    Book Tickets
                  </span>
                </div>

                {/* Pulse Animation */}
                <div className="absolute inset-0 rounded-xl border-2 border-white/30 animate-ping opacity-0 group-hover/btn:opacity-75"></div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/50 to-red-500/50 blur-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 -z-10 border-l-0"></div>
            </button>
          </div>
        </div>

        <div className="absolute inset-0 rounded-3xl border-2 border-yellow-400/0 group-hover:border-yellow-400/50 transition-colors duration-300 pointer-events-none"></div>
      </div>
    </div>
  );
};

// Movie List Card Component
const MovieListCard: React.FC<{
  movie: any;
}> = ({ movie }) => {
  const formatDuration = (duration: { hours: number; minutes: number }) => {
    return `${duration.hours}h ${duration.minutes}m`;
  };

  const isNewRelease = (releaseDate: string) => {
    const date = new Date(releaseDate);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 30;
  };
  const navigate = useNavigate();

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-200 hover:border-yellow-200 transition-all duration-300">
      <div className="flex gap-6 p-6">
        {/* Movie Poster */}
        <div className="relative flex-shrink-0 w-32 h-48 rounded-xl overflow-hidden">
          <img
            src={movie.poster}
            alt={movie.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

          {/* Rating Badge */}
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-lg flex items-center gap-1 text-xs">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span className="font-bold">{movie.rating}</span>
          </div>

          {/* Status Badge */}
          <div
            className={`absolute bottom-2 left-2 px-2 py-1 rounded-md text-xs font-bold ${
              movie.status === "Now Showing"
                ? "bg-green-500 text-white"
                : movie.status === "Coming Soon"
                ? "bg-blue-500 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {movie.status}
          </div>
        </div>

        {/* Movie Details */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                  {movie.name}
                </h3>
                {isNewRelease(movie.releaseDate) && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    NEW
                  </span>
                )}
              </div>

              <p className="text-gray-600 font-medium mb-2">
                {movie.genre.join(" • ")}
              </p>
              <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                {movie.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(movie.duration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(movie.releaseDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{movie.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User2 className="w-4 h-4" />
                  <span>
                    {movie.crew
                      .filter((member) => member.role === "Director")
                      .map((director) => director.name)
                      .join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/movie-details/${movie._id}`)}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/25"
              >
                <Ticket className="w-5 h-5" />
                <span>Book Tickets</span>
              </button>
            </div>
          </div>

          {/* Cast Info */}
          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Cast:&nbsp;
                {movie.cast.slice(0, 2).map((actor, index) => (
                  <span key={actor._id}>
                    {index > 0 && ", "}
                    {actor.name}
                  </span>
                ))}
                {movie.cast.length > 2 && ` +${movie.cast.length - 2} more`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieListingPage;
