import { HistoryState, HistoryAction } from '../types/theater';

// Initial state for the history management
export const initialState: HistoryState = {
  history: [],
  currentIndex: -1,
  present: null
};

// Reducer for managing undo/redo functionality
export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  const { history, currentIndex } = state;

  switch (action.type) {
    case 'SET_INITIAL':
      return {
        ...initialState,
        present: action.payload,
        history: [action.payload],
        currentIndex: 0
      };
    case 'UPDATE':
      const newHistory = [...history.slice(0, currentIndex + 1), action.payload];
      return {
        history: newHistory,
        currentIndex: newHistory.length - 1,
        present: action.payload
      };
    case 'UNDO':
      if (currentIndex <= 0) return state;
      return {
        ...state,
        currentIndex: currentIndex - 1,
        present: history[currentIndex - 1]
      };
    case 'REDO':
      if (currentIndex >= history.length - 1) return state;
      return {
        ...state,
        currentIndex: currentIndex + 1,
        present: history[currentIndex + 1]
      };
    default:
      return state;
  }
}