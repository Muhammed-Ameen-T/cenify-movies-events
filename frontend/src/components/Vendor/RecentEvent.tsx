import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for recent events
const recentEvents = [
  {
    id: '1',
    title: 'Hamilton Musical',
    date: '2025-02-15',
    venue: 'Broadway Theater',
    ticketsSold: 548,
    revenue: '$24,660',
    status: 'Active'
  },
  {
    id: '2',
    title: 'The Lion King',
    date: '2025-02-18',
    venue: 'Grand Opera House',
    ticketsSold: 412,
    revenue: '$18,540',
    status: 'Active'
  },
  {
    id: '3',
    title: 'Wicked',
    date: '2025-02-20',
    venue: 'Palace Theater',
    ticketsSold: 389,
    revenue: '$15,950',
    status: 'Active'
  },
  {
    id: '4',
    title: 'Dear Evan Hansen',
    date: '2025-02-22',
    venue: 'Music Box Theater',
    ticketsSold: 276,
    revenue: '$11,320',
    status: 'Upcoming'
  },
  {
    id: '5',
    title: 'The Phantom of the Opera',
    date: '2025-02-28',
    venue: 'Majestic Theater',
    ticketsSold: 502,
    revenue: '$22,590',
    status: 'Upcoming'
  }
];

interface DropdownMenuProps {
  id: string;
  onClose: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ id, onClose }) => {
  return (
    <motion.div 
      className="absolute right-0 mt-2 w-48 bg-dark-300 rounded-lg shadow-lg py-2 z-50 border border-dark-200"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Link 
        to={`/events/${id}`}
        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-400 hover:text-white transition-colors"
      >
        <span className="mr-2">View Details</span>
      </Link>
      <Link 
        to={`/events/edit/${id}`}
        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-400 hover:text-white transition-colors"
      >
        <Edit size={14} className="mr-2" />
        <span>Edit Event</span>
      </Link>
      <button 
        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-400 hover:text-red-300 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          console.log(`Delete event ${id}`);
          onClose();
        }}
      >
        <Trash2 size={14} className="mr-2" />
        <span>Delete Event</span>
      </button>
    </motion.div>
  );
};

const RecentEventsTable: React.FC = () => {
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  const handleOutsideClick = () => {
    if (activeDropdown) {
      setActiveDropdown(null);
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [activeDropdown]);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Event
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Venue
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Tickets Sold
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Revenue
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-200">
          {recentEvents.map((event, index) => (
            <motion.tr 
              key={event.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-dark-300"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <Link to={`/events/${event.id}`} className="text-sm font-medium text-white hover:text-primary-400 transition-colors">
                  {event.title}
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-300">{formatDate(event.date)}</span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <MapPin size={14} className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-300">{event.venue}</span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <Users size={14} className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-300">{event.ticketsSold}</span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm font-medium text-primary-400">{event.revenue}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  event.status === 'Active' 
                    ? 'bg-success-500/20 text-success-500' 
                    : 'bg-warning-500/20 text-warning-500'
                }`}>
                  {event.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right relative">
                <button 
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-dark-200 transition-colors"
                  onClick={(e) => toggleDropdown(event.id, e)}
                >
                  <MoreVertical size={16} />
                </button>
                
                {activeDropdown === event.id && (
                  <DropdownMenu 
                    id={event.id} 
                    onClose={() => setActiveDropdown(null)} 
                  />
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentEventsTable;