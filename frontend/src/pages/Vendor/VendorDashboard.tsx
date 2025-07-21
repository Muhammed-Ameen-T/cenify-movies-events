import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Ticket, Film, BarChart2, Plus, DollarSign } from 'lucide-react';
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
      className="bg-[#1E1E2D] min-h-screen p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Filters */}
      <Card className="mb-6 p-6 bg-[#18181f] border border-[#333333] overflow-visible">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <Filter className="mr-2 text-[#0066F5]" size={20} />
            Filters
          </h3>
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
            <div className="mt-1">
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
            <div className="mt-1">
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
              onChange={handleLocationChange}
              className="w-full mt-1 pl-4 pr-4 py-2 rounded-lg bg-[#1E1E2D] border border-gray-600 text-white text-sm focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
              placeholder="Enter city"
            />
          </div>
        </div>
      </Card>

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <div className="flex justify-between items-center mb-6">
                <motion.div variants={itemVariants}>
                  <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                  <p className="text-gray-400">Welcome back to your vendor dashboard</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Button variant="primary" icon={<Plus size={16} />}>
                    Create New Show
                  </Button>
                </motion.div>
              </div>

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