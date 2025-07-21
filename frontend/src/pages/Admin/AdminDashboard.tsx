import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import Calendar from '../../components/ui/Calendar';

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

  const [filters, setFilters] = useState<AdminDashboardQueryParams>({
    period: selectedPeriod as 'daily' | 'monthly' | 'annually',
    startDate: queryParams.get('startDate') || '',
    endDate: queryParams.get('endDate') || '',
    location: queryParams.get('location') || '',
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.period) params.set('period', filters.period);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.location) params.set('location', filters.location);
    navigate(`?${params.toString()}`, { replace: true });
  }, [filters, navigate]);

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFilters({
      ...filters,
      [name]: date ? formatLocalDate(date) : '',
    });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleClearFilters = () => {
    setFilters({
      period: 'monthly',
      startDate: '',
      endDate: '',
      location: '',
    });
    setSelectedPeriod('monthly');
  };

  const { data, isLoading, error } = useQuery<AdminDashboardData, Error>({
    queryKey: ['adminDashboard', filters],
    queryFn: () => fetchAdminDashboardData(filters),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <motion.div
      className="min-h-screen bg-transparent"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <div className="flex flex-col">
        <motion.main
          className="flex-1 p-8 space-y-8"
          variants={contentVariants}
        >
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
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 relative"
            variants={contentVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Filters</h3>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
                aria-label="Clear all filters"
              >
                Clear Filters
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="text-sm font-medium text-gray-400">Start Date</label>
                <div className="mt-1 relative">
                  <Calendar
                    value={filters.startDate ? new Date(filters.startDate) : undefined}
                    onChange={(date) => handleDateChange('startDate', date)}
                    theme="dark"
                    maxDate={new Date()}
                    placeholder="Select start date"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="text-sm font-medium text-gray-400">End Date</label>
                <div className="mt-1 relative">
                  <Calendar
                    value={filters.endDate ? new Date(filters.endDate) : undefined}
                    onChange={(date) => handleDateChange('endDate', date)}
                    theme="dark"
                    maxDate={new Date()}
                    placeholder="Select end date"
                    className="w-full"
                  />
                </div>
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

          {isLoading && (
            <motion.div
              className="text-white text-center"
              variants={contentVariants}
            >
              <Loader />
            </motion.div>
          )}

          {error && (
            <motion.div
              className="text-red-400 text-center"
              variants={contentVariants}
            >
              Error: {error.message}
            </motion.div>
          )}

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