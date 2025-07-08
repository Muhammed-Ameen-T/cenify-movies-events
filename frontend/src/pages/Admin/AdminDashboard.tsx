// src/pages/Admin/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardStats from '../../components/Admin/DashboardStats';
import SalesChart from '../../components/Admin/SalesChart';
import TopTheatersTable from '../../components/Admin/TopTheatersTable';
import TopShowsSection from '../../components/Admin/TopShowsSection';
import TheaterStatusChart from '../../components/Admin/TheaterStatusChart';
import { fetchAdminDashboardData } from '../../services/Admin/dashboardApi';
import { AdminDashboardData, AdminDashboardQueryParams } from '../../types/adminDashboard';
import Loader from '../../components/Shared/Loading';

const pageVariants = {
  initial: { opacity: 0 },
  in: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
  out: { opacity: 0 },
};

const contentVariants = {
  initial: { opacity: 0, y: 20 },
  in: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    queryParams.get('period') || 'monthly'
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'annually', label: 'Annually' },
  ];

  const [filters, setFilters] = useState<AdminDashboardQueryParams>({
    period: selectedPeriod as 'daily' | 'monthly' | 'annually',
    startDate: queryParams.get('startDate') || '',
    endDate: queryParams.get('endDate') || '',
    location: queryParams.get('location') || '',
  });

  // Sync filters with URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.period) params.set('period', filters.period);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.location) params.set('location', filters.location);
    navigate(`?${params.toString()}`, { replace: true });
  }, [filters, navigate]);

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    setFilters({ ...filters, period: value as 'daily' | 'monthly' | 'annually' });
    setIsDropdownOpen(false);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const { data, isLoading, error } = useQuery<AdminDashboardData, Error>({
    queryKey: ['adminDashboard', filters],
    queryFn: () => fetchAdminDashboardData(filters),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <motion.div
      className="min-h-screen bg-transparent"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <div className="flex flex-col overflow-hidden">
        <motion.main
          className="flex-1 overflow-y-auto p-8 space-y-8"
          variants={contentVariants}
        >
          {/* Header Section */}
          <motion.div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
            variants={contentVariants}
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-gray-400 mt-2">Monitor your theater network performance</p>
            </div>
            <div className="relative">
              {/* <motion.button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl text-white transition-all duration-200 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="capitalize">{selectedPeriod}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </motion.button>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-xl shadow-xl z-50"
                >
                  {periods.map((period) => (
                    <button
                      key={period.value}
                      onClick={() => handlePeriodChange(period.value)}
                      className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      {period.label}
                    </button>
                  ))}
                </motion.div>
              )} */}
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
            variants={contentVariants}
          >
            <h3 className="text-lg font-bold text-white mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-700/30 border border-gray-600 text-white text-sm focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-700/30 border border-gray-600 text-white text-sm focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Location</label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-700/30 border border-gray-600 text-white text-sm focus:ring-1 focus:ring-blue-400"
                  placeholder="Enter city"
                />
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              className="text-white text-center"
              variants={contentVariants}
            >
              <Loader/>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              className="text-red-400 text-center"
              variants={contentVariants}
            >
              Error: {error.message}
            </motion.div>
          )}

          {/* Data Display */}
          {data && (
            <>
              <motion.div variants={contentVariants}>
                <DashboardStats statistics={data.statistics} period={selectedPeriod} />
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div className="lg:col-span-2" variants={contentVariants}>
                  <SalesChart sales={data.sales} period={selectedPeriod} />
                </motion.div>
                <motion.div variants={contentVariants}>
                  <TheaterStatusChart theaterStatus={data.theaterStatus} />
                </motion.div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <motion.div variants={contentVariants}>
                  <TopTheatersTable theaters={data.topTheaters} />
                </motion.div>
                <motion.div variants={contentVariants}>
                  <TopShowsSection shows={data.topShows} />
                </motion.div>
              </div>
            </>
          )}
        </motion.main>
      </div>
    </motion.div>
  );
};

export default Dashboard;