import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, DollarSign, Tag, Theater, Edit, Trash } from 'lucide-react';
import Badge from '../ui/Badge';
import { Show } from '../../types';

interface ShowCardProps {
  show: Show;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ShowCard: React.FC<ShowCardProps> = ({ show, onEdit, onDelete }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ongoing': return 'success';
      case 'upcoming': return 'primary';
      case 'completed': return 'info';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <motion.div 
      className="bg-[#18181f] rounded-xl overflow-hidden border border-[#333333] transition-all duration-200 hover:border-[#0066F5]"
      whileHover={{ y: -5 }}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={show.image} 
          alt={show.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-3 right-3">
          <Badge 
            label={show.status.charAt(0).toUpperCase() + show.status.slice(1)} 
            variant={getStatusVariant(show.status)}
          />
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-semibold text-white mb-2">{show.title}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-400">
            <Theater size={16} className="mr-2" />
            <span className="text-sm">{show.theaterName}</span>
          </div>
          
          <div className="flex items-center text-gray-400">
            <Calendar size={16} className="mr-2" />
            <span className="text-sm">
              {formatDate(show.startDate)} - {formatDate(show.endDate)}
            </span>
          </div>
          
          <div className="flex items-center text-gray-400">
            <Clock size={16} className="mr-2" />
            <span className="text-sm">
              Duration: {show.duration} min
            </span>
          </div>
          
          <div className="flex items-center text-gray-400">
            <DollarSign size={16} className="mr-2" />
            <span className="text-sm">
              ${show.price.standard} - ${show.price.vip || show.price.premium || show.price.standard}
            </span>
          </div>
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {show.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {show.tags.map((tag, index) => (
            <div 
              key={index}
              className="flex items-center text-xs px-2 py-1 rounded-full bg-[#333333] text-gray-300"
            >
              <Tag size={10} className="mr-1" />
              {tag}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between gap-3 pt-3 border-t border-[#333333]">
          <button 
            onClick={() => onEdit(show.id)}
            className="flex-1 flex items-center justify-center gap-1 text-sm text-[#0066F5] bg-[#0066F5]/10 py-2 rounded-lg hover:bg-[#0066F5]/20 transition-colors"
          >
            <Edit size={14} />
            <span>Edit</span>
          </button>
          
          <button 
            onClick={() => onDelete(show.id)}
            className="flex-1 flex items-center justify-center gap-1 text-sm text-[#f5005f] bg-[#f5005f]/10 py-2 rounded-lg hover:bg-[#f5005f]/20 transition-colors"
          >
            <Trash size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ShowCard;