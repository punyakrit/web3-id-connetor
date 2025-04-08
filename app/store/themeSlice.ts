import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ThemeState {
  darkMode: boolean;
}

const initialState: ThemeState = {
  darkMode: true,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
    },
  },
});

export const { toggleTheme } = themeSlice.actions;

export default themeSlice.reducer; 