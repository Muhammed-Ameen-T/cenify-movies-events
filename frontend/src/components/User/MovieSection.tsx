import React from 'react';
import { motion } from 'framer-motion';
import { Star, Ticket, ArrowRight } from 'lucide-react';

const MovieSection: React.FC = () => {
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
      className="py-12 px-4"
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
          <h2 className="text-3xl font-bold text-gray-900">Movies in Theaters</h2>
          <motion.button 
            className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center"
            whileHover={{ x: 5 }}
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </motion.button>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {moviesData.map((movie, index) => (
            <MovieCard 
              key={index} 
              movie={movie} 
              custom={index}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

interface Movie {
  title: string;
  image: string;
  genre: string;
  rating: number;
}

interface MovieCardProps {
  movie: Movie;
  custom: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, custom }) => {
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
      <div className="relative pb-[140%]">
        <img
          src={movie.image}
          alt={movie.title}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-md text-gray-800">
          {movie.rating} <Star className="w-3 h-3 inline ml-1" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{movie.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{movie.genre}</p>
        <motion.button 
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          whileHover={{ scale: 1.03, backgroundColor: "#EAB308" }}
          whileTap={{ scale: 0.97 }}
        >
          <Ticket className="w-4 h-4 mr-2" />
          Book Tickets
        </motion.button>
      </div>
    </motion.div>
  );
};

const moviesData: Movie[] = [
  {
    title: "L2: Empuraan",
    image: "https://images.pexels.com/photos/6899260/pexels-photo-6899260.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    genre: "Action/Crime/Thriller",
    rating: 4.8
  },
  {
    title: "The Dark Knight",
    image: "https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    genre: "Action/Drama",
    rating: 4.9
  },
  {
    title: "Interstellar",
    image: "https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    genre: "Sci-Fi/Adventure",
    rating: 4.7
  },
  {
    title: "Inception",
    image: "https://images.pexels.com/photos/8088453/pexels-photo-8088453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    genre: "Sci-Fi/Action",
    rating: 4.6
  }
];

export default MovieSection;