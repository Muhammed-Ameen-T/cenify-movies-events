import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Seat, 
  SeatPrice, 
  SeatType, 
  TheaterLayout, 
  SelectedSeats,
  TheaterTemplate
} from './theater.types';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { createNewSeatLayout } from '../../services/Vendor/seatLayoutApi';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface TheaterContextType {
  currentLayout: TheaterLayout | null;
  selectedSeats: SelectedSeats;
  canUndo: boolean;
  canRedo: boolean;
  createNewLayout: (name: string, prices: SeatPrice) => void;
  createFromTemplate: (name: string, prices: SeatPrice, template: TheaterTemplate) => void;
  addSeat: (type: SeatType, row: number, column: number) => void;
  removeSeat: (id: string) => void;
  updateSeatType: (id: string, type: SeatType) => void;
  generateSeatNumber: (row: number, column: number, type: SeatType) => string;
  moveSeats: (seats: Seat[], rowOffset: number, columnOffset: number) => void;
  canAddSeat: (row: number, column: number) => boolean;
  selectSeat: (id: string, addToSelection: boolean) => void;
  clearSelection: () => void;
  deleteSelectedSeats: () => void;
  changeSelectedSeatsType: (type: SeatType) => void;
  bulkSelectSeats: (startRow: number, startCol: number, endRow: number, endCol: number) => void;
  undoAction: () => void;
  redoAction: () => void;
  saveLayout: () => void;
  getSeatAt: (row: number, column: number) => Seat | undefined;
}

interface TheaterProviderProps {
  children: ReactNode;
}

const TheaterContext = createContext<TheaterContextType | undefined>(undefined);

export const useTheater = () => {
  const context = useContext(TheaterContext);
  if (!context) {
    throw new Error('useTheater must be used within TheaterProvider');
  }
  return context;
};

export const TheaterProvider: React.FC<TheaterProviderProps> = ({ children }) => {
  const [currentLayout, setCurrentLayout] = useState<TheaterLayout | null>(null);
  const [history, setHistory] = useState<TheaterLayout[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeats>({});

  const addToHistory = (layout: TheaterLayout) => {
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, layout]);
    setHistoryIndex(newHistory.length);
  };

  const createNewLayout = (name: string, prices: SeatPrice) => {
    const newLayout: TheaterLayout = {
      id: uuidv4(),
      name,
      prices,
      seats: [],
      rowCount: 0,
      columnCount: 0
    };
    setCurrentLayout(newLayout);
    setHistory([newLayout]);
    setHistoryIndex(0);
    setSelectedSeats({});
  };

  const createFromTemplate = (name: string, prices: SeatPrice, template: TheaterTemplate) => {
    const seats: Seat[] = template.seats.map(templateSeat => ({
      id: uuidv4(),
      type: templateSeat.type,
      row: templateSeat.row,
      column: templateSeat.column,
      number: generateSeatNumber(templateSeat.row, templateSeat.column, templateSeat.type)
    }));

    const newLayout: TheaterLayout = {
      id: uuidv4(),
      name,
      prices,
      seats,
      rowCount: template.rows,
      columnCount: template.columns
    };

    setCurrentLayout(newLayout);
    setHistory([newLayout]);
    setHistoryIndex(0);
    setSelectedSeats({});
  };

  const generateSeatNumber = (row: number, column: number, type: SeatType): string => {
    if (type === 'unavailable') {
      return `U${row * 100 + column}`;
    }
    
    // Convert row to letter (A, B, C, ...)
    const rowLabel = String.fromCharCode(65 + row);
    return `${rowLabel}${column + 1}`;
  };

  const canAddSeat = (row: number, column: number): boolean => {
    if (!currentLayout) return false;
    if (row < 0 || column < 0) return false;
    return !currentLayout.seats.some(seat => seat.row === row && seat.column === column);
  };

  const getSeatAt = (row: number, column: number): Seat | undefined => {
    if (!currentLayout) return undefined;
    return currentLayout.seats.find(seat => seat.row === row && seat.column === column);
  };

  const addSeat = (type: SeatType, row: number, column: number) => {
    if (!currentLayout || !canAddSeat(row, column)) return;

    const newSeat: Seat = {
      id: uuidv4(),
      type,
      row,
      column,
      number: generateSeatNumber(row, column, type)
    };

    const updatedLayout = {
      ...currentLayout,
      seats: [...currentLayout.seats, newSeat],
      rowCount: Math.max(currentLayout.rowCount, row + 1),
      columnCount: Math.max(currentLayout.columnCount, column + 1)
    };

    setCurrentLayout(updatedLayout);
    addToHistory(updatedLayout);
  };

  const removeSeat = (id: string) => {
    if (!currentLayout) return;

    const updatedSeats = currentLayout.seats.filter(seat => seat.id !== id);
    
    // Recalculate row and column counts
    const rowCount = updatedSeats.length > 0 
      ? Math.max(...updatedSeats.map(s => s.row)) + 1 
      : 0;
    const columnCount = updatedSeats.length > 0 
      ? Math.max(...updatedSeats.map(s => s.column)) + 1 
      : 0;

    const updatedLayout = {
      ...currentLayout,
      seats: updatedSeats,
      rowCount,
      columnCount
    };

    // Also remove from selected seats
    const updatedSelection = { ...selectedSeats };
    delete updatedSelection[id];
    setSelectedSeats(updatedSelection);

    setCurrentLayout(updatedLayout);
    addToHistory(updatedLayout);
  };

  const updateSeatType = (id: string, type: SeatType) => {
    if (!currentLayout) return;

    const updatedSeats = currentLayout.seats.map(seat => {
      if (seat.id === id) {
        return {
          ...seat,
          type,
          number: generateSeatNumber(seat.row, seat.column, type)
        };
      }
      return seat;
    });

    const updatedLayout = {
      ...currentLayout,
      seats: updatedSeats
    };

    setCurrentLayout(updatedLayout);
    addToHistory(updatedLayout);
  };

  const moveSeats = (seats: Seat[], rowOffset: number, columnOffset: number) => {
    if (!currentLayout) return;

    // Check if any of the moves would conflict with existing seats
    const seatIds = seats.map(s => s.id);
    const otherSeats = currentLayout.seats.filter(s => !seatIds.includes(s.id));
    
    const cantMove = seats.some(seat => {
      const newRow = seat.row + rowOffset;
      const newColumn = seat.column + columnOffset;
      return newRow < 0 || newColumn < 0 || otherSeats.some(s => s.row === newRow && s.column === newColumn);
    });

    if (cantMove) return;

    const updatedSeats = currentLayout.seats.map(seat => {
      if (seatIds.includes(seat.id)) {
        const newRow = seat.row + rowOffset;
        const newColumn = seat.column + columnOffset;
        return {
          ...seat,
          row: newRow,
          column: newColumn,
          number: generateSeatNumber(newRow, newColumn, seat.type)
        };
      }
      return seat;
    });

    const rowCount = Math.max(...updatedSeats.map(s => s.row)) + 1;
    const columnCount = Math.max(...updatedSeats.map(s => s.column)) + 1;

    const updatedLayout = {
      ...currentLayout,
      seats: updatedSeats,
      rowCount,
      columnCount
    };

    setCurrentLayout(updatedLayout);
    addToHistory(updatedLayout);
  };

  const selectSeat = (id: string, addToSelection: boolean) => {
    if (addToSelection) {
      setSelectedSeats(prev => ({
        ...prev,
        [id]: !prev[id] // Toggle selection
      }));
    } else {
      setSelectedSeats({ [id]: true });
    }
  };

  const clearSelection = () => {
    setSelectedSeats({});
  };

  const deleteSelectedSeats = () => {
    if (!currentLayout || Object.keys(selectedSeats).length === 0) return;

    const selectedSeatIds = Object.keys(selectedSeats).filter(id => selectedSeats[id]);
    if (selectedSeatIds.length === 0) return;

    const updatedSeats = currentLayout.seats.filter(seat => !selectedSeatIds.includes(seat.id));
    
    // Recalculate row and column counts
    const rowCount = updatedSeats.length > 0 
      ? Math.max(...updatedSeats.map(s => s.row)) + 1 
      : 0;
    const columnCount = updatedSeats.length > 0 
      ? Math.max(...updatedSeats.map(s => s.column)) + 1 
      : 0;

    const updatedLayout = {
      ...currentLayout,
      seats: updatedSeats,
      rowCount,
      columnCount
    };

    setCurrentLayout(updatedLayout);
    addToHistory(updatedLayout);
    setSelectedSeats({});
  };

  const changeSelectedSeatsType = (type: SeatType) => {
    if (!currentLayout) return;
    
    const selectedSeatIds = Object.keys(selectedSeats).filter(id => selectedSeats[id]);
    if (selectedSeatIds.length === 0) return;

    const updatedSeats = currentLayout.seats.map(seat => {
      if (selectedSeatIds.includes(seat.id)) {
        return {
          ...seat,
          type,
          number: generateSeatNumber(seat.row, seat.column, type)
        };
      }
      return seat;
    });

    const updatedLayout = {
      ...currentLayout,
      seats: updatedSeats
    };

    setCurrentLayout(updatedLayout);
    addToHistory(updatedLayout);
  };

  const bulkSelectSeats = (startRow: number, startCol: number, endRow: number, endCol: number) => {
    if (!currentLayout) return;
    
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    const newSelection: SelectedSeats = {};
    
    currentLayout.seats.forEach(seat => {
      if (
        seat.row >= minRow && 
        seat.row <= maxRow && 
        seat.column >= minCol && 
        seat.column <= maxCol
      ) {
        newSelection[seat.id] = true;
      }
    });
    
    setSelectedSeats(prev => ({
      ...prev,
      ...newSelection
    }));
  };

  const undoAction = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentLayout(history[historyIndex - 1]);
      setSelectedSeats({}); // Clear selection on undo
    }
  };

  const redoAction = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentLayout(history[historyIndex + 1]);
      setSelectedSeats({}); // Clear selection on redo
    }
  };
  const navigate = useNavigate();

  const saveLayoutMutation = useMutation({
    mutationFn: async (layoutData: any) => {
      return await createNewSeatLayout(layoutData);
    },
    onSuccess: () => {
      toast.success('Layout saved successfully!');
      navigate('/vendor/dashboard'); 
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save layout');
    },
  });

  const saveLayout = () => {
    if (!currentLayout) {
      toast.error('No layout to save');
      return;
    }

    // Prepare the data for the backend
    const layoutData = {
      vendorId: '681b657f26fa93092bd8d91c', // Replace with actual vendor ID from auth context
      layoutName: currentLayout.name,
      uuid: currentLayout.id,
      seatPrice: {
        regular: currentLayout.prices.regular,
        premium: currentLayout.prices.premium,
        vip: currentLayout.prices.vip,
      },
      capacity: currentLayout.seats.filter((s) => s.type !== 'unavailable').length,
      seats: currentLayout.seats.map((seat) => ({
        uuid:seat.id,
        number: seat.number,
        type: seat.type.charAt(0).toUpperCase() + seat.type.slice(1), // Capitalize first letter
        price: currentLayout.prices[seat.type === 'unavailable' ? 'regular' : seat.type],
        position: {
          row: seat.row,
          col: seat.column,
        },
      })),
      rowCount: currentLayout.rowCount,
      columnCount: currentLayout.columnCount,
    };

    // Trigger the mutation
    saveLayoutMutation.mutate(layoutData);
  };

  return (
    <TheaterContext.Provider
      value={{
        currentLayout,
        selectedSeats,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        createNewLayout,
        createFromTemplate,
        addSeat,
        removeSeat,
        updateSeatType,
        generateSeatNumber,
        moveSeats,
        canAddSeat,
        selectSeat,
        clearSelection,
        deleteSelectedSeats,
        changeSelectedSeatsType,
        bulkSelectSeats,
        undoAction,
        redoAction,
        saveLayout,
        getSeatAt
      }}
    >
      {children}
    </TheaterContext.Provider>
  );
};

export default TheaterContext;