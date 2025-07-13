import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Star,
  Download,
  Share2,
  ArrowLeft,
  BookOpen,
  Film,
  Copy,
  Check,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { BookingService } from '../../services/User/bookingApi';
import { CreateBookingResponse, BookingData } from '../../types/bookingResponse';
import Loader from '../../components/Shared/Loading';

const BookingSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [ticketAnimation, setTicketAnimation] = useState(false);
  const [checkmarkAnimation, setCheckmarkAnimation] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showDownloadToast, setShowDownloadToast] = useState<string | null>(null);
  const [showShareToast, setShowShareToast] = useState<string | null>(null);

  // Fetch booking data
  const { data: bookingData, isLoading, error } = useQuery<BookingData>({
    queryKey: ['booking', id],
    queryFn: async () => {
      if (!id) throw new Error('Booking ID is missing');
      const data: CreateBookingResponse = await BookingService.findBookingById(id);

      return {
        bookingId: data.bookingId,
        transactionId: data.payment.paymentId,
        movie: {
          id: data.showId.movieId._id,
          name: data.showId.movieId.name,
          poster: data.showId.movieId.poster,
          genre: data.showId.movieId.genre,
          rating: data.showId.movieId.rating,
          duration: {
            hours: data.showId.movieId.duration.hours,
            minutes: data.showId.movieId.duration.minutes,
            seconds: data.showId.movieId.duration.seconds || 0,
          },
          language: data.showId.movieId.language,
          certification: 'UA',
        },
        theater: {
          name: data.showId.theaterId.name,
          screen: 'Screen 1', // TODO: Replace with actual screen name
          city: data.showId.theaterId.location.city,
        },
        showtime: {
          date: data.showId.showDate,
          time: new Date(data.showId.startTime).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          day: new Date(data.showId.showDate).toLocaleDateString('en-US', { weekday: 'long' }),
        },
        seats: data.bookedSeatsId.map((seat) => ({
          number: seat.number, // Extract the 'number' property from the seat object
        })),
        pricing: {
          ticketPrice: data.subTotal,
          convenienceFee: data.convenienceFee,
          taxes: 0, // TODO: Update if taxes are provided
          total: data.totalAmount,
        },
        user: {
          name: data.userId.name,
          email: data.userId.email,
          phone: data.userId.phone.toString(),
        },
        paymentMethod: data.payment.method.charAt(0).toUpperCase() + data.payment.method.slice(1),
        bookingTime: data.createdAt,
        qrCode: data.qrCode,
      };
    },
    enabled: !!id,
    retry: 1,
  });

  // Convert image to base64
  const getImageAsBase64 = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Failed to fetch image');
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return '';
    }
  };

  // Generate modern PDF ticket
  const generatePDF = async (): Promise<Blob> => {
    if (!bookingData) throw new Error('Booking data not available');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();

    // Header with gradient effect (Green to Emerald - matching success header)
    pdf.setFillColor(34, 197, 94); // Green-500
    pdf.rect(0, 0, pageWidth, 50, 'F');
    pdf.setFillColor(16, 185, 129); // Emerald-600
    pdf.rect(0, 0, pageWidth, 30, 'F');

    // Success checkmark circle background
    pdf.setFillColor(255, 255, 255, 0.2); // White with opacity
    pdf.circle(pageWidth / 2, 20, 8, 'F');

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Booking Confirmed!', pageWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Your movie tickets have been successfully booked', pageWidth / 2, 25, { align: 'center' });

    // Booking ID section with yellow/orange gradient (matching ticket header)
    pdf.setFillColor(251, 191, 36); // Yellow-400
    pdf.roundedRect(15, 40, pageWidth - 30, 18, 5, 5, 'F');
    pdf.setFillColor(249, 115, 22); // Orange-500 overlay
    pdf.roundedRect(15, 40, (pageWidth - 30) * 0.7, 18, 5, 5, 'F');
    
    pdf.setTextColor(0, 0, 0); // Black text on yellow/orange
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('M-Ticket', 20, 47);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Booking ID: ${bookingData.bookingId}`, 20, 54);
    
    // Total amount on the right side of booking ID section
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Total Amount', pageWidth - 50, 47);
    pdf.setFontSize(16);
    pdf.text(`₹${bookingData.pricing.total}`, pageWidth - 50, 54);

    let yPosition = 75;

    // Movie Information Section with white background and shadow effect
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(15, yPosition, pageWidth - 30, 55, 8, 8, 'F');
    
    // Add subtle border
    pdf.setDrawColor(229, 231, 235); // Gray-200
    pdf.setLineWidth(0.5);
    pdf.roundedRect(15, yPosition, pageWidth - 30, 55, 8, 8, 'S');

    pdf.setTextColor(17, 24, 39); // Gray-900
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Movie Details', 20, yPosition + 12);

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(bookingData.movie.name, 20, yPosition + 24);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99); // Gray-600
    pdf.text(`Genre: ${bookingData.movie.genre.join(', ')}`, 20, yPosition + 32);
    pdf.text(`Duration: ${formatDuration(bookingData.movie.duration)}`, 20, yPosition + 39);
    pdf.text(`Language: ${bookingData.movie.language}`, 20, yPosition + 46);
    
    // Rating with star
    pdf.setTextColor(234, 179, 8); // Yellow-500 for star
    pdf.text('Rating', 120, yPosition + 32);
    pdf.setTextColor(75, 85, 99);
    pdf.text(`${bookingData.movie.rating}`, 128, yPosition + 32);
    pdf.text(`Certification: ${bookingData.movie.certification}`, 120, yPosition + 39);

    // Add movie poster if available
    if (bookingData.movie.poster) {
      try {
        const posterBase64 = await getImageAsBase64(bookingData.movie.poster);
        if (posterBase64) {
          pdf.addImage(posterBase64, 'PNG', pageWidth - 50, yPosition + 5, 30, 45);
        }
      } catch (error) {
        console.error('Error adding movie poster to PDF:', error);
      }
    }

    yPosition += 70;

    // Theater & Show Information with blue gradient background (matching show details section)
    pdf.setFillColor(239, 246, 255); // Blue-50
    pdf.roundedRect(15, yPosition, pageWidth - 30, 65, 8, 8, 'F');
    
    // Add blue border
    pdf.setDrawColor(147, 197, 253); // Blue-300
    pdf.setLineWidth(1);
    pdf.roundedRect(15, yPosition, pageWidth - 30, 65, 8, 8, 'S');

    pdf.setTextColor(17, 24, 39);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Show Details', 20, yPosition + 12);

    // Theater name with blue accent
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(bookingData.theater.name, 20, yPosition + 24);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text(`${bookingData.theater.screen} | ${bookingData.theater.city}`, 20, yPosition + 32);

    // Show Date & Time with icons
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(37, 99, 235); // Blue-600
    pdf.text('Show Date:', 20, yPosition + 44);
    pdf.setTextColor(17, 24, 39);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatDate(bookingData.showtime.date), 50, yPosition + 44);

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text('Show Time:', 20, yPosition + 52);
    pdf.setTextColor(17, 24, 39);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(bookingData.showtime.time, 50, yPosition + 52);

    yPosition += 80;

    // Seats Section with gray background
    pdf.setFillColor(249, 250, 251); // Gray-50
    pdf.roundedRect(15, yPosition, pageWidth - 30, 30, 8, 8, 'F');
    
    pdf.setTextColor(17, 24, 39);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Selected Seats', 20, yPosition + 12);
    
    const seatsText = bookingData.seats.map((seat) => seat.number).join(', ');
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55); // Gray-800
    pdf.text(seatsText, 20, yPosition + 22);

    yPosition += 45;

    // Pricing Section with green background
    pdf.setFillColor(240, 253, 244); // Green-50
    pdf.roundedRect(15, yPosition, pageWidth - 30, 45, 8, 8, 'F');
    
    // Green border
    pdf.setDrawColor(34, 197, 94); // Green-500
    pdf.setLineWidth(1);
    pdf.roundedRect(15, yPosition, pageWidth - 30, 45, 8, 8, 'S');

    pdf.setTextColor(17, 24, 39);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pricing Details', 20, yPosition + 12);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text('Ticket Price:', 20, yPosition + 22);
    pdf.text(`₹${bookingData.pricing.ticketPrice}`, 65, yPosition + 22);
    pdf.text('Convenience Fee:', 20, yPosition + 30);
    pdf.text(`₹${bookingData.pricing.convenienceFee}`, 65, yPosition + 30);
    
    // Total amount with green color
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(17, 24, 39);
    pdf.text('Total Amount:', 120, yPosition + 22);
    pdf.setTextColor(34, 197, 94); // Green-500
    pdf.setFontSize(18);
    pdf.text(`₹${bookingData.pricing.total}`, 165, yPosition + 22);

    yPosition += 60;

    // QR Code Section with white background and blue accents
    if (bookingData.qrCode) {
      try {
        const qrCodeBase64 = await getImageAsBase64(bookingData.qrCode);
        if (qrCodeBase64) {
          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(15, yPosition, pageWidth - 30, 50, 8, 8, 'F');
          
          // Blue border for QR section
          pdf.setDrawColor(37, 99, 235); // Blue-600
          pdf.setLineWidth(1);
          pdf.roundedRect(15, yPosition, pageWidth - 30, 50, 8, 8, 'S');
          
          pdf.setTextColor(17, 24, 39);
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text('📱 Scan at Cinema', 20, yPosition + 12);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(75, 85, 99);
          pdf.text('Show this QR code at the cinema entrance for quick entry', 20, yPosition + 20);
          
          // QR code with gray background
          pdf.setFillColor(249, 250, 251); // Gray-50
          pdf.roundedRect(pageWidth - 55, yPosition + 8, 35, 35, 3, 3, 'F');
          pdf.addImage(qrCodeBase64, 'PNG', pageWidth - 52, yPosition + 11, 30, 30);
        }
      } catch (error) {
        console.error('Error adding QR code to PDF:', error);
      }
    }

    yPosition += 65;

    // Decorative perforation line
    pdf.setDrawColor(209, 213, 219); // Gray-300
    pdf.setLineWidth(0.5);
    for (let i = 15; i < pageWidth - 15; i += 4) {
      pdf.line(i, yPosition, i + 2, yPosition);
    }

    yPosition += 10;

    // Footer with dark background (matching original footer style)
    pdf.setFillColor(31, 41, 55); // Gray-800
    pdf.roundedRect(15, yPosition, pageWidth - 30, 30, 8, 8, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Transaction ID: ${bookingData.transactionId}`, 20, yPosition + 10);
    pdf.text(`Booked on: ${new Date(bookingData.bookingTime).toLocaleString('en-IN')}`, 20, yPosition + 18);
    pdf.text(`Customer: ${bookingData.user.name} | ${bookingData.user.email}`, 20, yPosition + 26);

    // Decorative corner elements
    pdf.setFillColor(251, 191, 36); // Yellow-400
    pdf.circle(25, 25, 3, 'F');
    pdf.setFillColor(249, 115, 22); // Orange-500
    pdf.circle(pageWidth - 25, 25, 3, 'F');

    return pdf.output('blob');
  };

  // Handle all toast notifications in useEffect
  useEffect(() => {
    if (showCopyToast) {
      toast.success('Booking ID copied!');
      setShowCopyToast(false);
    }
  }, [showCopyToast]);

  useEffect(() => {
    if (showDownloadToast) {
      if (showDownloadToast === 'success') {
        toast.success('Ticket PDF downloaded successfully!');
      } else {
        toast.error('Failed to download ticket. Please try again.');
      }
      setShowDownloadToast(null);
    }
  }, [showDownloadToast]);

  useEffect(() => {
    if (showShareToast) {
      if (showShareToast === 'shared') {
        toast.success('Ticket PDF shared successfully!');
      } else if (showShareToast === 'downloaded') {
        toast.success('Ticket PDF downloaded as sharing is not supported.');
      } else {
        toast.error('Failed to share ticket. Ticket downloaded instead.');
      }
      setShowShareToast(null);
    }
  }, [showShareToast]);

  useEffect(() => {
    setTimeout(() => setCheckmarkAnimation(true), 200);
    setTimeout(() => setTicketAnimation(true), 800);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (duration: { hours: number; minutes: number; seconds?: number }) => {
    return `${duration.hours}h ${duration.minutes}m`;
  };

  const handleDownloadTicket = useCallback(async () => {
    try {
      setDownloading(true);
      const pdfBlob = await generatePDF();
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `movie-ticket-${bookingData?.bookingId || 'ticket'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShowDownloadToast('success');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      setShowDownloadToast('error');
    } finally {
      setDownloading(false);
    }
  }, [bookingData]);

  const handleShare = useCallback(async () => {
    try {
      setSharing(true);
      const pdfBlob = await generatePDF();
      const file = new File([pdfBlob], `movie-ticket-${bookingData?.bookingId || 'ticket'}.pdf`, {
        type: 'application/pdf',
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Movie Ticket',
          text: `Movie ticket for ${bookingData?.movie.name || 'your movie'}`,
          files: [file],
        });
        setShowShareToast('shared');
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `movie-ticket-${bookingData?.bookingId || 'ticket'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setShowShareToast('downloaded');
      }
    } catch (error) {
      console.error('Error sharing ticket:', error);
      try {
        const pdfBlob = await generatePDF();
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `movie-ticket-${bookingData?.bookingId || 'ticket'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setShowShareToast('error');
      } catch (downloadError) {
        console.error('Error downloading as fallback:', downloadError);
        setShowShareToast('error');
      }
    } finally {
      setSharing(false);
    }
  }, [bookingData]);

  const handleCopyBookingId = useCallback(() => {
    if (bookingData?.bookingId) {
      navigator.clipboard.writeText(bookingData.bookingId).then(() => {
        setCopied(true);
        setShowCopyToast(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [bookingData?.bookingId]);

  if (isLoading) {
    return <div className="text-center py-10"><Loader/></div>;
  }

  if (error || !bookingData) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load booking details';
    toast.error(errorMessage);
    return <div className="text-center py-10 text-red-600">{errorMessage}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 transition-all duration-1000 ${
              checkmarkAnimation ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            }`}
          >
            <CheckCircle
              className={`w-10 h-10 text-white transition-all duration-700 delay-300 ${
                checkmarkAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            />
          </div>
          <h1 className="text-4xl font-black mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-green-100 mb-4">Your movie tickets have been successfully booked</p>
          <div className="flex items-center justify-center gap-2 bg-white/20 px-4 py-2 rounded-full inline-flex">
            <span className="text-sm font-medium">Booking ID:</span>
            <span className="font-bold text-base">{bookingData.bookingId}</span>
            <button onClick={handleCopyBookingId} className="ml-1 p-1 hover:bg-white/20 rounded">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Virtual Ticket */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-10">
        <div
          ref={ticketRef}
          className={`bg-white rounded-xl shadow-xl overflow-hidden transform transition-all duration-1000 ${
            ticketAnimation ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
          }`}
        >
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">M-Ticket</h2>
                  <p className="text-yellow-100 text-sm">Booking ID: {bookingData.bookingId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-yellow-100 text-sm">Total Amount</p>
                <p className="text-3xl font-bold text-white">₹{bookingData.pricing.total}</p>
              </div>
            </div>
          </div>

          {/* Main Ticket Content */}
          <div className="p-6">
            {/* Movie Details Section */}
            <div className="mb-6">
              <div className="flex gap-4 mb-4">
                <img
                  src={bookingData.movie.poster}
                  alt={bookingData.movie.name}
                  className="w-32 h-44 object-cover rounded-lg shadow-md flex-shrink-0"
                  crossOrigin="anonymous"
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{bookingData.movie.name}</h3>
                    <div className="flex items-center gap-3 text-gray-600 mb-2">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                        {bookingData.movie.certification}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="font-semibold text-base">{bookingData.movie.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-base font-medium">{bookingData.movie.genre.join(' • ')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span className="text-base font-medium">{formatDuration(bookingData.movie.duration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Film className="w-5 h-5 text-gray-500" />
                      <span className="text-base font-medium">{bookingData.movie.language}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Theater & Show Details Section */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  Show Details
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadTicket}
                    disabled={downloading}
                    className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-2 rounded-full transition-all duration-200 shadow-sm hover:scale-105"
                    title="Download PDF Ticket"
                  >
                    <Download className={`w-4 h-4 ${downloading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={sharing}
                    className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-2 rounded-full transition-all duration-200 shadow-sm hover:scale-105"
                    title="Share PDF Ticket"
                  >
                    <Share2 className={`w-4 h-4 ${sharing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  <div className="bg-white rounded-lg px-5 py-2.5 shadow-sm">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-gray-900 text-lg">{bookingData.theater.name}</h4>
                      <div className="bg-blue-100 px-3 py-1 rounded-full">
                        <span className="text-blue-800 font-semibold text-sm">{bookingData.theater.screen}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-0">{bookingData.theater.city}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900">{formatDate(bookingData.showtime.date)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900 text-xl">{bookingData.showtime.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white flex items-center rounded-lg p-4 shadow-sm">
                    <p className="text-gray-500 text-sm mb-2 me-3">Selected Seats:</p>
                    <div className="flex flex-wrap gap-2">
                      {bookingData.seats.map((seat, index) => (
                        <span
                          key={index}
                          className="bg-gray-300 text-black font-semibold px-3 py-1 rounded-lg text-sm"
                        >
                          {seat.number}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-center w-full">
                    <p className="text-gray-500 text-sm mb-3">Scan at Cinema</p>
                    <div className="bg-gray-100 py-3 rounded-lg mb-3">
                      <img
                        src={bookingData.qrCode}
                        alt="QR Code"
                        className="w-24 h-24 mx-auto"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Show this QR code at the cinema entrance for quick entry
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Perforation Effect */}
          <div className="relative">
            <div className="absolute inset-x-0 top-0 flex justify-center">
              <div className="w-full h-2 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50"></div>
            </div>
            <div className="flex justify-center">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-gray-200 rounded-full -mt-1 -ml-1 first:ml-0"></div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 text-center space-y-1">
            <p className="text-gray-600 text-sm font-medium">Transaction ID: {bookingData.transactionId}</p>
            <p className="text-gray-500 text-xs">
              Booked on {new Date(bookingData.bookingTime).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <button
            onClick={() => navigate('/account/bookings-tab')}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-bold py-3 px-8 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <BookOpen className="w-5 h-5" />
            My Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;