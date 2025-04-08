import { configureStore } from '@reduxjs/toolkit';
import graphReducer from './graphSlice';
import themeReducer from './themeSlice';
import { ThemeState } from './themeSlice';
import { GraphState } from './graphSlice';

// Define explicit state structure
export interface RootState {
  graph: GraphState;
  theme: ThemeState;
}

export const store = configureStore({
  reducer: {
    graph: graphReducer,
    theme: themeReducer
  },
});

export type AppDispatch = typeof store.dispatch; 