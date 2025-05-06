import React, { useState,useMemo } from 'react';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import { Theater, Grid, Search, Filter, Trash2, Edit, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createTheater } from '../../services/Vendor/authApi';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/Buttons/BackButton';

const theaterSchema = z.object({
  name: z.string().min(1, 'Theater name is required'),
  location: z.string().min(1, 'Location is required'),
  rows: z.number().min(1, 'At least 1 row required'),
  seatsPerRow: z.number().min(1, 'At least 1 seat per row required'),
});

type TheaterFormData = z.infer<typeof theaterSchema>;

interface Theater {
  id: string;
  name: string;
  location: string;
  rows: number;
  seatsPerRow: number;
  createdDate: string;
  status: 'Active' | 'Inactive';
}

// Mock data for theaters
const mockTheaters: Theater[] = [
  { id: '1', name: 'Grand Theater', location: 'New York', rows: 10, seatsPerRow: 20, createdDate: '2023-01-15', status: 'Active' },
  { id: '2', name: 'City Hall', location: 'Los Angeles', rows: 8, seatsPerRow: 15, createdDate: '2023-02-20', status: 'Inactive' },
  { id: '3', name: 'Starlight Cinema', location: 'Chicago', rows: 12, seatsPerRow: 25, createdDate: '2023-03-10', status: 'Active' },
  { id: '4', name: 'Moonlit Stage', location: 'Miami', rows: 6, seatsPerRow: 10, createdDate: '2023-04-05', status: 'Active' },
];

const TheaterManagement: React.FC = () => {
  const [theaters, setTheaters] = useState<Theater[]>(mockTheaters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheater, setEditingTheater] = useState<Theater | undefined>(undefined);
  const [filters, setFilters] = useState({ search: '', status: '', location: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate()

  const createTheaterMutation = useMutation({
    mutationFn: createTheater,
    onSuccess: () => toast.success('Theater created successfully!'),
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to create theater'),
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const filteredTheaters = useMemo(() => {
    return theaters.filter((theater) => {
      const matchesSearch = theater.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status ? theater.status === filters.status : true;
      const matchesLocation = filters.location
        ? theater.location.toLowerCase().includes(filters.location.toLowerCase())
        : true;
      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [theaters, filters]);

  const paginatedTheaters = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTheaters.slice(start, start + pageSize);
  }, [filteredTheaters, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredTheaters.length / pageSize);

  const handleCreateOrUpdateTheater = (data: TheaterFormData & { seatLayout: string[][] }) => {
    if (editingTheater) {
      // Mock update
      setTheaters(theaters.map((t) =>
        t.id === editingTheater.id
          ? { ...t, ...data, createdDate: t.createdDate, status: t.status }
          : t
      ));
      toast.success('Theater updated successfully!');
    } else {
      // Mock create
      const newTheater: Theater = {
        id: String(theaters.length + 1),
        ...data,
        createdDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      };
      setTheaters([...theaters, newTheater]);
      createTheaterMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    setTheaters(theaters.filter((t) => t.id !== id));
    toast.success('Theater deleted successfully!');
  };

  const handleEdit = (theater: Theater) => {
    setEditingTheater(theater);
    setIsModalOpen(true);
  };

  const handleView = (theater: Theater) => {
    console.log('View theater:', theater);
    toast.info('View theater details (placeholder action)');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="p-6 bg-[#1E1E2D]">
      <ToastContainer />
      <BackButton/>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Theater Management</h1>
        <Button
          variant="primary"
          icon={<Theater size={16} />}
          onClick={() => {
            navigate('/vendor/create-theater')
          }}
        >
          Add Theater
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-6 bg-[#18181f] border border-[#333333]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <Filter className="mr-2 text-[#0066F5]" size={20} />
            Filters
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-400">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
                placeholder="Search by theater name"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full mt-1 pl-4 pr-4 py-2 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
            >
              <option value="" className="text-gray-400">All</option>
              <option value="Active" className="text-white">Active</option>
              <option value="Inactive" className="text-white">Inactive</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full mt-1 pl-4 pr-4 py-2 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
              placeholder="Enter location"
            />
          </div>
        </div>
      </Card>

      {/* Theater Table */}
      <Card className="p-6 bg-[#18181f] border border-[#333333]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-white">
            <thead>
              <tr className="border-b border-[#333333]">
                <th className="py-3 px-4 text-sm font-medium text-gray-400">No.</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Theater Name</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Created Date</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTheaters.map((theater, index) => (
                <tr key={theater.id} className="border-b border-[#333333] hover:bg-[#121218]">
                  <td className="py-3 px-4 text-sm">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="py-3 px-4 text-sm">{theater.name}</td>
                  <td className="py-3 px-4 text-sm">{theater.createdDate}</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        theater.status === 'Active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {theater.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm flex space-x-2">
                    <button
                      onClick={() => handleDelete(theater.id)}
                      className="text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(theater)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleView(theater)}
                      className="text-gray-400 hover:text-gray-300"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedTheaters.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    No theaters found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Show</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="pl-2 pr-2 py-1 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-400">
              of {filteredTheaters.length} entries
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  currentPage === page
                    ? 'bg-[#0066F5] text-white'
                    : 'bg-[#121218] border border-[#333333] text-white'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TheaterManagement;