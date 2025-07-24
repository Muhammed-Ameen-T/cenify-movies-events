import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { useTheater } from './TheaterContext';
import { Position } from './theater.types';
import PlacedSeat from './PlacedSeats';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  Trash2, Save, RotateCcw, RotateCw,
 ChevronsUp, ChevronsDown, ZoomIn, ZoomOut,
  Key,
  X
} from 'lucide-react';

const CELL_SIZE = 44; // Size of each grid cell
const GRID_PADDING = 20; // Padding around the grid

const TheaterCanvas: React.FC = () => {
  const {
    currentLayout,
    addSeat,
    canAddSeat,
    undoAction,
    redoAction,
    saveLayout,
    selectedSeats,
    clearSelection,
    deleteSelectedSeats,
    changeSelectedSeatsType,
    bulkSelectSeats,
    moveSeats,
    canUndo,
    canRedo
  } = useTheater();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Position | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Position | null>(null);
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [isContextMenuOpen] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip shortcuts if there's an active dialog or input
      if (showShortcutsModal || isContextMenuOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Delete selected seats
      if (e.key === 'Delete' && Object.keys(selectedSeats).length > 0) {
        deleteSelectedSeats();
      }
      
      // Undo/Redo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undoAction();
      }
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        redoAction();
      }
      
      // Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveLayout();
      }
      
      // Show shortcuts help
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsModal(true);
      }
      
      // Move selected seats with arrow keys
      if (Object.keys(selectedSeats).length > 0) {
        const selectedSeatsList = currentLayout?.seats.filter(s => selectedSeats[s.id]) || [];
        
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          moveSeats(selectedSeatsList, -1, 0);
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          moveSeats(selectedSeatsList, 1, 0);
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          moveSeats(selectedSeatsList, 0, -1);
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          moveSeats(selectedSeatsList, 0, 1);
        }
        
        // Change seat type with number keys
        if (e.key === '1') changeSelectedSeatsType('regular');
        if (e.key === '2') changeSelectedSeatsType('premium');
        if (e.key === '3') changeSelectedSeatsType('vip');
        if (e.key === '4') changeSelectedSeatsType('unavailable');
      }
      
      // Zoom controls
      if (e.ctrlKey && e.key === '=') {
        e.preventDefault();
        setZoomLevel(prev => Math.min(prev + 0.1, 2));
      }
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedSeats, 
    deleteSelectedSeats, 
    undoAction, 
    redoAction, 
    changeSelectedSeatsType, 
    currentLayout, 
    moveSeats,
    saveLayout,
    showShortcutsModal,
    isContextMenuOpen
  ]);

  // Handle seat drop
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['SEAT', 'PLACED_SEAT'],
    drop: (item: any, monitor) => {
      if (!canvasRef.current) return;
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const dropOffset = monitor.getClientOffset();
      
      if (!dropOffset) return;
      
      // Calculate the grid position, accounting for scrolling, viewport offset, and zoom
      const adjustedX = (dropOffset.x - canvasRect.left + canvasRef.current.scrollLeft) / zoomLevel;
      const adjustedY = (dropOffset.y - canvasRect.top + canvasRef.current.scrollTop) / zoomLevel;
      
      const x = adjustedX - GRID_PADDING + viewportOffset.x;
      const y = adjustedY - GRID_PADDING + viewportOffset.y;
      
      const col = Math.floor(x / CELL_SIZE);
      const row = Math.floor(y / CELL_SIZE);
      
      if (row < 0 || col < 0) return;
      
      if (item.type === 'SEAT' && item.seatType) {
        // New seat from palette
        if (canAddSeat(row, col)) {
          addSeat(item.seatType, row, col);
        }
      } else if (item.type === 'PLACED_SEAT' && item.position) {
        // Return the drop position for the dragged seat to use
        return { position: { row, column: col } };
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  }), [addSeat, canAddSeat, viewportOffset, zoomLevel]);

  // Handle selection box
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || e.button !== 0) return; // Only left mouse button
    
    // Clear any existing selection unless shift is pressed
    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
      clearSelection();
    }
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - canvasRect.left + canvasRef.current.scrollLeft) / zoomLevel - GRID_PADDING + viewportOffset.x;
    const y = (e.clientY - canvasRect.top + canvasRef.current.scrollTop) / zoomLevel - GRID_PADDING + viewportOffset.y;
    
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    
    if (row >= 0 && col >= 0) {
      setSelectionStart({ row, column: col });
      setSelectionEnd({ row, column: col });
      setIsDraggingSelection(true);
    }
  }, [clearSelection, viewportOffset, zoomLevel]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingSelection || !canvasRef.current || !selectionStart) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - canvasRect.left + canvasRef.current.scrollLeft) / zoomLevel - GRID_PADDING + viewportOffset.x;
    const y = (e.clientY - canvasRect.top + canvasRef.current.scrollTop) / zoomLevel - GRID_PADDING + viewportOffset.y;
    
    const col = Math.max(0, Math.floor(x / CELL_SIZE));
    const row = Math.max(0, Math.floor(y / CELL_SIZE));
    
    setSelectionEnd({ row, column: col });
  }, [isDraggingSelection, selectionStart, viewportOffset, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingSelection && selectionStart && selectionEnd) {
      bulkSelectSeats(
        selectionStart.row,
        selectionStart.column,
        selectionEnd.row,
        selectionEnd.column
      );
    }
    
    setIsDraggingSelection(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isDraggingSelection, selectionStart, selectionEnd, bulkSelectSeats]);

  // Calculate the grid dimensions
  const gridWidth = currentLayout ? Math.max(15, currentLayout.columnCount) * CELL_SIZE : 15 * CELL_SIZE;
  const gridHeight = currentLayout ? Math.max(10, currentLayout.rowCount) * CELL_SIZE : 10 * CELL_SIZE;

  // Calculate selection box dimensions
  const selectionBox = (() => {
    if (!selectionStart || !selectionEnd || !isDraggingSelection) return null;
    
    const startRow = Math.min(selectionStart.row, selectionEnd.row);
    const endRow = Math.max(selectionStart.row, selectionEnd.row);
    const startCol = Math.min(selectionStart.column, selectionEnd.column);
    const endCol = Math.max(selectionStart.column, selectionEnd.column);
    
    return {
      left: startCol * CELL_SIZE + GRID_PADDING,
      top: startRow * CELL_SIZE + GRID_PADDING,
      width: (endCol - startCol + 1) * CELL_SIZE,
      height: (endRow - startRow + 1) * CELL_SIZE
    };
  })();

  // Pan viewport
  const handlePan = (dx: number, dy: number) => {
    setViewportOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  };

  // Handle zoom
  const handleZoom = (delta: number) => {
    setZoomLevel(prev => {
      const newZoom = Math.max(0.5, Math.min(2, prev + delta));
      return newZoom;
    });
  };

  // Show help modal
  const ShortcutsModal = () => (
     <>
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowShortcutsModal(false)}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-0 max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Key size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h3>
          </div>
          <button 
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setShowShortcutsModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6 pt-4">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-sm uppercase tracking-wide">
                Selection
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Click</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Select single seat</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                      Shift
                    </kbd>
                    <span className="text-gray-400">+</span>
                    <span className="text-gray-700 dark:text-gray-300">Click</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Add to selection</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Drag</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Box select</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-sm uppercase tracking-wide">
                Editing
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                    Delete
                  </kbd>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Remove selected seats</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    {['1', '2', '3', '4'].map((key, index) => (
                      <kbd key={key} className={`px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${index < 3 ? 'mr-1' : ''}`}>
                        {key}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Change seat type</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Right-click</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Seat context menu</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-sm uppercase tracking-wide">
                Movement
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                      ↑↓←→
                    </kbd>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Move selected seats</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Drag selected seat</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Move seat(s)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-sm uppercase tracking-wide">
                General
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                      Ctrl
                    </kbd>
                    <span className="text-gray-400">+</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                      Z
                    </kbd>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Undo</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                      Ctrl
                    </kbd>
                    <span className="text-gray-400">+</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                      Y
                    </kbd>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Redo</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                      Ctrl
                    </kbd>
                    <span className="text-gray-400">+</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                      S
                    </kbd>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Save layout</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                      Ctrl
                    </kbd>
                    <span className="text-gray-400">+</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                      +/-
                    </kbd>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Zoom in/out</span>
                </div>
                <div className="flex justify-between items-center">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                    ?
                  </kbd>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Show this help</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none"
            onClick={() => setShowShortcutsModal(false)}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  </>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <div className="flex space-x-2">
          <button 
            className={`p-2 rounded hover:bg-gray-700 ${canUndo ? 'text-blue-400' : 'text-gray-500'}`}
            onClick={undoAction}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={20} />
          </button>
          <button 
            className={`p-2 rounded hover:bg-gray-700 ${canRedo ? 'text-blue-400' : 'text-gray-500'}`}
            onClick={redoAction}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={20} />
          </button>
          <div className="h-6 border-r border-gray-600 mx-1"></div>
          <button 
            className={`p-2 rounded hover:bg-gray-700 ${Object.keys(selectedSeats).length > 0 ? 'text-red-400' : 'text-gray-500'}`}
            onClick={deleteSelectedSeats}
            disabled={Object.keys(selectedSeats).length === 0}
            title="Delete selected seats (Delete)"
          >
            <Trash2 size={20} />
          </button>
          <div className="h-6 border-r border-gray-600 mx-1"></div>
          <button 
            className="p-2 rounded hover:bg-gray-700 text-blue-400"
            onClick={() => handleZoom(0.1)}
            title="Zoom In (Ctrl+Plus)"
          >
            <ZoomIn size={20} />
          </button>
          <button 
            className="p-2 rounded hover:bg-gray-700 text-blue-400"
            onClick={() => handleZoom(-0.1)}
            title="Zoom Out (Ctrl+Minus)"
          >
            <ZoomOut size={20} />
          </button>
          <div className="h-6 border-r border-gray-600 mx-1"></div>
          <button 
            className="p-2 rounded hover:bg-gray-700 text-blue-400"
            onClick={() => setShowShortcutsModal(true)}
            title="Keyboard Shortcuts (?)"
          >
            <Key size={20} />
          </button>
        </div>

        <div className="text-sm text-gray-400">
          {Object.keys(selectedSeats).length > 0 && 
            <>Selected: {Object.keys(selectedSeats).length} seats</>
          }
        </div>

        <div className="flex items-center space-x-3">
          {/* <div className="flex space-x-1">
            <button 
              className="p-2 rounded hover:bg-gray-700 text-blue-400"
              onClick={() => handlePan(0, -CELL_SIZE * 2)}
              title="Pan Up"
            >
              <ChevronsUp size={20} />
            </button>
            <button 
              className="p-2 rounded hover:bg-gray-700 text-blue-400"
              onClick={() => handlePan(0, CELL_SIZE * 2)}
              title="Pan Down"
            >
              <ChevronsDown size={20} />
            </button>
            <div className="h-6 border-r border-gray-600 mx-1"></div>
            <button 
              className="p-2 rounded hover:bg-gray-700 text-blue-400"
              onClick={() => handlePan(0, -CELL_SIZE)}
              title="Pan Up"
            >
              <ArrowUp size={20} />
            </button>
            <button 
              className="p-2 rounded hover:bg-gray-700 text-blue-400"
              onClick={() => handlePan(0, CELL_SIZE)}
              title="Pan Down"
            >
              <ArrowDown size={20} />
            </button>
            <button 
              className="p-2 rounded hover:bg-gray-700 text-blue-400"
              onClick={() => handlePan(-CELL_SIZE, 0)}
              title="Pan Left"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              className="p-2 rounded hover:bg-gray-700 text-blue-400"
              onClick={() => handlePan(CELL_SIZE, 0)}
              title="Pan Right"
            >
              <ArrowRight size={20} />
            </button>
          </div> */}

          <button 
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded flex items-center space-x-1 transition-colors"
            onClick={saveLayout}
            title="Save Layout (Ctrl+S)"
          >
            <Save size={18} />
            <span>Save</span>
          </button>
        </div>
      </div>
      

      <div 
        ref={node => {
          drop(node);
        }} 
        className={`flex-1 overflow-auto relative bg-gray-900 transition-colors duration-200 ${
          isOver && canDrop ? 'bg-gray-800 bg-opacity-80' : ''
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Screen indicator */}
        <div 
          className="absolute left-1/3 transform -translate-x-1/4 bg-gray-700 px-8 py-1 rounded-md text-sm text-gray-300 flex items-center justify-center mt-2"
          style={{ 
            top: GRID_PADDING / 4,
            width: gridWidth / 2
          }}
        >
          SCREEN
        </div>

        <div 
          ref={canvasRef}
          className="relative m-8 transition-transform duration-200"
          style={{ 
            width: gridWidth + GRID_PADDING * 2, 
            height: gridHeight + GRID_PADDING * 2,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            marginTop: `46px`,
          }}
        >
          {/* Grid lines */}
          <div className="absolute inset-4.5" style={{ padding: GRID_PADDING }}>
            {Array.from({ length: Math.max(15, currentLayout?.rowCount || 0) + 1 }).map((_, i) => (
              <div 
                key={`h-${i}`} 
                className="absolute left-0 right-0 border-t border-gray-800" 
                style={{ top: i * CELL_SIZE }}
              />
            ))}
            {Array.from({ length: Math.max(15, currentLayout?.columnCount || 0) + 1 }).map((_, i) => (
              <div 
                key={`v-${i}`} 
                className="absolute top-0 bottom-0 border-l border-gray-800" 
                style={{ left: i * CELL_SIZE }}
              />
            ))}
          </div>

          {/* Row labels */}
          <div className="absolute top-0 bottom-0 left-0" style={{ width: GRID_PADDING }}>
            {Array.from({ length: Math.max(15, currentLayout?.rowCount || 0) }).map((_, i) => (
              <div 
                key={`row-${i}`} 
                className="absolute left-0 w-full flex items-center justify-center text-xs font-medium text-gray-400"
                style={{ 
                  top: i * CELL_SIZE + GRID_PADDING, 
                  height: CELL_SIZE 
                }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>

          {/* Column labels */}
          <div className="absolute left-0 right-0 top-0" style={{ height: GRID_PADDING }}>
            {Array.from({ length: Math.max(15, currentLayout?.columnCount || 0) }).map((_, i) => (
              <div 
                key={`col-${i}`} 
                className="absolute top-0 h-full flex items-center justify-center text-xs font-medium text-gray-400"
                style={{ 
                  left: i * CELL_SIZE + GRID_PADDING, 
                  width: CELL_SIZE 
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Seats */}
          {currentLayout?.seats.map((seat) => (
            <PlacedSeat
              key={seat.id}
              seat={seat}
              isSelected={!!selectedSeats[seat.id]}
              style={{
                left: seat.column * CELL_SIZE + GRID_PADDING,
                top: seat.row * CELL_SIZE + GRID_PADDING,
              }}
            />
          ))}

          {/* Selection box */}
          {selectionBox && (
            <div 
              className="absolute border-2 border-blue-400 bg-blue-400 bg-opacity-20 pointer-events-none"
              style={{
                left: selectionBox.left,
                top: selectionBox.top,
                width: selectionBox.width,
                height: selectionBox.height,
                zIndex: 5
              }}
            />
          )}

         
        </div>
      </div>

      {/* Keyboard shortcuts modal */}
      {showShortcutsModal && <ShortcutsModal />}
    </div>
  );
};

export default TheaterCanvas;