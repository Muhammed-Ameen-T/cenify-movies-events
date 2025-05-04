import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for upcoming shows
const upcomingShows = [
  {
    id: '1',
    title: 'Hamilton',
    date: '2025-02-18',
    time: '19:00',
    venue: 'Broadway Theater',
    category: 'Musical',
    thumbnail: 'https://images.pexels.com/photos/2731976/pexels-photo-2731976.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: '2',
    title: 'The Lion King',
    date: '2025-02-20',
    time: '20:00',
    venue: 'Grand Opera House',
    category: 'Musical',
    thumbnail: 'https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: '3',
    title: 'Romeo and Juliet',
    date: '2025-02-22',
    time: '18:30',
    venue: 'Globe Theater',
    category: 'Drama',
    thumbnail: 'https://images.pexels.com/photos/3044555/pexels-photo-3044555.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
];

const UpcomingShowsCard: React.FC = () => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-4">
      {upcomingShows.map((show, index) => (
        <motion.div
          key={show.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex bg-dark-300 rounded-lg overflow-hidden hover:bg-dark-200 transition-colors duration-200"
        >
          <div className="w-1/3 h-24 relative">
            <img
              src={show.thumbnail}
              alt={show.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-500/80 to-transparent"></div>
          </div>
          
          <div className="w-2/3 p-3">
            <Link 
              to={`/shows/${show.id}`}
              className="text-sm font-semibold text-white hover:text-primary-400 transition-colors line-clamp-1"
            >
              {show.title}
            </Link>
            
            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
              <div className="flex items-center">
                <Calendar size={12} className="text-gray-400 mr-1" />
                <span className="text-xs text-gray-400">{formatDate(show.date)}</span>
              </div>
              
              <div className="flex items-center">
                <Clock size={12} className="text-gray-400 mr-1" />
                <span className="text-xs text-gray-400">{show.time}</span>
              </div>
              
              <div className="flex items-center">
                <MapPin size={12} className="text-gray-400 mr-1" />
                <span className="text-xs text-gray-400 truncate">{show.venue}</span>
              </div>
              
              <div className="flex items-center">
                <Tag size={12} className="text-gray-400 mr-1" />
                <span className="text-xs text-primary-400">{show.category}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      <Link 
        to="/shows"
        className="block text-center text-xs text-primary-400 hover:text-primary-300 transition-colors py-2 mt-2"
      >
        View All Shows
      </Link>
    </div>
  );
};

export default UpcomingShowsCard;