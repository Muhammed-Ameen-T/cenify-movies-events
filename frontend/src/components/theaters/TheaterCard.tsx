import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Clock, Edit, Trash } from 'lucide-react';
import Badge from '../ui/Badge';
import { Theater } from '../../types';

interface TheaterCardProps {
  theater: Theater;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const TheaterCard: React.FC<TheaterCardProps> = ({ theater, onEdit, onDelete }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'inactive': return 'danger';
      default: return 'default';
    }
  };

  return (
    <motion.div 
      className="bg-[#18181f] rounded-xl overflow-hidden border border-[#333333] transition-all duration-200 hover:border-[#0066F5]"
      whileHover={{ y: -5 }}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={theater.image} 
          alt={theater.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-3 right-3">
          <Badge 
            label={theater.status.charAt(0).toUpperCase() + theater.status.slice(1)} 
            variant={getStatusVariant(theater.status)}
          />
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-semibold text-white mb-2">{theater.name}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-400">
            <MapPin size={16} className="mr-2" />
            <span className="text-sm">{theater.location}</span>
          </div>
          
          <div className="flex items-center text-gray-400">
            <Users size={16} className="mr-2" />
            <span className="text-sm">Capacity: {theater.capacity} seats</span>
          </div>
          
          <div className="flex items-center text-gray-400">
            <Clock size={16} className="mr-2" />
            <span className="text-sm">
              Created: {new Date(theater.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {theater.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {theater.amenities.map((amenity, index) => (
            <span 
              key={index}
              className="inline-block text-xs px-2 py-1 rounded-full bg-[#333333] text-gray-300"
            >
              {amenity}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between gap-3 pt-3 border-t border-[#333333]">
          <button 
            onClick={() => onEdit(theater.id)}
            className="flex-1 flex items-center justify-center gap-1 text-sm text-[#0066F5] bg-[#0066F5]/10 py-2 rounded-lg hover:bg-[#0066F5]/20 transition-colors"
          >
            <Edit size={14} />
            <span>Edit</span>
          </button>
          
          <button 
            onClick={() => onDelete(theater.id)}
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

export default TheaterCard;