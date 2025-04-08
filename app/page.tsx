'use client';

import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import SidePanel from './components/SidePanel';
import GraphVisualization from './components/GraphVisualization';
import ThemeToggle from './components/ThemeToggle';

export default function Home() {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  return (
    <div className={`flex h-screen w-full relative ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'} text-${darkMode ? 'white' : 'gray-900'} overflow-hidden`}>
      <SidePanel />
      <GraphVisualization />
      <ThemeToggle />
    </div>
  );
}
