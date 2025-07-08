import React, { useState, useEffect } from 'react';
import { Eye, Ban, Shield, Calendar, Tag, User as UserIcon} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

import UserModal from '../../components/Admin/UserModal';
import ConfirmationModal from '../../components/Admin/ConfirmationModal';
import Table from '../../components/AdminCommon/Table/Table';
import Pagination from '../../components/AdminCommon/Pagination/Pagination';
import Filter from '../../components/AdminCommon/Filter/Filter';
import { fetchUsers, updateUserStatus } from '../../services/Admin/userMngApi';
import { User } from '../../types/user';
import { TableColumn, TableAction } from '../../types/adminTable/table';
import { Filter as FilterType } from '../../types/adminTable/filter';

const ITEMS_PER_PAGE = 5;

type FilterOptions = {
  isBlocked?: boolean;
  role: string[];
  joinDate: 'newest' | 'oldest' | null;
  search: string;
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
    isBlocked: boolean;
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    isBlocked: undefined,
    role: [],
    joinDate: null,
    search: '',
  });

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

    navigate(
      {
        pathname: location.pathname,
        search: queryParams.toString() ? `?${queryParams.toString()}` : '',
      },
      { replace: true },
    );
  }, [filters, currentPage, location.pathname, navigate]);

  // Load filters from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newFilters: FilterOptions = {
      isBlocked: undefined,
      role: [],
      joinDate: null,
      search: '',
    };

    if (searchParams.has('page')) setCurrentPage(Number(searchParams.get('page')));
    if (searchParams.has('isBlocked')) newFilters.isBlocked = searchParams.get('isBlocked') === 'true';
    if (searchParams.has('role')) newFilters.role = searchParams.get('role')!.split(',');
    if (searchParams.has('joinDate')) newFilters.joinDate = searchParams.get('joinDate') as 'newest' | 'oldest';
    if (searchParams.has('search')) newFilters.search = searchParams.get('search')!;

    setFilters(newFilters);
  }, [location.search]);

  // User action handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleBlockUser = (user: User) => {
    setConfirmAction({
      id: user.id,
      isBlocked: true,
      message: 'Are you sure you want to block this user?',
    });
    setIsConfirmModalOpen(true);
  };

  const handleUnblockUser = (user: User) => {
    setConfirmAction({
      id: user.id,
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

  // Reset filters
  const resetFilters = () => {
    setFilters({
      isBlocked: undefined,
      role: [],
      joinDate: null,
      search: '',
    });
    setCurrentPage(1);
  };

  // Table columns configuration
  const columns: TableColumn<User>[] = [
    {
      key: 'id',
      label: 'No',
      render: (_, __, index) => (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
      width: '60px',
      className: 'text-gray-300 font-medium',
    },
    {
      key: 'profileImage',
      label: 'Profile',
      render: (_, user) => (
        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-orange-600 text-white font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      ),
      width: '80px',
    },
    {
      key: 'name',
      label: 'Name',
      className: 'text-white font-medium',
    },
    {
      key: 'email',
      label: 'Email',
      className: 'text-gray-300',
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => value || 'N/A',
      className: 'text-gray-300',
    },
    {
      key: 'role',
      label: 'Role',
      render: (role) => {
        const colors = {
          user: 'bg-gray-500',
          vendor: 'bg-purple-500',
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
              colors[role as keyof typeof colors] || 'bg-gray-500'
            }`}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'isBlocked',
      label: 'Status',
      render: (isBlocked) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
            isBlocked ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {isBlocked ? 'Blocked' : 'Active'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined Date',
      render: (date) =>
        new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(new Date(date)),
      className: 'text-gray-300',
    },
  ];

  // Table actions configuration
  const actions: TableAction<User>[] = [
    {
      label: 'View Details',
      onClick: handleViewUser,
      // icon: <Eye className="w-3 h-3" />,
      className: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      label: 'Block',
      onClick: handleBlockUser,
      // icon: <Ban className="w-3 h-3" />,
      className: 'bg-red-600 hover:bg-red-700 text-white',
      condition: (user) => !user.isBlocked,
    },
    {
      label: 'Unblock',
      onClick: handleUnblockUser,
      // icon: <Shield className="w-3 h-3" />,
      className: 'bg-green-600 hover:bg-green-700 text-white',
      condition: (user) => user.isBlocked,
    },
  ];

  // Filter configuration
  const filtersConfig: FilterType[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'search',
      value: filters.search,
      onChange: (value: string) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      },
      placeholder: 'Search users by name, email...',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      icon: <Tag className="w-5 h-5" />,
      value: filters.isBlocked,
      onChange: (value: boolean | null) => {
        setFilters((prev) => ({ ...prev, isBlocked: value ?? undefined }));
        setCurrentPage(1);
      },
      options: [
        { label: 'Active', value: false },
        { label: 'Blocked', value: true },
      ],
    },
    {
      key: 'role',
      label: 'Role',
      type: 'multiSelect',
      icon: <Shield className="w-5 h-5" />,
      value: filters.role,
      onChange: (value: string[]) => {
        setFilters((prev) => ({ ...prev, role: value }));
        setCurrentPage(1);
      },
      options: [
        { label: 'User', value: 'user' },
        { label: 'Vendor', value: 'vendor' },
      ],
    },
    {
      key: 'joinDate',
      label: 'Join Date',
      type: 'dateSort',
      icon: <Calendar className="w-5 h-5" />,
      value: filters.joinDate,
      onChange: (value: 'asc' | 'desc' | null) => {
        setFilters((prev) => ({
          ...prev,
          joinDate: value as 'newest' | 'oldest' | null,
        }));
        setCurrentPage(1);
      },
      options: [
        { label: 'Newest First', value: 'desc' },
        { label: 'Oldest First', value: 'asc' },
        { label: 'Clear', value: null },
      ],
    },
  ];

  // Calculate active filter count
  const activeFilterCount = [
    filters.isBlocked !== undefined,
    filters.role.length > 0,
    filters.joinDate !== null,
    filters.search !== '',
  ].filter(Boolean).length;

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* <h1 className="text-3xl font-bold text-white mb-8">User Management</h1>  */}

            {/* Error Message */}
            {errorMessage && (
              <div className="text-red-400 mb-4 p-3 bg-red-900/30 rounded-lg border border-red-800">
                {errorMessage}
              </div>
            )}

            {/* Filters */}
            <div className="mb-8">
              <Filter
                filters={filtersConfig}
                onReset={resetFilters}
                showActiveCount={true}
                expandable={true}
                expandedContent={
                  <div className="text-gray-400 text-sm">
                    No additional filters available for users.
                  </div>
                }
              />
            </div>

            {/* Table */}
            <div className="mb-8">
              <Table
                columns={columns}
                data={users}
                actions={actions}
                loading={isLoading}
                emptyState={{
                  icon: <UserIcon />,
                  title: 'No users found',
                  description: 'We couldn\'t find any users matching your filter criteria',
                  action: {
                    label: 'Reset Filters',
                    onClick: resetFilters,
                  },
                }}
                onRowClick={handleViewUser}
              />
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={totalUsers}
                showPageInfo={true}
                showItemsInfo={true}
              />
            )}

            {/* User Modal */}
            {selectedUser && (
              <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
              />
            )}

            {/* Confirmation Modal */}
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagement;