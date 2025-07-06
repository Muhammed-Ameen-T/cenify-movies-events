import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit3,
  Crown,
  X,
} from 'lucide-react';
import screenDummy from '../../assets/screen.png';
import { fetchSeatSelection, selectSeats } from '../../services/User/seatSelectionApi';
import { socket } from '../../config/socket.config';
import { SeatDTO, SeatSelectionResponseDTO } from '../../types/seatSelection';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/User/SeatSelectionModal';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Loader from '../../components/Shared/Loading';

const vehicleImages = {
  1: '🚴‍♂️',
  2: '🛵',
  3: '🛺',
  4: '🚗',
  5: '🚙',
  6: '🚙',
  7: '🚙',
  8: '🚐',
  9: '🚐',
  10: '🚌',
};

const TheaterSeatSelection: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showSeatCountModal, setShowSeatCountModal] = useState(true);
  const [selectedSeatCount, setSelectedSeatCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [anchorSeat, setAnchorSeat] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Fetch seat data
  const { data, isLoading, error } = useQuery<SeatSelectionResponseDTO>({
    queryKey: ['seatSelection', showId],
    queryFn: () => fetchSeatSelection(showId!),
    enabled: !!showId,
    onSuccess: (data) => {
      console.log('Fetched seat IDs:', data.seats.map((s) => s.id));
    },
  });
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Seat selection mutation
  const selectSeatsMutation = useMutation({
    mutationFn: ({ showId, seatIds }: { showId: string; seatIds: string[] }) =>
      selectSeats(showId, seatIds),
    onSuccess: (response) => {
      localStorage.setItem('selectedSeats', JSON.stringify(response.selectedSeats));
      localStorage.setItem(`timerStart_${showId}`, Date.now().toString());
      console.log(`Set timerStart_${showId} for navigation to checkout`);
      navigate(`/checkout/${showId}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to select seats', { id: 'select-seats-error' });
    },
  });

  // Socket.IO setup (unchanged)
  useEffect(() => {
    if (!showId) return;

    let hasJoinedRoom = false;

    const joinRoom = () => {
      if (!hasJoinedRoom && socket.connected) {
        socket.emit('joinShowRoom', showId);
        console.log(`Emitted joinShowRoom for showId: ${showId}, socket: ${socket.id}`);
        hasJoinedRoom = true;
      }
    };

    if (!socket.connected) {
      console.log('Socket not connected, attempting to connect');
      socket.connect();
    } else {
      joinRoom();
    }

    socket.on('connect', () => {
      console.log(`Socket connected: ${socket.id}`);
      joinRoom();
    });

    socket.on('joinedShowRoom', (data) => {
      console.log('Joined room:', data);
    });

    socket.on('seatUpdate', ({ seatIds, status }: { seatIds: string[]; status: 'pending' | 'booked' | 'available' }) => {
      console.log('Received seatUpdate:', { seatIds, status });
      queryClient.setQueryData(['seatSelection', showId], (oldData: SeatSelectionResponseDTO | undefined) => {
        if (!oldData) return oldData;
        const updatedSeats = oldData.seats.map((seat) =>
          seatIds.includes(seat.id) ? { ...seat, status } : seat
        );
        console.log('Updated seats:', updatedSeats.filter((s) => seatIds.includes(s.id)));
        return { ...oldData, seats: updatedSeats };
      });
      queryClient.invalidateQueries(['seatSelection', showId]);
    });

    socket.on('error', ({ message }: { message: string }) => {
      console.error('Socket error:', message);
      toast.error(message);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connect_error:', error.message);
      hasJoinedRoom = false;
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      hasJoinedRoom = false;
    });

    return () => {
      socket.off('connect');
      socket.off('joinedShowRoom');
      socket.off('seatUpdate');
      socket.off('error');
      socket.off('connect_error');
      socket.off('disconnect');
      if (socket.connected) {
        socket.emit('leaveShowRoom', showId);
        console.log(`Emitted leaveShowRoom for showId: ${showId}`);
      }
    };
  }, [showId, queryClient]);

  // Scroll effect (unchanged)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Convert seats to row-based structure, sorted A-Z
  const seatsByRow = data?.seats.reduce((acc, seat) => {
    const row = String.fromCharCode(65 + seat.position.row); // A, B, C, ...
    acc[row] = acc[row] || { Regular: [], Premium: [], VIP: [] };
    acc[row][seat.type].push(seat);
    return acc;
  }, {} as Record<string, { Regular: SeatDTO[]; Premium: SeatDTO[]; VIP: SeatDTO[] }>) || {};

  // Sort seats within each type by column
  Object.values(seatsByRow).forEach((row) => {
    row.Regular.sort((a, b) => a.position.col - b.position.col);
    row.Premium.sort((a, b) => a.position.col - b.position.col);
    row.VIP.sort((a, b) => a.position.col - b.position.col);
  });

  // Determine dominant seat type per row
  const getDominantSeatType = (row: { Regular: SeatDTO[]; Premium: SeatDTO[]; VIP: SeatDTO[] }): string => {
    const typeCounts = {
      Regular: row.Regular.length,
      Premium: row.Premium.length,
      VIP: row.VIP.length,
    };
    return Object.keys(typeCounts).reduce((a, b) => (typeCounts[a] >= typeCounts[b] ? a : b), 'Regular');
  };

  // Get section info based on seat type
  const getSectionInfo = (seatType: string): { name: string; price: number; color: string } => {
    if (!data?.seatLayout.seatPrices) return { name: 'Regular', price: 0, color: 'text-gray-700' };

    switch (seatType) {
      case 'Premium':
        return {
          name: 'Premium',
          price: data.seatLayout.seatPrices.premium,
          color: 'text-blue-600',
        };
      case 'VIP':
        return {
          name: 'VIP',
          price: data.seatLayout.seatPrices.vip,
          color: 'text-purple-600',
        };
      default:
        return {
          name: 'Regular',
          price: data.seatLayout.seatPrices.regular,
          color: 'text-gray-700',
        };
    }
  };

  // Get rows with dominant types and seat groups
  const getRowsWithSeatTypes = () => {
    const rows = Object.keys(seatsByRow)
      .sort() // Sort rows A-Z
      .map((rowKey) => ({
        key: rowKey,
        dominantType: getDominantSeatType(seatsByRow[rowKey]),
        seatGroups: [
          { type: 'Regular', seats: seatsByRow[rowKey].Regular },
          { type: 'Premium', seats: seatsByRow[rowKey].Premium },
          { type: 'VIP', seats: seatsByRow[rowKey].VIP },
        ].filter((group) => group.seats.length > 0), // Only include non-empty groups
      }));

    // Determine when to show section info (only for the first row of a group with the same dominant type)
    return rows.map((row, index) => ({
      ...row,
      showSectionInfo: index === 0 || row.dominantType !== rows[index - 1].dominantType,
    }));
  };

  // Seat selection logic (unchanged)
  const findOptimalSeats = (clickedSeatId: string, neededCount: number): string[] => {
    if (neededCount <= 1) return [];
    const allSeats = data?.seats || [];
    const clickedSeat = allSeats.find((s) => s.id === clickedSeatId);
    if (!clickedSeat) return [];

    const clickedRow = clickedSeat.position.row;
    const sameRowSeats = allSeats
      .filter(
        (s) => s.position.row === clickedRow && s.status === 'available' && s.id !== clickedSeatId
      )
      .sort(
        (a, b) =>
          Math.abs(a.position.col - clickedSeat.position.col) -
          Math.abs(b.position.col - clickedSeat.position.col)
      );

    if (sameRowSeats.length >= neededCount - 1) {
      return sameRowSeats.slice(0, neededCount - 1).map((s) => s.id);
    }

    const result = sameRowSeats.map((s) => s.id);
    let remainingCount = neededCount - 1 - sameRowSeats.length;

    const rowIndices = Array.from({ length: data?.seatLayout.rowCount || 0 }, (_, i) => i)
      .filter((i) => i !== clickedRow)
      .sort((a, b) => Math.abs(a - clickedRow) - Math.abs(b - clickedRow));

    for (const rowIndex of rowIndices) {
      if (remainingCount <= 0) break;
      const availableSeats = allSeats
        .filter((s) => s.position.row === rowIndex && s.status === 'available')
        .sort(
          (a, b) =>
            Math.abs(a.position.col - clickedSeat.position.col) -
            Math.abs(b.position.col - clickedSeat.position.col)
        );
      const seatsToTake = availableSeats.slice(0, remainingCount);
      result.push(...seatsToTake.map((s) => s.id));
      remainingCount -= seatsToTake.length;
    }

    return result;
  };

  const getSeatById = (seatId: string): SeatDTO | undefined => {
    return data?.seats.find((s) => s.id === seatId);
  };

  const getSeatStatusColor = (seat: SeatDTO): string => {
    if (selectedSeats.includes(seat.id)) {
      return 'bg-orange-500 border-orange-500 text-white';
    }
    switch (seat.status) {
      case 'booked':
      case 'unavailable':
        return 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed';
      case 'pending':
        return 'bg-yellow-400 border-yellow-400 text-yellow-900 animate-pulse';
      default:
        return 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50';
    }
  };

  const getSeatTypeColor = (seat: SeatDTO): string => {
    switch (seat.type) {
      case 'Premium':
        return 'border-blue-300 text-blue-600';
      case 'VIP':
        return 'border-purple-300 text-purple-600';
      default:
        return 'border-gray-300 text-gray-600';
    }
  };

  const handleSeatClick = (seat: SeatDTO) => {
    if (seat.status === 'booked' || seat.status === 'unavailable' || seat.status === 'pending') return;

    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats((prev) => prev.filter((id) => id !== seat.id));
      if (anchorSeat === seat.id) {
        setAnchorSeat(null);
      }
      return;
    }

    if (selectedSeats.length === 0) {
      setAnchorSeat(seat.id);
      const optimalSeats = findOptimalSeats(seat.id, selectedSeatCount);
      setSelectedSeats([seat.id, ...optimalSeats].slice(0, selectedSeatCount));
      return;
    }

    if (selectedSeats.length >= selectedSeatCount) {
      setAnchorSeat(seat.id);
      const optimalSeats = findOptimalSeats(seat.id, selectedSeatCount);
      setSelectedSeats([seat.id, ...optimalSeats].slice(0, selectedSeatCount));
      return;
    }

    setSelectedSeats((prev) => [...prev, seat.id].slice(0, selectedSeatCount));
  };

  const getTotalPrice = (): number => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = getSeatById(seatId);
      return total + (seat ? seat.price : 0);
    }, 0);
  };

  const needsCrown = (seat: SeatDTO, dominantType: string): boolean => {
    return seat.type !== dominantType;
  };

  const getCrownColor = (seat: SeatDTO): string => {
    switch (seat.type) {
      case 'Regular':
        return 'text-[#FFD700]'; // Gold
      case 'Premium':
        return 'text-[#3B82F6]'; // Blue
      case 'VIP':
        return 'text-[#7C3AED]'; // Violet
      default:
        return 'text-[#FFD700]';
    }
  };

  const handlePay = () => {
    if (selectedSeats.length === selectedSeatCount && showId) {
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmBooking = () => {
    if (showId) {
      selectSeatsMutation.mutate({ showId, seatIds: selectedSeats });
    }
    setShowConfirmationModal(false);
  };

  const handleCancelBooking = () => {
    setShowConfirmationModal(false);
  };

  const SeatCountModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-lg">
        <h2 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          How many seats?
        </h2>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-1 bg-gray-0 rounded-xl">
            <div className="text-9xl">{vehicleImages[selectedSeatCount]}</div>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
            <button
              key={count}
              onClick={() => setSelectedSeatCount(count)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                selectedSeatCount === count
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-lg font-bold text-gray-900">{count}</div>
            </button>
          ))}
        </div>
        {data?.seatLayout.seatPrices && (
          <div className="bg-transparent rounded-lg p-0 mb-5">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <div className="text-sm font-medium text-gray-600">Regular</div>
                <div className="text-lg font-bold text-gray-900">Rs.{data.seatLayout.seatPrices.regular}</div>
                <div className="text-green-600 text-xs">Available</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <div className="text-sm font-medium text-blue-600">Premium</div>
                <div className="text-lg font-bold text-gray-900">Rs.{data.seatLayout.seatPrices.premium}</div>
                <div className="text-green-600 text-xs">Available</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <div className="text-sm font-medium text-purple-600">VIP</div>
                <div className="text-lg font-bold text-gray-900">Rs.{data.seatLayout.seatPrices.vip}</div>
                <div className="text-green-600 text-xs">Available</div>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowSeatCountModal(false)}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Select Seats
        </button>
      </div>
    </div>
  );

  if (isLoading) return <div className="text-center py-10"><Loader /></div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error.message}</div>;
  if (!data) return <div className="text-center py-10">No data available</div>;

  const rowsWithSeatTypes = getRowsWithSeatTypes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {showSeatCountModal && <SeatCountModal />}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onConfirm={handleConfirmBooking}
        onCancel={handleCancelBooking}
      />
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/show-selection/${data.showDetails.movieId}`)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{data.showDetails.movieTitle}</h1>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{data.showDetails.theaterName}, {data.showDetails.theaterCity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{data.showDetails.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {data.showDetails.time} | {data.showDetails.screenName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-lg">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="font-semibold text-orange-900 text-sm">{selectedSeatCount} Tickets</span>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-1 hover:bg-orange-200 rounded-md transition-colors"
                >
                  <Edit3 className="w-3 h-3 text-orange-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Seat Selection */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 py-1 px-6 mb-24">
          <div className="text-center ml-10 mt-5">
            <div className="relative mx-auto w-full max-w-[190px]">
              <img src={screenDummy} alt="Screen preview" className="w-full h-auto object-contain" />
            </div>
            <p className="text-xs mb-0">All eyes on this way please!</p>
          </div>

          {/* Seat Layout */}
          <div className="space-y-0 mb-5 mt-3">
            {rowsWithSeatTypes.map((rowData) => (
              <div key={rowData.key} className="space-y-2">
                <div className="flex items-center gap-0">
                  <div className="w-10 text-center font-medium text-gray-700 text-sm">{rowData.key}</div>
                  <div className="flex-1">
                    {rowData.seatGroups.map((group) => {
                      const sectionInfo = getSectionInfo(rowData.dominantType);
                      return (
                        <div key={`${rowData.key}-${group.type}`} className="mb-1">
                          {rowData.showSectionInfo && group.type === rowData.dominantType && (
                            <div className="flex items-center w-full mb-0">
                              <span
                                className={`w-[129px] text-xs font-semibold  bg-gray-100 px-3 py-1 rounded-full inline-block text-center truncate`}
                              >
                                Rs. {sectionInfo.price} • {sectionInfo.name}
                              </span>
                              <div className="flex-grow flex  me-10">
                                <div className="w-3/3 h-px bg-gray-200" />
                              </div>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 justify-center">
                            {group.seats.map((seat) => (
                              <button
                                key={seat.id}
                                onClick={() => handleSeatClick(seat)}
                                disabled={
                                  seat.status === 'booked' ||
                                  seat.status === 'unavailable' ||
                                  seat.status === 'pending'
                                }
                                className={`relative w-6 h-6 rounded-sm border-2 text-xs font-semibold transition-all duration-200 hover:scale-105 ${getSeatStatusColor(
                                  seat
                                )} ${
                                  seat.status !== 'booked' &&
                                  seat.status !== 'unavailable' &&
                                  seat.status !== 'pending' &&
                                  !selectedSeats.includes(seat.id)
                                    ? ''
                                    : ''
                                }`}
                              >
                                {needsCrown(seat, rowData.dominantType) && (
                                  <Crown className={`absolute -top-1 -right-1 w-2 h-2 ${getCrownColor(seat)}`} />
                                )}
                                {seat.number.replace(/^\D+/, '')}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Seat Info Legend */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-3 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded"></div>
              <span className="text-xs text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 bg-orange-500 border-2 border-orange-500 rounded"></div>
              <span className="text-xs text-gray-700">Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 bg-gray-300 border-2 border-gray-300 rounded"></div>
              <span className="text-xs text-gray-700">Booked</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 bg-yellow-400 border-2 border-yellow-400 rounded animate-pulse"></div>
              <span className="text-xs text-gray-700">Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="relative w-5 h-5 bg-white border-2 border-blue-300 rounded">
                <Crown className="absolute -top-1 -right-1 w-2 h-2 text-[#3B82F6]" />
              </div>
              <span className="text-xs text-gray-700">Premium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="relative w-5 h-5 bg-white border-2 border-purple-300 rounded">
                <Crown className="absolute -top-1 -right-1 w-2 h-2 text-[#7C3AED]" />
              </div>
              <span className="text-xs text-gray-700">VIP</span>
            </div>
          </div>

          {/* Selected Seats Summary */}
          {selectedSeats.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 mb-3">
              <div className="flex flex-wrap gap-2 mb-0">
                <h4 className="font-bold text-gray-900 text-sm mt-1.5">Selected Seats: </h4>
                {selectedSeats.map((seatId) => {
                  const seat = getSeatById(seatId);
                  return (
                    <div key={seatId} className="bg-white rounded-md px-2 py-1 border border-orange-200">
                      <span className="font-semibold text-gray-900 text-sm">{seat?.number}</span>
                      <span className="text-xs text-gray-600 ml-1">₹{seat?.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Pay Button */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 p-3 transition-all duration-300 z-20 ${
          isScrolled ? 'shadow-lg' : 'shadow-md'
        }`}
      >
        <div className="max-w-md mx-auto">
          <button
            disabled={
              !currentUser ||
              currentUser?.role !== 'user' ||
              selectedSeats.length !== selectedSeatCount ||
              selectSeatsMutation.isPending
            }
            onClick={handlePay}
            className={`w-full py-2 rounded-lg font-semibold text-base transition-all duration-300 ${
              currentUser &&
              currentUser.role === 'user' &&
              selectedSeats.length === selectedSeatCount &&
              !selectSeatsMutation.isPending
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {!currentUser || currentUser.role !== 'user' ? (
              'Please login to continue'
            ) : selectedSeats.length === selectedSeatCount ? (
              <div className="flex items-center justify-center gap-2">
                <span className="bg-white/20 px-1 py-0.5 rounded-md text-xs font-normal">
                  {selectedSeats.length} seats
                </span>
                <span>Pay ₹{getTotalPrice()}</span>
              </div>
            ) : (
              `Select ${selectedSeatCount} Seats to Continue`
            )}
          </button>
        </div>
      </div>

      {/* Edit Seat Count Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Seat Count</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center p-2 bg-gray-0 rounded-lg">
                <div className="text-9xl">{vehicleImages[selectedSeatCount]}</div>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                <button
                  key={count}
                  onClick={() => setSelectedSeatCount(count)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    selectedSeatCount === count
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-gray-900 text-base">{count}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedSeats([]);
                  setShowEditModal(false);
                }}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Update & Reset Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheaterSeatSelection;