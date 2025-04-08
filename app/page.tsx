'use client';

import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import SidePanel from './components/SidePanel';
import GraphVisualization from './components/GraphVisualization';
import ThemeToggle from './components/ThemeToggle';

export default function Home() {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);

  return (
    <div className={`flex h-screen w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <SidePanel />
      <GraphVisualization />
      <ThemeToggle />
    </div>
  );
}
