// src/components/User/RateMovieModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Star, X, MessageSquare, Building2, Film, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { BookingService } from '../../services/User/bookingApi';
import { Booking } from '../../types/bookingResponse';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -20,
    transition: { duration: 0.3 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const successVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      type: 'spring',
      damping: 15,
      stiffness: 200,
    },
  },
};

interface RateMovieModalProps {
  booking: Booking | null;
  onClose: () => void;
}

const RateMovieModal: React.FC<RateMovieModalProps> = ({ booking, onClose }) => {
  const [movieRating, setMovieRating] = useState(0);
  const [theaterRating, setTheaterRating] = useState(0);
  const [movieHoverRating, setMovieHoverRating] = useState(0);
  const [theaterHoverRating, setTheaterHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const rateMutation = useMutation({
    mutationFn: ({
      movieId,
      theaterId,
      movieRating,
      theaterRating,
      review,
    }: {
      movieId: string;
      theaterId: string;
      movieRating: number;
      theaterRating: number;
      review: string;
    }) =>
      BookingService.rateMovie(
        movieId,
        theaterId,
        movieRating,
        theaterRating,
        review
      ),
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(onClose, 2000);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to submit rating. Please try again.';
      toast.error(errorMessage, { duration: 4000 });
      console.error('Rate movie error:', error);
    },
  });

  const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setReview(value);

    if (value.length > 500) {
      setReviewError('Review must be less than 500 characters');
    } else if (value.trim().length < 10) {
      setReviewError('Review must be at least 10 characters long');
    } else {
      setReviewError('');
    }
  };

  const handleSubmit = () => {
    if (movieRating === 0) return toast.error('Please rate the movie');
    if (theaterRating === 0) return toast.error('Please rate the theater');
    if (review.trim().length < 10)
      return setReviewError('Review must be at least 10 characters long');
    if (reviewError) return;
    if (!booking?.movieId || !booking?.theaterId)
      return toast.error('Invalid booking data');

    rateMutation.mutate({
      movieId: booking.movieId,
      theaterId: booking.theaterId,
      movieRating,
      theaterRating,
      review: review.trim(),
    });
  };

  const StarRating = ({
    rating,
    hoverRating,
    onRate,
    onHover,
    onLeave,
    size = 8,
  }: {
    rating: number;
    hoverRating: number;
    onRate: (value: number) => void;
    onHover: (value: number) => void;
    onLeave: () => void;
    size?: number;
  }) => (
    <div className="flex justify-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className="relative">
          <motion.div
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={onLeave}
            className="cursor-pointer"
          >
            <Star
              className={`w-${size} h-${size} ${
                (hoverRating || rating) >= star
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 fill-gray-300'
              }`}
            />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRate(star - 0.5)}
            onMouseEnter={() => onHover(star - 0.5)}
            onMouseLeave={onLeave}
            className="absolute top-0 left-0 w-1/2 overflow-hidden cursor-pointer"
          >
            <Star
              className={`w-${size} h-${size} ${
                (hoverRating || rating) >= star - 0.5
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 fill-gray-300'
              }`}
            />
          </motion.div>
        </div>
      ))}
    </div>
  );

  if (!booking) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-100 p-3"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white/95 rounded-2xl p-4 max-w-md w-full shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              variants={successVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center justify-center py-10"
            >
              <CheckCircle className="w-14 h-14 text-green-500" />
              <h2 className="text-xl font-bold text-gray-900 mt-4">
                Review Added Successfully!
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Thank you for your feedback.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {/* Header */}
              <motion.div variants={itemVariants} className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                    <Film className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Rate Your Experience
                    </h2>
                    <p className="text-gray-600 text-sm">{booking.movieTitle}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-1.5"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {/* Movie Rating & Review Combined */}
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-orange-500" />
                  <h3 className="text-base font-semibold text-gray-800">
                    Rate & Review the Movie
                  </h3>
                  <span className="text-red-500">*</span>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 space-y-2">
                  <StarRating
                    rating={movieRating}
                    hoverRating={movieHoverRating}
                    onRate={setMovieRating}
                    onHover={setMovieHoverRating}
                    onLeave={() => setMovieHoverRating(0)}
                  />
                  <p className="text-center text-sm text-gray-600">
                    {movieRating > 0 ? (
                      <span className="text-orange-600">
                        You rated: {movieRating} / 5{' '}
                        {movieRating >= 4
                          ? '🎉'
                          : movieRating >= 3
                          ? '👍'
                          : movieRating >= 2
                          ? '👌'
                          : '😕'}
                      </span>
                    ) : (
                      'Please rate the movie'
                    )}
                  </p>
                  <textarea
                    value={review}
                    onChange={handleReviewChange}
                    placeholder="Share your thoughts..."
                    rows={3}
                    maxLength={500}
                    className={`w-full p-2 rounded-md border text-sm resize-none focus:outline-none transition-all ${
                      reviewError
                        ? 'border-red-300 bg-red-50 focus:border-red-500'
                        : 'border-gray-200 focus:border-green-400'
                    }`}
                  />
                  <div className="text-right text-xs text-gray-400">
                    {review.length}/500
                  </div>
                  {reviewError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs"
                    >
                      ⚠️ {reviewError}
                    </motion.p>
                  )}
                </div>
              </motion.div>

              {/* Theater Rating Section */}
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-semibold text-gray-800">
                    Rate the Theater
                  </h3>
                  <span className="text-red-500">*</span>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <StarRating
                    rating={theaterRating}
                    hoverRating={theaterHoverRating}
                    onRate={setTheaterRating}
                    onHover={setTheaterHoverRating}
                    onLeave={() => setTheaterHoverRating(0)}
                    size={7}
                  />
                  <p className="text-center text-sm text-gray-600 mt-2">
                    {theaterRating > 0 ? (
                      <span className="text-blue-600">
                        Theater rating: {theaterRating} / 5
                      </span>
                    ) : (
                      `Please rate the experience at ${booking.theater}`
                    )}
                  </p>
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex justify-center gap-3 pt-1"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium shadow hover:border-gray-400"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={
                    movieRating === 0 ||
                    theaterRating === 0 ||
                    review.trim().length < 10 ||
                    rateMutation.isPending ||
                    !!reviewError
                  }
                  className="bg-green-500 text-white px-5 py-2 rounded-lg font-medium shadow hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {rateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Star className="w-4 h-4" />
                  )}
                  Submit
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default RateMovieModal;
