import React, { useState, useRef } from 'react';
import { Calendar, ArrowRight, Clock, ChevronLeft, ChevronRight, MapPin, Ticket, Users, Star } from 'lucide-react';

interface Event {
  title: string;
  image: string;
  category: string;
  rating: number;
  duration: string;
  date: string;
  location: string;
  price: number;
  attendees?: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

interface EventCardProps {
  event: Event;
  index: number;
}

const EventsSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of one card + gap
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
              <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">Upcoming Events</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tight">
              Featured Events
            </h2>
            <p className="text-gray-600 mt-2 text-lg">Experience amazing live events and entertainment</p>
          </div>
          
          <a
            href="/events"
            className="group flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/25"
          >
            <span>View All</span>
            <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Events Carousel */}
        <div className="relative">
          {/* Scroll Container */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 pb-4 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {eventsData.map((event, index) => (
              <EventCard key={index} event={event} index={index} />
            ))}
          </div>

          {/* Navigation Arrows */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border border-gray-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border border-gray-200"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({length: Math.min(eventsData.length - 2, 5)}).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-gray-300 rounded-full"></div>
          ))}
        </div>
      </div>
    </section>
  );
};

const EventCard: React.FC<EventCardProps> = ({ event, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="flex-shrink-0 w-80 group cursor-pointer px-2 py-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-gray-100 hover:border-yellow-200">
        
        {/* Event Image */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          
          {/* New/Featured Badge */}
          {event.isNew && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              NEW
            </div>
          )}
          
          {event.isFeatured && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              FEATURED
            </div>
          )}
          
          {/* Rating */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="font-bold text-sm">{event.rating}</span>
          </div>

          {/* Calendar Icon Overlay */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform transition-transform duration-300 hover:scale-110 border border-white/30">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Event Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-4 text-sm mb-2 opacity-90">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{event.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
              {event.attendees && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{event.attendees}+ attending</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 space-y-4 bg-white">
          <div>
            <h3 className="font-bold text-gray-900 text-xl mb-2 line-clamp-1 group-hover:text-yellow-600 transition-colors">
              {event.title}
            </h3>
            <p className="text-gray-600 text-sm font-medium">{event.category}</p>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-700 font-medium text-sm">{event.date}</span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between">
            <div className="text-yellow-600 font-bold text-lg">
              ₹{event.price}
            </div>
            
            <button className="flex-1 ml-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/25">
              <Ticket className="w-5 h-5" />
              <span>Book Now</span>
            </button>
          </div>
        </div>

        {/* Hover Border Effect */}
        <div className="absolute inset-0 rounded-3xl border-2 border-yellow-400/0 group-hover:border-yellow-400/50 transition-colors duration-300 pointer-events-none"></div>
      </div>
    </div>
  );
};

// Enhanced events data
const eventsData: Event[] = [
  {
    title: 'Music Festival 2025',
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Music • Festival • Live Performance',
    rating: 4.8,
    duration: '3 Days',
    date: 'Apr 15-17, 2025',
    location: 'Kozhikode Beach',
    price: 1499,
    attendees: 5000,
    isNew: true
  },
  {
    title: 'Comedy Night Special',
    image: 'https://images.pexels.com/photos/7991432/pexels-photo-7991432.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Comedy • Stand-up • Entertainment',
    rating: 4.7,
    duration: '2h 30m',
    date: 'Mar 25, 2025',
    location: 'Town Hall',
    price: 699,
    attendees: 300,
    isFeatured: true
  },
  {
    title: 'Art Exhibition 2025',
    image: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Art • Exhibition • Modern Art',
    rating: 4.5,
    duration: '6 Days',
    date: 'May 5-10, 2025',
    location: 'City Gallery',
    price: 299,
    attendees: 150
  },
  {
    title: 'Tech Conference 2025',
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Technology • Conference • Innovation',
    rating: 4.9,
    duration: '2 Days',
    date: 'Jun 12-13, 2025',
    location: 'Convention Center',
    price: 2499,
    attendees: 1200,
    isNew: true
  },
  {
    title: 'Food & Wine Festival',
    image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Food • Wine • Culinary Experience',
    rating: 4.6,
    duration: '1 Day',
    date: 'Jul 20, 2025',
    location: 'Heritage Park',
    price: 899,
    attendees: 800
  },
  {
    title: 'Dance Championship',
    image: 'https://images.pexels.com/photos/3137890/pexels-photo-3137890.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Dance • Competition • Performance',
    rating: 4.4,
    duration: '4h',
    date: 'Aug 8, 2025',
    location: 'Sports Arena',
    price: 799,
    attendees: 2000,
    isFeatured: true
  }
];

export default EventsSection;