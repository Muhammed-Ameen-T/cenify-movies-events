// import { SeatLayout } from '../types/theater';

// export interface HistoryState {
//   history: SeatLayout[];
//   currentIndex: number;
//   present: SeatLayout | null;
// }

// export const initialState: HistoryState = {
//   history: [],
//   currentIndex: -1,
//   present: null,
// };

// type Action =
//   | { type: 'SET_INITIAL'; payload: SeatLayout }
//   | { type: 'UPDATE'; payload: SeatLayout }
//   | { type: 'UNDO' }
//   | { type: 'REDO' };

// export const historyReducer = (state: HistoryState, action: Action): HistoryState => {
//   switch (action.type) {
//     case 'SET_INITIAL':
//       return {
//         history: [action.payload],
//         currentIndex: 0,
//         present: action.payload,
//       };

//     case 'UPDATE': {
//       const newHistory = [...state.history.slice(0, state.currentIndex + 1), action.payload];
//       return {
//         history: newHistory,
//         currentIndex: newHistory.length - 1,
//         present: action.payload,
//       };
//     }

//     case 'UNDO': {
//       if (state.currentIndex <= 0) return state;
//       const newIndex = state.currentIndex - 1;
//       return {
//         ...state,
//         currentIndex: newIndex,
//         present: state.history[newIndex],
//       };
//     }

//     case 'REDO': {
//       if (state.currentIndex >= state.history.length - 1) return state;
//       const newIndex = state.currentIndex + 1;
//       return {
//         ...state,
//         currentIndex: newIndex,
//         present: state.history[newIndex],
//       };
//     }

//     default:
//       return state;
//   }
// };

import { HistoryState, HistoryAction, SeatLayout } from '../types/theater';

export const initialState: HistoryState = {
  history: [],
  currentIndex: -1,
  present: null,
};

export const historyReducer = (state: HistoryState, action: HistoryAction): HistoryState => {
  switch (action.type) {
    case 'SET_INITIAL':
      return {
        history: [action.payload],
        currentIndex: 0,
        present: action.payload,
      };

    case 'UPDATE': {
      const newHistory = [...state.history.slice(0, state.currentIndex + 1), action.payload];
      return {
        history: newHistory,
        currentIndex: newHistory.length - 1,
        present: action.payload,
      };
    }

    case 'UNDO': {
      if (state.currentIndex <= 0) return state;
      const newIndex = state.currentIndex - 1;
      return {
        ...state,
        currentIndex: newIndex,
        present: state.history[newIndex],
      };
    }

    case 'REDO': {
      if (state.currentIndex >= state.history.length - 1) return state;
      const newIndex = state.currentIndex + 1;
      return {
        ...state,
        currentIndex: newIndex,
        present: state.history[newIndex],
      };
    }

    default:
      return state;
  }
};