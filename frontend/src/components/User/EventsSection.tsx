import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';

const EventsSection: React.FC = () => {
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
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.section 
      className="py-12 px-4 bg-gray-50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="flex justify-between items-center mb-8"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
          <motion.button 
            className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center"
            whileHover={{ x: 5 }}
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </motion.button>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {eventsData.map((event, index) => (
            <EventCard 
              key={index} 
              event={event} 
              custom={index}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

interface Event {
  title: string;
  date: string;
  location: string;
  price: string;
  image: string;
}

interface EventCardProps {
  event: Event;
  custom: number;
}

const EventCard: React.FC<EventCardProps> = ({ event, custom }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: custom * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group"
      variants={cardVariants}
      custom={custom}
      whileHover={{ y: -5 }}
    >
      <div className="relative pb-[56%]">
        <img
          src={event.image}
          alt={event.title}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-5">
        <div className="flex items-center mb-2 text-yellow-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">{event.date}</span>
        </div>
        <h3 className="font-bold text-gray-800 text-xl mb-2">{event.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{event.location}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900">{event.price}</span>
          <motion.button 
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            whileHover={{ scale: 1.05, backgroundColor: "#EAB308" }}
            whileTap={{ scale: 0.95 }}
          >
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const eventsData: Event[] = [
  {
    title: "Music Festival 2025",
    date: "Apr 15-17, 2025",
    location: "Kozhikode Beach | 3 Days of Live Music",
    price: "₹1,499",
    image: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    title: "Comedy Night Special",
    date: "Mar 25, 2025",
    location: "Town Hall | Stand-up Comedy Show",
    price: "₹699",
    image: "https://images.pexels.com/photos/7991432/pexels-photo-7991432.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    title: "Art Exhibition 2025",
    date: "May 5-10, 2025",
    location: "City Gallery | Modern Art Showcase",
    price: "₹299",
    image: "https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  }
];

export default EventsSection;