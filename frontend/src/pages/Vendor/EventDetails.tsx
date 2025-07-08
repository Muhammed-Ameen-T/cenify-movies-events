import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  Tag, 
  Users, 
  DollarSign, 
  Edit, 
  ArrowLeft,
  BarChart3
} from 'lucide-react';

// Mock event data
const mockEvent = {
  id: '1',
  title: 'Hamilton Musical',
  description: 'Hamilton is the story of America then, told by America now. Featuring a score that blends hip-hop, jazz, R&B, and Broadway, Hamilton has taken the story of American founding father Alexander Hamilton and created a revolutionary moment in theatre.',
  date: '2025-02-15',
  time: '19:00',
  venue: 'Broadway Theater',
  location: 'New York, NY',
  category: 'Musical',
  ticketsSold: 548,
  totalSeats: 650,
  revenue: '$24,660',
  status: 'Active',
  ticketTypes: [
    { id: '1', name: 'Standard', price: 45, available: 10, sold: 200 },
    { id: '2', name: 'Premium', price: 85, available: 5, sold: 95 },
    { id: '3', name: 'VIP', price: 150, available: 0, sold: 50 }
  ],
  thumbnail: 'https://images.pexels.com/photos/11962864/pexels-photo-11962864.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  shows: [
    { id: '1', date: '2025-02-15', time: '19:00', ticketsSold: 150 },
    { id: '2', date: '2025-02-16', time: '14:00', ticketsSold: 120 },
    { id: '3', date: '2025-02-16', time: '19:00', ticketsSold: 135 },
    { id: '4', date: '2025-02-17', time: '19:00', ticketsSold: 143 }
  ]
};

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('details');
  
  // In a real app, you would fetch the event data based on the id
  const event = mockEvent;
  
  const calculateSoldPercentage = () => {
    return Math.round((event.ticketsSold / event.totalSeats) * 100);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center">
          <Link 
            to="/events" 
            className="mr-4 p-2 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Event Details</h1>
        </div>
        
        <Link to={`/events/edit/${id}`} className="btn-primary flex items-center sm:self-end">
          <Edit size={18} className="mr-2" />
          Edit Event
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="card">
            <div className="relative h-64 -mx-6 -mt-6 mb-6 rounded-t-xl overflow-hidden">
              <img
                src={event.thumbnail}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-500 to-transparent"></div>
              <div className="absolute bottom-4 left-6">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${
                  event.status === 'Active' 
                    ? 'bg-success-500/20 text-success-500' 
                    : 'bg-warning-500/20 text-warning-500'
                }`}>
                  {event.status}
                </span>
                <h1 className="text-3xl font-bold text-white">{event.title}</h1>
              </div>
            </div>
            
            <div className="flex space-x-6 mb-6">
              <div className="flex items-center text-sm">
                <Calendar size={16} className="text-gray-400 mr-2" />
                <span>{formatDate(event.date)}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Clock size={16} className="text-gray-400 mr-2" />
                <span>{event.time}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <MapPin size={16} className="text-gray-400 mr-2" />
                <span>{event.venue}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Tag size={16} className="text-gray-400 mr-2" />
                <span className="text-primary-400">{event.category}</span>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">About This Event</h2>
              <p className="text-gray-300 leading-relaxed">{event.description}</p>
            </div>
            
            <div className="border-t border-dark-200 pt-6">
              <div className="flex border-b border-dark-200">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'text-primary-400 border-b-2 border-primary-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Ticket Details
                </button>
                <button
                  onClick={() => setActiveTab('shows')}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'shows'
                      ? 'text-primary-400 border-b-2 border-primary-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Show Schedule
                </button>
              </div>
              
              <div className="pt-4">
                {activeTab === 'details' ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Ticket Types</h3>
                    <div className="space-y-3">
                      {event.ticketTypes.map((ticket) => (
                        <div key={ticket.id} className="bg-dark-300 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="font-medium">{ticket.name}</h4>
                            <div className="flex items-center text-sm text-gray-400 mt-1">
                              <DollarSign size={14} className="mr-1" />
                              <span>${ticket.price}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-0">
                            <div className="flex items-center text-sm">
                              <Ticket size={14} className="text-gray-400 mr-1" />
                              <span className="text-gray-400">
                                {ticket.available > 0 ? `${ticket.available} available` : 'Sold out'}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-sm">
                              <Users size={14} className="text-gray-400 mr-1" />
                              <span className="text-gray-400">{ticket.sold} sold</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Upcoming Shows</h3>
                    <div className="space-y-3">
                      {event.shows.map((show) => (
                        <div key={show.id} className="bg-dark-300 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center">
                            <div className="bg-dark-200 p-2 rounded-lg text-center mr-4">
                              <div className="text-xs text-gray-400">
                                {new Date(show.date).toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                              <div className="text-xl font-bold">
                                {new Date(show.date).getDate()}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium">
                                {new Date(show.date).toLocaleDateString('en-US', { weekday: 'long' })}
                              </h4>
                              <div className="flex items-center text-sm text-gray-400 mt-1">
                                <Clock size={14} className="mr-1" />
                                <span>{show.time}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center mt-3 sm:mt-0">
                            <div className="flex items-center text-sm mr-4">
                              <Users size={14} className="text-gray-400 mr-1" />
                              <span className="text-gray-400">{show.ticketsSold} tickets sold</span>
                            </div>
                            
                            <Link 
                              to={`/shows/${show.id}`}
                              className="btn-outline py-1 px-3 text-sm"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Event Stats</h2>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Tickets Sold</span>
                <span className="text-sm font-medium">{event.ticketsSold}/{event.totalSeats}</span>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-primary-400 h-2.5 rounded-full" 
                  style={{ width: `${calculateSoldPercentage()}%` }}
                ></div>
              </div>
              <div className="text-right mt-1">
                <span className="text-xs text-gray-400">{calculateSoldPercentage()}% Sold</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-dark-200">
                <div className="flex items-center">
                  <div className="bg-primary-500/20 p-2 rounded-lg mr-3">
                    <Ticket size={18} className="text-primary-400" />
                  </div>
                  <span className="text-sm">Total Tickets</span>
                </div>
                <span className="font-medium">{event.totalSeats}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-dark-200">
                <div className="flex items-center">
                  <div className="bg-secondary-500/20 p-2 rounded-lg mr-3">
                    <Users size={18} className="text-secondary-400" />
                  </div>
                  <span className="text-sm">Tickets Sold</span>
                </div>
                <span className="font-medium">{event.ticketsSold}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-dark-200">
                <div className="flex items-center">
                  <div className="bg-success-500/20 p-2 rounded-lg mr-3">
                    <DollarSign size={18} className="text-success-500" />
                  </div>
                  <span className="text-sm">Total Revenue</span>
                </div>
                <span className="font-medium text-success-500">{event.revenue}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="bg-error-500/20 p-2 rounded-lg mr-3">
                    <Tag size={18} className="text-error-500" />
                  </div>
                  <span className="text-sm">Category</span>
                </div>
                <span className="font-medium">{event.category}</span>
              </div>
            </div>
          </div>
          
          <Link 
            to={`/insights?event=${id}`}
            className="card bg-gradient-to-br from-primary-500/10 to-secondary-500/10 hover:from-primary-500/20 hover:to-secondary-500/20 transition-all duration-300 flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold mb-1">View Detailed Analytics</h3>
              <p className="text-sm text-gray-400">Get insights about this event's performance</p>
            </div>
            <div className="bg-dark-300 p-2.5 rounded-lg">
              <BarChart3 size={20} className="text-primary-400" />
            </div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EventDetails;