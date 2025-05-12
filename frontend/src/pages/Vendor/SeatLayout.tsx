import React, { useState, useReducer, useCallback, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
  Save,
  Trash2,
  Undo,
  Redo,
  Layout,
  Edit3,
  Download,
  Moon,
  Sun,
  ChevronDown,
  Grid,
  Monitor,
  Zap,
  FilePlus,
  DollarSign,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { SEAT_TYPES, SeatType } from '../../constants/seatTypes';
import { TEMPLATES, TemplateType } from '../../constants/templates';
import { Seat, PriceEditData } from '../../types/theater';
import { historyReducer, initialState } from '../../utils/historyReducer';
import { generateSeats } from '../../utils/seatGenerator';
import SeatComponent from '../../components/Vendor/ScreenComponent';
import ScreenComponent from '../../components/Vendor/ScreenComponent';
import DraggableSeat from '../../components/Vendor/DraggableSeat';
import PaletteItem from '../../components/Vendor/PaletteItem';
import SeatEditor from '../../components/Vendor/SeatEditor';
import AIModal from '../../components/Vendor/AIModal';
import PriceEditor from '../../components/Vendor/PriceEditor';

interface TheaterLayoutCustomizerProps {
  initialDarkMode: boolean;
  onDarkModeChange: (darkMode: boolean) => void;
}

const TheaterLayoutCustomizer: React.FC<TheaterLayoutCustomizerProps> = ({
  initialDarkMode,
  onDarkModeChange,
}) => {
  const [template, setTemplate] = useState<TemplateType>('EMPTY');
  const [state, dispatch] = useReducer(historyReducer, initialState);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [selectedCols, setSelectedCols] = useState<number[]>([]);
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);
  const [bulkEditType, setBulkEditType] = useState<SeatType | ''>('');
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [draggedSeat, setDraggedSeat] = useState<Seat | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [showPalette, setShowPalette] = useState(true);
  const [draggingNewSeatType, setDraggingNewSeatType] = useState<SeatType | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [nextSeatId, setNextSeatId] = useState(1000);
  const [gridSnap, setGridSnap] = useState(true);

  const layoutRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const initialSeats = generateSeats(template);
    dispatch({ type: 'SET_INITIAL', payload: initialSeats });
  }, [template]);

  useEffect(() => {
    if (state.present) {
      let revenue = 0;
      state.present.forEach(row => {
        if (row) {
          row.forEach(seat => {
            if (seat && !seat.occupied && seat.type !== 'UNAVAILABLE') {
              revenue += seat.price;
            }
          });
        }
      });
      setTotalRevenue(revenue);
    }
  }, [state.present]);

  useEffect(() => {
    onDarkModeChange(darkMode);
  }, [darkMode, onDarkModeChange]);

  const handleSeatClick = useCallback((seat: Seat) => {
    setSelectedSeats(prev => {
      const seatIndex = prev.findIndex(s => s.id === seat.id);
      if (seatIndex >= 0) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        return [...prev, seat];
      }
    });
    setSelectedCols([]);
  }, []);

  const handleSeatRightClick = useCallback((seat: Seat) => {
    setEditingSeat(seat);
    setSelectedSeats([]);
    setSelectedCols([]);
  }, []);

  const handleSaveSeatEdit = useCallback((editedSeat: Seat) => {
    if (!state.present) return;

    let updatedSeats = [...state.present.map(row => (row ? [...row] : []))];
    let foundRow = -1;
    let foundCol = -1;

    for (let i = 0; i < updatedSeats.length; i++) {
      if (!updatedSeats[i]) continue;
      const colIndex = updatedSeats[i].findIndex(s => s?.id === editedSeat.id);
      if (colIndex !== -1) {
        foundRow = i;
        foundCol = colIndex;
        break;
      }
    }

    if (foundRow !== -1 && foundCol !== -1) {
      if (!updatedSeats[foundRow]) updatedSeats[foundRow] = [];
      updatedSeats[foundRow][foundCol] = editedSeat;
      dispatch({ type: 'UPDATE', payload: updatedSeats });
    }

    setEditingSeat(null);
  }, [state.present]);

  const handleSelectColumn = useCallback((colIndex: number) => {
    setSelectedCols(prev => {
      if (prev.includes(colIndex)) {
        return prev.filter(col => col !== colIndex);
      } else {
        return [...prev, colIndex];
      }
    });
    setSelectedSeats([]);
  }, []);

  const handleBulkEdit = useCallback(() => {
    if (!state.present || selectedCols.length === 0 || !bulkEditType) return;

    const newSeats = state.present.map(row =>
      row
        ? row.map(seat =>
            seat && selectedCols.includes(seat.col)
              ? {
                  ...seat,
                  type: bulkEditType as SeatType,
                  price: SEAT_TYPES[bulkEditType as SeatType].price,
                }
              : seat
          )
        : []
    );

    dispatch({ type: 'UPDATE', payload: newSeats });
    setBulkEditType('');
  }, [selectedCols, bulkEditType, state.present]);

  const handleUpdatePrices = useCallback((priceData: PriceEditData[]) => {
    if (!state.present) return;

    const priceLookup: Record<string, number> = {};
    priceData.forEach(item => {
      priceLookup[item.seatType] = item.price;
    });

    const newSeats = state.present.map(row =>
      row
        ? row.map(seat =>
            seat && priceLookup[seat.type] !== undefined
              ? { ...seat, price: priceLookup[seat.type] }
              : seat
          )
        : []
    );

    dispatch({ type: 'UPDATE', payload: newSeats });
    setShowPriceEditor(false);
  }, [state.present]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id);

    if (activeId.startsWith('palette-')) {
      const seatType = activeId.replace('palette-', '') as SeatType;
      setDraggingNewSeatType(seatType);
    } else {
      const foundSeat = findSeatById(activeId);
      if (foundSeat) {
        setDraggedSeat(foundSeat);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;

    if (draggingNewSeatType && layoutRef.current) {
      const layoutRect = layoutRef.current.getBoundingClientRect();
      const x = event.activatorEvent.clientX - layoutRect.left;
      const y = event.activatorEvent.clientY - layoutRect.top - 100; // Adjust for screen component

      const seatWidth = 40;
      const seatHeight = 40;

      let col = Math.floor(x / seatWidth);
      let row = Math.floor(y / seatHeight);

      if (gridSnap) {
        col = Math.round(x / seatWidth);
        row = Math.round(y / seatHeight);
      }

      col = Math.max(0, col);
      row = Math.max(0, row);

      const newSeatId = `seat-new-${nextSeatId}`;
      const newSeat: Seat = {
        id: newSeatId,
        row,
        col,
        type: draggingNewSeatType,
        price: SEAT_TYPES[draggingNewSeatType].price,
        label: `${String.fromCharCode(65 + row)}${col + 1}`,
        occupied: false,
      };

      let updatedSeats = state.present ? [...state.present.map(row => (row ? [...row] : []))] : [];

      while (updatedSeats.length <= row) {
        updatedSeats.push([]);
      }

      if (!updatedSeats[row]) {
        updatedSeats[row] = [];
      }

      updatedSeats[row][col] = newSeat;

      dispatch({ type: 'UPDATE', payload: updatedSeats });
      setNextSeatId(nextSeatId + 1);
    } else if (activeId !== overId && overId) {
      const oldSeat = findSeatById(activeId);
      const newSeat = findSeatById(overId);

      if (oldSeat && newSeat && state.present) {
        const newSeats = swapSeatsInLayout(state.present, oldSeat, newSeat);
        dispatch({ type: 'UPDATE', payload: newSeats });
      }
    }

    setDraggedSeat(null);
    setDraggingNewSeatType(null);
  };

  const deleteSelectedSeats = useCallback(() => {
    if (selectedSeats.length === 0 || !state.present) return;

    const newSeats = state.present.map(row =>
      row ? row.filter(seat => seat && !selectedSeats.some(s => s.id === seat.id)) : []
    );

    const finalSeats = newSeats.filter(row => row.length > 0);

    dispatch({ type: 'UPDATE', payload: finalSeats });
    setSelectedSeats([]);
  }, [selectedSeats, state.present]);

  const findSeatById = (id: string): Seat | null => {
    if (!state.present) return null;

    for (let i = 0; i < state.present.length; i++) {
      const row = state.present[i];
      if (!row) continue;
      for (let j = 0; j < row.length; j++) {
        if (row[j]?.id === id) {
          return row[j];
        }
      }
    }
    return null;
  };

  const swapSeatsInLayout = (layout: Seat[][], seat1: Seat, seat2: Seat): Seat[][] => {
    const newLayout = layout.map(row => (row ? [...row] : []));

    let seat1Row = -1,
      seat1Col = -1,
      seat2Row = -1,
      seat2Col = -1;

    for (let i = 0; i < layout.length; i++) {
      if (!layout[i]) continue;
      for (let j = 0; j < layout[i].length; j++) {
        if (layout[i][j]) {
          if (layout[i][j].id === seat1.id) {
            seat1Row = i;
            seat1Col = j;
          } else if (layout[i][j].id === seat2.id) {
            seat2Row = i;
            seat2Col = j;
          }
        }
      }
    }

    if (seat1Row >= 0 && seat1Col >= 0 && seat2Row >= 0 && seat2Col >= 0) {
      const seat1Copy = {
        ...seat1,
        row: seat2Row,
        col: seat2Col,
        label: `${String.fromCharCode(65 + seat2Row)}${seat2Col + 1}`,
      };
      const seat2Copy = {
        ...seat2,
        row: seat1Row,
        col: seat1Col,
        label: `${String.fromCharCode(65 + seat1Row)}${seat1Col + 1}`,
      };

      if (!newLayout[seat1Row]) newLayout[seat1Row] = [];
      if (!newLayout[seat2Row]) newLayout[seat2Row] = [];

      newLayout[seat1Row][seat1Col] = seat2Copy;
      newLayout[seat2Row][seat2Col] = seat1Copy;
    }

    return newLayout;
  };

  const resetLayout = () => {
    const newSeats = generateSeats(template);
    dispatch({ type: 'SET_INITIAL', payload: newSeats });
    setSelectedSeats([]);
    setSelectedCols([]);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const exportLayoutAsImage = async () => {
    if (!layoutRef.current) return;

    try {
      // Temporarily hide DragOverlay to avoid capturing it
      const dragOverlay = document.querySelector('.dnd-kit-drag-overlay');
      if (dragOverlay) {
        (dragOverlay as HTMLElement).style.display = 'none';
      }

      const canvas = await html2canvas(layoutRef.current, {
        scale: 2, // Increase resolution
        useCORS: true, // Handle cross-origin images
        backgroundColor: darkMode ? '#2B2B40' : '#E5E7EB', // Match layout background
      });

      const link = document.createElement('a');
      link.download = 'theater-layout.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      // Restore DragOverlay
      if (dragOverlay) {
        (dragOverlay as HTMLElement).style.display = '';
      }
    } catch (error) {
      console.error('Error exporting as image:', error);
    }
  };

  const exportLayoutAsPDF = async () => {
    if (!layoutRef.current) return;

    try {
      // Temporarily hide DragOverlay
      const dragOverlay = document.querySelector('.dnd-kit-drag-overlay');
      if (dragOverlay) {
        (dragOverlay as HTMLElement).style.display = 'none';
      }

      const canvas = await html2canvas(layoutRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: darkMode ? '#2B2B40' : '#E5E7EB',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('theater-layout.pdf');

      // Restore DragOverlay
      if (dragOverlay) {
        (dragOverlay as HTMLElement).style.display = '';
      }
    } catch (error) {
      console.error('Error exporting as PDF:', error);
    }
  };

  const handlePaletteItemDragStart = (type: SeatType) => {
    setDraggingNewSeatType(type);
  };

  const handleAILayoutGeneration = (seats: Seat[][]) => {
    dispatch({ type: 'SET_INITIAL', payload: seats });
    setShowAIModal(false);
  };

  const toggleGridSnap = () => {
    setGridSnap(!gridSnap);
  };

  if (!state.present && template !== 'EMPTY') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1E1E2D]">
        <div className="text-white flex items-center">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <span className="ml-2">Loading theater layout...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-[#1E1E2D] text-white' : 'bg-gray-100 text-gray-800'} transition-colors duration-300`}
    >
      <div
        className={`py-4 px-6 flex items-center justify-between shadow-md ${
          darkMode ? 'bg-[#1A1A27] border-b border-gray-700' : 'bg-white border-b border-gray-200'
        }`}
      >
        <div className="flex items-center">
          <Layout size={24} className="mr-2 text-blue-500" />
          <h1 className="text-xl font-bold">Theater Seat Layout Designer</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                darkMode ? 'bg-[#2B2B40] hover:bg-[#323248]' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
              onClick={() => document.getElementById('template-dropdown')?.classList.toggle('hidden')}
            >
              <span>Template: {TEMPLATES[template].name}</span>
              <ChevronDown size={16} />
            </button>

            <div
              id="template-dropdown"
              className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg hidden z-10 ${
                darkMode ? 'bg-[#2B2B40] border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              {Object.keys(TEMPLATES).map(key => (
                <button
                  key={key}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    darkMode ? 'hover:bg-[#323248]' : 'hover:bg-gray-100'
                  } ${template === key ? (darkMode ? 'bg-[#323248]' : 'bg-gray-100') : ''}`}
                  onClick={() => {
                    setTemplate(key as TemplateType);
                    document.getElementById('template-dropdown')?.classList.add('hidden');
                  }}
                >
                  {TEMPLATES[key as TemplateType].name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAIModal(true)}
              className={`p-2 rounded-lg flex items-center ${
                darkMode ? 'bg-[#2B2B40] hover:bg-[#323248]' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
              title="AI Layout Generator"
            >
              <Zap size={18} className="text-amber-500" />
            </button>

            <button
              onClick={() => setShowPriceEditor(true)}
              className={`p-2 rounded-lg flex items-center ${
                darkMode ? 'bg-[#2B2B40] hover:bg-[#323248]' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
              title="Edit Seat Prices"
            >
              <DollarSign size={18} className="text-green-500" />
            </button>

            <button
              onClick={() => setShowPalette(!showPalette)}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-[#2B2B40] hover:bg-[#323248]' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors ${showPalette ? 'text-blue-500' : ''}`}
              title="Toggle Seat Palette"
            >
              <Grid size={18} />
            </button>

            <button
              onClick={toggleGridSnap}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-[#2B2B40] hover:bg-[#323248]' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors ${gridSnap ? 'text-blue-500' : ''}`}
              title={gridSnap ? 'Grid Snap: On' : 'Grid Snap: Off'}
            >
              <Monitor size={18} />
            </button>

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-[#2B2B40] hover:bg-[#323248]' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>

            <div className="relative">
              <button
                className={`p-2 rounded-lg flex items-center ${
                  darkMode ? 'bg-[#2B2B40] hover:bg-[#323248]' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
                title="Export Layout"
                onClick={() => document.getElementById('export-dropdown')?.classList.toggle('hidden')}
              >
                <Download size={18} className="text-green-500" />
              </button>

              <div
                id="export-dropdown"
                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg hidden z-10 ${
                  darkMode ? 'bg-[#2B2B40] border border-gray-700' : 'bg-white border border-gray-200'
                }`}
              >
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    darkMode ? 'hover:bg-[#323248]' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    exportLayoutAsImage();
                    document.getElementById('export-dropdown')?.classList.add('hidden');
                  }}
                >
                  Export as Image (PNG)
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    darkMode ? 'hover:bg-[#323248]' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    exportLayoutAsPDF();
                    document.getElementById('export-dropdown')?.classList.add('hidden');
                  }}
                >
                  Export as PDF
                </button>
              </div>
            </div>

            <button
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={state.currentIndex <= 0}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-[#2B2B40] hover:bg-[#323248]' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors ${state.currentIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Undo"
            >
              <Undo size={18} />
            </button>

            <button
              onClick={() => dispatch({ type: 'REDO' })}
              disabled={state.currentIndex >= state.history.length - 1}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-[#2B2B40] hover:bg-[#323248]' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors ${state.currentIndex >= state.history.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Redo"
            >
              <Redo size={18} />
            </button>

            <button
              onClick={resetLayout}
              className={`p-2 rounded-lg flex items-center ${
                darkMode ? 'bg-red-900 hover:bg-red-800' : 'bg-red-100 hover:bg-red-200 text-red-700'
              } transition-colors`}
              title="Reset Layout"
            >
              <Trash2 size={18} />
            </button>

            <button
              className={`px-3 py-2 rounded-lg flex items-center font-medium ${
                darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600 text-white'
              } transition-colors`}
            >
              <Save size={18} className="mr-1" />
              Save Layout
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {showPalette && (
          <div
            className={`w-full lg:w-64 p-4 ${
              darkMode ? 'bg-[#1A1A27] border-r border-gray-700' : 'bg-white border-r border-gray-200'
            }`}
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Grid size={18} className="mr-2 text-blue-500" /> Seat Palette
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Drag and drop seat types onto the layout.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {Object.keys(SEAT_TYPES).map(type => (
                  <PaletteItem key={type} type={type as SeatType} onDragStart={handlePaletteItemDragStart} />
                ))}
              </div>
            </div>

            <div className={`p-3 rounded-lg ${darkMode ? 'bg-[#2B2B40]' : 'bg-gray-100'} mt-4`}>
              <h4 className="font-medium mb-2">Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Seats:</span>
                  <span className="font-medium">
                    {state.present
                      ? state.present.reduce((acc, row) => acc + (row ? row.filter(seat => seat != null).length : 0), 0)
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Available Revenue:</span>
                  <span className="font-medium text-green-500">₹{totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {selectedCols.length > 0 && (
              <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-[#2B2B40]' : 'bg-gray-100'}`}>
                <h4 className="font-medium mb-2">
                  Bulk Edit {selectedCols.length} Column{selectedCols.length > 1 ? 's' : ''}
                </h4>
                <select
                  value={bulkEditType}
                  onChange={e => setBulkEditType(e.target.value as SeatType | '')}
                  className={`w-full mb-2 px-3 py-2 rounded-md ${
                    darkMode ? 'bg-[#1E1E2D] border border-gray-600' : 'bg-white border border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Seat Type</option>
                  {Object.keys(SEAT_TYPES).map(type => (
                    <option key={type} value={type}>
                      {SEAT_TYPES[type as SeatType].name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkEdit}
                  disabled={!bulkEditType}
                  className={`w-full px-3 py-2 rounded-md ${
                    bulkEditType ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 opacity-50 cursor-not-allowed'
                  } text-white transition-colors`}
                >
                  Apply to Selected
                </button>
              </div>
            )}

            {selectedSeats.length > 0 && (
              <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-[#2B2B40]' : 'bg-gray-100'}`}>
                <h4 className="font-medium mb-2">
                  {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''} Selected
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={deleteSelectedSeats}
                    className="w-full px-3 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedSeats([])}
                    className="w-full px-3 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-[#2B2B40]' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Grid Snap</span>
                <button
                  onClick={toggleGridSnap}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                    gridSnap ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                      gridSnap ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {gridSnap ? 'Seats will snap to grid positions' : 'Free positioning enabled'}
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 overflow-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToParentElement]}
          >
            <div
              ref={layoutRef}
              className={`relative mx-auto max-w-5xl min-h-[600px] p-8 rounded-lg ${
                darkMode ? 'bg-[#2B2B40]' : 'bg-gray-200'
              } transition-colors`}
            >
              <ScreenComponent darkMode={darkMode} />

              {state.present && state.present[0] && state.present[0].length > 0 && (
                <div className="flex justify-center mb-4">
                  {Array.from({ length: Math.max(...state.present.map(row => (row ? row.length : 0))) }).map(
                    (_, colIndex) => (
                      <div
                        key={colIndex}
                        className={`w-10 h-6 flex items-center justify-center text-xs mx-0.5 rounded cursor-pointer
                          ${
                            selectedCols.includes(colIndex)
                              ? darkMode
                                ? 'bg-blue-600'
                                : 'bg-blue-500 text-white'
                              : darkMode
                              ? 'bg-[#323248] hover:bg-[#3A3A5A]'
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        onClick={() => handleSelectColumn(colIndex)}
                      >
                        {colIndex + 1}
                      </div>
                    )
                  )}
                </div>
              )}

              {(template === 'EMPTY' || (state.present && state.present.length === 0)) && (
                <div className="flex flex-col items-center justify-center h-96">
                  <div
                    className={`text-center p-8 rounded-lg ${darkMode ? 'bg-[#1A1A27]' : 'bg-white'} shadow-lg max-w-md`}
                  >
                    <FilePlus size={48} className="mx-auto mb-3 text-blue-500" />
                    <h3 className="text-xl font-semibold mb-2">Start Creating Your Theater Layout</h3>
                    <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Drag and drop seat types from the palette to create your custom layout, or select a template to get
                      started quickly.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(TEMPLATES)
                        .filter(key => key !== 'EMPTY')
                        .map(key => (
                          <button
                            key={key}
                            className={`px-3 py-2 rounded-md ${
                              darkMode ? 'bg-[#323248] hover:bg-[#3A3A5A]' : 'bg-gray-100 hover:bg-gray-200'
                            } transition-colors`}
                            onClick={() => setTemplate(key as TemplateType)}
                          >
                            {TEMPLATES[key as TemplateType].name}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {state.present && state.present.length > 0 && (
                <SortableContext
                  items={state.present.flatMap(row => (row ? row.filter(seat => seat != null).map(seat => seat.id) : []))}
                  strategy={rectSortingStrategy}
                >
                  <div className="flex flex-col items-center">
                    {state.present.map((row, rowIndex) => (
                      row && row.some(seat => seat != null) ? (
                        <div key={rowIndex} className="flex items-center mb-2">
                          <div
                            className={`w-6 h-8 flex items-center justify-center text-xs mr-2 ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {String.fromCharCode(65 + rowIndex)}
                          </div>
                          <div className="flex space-x-1">
                            {row.map((seat, colIndex) => {
                              if (!seat) {
                                console.warn(`Undefined seat at row ${rowIndex}, col ${colIndex}`);
                                return null;
                              }
                              return (
                                <DraggableSeat
                                  key={seat.id}
                                  seat={seat}
                                  onClick={handleSeatClick}
                                  onContextMenu={handleSeatRightClick}
                                  selected={selectedSeats.some(s => s.id === seat.id)}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ) : null
                    ))}
                  </div>
                </SortableContext>
              )}

              {gridSnap && template === 'EMPTY' && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="grid grid-cols-12 gap-0 h-full">
                    {Array.from({ length: 12 * 8 }).map((_, i) => (
                      <div
                        key={i}
                        className={`border border-dashed ${darkMode ? 'border-gray-700' : 'border-gray-300'} opacity-20`}
                      ></div>
                    ))}
                  </div>
                </div>
              )}

              <DragOverlay className="dnd-kit-drag-overlay">
                {draggedSeat && (
                  <SeatComponent seat={draggedSeat} onClick={() => {}} onContextMenu={() => {}} selected={false} />
                )}
                {draggingNewSeatType && (
                  <div
                    className={`${SEAT_TYPES[draggingNewSeatType].color} w-8 h-8 rounded-t-lg flex items-center justify-center text-xs font-bold cursor-grab`}
                  >
                    {draggingNewSeatType === 'RECLINER' ? 'R' : ''}
                  </div>
                )}
              </DragOverlay>
            </div>
          </DndContext>

          <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-[#1A1A27]' : 'bg-white'} shadow-sm`}>
            <h3 className="font-semibold mb-2">Seat Legend</h3>
            <div className="flex flex-wrap gap-4">
              {Object.keys(SEAT_TYPES).map(type => (
                <div key={type} className="flex items-center">
                  <div className={`w-4 h-4 ${SEAT_TYPES[type as SeatType].color} rounded-sm mr-2`}></div>
                  <span className="text-sm">
                    {SEAT_TYPES[type as SeatType].name} (₹{SEAT_TYPES[type as SeatType].price})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {editingSeat && (
        <SeatEditor seat={editingSeat} onSave={handleSaveSeatEdit} onClose={() => setEditingSeat(null)} />
      )}

      {showAIModal && <AIModal onClose={() => setShowAIModal(false)} onGenerate={handleAILayoutGeneration} />}

      {showPriceEditor && <PriceEditor onSave={handleUpdatePrices} onClose={() => setShowPriceEditor(false)} />}
    </div>
  );
};

export default TheaterLayoutCustomizer;