// src/pages/Admin/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, RotateCcw, Search, Calendar, Tag, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Admin/Navbar';
import Sidebar from '../../components/Admin/Sidebar';
import UserModal from '../../components/Admin/UserModal';
import ConfirmationModal from '../../components/Admin/ConfirmationModal';
import { fetchUsers, updateUserStatus } from '../../services/Admin/userMngApi';
import { User } from '../../types/user';

const ITEMS_PER_PAGE = 5; 

type FilterOptions = {
  isBlocked?: boolean; 
  role: string[];
  joinDate: 'newest' | 'oldest' | null;
  search: string;
};

const ShimmerRow: React.FC = () => {
  return (
    <tr className="border-b border-gray-700">
      <td className="p-4">
        <div className="h-4 bg-gray-700 rounded w-8 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-10 w-10 bg-gray-700 rounded-full animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-6 bg-gray-700 rounded w-20 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
          <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
        </div>
      </td>
    </tr>
  );
};

const UserManagement: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // States
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    isBlocked: boolean; // Changed to boolean
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    isBlocked: undefined,
    role: [],
    joinDate: null,
    search: '',
  });

  // Options for filtering
  const statusOptions = ['active', 'blocked']; // Removed 'pending'
  const roleOptions = ['user', 'admin', 'vendor'];

  // Fetch users
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', currentPage, filters],
    queryFn: () =>
      fetchUsers({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        isBlocked: filters.isBlocked,
        role: filters.role.length > 0 ? filters.role.join(',') : undefined,
        sortBy: filters.joinDate ? 'createdAt' : undefined,
        sortOrder: filters.joinDate === 'newest' ? 'desc' : filters.joinDate === 'oldest' ? 'asc' : undefined,
        search: filters.search || undefined,
      }),
  });

  const users = data?.users || [];
  const totalUsers = data?.totalCount || 0;
  const totalPages = data?.totalPages || Math.ceil(totalUsers / ITEMS_PER_PAGE);

  // Mutation for updating user block status
  const mutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      updateUserStatus(id, isBlocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setErrorMessage(null);
      setIsConfirmModalOpen(false);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || 'Failed to update block status');
    },
  });

  // Update URL with filters and pagination
  useEffect(() => {
    const queryParams = new URLSearchParams();

    if (currentPage > 1) queryParams.set('page', currentPage.toString());
    if (filters.isBlocked !== undefined) queryParams.set('isBlocked', filters.isBlocked.toString());
    if (filters.role.length > 0) queryParams.set('role', filters.role.join(','));
    if (filters.joinDate) queryParams.set('joinDate', filters.joinDate);
    if (filters.search) queryParams.set('search', filters.search);

    const queryString = queryParams.toString();
    navigate(
      {
        pathname: location.pathname,
        search: queryString ? `?${queryString}` : '',
      },
      { replace: true },
    );

    // Count active filters
    let count = 0;
    if (filters.isBlocked !== undefined) count++;
    if (filters.role.length > 0) count++;
    if (filters.joinDate) count++;
    if (filters.search) count++;
    setActiveFilterCount(count);
  }, [filters, currentPage, location.pathname, navigate]);

  // Load filters and pagination from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newFilters = { ...filters };

    if (searchParams.has('page')) setCurrentPage(Number(searchParams.get('page')));
    if (searchParams.has('isBlocked')) newFilters.isBlocked = searchParams.get('isBlocked') === 'true';
    if (searchParams.has('role')) newFilters.role = searchParams.get('role')!.split(',');
    if (searchParams.has('joinDate')) newFilters.joinDate = searchParams.get('joinDate') as 'newest' | 'oldest';
    if (searchParams.has('search')) newFilters.search = searchParams.get('search')!;

    setFilters(newFilters);
  }, []);

  // User action handlers
  const handleViewUser = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelectedUser(user);
      setIsModalOpen(true);
    }
  };

  const handleBlockUser = (id: string) => {
    setConfirmAction({
      id,
      isBlocked: true,
      message: 'Are you sure you want to block this user?',
    });
    setIsConfirmModalOpen(true);
  };

  const handleUnblockUser = (id: string) => {
    setConfirmAction({
      id,
      isBlocked: false,
      message: 'Are you sure you want to unblock this user?',
    });
    setIsConfirmModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (confirmAction) {
      mutation.mutate({ id: confirmAction.id, isBlocked: confirmAction.isBlocked });
    }
  };

  // Filter handlers
  const toggleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      isBlocked: status === 'blocked' ? true : status === 'active' ? false : undefined,
    }));
    setCurrentPage(1);
  };

  const toggleRoleFilter = (role: string) => {
    setFilters((prev) => {
      if (prev.role.includes(role)) {
        return {
          ...prev,
          role: prev.role.filter((r) => r !== role),
        };
      } else {
        return {
          ...prev,
          role: [...prev.role, role],
        };
      }
    });
    setCurrentPage(1);
  };

  const setJoinDateFilter = (joinDate: 'newest' | 'oldest' | null) => {
    setFilters((prev) => ({
      ...prev,
      joinDate,
    }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      isBlocked: undefined,
      role: [],
      joinDate: null,
      search: '',
    });
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const renderStatusBadge = (isBlocked: boolean) => {
    const status = isBlocked ? 'blocked' : 'active';
    const bgColor = status === 'active' ? 'bg-green-500' : 'bg-red-500';
    const textColor = 'text-white';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderRoleBadge = (role: string) => {
    let bgColor = '';
    let textColor = 'text-white';

    switch (role) {
      case 'admin':
        bgColor = 'bg-indigo-500';
        break;
      case 'vendor':
        bgColor = 'bg-purple-500';
        break;
      case 'user':
        bgColor = 'bg-gray-500';
        break;
      default:
        bgColor = 'bg-gray-500';
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar activePage="users" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <div className="relative">
              <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search users by name, email..."
                  className="bg-transparent text-white outline-none w-64"
                  value={filters.search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-gray-800 rounded-xl mb-8 shadow-lg">
            <div className="flex flex-wrap items-center p-2">
              <button
                onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                className={`flex items-center p-3 rounded-lg mr-2 transition-all ${
                  isFilterDrawerOpen ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Filter className="w-5 h-5 mr-2" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <div className="relative group mx-1">
                <button
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    filters.joinDate ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>
                    {filters.joinDate
                      ? filters.joinDate === 'newest'
                        ? 'Newest First'
                        : 'Oldest First'
                      : 'Join Date'}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => setJoinDateFilter('newest')}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${
                      filters.joinDate === 'newest' ? 'text-orange-500' : 'text-gray-300'
                    }`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => setJoinDateFilter('oldest')}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-700 ${
                      filters.joinDate === 'oldest' ? 'text-orange-500' : 'text-gray-300'
                    }`}
                  >
                    Oldest First
                  </button>
                </div>
              </div>
              <div className="relative group mx-1">
                <button
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    filters.isBlocked !== undefined ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Tag className="w-5 h-5 mr-2" />
                  <span>Status {filters.isBlocked !== undefined && '(1)'}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {statusOptions.map((status) => (
                    <label
                      key={status}
                      className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          status === 'blocked' ? filters.isBlocked === true : filters.isBlocked === false
                        }
                        onChange={() => toggleStatusFilter(status)}
                        className="mr-2 accent-orange-500"
                      />
                      <span
                        className={
                          (status === 'blocked' && filters.isBlocked === true) ||
                          (status === 'active' && filters.isBlocked === false)
                            ? 'text-orange-500'
                            : 'text-gray-300'
                        }
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="relative group mx-1">
                <button
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    filters.role.length > 0 ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Shield className="w-5 h-5 mr-2" />
                  <span>Role {filters.role.length > 0 && `(${filters.role.length})`}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {roleOptions.map((role) => (
                    <label
                      key={role}
                      className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.role.includes(role)}
                        onChange={() => toggleRoleFilter(role)}
                        className="mr-2 accent-orange-500"
                      />
                      <span className={filters.role.includes(role) ? 'text-orange-500' : 'text-gray-300'}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={resetFilters}
                className={`flex items-center p-3 rounded-lg ml-auto ${
                  activeFilterCount > 0 ? 'text-orange-500' : 'text-gray-500'
                }`}
                disabled={activeFilterCount === 0}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset Filters
              </button>
            </div>
            <AnimatePresence>
              {isFilterDrawerOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-gray-700"
                >
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-3">Additional Filters</h3>
                    <div className="text-gray-400 text-sm">No additional filters available for users.</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {errorMessage && (
            <div className="text-red-400 mb-4 p-3 bg-red-900/30 rounded-lg border border-red-800">
              {errorMessage}
            </div>
          )}

          {/* User Table */}
          <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900/50 text-left">
                    <th className="p-4 text-gray-400 font-medium">No</th>
                    <th className="p-4 text-gray-400 font-medium">Profile</th>
                    <th className="p-4 text-gray-400 font-medium">Name</th>
                    <th className="p-4 text-gray-400 font-medium">Email</th>
                    <th className="p-4 text-gray-400 font-medium">Phone</th>
                    <th className="p-4 text-gray-400 font-medium">Role</th>
                    <th className="p-4 text-gray-400 font-medium">Status</th>
                    <th className="p-4 text-gray-400 font-medium">Joined Date</th>
                    <th className="p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => <ShimmerRow key={index} />)
                  ) : error ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-red-400">
                        Error loading users: {(error as Error).message}
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-gray-400 text-5xl mb-4">👤</div>
                          <h3 className="text-white text-xl font-bold mb-2">No users found</h3>
                          <p className="text-gray-400 mb-6">
                            We couldn't find any users matching your filter criteria
                          </p>
                          <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="p-4 text-gray-300">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                        <td className="p-4">
                          <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-orange-600 text-white font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-white font-medium">{user.name}</td>
                        <td className="p-4 text-gray-300">{user.email}</td>
                        <td className="p-4 text-gray-300">{user.phone || 'N/A'}</td>
                        <td className="p-4">{renderRoleBadge(user.role)}</td>
                        <td className="p-4">{renderStatusBadge(user.isBlocked)}</td>
                        <td className="p-4 text-gray-300">{formatDate(user.createdAt)}</td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewUser(user.id)}
                              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                            >
                              View Details
                            </button>
                            {user.status === 'active' ? (
                              <button
                                onClick={() => handleBlockUser(user.id)}
                                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                              >
                                Block
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnblockUser(user.id)}
                                className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                              >
                                Unblock
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6">
              <div className="flex items-center bg-gray-800 rounded-lg shadow-lg p-2 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentPage === 1
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                  Previous
                </button>
                {totalPages <= 5 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))
                ) : (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === 1
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      1
                    </button>
                    {currentPage > 3 && <span className="px-3 py-2 text-gray-500">...</span>}
                    {currentPage > 2 && (
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
                      >
                        {currentPage - 1}
                      </button>
                    )}
                    {currentPage !== 1 && currentPage !== totalPages && (
                      <button
                        className="px-4 py-2 rounded-lg bg-orange-600 text-white"
                      >
                        {currentPage}
                      </button>
                    )}
                    {currentPage < totalPages - 1 && (
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
                      >
                        {currentPage + 1}
                      </button>
                    )}
                    {currentPage < totalPages - 2 && (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === totalPages
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentPage === totalPages
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Next
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>
              </div>
              <div className="ml-4 text-gray-400 text-sm">
                Page {currentPage} of {totalPages} ({totalPages - currentPage} pages remaining)
              </div>
            </div>
          )}

          {/* Results count info */}
          {!isLoading && users.length > 0 && (
            <div className="mt-4 text-gray-400 text-sm text-center">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalUsers)} of {totalUsers} users
            </div>
          )}

          {/* User modal */}
          {selectedUser && (
            <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={selectedUser} />
          )}

          {/* Confirmation modal */}
          {confirmAction && (
            <ConfirmationModal
              isOpen={isConfirmModalOpen}
              onClose={() => setIsConfirmModalOpen(false)}
              onConfirm={confirmStatusChange}
              title={confirmAction.isBlocked ? 'Block User' : 'Unblock User'}
              message={confirmAction.message}
              confirmText={confirmAction.isBlocked ? 'Block' : 'Unblock'}
              type={confirmAction.isBlocked ? 'danger' : 'info'}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default UserManagement;