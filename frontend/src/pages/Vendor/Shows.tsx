import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Film } from 'lucide-react';
import ShowCard from '../../components/shows/ShowCard';
import ShowFilter from '../../components/shows/ShowFilter';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/ui/Button';
import { shows } from '../../utils/mockData';

const ShowManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const itemsPerPage = 6;
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentShows = shows.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(shows.length / itemsPerPage);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleShowEdit = (showId: string) => {
    console.log(`Edit show with ID: ${showId}`);
    // Implement edit logic
  };
  
  const handleShowDelete = (showId: string) => {
    console.log(`Delete show with ID: ${showId}`);
    // Implement delete logic
  };
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    console.log('Filters changed:', newFilters);
    // Implement filtering logic
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Show Management</h1>
          <p className="text-gray-400">Manage your shows and performances</p>
        </div>
        
        <Button
          variant="primary"
          icon={<Plus size={16} />}
        >
          Create New Show
        </Button>
      </div>
      
      {/* Filters */}
      <ShowFilter onFilterChange={handleFilterChange} />
      
      {/* Shows Grid */}
      {shows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Film size={48} className="text-gray-500 mb-4" />
          <h3 className="text-xl font-medium text-white">No Shows Found</h3>
          <p className="text-gray-400 mb-6">There are no shows matching your criteria.</p>
          <Button variant="primary" icon={<Plus size={16} />}>Create Your First Show</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {currentShows.map((show) => (
              <ShowCard
                key={show.id}
                show={show}
                onEdit={handleShowEdit}
                onDelete={handleShowDelete}
              />
            ))}
          </div>
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </motion.div>
  );
};

export default ShowManagement;