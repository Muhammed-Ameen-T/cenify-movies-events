import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Save, 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  Tag, 
  AlertTriangle, 
  Image, 
  X, 
  Info, 
  Plus,
  ArrowLeft
} from 'lucide-react';

// Mock data for an event (for edit mode)
const mockEvent = {
  id: '1',
  title: 'Hamilton Musical',
  description: 'Hamilton is the story of America then, told by America now. Featuring a score that blends hip-hop, jazz, R&B, and Broadway, Hamilton has taken the story of American founding father Alexander Hamilton and created a revolutionary moment in theatre.',
  date: '2025-02-15',
  time: '19:00',
  venue: 'Broadway Theater',
  category: 'Musical',
  ticketTypes: [
    { id: '1', name: 'Standard', price: 45, available: 200 },
    { id: '2', name: 'Premium', price: 85, available: 100 },
    { id: '3', name: 'VIP', price: 150, available: 50 }
  ],
  thumbnail: 'https://images.pexels.com/photos/11962864/pexels-photo-11962864.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
};

// Categories for dropdown
const categories = ['Musical', 'Drama', 'Comedy', 'Ballet', 'Opera'];

// Venues for dropdown
const venues = ['Broadway Theater', 'Palace Theater', 'Globe Theater', 'Grand Opera House', 'Music Box Theater', 'Majestic Theater'];

interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
}

const EventForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [category, setCategory] = useState('');
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  
  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load event data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      // In a real app, you would fetch the event data from your API
      // For now, we'll use the mock data
      setTitle(mockEvent.title);
      setDescription(mockEvent.description);
      setDate(mockEvent.date);
      setTime(mockEvent.time);
      setVenue(mockEvent.venue);
      setCategory(mockEvent.category);
      setTicketTypes(mockEvent.ticketTypes);
      setThumbnail(mockEvent.thumbnail);
      setThumbnailPreview(mockEvent.thumbnail);
    } else {
      // Add an empty ticket type for new events
      setTicketTypes([
        { id: Date.now().toString(), name: '', price: 0, available: 0 }
      ]);
    }
  }, [id, isEditMode]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!title) errors.title = 'Title is required';
    if (!description) errors.description = 'Description is required';
    if (!date) errors.date = 'Date is required';
    if (!time) errors.time = 'Time is required';
    if (!venue) errors.venue = 'Venue is required';
    if (!category) errors.category = 'Category is required';
    
    // Validate ticket types
    if (ticketTypes.length === 0) {
      errors.ticketTypes = 'At least one ticket type is required';
    } else {
      ticketTypes.forEach((ticket, index) => {
        if (!ticket.name) errors[`ticketName-${index}`] = 'Name is required';
        if (ticket.price <= 0) errors[`ticketPrice-${index}`] = 'Price must be greater than 0';
        if (ticket.available <= 0) errors[`ticketAvailable-${index}`] = 'Available tickets must be greater than 0';
      });
    }
    
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        console.log('Submitted form data:', {
          title,
          description,
          date,
          time,
          venue,
          category,
          ticketTypes,
          thumbnail
        });
        
        // Navigate back to events list
        navigate('/events');
        
        setIsSubmitting(false);
      }, 1000);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThumbnail(e.target.value);
    setThumbnailPreview(e.target.value);
  };

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      { id: Date.now().toString(), name: '', price: 0, available: 0 }
    ]);
  };

  const updateTicketType = (index: number, field: keyof TicketType, value: string | number) => {
    const updatedTicketTypes = [...ticketTypes];
    updatedTicketTypes[index] = {
      ...updatedTicketTypes[index],
      [field]: value
    };
    setTicketTypes(updatedTicketTypes);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      const updatedTicketTypes = [...ticketTypes];
      updatedTicketTypes.splice(index, 1);
      setTicketTypes(updatedTicketTypes);
    }
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
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link 
            to="/events" 
            className="mr-4 p-2 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Event' : 'Create Event'}
          </h1>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn-primary flex items-center"
        >
          <Save size={18} className="mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Event'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main details */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            <div className="card space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`form-input ${formErrors.title ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="Enter event title"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.title}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className={`form-input resize-none ${formErrors.description ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="Enter event description"
                ></textarea>
                {formErrors.description && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-1">
                    Event Date
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`form-input pl-10 ${formErrors.date ? 'border-error-500 focus:ring-error-500' : ''}`}
                    />
                  </div>
                  {formErrors.date && (
                    <p className="mt-1 text-sm text-error-500">{formErrors.date}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-400 mb-1">
                    Event Time
                  </label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="time"
                      id="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={`form-input pl-10 ${formErrors.time ? 'border-error-500 focus:ring-error-500' : ''}`}
                    />
                  </div>
                  {formErrors.time && (
                    <p className="mt-1 text-sm text-error-500">{formErrors.time}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="venue" className="block text-sm font-medium text-gray-400 mb-1">
                    Venue
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <select
                      id="venue"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className={`form-input pl-10 ${formErrors.venue ? 'border-error-500 focus:ring-error-500' : ''}`}
                    >
                      <option value="" disabled>Select venue</option>
                      {venues.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  {formErrors.venue && (
                    <p className="mt-1 text-sm text-error-500">{formErrors.venue}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-400 mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`form-input pl-10 ${formErrors.category ? 'border-error-500 focus:ring-error-500' : ''}`}
                    >
                      <option value="" disabled>Select category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-error-500">{formErrors.category}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Ticket Types */}
            <div className="card space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Ticket Types</h2>
                <button
                  type="button"
                  onClick={addTicketType}
                  className="btn-outline flex items-center text-sm py-1"
                >
                  <Plus size={16} className="mr-1" />
                  <span>Add Ticket Type</span>
                </button>
              </div>
              
              {formErrors.ticketTypes && (
                <div className="flex p-3 rounded-lg bg-error-500/10 border border-error-500/30 text-sm items-center gap-2">
                  <AlertTriangle size={18} className="text-error-500" />
                  <span className="text-error-500">{formErrors.ticketTypes}</span>
                </div>
              )}
              
              <div className="space-y-4">
                {ticketTypes.map((ticket, index) => (
                  <div key={ticket.id} className="p-4 bg-dark-300 rounded-lg border border-dark-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Ticket Type #{index + 1}</h3>
                      {ticketTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketType(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor={`ticketName-${index}`} className="block text-sm font-medium text-gray-400 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          id={`ticketName-${index}`}
                          value={ticket.name}
                          onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                          className={`form-input ${formErrors[`ticketName-${index}`] ? 'border-error-500 focus:ring-error-500' : ''}`}
                          placeholder="e.g. Standard, VIP"
                        />
                        {formErrors[`ticketName-${index}`] && (
                          <p className="mt-1 text-sm text-error-500">{formErrors[`ticketName-${index}`]}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor={`ticketPrice-${index}`} className="block text-sm font-medium text-gray-400 mb-1">
                          Price ($)
                        </label>
                        <div className="relative">
                          <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          <input
                            type="number"
                            id={`ticketPrice-${index}`}
                            value={ticket.price}
                            onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value))}
                            className={`form-input pl-10 ${formErrors[`ticketPrice-${index}`] ? 'border-error-500 focus:ring-error-500' : ''}`}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        {formErrors[`ticketPrice-${index}`] && (
                          <p className="mt-1 text-sm text-error-500">{formErrors[`ticketPrice-${index}`]}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor={`ticketAvailable-${index}`} className="block text-sm font-medium text-gray-400 mb-1">
                          Available Seats
                        </label>
                        <input
                          type="number"
                          id={`ticketAvailable-${index}`}
                          value={ticket.available}
                          onChange={(e) => updateTicketType(index, 'available', parseInt(e.target.value))}
                          className={`form-input ${formErrors[`ticketAvailable-${index}`] ? 'border-error-500 focus:ring-error-500' : ''}`}
                          min="0"
                        />
                        {formErrors[`ticketAvailable-${index}`] && (
                          <p className="mt-1 text-sm text-error-500">{formErrors[`ticketAvailable-${index}`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Sidebar */}
          <motion.div 
            variants={itemVariants}
            className="space-y-6"
          >
            {/* Event Thumbnail */}
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Event Thumbnail</h2>
              
              <div className="relative bg-dark-300 rounded-lg overflow-hidden aspect-video">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Event thumbnail preview"
                    className="w-full h-full object-cover"
                    onError={() => setThumbnailPreview('')}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <Image size={40} className="text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400">No image selected</p>
                    <p className="text-xs text-gray-500">Enter a URL to add an image</p>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-400 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  id="thumbnail"
                  value={thumbnail}
                  onChange={handleThumbnailChange}
                  className="form-input"
                  placeholder="Enter image URL"
                />
              </div>
            </div>
            
            {/* Help & Tips */}
            <div className="card space-y-4 bg-gradient-to-br from-dark-300 to-dark-400 border-l-4 border-primary-500">
              <h2 className="text-lg font-semibold flex items-center">
                <Info size={18} className="mr-2 text-primary-400" />
                Tips for Success
              </h2>
              
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex">
                  <span className="text-primary-400 mr-2">•</span>
                  <span>Include detailed descriptions to attract more attendees</span>
                </li>
                <li className="flex">
                  <span className="text-primary-400 mr-2">•</span>
                  <span>Use high-quality images for your event thumbnail</span>
                </li>
                <li className="flex">
                  <span className="text-primary-400 mr-2">•</span>
                  <span>Offer multiple ticket types to cater to different preferences</span>
                </li>
                <li className="flex">
                  <span className="text-primary-400 mr-2">•</span>
                  <span>Consider special pricing for early birds or group bookings</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
};

export default EventForm;