'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/store/store';
import { toggleTheme } from '@/app/store/themeSlice';

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  
  return (
    <button 
      onClick={() => dispatch(toggleTheme())}
      className={`fixed top-4 right-4 p-2 rounded-full ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
} 