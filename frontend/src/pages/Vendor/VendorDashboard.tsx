import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Ticket, Film, BarChart2, Plus, DollarSign, TrendingUp, MapPin, Calendar as CalendarIcon, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Card from '../../components/ui/Card';
import TheaterManagement from '../../pages/Vendor/Theaters';
import StatCard from '../../components/dashboard/StatCard';
import RevenueChart from '../../components/dashboard/RevenueChart';
import OccupancyChart from '../../components/dashboard/OccupancyChart';
import TopSellingShows from '../../components/dashboard/TopSellingShows';
import TopTheaters from '../../components/dashboard/TopTheaters';
import Button from '../../components/ui/Button';
import Insights from '../../components/Vendor/Insights';
import { fetchDashboardData } from '../../services/Vendor/dashboardApi';
import { VendorDashboardData, DashboardQueryParams } from '../../types/vendorDashboard';
import Loader from '../../components/Shared/Loading';
import Calendar from '../../components/ui/Calendar';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const VendorDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [filters, setFilters] = useState<DashboardQueryParams>({
    startDate: queryParams.get('startDate') || '',
    endDate: queryParams.get('endDate') || '',
    status: queryParams.get('status') || '',
    location: queryParams.get('location') || '',
  });

  // Sync filters with URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.status) params.set('status', filters.status);
    if (filters.location) params.set('location', filters.location);
    navigate(`?${params.toString()}`, { replace: true });
  }, [filters, navigate]);

  // Format date as YYYY-MM-DD in local timezone
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

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, location: e.target.value });
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      location: '',
    });
  };

  // Fetch dashboard data
  const { data, isLoading, error } = useQuery<VendorDashboardData, Error>({
    queryKey: ['vendorDashboard', filters],
    queryFn: () => fetchDashboardData(filters),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <motion.div
      className="min-h-screen bg-transparent p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Modern Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <BarChart2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Vendor Dashboard
                  </h1>
                  <p className="text-gray-400 font-medium">Monitor your business performance and insights</p>
                </div>
              </div>
              
              {/* Live Status Indicator */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 text-sm font-medium">Live Data</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
                  <TrendingUp className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">Real-time Analytics</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/vendor/create-show')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create New Show
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="mb-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 shadow-xl overflow-visible"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Advanced Filters</h3>
              <p className="text-gray-400 text-sm">Customize your data view</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearFilters}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
            aria-label="Clear all filters"
          >
            <X className="w-4 h-4" />
            Clear All
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <CalendarIcon className="w-4 h-4 text-blue-400" />
              Start Date
            </label>
            <div className="relative">
              <Calendar
                value={filters.startDate ? new Date(filters.startDate) : undefined}
                onChange={(date) => handleDateChange('startDate', date)}
                theme="dark"
                maxDate={new Date()}
                placeholder="Select start date"
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-2 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <CalendarIcon className="w-4 h-4 text-purple-400" />
              End Date
            </label>
            <div className="relative">
              <Calendar
                value={filters.endDate ? new Date(filters.endDate) : undefined}
                onChange={(date) => handleDateChange('endDate', date)}
                theme="dark"
                maxDate={new Date()}
                placeholder="Select end date"
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-2 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Location
            </label>
            <div className="relative">
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleLocationChange}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                placeholder="Enter city or region"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {(filters.startDate || filters.endDate || filters.location) && (
          <div className="mt-6 pt-4 border-t border-gray-700/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-300">Active Filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.startDate && (
                <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                  From: {filters.startDate}
                </span>
              )}
              {filters.endDate && (
                <span className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                  To: {filters.endDate}
                </span>
              )}
              {filters.location && (
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">
                  <MapPin className="w-3 h-3" />
                  {filters.location}
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {/* Loading State */}
              {isLoading && <Loader />}

              {/* Error State */}
              {error && (
                <motion.div variants={itemVariants} className="text-red-400 text-center">
                  Error: {error.message}
                </motion.div>
              )}

              {/* Data Display */}
              {data && (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <motion.div variants={itemVariants}>
                      <StatCard
                        title="Total Revenue"
                        value={`₹${data.statistics.totalRevenue.toLocaleString()}`}
                        icon={<DollarSign size={24} className="text-[#0066F5]" />}
                        change={{ value: 12.5, isPositive: true }}
                        bgColor="from-[#0066F5]/10 to-[#0066F5]/5"
                      />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <StatCard
                        title="Tickets Sold"
                        value={data.statistics.ticketsSold.toLocaleString()}
                        icon={<Ticket size={24} className="text-[#f5005f]" />}
                        change={{ value: 8.3, isPositive: true }}
                        bgColor="from-[#f5005f]/10 to-[#f5005f]/5"
                      />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <StatCard
                        title="Active Shows"
                        value={data.statistics.activeShows}
                        icon={<Film size={24} className="text-[#00d68f]" />}
                        change={{ value: 2, isPositive: true }}
                        bgColor="from-[#00d68f]/10 to-[#00d68f]/5"
                      />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <StatCard
                        title="Average Occupancy"
                        value={`${Math.round(data.statistics.averageOccupancy)}%`}
                        icon={<BarChart2 size={24} className="text-[#ffaa00]" />}
                        change={{ value: 5.2, isPositive: true }}
                        bgColor="from-[#ffaa00]/10 to-[#ffaa00]/5"
                      />
                    </motion.div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <motion.div className="lg:col-span-2" variants={itemVariants}>
                      <RevenueChart data={data.monthlyRevenue} />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <TopSellingShows shows={data.topSellingShows} />
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div className="lg:col-span-2" variants={itemVariants}>
                      <TopTheaters theaters={data.topTheaters} />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <OccupancyChart data={data.occupancyRate} />
                    </motion.div>
                  </div>
                </>
              )}
            </motion.div>
          }
        />
        <Route path="/theaters/create" element={<TheaterManagement />} />
        <Route path="/analytics" element={<Insights />} />
      </Routes>
    </motion.div>
  );
};

export default VendorDashboard;